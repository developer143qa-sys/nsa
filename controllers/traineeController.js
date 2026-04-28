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

  // Fallback: if batch years exist, calculate dynamically
  if (!isNaN(startYear) && !isNaN(endYear)) {
    const septStart = new Date(startYear, 8, 1);
    const septEnd = new Date(endYear, 8, 1);
    if (currentDate < septStart) return 'Upcoming';
    if (currentDate >= septStart && currentDate < septEnd) return 'Active';
    if (currentDate >= septEnd) return 'Completed';
  }

  return 'Pending';
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

    // Initialize counters
    let completedCount = 0,
        delayCount = 0,
        pendingCount = 0,
        exceptionCount = 0,
        exemptedCount = 0,
        upcomingCount = 0,
        activeCount = 0;

    trainees.forEach(t => {
      t.status = calculateStatus(t); // use helper

      // Count by status
      switch(t.status){
        case 'Completed': completedCount++; break;
        case 'Delay': delayCount++; break;
        case 'Pending': pendingCount++; break;
        case 'Exception': exceptionCount++; break;
        case 'Exempted': exemptedCount++; break;
        case 'Upcoming': upcomingCount++; break;
        case 'Active': activeCount++; break;
      }
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
    const updatedData = { ...req.body };
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

      const caseType = item.caseType?.trim();
      let reason = item.reason?.trim();

      // Bulk CSV convenience: if reason is missing, keep it as "other"
      // so records can be imported quickly and adjusted later from edit page.
      if (!reason) {
        reason = 'other';
      }

      const trainee = {
        qid: item.qid.trim(),
        fullname: item.fullname?.trim(),
        phoneNumber: item.phoneNumber?.trim(),
        reason,
        batchNo: item.batchNo?.trim() || '',
        forceNo: item.forceNo?.trim() || '',
        batchStartYear: item.batchStartYear?.trim(),
        batchEndYear: item.batchEndYear?.trim(),
        caseType
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
   Active CSV Reconciliation
================================ */
const reconcileActiveCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const rows = await csv().fromFile(req.file.path);
    const activeQids = new Set();

    for (const row of rows) {
      const qid = row.qid || row.QID || row.Qid;
      if (qid) activeQids.add(String(qid).trim());
    }

    const upcoming = await TraineeRecord.find({ caseType: 'upcoming' }).select('_id qid');
    const matchedIds = [];
    const unmatchedIds = [];

    for (const trainee of upcoming) {
      const qid = String(trainee.qid || '').trim();
      if (activeQids.has(qid)) matchedIds.push(trainee._id);
      else unmatchedIds.push(trainee._id);
    }

    let movedToActive = 0;
    let movedToFallback = 0;

    if (matchedIds.length) {
      const result = await TraineeRecord.updateMany(
        { _id: { $in: matchedIds } },
        { $set: { caseType: 'active' } }
      );
      movedToActive = result.modifiedCount || 0;
    }

    if (unmatchedIds.length) {
      const result = await TraineeRecord.updateMany(
        { _id: { $in: unmatchedIds } },
        { $set: { caseType: 'delay', reason: 'other' } }
      );
      movedToFallback = result.modifiedCount || 0;
    }

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      message: `Compared: ${upcoming.length}, Active: ${movedToActive}, Delay: ${movedToFallback} (reason set to other for unmatched)`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server Error' });
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
  uploadCSV,
  reconcileActiveCSV
};