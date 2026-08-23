const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, default: '' },
    type: { type: String, default: 'info' },
    readAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: false },
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
