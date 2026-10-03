const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const ejs = require('ejs');
const validate = require('../src/validate');

test('chat rejects HTTP errors and malformed success responses instead of treating them as delivered', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');
  for (const status of [400, 403, 429, 500, 200]) {
    const context = vm.createContext({
      document: { addEventListener() {}, querySelector() { return null; } },
      AbortController, setTimeout, clearTimeout,
      fetch: async () => ({ ok: status === 200, json: async () => status === 200 ? {} : { error: 'Coba lagi nanti.' } })
    });
    vm.runInContext(source, context);
    await assert.rejects(context.chatRequest('/api/konsultasi', { message: 'uji' }), status === 200 ? /Jawaban belum tersedia/ : /Coba lagi nanti/);
  }
});

test('public forms retain escaped values, selected options, radio choices, and field error links', async () => {
  const samples = [
    ['daftarkan-ki', { nama: '<script>uji</script>', fakultas: 'Teknik', judul: 'Judul & karya', jenis: 'Merek', deskripsi: 'Riset & teknologi' }, { nama: 'Periksa nama' }, {}],
    ['ajukan-minat', { nama: 'Nama & Mitra', email: 'salah', jenis_kebutuhan: 'Investasi', pesan: 'Pesan & minat' }, { email: 'Periksa email' }, { kiItem: { id: 1, judul: 'KI pilihan', inventor: 'Inventor', fakultas: 'Teknik', jenis: 'Paten' } }],
    ['ajukan-solusi', { nama_peneliti: 'Nama & Peneliti', ringkasan: 'Solusi & riset' }, { nama_peneliti: 'Periksa nama' }, { challengeItem: null }],
    ['pasang-kebutuhan', { perusahaan: 'PT & Mitra', bidang: 'Ekonomi Syariah', skema: 'Akuisisi KI', deskripsi: 'Masalah & tujuan' }, { judul: 'Isi judul' }, {}]
  ];
  for (const [name, values, fieldErrors, extra] of samples) {
    const html = await ejs.renderFile(path.join(__dirname, '../views', `${name}.ejs`), { values, fieldErrors, success: false, csrfToken: '', ...extra });
    assert.match(html, /id="formErrors"/);
    assert.match(html, /aria-invalid="true"/);
    assert.match(html, /aria-describedby="[^"]+-error"/);
    assert.ok(!html.includes('<script>uji</script>'));
    for (const value of Object.values(values)) assert.ok(html.includes(ejs.escapeXML(value)), `${name} lost ${value}`);
    if (name === 'daftarkan-ki') assert.match(html, /value="Merek" selected/);
    if (name === 'ajukan-minat') assert.match(html, /value="Investasi" checked/);
    if (name === 'pasang-kebutuhan') assert.match(html, /value="Ekonomi Syariah" selected/);
  }
});

test('industry sectors offered in the form validate and required contact data is checked on the server', () => {
  for (const bidang of ['Teknologi & Manufaktur', 'Kesehatan & Farmasi', 'Ekonomi Syariah', 'Pertanian & Lingkungan']) {
    assert.equal(validate.validatePasangKebutuhan({ perusahaan: 'PT', kontak: 'uji@example.com', judul: 'Riset', deskripsi: 'Kebutuhan', bidang }).errors.length, 0);
  }
  assert.ok(validate.validateAjukanMinat({ nama: 'Nama' }).fieldErrors.email);
  assert.ok(validate.validatePasangKebutuhan({}).fieldErrors.kontak);
});
