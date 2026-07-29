const express = require('express');
const router = express.Router();
const pool = require('../db');
const { askLearningAI } = require('../ai');

const MODULES = [
  {
    title: 'Dasar-Dasar Kekayaan Intelektual',
    meta: 'Modul 1 · 12 menit baca',
    points: [
      'Kekayaan Intelektual (KI) adalah hak eksklusif atas hasil olah pikir manusia di bidang teknologi, seni, sastra, dan ilmu pengetahuan.',
      'Perlindungan KI mendorong inovasi dengan memberi pencipta/inventor kepastian hukum dan potensi manfaat ekonomi atas karyanya.',
      'Di Indonesia, KI diklasifikasikan menjadi dua kelompok besar: KI Personal (Paten, Hak Cipta, Merek, Desain Industri, Rahasia Dagang, DTLST) dan KI Komunal (Indikasi Geografis, Pengetahuan Tradisional, Ekspresi Budaya Tradisional).',
      'Pendaftaran dan pencatatan KI di Indonesia dikelola oleh DJKI di bawah Kementerian Hukum.'
    ]
  },
  {
    title: 'Jenis-Jenis KI dan Perbedaannya',
    meta: 'Modul 2 · 18 menit baca',
    points: [
      'Paten melindungi invensi di bidang teknologi yang baru, mengandung langkah inventif, dan dapat diterapkan dalam industri; terbagi menjadi Paten Biasa (perlindungan 20 tahun) dan Paten Sederhana (perlindungan 10 tahun).',
      'Hak Cipta melindungi ciptaan di bidang ilmu pengetahuan, seni, dan sastra dan timbul otomatis sejak ciptaan diwujudkan; pencatatan bersifat deklaratif, bukan syarat lahirnya hak.',
      'Merek melindungi tanda yang membedakan barang/jasa suatu pihak dari pihak lain, terdiri dari Merek Dagang dan Merek Jasa, berlaku 10 tahun dan dapat diperpanjang.',
      'Desain Industri melindungi bentuk, konfigurasi, atau komposisi garis/warna suatu produk yang memberi kesan estetis, dengan masa perlindungan 10 tahun.',
      'KI Komunal (Indikasi Geografis, Pengetahuan Tradisional, Ekspresi Budaya Tradisional) melindungi kekayaan yang dijaga secara kolektif oleh masyarakat, dengan skema pembagian manfaat ekonomi yang berbeda dari KI personal.'
    ]
  },
  {
    title: 'Alur dan Prosedur Pendaftaran KI',
    meta: 'Modul 3 · 15 menit baca',
    points: [
      'Tahap umum: penelusuran kebaruan, penyusunan dokumen, pengajuan permohonan ke DJKI, pemeriksaan formalitas, lalu pemeriksaan substantif (khusus paten dan merek).',
      'Paten melalui tahap pengumuman (18 bulan) sebelum pemeriksaan substantif, sehingga total proses hingga granted dapat memakan waktu beberapa tahun.',
      'Hak Cipta relatif lebih cepat karena bersifat pencatatan (deklaratif), umumnya selesai dalam hitungan minggu hingga bulan.',
      'Merek dan Desain Industri melalui masa pengumuman untuk memberi kesempatan pihak lain mengajukan keberatan sebelum diputuskan.'
    ]
  },
  {
    title: 'Strategi Hilirisasi dan Komersialisasi KI Kampus',
    meta: 'Modul 4 · 14 menit baca',
    points: [
      'Hilirisasi KI menjembatani hasil riset akademik menuju pemanfaatan nyata di masyarakat atau industri, melalui lisensi, kerja sama produksi, atau spin-off.',
      'Kesiapan KI untuk dihilirisasi umumnya dinilai dari tingkat kematangan teknologi (TRL) dan kejelasan status hukum KI.',
      'Unit seperti P2KI menjembatani inventor dengan mitra potensial, memverifikasi kesiapan KI, dan mengawal negosiasi.'
    ]
  },
  {
    title: 'Pembagian Manfaat Ekonomi KI di Perguruan Tinggi',
    meta: 'Modul 5 · 10 menit baca',
    points: [
      'Manfaat ekonomi dari komersialisasi KI (royalti, biaya lisensi, dsb) umumnya dibagi antara inventor, fakultas/unit asal, dan institusi sesuai kebijakan internal kampus.',
      'Kerangka pembagian ini penting disusun sejak awal agar tidak menimbulkan sengketa saat KI mulai menghasilkan manfaat ekonomi.',
      'Untuk KI Komunal, skema pembagian manfaat juga perlu melibatkan komunitas/masyarakat asal pengetahuan atau ekspresi budaya terkait.'
    ]
  }
];

router.get('/pelajari-ki', (req, res) => {
  res.render('pelajari-ki', { modules: MODULES, aiEnabled: !!process.env.ANTHROPIC_API_KEY });
});

router.post('/api/ai-tanya', async (req, res) => {
  const question = (req.body.question || '').trim();
  if (!question) return res.status(400).json({ error: 'Pertanyaan kosong.' });

  const { jawaban, sumber } = await askLearningAI(question);
  try {
    await pool.query(
      'INSERT INTO ai_qna_log (pertanyaan, jawaban, sumber) VALUES ($1,$2,$3)',
      [question, jawaban, sumber]
    );
  } catch (err) {
    console.error('Gagal mencatat log AI Q&A:', err.message);
  }
  res.json({ jawaban, sumber });
});

module.exports = router;
