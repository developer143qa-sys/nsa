const TraineeRecord = require('../models/TraineeRecord');
const csv = require('csv-parser');
const fs = require('fs');

// ===============================
// Helper: Parse date safely
// ===============================
const parseDate = (val) => {
  if (!val) return undefined;
  const trimmed = String(val).trim();
  return trimmed ? new Date(trimmed) : undefined;
};

// ===============================
// Add Single Trainee
// ===============================
exports.addTrainee = async (req, res) => {
  try {
    const {
      qid,
      fullname,
      phoneNumber,
      caseType,
      reason,
      postponedDate,
      batchStartDate,
      batchEndDate,
      currentDate
    } = req.body;

    const newRecord = new TraineeRecord({
      qid,
      fullname,
      phoneNumber,
      caseType,
      reason: ['delay', 'exception', 'exempted'].includes(caseType) ? reason?.trim() : undefined,
      postponedDate: caseType === 'delay' ? parseDate(postponedDate) : undefined,
      batchStartDate: parseDate(batchStartDate),
      batchEndDate: parseDate(batchEndDate),
      currentDate: parseDate(currentDate) || new Date()
    });

    await newRecord.save();
    res.send('success');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error: ' + err.message);
  }
};

// ===============================
// Upload CSV
// ===============================
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No CSV file uploaded');

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', async () => {

        for (const row of results) {
          try {
            const newRecord = new TraineeRecord({
              qid: row.qid,
              fullname: row.fullname,
              phoneNumber: row.phoneNumber,
              caseType: row.caseType,
              reason: ['delay', 'exception', 'exempted'].includes(row.caseType) ? row.reason?.trim() : undefined,
              postponedDate: row.caseType === 'delay' ? parseDate(row.postponedDate) : undefined,
              batchStartDate: parseDate(row.batchStartDate),
              batchEndDate: parseDate(row.batchEndDate),
              currentDate: parseDate(row.currentDate) || new Date()
            });

            await newRecord.save();
          } catch (err) {
            console.error(`❌ CSV Row Failed: ${err.message}`);
          }
        }

        fs.unlinkSync(filePath); // delete CSV file after processing
        res.send('success');
      });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error: ' + err.message);
  }
};

// ===============================
// Get All Trainees (Search + CaseType Search + Date Filter + Pagination)
// ===============================
exports.getAllTrainees = async (req, res) => {
  try {
    const { search, from, to, page } = req.query;

    const query = {};

    // 🔍 UPDATED SEARCH: QID + Fullname + CaseType
    if (search) {
      query.$or = [
        { qid: { $regex: search, $options: "i" } },
        { fullname: { $regex: search, $options: "i" } },
        { caseType: { $regex: search, $options: "i" } }  // <-- NEW SEARCH FIELD
      ];
    }

    // Filter by batch start date
    if (from && to) {
      query.batchStartDate = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const currentPage = parseInt(page) || 1;
    const limit = 100; 
    const skip = (currentPage - 1) * limit;

    // Get total count
    const totalRecords = await TraineeRecord.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    const trainees = await TraineeRecord.find(query)
      .sort({ batchStartDate: 1 })
      .skip(skip)
      .limit(limit);

    res.render("admin", {
      trainees,
      search,
      from,
      to,
      page: currentPage,
      totalPages,
      totalTrainees: totalRecords
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ===============================
// Edit Trainee Form
// ===============================
exports.editForm = async (req, res) => {
  try {
    const trainee = await TraineeRecord.findById(req.params.id);
    if (!trainee) return res.status(404).send("Trainee not found");

    res.render("editTrainee", { trainee });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ===============================
// Update Trainee
// ===============================
exports.updateTrainee = async (req, res) => {
  try {
    const {
      fullname,
      phoneNumber,
      caseType,
      reason,
      postponedDate,
      batchStartDate,
      batchEndDate,
      currentDate
    } = req.body;

    await TraineeRecord.findByIdAndUpdate(req.params.id, {
      fullname,
      phoneNumber,
      caseType,
      reason: ['delay', 'exception', 'exempted'].includes(caseType) ? reason?.trim() : undefined,
      postponedDate: caseType === 'delay' ? parseDate(postponedDate) : undefined,
      batchStartDate: parseDate(batchStartDate),
      batchEndDate: parseDate(batchEndDate),
      currentDate: parseDate(currentDate)
    });

    res.redirect("/training/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ===============================
// Delete Trainee
// ===============================
exports.deleteTrainee = async (req, res) => {
  try {
    await TraineeRecord.findByIdAndDelete(req.params.id);
    res.redirect("/training/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
