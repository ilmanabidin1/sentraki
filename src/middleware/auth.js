const bcrypt = require('bcryptjs');
const pool = require('../db');

// Rate limit login: maks 5 percobaan gagal per IP dalam 15 menit.
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

async function isRateLimited(ip) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM login_attempts
     WHERE ip = $1 AND success = 0
       AND attempted_at > DATETIME('now', $2)`,
    [ip, `-${WINDOW_MINUTES} minutes`]
  );
  return rows[0].n >= MAX_ATTEMPTS;
}

async function recordAttempt(ip, success) {
  await pool.query(
    'INSERT INTO login_attempts (ip, success) VALUES ($1, $2)',
    [ip, success ? 1 : 0]
  );
}

// Membuat akun admin default dari env saat tabel masih kosong (sekali saja).
// ADMIN_PASSWORD_ENV dipakai apa adanya sebagai password awal — langsung di-hash,
// tidak pernah disimpan plaintext.
async function ensureDefaultAdmin() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM admin_users');
  if (rows[0].n > 0) return;
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(password, 12);
  await pool.query('INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)', [username, hash]);
  console.log(`Akun admin default dibuat: ${username} (password dari env, ter-hash bcrypt). Segera ganti lewat env ADMIN_USERNAME/ADMIN_PASSWORD saat deploy pertama.`);
}

async function verifyAdmin(username, password) {
  const { rows } = await pool.query(
    'SELECT * FROM admin_users WHERE username = $1 LIMIT 1',
    [username]
  );
  if (rows.length === 0) {
    // Tetap lakukan hash-compare untuk mencegah user-enumeration via timing.
    await bcrypt.compare(password, '$2a$12$invalidsaltinvalidsaltinvalidsaltinvalidsaltinvalidsaltin');
    return null;
  }
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  return ok ? rows[0] : null;
}

async function touchLastLogin(id) {
  await pool.query("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [id]);
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.redirect('/admin/login');
}

module.exports = { requireAdmin, ensureDefaultAdmin, verifyAdmin, isRateLimited, recordAttempt, touchLastLogin };
