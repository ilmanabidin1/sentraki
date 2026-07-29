const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

router.get('/admin/login', (req, res) => {
  res.render('admin-login', {});
});

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === validUser && password === validPass) {
    req.session.isAdmin = true;
    req.session.adminUsername = username;
    return res.redirect('/admin/dashboard');
  }
  res.render('admin-login', { errorMsg: 'Username atau password salah.' });
});

router.get('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.get('/admin/dashboard', requireAdmin, async (req, res, next) => {
  try {
    const totalKI = (await pool.query('SELECT COUNT(*)::int AS n FROM ki_items')).rows[0].n;
    const pendingReview = (await pool.query(`SELECT COUNT(*)::int AS n FROM ki_items WHERE tayang = false`)).rows[0].n;
    const interestCount = (await pool.query('SELECT COUNT(*)::int AS n FROM interest_requests')).rows[0].n;
    const challengeActive = (await pool.query(`SELECT COUNT(*)::int AS n FROM challenges WHERE status IN ('terbuka','segera')`)).rows[0].n;

    const challenges = (await pool.query(
      `SELECT c.*, COALESCE(s.cnt, 0) AS solusi_count
       FROM challenges c
       LEFT JOIN (SELECT challenge_id, COUNT(*) AS cnt FROM solutions GROUP BY challenge_id) s
       ON s.challenge_id = c.id
       ORDER BY c.id DESC LIMIT 10`
    )).rows;

    const interests = (await pool.query(
      `SELECT ir.*, ki.judul
       FROM interest_requests ir
       LEFT JOIN ki_items ki ON ki.id = ir.ki_item_id
       ORDER BY ir.id DESC LIMIT 10`
    )).rows;

    const pendingKI = (await pool.query(
      `SELECT * FROM ki_items WHERE tayang = false ORDER BY id DESC LIMIT 10`
    )).rows;

    res.render('admin-dashboard', {
      username: req.session.adminUsername,
      kpi: { totalKI, pendingReview, interestCount, challengeActive },
      challenges,
      interests,
      pendingKI
    });
  } catch (err) { next(err); }
});

module.exports = router;
