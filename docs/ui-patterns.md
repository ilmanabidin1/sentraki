# Pola antarmuka Sentra KI

Pertahankan identitas navy/emas, lambang Unisba, logo LPPM, dan sprite `public/icons/sentra-ki.svg`. Aturan bersama tetap berada di `public/css/style.css`; tidak ada framework UI baru.

- Permukaan: `--bg-page`, `--bg-card`, `--bg-subtle`. Teks pada permukaan terang memakai `--text-heading`, `--text-body`, `--text-muted`, atau `--text-subtle` (warna terakhir juga harus lolos kontras).
- Permukaan gelap: `--text-white`, `--text-on-dark`, dan `--text-on-dark-muted`. Jangan memakai token permukaan sebagai warna teks.
- Status: hijau untuk granted, amber untuk proses, rose untuk ditolak/ditarik, dengan label teks. Pada chip interaktif gunakan tingkat 700 bersama teks putih saat hover.
- Navigasi ringkas muncul hingga 1360 px karena lebar gabungan brand, menu, dan tindakan. Drawer mengelola fokus dan membuat latar inert.
- Landmark isi utama: `main#mainContent`, target skip link. Disclosure modul memakai `hidden` dan `aria-expanded` yang tersinkron, tanpa batas tinggi tetap.
- Formulir publik menerima `values` dan `fieldErrors` dari validator. Partial `views/partials/form-errors.ejs` memakai pemetaan `fieldIds`; tiap error juga muncul dekat field dengan `aria-describedby`. Gunakan escaping EJS untuk nilai dari pengguna.
- Chat menunggu konfirmasi HTTP sebelum menampilkan terkirim. Error mempertahankan pesan dalam layar dan menyediakan retry pada pesan yang sama.

Setelah mengedit CSS atau JS, jalankan `npm run build`: minifier menghasilkan `style.min.css` dan memperbarui hash URL CSS/JS. Commit sumber dan hasil build bersama agar deployment tanpa devDependencies tetap bisa melayani aset. Server mengompresi aset publik; HTML per sesi tidak dikompresi.

Gunakan viewport desktop, tablet, dan ponsel untuk validasi. Ukuran viewport tidak membuktikan gesture atau performa perangkat fisik. Klaim integrasi, SLA, verifikasi, dan kesiapan lisensi harus berasal dari bukti operasional, bukan dekorasi UI.
