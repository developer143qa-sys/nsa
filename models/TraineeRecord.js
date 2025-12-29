const mongoose = require('mongoose');

const traineeRecordSchema = new mongoose.Schema({
  qid: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  phoneNumber: { type: String, required: true },

  caseType: {
    type: String,
    enum: ['completed', 'delay', 'exception', 'exempted'],
    required: function() {
      // CaseType required only if trainee is not active
      return !this.isActive;
    }
  },

  // Common optional fields
  reason: { type: String },
  batchNo: { type: String },         // completed + delay only
  forceNo: { type: String },         // exception only

  // Years for batch
  batchStartYear: { type: Number },  // delay + exception only
  batchEndYear: { type: Number },    // delay + exception only

  // Active flag
  isActive: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TraineeRecord', traineeRecordSchema);
