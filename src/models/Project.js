const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema(
  {
    filePath: { type: String, default: null },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    externalLink: { type: String, default: null },
    submissionDeadline: { type: Date, default: null },
    selectedDate: { type: Date, default: null },
    notes: { type: String, default: '' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: true },
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, trim: true },
    description: { type: String, default: '' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    role: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['active', 'archived', 'completed', 'on_hold', 'in_progress', 'planning', 'at_risk'],
      default: 'active',
      index: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    dueDate: { type: Date, default: null },
    startDate: { type: Date, default: Date.now },
    tasksCount: { type: Number, default: 0 },
    completedTasksCount: { type: Number, default: 0 },
    deliverables: [deliverableSchema],
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, strictPopulate: false },
);

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);
