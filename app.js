const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();

// ✅ Define PORT from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Connect to DB
connectDB();

// Set EJS as view engine and use layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Middleware
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Optional: Add health check route for Render (recommended)
app.get('/healthz', (req, res) => res.send('OK'));

// Use routes from userRoutes
app.use('/api/users', userRoutes);

// ✅ Bind to 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
