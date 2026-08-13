const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, default: 'todo' },
    priority: { type: String, default: 'medium' },
    dueDate: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: false },
);

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
