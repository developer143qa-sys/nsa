// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Helper to safely pass variables to EJS
function renderWithLocale(req, res, view, extra = {}) {
  res.render(view, {
    locale: req.session.locale || 'en',
    currentUrl: req.originalUrl, // always pass currentUrl
    ...extra
  });
}

// ====================
// Register routes
// ====================
router.get('/register', (req, res) => {
  renderWithLocale(req, res, 'auth/register', { error: null });
});

router.post('/register', authController.register);

// ====================
// Login routes
// ====================
router.get('/login', (req, res) => {
  renderWithLocale(req, res, 'auth/login', { error: null });
});

router.post('/login', authController.login);

// ====================
// Logout
// ====================
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.log('Session destruction error:', err);
    res.clearCookie('token');
    res.redirect('/auth/login');
  });
});

// ====================
// Language switch
// ====================
router.get('/lang/:lang', (req, res) => {
  const lang = req.params.lang;
  if (['en', 'ar'].includes(lang)) {
    req.session.locale = lang;
  }
  const redirectUrl = req.query.redirect || '/auth/login';
  res.redirect(redirectUrl);
});










module.exports = router;
