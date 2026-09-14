const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.SQLITE_PATH = ':memory:';
const pool = require('../src/db');
const { directoryData } = require('../src/directory-filters');
const ejs = require('ejs');
const path = require('path');

const insert = pool.raw.prepare('INSERT INTO ki_items (jenis, judul, inventor, fakultas, status, tahun, tayang, no_permohonan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
insert.run('Paten', 'Alpha', 'Inventor A', 'Teknik', 'granted', 2022, 1, 'P001');
insert.run('Paten', 'Beta', 'Inventor B', 'Teknik', 'proses', 2022, 1, 'P002');
insert.run('Paten', 'Gamma', 'Inventor C', 'Teknik', 'proses', 2023, 1, 'P003');
insert.run('Paten', 'Delta', 'Inventor D', 'Teknik', 'ditolak', null, 1, 'P004');
insert.run('Paten', 'Hidden', 'Inventor E', 'Teknik', 'granted', 2024, 0, 'P005');
insert.run('Hak Cipta', 'Epsilon', 'Inventor F', 'Hukum', 'granted', 2024, 1, 'EC001');
insert.run('Paten', '100% bahan', 'Inventor G', 'Hukum', 'proses', 2021, 1, 'P006');

test('default includes rejected items but excludes unpublished items', async () => {
  const data = await directoryData(pool, {});
  assert.equal(data.total, 6);
  assert.deepEqual(data.patentTotals, { total: 5, granted: 1, proses: 3, ditolak: 1 });
  assert.equal(data.items[0].tahun, 2024);
  assert.equal(data.items.at(-1).tahun, null);
});

test('combined filters, contextual facets, and patent year drill-down agree', async () => {
  const data = await directoryData(pool, { jenis: 'Paten', fakultas: 'Teknik', status: 'proses', tahun: '2022', sort: 'terlama', page: '999' });
  assert.equal(data.total, 1);
  assert.equal(data.items[0].judul, 'Beta');
  assert.equal(data.statusCounts.granted, 1);
  assert.equal(data.tahunCounts['2023'], 1);
  assert.equal(data.page, 1);
  assert.equal(data.patentTotals.total, 4);
  for (const row of data.patentYears) {
    for (const status of ['granted', 'proses', 'ditolak']) {
      const url = new URL(data.filterUrl({ jenis: ['Paten'], status: [status], tahun: [row.tahun] }), 'http://localhost');
      const result = await directoryData(pool, Object.fromEntries(url.searchParams));
      assert.equal(result.total, row[status]);
    }
  }
  assert.match(data.baseQueryString, /tahun=2022/);
  assert.match(data.baseQueryString, /sort=terlama/);
});

test('multi-year, missing year, search, malformed parameters and empty results', async () => {
  assert.equal((await directoryData(pool, { tahun: ['2022', '2023'], status: 'proses' })).total, 2);
  assert.equal((await directoryData(pool, { tahun: 'unknown' })).items[0].judul, 'Delta');
  assert.equal((await directoryData(pool, { q: 'P003' })).items[0].judul, 'Gamma');
  assert.equal((await directoryData(pool, { q: '%' })).total, 1);
  const empty = await directoryData(pool, { q: 'no match', page: '20' });
  assert.equal(empty.total, 0);
  assert.equal(empty.page, 1);
  assert.equal((await directoryData(pool, { q: {}, tahun: {}, jenis: {}, page: {}, sort: {} })).total, 6);
});

test('pagination and sorting retain every selected value', async () => {
  for (let i = 0; i < 14; i++) insert.run('Merek', `Merek ${i}`, 'Tester', 'Ekonomi', 'proses', 2020, 1, null);
  const data = await directoryData(pool, { jenis: ['Merek', 'Paten'], tahun: ['2020', '2022'], status: 'proses', sort: 'az', page: '2' });
  assert.equal(data.total, 15);
  assert.equal(data.items.length, 3);
  assert.equal(data.page, 2);
  const params = new URLSearchParams(data.baseQueryString);
  assert.deepEqual(params.getAll('jenis'), ['Merek', 'Paten']);
  assert.deepEqual(params.getAll('tahun'), ['2020', '2022']);
  const html = await ejs.renderFile(path.join(__dirname, '../views/direktori.ejs'), { ...data, csrfToken: '' });
  assert.match(html, /Pantau status paten/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /name="tahun" value="2022"/);
});
