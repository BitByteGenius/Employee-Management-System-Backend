/**
 * timeTracking.docs.js — OpenAPI documentation for Time Tracking endpoints.
 */
'use strict';

module.exports = {
  '/time-tracking': {
    get: {
      tags: ['Time Tracking'],
      summary: 'List time log entries (scoped by role & user)',
      parameters: [
        { name: 'user', in: 'query', schema: { type: 'string' } },
        { name: 'department', in: 'query', schema: { type: 'string' } },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
      ],
      responses: { 200: { description: 'Time logs retrieved' } },
    },
    post: {
      tags: ['Time Tracking'],
      summary: 'Log work hours for a task',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTimeLogRequest' } } },
      },
      responses: { 201: { description: 'Time log recorded' } },
    },
  },
  '/time-tracking/{id}/status': {
    patch: {
      tags: ['Time Tracking'],
      summary: 'Approve or reject a submitted time log [Admin+]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['approved', 'rejected'] } } } } },
      },
      responses: { 200: { description: 'Time log status updated' } },
    },
  },
};
