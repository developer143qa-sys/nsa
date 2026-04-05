const mongoose = require('mongoose');

const traineeRecordSchema = new mongoose.Schema({
  qid: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  phoneNumber: { type: String, required: true },

  // Case type (required only if trainee is not active)
  caseType: {
  type: String,
  enum: ['completed', 'delay', 'exception', 'exempted', 'upcoming'],
  required: false
},

  // Optional fields
  reason: { type: String },
  batchNo: { type: String },    // for completed + delay
  forceNo: { type: String },    // for exception only

  // Batch years
  batchStartYear: { type: Number },  
  batchEndYear: { type: Number },    

  // Active flag (computed dynamically in frontend or backend)
  isActive: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

// Virtual property to calculate trainee status dynamically
traineeRecordSchema.virtual('status').get(function() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  if (!this.batchStartYear || !this.batchEndYear) return 'Unknown';

  const sept1 = new Date(this.batchStartYear, 8, 1); // September 1

  if (currentDate < sept1) return 'upcoming';
  if (currentDate >= sept1 && currentYear >= this.batchStartYear && currentYear <= this.batchEndYear) return 'active';
  return 'completed';
});

// Ensure virtuals are included when converting to JSON
traineeRecordSchema.set('toJSON', { virtuals: true });
traineeRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TraineeRecord', traineeRecordSchema);