const express = require('express');
const router = express.Router();
const pool = require('../db');


// Tipe pencarian di portal PDKI (pdki-indonesia.dgip.go.id) berbeda per jenis KI,
// disimpulkan dari pola link resmi yang valid pada data yang sudah ada.
const PDKI_SEARCH_TYPE = {
  'Paten': 'patent',
  'Hak Cipta': 'copyright',
  'Desain Industri': 'di',
  'Merek': 'trademark'
};

function buildPdkiSearchUrl(item) {
  // Cari pakai nomor permohonan/registrasi resmi kalau ada (lebih presisi daripada judul),
  // baru jatuh ke judul KI kalau nomornya tidak tersedia.
  const keyword = item.no_reg || item.no_permohonan || item.judul;
  const params = new URLSearchParams({ keyword });
  const type = PDKI_SEARCH_TYPE[item.jenis];
  if (type) params.set('type', type);
  return `https://pdki-indonesia.dgip.go.id/search?${params.toString()}`;
}

const { directoryData } = require('../directory-filters');

router.get('/direktori', async (req, res, next) => {
  try {
    res.render('direktori', await directoryData(pool, req.query));
  } catch (err) { next(err); }
});

router.get('/status-paten', async (req, res, next) => {
  try { res.render('status-paten', await directoryData(pool, req.query)); } catch (err) { next(err); }
});

router.get('/direktori/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM ki_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('KI tidak ditemukan.');
    const item = result.rows[0];
    res.render('detail', { item, pdkiSearchUrl: buildPdkiSearchUrl(item) });
  } catch (err) { next(err); }
});

router.get('/ajukan-minat', async (req, res, next) => {
  try {
    let kiItem = null;
    if (req.query.ki) {
      const r = await pool.query('SELECT * FROM ki_items WHERE id = $1', [req.query.ki]);
      kiItem = r.rows[0] || null;
    }
    res.render('ajukan-minat', { kiItem, success: false });
  } catch (err) { next(err); }
});

router.post('/ajukan-minat', async (req, res, next) => {
  try {
    const { validateAjukanMinat } = require('../validate');
    const { errors, values } = validateAjukanMinat(req.body);
    if (errors.length > 0) {
      return res.render('ajukan-minat', { kiItem: null, success: false, errorMsg: errors.join(' ') });
    }
    await pool.query(
      `INSERT INTO interest_requests (ki_item_id, nama, institusi, email, jenis_kebutuhan, pesan)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [values.ki_item_id, values.nama, values.institusi, values.email, values.jenis_kebutuhan, values.pesan]
    );
    res.render('ajukan-minat', { kiItem: null, success: true });
  } catch (err) { next(err); }
});

router.get('/daftarkan-ki', (req, res) => {
  res.render('daftarkan-ki', { success: false });
});

router.post('/daftarkan-ki', async (req, res, next) => {
  try {
    const { validateDaftarkanKI } = require('../validate');
    const { errors, values } = validateDaftarkanKI(req.body);
    if (errors.length > 0) {
      return res.render('daftarkan-ki', { success: false, errorMsg: errors.join(' ') });
    }
    await pool.query(
      `INSERT INTO ki_items (jenis, judul, inventor, fakultas, status_raw, status, deskripsi, tayang)
       VALUES ($1,$2,$3,$4,'Menunggu Tinjauan','proses',$5,false)`,
      [values.jenis, values.judul, values.nama, values.fakultas, values.deskripsi]
    );
    res.render('daftarkan-ki', { success: true });
  } catch (err) { next(err); }
});

module.exports = router;
