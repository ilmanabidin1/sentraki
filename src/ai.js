// Modul jawaban AI untuk tab "Pelajari KI" dan "Konsultasi".
// Jika ANTHROPIC_API_KEY diset di environment, akan memakai model Claude sungguhan.
// Jika tidak, jatuh ke jawaban rule-based (pencocokan kata kunci) supaya tetap berfungsi tanpa API key.

const MODULE_CONTEXT = `
Kamu adalah asisten belajar Kekayaan Intelektual (KI) untuk P2KI UNISBA. Jawab singkat (maks 4 kalimat),
akurat, dan dalam Bahasa Indonesia, berdasarkan pengetahuan umum hukum KI di Indonesia (paten, paten sederhana,
hak cipta, merek, desain industri, KI komunal/indikasi geografis, alur pendaftaran di DJKI, dan pembagian
manfaat ekonomi di perguruan tinggi). Jika pertanyaan di luar topik KI, arahkan pengguna untuk bertanya ke
tab Konsultasi agar dijawab admin P2KI secara langsung.
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
  { kw: ['status', 'pendaftaran'], a: 'Untuk cek status pendaftaran, mohon sertakan judul KI atau nomor permohonan Anda ya, nanti kami bantu telusuri langsung di sistem P2KI.' },
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
  const aiAnswer = await callAnthropic(MODULE_CONTEXT, question);
  if (aiAnswer) return { jawaban: aiAnswer, sumber: 'anthropic_api' };
  const fallback = 'Pertanyaan ini menarik. Untuk jawaban yang lebih pasti sesuai kasus Anda, saya sarankan lanjutkan lewat tab Konsultasi agar dijawab langsung oleh Admin P2KI.';
  return { jawaban: ruleBasedAnswer(question, RULE_ANSWERS, fallback), sumber: 'rule_based' };
}

async function autoReplyConsult(message) {
  const aiAnswer = await callAnthropic(
    'Kamu adalah admin P2KI UNISBA yang membalas konsultasi soal KI, pendaftaran, atau kerja sama industri. Balas singkat, ramah, dan profesional dalam 1-3 kalimat Bahasa Indonesia.',
    message
  );
  if (aiAnswer) return aiAnswer;
  const fallback = 'Terima kasih, pesan Anda sudah kami terima. Admin P2KI akan segera membalas dengan informasi lebih lanjut.';
  return ruleBasedAnswer(message, RULE_CONSULT, fallback);
}

module.exports = { askLearningAI, autoReplyConsult };
