// middleware/auth.js

const jwt = require('jsonwebtoken');
const LOGIN_URL = '/auth/login';

exports.protect = (req, res, next) => {
  // Prevent browser from caching protected pages
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const token = req.cookies.token;

  if (!token) {
    // No token, redirect to login
    return res.redirect(LOGIN_URL);
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user info in request
    req.user = decoded;

    // Proceed to next middleware/route
    next();

  } catch (err) {
    console.error('JWT verify error:', err);

    // Clear invalid token and redirect to login
    res.clearCookie('token');
    return res.redirect(LOGIN_URL);
  }
};

// Admin-only middleware
exports.admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Access denied");
  }
  next();
};
