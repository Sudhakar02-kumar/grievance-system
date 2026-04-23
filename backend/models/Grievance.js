const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Academic', 'Hostel', 'Transport', 'Other'],
    default: 'Other'
  },
  date:   { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Grievance', grievanceSchema);