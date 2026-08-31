require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('better-sqlite3-session-store')(session);
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session store persisten (SQLite) — sesi tidak hilang saat restart, aman untuk production.
const sessionDbPath = process.env.SQLITE_PATH
  ? path.join(path.dirname(process.env.SQLITE_PATH), 'sessions.db')
  : path.join(__dirname, 'data', 'sessions.db');
const sessionDb = new Database(sessionDbPath);
sessionDb.exec('PRAGMA journal_mode = WAL;');
app.use(session({
  store: new SQLiteStore({
    client: sessionDb,
    expired: { clear: true, intervalMs: 900000 } // bersihkan sesi kadaluarsa tiap 15 menit
  }),
  secret: process.env.SESSION_SECRET || 'p2ki-unisba-dev-secret-ganti-di-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 hari
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && process.env.FORCE_INSECURE_COOKIE !== '1'
  }
}));

// CSRF: generate token per-session, verifikasi pada semua POST.
const { csrf, verifyCsrf } = require('./src/middleware/csrf');
app.use(csrf);
app.use((req, res, next) => {
  if (req.method === 'POST') return verifyCsrf(req, res, next);
  next();
});

app.use(require('./src/routes/public'));
app.use(require('./src/routes/direktori'));
app.use(require('./src/routes/tantangan'));
app.use(require('./src/routes/pelajari'));
app.use(require('./src/routes/konsultasi'));
app.use(require('./src/routes/admin'));

app.use((req, res) => {
  res.status(404).send('Halaman tidak ditemukan.');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Terjadi kesalahan pada server. Silakan coba lagi.');
});

(async () => {
  require('./scripts/seed')
    .seedIfEmpty()
    .catch(err => console.error('Seeding awal gagal:', err))
    .then(() => require('./src/middleware/auth').ensureDefaultAdmin())
    .catch(err => console.error('Inisialisasi admin gagal:', err))
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`P2KI UNISBA berjalan di http://localhost:${PORT}`);
      });
    });
})();
