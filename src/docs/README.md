# 📚 TeamOrbit TMS Documentation Center

Welcome to the **TeamOrbit TMS (Task Management System)** backend documentation directory.

---

## 🗂️ Directory Structure

```
backend/src/docs/
├── index.js                      # Aggregates all modular documentation parts & mounts Swagger UI
├── swagger.js                    # Backwards compatibility export
├── README.md                     # This documentation map
├── AI_INTEGRATION_GUIDE.md       # Complete OpenAI integration reference & prompt designs
├── BACKEND_ARCHITECTURE.md       # Architecture analysis, RBAC matrix, and middleware flows
│
├── info/                         # API title, description, version, contact, and licenses
│   └── info.docs.js
├── server/                       # Target server base URLs (local, staging, prod)
│   └── servers.docs.js
├── security/                     # JWT Bearer Token security scheme definition
│   └── security.docs.js
├── tags/                         # API module category tags
│   └── tags.docs.js
├── components/                   # Reusable request & response schemas
│   └── schemas.docs.js
└── path/                         # Modular endpoint paths grouped by domain
    ├── auth.docs.js              # Authentication, login, register, token refresh
    ├── ai.docs.js                # OpenAI task enhancement, subtasks, summaries
    ├── user.docs.js              # User profiles, approvals, Cloudinary avatars
    ├── department.docs.js        # Department CRUD, admin assignments, headcounts
    ├── project.docs.js           # Project tracking & deliverables
    ├── task.docs.js              # Task delegation, status changes, priorities
    ├── timeTracking.docs.js      # Work hour logs & manager approvals
    ├── notification.docs.js      # Live alert feeds & unread counts
    ├── analytics.docs.js         # Analytics KPIs & workload reports
    ├── audit.docs.js             # Audit trail inspection
    └── roleSetting.docs.js       # System roles & global configurations
```

---

## 🌐 Accessing Swagger UI

Once the backend is running (`npm run dev` or `npm start`):

- **Interactive Swagger UI**: 👉 `http://localhost:5000/api-docs`
- **Raw OpenAPI 3.0 JSON Spec**: 👉 `http://localhost:5000/api-docs/swagger.json`
- **Convenience Redirects**: `/docs`, `/swagger`, and `/api/v1/docs` all forward to `/api-docs`.

---

## 🤖 OpenAI AI Assistant Capabilities

All AI endpoints live under `/api/v1/ai` and are documented in [`AI_INTEGRATION_GUIDE.md`](./AI_INTEGRATION_GUIDE.md):

1. **`POST /api/v1/ai/improve-description`**: Transforms brief task notes into structured markdown specs with acceptance criteria.
2. **`POST /api/v1/ai/suggest-subtasks`**: Generates sequential subtasks with time estimates.
3. **`POST /api/v1/ai/summarize-task`**: Evaluates task risk level and generates executive briefs from real MongoDB tasks.
4. **`POST /api/v1/ai/generate-task`**: Translates user prompts into complete task definitions.
5. **`POST /api/v1/ai/summarize-project`**: Aggregates all project tasks into a strategic delivery report.
6. **`POST /api/v1/ai/estimate-effort`**: Calculates story points, estimated hours, and complexity.
