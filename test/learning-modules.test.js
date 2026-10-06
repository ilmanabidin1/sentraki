const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const ejs = require('ejs');
const { MODULES, catalogueData, moduleReferences } = require('../src/learning-modules');
const { askLearningAI } = require('../src/ai');

test('EKII catalogue retains all 13 unique official documents and known editions', () => {
  assert.equal(MODULES.length, 13);
  assert.equal(new Set(MODULES.map(m => m.id)).size, 13);
  assert.equal(new Set(MODULES.map(m => m.pdfUrl)).size, 13);
  MODULES.forEach(m => assert.match(m.pdfUrl, /^https:\/\/ekii\.dgip\.go\.id\/storage\/modulajar\/file_name_\d+\.pdf$/));
  assert.equal(MODULES.find(m => m.id === 'paten-dasar-2020').edition, 2020);
  assert.equal(MODULES.find(m => m.id === 'pemeliharaan-paten').edition, null);
});

test('combined learning filters preserve query, work across shared topics and handle malformed inputs', () => {
  const data = catalogueData({ topik: 'merek', tingkat: 'Lanjut', q: '2020' });
  assert.deepEqual(data.modules.map(m => m.id), ['merek-ig-lanjut-2020']);
  assert.equal(data.topicCounts.merek, 1);
  assert.equal(data.topicCounts['indikasi-geografis'], 1);
  assert.equal(data.topicCounts.paten, 0);
  assert.equal(data.contextualTotal, 1);
  const url = new URL(data.filterUrl({ topik: 'indikasi-geografis' }), 'https://example.test');
  assert.equal(url.searchParams.get('q'), '2020');
  assert.equal(url.searchParams.get('tingkat'), 'Lanjut');
  assert.equal(url.searchParams.get('topik'), 'indikasi-geografis');
  assert.equal(catalogueData({ q: 'tidakadasamasekali' }).modules.length, 0);
  assert.equal(catalogueData({ q: ['paten'], topik: '__proto__', tingkat: 'tidak-valid' }).modules.length, 13);
});

test('library and details escape inputs, expose official PDF links, and avoid initial PDF embeds', async () => {
  const html = await ejs.renderFile(path.join(__dirname, '../views/pelajari-ki.ejs'), { ...catalogueData({ q: '<script>uji</script>' }), aiEnabled: false, csrfToken: '' });
  assert.ok(html.includes('&lt;script&gt;uji&lt;/script&gt;'));
  assert.ok(!html.includes('<script>uji</script>'));
  assert.match(html, /Materi belum ditemukan/);
  const module = MODULES[0];
  const detail = await ejs.renderFile(path.join(__dirname, '../views/modul-ki.ejs'), { module, related: [], catalogueUrl: 'https://ekii.dgip.go.id/sumber-daya/modul-ajar', csrfToken: '' });
  assert.ok(detail.includes(module.pdfUrl));
  assert.match(detail, /Buka PDF resmi/);
  assert.ok(!/<iframe|<object|<embed/.test(detail));
  assert.match(detail, /Tidak dicantumkan pada judul katalog/);
});

test('module requests use verified catalogue references without claiming to read PDF content', async () => {
  const refs = moduleReferences('Modul apa untuk belajar paten?');
  assert.equal(refs.length, 3);
  assert.ok(refs.every(ref => MODULES.find(m => m.id === ref.id).topics.includes('paten')));
  const key = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  try {
    const answer = await askLearningAI('Modul apa untuk belajar paten?');
    assert.equal(answer.sumber, 'ekii_catalogue');
    assert.match(answer.jawaban, /PDF aslinya/);
  } finally { if (key !== undefined) process.env.OPENROUTER_API_KEY = key; }
});
