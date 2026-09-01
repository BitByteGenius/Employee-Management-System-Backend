/**
 * auth.docs.js — OpenAPI documentation for Auth endpoints.
 */
'use strict';

module.exports = {
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Authenticate user & issue tokens',
      description: 'Validates user email/password and returns JWT Access Token (15m/45m) and Refresh Token (7d).',
      security: [],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
      },
      responses: {
        200: { description: 'Authentication successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      },
    },
  },
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new employee account',
      description: 'Creates a new user registration in pending approval state.',
      security: [],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
      },
      responses: {
        201: { description: 'Registration submitted successfully' },
        409: { description: 'Email already registered' },
      },
    },
  },
  '/auth/refresh-token': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh expired access token',
      description: 'Generates a new access token using a valid refresh token.',
      security: [],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } },
      },
      responses: {
        200: { description: 'New access token issued' },
        401: { description: 'Invalid or expired refresh token' },
      },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Terminate session and revoke tokens',
      responses: {
        200: { description: 'Logged out successfully' },
      },
    },
  },
  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get current user session & permissions',
      responses: {
        200: { description: 'User session verified' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
