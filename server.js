require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'p2ki-unisba-dev-secret-ganti-di-production',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 hari
}));

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

require('./scripts/seed')
  .seedIfEmpty()
  .catch(err => console.error('Seeding awal gagal:', err))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`P2KI UNISBA berjalan di http://localhost:${PORT}`);
    });
  });
