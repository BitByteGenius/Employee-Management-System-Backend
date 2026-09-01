# 🏛️ TeamOrbit TMS Backend Architecture & API Conventions

This document provides a deep architectural analysis of the **TeamOrbit TMS Node.js/Express Backend**.

---

## 1. High-Level Architecture Overview

The backend uses a **Domain-Driven Modular MVC / Layered Architecture** with Express 5, MongoDB (Mongoose 9), and JWT authentication.

```
Incoming Request
      │
      ▼
[ Security Middlewares: Helmet, CORS, Rate Limiting, Cookie Parser, Compression ]
      │
      ▼
[ Express Router (routes/index.js) ]
      │
      ├── /api/v1/auth          ──► [ auth.controller.js  ] ──► [ auth.service.js  ] ──► [ User Model ]
      ├── /api/v1/users         ──► [ user.controller.js  ] ──► [ user.service.js  ] ──► [ User Model ]
      ├── /api/v1/departments   ──► [ dept.controller.js  ] ──► [ dept.service.js  ] ──► [ Department Model ]
      ├── /api/v1/projects      ──► [ proj.controller.js  ] ──► [ proj.service.js  ] ──► [ Project Model ]
      ├── /api/v1/tasks         ──► [ taskController.js   ] ──► [ taskService.js   ] ──► [ Task Model ]
      ├── /api/v1/time-tracking ──► [ time.controller.js  ] ──► [ time.service.js  ] ──► [ TimeLog Model ]
      ├── /api/v1/ai            ──► [ ai.controller.js    ] ──► [ ai.service.js    ] ──► [ OpenAI API ]
      └── /api/v1/notifications ──► [ notif.controller.js ] ──► [ notif.service.js ] ──► [ Notification Model ]
```

---

## 2. Authentication & Authorization Pipeline

### Dual JWT Token Flow
1. **Access Token (15m/45m)**: Signed with `JWT_ACCESS_SECRET`. Sent in `Authorization: Bearer <token>` header or `accessToken` cookie.
2. **Refresh Token (7d)**: Signed with `JWT_REFRESH_SECRET`. Stored in DB and exchanged via `POST /api/v1/auth/refresh-token`.

### `auth.middleware.js` Behavior
- Validates the token and verifies user status in MongoDB (`isActive: true`, `status: 'approved'`).
- Attaches the complete context to `req.user`:
  ```javascript
  req.user = {
    id: user._id.toString(),
    email: user.email,
    name: user.fullName,
    role: 'super_admin' | 'admin' | 'employee',
    systemRole: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE',
    permissions: ['users:read', 'tasks:manage', ...],
    departmentId: '...',
    departmentName: '...',
    isSuperAdmin: Boolean,
  };
  ```

---

## 3. Role-Based Access Control (RBAC) Matrix

| Permission Key | Super Admin | Department Admin | Employee |
| :--- | :---: | :---: | :---: |
| `users:read` | ✅ | ✅ | ❌ |
| `users:manage` | ✅ | ❌ | ❌ |
| `departments:read` | ✅ | ✅ | ❌ |
| `departments:manage`| ✅ | ❌ | ❌ |
| `projects:read` | ✅ (Global) | ✅ (Dept Scoped) | ✅ (Assigned) |
| `projects:manage` | ✅ | ✅ (Dept Scoped) | ❌ |
| `tasks:read` | ✅ | ✅ | ✅ |
| `tasks:manage` | ✅ | ✅ | ❌ |
| `tasks:approve` | ✅ | ✅ | ❌ |
| `reports:read` | ✅ | ✅ | ❌ |
| `analytics:read` | ✅ | ✅ | ❌ |
| `audit:read` | ✅ | ❌ | ❌ |
| `settings:manage` | ✅ | ❌ | ❌ |
| `notifications:read`| ✅ | ✅ | ✅ |

---

## 4. API Conventions & Standard Response Formats

### Standard Success Response (200 / 201)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

### Standard Error Response (400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": "Detailed validation or system error"
}
```

---

## 5. File Uploads & Cloudinary CDN Pipeline

- Uploads use `multer.memoryStorage()` to pipe file buffers directly to Cloudinary without creating local disk artifacts.
- Upload middleware: [`uploadMiddleware.js`](../middlewares/uploadMiddleware.js).
- Avatars and Deliverables are uploaded with secure HTTPS URLs and stored in MongoDB documents.
