// controllers/dashboardController.js

const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // Total users from DB

    res.render('dashboard', {
      title: 'Dashboard',
      totalUsers,
      totalMessages: 45,  // Static for now
      totalTasks: 12      // Static for now
    });
  } catch (error) {
    console.error('Error in dashboard:', error.message);
    res.status(500).send('Internal Server Error');
  }
};
