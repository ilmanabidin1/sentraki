const express = require('express');
const router = express.Router();
const { askLearningAI, streamLearningAI, normalizeChatHistory } = require('../ai');
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
  delete req.session.aiHistory;
  res.json({ enabled:!!process.env.OPENROUTER_API_KEY?.trim(), messages:[] });
});

router.post('/api/ai-tanya', chatRateLimit, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const question = validateChatMessage(req.body.question);
  if (!question) return res.status(400).json({ error: 'Pertanyaan kosong.' });
  delete req.session.aiHistory;
  const history = normalizeChatHistory(req.body.history);
  const referensi = moduleReferences(question);
  if (req.get('Accept')?.includes('text/event-stream')) {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    res.on('close', cancel);
    let heartbeat;
    const send = data => { if (!res.destroyed) res.write(`data: ${JSON.stringify(data)}\n\n`); };
    try {
      const result = await streamLearningAI(question, history, { signal:controller.signal,
        onStart() {
          res.set({ 'Content-Type':'text/event-stream; charset=utf-8', 'Cache-Control':'no-store, no-transform', 'X-Accel-Buffering':'no' });
          res.flushHeaders();
          heartbeat = setInterval(() => { if (!res.destroyed) res.write(': keep-alive\n\n'); }, 10000);
        },
        onDelta: text => send({ type:'delta', text })
      });
      send({ type:'done', sumber:result.sumber, referensi });
    } catch (error) {
      if (!controller.signal.aborted && !res.destroyed) {
        const message = error.status ? error.message : 'Jawaban belum dapat diproses. Silakan coba lagi.';
        if (res.headersSent) send({ type:'error', message });
        else res.status(error.status || 500).json({ error:message });
      }
    } finally {
      clearInterval(heartbeat); res.removeListener('close', cancel); if (!res.writableEnded) res.end();
    }
    return;
  }
  try {
    const { jawaban, sumber } = await askLearningAI(question, history);
    res.json({ jawaban, sumber, referensi });
  } catch (error) {
    res.status(error.status || 500).json({ error:error.status ? error.message : 'Pesan belum dapat diproses. Silakan coba lagi.' });
  }
});

module.exports = router;
