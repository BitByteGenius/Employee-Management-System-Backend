/**
 * schemas.docs.js — OpenAPI Request & Response Data Models.
 */
'use strict';

module.exports = {
  // Standard API Wrapper Schemas
  StandardSuccess: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Operation completed successfully.' },
      data: { type: 'object' },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Invalid credentials or validation error.' },
      error: { type: 'string' },
    },
  },

  // Auth Schemas
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'superadmin@teamorbit.com' },
      password: { type: 'string', format: 'password', example: 'SuperAdmin@123!' },
    },
  },
  RegisterRequest: {
    type: 'object',
    required: ['email', 'password', 'firstName', 'lastName'],
    properties: {
      firstName: { type: 'string', example: 'Alex' },
      lastName: { type: 'string', example: 'Rivera' },
      email: { type: 'string', format: 'email', example: 'alex.rivera@company.com' },
      password: { type: 'string', format: 'password', example: 'SecurePassword123!' },
      designation: { type: 'string', example: 'Senior Software Engineer' },
      department: { type: 'string', example: '66b5f903e1a0429f9589d10a' },
    },
  },
  RefreshTokenRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
    },
  },

  // User & Profile Schemas
  UserProfileUpdate: {
    type: 'object',
    properties: {
      firstName: { type: 'string', example: 'Alex' },
      lastName: { type: 'string', example: 'Rivera' },
      phone: { type: 'string', example: '+1 555-0199' },
      designation: { type: 'string', example: 'Lead Architect' },
      address: { type: 'string', example: '742 Evergreen Terrace, Springfield' },
      dateOfBirth: { type: 'string', format: 'date', example: '1992-05-14' },
      bio: { type: 'string', example: 'Passionate full-stack developer with 8+ years building enterprise SaaS.' },
      emergencyContact: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Jane Rivera' },
          relationship: { type: 'string', example: 'Spouse' },
          phone: { type: 'string', example: '+1 555-0188' },
        },
      },
    },
  },
  UserApprovalRequest: {
    type: 'object',
    properties: {
      systemRole: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'], example: 'EMPLOYEE' },
      assignedRole: { type: 'string', example: '66b5f903e1a0429f9589d10a' },
      department: { type: 'string', example: '66b5f903e1a0429f9589d10b' },
    },
  },

  // Department Schemas
  CreateDepartmentRequest: {
    type: 'object',
    required: ['name', 'code'],
    properties: {
      name: { type: 'string', example: 'Engineering' },
      code: { type: 'string', example: 'ENG' },
      description: { type: 'string', example: 'Software development, DevOps, and QA operations' },
      admin: { type: 'string', example: '66b5f903e1a0429f9589d10c' },
      budget: { type: 'number', example: 500000 },
    },
  },

  // Project Schemas
  CreateProjectRequest: {
    type: 'object',
    required: ['name', 'key'],
    properties: {
      name: { type: 'string', example: 'Cloud Infrastructure Migration' },
      key: { type: 'string', example: 'CIM' },
      description: { type: 'string', example: 'Migrate on-prem microservices to AWS EKS with zero downtime.' },
      department: { type: 'string', example: '66b5f903e1a0429f9589d10b' },
      manager: { type: 'string', example: '66b5f903e1a0429f9589d10c' },
      startDate: { type: 'string', format: 'date-time', example: '2026-09-01T00:00:00.000Z' },
      dueDate: { type: 'string', format: 'date-time', example: '2026-12-15T00:00:00.000Z' },
      status: { type: 'string', enum: ['active', 'on_hold', 'completed'], example: 'active' },
    },
  },

  // Task Schemas
  CreateTaskRequest: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string', example: 'Setup Redis Caching for User Sessions' },
      description: { type: 'string', example: 'Deploy Redis cluster and integrate token session blacklisting.' },
      project: { type: 'string', example: '66b5f903e1a0429f9589d10d' },
      department: { type: 'string', example: '66b5f903e1a0429f9589d10b' },
      assignee: { type: 'string', example: '66b5f903e1a0429f9589d10e' },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'high' },
      status: { type: 'string', enum: ['todo', 'in_progress', 'review', 'completed'], example: 'todo' },
      dueDate: { type: 'string', format: 'date-time', example: '2026-09-10T18:00:00.000Z' },
    },
  },
  UpdateTaskStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['todo', 'in_progress', 'review', 'completed'], example: 'in_progress' },
    },
  },

  // Time Tracking Schemas
  CreateTimeLogRequest: {
    type: 'object',
    required: ['hours'],
    properties: {
      task: { type: 'string', example: '66b5f903e1a0429f9589d10f' },
      taskName: { type: 'string', example: 'Implement Swagger UI API Docs' },
      project: { type: 'string', example: '66b5f903e1a0429f9589d10d' },
      hours: { type: 'number', example: 4.5 },
      date: { type: 'string', format: 'date', example: '2026-08-29' },
      notes: { type: 'string', example: 'Designed OpenAPI 3.0 specification and mounted Swagger UI.' },
    },
  },

  // AI Assistant Schemas
  AiImproveDescriptionRequest: {
    type: 'object',
    properties: {
      title: { type: 'string', example: 'Implement User Profile Avatars' },
      description: { type: 'string', example: 'need avatars everywhere on all pages uploaded to cloudinary' },
      tone: { type: 'string', enum: ['professional', 'technical', 'concise'], example: 'professional' },
      taskId: { type: 'string', description: 'Optional MongoDB task ID to load real task context from database', example: '66b5f903e1a0429f9589d10f' },
    },
  },
  AiSubtasksRequest: {
    type: 'object',
    properties: {
      title: { type: 'string', example: 'Migrate MongoDB Cluster to Atlas' },
      description: { type: 'string', example: 'Execute zero-downtime database migration' },
      projectContext: { type: 'string', example: 'Infrastructure Upgrade Q3' },
      count: { type: 'integer', minimum: 2, maximum: 8, example: 4 },
      taskId: { type: 'string', example: '66b5f903e1a0429f9589d10f' },
    },
  },
  AiSummarizeTaskRequest: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: 'MongoDB Task ID to fetch real task & time logs from database', example: '66b5f903e1a0429f9589d10f' },
      taskDetails: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Payment Gateway Integration' },
          description: { type: 'string', example: 'Integrate Stripe SDK and webhooks' },
          status: { type: 'string', example: 'in_progress' },
          priority: { type: 'string', example: 'high' },
        },
      },
    },
  },
  AiGenerateTaskRequest: {
    type: 'object',
    required: ['prompt'],
    properties: {
      prompt: { type: 'string', example: 'Build an automated cron job to calculate weekly employee workload and send email reports' },
      projectId: { type: 'string', example: '66b5f903e1a0429f9589d10d' },
    },
  },
  AiSummarizeProjectRequest: {
    type: 'object',
    required: ['projectId'],
    properties: {
      projectId: { type: 'string', example: '66b5f903e1a0429f9589d10d' },
    },
  },
  AiEstimateEffortRequest: {
    type: 'object',
    properties: {
      title: { type: 'string', example: 'Implement OAuth2 Google SSO Integration' },
      description: { type: 'string', example: 'Support Google login across mobile and web platforms' },
      complexity: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
      taskId: { type: 'string', example: '66b5f903e1a0429f9589d10f' },
    },
  },
};
