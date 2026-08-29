/**
 * notification.docs.js — OpenAPI documentation for Notification endpoints.
 */
'use strict';

module.exports = {
  '/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'Get user notifications feed',
      responses: { 200: { description: 'Notifications feed retrieved' } },
    },
  },
  '/notifications/unread-count': {
    get: {
      tags: ['Notifications'],
      summary: 'Get count of unread notifications',
      responses: { 200: { description: 'Unread count retrieved' } },
    },
  },
  '/notifications/recent-activity': {
    get: {
      tags: ['Notifications'],
      summary: 'Get global recent activity stream',
      responses: { 200: { description: 'Recent activities retrieved' } },
    },
  },
  '/notifications/{id}/read': {
    patch: {
      tags: ['Notifications'],
      summary: 'Mark single notification as read',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Notification marked as read' } },
    },
  },
  '/notifications/read-all': {
    patch: {
      tags: ['Notifications'],
      summary: 'Mark all user notifications as read',
      responses: { 200: { description: 'All notifications marked as read' } },
    },
  },
};
