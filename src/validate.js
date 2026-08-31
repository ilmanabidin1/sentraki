// Validasi & sanitasi input form publik — server-side, bukan cuma HTML required.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const JENIS_LIST = ['Paten', 'Hak Cipta', 'Merek', 'Desain Industri', 'KI Komunal'];
const BIDANG_LIST = ['Teknologi & Manufaktur', 'Kesehatan & Farmasi', 'Ekonomi Syariah', 'Pertanian & Lingkungan'];

const MAX = {
  short: 200,   // nama, judul, kontak
  medium: 500,  // institusi, email
  long: 5000    // deskripsi, pesan
};

function clip(value, max) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length > max ? s.slice(0, max) : (s || null);
}

function validEmail(value) {
  if (!value) return true; // opsional
  return EMAIL_RE.test(String(value).trim());
}

function validDate(value) {
  if (!value) return true;
  const d = new Date(value);
  return !isNaN(d.getTime()) && d.getFullYear() >= 2000 && d.getFullYear() <= 2100;
}

function validInt(value) {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n > 0;
}

// --- /daftarkan-ki ---
function validateDaftarkanKI(body) {
  const errors = [];
  const nama = clip(body.nama, MAX.short);
  const fakultas = clip(body.fakultas, MAX.short);
  const judul = clip(body.judul, MAX.short);
  const jenis = JENIS_LIST.includes(body.jenis) ? body.jenis : null;
  const deskripsi = clip(body.deskripsi, MAX.long);
  if (!nama) errors.push('Nama lengkap wajib diisi.');
  if (!fakultas) errors.push('Fakultas wajib diisi.');
  if (!judul) errors.push('Judul KI wajib diisi.');
  if (!jenis) errors.push('Jenis KI tidak valid.');
  return { errors, values: { nama, fakultas, judul, jenis, deskripsi } };
}

// --- /ajukan-minat ---
function validateAjukanMinat(body) {
  const errors = [];
  const ki_item_id = validInt(body.ki_item_id) ? parseInt(body.ki_item_id, 10) : null;
  const nama = clip(body.nama, MAX.short);
  const institusi = clip(body.institusi, MAX.medium);
  const email = clip(body.email, MAX.medium);
  const jenis_kebutuhan = clip(body.jenis_kebutuhan, MAX.short);
  const pesan = clip(body.pesan, MAX.long);
  if (!nama) errors.push('Nama lengkap wajib diisi.');
  if (!validEmail(email)) errors.push('Format email tidak valid.');
  return { errors, values: { ki_item_id, nama, institusi, email, jenis_kebutuhan, pesan } };
}

// --- /ajukan-solusi ---
function validateAjukanSolusi(body) {
  const errors = [];
  const challenge_id = validInt(body.challenge_id) ? parseInt(body.challenge_id, 10) : null;
  const nama_peneliti = clip(body.nama_peneliti, MAX.short);
  const fakultas = clip(body.fakultas, MAX.short);
  const ringkasan = clip(body.ringkasan, MAX.long);
  const ki_terkait = clip(body.ki_terkait, MAX.short);
  if (!nama_peneliti) errors.push('Nama peneliti wajib diisi.');
  if (!ringkasan) errors.push('Ringkasan solusi wajib diisi.');
  return { errors, values: { challenge_id, nama_peneliti, fakultas, ringkasan, ki_terkait } };
}

// --- /pasang-kebutuhan ---
function validatePasangKebutuhan(body) {
  const errors = [];
  const perusahaan = clip(body.perusahaan, MAX.short);
  const kontak = clip(body.kontak, MAX.medium);
  const judul = clip(body.judul, MAX.short);
  const bidang = BIDANG_LIST.includes(body.bidang) ? body.bidang : null;
  const deskripsi = clip(body.deskripsi, MAX.long);
  const kebutuhan_spesifik = clip(body.kebutuhan_spesifik, MAX.long);
  const skema = clip(body.skema, MAX.short);
  const deadline = validDate(body.deadline) ? (body.deadline || null) : null;
  if (!perusahaan) errors.push('Nama perusahaan wajib diisi.');
  if (!judul) errors.push('Judul kebutuhan wajib diisi.');
  if (!deskripsi) errors.push('Deskripsi masalah wajib diisi.');
  return { errors, values: { perusahaan, kontak, judul, bidang, deskripsi, kebutuhan_spesifik, skema, deadline } };
}

// --- /api/konsultasi & /api/ai-tanya ---
function validateChatMessage(raw, maxLen = 2000) {
  const s = clip(raw, maxLen);
  return s; // null jika kosong
}

module.exports = {
  validateDaftarkanKI,
  validateAjukanMinat,
  validateAjukanSolusi,
  validatePasangKebutuhan,
  validateChatMessage
};
