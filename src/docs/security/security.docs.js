/**
 * security.docs.js — OpenAPI Security Schemes.
 */
'use strict';

module.exports = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter your JWT access token (with or without "Bearer " prefix).',
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};
