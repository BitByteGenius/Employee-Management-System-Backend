/**
 * task.docs.js — OpenAPI documentation for Task endpoints.
 */
'use strict';

module.exports = {
  '/tasks': {
    get: {
      tags: ['Tasks'],
      summary: 'List tasks with multi-criteria filtering',
      parameters: [
        { name: 'project', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['todo', 'in_progress', 'review', 'completed'] } },
        { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] } },
        { name: 'assignee', in: 'query', schema: { type: 'string' } },
        { name: 'department', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
      ],
      responses: { 200: { description: 'Tasks list retrieved' } },
    },
    post: {
      tags: ['Tasks'],
      summary: 'Create and assign a task (supports file attachment)',
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['title'],
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                project: { type: 'string' },
                department: { type: 'string' },
                assignee: { type: 'string' },
                priority: { type: 'string' },
                dueDate: { type: 'string', format: 'date-time' },
                file: { type: 'string', format: 'binary' },
              },
            },
          },
          'application/json': { schema: { $ref: '#/components/schemas/CreateTaskRequest' } },
        },
      },
      responses: { 201: { description: 'Task created and assigned' } },
    },
  },
  '/tasks/{id}': {
    get: {
      tags: ['Tasks'],
      summary: 'Get task details by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Task details retrieved' } },
    },
    patch: {
      tags: ['Tasks'],
      summary: 'Update task properties',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTaskRequest' } } },
      },
      responses: { 200: { description: 'Task updated' } },
    },
    delete: {
      tags: ['Tasks'],
      summary: 'Soft-delete task [Admin+]',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Task deleted' } },
    },
  },
  '/tasks/{id}/status': {
    patch: {
      tags: ['Tasks'],
      summary: 'Update task progress status',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskStatusRequest' } } },
      },
      responses: { 200: { description: 'Task status updated' } },
    },
  },
};
