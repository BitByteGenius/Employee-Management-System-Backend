/**
 * info.docs.js — OpenAPI 3.0 API Information metadata.
 */
'use strict';

module.exports = {
  title: 'TeamOrbit TMS — Enterprise API Documentation',
  version: '1.0.0',
  description: `
## 🚀 TeamOrbit Task Management System (TMS) API

Comprehensive, multi-tier enterprise workforce, department, project, task, and AI-assisted governance API.

### 🔐 Authentication Flow
1. Obtain an **Access Token** by logging in via \`POST /api/v1/auth/login\`.
2. Click the **Authorize 🔓** button at the top right and enter: \`Bearer <your_access_token>\` or simply paste your JWT token.
3. Requests will automatically include the \`Authorization: Bearer <token>\` header.

### 👥 System Roles & RBAC Matrix
- **👑 Super Admin (\`super_admin\` / \`SUPER_ADMIN\`)**: Global system-wide administrator with access to all departments, user approvals, audit trails, and portfolio analytics.
- **👔 Department Admin (\`admin\` / \`ADMIN\`)**: Departmental manager with workforce delegation, task creation, project tracking, time log approvals, and deliverable reviews.
- **💼 Employee (\`employee\` / \`EMPLOYEE\`)**: Standard organizational member with personal task board, progress updates, time tracking logs, and profile management.

### 🤖 AI Assistant (OpenAI Integration)
The system features native OpenAI-powered endpoints under \`/api/v1/ai\` for:
- Automated task description enhancement with acceptance criteria checklists
- Smart subtask breakdown with estimated effort and priorities
- Task & project executive summaries with risk analysis
- Natural language task generation
- Effort and complexity estimation
  `,
  contact: {
    name: 'TeamOrbit Engineering Support',
    email: 'support@teamorbit.com',
  },
  license: {
    name: 'ISC',
    url: 'https://opensource.org/licenses/ISC',
  },
};
