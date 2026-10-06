# Sumber Akademi KI

Katalog primer: https://ekii.dgip.go.id/sumber-daya/modul-ajar

Daftar 13 judul dan URL PDF dibaca langsung dari katalog publik EKII pada 6 Oktober 2026. Data terkurasi ada di `src/learning-modules.js`; atribut edisi hanya diisi ketika tercantum pada judul sumber. Tanggal pada nama file merupakan identifier sumber, bukan tahun edisi.

Pengantar, kategori dan urutan rekomendasi merupakan kurasi Sentra KI untuk membantu memilih bacaan. Tidak ada klaim bahwa seluruh isi PDF telah dibaca atau bahwa pengantar menggantikan modul. Situs tidak menyalin isi buku, membuat halaman/durasi baca fiktif, atau mengklaim sertifikasi dan pelatihan bersama DJKI.

PDF tetap dibuka dari URL resmi yang tercantum pada katalog. Pengambilan otomatis dibatasi server sumber (403/redirect dan unduhan browser tidak selesai), sehingga dokumen tidak dimirror ke repository dan tidak dimuat sebagai iframe pada halaman awal. Halaman detail menyediakan tombol PDF dan fallback katalog resmi. Ini juga menghindari pengunduhan banyak PDF saat pengguna membuka Akademi.

Asisten memberi panduan umum. Permintaan bacaan berdasarkan topik dapat dijawab langsung dari metadata katalog, dengan sumber `ekii_catalogue`; tautan rujukan disajikan sebagai sumber bacaan terkait, bukan kutipan isi PDF. Perbarui data dan tanggal pemeriksaan setelah membaca ulang katalog resmi ketika sumber berubah.

Validasi yang tersedia: tes jumlah/uniknya dokumen, domain dan pola URL sumber, edisi, filter gabungan, escaping template, referensi asisten dan ketiadaan embed PDF awal. Pengujian ini tidak memastikan ketersediaan setiap file pada server eksternal.
