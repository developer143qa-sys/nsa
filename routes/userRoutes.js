const express = require('express');
const router = express.Router();
const multer = require('multer');

// Multer setup for file uploads (store files temporarily in 'uploads' folder)
const upload = multer({ dest: 'uploads/' });

// Import controllers
const userController = require('../controllers/userController');
const checkController = require('../controllers/checkController');
const dashboardController = require('../controllers/dashboardController');
const chartController = require('../controllers/chartController');
const operationController = require('../controllers/operationController');

// =====================
// Dashboard route
// =====================
router.get('/dashboard', dashboardController.getDashboard);

// =====================
// User routes
// =====================

// Get list of users (GET /api/users/)
router.get('/', userController.getUsers);

// Add a new user (POST /api/users/add)
router.post('/add', userController.addUser);

// CSV Upload route (POST /api/users/upload)
router.post('/upload', upload.single('csvFile'), userController.uploadUsersCSV);

// Home route (GET /api/users/home)
router.get('/home', (req, res) => {
  // Render a view or send a response here to fix "Cannot GET /api/users/home"
  res.render('home', { title: 'Home Page' });
});

// =====================
// Operation routes for user management
// =====================

// Export users to Excel (GET /api/users/operation/export)
router.get('/operation/export', operationController.exportUsersToExcel);

// Get all users for operation page (GET /api/users/operation)
router.get('/operation', operationController.getAllUsers);

// Add new user (POST /api/users/operation/add)
router.post('/operation/add', operationController.addUser);

// Delete user by ID (POST /api/users/operation/delete/:id)
router.post('/operation/delete/:id', operationController.deleteUser);

// Update user by ID (POST /api/users/operation/update/:id)
router.post('/operation/update/:id', operationController.updateUser);

// =====================
// Check user route (GET /api/users/checking)
router.get('/checking', checkController.checkuser);

// =====================
// Chart routes (add here if needed)
// =====================
// Example placeholder:
// router.get('/charts/data', chartController.getChartData);

module.exports = router;
