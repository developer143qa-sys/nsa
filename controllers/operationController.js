const User = require('../models/User');
const ExcelJS = require('exceljs');

// READ - Get all users with pagination, date filter, and search
exports.getAllUsers = async (req, res) => {
  try {
    const perPage = 5;
    const page = parseInt(req.query.page) || 1;

    const from = req.query.from || '';
    const to = req.query.to || '';
    const search = req.query.search || '';

    const filter = {};

    // Optional: Date range filter
    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setHours(23, 59, 59, 999))
      };
    }

    // Optional: Search filter (name or email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage);

    res.render('operation', {
      title: 'Task Operations',
      users,
      current: page,
      pages: Math.ceil(totalUsers / perPage),
      from,
      to,
      search
    });

  } catch (err) {
    console.error('Error retrieving users:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

// CREATE - Add a new user
exports.addUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.create({ name, email });
    res.redirect('/api/users/operation');
  } catch (err) {
    console.error('Add user error:', err.message);
    res.status(400).send('Failed to add user.');
  }
};

// DELETE - Remove a user by ID
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/api/users/operation');
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(400).send('Failed to delete user.');
  }
};

// UPDATE - Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, email });
    res.redirect('/api/users/operation');
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(400).send('Failed to update user.');
  }
};

// EXPORT - Export filtered users to Excel
exports.exportUsersToExcel = async (req, res) => {
  try {
    const from = req.query.from || '';
    const to = req.query.to || '';
    const search = req.query.search || '';

    const filter = {};

    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setHours(23, 59, 59, 999))
      };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    users.forEach(user => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toLocaleDateString()
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export to Excel error:', error.message);
    res.status(500).send('Failed to export users.');
  }
};
