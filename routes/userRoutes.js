const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const checkController = require('../controllers/checkController');
const dashboardController = require('../controllers/dashboardController');
const chartController = require('../controllers/chartController');
const operationController = require('../controllers/operationController');

// Dashboard route
router.get('/dashboard', dashboardController.getDashboard);

// User routes
router.get('/', userController.getUsers);
router.post('/add', userController.addUser);

// Other routes...

router.get('/operation/export', operationController.exportUsersToExcel);

// Check routes
router.get('/checking', checkController.checkuser);

// Chart route


// CRUD routes for operations on users

// READ - Get all users (for operation page)
router.get('/operation', operationController.getAllUsers);

// CREATE - Add new user
router.post('/operation/add', operationController.addUser);

// DELETE - Delete user by ID
router.post('/operation/delete/:id', operationController.deleteUser);

// UPDATE - Update user by ID
router.post('/operation/update/:id', operationController.updateUser);

module.exports = router;
