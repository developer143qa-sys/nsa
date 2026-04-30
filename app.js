require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const i18n = require('i18n');

const connectDB = require('./config/db');

const traineeRoutes = require('./routes/traineeRoutes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------
// Connect to MongoDB
// ----------------------------
connectDB();

// ----------------------------
// i18n configuration
// ----------------------------
i18n.configure({
  locales: ['en', 'ar'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  cookie: 'lang',
  queryParameter: 'lang',
  autoReload: true,
  syncFiles: true
});

// ----------------------------
// Middleware
// ----------------------------
app.use(cookieParser());
app.use(i18n.init);

// ✅ GLOBAL VARIABLES for ALL EJS views
app.use((req, res, next) => {
  res.locals.locale = req.getLocale();
  res.locals.currentUrl = req.originalUrl; // ✅ FIXED ERROR
  next();
});

// Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ----------------------------
// Session setup
// ----------------------------
 // ----------------------------
// Session setup
// ----------------------------

// ✅ ADD THIS LINE HERE
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'myDefaultSessionSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}))

// ----------------------------
// Language switch route
// ----------------------------
app.get('/lang/:lang', (req, res) => {
  const lang = req.params.lang;

  // ✅ better redirect handling
  const redirect =
    req.query.redirect ||
    req.headers.referer ||
    '/';

  res.cookie('lang', lang, {
    maxAge: 1000 * 60 * 60,
    httpOnly: true
  });

  req.setLocale(lang);

  res.redirect(redirect);
});

// ----------------------------
// Routes
// ----------------------------
app.use('/auth', authRoutes);
app.use('/training', traineeRoutes);

// Default route
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});