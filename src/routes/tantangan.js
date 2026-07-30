const express = require('express');
const router = express.Router();
const pool = require('../db');

const BIDANG_LIST = ['Teknologi & Manufaktur', 'Kesehatan & Farmasi', 'Ekonomi Syariah', 'Pertanian & Lingkungan'];

function toArray(v) {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v : [v];
}

function fmtDeadline(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

router.get('/tantangan-industri', async (req, res, next) => {
  try {
    const totalAllRes = await pool.query('SELECT COUNT(*)::int AS n FROM challenges');
    const totalAll = totalAllRes.rows[0].n;

    const q = (req.query.q || '').trim();
    const bidang = toArray(req.query.bidang) || BIDANG_LIST;
    const status = toArray(req.query.status) || ['terbuka', 'segera'];
    const sort = req.query.sort || 'deadline';

    const conditions = ['bidang = ANY($1)', 'status = ANY($2)'];
    const params = [bidang, status];
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(judul ILIKE $${params.length} OR perusahaan ILIKE $${params.length} OR deskripsi ILIKE $${params.length})`);
    }

    let orderBy = 'deadline ASC';
    if (sort === 'terbaru') orderBy = 'id DESC';

    const itemsRes = await pool.query(
      `SELECT * FROM challenges WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`,
      params
    );

    const items = itemsRes.rows.map(c => ({ ...c, deadline_fmt: fmtDeadline(c.deadline) }));

    const qsParams = new URLSearchParams();
    if (q) qsParams.set('q', q);
    bidang.forEach(b => qsParams.append('bidang', b));
    status.forEach(s => qsParams.append('status', s));

    res.render('tantangan-industri', {
      items,
      totalAll,
      bidangList: BIDANG_LIST,
      query: { q, bidang, status },
      sort,
      qs: qsParams.toString()
    });
  } catch (err) { next(err); }
});

router.get('/tantangan-industri/:kode', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM challenges WHERE kode = $1', [req.params.kode]);
    if (result.rows.length === 0) return res.status(404).send('Tantangan tidak ditemukan.');
    const item = { ...result.rows[0], deadline_fmt: fmtDeadline(result.rows[0].deadline) };
    res.render('tantangan-detail', { item });
  } catch (err) { next(err); }
});

router.get('/ajukan-solusi', async (req, res, next) => {
  try {
    let challengeItem = null;
    if (req.query.challenge) {
      const r = await pool.query('SELECT * FROM challenges WHERE id = $1', [req.query.challenge]);
      challengeItem = r.rows[0] || null;
    }
    res.render('ajukan-solusi', { challengeItem, success: false });
  } catch (err) { next(err); }
});

router.post('/ajukan-solusi', async (req, res, next) => {
  try {
    const { nama_peneliti, fakultas, ringkasan, ki_terkait, challenge_id } = req.body;
    if (!nama_peneliti || !ringkasan) {
      return res.render('ajukan-solusi', { challengeItem: null, success: false, errorMsg: 'Nama peneliti dan ringkasan solusi wajib diisi.' });
    }
    await pool.query(
      `INSERT INTO solutions (challenge_id, nama_peneliti, fakultas, ringkasan, ki_terkait)
       VALUES ($1,$2,$3,$4,$5)`,
      [challenge_id || null, nama_peneliti, fakultas || null, ringkasan, ki_terkait || null]
    );
    res.render('ajukan-solusi', { challengeItem: null, success: true });
  } catch (err) { next(err); }
});

router.get('/pasang-kebutuhan', (req, res) => {
  res.render('pasang-kebutuhan', { success: false });
});

router.post('/pasang-kebutuhan', async (req, res, next) => {
  try {
    const { perusahaan, kontak, judul, bidang, deskripsi, kebutuhan_spesifik, deadline, skema } = req.body;
    if (!perusahaan || !judul || !deskripsi) {
      return res.render('pasang-kebutuhan', { success: false, errorMsg: 'Mohon lengkapi kolom wajib (perusahaan, judul, deskripsi).' });
    }
    const countRes = await pool.query('SELECT COUNT(*)::int AS n FROM challenges');
    const kode = `TI-${new Date().getFullYear()}-${String(countRes.rows[0].n + 1).padStart(4, '0')}`;
    await pool.query(
      `INSERT INTO challenges (kode, judul, perusahaan, kontak, bidang, deskripsi, kebutuhan_spesifik, skema, deadline, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'menunggu_tinjauan')`,
      [kode, judul, perusahaan, kontak || null, bidang || null, deskripsi, kebutuhan_spesifik || null, skema || null, deadline || null]
    );
    res.render('pasang-kebutuhan', { success: true });
  } catch (err) { next(err); }
});

module.exports = router;
