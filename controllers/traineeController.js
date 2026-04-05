const TraineeRecord = require('../models/TraineeRecord');
const csv = require('csvtojson');
const fs = require('fs');

/* ===============================
   Helper: Calculate Status
   Logic: Upcoming → Active → Completed
================================ */
const calculateStatus = (trainee) => {
  const currentDate = new Date();
  const startYear = Number(trainee.batchStartYear);
  const endYear = Number(trainee.batchEndYear);

  // Standard case types
  if (trainee.caseType === 'completed') return 'Completed';
  if (trainee.caseType === 'exception') return 'Exception';
  if (trainee.caseType === 'exempted') return 'Exempted';
  if (trainee.caseType === 'delay') return 'Delay';

  // Upcoming / Active / Completed logic
  if (trainee.caseType === 'upcoming') {
    if (isNaN(startYear) || isNaN(endYear)) return 'Upcoming';

    const septStart = new Date(startYear, 8, 1); // Sept 1 start
    const septEnd = new Date(endYear, 8, 1);     // Sept 1 end

    if (currentDate < septStart) return 'Upcoming';
    if (currentDate >= septStart && currentDate < septEnd) return 'Active';
    if (currentDate >= septEnd) return 'Completed';
  }

  return '';
};

/* ===============================
   Admin Dashboard
================================ */
const getAdminDashboard = async (req, res) => {
  try {
    const { search, session } = req.query;
    let query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { qid: regex },
        { fullname: regex },
        { phoneNumber: regex },
        { caseType: regex }
      ];
    }

    if (session) {
      const years = session.match(/\d{4}/g);
      if (years && years.length === 2) {
        const start = parseInt(years[0]);
        const end = parseInt(years[1]);

        query.$or = [
          { batchStartYear: { $lte: end }, batchEndYear: { $gte: start } },
          { batchStartYear: { $lte: end }, batchEndYear: { $exists: false } }
        ];
      }
    }

    const trainees = await TraineeRecord.find(query).lean();

    let completedCount = 0;
    let delayCount = 0;
    let pendingCount = 0;
    let exceptionCount = 0;
    let exemptedCount = 0;
    let upcomingCount = 0;
    let activeCount = 0;

    trainees.forEach(t => {
      t.status = calculateStatus(t);

      if (t.status === 'Completed') completedCount++;
      else if (t.status === 'Delay') delayCount++;
      else if (t.status === 'Pending') pendingCount++;
      else if (t.status === 'Exception') exceptionCount++;
      else if (t.status === 'Exempted') exemptedCount++;
      else if (t.status === 'Upcoming') upcomingCount++;
      else if (t.status === 'Active') activeCount++;
    });

    res.render('admin', {
      trainees,
      completedCount,
      delayCount,
      pendingCount,
      exceptionCount,
      exemptedCount,
      upcomingCount,
      activeCount,
      totalTrainees: trainees.length,
      search: search || '',
      session: session || ''
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

/* ===============================
   Add Trainee
================================ */
const getAddPage = (req, res) => res.render('addTrainee');

const addTrainee = async (req, res) => {
  try {
    const {
      qid,
      fullname,
      phoneNumber,
      caseType,
      reason,
      batchNo,
      forceNo,
      batchStartYear,
      batchEndYear
    } = req.body;

    if (!qid || !fullname || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing'
      });
    }

    const trainee = {
      qid,
      fullname,
      phoneNumber,
      caseType,
      reason,
      batchNo,
      forceNo,
      batchStartYear,
      batchEndYear
    };

    await TraineeRecord.create(trainee);

    res.json({
      success: true,
      message: 'Trainee added successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/* ===============================
   Edit / Update Trainee
================================ */
const getEditPage = async (req, res) => {
  try {
    const trainee = await TraineeRecord.findById(req.params.id).lean();
    if (!trainee) return res.status(404).send('Not found');
    res.render('editTrainee', { trainee });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

const updateTrainee = async (req, res) => {
  try {
    const traineeId = req.params.id;
    const updatedData = {
      ...req.body
    };

    await TraineeRecord.findByIdAndUpdate(traineeId, updatedData);
    res.redirect('/training/admin');

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

/* ===============================
   Delete Trainee
================================ */
const deleteTrainee = async (req, res) => {
  try {
    await TraineeRecord.findByIdAndDelete(req.params.id);
    res.redirect('/training/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

/* ===============================
   CSV Upload
================================ */
const uploadCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded');

    const jsonArray = await csv().fromFile(req.file.path);

    let added = 0;
    let updated = 0;

    for (const item of jsonArray) {
      if (!item.qid) continue;

      const trainee = {
        qid: item.qid.trim(),
        fullname: item.fullname?.trim(),
        phoneNumber: item.phoneNumber?.trim(),
        reason: item.reason?.trim() || '',
        batchNo: item.batchNo?.trim() || '',
        forceNo: item.forceNo?.trim() || '',
        batchStartYear: item.batchStartYear?.trim(),
        batchEndYear: item.batchEndYear?.trim(),
        caseType: item.caseType?.trim()
      };

      const exists = await TraineeRecord.findOne({ qid: trainee.qid });

      if (exists) {
        await TraineeRecord.updateOne({ qid: trainee.qid }, trainee);
        updated++;
      } else {
        await TraineeRecord.create(trainee);
        added++;
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Added: ${added}, Updated: ${updated}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/* ===============================
   Exports
================================ */
module.exports = {
  getAdminDashboard,
  getAddPage,
  addTrainee,
  getEditPage,
  updateTrainee,
  deleteTrainee,
  uploadCSV
};