const User = require('../models/User');

const getMonthlyUserData = async (req, res) => {
    try {
        const monthlyData = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {    
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        // Optional: Format result for frontend (e.g., for a bullet chart)
        const formattedData = monthlyData.map(item => ({
            year: item._id.year,
            month: item._id.month,
            userCount: item.count
        }));

        res.status(200).json({ success: true, data: formattedData });

    } catch (error) {
        console.error("Error fetching monthly user data:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

                  module.exports = {
                   getMonthlyUserData
                   };
