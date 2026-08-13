const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['todo', 'in_progress', 'review', 'done', 'blocked'], default: 'todo' },
    approvalStatus: { type: String, enum: ['not_required', 'pending', 'approved', 'rejected'], default: 'not_required' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    labels: [{ type: String }],
    dueDate: Date,
    completedAt: Date,
    estimatedHours: Number,
    actualHours: Number,
    deletedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Task', taskSchema);
