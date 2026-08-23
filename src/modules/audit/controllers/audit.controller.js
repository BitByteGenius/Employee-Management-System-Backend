'use strict';

const AuditLog = require('../models/audit-log.model');
const asyncHandler = require('../../../shared/utils/async-handler.util');

const formatTimeAgo = (date) => {
  if (!date) return 'Recently';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const formatAuditLog = (log) => {
  const meta = log.metadata || {};
  const actorName = log.actor?.fullName || log.actor?.name || (log.actor?.firstName ? `${log.actor.firstName} ${log.actor.lastName || ''}`.trim() : (meta.actorName || 'Super Admin'));
  const targetName = meta.targetUserName || (log.actor ? actorName : 'User');
  const action = log.action || '';

  let title = '';
  let description = '';

  if (action === 'auth.login') {
    title = `${actorName} logged in`;
    description = 'User logged into the platform';
  } else if (action === 'auth.logout') {
    title = `${actorName} logged out`;
    description = 'User signed out';
  } else if (action === 'user.approve') {
    title = `${targetName} approved`;
    description = meta.roleName ? `Approved as ${meta.roleName}` : 'Registration request approved';
  } else if (action === 'user.reject') {
    title = `Rejected ${targetName}`;
    description = 'Registration request denied';
  } else if (action === 'user.assign_role') {
    const role = meta.roleName || 'Role';
    title = `Assigned ${role} to ${targetName}`;
    description = meta.departmentName ? `Department: ${meta.departmentName}` : 'Role updated';
  } else if (action === 'user.assign_department') {
    const dept = meta.departmentName || 'Department';
    title = `Assigned ${dept} to ${targetName}`;
    description = 'Department assignment updated';
  } else if (action === 'user.delete') {
    title = `Deleted ${targetName}`;
    description = 'User account deleted';
  } else if (action.includes('department.create') || (action.includes('create') && log.entityType === 'Department')) {
    title = `Created department ${meta.name || meta.code || ''}`.trim();
    description = 'New department created';
  } else if (action.includes('project.create') || (action.includes('create') && log.entityType === 'Project')) {
    title = `Created project ${meta.name || ''}`.trim();
    description = 'New project created';
  } else if (action.includes('task.create') || (action.includes('create') && log.entityType === 'Task')) {
    title = `Created task ${meta.title || ''}`.trim();
    description = 'New task created';
  } else {
    const formattedAction = action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = targetName && targetName !== 'User' ? `${formattedAction} • ${targetName}` : formattedAction;
    description = log.entityType ? `${log.entityType} event` : 'System event';
  }

  return {
    id: log._id,
    action: log.action,
    entityType: log.entityType,
    title,
    description,
    actorName,
    actorEmail: log.actor?.email,
    targetName: meta.targetUserName || null,
    targetEmail: meta.targetUserEmail || null,
    time: formatTimeAgo(log.createdAt),
    createdAt: log.createdAt,
    metadata: meta,
  };
};

const list = asyncHandler(async (req, res) => {
  const { limit = 50, action, entityType } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (entityType) filter.entityType = entityType;

  const logs = await AuditLog.find(filter)
    .populate('actor', 'firstName lastName fullName email employeeCode systemRole')
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 100));

  res.json({
    success: true,
    data: logs.map(formatAuditLog),
    meta: {
      count: logs.length,
    },
  });
});

module.exports = { list, formatAuditLog };
