const express = require('express');
const router = express.Router();
const pool = require('../db');

const JENIS_LIST = ['Paten', 'Hak Cipta', 'Merek', 'Desain Industri', 'KI Komunal'];
const PAGE_SIZE = 12;

function toArray(v) {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v : [v];
}

router.get('/direktori', async (req, res, next) => {
  try {
    const fakultasAllRes = await pool.query(
      `SELECT fakultas, COUNT(*)::int AS n FROM ki_items GROUP BY fakultas ORDER BY n DESC`
    );
    const fakultasList = fakultasAllRes.rows.map(r => r.fakultas);

    const q = (req.query.q || '').trim();
    const jenis = toArray(req.query.jenis) || JENIS_LIST;
    const fakultas = toArray(req.query.fakultas) || fakultasList;
    const status = toArray(req.query.status) || ['proses', 'granted'];
    const sort = req.query.sort || 'terbaru';
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const conditions = ['jenis = ANY($1)', 'fakultas = ANY($2)', 'status = ANY($3)', 'tayang = true'];
    const params = [jenis, fakultas, status];
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(judul ILIKE $${params.length} OR inventor ILIKE $${params.length})`);
    }

    let orderBy = 'id DESC';
    if (sort === 'az') orderBy = 'judul ASC';
    if (sort === 'za') orderBy = 'judul DESC';

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS n FROM ki_items WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = countRes.rows[0].n;
    const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

    params.push(PAGE_SIZE, (page - 1) * PAGE_SIZE);
    const itemsRes = await pool.query(
      `SELECT * FROM ki_items WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const baseParams = new URLSearchParams();
    if (q) baseParams.set('q', q);
    jenis.forEach(j => baseParams.append('jenis', j));
    fakultas.forEach(f => baseParams.append('fakultas', f));
    status.forEach(s => baseParams.append('status', s));
    if (sort !== 'terbaru') baseParams.set('sort', sort);

    res.render('direktori', {
      items: itemsRes.rows,
      total,
      totalPages,
      page,
      sort,
      jenisList: JENIS_LIST,
      fakultasList,
      query: { q, jenis, fakultas, status },
      baseQueryString: baseParams.toString()
    });
  } catch (err) { next(err); }
});

router.get('/direktori/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM ki_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('KI tidak ditemukan.');
    res.render('detail', { item: result.rows[0] });
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
    const { nama, institusi, email, jenis_kebutuhan, pesan, ki_item_id } = req.body;
    if (!nama) {
      return res.render('ajukan-minat', { kiItem: null, success: false, errorMsg: 'Nama lengkap wajib diisi.' });
    }
    await pool.query(
      `INSERT INTO interest_requests (ki_item_id, nama, institusi, email, jenis_kebutuhan, pesan)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [ki_item_id || null, nama, institusi || null, email || null, jenis_kebutuhan || null, pesan || null]
    );
    res.render('ajukan-minat', { kiItem: null, success: true });
  } catch (err) { next(err); }
});

router.get('/daftarkan-ki', (req, res) => {
  res.render('daftarkan-ki', { success: false });
});

router.post('/daftarkan-ki', async (req, res, next) => {
  try {
    const { nama, fakultas, judul, jenis, deskripsi } = req.body;
    if (!nama || !fakultas || !judul || !jenis) {
      return res.render('daftarkan-ki', { success: false, errorMsg: 'Mohon lengkapi seluruh kolom wajib.' });
    }
    await pool.query(
      `INSERT INTO ki_items (jenis, judul, inventor, fakultas, status_raw, status, deskripsi, tayang)
       VALUES ($1,$2,$3,$4,'Menunggu Tinjauan','proses',$5,false)`,
      [jenis, judul, nama, fakultas, deskripsi || null]
    );
    res.render('daftarkan-ki', { success: true });
  } catch (err) { next(err); }
});

module.exports = router;
