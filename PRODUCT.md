# Sentra KI — P2KI Unisba

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pengguna utama yang dikonfirmasi pemilik produk: dosen dan peneliti Universitas Islam Bandung yang ingin mengelola dan memantau kekayaan intelektual (KI).

Alur yang juga tersedia di aplikasi melayani industri/mitra pencari peluang kolaborasi serta admin P2KI yang meninjau pengajuan. Prioritas pengerjaan tetap pada kebutuhan dosen dan peneliti.

## Product Purpose

Sentra KI adalah portal P2KI di lingkungan LPPM Unisba untuk menemukan KI universitas, memahami statusnya, mengajukan KI, dan membuka peluang pemanfaatan bersama mitra.

Keberhasilan perbaikan berarti pengguna mudah menemukan KI yang relevan, memahami jumlah dan status paten berdasarkan tahun pengajuan, dan mencapai tindakan berikutnya melalui alur yang jelas. Situs harus terasa ringan saat dibuka dan digunakan.

## Operating Context

- Direktori: mencari judul, inventor, atau nomor permohonan; menggabungkan filter jenis KI, fakultas, status, dan tahun; membuka detail KI.
- Pemantauan paten: melihat jumlah granted, dalam proses, serta status lainnya menurut tahun pengajuan melalui halaman khusus `/status-paten`.
- Pengajuan: dosen/peneliti mengisi formulir pendaftaran KI; pengajuan menunggu tinjauan sebelum publikasi.
- Kolaborasi: dari detail KI, mitra dapat mengajukan minat. Tantangan industri menyediakan alur pemasangan kebutuhan riset dan pengajuan solusi.
- Layanan pendukung: katalog modul resmi EKII–DJKI pada Akademi KI, pencarian/filter materi, detail dan tautan PDF asli, tanya-jawab, konsultasi, dan unduhan formulir/pedoman.
- Admin: meninjau data pengajuan dari dasbor yang memerlukan login.

Alur di atas bersumber dari implementasi repository. Ketersediaan operasional layanan dan integrasi pihak luar harus diverifikasi tersendiri sebelum diklaim kepada pengunjung.

## Capabilities and Constraints

- Implementasi saat init: Node.js, Express, template EJS, dan SQLite. Halaman dirender di server; filter dan paginasi direktori diproses di server. README lama yang menyebut PostgreSQL tidak menjadi rujukan arsitektur aktual.
- Tahun paten berarti **tahun pengajuan**, bukan tahun granted. Status dari rekap merupakan status dalam sumber data, bukan riwayat status tiap tahun atau pemantauan langsung DJKI.
- Tampilkan hitungan dan hasil filter dari data yang sama. Bedakan granted, dalam proses, dan ditolak/ditarik; jangan menggabungkan kategori sehingga hasil menyesatkan.
- Ringkasan pemantauan paten ditempatkan pada halaman khusus, sesuai keluhan pengguna bahwa sebelumnya muncul di semua menu.
- Navigasi atas dan bagian bawah halaman harus memenuhi lebar halaman dengan isi yang tetap terbaca di desktop dan ponsel.
- Hindari biaya render yang tidak membantu tugas pengguna, efek terus-menerus, dan dependensi visual berat. Klaim peningkatan performa harus didukung pengukuran; perubahan kode lokal tidak membuktikan kecepatan hosting.
- Login SISFO masih berupa demonstrasi, bukan SSO yang terhubung ke sistem universitas.
- Tanya-jawab menggunakan aturan lokal secara default; API AI bersifat opsional. Jangan mengklaim semua jawaban berasal dari model AI atau konsultasi langsung manusia tanpa bukti.
- Kode seeding saat ini tidak membuat tantangan industri contoh. Kebutuhan yang dikirim melalui formulir menunggu tinjauan sebelum publikasi. Dokumen unduhan masih perlu dikonfirmasi sebagai dokumen resmi sebelum digunakan.

## Brand Commitments

- Nama utama: P2KI UNISBA, singkatan dari Pusat Pengembangan dan Pelayanan Kekayaan Intelektual. Sentra KI tetap boleh digunakan sebagai nama alternatif; unit berada di bawah LPPM Universitas Islam Bandung.
- Gunakan logo P2KI terbaru yang diberikan pemilik produk: versi glossy pada area gelap, versi biru-emas pada area terang. Derivatif web transparan ada di `public/brand/`.
- Seluruh judul menggunakan Manrope seperti “Inovasi kampus. Solusi nyata.”; pemilik produk menolak penggunaan kembali judul serif/old-school.
- Gunakan lambang universitas yang diberikan pemilik produk: `public/images-lambang-unisba.png`.
- Gunakan logo LPPM yang diberikan pemilik produk: `public/logo-lppm-unisba.jpeg`. Pertahankan bentuk dan proporsi aslinya, tampilkan tinta putih tanpa bidang biru pada area gelap. Lambang Unisba yang transparan juga ditampilkan putih pada area gelap.
- Pemilik produk menolak ikon emoji dan tampilan yang terasa generik hasil AI. Gunakan ikon SVG khusus untuk Sentra KI; sistem yang tersedia ada di `public/icons/sentra-ki.svg`. Icon pack digambar ulang dengan stroke 2.2 dan sudut membulat; pemilik menolak ikon bersudut tajam yang sebelumnya sulit dikenali.
- Bahasa layanan adalah bahasa Indonesia. Gunakan istilah KI yang jelas dan konsisten; jelaskan istilah status yang berpotensi membingungkan.

## Evidence on Hand

- Empat rekap Excel: `data/rekap_paten.xlsx`, `data/rekap_hak_cipta.xlsx`, `data/rekap_merek.xlsx`, dan `data/rekap_desain_industri.xlsx`.
- Implementasi rute dan formulir di `src/routes/`, serta template di `views/`, menjadi bukti fungsi yang tersedia dalam kode.
- Logo resmi disediakan langsung oleh pemilik produk, bukan dibuat ulang oleh AI.
- Testimoni, capaian komersialisasi, integrasi SISFO/DJKI aktif, dan kecepatan produksi belum dikonfirmasi. Jangan membuat klaim tersebut berdasarkan tampilan atau data contoh.

## Product Principles

1. Utamakan pekerjaan dosen/peneliti dalam mengelola dan memantau KI.
2. Hubungkan angka, status, dan tahun dengan sumber serta makna yang jelas.
3. Setiap halaman mendukung tugas yang relevan dan tindakan lanjutan yang mudah ditemukan.
4. Jadikan performa ringan dan navigasi desktop/ponsel bagian dari kualitas produk.
5. Pertahankan identitas resmi dan bedakan layanan nyata dari demonstrasi atau contoh.

## Open Decisions

- Integrasi dan sumber pembaruan status paten langsung belum dikonfirmasi.
- Target performa terukur, standar aksesibilitas formal, serta kebijakan layanan/validasi dokumen resmi belum ditetapkan oleh pemilik produk.
