const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.SQLITE_PATH = ':memory:';
const pool = require('../src/db');
const { searchSuggestions } = require('../src/search-suggestions');
const insert = pool.raw.prepare('INSERT INTO ki_items (jenis, judul, inventor, fakultas, status, tahun, tayang, no_permohonan, no_reg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
insert.run('Paten', 'Krim Luka', 'Hendro Yuwono', 'Kedokteran', 'granted', 2022, 1, 'P001', 'IDP001');
insert.run('Paten', 'Bahan untuk krim', 'Peneliti B', 'Farmasi', 'proses', 2025, 1, 'P002', null);
insert.run('Paten', 'Krim belum tayang', 'Hendro Yuwono', 'Farmasi', 'proses', 2026, 0, 'P003', null);
insert.run('Merek', '100%_Unisba', 'Peneliti C', 'Ekonomi', 'granted', 2024, 1, null, 'IDM01');

test('suggestions search published titles, inventors and identifiers and prefer title prefixes', async () => {
  assert.deepEqual((await searchSuggestions(pool, 'krim')).items.map(item => item.judul), ['Krim Luka', 'Bahan untuk krim']);
  assert.equal((await searchSuggestions(pool, 'Hendro')).items.length, 1);
  assert.equal((await searchSuggestions(pool, 'P001')).items[0].judul, 'Krim Luka');
  assert.equal((await searchSuggestions(pool, 'IDM01')).items[0].jenis, 'Merek');
  assert.equal((await searchSuggestions(pool, 'P003')).items.length, 0);
});

test('suggestions treat wildcard characters literally and safely handle malformed or empty input', async () => {
  assert.equal((await searchSuggestions(pool, '%_')).items.length, 1);
  for (const q of ['', ' ', 'a', {}, ['krim'], null, "' OR 1=1 --"]) {
    assert.equal((await searchSuggestions(pool, q)).items.length, 0);
  }
  assert.equal((await searchSuggestions(pool, 'x'.repeat(1000))).q.length, 200);
});

test('suggestions return at most six public records and expose only result metadata', async () => {
  for (let n=0; n<9; n++) insert.run('Hak Cipta', `Modul ${n}`, 'Dosen', 'Hukum', 'granted', 2024, 1, null, null);
  const { items } = await searchSuggestions(pool, 'Modul');
  assert.equal(items.length, 6);
  assert.equal(items[0].judul, 'Modul 8');
  assert.deepEqual(Object.keys(items[0]).sort(), ['id', 'inventor', 'jenis', 'judul', 'status', 'tahun']);
});
