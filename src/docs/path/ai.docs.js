/**
 * ai.docs.js — OpenAPI documentation for AI Assistant endpoints.
 */
'use strict';

module.exports = {
  '/ai/status': {
    get: {
      tags: ['AI Assistant'],
      summary: 'Check OpenAI integration status & active model',
      description: 'Returns whether live OpenAI API is configured, active model (e.g. gpt-4o-mini), and available AI capabilities.',
      responses: {
        200: { description: 'AI configuration and capabilities returned' },
      },
    },
  },
  '/ai/improve-description': {
    post: {
      tags: ['AI Assistant'],
      summary: 'Enhance task description with acceptance criteria',
      description: 'Uses OpenAI to structure raw task notes into clear objectives, scope, acceptance criteria, and technical notes. Can fetch real task data if `taskId` is provided.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/AiImproveDescriptionRequest' } } },
      },
      responses: {
        200: { description: 'Improved Markdown description generated' },
        400: { description: 'Missing required parameters' },
      },
    },
  },
  '/ai/suggest-subtasks': {
    post: {
      tags: ['AI Assistant'],
      summary: 'Generate sequential subtasks with time estimates',
      description: 'Breaks down a parent task into actionable subtasks with estimated hours and priorities.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/AiSubtasksRequest' } } },
      },
      responses: {
        200: { description: 'Subtask breakdown generated' },
      },
    },
  },
  '/ai/summarize-task': {
    post: {
      tags: ['AI Assistant'],
      summary: 'Generate executive summary & risk analysis for a task',
      description: 'Analyzes task status, logged hours, priority, and due date to produce risk assessments and next action items.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/AiSummarizeTaskRequest' } } },
      },
      responses: {
        200: { description: 'Executive task summary returned' },
      },
    },
  },
  '/ai/generate-task': {
    post: {
      tags: ['AI Assistant'],
      summary: 'Convert natural language idea into a complete task',
      description: 'Translates unstructured prompts into complete task definitions with priority, estimated hours, and suggested subtasks.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/AiGenerateTaskRequest' } } },
      },
      responses: {
        200: { description: 'Structured task specification generated' },
      },
    },
  },
  '/ai/summarize-project': {
    post: {
      tags: ['AI Assistant'],
      summary: 'Generate strategic project health & status report',
      description: 'Aggregates all project tasks, milestones, deliverables, and overdue items from MongoDB.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/AiSummarizeProjectRequest' } } },
      },
      responses: {
        200: { description: 'Project delivery report returned' },
      },
    },
  },
  '/ai/estimate-effort': {
    post: {
      tags: ['AI Assistant'],
      summary: 'Estimate story points, hours, and required skills',
      description: 'Calculates agile estimation metrics for a given task specification.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/AiEstimateEffortRequest' } } },
      },
      responses: {
        200: { description: 'Effort estimation generated' },
      },
    },
  },
};
