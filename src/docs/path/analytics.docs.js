/**
 * analytics.docs.js — OpenAPI documentation for Analytics & Reports.
 */
'use strict';

module.exports = {
  '/analytics/summary': {
    get: {
      tags: ['Analytics & Reports'],
      summary: 'Executive dashboard KPI summary [Super Admin]',
      responses: { 200: { description: 'Analytics summary retrieved' } },
    },
  },
  '/reports/workload': {
    get: {
      tags: ['Analytics & Reports'],
      summary: 'Team workload distribution report [Admin+]',
      responses: { 200: { description: 'Workload report retrieved' } },
    },
  },
  '/reports/project-progress': {
    get: {
      tags: ['Analytics & Reports'],
      summary: 'Project progress and milestone delivery report [Admin+]',
      responses: { 200: { description: 'Progress report retrieved' } },
    },
  },
};
