const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, default: 'todo' },
    priority: { type: String, default: 'medium' },
    dueDate: { type: Date, default: null },
    fileUrl: { type: String, default: null },
    filePath: { type: String, default: null },
    fileName: { type: String, default: null },
    fileSize: { type: Number, default: null },
    attachments: [
      {
        fileName: { type: String },
        filePath: { type: String },
        fileUrl: { type: String },
        fileSize: { type: Number },
        mimeType: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, strict: false },
);

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
