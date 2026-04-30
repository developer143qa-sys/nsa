// controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
      return res.render('auth/register', { error: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.render('auth/register', { error: 'Passwords do not match' });
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

    // ✅ FIX 1: user check
    if (!user) {
      return res.render('auth/login', { error: 'Invalid credentials' });
    }

    const isMatch = await user.isValidPassword(password);

    // ✅ FIX 2: password check
    if (!isMatch) {
      return res.render('auth/login', { error: 'Invalid credentials' });
    }

    const payload = { id: user._id, role: user.role };

    // ✅ FIX 3: JWT safe check
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing in env");
      return res.render('auth/login', { error: 'Server configuration error' });
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.render('auth/forgot-password', {
        error: 'Email is required',
        success: null
      });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    // Generic response to avoid user enumeration
    const successMessage = 'If your email exists, a reset link has been generated.';
    if (!user) {
      return res.render('auth/forgot-password', { error: null, success: successMessage });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(expiresAt);
    await user.save();

    const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${rawToken}`;
    console.log('Password reset link:', resetLink);

    return res.render('auth/forgot-password', { error: null, success: successMessage });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.render('auth/forgot-password', { error: 'Server Error', success: null });
  }
};

exports.getResetPasswordPage = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).render('auth/reset-password', {
        error: 'Reset link is invalid or expired',
        success: null,
        token: null
      });
    }

    return res.render('auth/reset-password', { error: null, success: null, token: req.params.token });
  } catch (err) {
    console.error('Reset page error:', err);
    return res.status(500).render('auth/reset-password', {
      error: 'Server Error',
      success: null,
      token: null
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return res.status(400).render('auth/reset-password', {
        error: 'All fields are required',
        success: null,
        token: req.params.token
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).render('auth/reset-password', {
        error: 'Passwords do not match',
        success: null,
        token: req.params.token
      });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).render('auth/reset-password', {
        error: 'Reset link is invalid or expired',
        success: null,
        token: null
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.render('auth/reset-password', {
      error: null,
      success: 'Password reset successful. You can now login.',
      token: null
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).render('auth/reset-password', {
      error: 'Server Error',
      success: null,
      token: req.params.token
    });
  }
};
