/**
 * project.docs.js — OpenAPI documentation for Project endpoints.
 */
'use strict';

module.exports = {
  '/projects': {
    get: {
      tags: ['Projects & Deliverables'],
      summary: 'List projects (scoped by user role & department)',
      parameters: [
        { name: 'department', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'on_hold', 'completed'] } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: { 200: { description: 'Projects list retrieved' } },
    },
    post: {
      tags: ['Projects & Deliverables'],
      summary: 'Create a new project [Admin+]',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProjectRequest' } } },
      },
      responses: { 201: { description: 'Project created' } },
    },
  },
  '/projects/{id}': {
    get: {
      tags: ['Projects & Deliverables'],
      summary: 'Get project details and deliverables',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Project details retrieved' } },
    },
    put: {
      tags: ['Projects & Deliverables'],
      summary: 'Update project details [Admin+]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProjectRequest' } } },
      },
      responses: { 200: { description: 'Project updated' } },
    },
    delete: {
      tags: ['Projects & Deliverables'],
      summary: 'Delete project [Super Admin]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Project deleted' } },
    },
  },
  '/projects/{id}/deliverables': {
    post: {
      tags: ['Projects & Deliverables'],
      summary: 'Upload and attach deliverable files/notes to project',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: { type: 'string', format: 'binary' },
                notes: { type: 'string' },
                submissionDeadline: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      responses: { 200: { description: 'Deliverable attached' } },
    },
  },
};
