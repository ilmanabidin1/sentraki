# Audit teknis Sentra KI

Tanggal: 3 Oktober 2026. Acuan audit awal: `0225b06`. Tujuan: kualitas antarmuka untuk dosen/peneliti Unisba. Temuan awal dipertahankan sebagai baseline; status perbaikan ada di bawah.

## Hasil perbaikan sekaligus

Seluruh 11 temuan implementasi ditangani pada pass berikutnya:

- Navigasi ringkas hingga 1360 px, target sentuh 44×44 px, dan input ponsel 16 px.
- Modul mengikuti tinggi isi; panel tertutup memakai `hidden`. Hierarki heading, landmark main, dan skip link diperbaiki.
- Drawer modal memindahkan fokus ke tombol tutup, membatasi Tab pada menu, menonaktifkan latar, dan mengembalikan fokus saat ditutup. Transisi visibility dihapus agar fokus awal tidak menunggu animasi.
- Kontras disclaimer/petunjuk dan state hover status diperbaiki melalui token bersama.
- Mock pengisian SISFO dihapus; copy integrasi, konsultasi manusia, enkripsi, SLA, dan kesiapan lisensi diselaraskan dengan fungsi yang tersedia. Dokumen unduhan diberi penjelasan contoh/placeholder.
- Chat memeriksa status HTTP dan payload, memiliki batas waktu, status pengiriman yang menunggu konfirmasi, dan retry pada pesan yang sama.
- Formulir mempertahankan isian, radio/select, dan konteks KI/tantangan saat validasi gagal; error memiliki tautan dan keterangan field. Nilai sektor industri diselaraskan dengan validator.
- Token dan pola form didokumentasikan di `docs/ui-patterns.md`. Definisi gradient text lama serta transisi tinggi accordion dihapus; disclosure menggunakan sprite SVG.
- CSS diminifikasi dengan build yang memperbarui hash URL. Server mengompresi aset publik; logo footer dimuat lazy.

Validasi: **9/9 tes lulus**, 16 GET rute lokal berstatus 200, POST invalid mempertahankan konteks KI dan tantangan, dan detector tidak menemukan pola pada sumber yang dipindai. Browser diuji pada 320, 390, 1024, dan 1440 px: tidak ada overflow halaman pada sampel; hasil filter paten/proses/2025 tetap 18. Materi modul kedua pada 390 px memiliki tinggi isi dan panel yang sama, 733 px. Fokus awal drawer terkonfirmasi `drawerClose`, dan kembali ke `mobileMenuToggle` saat Escape.

Ukuran CSS: baseline 95.493 byte tanpa kompresi → sekitar **12.500 byte melalui gzip**, berkurang sekitar **87%**. Hasil minifikasi terbaru sekitar 78.900 byte sebelum gzip. Angka ini mengukur transfer aset lokal, bukan Core Web Vitals atau kecepatan hosting. Pengujian memakai database sementara dan balasan berbasis aturan, tanpa API AI eksternal. Perangkat fisik, pembaca layar nyata, zoom 200%, dan deployment produksi belum diuji.

Koreksi bukti: README lama menyebut contoh tantangan industri, tetapi seeding aktual tidak membuat tantangan. Label contoh tidak diterapkan pada kebutuhan industri yang masuk melalui formulir. Integrasi SISFO/DJKI belum dibangun oleh perbaikan ini; klaimnya diperbaiki agar sesuai kondisi tersebut.

## Verdict integritas implementasi

**Belum lulus.** Identitas resmi, ikon SVG khusus, filter server, dan dasbor paten membentuk sistem yang sesuai produk. Namun klaim integrasi SISFO/DJKI serta layanan konsultasi manusia tidak cocok dengan kode aktual. Penanganan error juga belum konsisten dengan status yang ditampilkan kepada pengguna.

Detektor Impeccable menemukan tiga pola, diperiksa dalam konteks:

- `layout-transition`, CSS baris 3124: benar, accordion menganimasikan `max-height`. Pemeriksaan browser juga membuktikan batas 800 px memotong materi yang panjang.
- `gradient-text`, CSS baris 628: false positive untuk tampilan saat ini. Override baris 4434 menghasilkan `background-image: none`, diverifikasi melalui computed style.
- `side-tab`, CSS baris 2064: border biru pada pemberitahuan legal. Ini penilaian gaya, bukan kegagalan teknis terverifikasi; tidak dihitung sebagai masalah.

## Skor kesehatan

| Dimensi | Skor / 4 | Temuan utama |
|---|---:|---|
| Aksesibilitas | 2 | Kontras teks, fokus drawer, dan semantik accordion |
| Performa | 3 | JS/ikon ringan; CSS 95,5 KB belum dikompresi pada server lokal |
| Responsif | 2 | Navigasi terpotong pada 1024 px dan materi terpotong pada ponsel |
| Theming | 2 | Token tersedia, tetapi literal warna dan override masih tersebar |
| Integritas implementasi | 1 | Klaim layanan/integrasi tidak sesuai fungsi aktual |
| **Total** | **10/20** | **Acceptable — perlu perbaikan signifikan** |

Skor ini penilaian audit terbatas, bukan sertifikasi WCAG atau hasil Lighthouse.

## Ringkasan

11 temuan: **0 P0, 7 P1, 4 P2, 0 P3**. Prioritas pertama adalah navigasi tablet, isi materi yang terpotong, klaim integrasi/layanan, serta status pengiriman chat. Perbaikan filter sebelumnya tetap bekerja sesuai tes.

## Lingkup dan metode

- Pemeriksaan sumber template EJS, stylesheet, JavaScript, rute, validasi, dan konteks produk.
- Detektor: `impeccable detect views public/css public/js`.
- Browser: Codex In-app Browser pada pratinjau localhost, viewport emulasi 1280×800, 1024×768, dan 390×844; pemeriksaan computed style, bounding rectangle, snapshot aksesibilitas, dan interaksi keyboard.
- Halaman sampel: beranda, status paten, direktori dengan filter paten/proses/2025, pembelajaran, serta formulir pendaftaran. Halaman lain diperiksa melalui sumber; bukan seluruh rute melalui browser.
- `npm test`: 6/6 lulus, mencakup filter gabungan, hitungan, paginasi, parameter invalid, dan referensi ikon.
- HTTP lokal sekali ukur: beranda 37.290 byte, TTFB sekitar 4 ms; direktori terfilter 71.632 byte, sekitar 5 ms. Ini memakai harness GET dengan database sementara, bukan server produksi lengkap, sehingga tidak mengukur biaya sesi, jaringan seluler, atau hosting.
- Tidak mengukur LCP/INP/CLS atau frame rate. Tidak menguji perangkat fisik, pembaca layar nyata, zoom teks 200%, atau gesture sentuh sintetis. Tidak ada custom drag surface yang memerlukan gesture test ditemukan pada kode yang diperiksa. Dasbor admin belum diperiksa setelah login.
- Audit tidak mengubah kode antarmuka atau data aplikasi.

## Temuan P1 — major

### 1. Navigasi utama terpotong pada tablet/laptop kecil

**Lokasi:** `public/css/style.css:369`, `:4395`; `views/partials/nav.ejs:70`. **Kategori:** Responsif.

Pada viewport 1024 px, tombol pendaftaran berada di x=1082–1221 dan ikon admin x=1233–1269. Navigasi desktop tetap aktif, hamburger `display: none`; overflow halaman disembunyikan. Pengguna kehilangan akses langsung ke tindakan utama dari header.

**Rekomendasi:** tentukan breakpoint berdasarkan ruang seluruh header, bukan 900 px; tampilkan menu ringkas sebelum isi keluar viewport. Validasi 901–1280 px. **Standar:** evaluasi reflow WCAG 1.4.10 diperlukan setelah perbaikan; temuan ini sendiri adalah kehilangan kontrol terverifikasi pada viewport tersebut. **Perintah:** `$impeccable adapt`.

### 2. Isi modul belajar kedua terpotong di ponsel

**Lokasi:** `public/css/style.css:3121–3129`. **Kategori:** Responsif / Performa.

Pada 390 px, konten modul kedua memiliki `scrollHeight: 929`, tetapi tinggi terbuka 800 px dengan `overflow: hidden`. Bagian akhir materi tidak dapat dibaca. `transition: max-height` juga mengubah layout selama animasi.

**Rekomendasi:** hilangkan batas tinggi arbitrer; gunakan disclosure yang mengikuti tinggi konten, dengan efek opsional yang tidak membatasi bacaan. Uji materi panjang dan pembesaran teks. **Standar:** terkait WCAG 1.4.10; clipping konten terverifikasi pada ponsel. **Perintah:** `$impeccable adapt`, kemudian `$impeccable optimize`.

### 3. Kontras teks penting belum memenuhi AA

**Lokasi:** `public/css/style.css:2265`, `:2906`, `:3530`, `:3659`, `:2540`, `:2546`. **Kategori:** Aksesibilitas.

Disclaimer formulir terverifikasi berwarna `#94a3b8`, ukuran 12 px, pada kartu putih: rasio **2,56:1**, di bawah 4,5:1 untuk teks normal. Token yang sama digunakan pada petunjuk PDKI dan waktu chat. Pada hover, chip granted putih/`#10b981` sekitar **2,54:1** dan chip proses putih/`#f59e0b` **2,15:1** berdasarkan aturan CSS; keadaan hover tidak diuji secara visual.

**Rekomendasi:** gunakan warna teks lebih gelap untuk permukaan terang dan pasangan warna status yang lolos kontras pada semua keadaan interaksi. **Standar:** WCAG 1.4.3 Contrast (Minimum). **Perintah:** `$impeccable colorize`.

### 4. Klaim integrasi dan konsultasi tidak sesuai implementasi

**Lokasi:** `views/daftarkan-ki.ejs:37`, `:106`; `views/partials/footer.ejs:71`; `views/beranda.ejs:14`, `:123`; `views/konsultasi.ejs:7`, `:54`, `:60`; `src/routes/konsultasi.js:39`. **Kategori:** Integritas implementasi.

Tombol SISFO hanya mengisi identitas contoh di browser, lalu menampilkan “Terhubung SISFO”. Footer menyatakan koneksi resmi SISFO/PDKI. Konsultasi menjanjikan staf online dan menampilkan “Enkripsi Sesi”, sementara rute memanggil balasan otomatis; session cookie sendiri tidak membuktikan enkripsi pesan. Pengguna bisa salah memahami identitas terverifikasi, pembaruan status, dan siapa yang menjawab. Klaim kesiapan lisensi/TRL serta verifikasi 3–5 hari kerja di beranda juga belum memiliki bukti dalam konteks produk.

**Rekomendasi:** cocokkan copy dengan fungsi yang benar-benar tersedia, tandai demonstrasi/otomasi, dan minta bukti operasional sebelum mengiklankan integrasi atau SLA. Pertahankan tautan pencarian PDKI sebagai tautan eksternal. **Standar:** integritas informasi produk. **Perintah:** `$impeccable clarify`.

### 5. Chat menampilkan sukses sebelum server menerima pesan

**Lokasi:** `public/js/main.js:142–146`, `:187`, `:203–214`; `src/routes/konsultasi.js:35`. **Kategori:** Integritas implementasi.

Label “Terkirim” ditambahkan sebelum request selesai. Kode tidak memeriksa `res.ok`; JSON error dari 400/429/500 dibaca sebagai respons sukses, lalu `data.reply` atau `data.jawaban` yang tidak ada ditampilkan. Pengguna kehilangan isi input dan tidak memperoleh status kegagalan yang dapat ditindaklanjuti. Bukti berasal dari jalur kode, bukan fault injection produksi.

**Rekomendasi:** tampilkan menunggu → terkirim/gagal setelah konfirmasi server; periksa status HTTP dan struktur respons; simpan teks untuk retry, jelaskan rate limit, dan sediakan retry tanpa refresh. **Standar:** terkait WCAG 4.1.3 untuk pengumuman status. **Perintah:** `$impeccable harden`.

### 6. Fokus keyboard keluar dari drawer yang masih terbuka

**Lokasi:** `public/js/main.js:14–31`; `views/partials/nav.ejs:93`. **Kategori:** Aksesibilitas.

Membuka drawer mempertahankan fokus pada toggle. Menekan Tab dari link terakhir “Masuk ke Dasbor Admin” berpindah ke breadcrumb beranda di belakang overlay, sementara drawer tetap terbuka. Latar tidak dibuat inert; tidak ada pengelolaan fokus modal. Escape dan pengembalian fokus saat Escape sudah tersedia, tetapi belum cukup untuk alur keyboard lengkap.

**Rekomendasi:** gunakan dialog modal atau perilaku drawer yang setara, pindahkan fokus saat buka, cegah fokus ke latar, dan kembalikan fokus pada semua cara penutupan. **Standar:** WCAG 2.4.3 Focus Order; evaluasi 2.4.11 Focus Not Obscured. **Perintah:** `$impeccable harden`.

### 7. Konten disclosure tersembunyi masih terekspos; beranda tidak memiliki main

**Lokasi:** `views/pelajari-ki.ejs:27`; `public/css/style.css:3121`; `views/beranda.ejs:5`. **Kategori:** Aksesibilitas.

Snapshot aksesibilitas masih memuat semua daftar materi saat accordion tertutup karena penyembunyian hanya melalui tinggi nol/overflow. Browser juga mengonfirmasi beranda memiliki nol elemen `main`, sehingga navigasi landmark ke isi utama tidak tersedia. Hierarki pembelajaran melompat dari h1 ke h3.

**Rekomendasi:** gunakan disclosure native atau sinkronkan keadaan tersembunyi secara semantik; hubungkan tombol dengan panel. Tambahkan landmark main dan hierarki heading yang sesuai struktur. **Standar:** WCAG 1.3.1 Info and Relationships; 4.1.2 Name, Role, Value. **Perintah:** `$impeccable harden`.

## Temuan P2 — minor

### 8. Validasi server menghapus nilai formulir dan konteks KI

**Lokasi:** `src/routes/direktori.js:62`, `:82`; `src/routes/tantangan.js:85`, `:105`; `views/ajukan-minat.ejs:50`. **Kategori:** Integritas implementasi / Aksesibilitas.

Pada error, rute merender formulir baru tanpa nilai yang sudah diisi; pengajuan minat mengirim `kiItem: null` dan solusi `challengeItem: null`. Pengguna harus mengisi ulang dan bisa kehilangan konteks pilihan KI/tantangan. Pesan digabung menjadi satu paragraf tanpa keterkaitan field.

**Rekomendasi:** pertahankan nilai dan entitas terkait, beri error per field dengan `aria-describedby`, lalu arahkan fokus ke ringkasan error. **Standar:** mendukung WCAG 3.3.1 Error Identification. **Perintah:** `$impeccable harden`.

### 9. Target sentuh belum nyaman secara konsisten

**Lokasi:** `public/css/style.css:417`, `:2526`; `views/direktori.ejs:158`. **Kategori:** Responsif.

Browser mengukur hamburger 40 px tinggi, chip tabel 28 px, chip hapus filter sekitar 29 px, dan “Hapus Semua” sekitar 19 px. Tindakan rapat pada ponsel meningkatkan salah tekan.

**Rekomendasi:** perluas area interaksi menuju 44×44 px atau beri jarak memadai tanpa memperbesar semua elemen visual. **Standar:** 44×44 adalah target ergonomi/AAA WCAG 2.5.5; ukuran di bawah 44 tidak otomatis gagal AA 2.5.8 yang menggunakan 24 px dan pengecualian jarak. **Perintah:** `$impeccable adapt`.

### 10. Aset kecil, tetapi CSS bersama belum efisien dikirim

**Lokasi:** `public/css/style.css`; `server.js:17`; `views/partials/head.ejs:8`. **Kategori:** Performa.

Setiap halaman memuat stylesheet bersama **95.493 byte**. Request lokal dengan `Accept-Encoding: gzip` masih mengirim ukuran penuh tanpa `Content-Encoding`. Ini menambah biaya cold load pada jaringan lambat; belum terbukti sebagai penyebab lag produksi. JS hanya 7.651 byte, sprite ikon 5.724 byte, pola latar 627 byte. Logo footer juga dimuat eager, tetapi ukurannya kecil sehingga bukan prioritas utama.

**Rekomendasi:** minify stylesheet dan aktifkan gzip/Brotli pada lapisan server/proxy yang sesuai; cek coverage sebelum menghapus aturan atau memecah CSS. Ukur LCP/INP/CLS dengan jaringan representatif pada deployment nyata sebelum menyimpulkan penyebab lag. **Standar:** anggaran aset dan Core Web Vitals, belum diukur. **Perintah:** `$impeccable optimize`.

### 11. Token warna dan override belum menjadi satu sumber yang konsisten

**Lokasi:** `public/css/style.css:6`, `:626`, `:4430`; atribut style pada 11 template. **Kategori:** Theming.

Token dasar sudah ada, tetapi literal warna, beberapa gradien, dan override di akhir stylesheet masih tersebar. Contohnya `.gradient-text` memiliki dua definisi dengan perilaku bertentangan. Ini meningkatkan risiko perbaikan kontras tidak merata dan perubahan berikutnya mengaktifkan aturan lama. Tidak ada toggle tema gelap; tidak dinilai sebagai fitur yang rusak karena belum menjadi kebutuhan produk.

**Rekomendasi:** konsolidasikan aturan yang benar-benar dipakai, petakan warna ke token semantik permukaan/teks/status, dan hapus definisi mati setelah coverage diperiksa. **Standar:** konsistensi sistem implementasi. **Perintah:** `$impeccable extract`.

## Pola sistemik

- Copy memiliki beberapa janji operasional yang tidak dijaga oleh kontrak implementasi.
- Keadaan sukses, gagal, tertutup, dan fokus belum selalu disinkronkan antara visual, DOM, dan respons server.
- Breakpoint ditetapkan tanpa memeriksa lebar gabungan header; tinggi konten dibatasi angka tetap.
- Token dan aturan override membantu perbaikan cepat, tetapi menyisakan definisi yang menyesatkan detector dan pengerjaan berikutnya.

## Praktik yang sudah baik

- Hitungan paten dan filter gabungan konsisten; sampel data menunjukkan 178 paten = 119 granted + 34 proses + 25 ditolak/ditarik.
- Paginasi dibatasi dan pilihan filter dipertahankan; semua tes terkait lulus.
- Ikon SVG khusus menggunakan sprite bersama; tidak bergantung pada font ikon atau library client.
- Efek blur/backdrop dan animasi latar kontinu sudah dihapus. Reduced motion tersedia; tidak ditemukan hilangnya state buka/tutup karena alternatif tanpa animasi.
- Static cache satu hari, ETag, dan versi hash aset sudah tersedia.
- Label input utama, teks alternatif logo, escape template EJS, tombol semantik, serta CSRF pada aplikasi utama sudah tersedia.
- Halaman sampel pada 390 px tidak memiliki overflow horizontal halaman; tabel paten memiliki kebutuhan gulir lokal tersendiri.

## Urutan tindakan yang disarankan

1. **P1 — `$impeccable adapt`**: pulihkan navigasi 901–1280 px dan hilangkan clipping materi; perbaiki target sentuh dalam pass yang sama.
2. **P1 — `$impeccable harden`**: status/error chat, fokus drawer, disclosure semantik, landmark, dan pemulihan formulir.
3. **P1 — `$impeccable clarify`**: selaraskan klaim SISFO, DJKI, konsultasi, dokumen, dan SLA dengan bukti layanan.
4. **P1 — `$impeccable colorize`**: perbaiki pasangan warna teks dan state chip status.
5. **P2 — `$impeccable optimize`**: kurangi biaya CSS dan ukur performa deployment nyata.
6. **P2 — `$impeccable extract`**: konsolidasikan token dan aturan yang tumpang tindih.
7. **Akhir — `$impeccable polish`**: periksa konsistensi setelah perbaikan fungsional.

Perintah dapat dijalankan satu per satu, sekaligus, atau dengan urutan yang dipilih pemilik produk. Jalankan ulang `$impeccable audit` setelah perbaikan untuk menilai perubahan skor.
