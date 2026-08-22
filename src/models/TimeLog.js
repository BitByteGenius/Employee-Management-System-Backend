const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    taskName: { type: String, required: true, trim: true },
    hours: { type: Number, required: true, min: 0.1 },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'approved', enum: ['pending', 'approved', 'rejected'] },
    notes: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, strict: false },
);

module.exports = mongoose.models.TimeLog || mongoose.model('TimeLog', timeLogSchema);
