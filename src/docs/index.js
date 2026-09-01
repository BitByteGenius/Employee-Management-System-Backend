/**
 * index.js — Aggregator for modular OpenAPI 3.0.3 specification & Swagger UI.
 */
'use strict';

const swaggerUi = require('swagger-ui-express');

// Import modular documentation segments
const info = require('./info/info.docs');
const servers = require('./server/servers.docs');
const security = require('./security/security.docs');
const tags = require('./tags/tags.docs');
const schemas = require('./components/schemas.docs');

// Import modular paths
const authPaths = require('./path/auth.docs');
const aiPaths = require('./path/ai.docs');
const userPaths = require('./path/user.docs');
const departmentPaths = require('./path/department.docs');
const projectPaths = require('./path/project.docs');
const taskPaths = require('./path/task.docs');
const timeTrackingPaths = require('./path/timeTracking.docs');
const notificationPaths = require('./path/notification.docs');
const analyticsPaths = require('./path/analytics.docs');
const auditPaths = require('./path/audit.docs');
const roleSettingPaths = require('./path/roleSetting.docs');

// Aggregate complete OpenAPI 3.0 specification
const openapiSpec = {
  openapi: '3.0.3',
  info,
  servers,
  tags,
  security: security.security,
  components: {
    securitySchemes: security.securitySchemes,
    schemas,
  },
  paths: {
    ...authPaths,
    ...aiPaths,
    ...userPaths,
    ...departmentPaths,
    ...projectPaths,
    ...taskPaths,
    ...timeTrackingPaths,
    ...notificationPaths,
    ...analyticsPaths,
    ...auditPaths,
    ...roleSettingPaths,
  },
};

const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { background-color: #0F172A; padding: 12px 0; border-bottom: 2px solid #2563EB; }
    .swagger-ui .topbar .topbar-wrapper img { content: url('https://res.cloudinary.com/r992dui2/image/upload/v1/teamorbit/avatars/logo'); width: 36px; height: 36px; }
    .swagger-ui .info .title { color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .swagger-ui .scheme-container { background-color: #F8FAFC; border-radius: 8px; box-shadow: none; border: 1px solid #E2E8F0; }
    .swagger-ui .opblock.opblock-post { border-color: #2563EB; background: rgba(37, 99, 235, 0.04); }
    .swagger-ui .opblock.opblock-get { border-color: #059669; background: rgba(5, 150, 105, 0.04); }
    .swagger-ui .opblock.opblock-patch { border-color: #D97706; background: rgba(217, 119, 6, 0.04); }
    .swagger-ui .opblock.opblock-delete { border-color: #DC2626; background: rgba(220, 38, 38, 0.04); }
  `,
  customSiteTitle: 'TeamOrbit TMS — API Documentation',
  customfavIcon: 'https://res.cloudinary.com/r992dui2/image/upload/v1/teamorbit/avatars/favicon',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
};

function setupSwagger(app) {
  // 1. Raw OpenAPI Spec JSON endpoint
  app.get(['/api-docs/swagger.json', '/swagger.json'], (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(openapiSpec);
  });

  // 2. Swagger UI HTML Documentation (Handles /api-docs and /api-docs/)
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(openapiSpec, swaggerOptions));

  // 3. Convenience Redirects
  app.get(['/docs', '/swagger', '/api/v1/docs'], (req, res) => {
    res.redirect('/api-docs');
  });

  console.log('[Swagger] Modular API Documentation mounted at: /api-docs');
}

module.exports = {
  setupSwagger,
  openapiSpec,
  swaggerDocument: openapiSpec,
};
