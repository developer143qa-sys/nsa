const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const checkController = require('../controllers/checkController');
const dashboardController = require('../controllers/dashboardController'); // ✅
const chartController = require('../controllers/chartController');

router.get('/dashboard', dashboardController.getDashboard); // ✅ use controller

router.get('/', userController.getUsers);
router.post('/add', userController.addUser);
router.get('/checking', checkController.checkuser);
router.get('/monthly', chartController.getMonthlyUserStats);
router.get('/checking', checkController.checkuser);

module.exports = router;
