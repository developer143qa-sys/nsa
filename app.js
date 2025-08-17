const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();

// Define PORT from environment or fallback
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Set EJS as view engine and use layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Middleware
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

app.get('/healthz', (req, res) => res.send('OK'));

app.use('/api/users', userRoutes);

// Start server, bind to 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
