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
  reason: { type: String }, // Will depend on caseType
  postponedDate: { type: Date }, // Only for delay
  batchStartDate: { type: Date }, // Only for exception
  batchEndDate: { type: Date }, // Only for exception
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TraineeRecord', traineeRecordSchema);
