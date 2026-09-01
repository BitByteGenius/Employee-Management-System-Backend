'use strict';

const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { formatAuditLog } = require('../modules/audit/controllers/audit.controller');

let io;

const setSocketServer = (server) => {
  io = server;
};

/**
 * Emit socket notification event to a specific user
 */
const emitToUser = (userId, notification) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit('notification:new', notification);
    io.to(`user:${userId}`).emit('notification:count', { delta: 1 });
  }
};

/**
 * Create and send a single notification
 */
const notify = async (payload) => {
  try {
    if (!payload.recipient) return null;
    const notification = await Notification.create(payload);
    emitToUser(payload.recipient.toString(), notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Create and send notifications to multiple recipients
 */
const notifyMany = async (recipients = [], payloadTemplate = {}) => {
  try {
    if (!Array.isArray(recipients) || recipients.length === 0) return [];
    
    // Deduplicate and filter valid IDs
    const uniqueRecipients = [...new Set(recipients.map((r) => r?.toString()))].filter(
      (id) => id && mongoose.Types.ObjectId.isValid(id)
    );

    if (uniqueRecipients.length === 0) return [];

    const notifications = uniqueRecipients.map((recipientId) => ({
      ...payloadTemplate,
      recipient: recipientId,
    }));

    const created = await Notification.insertMany(notifications);
    created.forEach((notif) => {
      emitToUser(notif.recipient.toString(), notif);
    });

    return created;
  } catch (error) {
    console.error('Error in notifyMany:', error);
    return [];
  }
};

/**
 * Query notifications for a specific user with pagination and category filtering
 */
const getNotifications = async ({
  userId,
  page = 1,
  limit = 20,
  category = 'all',
  isRead,
  search = '',
}) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const query = {
    recipient: userId,
    isDismissed: { $ne: true },
    deletedAt: null,
  };

  // Category filtering
  if (category && category !== 'all') {
    const catLower = category.toLowerCase().trim();
    if (catLower === 'unread') {
      query.isRead = false;
    } else if (catLower === 'projects' || catLower === 'project') {
      query.category = { $in: ['projects', 'project', 'task'] };
    } else if (catLower === 'system') {
      query.category = 'system';
    } else if (catLower === 'team') {
      query.category = 'team';
    } else {
      query.category = catLower;
    }
  }

  // Explicit isRead query override
  if (isRead !== undefined && isRead !== null && isRead !== '') {
    if (isRead === true || isRead === 'true') {
      query.isRead = true;
    } else if (isRead === false || isRead === 'false') {
      query.isRead = false;
    }
  }

  // Search filter
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ title: regex }, { message: regex }];
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate('sender', 'firstName lastName fullName email profilePicture designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({
      recipient: userId,
      isRead: false,
      isDismissed: { $ne: true },
      deletedAt: null,
    }),
  ]);

  return {
    data: notifications.map((n) => ({
      ...n,
      id: n._id.toString(),
      _id: n._id.toString(),
    })),
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
    isDismissed: { $ne: true },
    deletedAt: null,
  });
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const updated = await Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { isRead: true, readAt: new Date() },
    { returnDocument: 'after' }
  ).populate('sender', 'firstName lastName fullName email profilePicture designation').lean();

  return updated ? { ...updated, id: updated._id.toString() } : null;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false, deletedAt: null },
    { isRead: true, readAt: new Date() }
  );

  return { success: true };
};

/**
 * Dismiss a notification
 */
const dismissNotification = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const dismissed = await Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { isDismissed: true, dismissedAt: new Date() },
    { returnDocument: 'after' }
  ).lean();

  return dismissed ? { ...dismissed, id: dismissed._id.toString() } : null;
};

/**
 * Get Recent Activities for the authenticated user based on role and scope
 */
const getRecentActivities = async ({ user, limit = 10 }) => {
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 30);
  const filter = {};

  // Role-based activity filtering
  if (!user.isSuperAdmin) {
    if (user.role === 'admin' && user.departmentId) {
      filter.$or = [
        { 'metadata.departmentId': user.departmentId },
        { actor: user.id },
      ];
    } else {
      // Employee
      filter.$or = [
        { actor: user.id },
        { 'metadata.targetUserId': user.id },
        { 'metadata.assigneeId': user.id },
      ];
    }
  }

  const logs = await AuditLog.find(filter)
    .populate('actor', 'firstName lastName fullName email employeeCode systemRole profilePicture')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .lean();

  if (logs.length > 0) {
    return logs.map((log) => {
      const formatted = formatAuditLog(log);
      return {
        id: log._id.toString(),
        title: formatted.title,
        description: formatted.description,
        time: formatted.time,
        createdAt: log.createdAt,
        actorName: formatted.actorName,
        actorEmail: formatted.actorEmail,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
      };
    });
  }

  // Fallback: If no audit logs match for employee/admin, fetch recent system audit logs
  const fallbackLogs = await AuditLog.find({})
    .populate('actor', 'firstName lastName fullName email employeeCode systemRole profilePicture')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .lean();

  return fallbackLogs.map((log) => {
    const formatted = formatAuditLog(log);
    return {
      id: log._id.toString(),
      title: formatted.title,
      description: formatted.description,
      time: formatted.time,
      createdAt: log.createdAt,
      actorName: formatted.actorName,
      actorEmail: formatted.actorEmail,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
    };
  });
};

module.exports = {
  setSocketServer,
  notify,
  notifyMany,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  getRecentActivities,
};

