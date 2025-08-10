// controllers/chartController.js
const User = require('../models/User');

exports.getMonthlyUserStats = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const labels = users.map(u => monthNames[u._id]);
    const data = users.map(u => u.count);

    res.json({
      labels,
      data
    });

  } catch (error) {
    console.error('Error in getMonthlyUserStats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
