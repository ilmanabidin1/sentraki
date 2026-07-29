const express = require('express');
const router = express.Router();
const pool = require('../db');
const { autoReplyConsult } = require('../ai');

router.get('/konsultasi', async (req, res, next) => {
  try {
    const sessionId = req.sessionID;
    const result = await pool.query(
      'SELECT * FROM consult_messages WHERE session_id = $1 ORDER BY id ASC',
      [sessionId]
    );
    res.render('konsultasi', { messages: result.rows });
  } catch (err) { next(err); }
});

router.post('/api/konsultasi', async (req, res) => {
  const message = (req.body.message || '').trim();
  if (!message) return res.status(400).json({ error: 'Pesan kosong.' });
  const sessionId = req.sessionID;

  try {
    await pool.query(
      "INSERT INTO consult_messages (session_id, sender, message) VALUES ($1,'user',$2)",
      [sessionId, message]
    );
    const reply = await autoReplyConsult(message);
    await pool.query(
      "INSERT INTO consult_messages (session_id, sender, message) VALUES ($1,'admin',$2)",
      [sessionId, reply]
    );
    res.json({ reply });
  } catch (err) {
    console.error('Gagal menyimpan pesan konsultasi:', err.message);
    res.status(500).json({ error: 'Gagal memproses pesan.' });
  }
});

module.exports = router;
