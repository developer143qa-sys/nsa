require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // ✅ added
const connectDB = require('./config/db');

const traineeRoutes = require('./routes/traineeRoutes');
const authRoutes = require('./routes/auth'); // 👈 Auth routes

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------
// Connect to MongoDB
// ----------------------------
connectDB();

// ----------------------------
// Middleware
// ----------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // ✅ important for JWT cookies

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
// Routes
// ----------------------------
// app.use('/auth', authRoutes); // 👈 Auth routes
app.use('/auth', authRoutes);
// no /auth prefix

app.use('/training', traineeRoutes); // Trainee routes

// Default route
app.get('/', (req, res) => res.redirect('/auth/login'));

// 404
app.use((req, res) => res.status(404).send('Page Not Found'));

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
