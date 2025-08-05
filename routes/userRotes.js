// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET: /api/users → Show users list page
router.get('/', userController.getUsers);

// POST: /api/users/add → Handle add user form submission
router.post('/add', userController.addUser);

module.exports = router;
