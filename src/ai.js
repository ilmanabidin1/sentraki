// Modul jawaban AI untuk tab "Pelajari KI" dan "Konsultasi".
const { MODULES, moduleReferences } = require('./learning-modules');
// Jika ANTHROPIC_API_KEY diset di environment, akan memakai model Claude sungguhan.
// Jika tidak, jatuh ke jawaban rule-based (pencocokan kata kunci) supaya tetap berfungsi tanpa API key.

const MODULE_CONTEXT = `
Kamu adalah asisten belajar Kekayaan Intelektual (KI) untuk P2KI UNISBA. Jawab singkat (maks 4 kalimat),
akurat, dan dalam Bahasa Indonesia, berdasarkan pengetahuan umum hukum KI di Indonesia (paten, paten sederhana,
hak cipta, merek, desain industri, KI komunal/indikasi geografis, alur pendaftaran di DJKI, dan pembagian
manfaat ekonomi di perguruan tinggi). Jika pertanyaan di luar topik KI, arahkan pengguna untuk bertanya ke
sekretariat P2KI melalui kontak resmi. Jangan menjanjikan percakapan langsung dengan admin melalui widget otomatis.
Katalog bacaan resmi EKII-DJKI yang tersedia di situs:
${MODULES.map(m => `- ${m.title}`).join('\n')}
Daftar ini hanya metadata katalog, bukan isi PDF. Jangan mengklaim sudah membaca modul atau bahwa
jawabanmu merupakan kutipan modul. Untuk rincian, sarankan membuka dokumen asli. Jangan mengklaim
ketentuan, biaya, atau prosedur sebagai informasi terbaru tanpa verifikasi.
`.trim();

const RULE_ANSWERS = [
  { kw: ['paten sederhana', 'beda paten', 'perbedaan paten'], a: 'Paten Biasa melindungi invensi yang lebih kompleks dengan masa perlindungan 20 tahun, sedangkan Paten Sederhana untuk invensi yang lebih sederhana dengan masa perlindungan 10 tahun dan proses pemeriksaan yang relatif lebih singkat.' },
  { kw: ['hak cipta', 'berapa lama'], a: 'Hak Cipta timbul otomatis sejak ciptaan diwujudkan. Proses pencatatannya di DJKI bersifat deklaratif (bukan syarat lahirnya hak) dan biasanya selesai dalam hitungan minggu hingga bulan bila dokumen lengkap.' },
  { kw: ['ki komunal', 'komunal'], a: 'KI Komunal mencakup Indikasi Geografis, Pengetahuan Tradisional, dan Ekspresi Budaya Tradisional, yaitu kekayaan yang lahir dan dijaga secara kolektif oleh masyarakat, dengan skema pembagian manfaat ekonomi yang melibatkan komunitas asalnya.' },
  { kw: ['royalti', 'pembagian manfaat', 'manfaat ekonomi'], a: 'Manfaat ekonomi dari KI yang dikomersialkan umumnya dibagi antara inventor, fakultas/unit asal, dan institusi sesuai kebijakan internal kampus. Detail pembagian ini bisa dilihat di halaman Unduhan pada dokumen Kerangka Pembagian Manfaat Ekonomi.' },
  { kw: ['desain industri'], a: 'Desain Industri melindungi bentuk, konfigurasi, atau komposisi garis/warna suatu produk yang memberi kesan estetis dan dapat diproduksi berulang. Masa perlindungannya 10 tahun sejak tanggal penerimaan.' },
  { kw: ['merek'], a: 'Merek melindungi tanda pembeda barang/jasa, terdiri dari Merek Dagang dan Merek Jasa. Masa perlindungan 10 tahun dan dapat diperpanjang setiap 10 tahun selama digunakan.' },
  { kw: ['prosedur', 'alur', 'cara daftar', 'cara mendaftarkan'], a: 'Secara umum alurnya: penelusuran kebaruan, penyusunan dokumen permohonan, pengajuan ke DJKI, pemeriksaan formalitas, lalu pemeriksaan substantif (khusus paten dan merek) sebelum diputuskan granted atau ditolak.' }
];

const RULE_CONSULT = [
  { kw: ['status', 'pendaftaran'], a: 'Lihat halaman Status Paten atau cari judul/nomor permohonan pada Direktori KI. Panduan otomatis ini tidak mengakses status terbaru DJKI. Untuk status resmi, gunakan tautan PDKI pada detail KI.' },
  { kw: ['kerja sama', 'industri'], a: 'Baik, untuk kerja sama dengan industri kami arahkan lewat tab Tantangan Industri atau bisa juga ajukan minat lewat halaman Direktori KI. Ada KI atau bidang tertentu yang ingin dijajaki?' },
  { kw: ['manfaat ekonomi', 'royalti', 'bagi hasil'], a: 'Untuk pembagian manfaat ekonomi, panduan lengkapnya ada di halaman Unduhan pada dokumen Kerangka Pembagian Manfaat Ekonomi. Ada bagian spesifik yang ingin didiskusikan lebih lanjut?' }
];

function ruleBasedAnswer(question, bank, fallback) {
  const q = question.toLowerCase();
  const match = bank.find(item => item.kw.some(k => q.includes(k)));
  return match ? match.a : fallback;
}

async function callAnthropic(systemPrompt, userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      signal: AbortSignal.timeout(20000),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    const textBlock = (data.content || []).find(b => b.type === 'text');
    return textBlock ? textBlock.text.trim() : null;
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    return null;
  }
}

async function askLearningAI(question) {
  if (/\b(modul|materi|referensi|bacaan|belajar)\b/i.test(question) && moduleReferences(question).length) {
    return { jawaban: 'Untuk topik ini, tersedia bacaan resmi dalam katalog EKII–DJKI. Pilih modul rujukan di bawah untuk melihat informasi materi dan membuka PDF aslinya.', sumber: 'ekii_catalogue' };
  }
  const aiAnswer = await callAnthropic(MODULE_CONTEXT, question);
  if (aiAnswer) return { jawaban: aiAnswer, sumber: 'anthropic_api' };
  const fallback = 'Panduan otomatis belum mencakup pertanyaan ini. Untuk meninjau kasus Anda, hubungi sekretariat P2KI melalui kontak pada bagian bawah halaman.';
  return { jawaban: ruleBasedAnswer(question, RULE_ANSWERS, fallback), sumber: 'rule_based' };
}

async function autoReplyConsult(message) {
  const aiAnswer = await callAnthropic(
    'Kamu adalah asisten otomatis panduan KI UNISBA, bukan staf manusia. Jangan menjanjikan pengecekan status, tindak lanjut, integrasi, atau layanan yang tidak kamu akses. Balas singkat dan profesional dalam Bahasa Indonesia.',
    message
  );
  if (aiAnswer) return aiAnswer;
  const fallback = 'Ini balasan otomatis. Untuk pembahasan kasus yang belum tersedia dalam panduan, hubungi sekretariat P2KI melalui kontak pada bagian bawah halaman.';
  return ruleBasedAnswer(message, RULE_CONSULT, fallback);
}

module.exports = { askLearningAI, autoReplyConsult };
