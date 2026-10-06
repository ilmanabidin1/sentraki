const express = require('express');
const router = express.Router();
const pool = require('../db');
const { askLearningAI } = require('../ai');
const { validateChatMessage } = require('../validate');
const { chatRateLimit } = require('../middleware/chat-rate-limit');

const { catalogueData, MODULES, moduleReferences, CATALOGUE_URL } = require('../learning-modules');

router.get('/pelajari-ki', (req, res) => {
  res.render('pelajari-ki', catalogueData(req.query));
});

router.get('/pelajari-ki/:id', (req, res) => {
  const module = MODULES.find(m => m.id === req.params.id);
  if (!module) return res.status(404).render('modul-ki', { module: null, catalogueUrl: CATALOGUE_URL });
  const related = MODULES.filter(m => m.id !== module.id && m.topics.some(t => module.topics.includes(t))).slice(0, 3);
  res.render('modul-ki', { module, related, catalogueUrl: CATALOGUE_URL });
});

router.get('/api/ai-chat', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ enabled:!!process.env.OPENROUTER_API_KEY?.trim(), messages:req.session.aiHistory || [] });
});

router.post('/api/ai-tanya', chatRateLimit, async (req, res) => {
  const question = validateChatMessage(req.body.question);
  if (!question) return res.status(400).json({ error: 'Pertanyaan kosong.' });

  try {
    const history = req.session.aiHistory || [];
    const { jawaban, sumber } = await askLearningAI(question, history);
    const referensi = moduleReferences(question);
    req.session.aiHistory = [...history, { role:'user', content:question }, { role:'assistant', content:jawaban, sumber, referensi }].slice(-12);
    try { await pool.query(
      'INSERT INTO ai_qna_log (pertanyaan, jawaban, sumber) VALUES ($1,$2,$3)',
      [question, jawaban, sumber]
    ); } catch { console.error('AI Q&A log unavailable'); }
    res.json({ jawaban, sumber, referensi });
  } catch (error) {
    res.status(error.status || 500).json({ error:error.status ? error.message : 'Pesan belum dapat diproses. Silakan coba lagi.' });
  }
});

module.exports = router;
