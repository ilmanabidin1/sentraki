require('dotenv').config();
const fs = require('fs');
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

const ACRONYMS = ['MIPA'];

function titleCase(str) {
  if (!str) return str;
  const cleaned = str.toString().trim().replace(/\s+/g, ' ');
  const upper = cleaned.toUpperCase();
  if (ACRONYMS.includes(upper)) return upper;
  return cleaned.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

async function seedPaten(client) {
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
    await client.query(
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
        r[iLink] || null
      ]
    );
    count++;
  }
  return count;
}

async function seedDesainIndustri(client) {
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
    await client.query(
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
        r[iLink] || null
      ]
    );
    count++;
  }
  return count;
}

async function seedMerek(client) {
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
    await client.query(
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
        r[iLink] || null
      ]
    );
    count++;
  }
  return count;
}

async function seedHakCipta(client) {
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
    await client.query(
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
        r[iLink] || null
      ]
    );
    count++;
  }
  return count;
}

const SAMPLE_CHALLENGES = [
  { kode: 'TI-2026-0031', judul: 'Solusi Pengawetan Alami untuk Produk UMKM Pangan', perusahaan: 'CV Pangan Sehat Nusantara', kontak: 'kontak@pangansehat.co.id', bidang: 'Teknologi & Manufaktur', deskripsi: 'Perusahaan mencari metode pengawetan alami non-kimia untuk memperpanjang umur simpan produk olahan pangan UMKM tanpa mengubah cita rasa asli.', kebutuhan_spesifik: 'Bahan pengawet bersumber dari kearifan lokal\nAman dikonsumsi dan tersertifikasi halal\nDapat diproduksi dalam skala UMKM', skema: 'Lisensi Hasil Riset', deadline: '2026-09-30', status: 'terbuka' },
  { kode: 'TI-2026-0028', judul: 'Sistem Prediksi Gagal Bayar untuk Pembiayaan Mikro Syariah', perusahaan: 'BPRS Amanah Jabar', kontak: 'humas@amanahjabar.co.id', bidang: 'Ekonomi Syariah', deskripsi: 'Lembaga pembiayaan mikro syariah membutuhkan model prediksi risiko gagal bayar nasabah yang sesuai prinsip syariah untuk memperbaiki keputusan pembiayaan.', kebutuhan_spesifik: 'Model sesuai prinsip pembiayaan syariah\nDapat diintegrasikan ke sistem inti yang sudah berjalan\nInterpretasi hasil mudah dipahami tim non-teknis', skema: 'Konsultasi Berbayar', deadline: '2026-08-18', status: 'segera' },
  { kode: 'TI-2026-0025', judul: 'Kemasan Biodegradable Pengganti Plastik Sekali Pakai', perusahaan: 'PT Kemasan Hijau Lestari', kontak: 'riset@kemasanhijau.id', bidang: 'Pertanian & Lingkungan', deskripsi: 'Perusahaan mencari mitra riset untuk mengembangkan kemasan biodegradable berbahan serat alami yang siap diproduksi massal bagi UMKM makanan dan minuman.', kebutuhan_spesifik: 'Bahan baku serat alami lokal\nBiaya produksi kompetitif terhadap plastik konvensional\nTeruji tahan terhadap kelembapan', skema: 'Pendanaan Riset Bersama', deadline: '2026-10-12', status: 'terbuka' },
  { kode: 'TI-2026-0022', judul: 'Alat Skrining Dini Gangguan Tumbuh Kembang Anak', perusahaan: 'Klinik Tumbuh Kembang Ceria', kontak: 'info@tumbuhkembangceria.id', bidang: 'Kesehatan & Farmasi', deskripsi: 'Klinik mencari alat bantu skrining dini yang praktis digunakan tenaga kesehatan non-spesialis untuk mendeteksi indikasi gangguan tumbuh kembang anak usia dini.', kebutuhan_spesifik: 'Mudah digunakan oleh kader posyandu\nBerbasis indikator yang tervalidasi klinis\nBiaya implementasi terjangkau', skema: 'Akuisisi KI', deadline: '2026-11-05', status: 'terbuka' },
  { kode: 'TI-2026-0019', judul: 'Optimalisasi Rantai Pasok Bahan Baku Herbal Lokal', perusahaan: 'PT Herbal Nusantara Jaya', kontak: 'kemitraan@herbalnusantara.id', bidang: 'Kesehatan & Farmasi', deskripsi: 'Perusahaan membutuhkan kajian dan model optimalisasi rantai pasok bahan baku herbal dari petani lokal untuk menjaga konsistensi kualitas dan pasokan.', kebutuhan_spesifik: 'Melibatkan data petani mitra eksisting\nModel dapat direplikasi ke komoditas herbal lain\nMempertimbangkan aspek keberlanjutan', skema: 'Konsultasi Berbayar', deadline: '2026-09-20', status: 'terbuka' },
  { kode: 'TI-2026-0015', judul: 'Platform Verifikasi Sertifikasi Halal Rantai Pasok', perusahaan: 'Koperasi Produsen Halal Jabar', kontak: 'sekretariat@koperasihalaljabar.id', bidang: 'Ekonomi Syariah', deskripsi: 'Koperasi membutuhkan sistem verifikasi digital untuk melacak status kehalalan bahan baku di sepanjang rantai pasok anggota koperasi.', kebutuhan_spesifik: 'Dapat diakses anggota koperasi dengan literasi digital terbatas\nTerintegrasi dengan basis data sertifikasi halal resmi\nBiaya operasional rendah', skema: 'Lisensi Hasil Riset', deadline: '2026-08-10', status: 'segera' }
];

async function seedChallenges(client) {
  const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM challenges');
  if (rows[0].n > 0) {
    console.log('Tabel challenges sudah berisi data, lewati seeding tantangan industri.');
    return 0;
  }
  let count = 0;
  for (const c of SAMPLE_CHALLENGES) {
    await client.query(
      `INSERT INTO challenges (kode, judul, perusahaan, kontak, bidang, deskripsi, kebutuhan_spesifik, skema, deadline, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [c.kode, c.judul, c.perusahaan, c.kontak, c.bidang, c.deskripsi, c.kebutuhan_spesifik, c.skema, c.deadline, c.status]
    );
    count++;
  }
  return count;
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('Menjalankan skema database...');
    const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    await client.query(schema);

    const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM ki_items');
    if (rows[0].n > 0) {
      console.log(`Tabel ki_items sudah berisi ${rows[0].n} baris. Lewati seeding (hapus data manual dulu jika ingin re-seed).`);
    } else {
      console.log('Membaca dan memasukkan data Paten...');
      const nPaten = await seedPaten(client);
      console.log(`  -> ${nPaten} baris`);

      console.log('Membaca dan memasukkan data Desain Industri...');
      const nDI = await seedDesainIndustri(client);
      console.log(`  -> ${nDI} baris`);

      console.log('Membaca dan memasukkan data Merek...');
      const nMerek = await seedMerek(client);
      console.log(`  -> ${nMerek} baris`);

      console.log('Membaca dan memasukkan data Hak Cipta...');
      const nHC = await seedHakCipta(client);
      console.log(`  -> ${nHC} baris`);

      console.log(`Selesai. Total ${nPaten + nDI + nMerek + nHC} KI dimasukkan ke database.`);
    }

    console.log('Menyiapkan contoh data Tantangan Industri...');
    const nChallenge = await seedChallenges(client);
    console.log(`  -> ${nChallenge} tantangan contoh dimasukkan.`);
  } catch (err) {
    console.error('Seeding gagal:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
