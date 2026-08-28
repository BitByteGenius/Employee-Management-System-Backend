const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true, trim: true },
    message: { type: String, default: '' },
    type: { type: String, default: 'task_assigned' },
    category: {
      type: String,
      enum: ['projects', 'system', 'team', 'task', 'general'],
      default: 'projects',
      index: true,
    },
    entityType: { type: String, default: null }, // e.g. 'Task', 'Project', 'User', 'System'
    entityId: { type: mongoose.Schema.Types.Mixed, default: null },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    isDismissed: { type: Boolean, default: false, index: true },
    dismissedAt: { type: Date, default: null },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    actionType: {
      type: String,
      enum: ['view_task', 'more_info', 'view_project', 'none'],
      default: 'none',
    },
    actionUrl: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: false },
);

notificationSchema.index({ recipient: 1, isDismissed: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, category: 1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

