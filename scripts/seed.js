require('dotenv').config();
const path = require('path');
const XLSX = require('xlsx');
const pool = require('../src/db');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readSheet(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
  // baris header ada di indeks ke-3 pada semua file rekap ini
  const headerIdx = rows.findIndex(r => r && r[0] === 'No');
  const header = rows[headerIdx];
  const data = rows.slice(headerIdx + 1).filter(r => r && r[0] !== null && r[0] !== '');
  return { header, data };
}

function col(header, name) {
  return header.findIndex(h => h && h.toString().trim().toLowerCase() === name.toLowerCase());
}

function extractYear(value) {
  if (!value) return null;
  const match = value.toString().match(/(19|20)\d{2}/);
  return match ? parseInt(match[0], 10) : null;
}

function normalizeStatusPaten(raw) {
  if (!raw) return 'proses';
  const s = raw.toString().toUpperCase();
  if (s.includes('GRANTED') || s.includes('DIBERI PATEN')) return 'granted';
  if (s.includes('DITOLAK') || s.includes('DITARIK')) return 'ditolak';
  return 'proses';
}

function normalizeStatusUmum(raw) {
  if (!raw) return 'proses';
  const s = raw.toString().toUpperCase();
  if (s.includes('GRANTED')) return 'granted';
  if (s.includes('DITOLAK')) return 'ditolak';
  return 'proses';
}

// Kolom "URL"/"LINK" di file rekap sumber kadang berisi tanggal (mis. "22-11-2024")
// alih-alih tautan PDKI yang sebenarnya, atau tautan placeholder kosong yang sama
// untuk banyak baris berbeda. Hanya simpan nilai yang benar-benar berupa URL http(s) valid.
const EMPTY_PLACEHOLDER_LINK = 'https://pdki-indonesia.dgip.go.id/detail/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

function sanitizeLink(value) {
  if (!value) return null;
  let trimmed = value.toString().trim();
  // Beberapa baris punya prefix ganda seperti "https://pdki-https://pdki-...";
  // ambil kemunculan terakhir dari "https://"/"http://" sebagai awal URL sebenarnya.
  const lastProtocolIdx = Math.max(trimmed.lastIndexOf('https://'), trimmed.lastIndexOf('http://'));
  if (lastProtocolIdx > 0) trimmed = trimmed.slice(lastProtocolIdx);
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try { new URL(trimmed); } catch { return null; }
  if (trimmed === EMPTY_PLACEHOLDER_LINK) return null;
  return trimmed;
}

const ACRONYMS = ['MIPA'];

function titleCase(str) {
  if (!str) return str;
  const cleaned = str.toString().trim().replace(/\s+/g, ' ');
  const upper = cleaned.toUpperCase();
  if (ACRONYMS.includes(upper)) return upper;
  return cleaned.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

async function seedPaten(pool) {
  const { header, data } = readSheet('rekap_paten.xlsx');
  const iNama = col(header, 'Nama');
  const iFakultas = col(header, 'Fakulltas');
  const iJudul = col(header, 'Judul');
  const iJudulBaru = col(header, 'Judul Baru');
  const iJenisPaten = col(header, 'Jenis Paten');
  const iNoPermohonan = col(header, 'No Permohonan Paten');
  const iTahun = col(header, 'Tahun Pengajuan');
  const iStatus = col(header, 'Status');
  const iNoPaten = col(header, 'NOMOR PATEN');
  const iLink = col(header, 'LINK');

  let count = 0;
  for (const r of data) {
    const judul = (r[iJudulBaru] || r[iJudul] || '').toString().trim();
    if (!judul) continue;
    const statusRaw = r[iStatus] ? r[iStatus].toString().trim() : null;
    await pool.query(
      `INSERT INTO ki_items (jenis, subtipe, judul, inventor, fakultas, no_permohonan, no_reg, status_raw, status, tahun, link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        'Paten',
        r[iJenisPaten] ? titleCase(r[iJenisPaten]) : null,
        judul,
        r[iNama] ? r[iNama].toString().trim() : 'Tidak diketahui',
        r[iFakultas] ? titleCase(r[iFakultas]) : 'Tidak diketahui',
        r[iNoPermohonan] || null,
        r[iNoPaten] || null,
        statusRaw,
        normalizeStatusPaten(statusRaw),
        r[iTahun] ? parseInt(r[iTahun], 10) : extractYear(r[iNoPermohonan]),
        sanitizeLink(r[iLink])
      ]
    );
    count++;
  }
  return count;
}

async function seedDesainIndustri(pool) {
  const { header, data } = readSheet('rekap_desain_industri.xlsx');
  const iNama = col(header, 'Nama');
  const iFakultas = col(header, 'Fakulltas');
  const iJudul = col(header, 'Judul');
  const iJenis = col(header, 'Jenis Permohonan');
  const iNoPermohonan = header.findIndex(h => h && h.toString().trim() === 'No Permohonan');
  const iTglTerima = col(header, 'Tanggal penerimaan');
  const iStatus = col(header, 'Status');
  const iLink = col(header, 'LINK');

  let count = 0;
  for (const r of data) {
    const judul = (r[iJudul] || '').toString().trim();
    if (!judul) continue;
    const statusRaw = r[iStatus] ? r[iStatus].toString().trim() : null;
    await pool.query(
      `INSERT INTO ki_items (jenis, subtipe, judul, inventor, fakultas, no_permohonan, no_reg, status_raw, status, tahun, link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        'Desain Industri',
        r[iJenis] ? r[iJenis].toString().trim() : null,
        judul,
        r[iNama] ? r[iNama].toString().trim() : 'Tidak diketahui',
        r[iFakultas] ? titleCase(r[iFakultas]) : 'Tidak diketahui',
        r[iNoPermohonan] || null,
        r[iNoPermohonan] || null,
        statusRaw,
        normalizeStatusUmum(statusRaw),
        extractYear(r[iTglTerima]),
        sanitizeLink(r[iLink])
      ]
    );
    count++;
  }
  return count;
}

async function seedMerek(pool) {
  const { header, data } = readSheet('rekap_merek.xlsx');
  const iNama = col(header, 'Nama');
  const iFakultas = col(header, 'Fakulltas');
  const iJudul = col(header, 'Judul Merek');
  const iTipeMerek = col(header, 'Tipe Merek');
  const iNoPermohonan = header.findIndex(h => h && h.toString().trim() === 'No Permohonan');
  const iStatus = col(header, 'Status');
  const iTahun = col(header, 'Tahun');
  const iLink = col(header, 'LINK');

  let count = 0;
  for (const r of data) {
    const judul = (r[iJudul] || '').toString().trim();
    if (!judul) continue;
    const statusRaw = r[iStatus] ? r[iStatus].toString().trim() : null;
    await pool.query(
      `INSERT INTO ki_items (jenis, subtipe, judul, inventor, fakultas, no_permohonan, no_reg, status_raw, status, tahun, link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        'Merek',
        r[iTipeMerek] ? r[iTipeMerek].toString().trim() : null,
        judul,
        r[iNama] ? r[iNama].toString().trim() : 'Tidak diketahui',
        r[iFakultas] ? titleCase(r[iFakultas]) : 'Tidak diketahui',
        r[iNoPermohonan] || null,
        r[iNoPermohonan] || null,
        statusRaw,
        normalizeStatusUmum(statusRaw),
        r[iTahun] ? parseInt(r[iTahun], 10) : null,
        sanitizeLink(r[iLink])
      ]
    );
    count++;
  }
  return count;
}

async function seedHakCipta(pool) {
  const { header, data } = readSheet('rekap_hak_cipta.xlsx');
  const iNama = col(header, 'Nama');
  const iFakultas = col(header, 'Fakultas');
  const iJudul = col(header, 'Judul');
  const iJenis = col(header, 'Jenis Ciptaan');
  const iNoPermohonan = col(header, 'No Permohonan HKI');
  const iNoPencatatan = col(header, 'No. Pencatatan HKI');
  const iTahun = col(header, 'Tahun Ciptaan');
  const iLink = col(header, 'URL');

  let count = 0;
  for (const r of data) {
    const judul = (r[iJudul] || '').toString().trim();
    if (!judul) continue;
    await pool.query(
      `INSERT INTO ki_items (jenis, subtipe, judul, inventor, fakultas, no_permohonan, no_reg, status_raw, status, tahun, link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        'Hak Cipta',
        r[iJenis] ? r[iJenis].toString().trim() : null,
        judul,
        r[iNama] ? r[iNama].toString().trim() : 'Tidak diketahui',
        r[iFakultas] ? titleCase(r[iFakultas]) : 'Tidak diketahui',
        r[iNoPermohonan] || null,
        r[iNoPencatatan] || null,
        'Tercatat',
        'granted',
        r[iTahun] ? parseInt(r[iTahun], 10) : null,
        sanitizeLink(r[iLink])
      ]
    );
    count++;
  }
  return count;
}

// Skema database sudah otomatis dibuat saat modul src/db.js di-require.
// Tabel challenges (Tantangan Industri) sengaja dibiarkan kosong sampai ada
// industri yang benar-benar mendaftar lewat halaman "Pasang Kebutuhan".
async function seedIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM ki_items');
  if (rows[0].n > 0) {
    console.log(`Tabel ki_items sudah berisi ${rows[0].n} baris. Lewati seeding.`);
  } else {
    console.log('Membaca dan memasukkan data Paten...');
    const nPaten = await seedPaten(pool);
    console.log(`  -> ${nPaten} baris`);

    console.log('Membaca dan memasukkan data Desain Industri...');
    const nDI = await seedDesainIndustri(pool);
    console.log(`  -> ${nDI} baris`);

    console.log('Membaca dan memasukkan data Merek...');
    const nMerek = await seedMerek(pool);
    console.log(`  -> ${nMerek} baris`);

    console.log('Membaca dan memasukkan data Hak Cipta...');
    const nHC = await seedHakCipta(pool);
    console.log(`  -> ${nHC} baris`);

    console.log(`Selesai. Total ${nPaten + nDI + nMerek + nHC} KI dimasukkan ke database.`);
  }
}

module.exports = { seedIfEmpty };

if (require.main === module) {
  seedIfEmpty()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Seeding gagal:', err);
      process.exit(1);
    });
}
