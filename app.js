require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // ✅ for language and sessions
const connectDB = require('./config/db');
const i18n = require('i18n'); // ✅ i18n

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

// Make locale available in all EJS templates
app.use((req, res, next) => {
  res.locals.locale = req.getLocale();
  next();
});

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ----------------------------
// Session setup
// ----------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// ----------------------------
// Language switch route
// ----------------------------
app.get('/lang/:lang', (req, res) => {
  const lang = req.params.lang;
  res.cookie('lang', lang, { maxAge: 900000, httpOnly: true });
  res.setLocale(lang);
  res.redirect('back');
});

// ----------------------------
// Routes
// ----------------------------
app.use('/auth', authRoutes);
app.use('/training', traineeRoutes);

// Default route
app.get('/', (req, res) => res.redirect('/auth/login'));

// 404 handler
app.use((req, res) => res.status(404).send('Page Not Found'));

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
