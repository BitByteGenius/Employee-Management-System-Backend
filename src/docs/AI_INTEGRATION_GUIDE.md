# 🤖 OpenAI AI Assistant Integration Guide

This guide details how the **OpenAI API** is integrated into the TeamOrbit Task Management System (TMS).

---

## 🛠️ Architecture & Core Components

```
Client (Flutter / Swagger / Web)
              │
              ▼  (Authenticated with JWT Bearer token)
     [ POST /api/v1/ai/* ]
              │
              ▼
   [ ai.controller.js ] ── (Fetches real Task / Project / TimeLogs if ID provided) ──► [ MongoDB ]
              │
              ▼
    [ ai.service.js ]
         │          │
 (Key Present)  (Key Absent / Offline)
         │          │
         ▼          ▼
   [ OpenAI API ]  [ Built-in TMS Intelligent Fallback Engine ]
```

---

## 🔑 Environment Configuration

Add the following keys to your `backend/.env` file:

```env
# OpenAI API Key (Obtain from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-your_actual_key_here

# OpenAI Model (Default: gpt-4o-mini, supports gpt-4o, gpt-3.5-turbo, etc.)
OPENAI_MODEL=gpt-4o-mini
```

> [!NOTE]
> If `OPENAI_API_KEY` is not provided or invalid, the **Built-in Intelligent Fallback Engine** automatically produces realistic, structured responses. This guarantees that local development, automated test suites, and staging environments continue to work seamlessly without crashing.

---

## 🚀 Endpoints Reference

All endpoints are authenticated using `auth.middleware.js` and accept JSON payloads.

### 1. Check AI Status
- **Method**: `GET /api/v1/ai/status`
- **Response**:
```json
{
  "success": true,
  "data": {
    "isConfigured": true,
    "model": "gpt-4o-mini",
    "capabilities": [
      "improve-description",
      "suggest-subtasks",
      "summarize-task",
      "generate-task",
      "summarize-project",
      "estimate-effort"
    ]
  }
}
```

---

### 2. Improve Task Description
- **Method**: `POST /api/v1/ai/improve-description`
- **Request Body**:
```json
{
  "title": "Setup Redis Token Blacklisting",
  "description": "need to blacklist revoked tokens on user logout so they cannot be reused",
  "tone": "professional",
  "taskId": "optional_mongodb_task_id"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "improvedDescription": "### 🎯 Objective & Overview\nImplement an enterprise token revocation mechanism using Redis to ensure revoked JWTs cannot be reused.\n\n### 📋 Scope & Requirements\n- Integrate Redis caching client in backend\n- Blacklist tokens on /auth/logout\n- Check blacklist during authMiddleware verification\n\n### ✅ Acceptance Criteria\n- [ ] Redis stores invalidated token JTI until token expiration\n- [ ] authMiddleware rejects blacklisted tokens with 401 Unauthorized\n- [ ] Unit tests verify immediate session termination\n\n### 💡 Technical Notes\nSet TTL equal to remaining JWT access token lifetime.",
    "model": "gpt-4o-mini",
    "mode": "live"
  }
}
```

---

### 3. Suggest Subtasks
- **Method**: `POST /api/v1/ai/suggest-subtasks`
- **Request Body**:
```json
{
  "title": "Migrate Database to MongoDB Atlas",
  "description": "Zero-downtime cluster migration with replica set validation",
  "count": 4,
  "taskId": "optional_mongodb_task_id"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "subtasks": [
      {
        "title": "Provision Atlas Cluster & Configure Network Peering",
        "description": "Setup VPC peering and IP whitelists",
        "estimatedHours": 2,
        "priority": "high"
      },
      {
        "title": "Execute Live Data Sync via mongodump/mongorestore",
        "description": "Replicate collections and verify document checksums",
        "estimatedHours": 4,
        "priority": "urgent"
      },
      {
        "title": "Update Application Connection Strings & Deploy",
        "description": "Perform rolling server restart with updated MONGO_URI",
        "estimatedHours": 1.5,
        "priority": "high"
      },
      {
        "title": "Post-Migration Latency & Index Verification",
        "description": "Validate query execution times and monitoring dashboards",
        "estimatedHours": 2,
        "priority": "medium"
      }
    ],
    "totalEstimatedHours": 9.5,
    "model": "gpt-4o-mini",
    "mode": "live"
  }
}
```

---

### 4. Summarize Task (With Real Database Data)
- **Method**: `POST /api/v1/ai/summarize-task`
- **Request Body**:
```json
{
  "taskId": "66b5f903e1a0429f9589d10f"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "summary": "Task 'Setup Redis Token Blacklisting' is currently in progress. 4.5 hours have been logged across 2 sprint sessions.",
    "progressAssessment": "On Track",
    "riskLevel": "low",
    "keyActionItems": [
      "Finalize Redis TTL expiration testing",
      "Submit deliverable notes for department review"
    ],
    "recommendations": "Ensure Redis connection pool handles failover gracefully.",
    "totalLoggedHours": 4.5,
    "model": "gpt-4o-mini",
    "mode": "live"
  }
}
```

---

### 5. Generate Complete Task from Prompt
- **Method**: `POST /api/v1/ai/generate-task`
- **Request Body**:
```json
{
  "prompt": "Build an automated weekly workload report cron job for department admins",
  "projectId": "66b5f903e1a0429f9589d10d"
}
```

---

### 6. Summarize Project (With Real Database Portfolio)
- **Method**: `POST /api/v1/ai/summarize-project`
- **Request Body**:
```json
{
  "projectId": "66b5f903e1a0429f9589d10d"
}
```

---

### 7. Estimate Effort & Complexity
- **Method**: `POST /api/v1/ai/estimate-effort`
- **Request Body**:
```json
{
  "title": "Implement OAuth2 Google SSO Integration",
  "description": "Allow users to login with corporate Google Workspace accounts",
  "complexity": "medium"
}
```
