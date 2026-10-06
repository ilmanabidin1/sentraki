const windows = new Map();
function chatRateLimit(req, res, next) {
  const now = Date.now(), key = req.sessionID;
  const recent = (windows.get(key) || []).filter(time => time > now - 60000);
  if (recent.length >= 12) {
    res.set('Retry-After', '60');
    return res.status(429).json({ error:'Terlalu banyak pesan. Tunggu satu menit sebelum mencoba lagi.' });
  }
  recent.push(now); windows.set(key, recent);
  if (windows.size > 1000) {
    for (const [id, times] of windows) if (times.at(-1) <= now - 60000) windows.delete(id);
    if (windows.size > 1000) windows.delete(windows.keys().next().value);
  }
  next();
}
module.exports = { chatRateLimit };
