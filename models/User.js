// models/User.js
const mongoose = require('mongoose');

// Define schema with timestamps
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
        index: true
    }
}, {
    timestamps: true // ✅ Automatically adds createdAt and updatedAt
});

// Create model
const User = mongoose.model('User', userSchema);

module.exports = User;
