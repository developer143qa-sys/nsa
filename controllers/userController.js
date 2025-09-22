// controllers/userController.js

const fs = require('fs');
const csv = require('csv-parser');
const User = require('../models/User');

// GET /api/users - Get all users and render the page
// controllers/homeController.js

exports.getHomePage = (req, res) => {
  res.render('index', {
    title: 'Home',
    message: 'Welcome to  HOME PAGE User Management System'
  });
};                                       

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.render('users', {
      title: 'User List',
      users
    });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

// POST /api/users/add - Add new user
exports.addUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).send('Name and Email are required');
    }

    const newUser = new User({ name,email });
    await newUser.save();
    res.redirect('/api/users');
  } catch (err) {
    console.error('Error adding user:', err.message);
    res.status(400).send('Failed to add user. Maybe email already exists.');
  }
};

// POST /api/users/upload - Upload users via CSV file
exports.uploadUsersCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No CSV file uploaded.');
  }

  const users = [];
  const filePath = req.file.path;

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.name && row.email) {
          users.push({
            name: row.name.trim(),
            email: row.email.trim(),
            createdAt: new Date()
          });
        }
      })
      .on('end', async () => {
        try {
          if (users.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).send('CSV file is empty or invalid format.');
          }
          await User.insertMany(users);
          fs.unlinkSync(filePath); // Delete temp file
          res.redirect('/api/users');
        } catch (err) {
          console.error('DB insert error:', err.message);
          res.status(500).send('Error saving users to database.');
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error.message);
        fs.unlinkSync(filePath);
        res.status(500).send('Error processing CSV file.');
      });
  } catch (error) {
    console.error('CSV upload error:', error.message);
    res.status(500).send('Error processing CSV file.');
  }
};
