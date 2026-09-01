/**
 * servers.docs.js — OpenAPI Server configurations.
 */
'use strict';

module.exports = [
  {
    url: '/api/v1',
    description: 'Relative API v1 Base Route',
  },
  {
    url: 'http://localhost:5000/api/v1',
    description: 'Local Development Server (Default: Port 5000)',
  },
  {
    url: 'https://api.teamorbit.com/api/v1',
    description: 'Production Cloud API',
  },
];
