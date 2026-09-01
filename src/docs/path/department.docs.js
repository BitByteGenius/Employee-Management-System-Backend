/**
 * department.docs.js — OpenAPI documentation for Department endpoints.
 */
'use strict';

module.exports = {
  '/departments': {
    get: {
      tags: ['Departments'],
      summary: 'List all departments with admin details and headcounts',
      responses: { 200: { description: 'Departments list retrieved' } },
    },
    post: {
      tags: ['Departments'],
      summary: 'Create a new department [Super Admin]',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDepartmentRequest' } } },
      },
      responses: { 201: { description: 'Department created' } },
    },
  },
  '/departments/admin-candidates': {
    get: {
      tags: ['Departments'],
      summary: 'List eligible users for department admin assignment [Super Admin]',
      responses: { 200: { description: 'Candidate list retrieved' } },
    },
  },
  '/departments/{id}': {
    get: {
      tags: ['Departments'],
      summary: 'Get department details by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Department retrieved' } },
    },
    put: {
      tags: ['Departments'],
      summary: 'Update department information [Super Admin]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDepartmentRequest' } } },
      },
      responses: { 200: { description: 'Department updated' } },
    },
    delete: {
      tags: ['Departments'],
      summary: 'Delete department [Super Admin]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Department deleted' } },
    },
  },
  '/departments/{id}/admin': {
    put: {
      tags: ['Departments'],
      summary: 'Assign or reassign department admin [Super Admin]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { adminId: { type: 'string' } } } } },
      },
      responses: { 200: { description: 'Department admin assigned' } },
    },
  },
  '/departments/{id}/employees': {
    get: {
      tags: ['Departments'],
      summary: 'List all employees assigned to department',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Department employees list' } },
    },
  },
};
