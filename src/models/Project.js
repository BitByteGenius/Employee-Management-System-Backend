const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, trim: true },
    description: { type: String, default: '' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, default: 'active' },
    progress: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: false },
);

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);
