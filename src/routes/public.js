const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*)::int AS n FROM ki_items');
    const grantedPatenDIRes = await pool.query(
      `SELECT COUNT(*)::int AS n FROM ki_items WHERE status = 'granted' AND jenis IN ('Paten','Desain Industri')`
    );
    const fakultasRes = await pool.query('SELECT COUNT(DISTINCT fakultas)::int AS n FROM ki_items');
    const featuredRes = await pool.query(
      `SELECT * FROM ki_items WHERE status = 'granted' AND tayang = true ORDER BY id ASC LIMIT 3`
    );

    res.render('beranda', {
      stats: {
        total: totalRes.rows[0].n,
        grantedPatenDI: grantedPatenDIRes.rows[0].n,
        fakultas: fakultasRes.rows[0].n
      },
      featured: featuredRes.rows
    });
  } catch (err) { next(err); }
});

router.get('/kemitraan', (req, res) => {
  res.render('kemitraan');
});

router.get('/tentang', (req, res) => {
  res.render('tentang');
});

router.get('/unduhan', (req, res) => {
  res.render('unduhan');
});

module.exports = router;
