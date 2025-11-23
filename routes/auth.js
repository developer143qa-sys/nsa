// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register page (GET) + form submit (POST)
router.get('/register', (req, res) => res.render('auth/register', { error: null }));
router.post('/register', authController.register);

// Login page (GET) + login submit (POST)
router.get('/login', (req, res) => res.render('auth/login', { error: null }));
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
