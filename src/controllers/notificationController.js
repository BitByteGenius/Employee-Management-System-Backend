'use strict';

const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/notifications
 * List notifications for authenticated user with pagination and category filters
 */
const list = asyncHandler(async (req, res) => {
  const { page, limit, category, isRead, search } = req.query;

  const result = await notificationService.getNotifications({
    userId: req.user.id,
    page,
    limit,
    category,
    isRead,
    search,
  });

  res.json({
    success: true,
    data: result.data,
    unreadCount: result.unreadCount,
    pagination: result.pagination,
  });
});

/**
 * GET /api/v1/notifications/unread-count
 * Get real-time unread notification count
 */
const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  res.json({
    success: true,
    count,
    data: { count },
  });
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read
 */
const markRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markAsRead(req.params.id, req.user.id);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  res.json({ success: true, data });
});

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read for current user
 */
const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  res.json({ success: true, message: 'All notifications marked as read' });
});

/**
 * PATCH /api/v1/notifications/:id/dismiss or DELETE /api/v1/notifications/:id
 * Dismiss a notification
 */
const dismiss = asyncHandler(async (req, res) => {
  const data = await notificationService.dismissNotification(req.params.id, req.user.id);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  res.json({ success: true, message: 'Notification dismissed', data });
});

/**
 * GET /api/v1/notifications/recent-activity
 * Retrieve real recent activities for the authenticated user's role and scope
 */
const recentActivity = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const activities = await notificationService.getRecentActivities({
    user: req.user,
    limit,
  });
  res.json({ success: true, data: activities });
});

module.exports = {
  list,
  unreadCount,
  markRead,
  markAllRead,
  dismiss,
  recentActivity,
};

