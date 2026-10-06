const express = require('express');
const router = express.Router();
const pool = require('../db');
const { askLearningAI } = require('../ai');
const { validateChatMessage } = require('../validate');

const { catalogueData, MODULES, moduleReferences, CATALOGUE_URL } = require('../learning-modules');

router.get('/pelajari-ki', (req, res) => {
  res.render('pelajari-ki', { ...catalogueData(req.query), aiEnabled: !!process.env.ANTHROPIC_API_KEY });
});

router.get('/pelajari-ki/:id', (req, res) => {
  const module = MODULES.find(m => m.id === req.params.id);
  if (!module) return res.status(404).render('modul-ki', { module: null, catalogueUrl: CATALOGUE_URL });
  const related = MODULES.filter(m => m.id !== module.id && m.topics.some(t => module.topics.includes(t))).slice(0, 3);
  res.render('modul-ki', { module, related, catalogueUrl: CATALOGUE_URL });
});

router.post('/api/ai-tanya', async (req, res) => {
  const question = validateChatMessage(req.body.question);
  if (!question) return res.status(400).json({ error: 'Pertanyaan kosong.' });

  const { jawaban, sumber } = await askLearningAI(question);
  try {
    await pool.query(
      'INSERT INTO ai_qna_log (pertanyaan, jawaban, sumber) VALUES ($1,$2,$3)',
      [question, jawaban, sumber]
    );
  } catch (err) {
    console.error('Gagal mencatat log AI Q&A:', err.message);
  }
  res.json({ jawaban, sumber, referensi: moduleReferences(question) });
});

module.exports = router;
