// controllers/dashboardController.js

const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // current page
    const limit = 5; // number of users per page
    const skip = (page - 1) * limit;

    // Fetch paginated users + count total users
    const [users, totalUsers] = await Promise.all([
      User.find().skip(skip).limit(limit),
      User.countDocuments()
    ]);

    // Optionally: Replace with real dynamic values later
    const totalMessages = 45;
    const totalTasks = 12;

    res.render('dashboard', {
      title: 'Dashboard',
      users,                // for user table or card listing
      totalUsers,           // for card count
      totalMessages,
      totalTasks,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit)
    });
  } catch (error) {
    console.error('Error in dashboard:', error.message);
    res.status(500).send('Internal Server Error');
  }
};
