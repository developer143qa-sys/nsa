// middleware/auth.js

const jwt = require('jsonwebtoken');
const LOGIN_URL = '/auth/login';

exports.protect = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect(LOGIN_URL);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // store user info
    next();

  } catch (err) {
    console.error('JWT verify error:', err);
    res.clearCookie('token');      // remove invalid token
    return res.redirect(LOGIN_URL);
  }
};

exports.admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Access denied");
  }
  next();
};
