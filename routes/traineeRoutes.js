// routes/traineeRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const traineeController = require('../controllers/traineeController');
const { protect, admin } = require('../middleware/auth');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --------------------------------------------------------
// 🔐 Protect all trainee routes (everyone must be logged in)
// --------------------------------------------------------
router.use(protect);

// --------------------------------------------------------
// 🧑‍💼 Admin Dashboard (Only Admin)
// --------------------------------------------------------
router.get('/admin', admin, traineeController.getAllTrainees);

// --------------------------------------------------------
// ➕ Add Trainee (User + Admin Both Allowed)
// --------------------------------------------------------
router.get('/add', (req, res) => res.render('addTrainee'));
router.post('/add', traineeController.addTrainee);

// --------------------------------------------------------
// 📤 CSV Upload (Admin Only)
// --------------------------------------------------------
router.post('/upload-csv', admin, upload.single("csvFile"), traineeController.uploadCSV);

// --------------------------------------------------------
// ✏ Edit / Update / Delete (Admin Only)
// --------------------------------------------------------
router.get('/edit/:id', admin, traineeController.editForm);
router.post('/update/:id', admin, traineeController.updateTrainee);
router.post('/delete/:id', admin, traineeController.deleteTrainee);

module.exports = router;
