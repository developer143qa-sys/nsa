// controllers/userController.js
const User = require('../models/User.js');

// GET /api/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', {
            title: 'User List', // ✅ Fixes <%= title %> error in header.ejs
            users
        });
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).send('Internal Server Error');
    }
};

// POST /api/users/add
exports.addUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Basic validation (optional)
        if (!name || !email) {
            return res.status(400).send('Name and Email are required');
        }

        const newUser = new User({ name, email });
        await newUser.save();
        res.redirect('/api/users');
    } catch (err) {
        console.error('Error adding user:', err.message);
        res.status(400).send('Failed to add user. Maybe email already exists.');
    }
};
