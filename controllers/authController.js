// controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.render('auth/register', { error: 'All fields are required' });
    }

    // Email ya username already ho to error
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('auth/register', { error: 'User already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.redirect('/auth/login');
  } catch (err) {
    console.error('Register error:', err);
    res.render('auth/register', { error: 'Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('auth/login', { error: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { error: 'Invalid credentials' });
    }

    const isMatch = await user.isValidPassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.render('auth/login', { error: 'Invalid credentials' });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // ✅ FIXED COOKIE — ab cookie sure save hogi
    res.cookie('token', token, {
      httpOnly: true,     // JS access block
      secure: false,      // localhost ke liye false — warna cookie save nahi hoti
      sameSite: 'lax',    // form submit per cookie drop nahi hoti
      path: '/',          // har route ke liye accessible
      maxAge: 24 * 60 * 60 * 1000  // 1 day
    });

    // Redirect according to role
    if (user.role === 'admin') {
      return res.redirect('/training/admin');
    } else {
      return res.redirect('/training/add');
    }

  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', { error: 'Server Error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.redirect('/auth/login');
};
