# Pola antarmuka Sentra KI

Pertahankan identitas navy/emas, lambang Unisba, logo LPPM, dan sprite `public/icons/sentra-ki.svg`. Sistem visual aktual dicatat di `DESIGN.md`. CSS dasar berada di `public/css/style.css`, kemudian ditimpa `public/css/premium.css`; tidak ada framework UI baru.

- Permukaan: `--bg-page`, `--bg-card`, `--bg-subtle`. Teks pada permukaan terang memakai `--text-heading`, `--text-body`, `--text-muted`, atau `--text-subtle` (warna terakhir juga harus lolos kontras).
- Permukaan gelap: `--text-white`, `--text-on-dark`, dan `--text-on-dark-muted`. Jangan memakai token permukaan sebagai warna teks.
- Status: hijau untuk granted, amber untuk proses, rose untuk ditolak/ditarik, dengan label teks. Pada chip interaktif gunakan tingkat 700 bersama teks putih saat hover.
- Tipografi lokal: Manrope 700 untuk judul pembuka yang modern, Manrope untuk antarmuka/data, dan Bodoni Moda regular untuk judul bagian beranda. Asal font dan lisensi OFL tersedia di `public/fonts/README.md`.
- Beranda memakai lembar inovasi: intro terbatas (selesai dalam 750 ms), pilihan portfolio oleh pengguna (350 ms), reveal bagian sekali (450 ms), dan transisi dokumen (180 ms). Reduced motion menampilkan konten statis; animasi skrip berhenti saat halaman tersembunyi.
- Direktori memakai `minmax(0, 1fr)` dan `min-width: 0`; judul membungkus tanpa melebarkan grid. Metadata inventor/fakultas tetap dipotong dengan ellipsis; detail KI menyediakan konteks lengkap.
- Logo LPPM dimuat eager agar identitas bawah halaman lengkap pada capture dan cetak. Pertahankan rasio asli.
- Navigasi ringkas muncul hingga 1360 px karena lebar gabungan brand, menu, dan tindakan. Drawer mengelola fokus dan membuat latar inert.
- Landmark isi utama: `main#mainContent`, target skip link. Disclosure modul memakai `hidden` dan `aria-expanded` yang tersinkron, tanpa batas tinggi tetap.
- Formulir publik menerima `values` dan `fieldErrors` dari validator. Partial `views/partials/form-errors.ejs` memakai pemetaan `fieldIds`; tiap error juga muncul dekat field dengan `aria-describedby`. Gunakan escaping EJS untuk nilai dari pengguna.
- Chat menunggu konfirmasi HTTP sebelum menampilkan terkirim. Error mempertahankan pesan dalam layar dan menyediakan retry pada pesan yang sama.

Setelah mengedit CSS atau JS, jalankan `npm run build`: minifier menggabungkan `style.css` + `premium.css` + `academy.css` sesuai urutan cascade, menghasilkan `style.min.css` dan memperbarui hash URL CSS/JS. Commit sumber dan hasil build bersama agar deployment tanpa devDependencies tetap bisa melayani aset. Server mengompresi aset publik; HTML per sesi tidak dikompresi.

Akademi KI memakai katalog terkurasi di `src/learning-modules.js`, pencarian/filter melalui GET, dan halaman detail `/pelajari-ki/:id`. Tautan PDF mengarah ke EKII; dokumen tidak dimuat sebelum pengguna memilihnya. Perbedaan pengantar editorial dan isi sumber dicatat di `docs/learning-sources.md`.

Gunakan viewport desktop, tablet, dan ponsel untuk validasi. Ukuran viewport tidak membuktikan gesture atau performa perangkat fisik. Klaim integrasi, SLA, verifikasi, dan kesiapan lisensi harus berasal dari bukti operasional, bukan dekorasi UI.
