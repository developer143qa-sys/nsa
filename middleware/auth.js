const { protect, admin } = require('../middleware/auth');

router.get('/admin', protect, admin, traineeController.getAdminDashboard);
router.get('/add', protect, admin, traineeController.getAddPage);
router.post('/add', protect, admin, traineeController.addTrainee);
router.get('/edit/:id', protect, admin, traineeController.getEditPage);
router.post('/edit/:id', protect, admin, traineeController.updateTrainee);
router.post('/delete/:id', protect, admin, traineeController.deleteTrainee);
