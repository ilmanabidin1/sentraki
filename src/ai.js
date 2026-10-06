// Shared P2KI assistant: server-only OpenRouter integration.
const { MODULES, moduleReferences } = require('./learning-modules');
const OPENROUTER_MODEL = 'deepseek/deepseek-v4.1-flash';
const { readSSE } = require('../public/js/event-stream');

function normalizeChatHistory(history) {
  return Array.isArray(history) ? history.filter(m => m && ['user','assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim()).slice(-12).map(m => ({ role:m.role, content:m.content.slice(0, 1800) })) : [];
}

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

async function callOpenRouter(systemPrompt, userMessage, history = []) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return null;
  const turns = normalizeChatHistory(history);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      signal: AbortSignal.timeout(25000),
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${apiKey}` },
      body:JSON.stringify({
        model:OPENROUTER_MODEL, max_tokens:900, temperature:0.3,
        reasoning:{ enabled:false },
        messages:[{ role:'system', content:systemPrompt }, ...turns, { role:'user', content:userMessage }]
      })
    });
    if (!response.ok) {
      console.error(`OpenRouter request failed (HTTP ${response.status})`);
      const error = new Error(response.status === 429 ? 'Asisten AI sedang sibuk. Tunggu sebentar lalu coba lagi.' : 'Asisten AI belum dapat terhubung. Coba lagi nanti atau hubungi sekretariat P2KI.');
      error.status = response.status === 429 ? 429 : 503;
      throw error;
    }
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) throw new Error('Empty response');
    return answer.trim().slice(0, 12000);
  } catch (error) {
    if (error.status) throw error;
    const unavailable = new Error('Jawaban AI belum tersedia. Periksa koneksi dan coba lagi.');
    unavailable.status = 503;
    throw unavailable;
  }
}

async function askLearningAI(question, history = []) {
  const aiAnswer = await callOpenRouter(MODULE_CONTEXT, question, history);
  if (aiAnswer) return { jawaban: aiAnswer, sumber: 'openrouter_api' };
  if (/\b(modul|materi|referensi|bacaan|belajar)\b/i.test(question) && moduleReferences(question).length) {
    return { jawaban: 'Untuk topik ini, tersedia bacaan resmi dalam katalog EKII–DJKI. Pilih modul rujukan di bawah untuk melihat informasi materi dan membuka PDF aslinya.', sumber: 'ekii_catalogue' };
  }
  const fallback = 'Panduan otomatis belum mencakup pertanyaan ini. Untuk meninjau kasus Anda, hubungi sekretariat P2KI melalui kontak pada bagian bawah halaman.';
  return { jawaban: ruleBasedAnswer(question, RULE_ANSWERS, fallback), sumber: 'rule_based' };
}

async function autoReplyConsult(message) {
  const aiAnswer = await callOpenRouter(
    'Kamu adalah asisten otomatis panduan KI UNISBA, bukan staf manusia. Jangan menjanjikan pengecekan status, tindak lanjut, integrasi, atau layanan yang tidak kamu akses. Balas singkat dan profesional dalam Bahasa Indonesia.',
    message
  );
  if (aiAnswer) return aiAnswer;
  const fallback = 'Ini balasan otomatis. Untuk pembahasan kasus yang belum tersedia dalam panduan, hubungi sekretariat P2KI melalui kontak pada bagian bawah halaman.';
  return ruleBasedAnswer(message, RULE_CONSULT, fallback);
}

async function streamLearningAI(question, history, { signal, onStart, onDelta }) {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    const result = await askLearningAI(question, history);
    onStart(); onDelta(result.jawaban);
    return result;
  }
  let answer = '', completed = false;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method:'POST', signal:AbortSignal.any([signal, AbortSignal.timeout(60000)]),
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${key}` },
      body:JSON.stringify({ model:OPENROUTER_MODEL, stream:true, max_tokens:900, temperature:0.3, reasoning:{ enabled:false },
        messages:[{ role:'system', content:MODULE_CONTEXT }, ...normalizeChatHistory(history), { role:'user', content:question }] })
    });
    if (!response.ok) {
      const error = new Error(response.status === 429 ? 'Asisten AI sedang sibuk. Coba lagi sebentar.' : 'Asisten AI belum dapat terhubung. Coba lagi nanti.');
      error.status = response.status === 429 ? 429 : 503;
      throw error;
    }
    onStart();
    for await (const event of readSSE(response.body)) {
      if (event.data === '[DONE]') { completed = true; break; }
      const chunk = JSON.parse(event.data);
      if (chunk.error || chunk.choices?.some(choice => choice.finish_reason === 'error')) throw new Error('Provider stream failed');
      const text = chunk.choices?.[0]?.delta?.content;
      if (typeof text === 'string' && text) {
        answer += text;
        if (answer.length > 12000) throw new Error('Response too long');
        onDelta(text);
      }
    }
    if (!completed || !answer.trim()) throw new Error('Incomplete stream');
    return { jawaban:answer, sumber:'openrouter_api' };
  } catch (error) {
    if (signal.aborted) throw error;
    if (error.status) throw error;
    const interrupted = new Error('Jawaban AI terputus atau belum selesai. Silakan coba lagi.');
    interrupted.status = 503;
    throw interrupted;
  }
}

module.exports = { askLearningAI, autoReplyConsult, callOpenRouter, streamLearningAI, normalizeChatHistory, OPENROUTER_MODEL };
