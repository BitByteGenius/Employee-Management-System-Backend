/**
 * user.docs.js — OpenAPI documentation for User and Profile endpoints.
 */
'use strict';

module.exports = {
  '/users': {
    get: {
      tags: ['Users & Profile'],
      summary: 'List organization users',
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
        { name: 'department', in: 'query', schema: { type: 'string' } },
        { name: 'role', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: { 200: { description: 'User directory retrieved' } },
    },
  },
  '/users/profile': {
    get: {
      tags: ['Users & Profile'],
      summary: 'Get current user profile with department and role info',
      responses: { 200: { description: 'User profile retrieved' } },
    },
    patch: {
      tags: ['Users & Profile'],
      summary: 'Update current user profile details',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfileUpdate' } } },
      },
      responses: { 200: { description: 'Profile updated successfully' } },
    },
  },
  '/users/profile/picture': {
    post: {
      tags: ['Users & Profile'],
      summary: 'Upload avatar to Cloudinary & update user record',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                avatar: { type: 'string', format: 'binary', description: 'Avatar image file (PNG/JPEG)' },
              },
            },
          },
        },
      },
      responses: { 200: { description: 'Avatar uploaded and saved to Cloudinary' } },
    },
  },
  '/users/{id}/approve': {
    post: {
      tags: ['Users & Profile'],
      summary: 'Approve pending user registration [Super Admin]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UserApprovalRequest' } } },
      },
      responses: { 200: { description: 'User approved' } },
    },
  },
  '/users/{id}/reject': {
    post: {
      tags: ['Users & Profile'],
      summary: 'Reject pending user registration [Super Admin]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'User rejected' } },
    },
  },
  '/users/{id}/role': {
    patch: {
      tags: ['Users & Profile'],
      summary: 'Update system or assigned role [Super Admin]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { systemRole: { type: 'string' }, roleId: { type: 'string' } } } } },
      },
      responses: { 200: { description: 'User role updated' } },
    },
  },
  '/users/{id}': {
    delete: {
      tags: ['Users & Profile'],
      summary: 'Soft-delete a user account [Super Admin]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'User deleted' } },
    },
  },
};
