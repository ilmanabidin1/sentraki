# P2KI UNISBA — Direktori KI, Link and Match Industri, dan Akademi KI

Website lengkap (bukan mockup) untuk Pusat Pengembangan dan Pelayanan Kekayaan Intelektual
(P2KI) UNISBA: direktori KI berbasis data riil, link-and-match dengan industri (gaya Innoget),
akademi belajar KI dengan asisten AI, dan konsultasi langsung dengan admin P2KI.

Dibangun dengan pola yang sama seperti proyek KolabRiset: **Node.js (Express) + PostgreSQL**,
siap deploy ke **Railway**.

## Fitur

- **Beranda** — statistik riil (total KI, granted, fakultas) dan KI unggulan
- **Direktori KI** — 1.264 KI riil dari rekap Paten, Desain Industri, Merek, dan Hak Cipta UNISBA,
  dengan filter jenis/fakultas/status, pencarian, sortir, dan paginasi (server-side, bukan JS statis)
- **Daftarkan KI** — form pengajuan KI baru oleh dosen (mock login SISFO, data tersimpan ke database
  berstatus "menunggu tinjauan" sebelum tayang publik)
- **Tantangan Industri** — industri memasang kebutuhan riset, peneliti mengajukan solusi
  (data tersimpan ke database, bukan simulasi)
- **Unduhan** — SOP pendaftaran KI, kerangka pembagian manfaat ekonomi, dan formulir dalam bentuk
  PDF sungguhan (saat ini masih dokumen placeholder — lihat catatan di bawah)
- **Pelajari KI** — modul belajar dari materi pelatihan DJKI + widget tanya-jawab AI
  (rule-based secara default, atau tersambung ke Claude sungguhan jika `ANTHROPIC_API_KEY` diisi)
- **Konsultasi** — chat dengan "Admin P2KI", pesan tersimpan per sesi ke database
- **Dasbor Admin** — login terpisah, menampilkan KPI dan tabel pengajuan real-time dari database

## Struktur Proyek

```
p2ki-web/
├── server.js              # entry point
├── src/
│   ├── db.js               # koneksi PostgreSQL
│   ├── ai.js                # logika AI (rule-based + opsional Anthropic API)
│   ├── middleware/auth.js   # proteksi login admin
│   └── routes/              # semua route Express
├── views/                   # template EJS
├── public/                  # CSS, JS client, dan PDF unduhan
├── db/schema.sql             # skema database
├── scripts/seed.js           # seeding data riil dari file rekap
└── data/                     # 4 file rekap Excel asli (Paten, Desain Industri, Merek, Hak Cipta)
```

## Setup Lokal

1. Install dependency:
   ```
   npm install
   ```
2. Siapkan PostgreSQL lokal (atau pakai Docker/Postgres.app), lalu buat database:
   ```
   createdb p2ki_dev
   ```
3. Salin `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL`.
4. Jalankan migrasi + seeding data riil (sekali saja):
   ```
   npm run seed
   ```
   Script ini membaca 4 file di folder `data/` dan memasukkan seluruh baris ke database.
   Aman dijalankan berulang — jika `ki_items` sudah berisi data, seeding KI dilewati otomatis.
5. Jalankan server:
   ```
   npm start
   ```
   Buka `http://localhost:3000`.

## Login Admin

Default (untuk development): `admin` / `admin123` — **wajib diganti** lewat environment variable
`ADMIN_USERNAME` dan `ADMIN_PASSWORD` sebelum dipakai di production.

## Deploy ke Railway

1. Push kode ini ke repo GitHub Anda (lihat bagian "Push ke GitHub" di bawah).
2. Di Railway dashboard: **New Project > Deploy from GitHub repo**, pilih repo ini.
3. Tambahkan plugin **PostgreSQL** ke project yang sama (klik **+ New > Database > PostgreSQL**).
   Railway otomatis menyuntikkan `DATABASE_URL` ke service web Anda.
4. Di tab **Variables** pada service web, tambahkan:
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` — ganti dari default
   - `SESSION_SECRET` — string acak yang panjang
   - `ANTHROPIC_API_KEY` — opsional, jika ingin AI Q&A tersambung ke Claude sungguhan
5. Setelah deploy pertama berhasil, jalankan seeding data riil sekali lewat Railway CLI:
   ```
   railway run node scripts/seed.js
   ```
   (Perlu `railway login` dan `railway link` ke project ini terlebih dahulu.)
6. Generate domain publik di **Settings > Networking > Generate Domain**.

## Push ke GitHub

Kode ini belum ada di GitHub — jalankan ini dari folder project (ganti URL dengan repo Anda):

```
git init
git add .
git commit -m "Initial commit: P2KI UNISBA website"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

## Catatan & Batasan Saat Ini

- **Login SISFO** masih berupa mock (tombol "Masuk dengan Akun SISFO" mengisi data contoh),
  belum benar-benar terhubung ke sistem SISFO UNISBA yang sesungguhnya.
- **Dokumen di halaman Unduhan** adalah PDF placeholder buatan otomatis, bukan dokumen resmi
  final. Ganti file di `public/docs/` dengan dokumen resmi yang sudah disahkan.
- **Data Tantangan Industri** berisi 6 contoh ilustratif (bukan data riil), karena fitur
  link-and-match ini baru diusulkan dan belum punya data sungguhan dari industri.
- **AI Q&A dan Konsultasi** berjalan dengan jawaban rule-based (pencocokan kata kunci) secara
  default. Isi `ANTHROPIC_API_KEY` di environment variable untuk mengaktifkan jawaban dari model
  Claude sungguhan.
- **Autentikasi admin** masih sederhana (satu akun dari environment variable, tanpa hashing).
  Untuk production yang lebih serius, pertimbangkan tabel `admin_users` dengan password ter-hash
  (bcrypt) dan/atau SSO sungguhan ke SISFO.
