const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error', 'approval'], default: 'info' },
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    readAt: Date,
    deletedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Notification', notificationSchema);
