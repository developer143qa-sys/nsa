// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route: GET /api/users
router.get('/', userController.getUsers);

// Route: POST /api/users/add
router.post('/add', userController.addUser);

module.exports = router;
