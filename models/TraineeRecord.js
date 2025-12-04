const mongoose = require('mongoose');

const traineeRecordSchema = new mongoose.Schema({
  qid: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  phoneNumber: { type: String, required: true },

  caseType: {
    type: String,
    enum: ['completed', 'delay', 'exception', 'exempted'],
    required: true
  },

  // Dynamic fields
  reason: { type: String },         // delay, exception, exempted only

  postponedDate: { type: Date },    // delay only

  batchNo: { type: String },        // completed + delay only

  forceNo: { type: String },        // exception only

  batchStartDate: { type: Date },   // exception only
  batchEndDate: { type: Date },     // exception only

  currentDate: { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TraineeRecord', traineeRecordSchema);
