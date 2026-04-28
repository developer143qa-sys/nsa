const express = require('express');
const router = express.Router();
const traineeController = require('../controllers/traineeController'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ==================== Dashboard & CRUD ====================

// Admin dashboard
router.get('/admin', traineeController.getAdminDashboard);

// Add trainee
router.get('/add', traineeController.getAddPage);
router.post('/add', traineeController.addTrainee);

// Edit trainee
router.get('/edit/:id', traineeController.getEditPage);
router.post('/edit/:id', traineeController.updateTrainee);

// Delete trainee
router.post('/delete/:id', traineeController.deleteTrainee);

// ==================== CSV Upload ====================

// Optional upload page
router.get('/upload-csv', (req, res) => {
  res.render('uploadCSV'); // or redirect to admin dashboard
});

// Handle CSV upload
router.post('/upload-csv', upload.single('file'), traineeController.uploadCSV);
router.post('/reconcile-active-csv', upload.single('file'), traineeController.reconcileActiveCSV);

module.exports = router;
