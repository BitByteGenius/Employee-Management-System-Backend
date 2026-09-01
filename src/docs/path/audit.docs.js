/**
 * audit.docs.js — OpenAPI documentation for Audit Logs.
 */
'use strict';

module.exports = {
  '/audit-logs': {
    get: {
      tags: ['Audit Logs'],
      summary: 'Search and inspect system audit trail [Super Admin]',
      parameters: [
        { name: 'action', in: 'query', schema: { type: 'string' } },
        { name: 'entity', in: 'query', schema: { type: 'string' } },
        { name: 'performedBy', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: { description: 'Audit logs retrieved' } },
    },
  },
};
