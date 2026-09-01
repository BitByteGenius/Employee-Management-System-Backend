/**
 * roleSetting.docs.js — OpenAPI documentation for Roles & Settings.
 */
'use strict';

module.exports = {
  '/roles': {
    get: {
      tags: ['Roles & Settings'],
      summary: 'List available system and custom roles',
      responses: { 200: { description: 'Roles list retrieved' } },
    },
  },
  '/settings': {
    get: {
      tags: ['Roles & Settings'],
      summary: 'List system configurations and settings',
      responses: { 200: { description: 'Settings retrieved' } },
    },
  },
};
