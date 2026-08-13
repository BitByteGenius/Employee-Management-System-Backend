const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['planning', 'active', 'paused', 'completed', 'archived'], default: 'planning' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    startDate: Date,
    dueDate: Date,
    progress: { type: Number, min: 0, max: 100, default: 0 },
    deletedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Project', projectSchema);
