const crypto = require('crypto');

// CSRF sederhana berbasis session: token per-session, divalidasi pada setiap POST.
function csrf(req, res, next) {
  if (!req.session) return next();
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

function verifyCsrf(req, res, next) {
  const token = (req.body && req.body._csrf) || req.get('x-csrf-token');
  if (req.session && token && token === req.session.csrfToken) {
    return next();
  }
  return res.status(403).send('Permintaan tidak valid (CSRF token salah atau kedaluwarsa). Muat ulang halaman dan coba lagi.');
}

module.exports = { csrf, verifyCsrf };
