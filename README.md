# 🚀 TeamOrbit — Task Management System (TMS)

TeamOrbit is a **full-stack Task Management System** designed to help organizations manage **users, departments, projects, tasks, work hours, files, notifications, and reports** from one platform.

The system has three main user roles:

* 👑 **Super Admin** — manages the entire organization
* 👔 **Department Admin** — manages a specific department
* 💼 **Employee** — manages assigned work and tasks

---

## 📌 What TeamOrbit Does

The basic workflow is:

```text
User Registration
       ↓
Super Admin Approval
       ↓
Role & Department Assignment
       ↓
Login
       ↓
Role-Based Dashboard
       ↓
Projects & Tasks
       ↓
Employee Works on Tasks
       ↓
Time Logging & Deliverables
       ↓
Admin Review
       ↓
Reports, Notifications & Audit Logs
```

---

# ✨ Key Features

## 🔐 User Management

* User registration and login
* User approval/rejection
* Role assignment
* Department assignment
* Activate/deactivate users
* Profile management
* Profile picture upload

## 🏢 Department Management

* Create departments
* Update department information
* Assign department admins
* Manage department employees
* View department headcount
* Manage department budgets

## 📁 Project Management

* Create projects
* Assign project managers
* Set project deadlines
* Track project progress
* Manage project status
* Add project deliverables

## ✅ Task Management

* Create and assign tasks
* Assign tasks to employees
* Set task priority
* Set task deadlines
* Update task status
* Add attachments
* View task activity

### Task Priorities

```text
Low
Medium
High
Urgent
```

### Task Status

```text
Todo
In Progress
Review
Completed
```

## ⏱️ Time Tracking

Employees can:

* Log work hours
* Select a task/project
* Add notes
* Submit time logs

Admins can:

* Review time logs
* Approve time logs
* Reject time logs
* Monitor team workload

## 🤖 AI Assistant

TeamOrbit includes AI-powered task and project assistance.

It can:

* Improve task descriptions
* Generate subtasks
* Summarize tasks
* Generate tasks from natural language
* Summarize project progress
* Estimate effort and working hours
* Estimate complexity and required skills

## 🔔 Notifications

Users can receive notifications for:

* Task assignments
* Project approvals
* Deliverable submissions
* Task status changes
* Other important activities

Notifications support:

* Read/unread status
* Mark as read
* Mark all as read

## 🛡️ Audit Logs

Important system activities are recorded for tracking and accountability.

Examples:

* User approval
* Role changes
* Project creation
* Profile updates
* Other important system changes

## 🌗 UI Features

* Light mode
* Dark mode
* Responsive layout
* Desktop support
* Tablet support
* Mobile support
* Android
* iOS
* Web

---

# 👥 User Roles & Permissions

| Role                    | Main Responsibilities                                                         |
| ----------------------- | ----------------------------------------------------------------------------- |
| 👑 **Super Admin**      | Manage users, departments, roles, projects, analytics, reports and audit logs |
| 👔 **Department Admin** | Manage department employees, tasks, projects, time logs and deliverables      |
| 💼 **Employee**         | View assigned tasks, update progress, log work hours and submit deliverables  |

The system uses **Role-Based Access Control (RBAC)** on both the backend and frontend.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │   Flutter Frontend  │
                    │      GetX + MVVM    │
                    └──────────┬──────────┘
                               │
                         HTTP / REST
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Node.js Backend  │
                    │      Express.js     │
                    ├─────────────────────┤
                    │ Authentication      │
                    │ Users               │
                    │ Departments         │
                    │ Projects            │
                    │ Tasks               │
                    │ Time Tracking       │
                    │ AI                  │
                    │ Notifications       │
                    │ Reports             │
                    └───────┬──────┬──────┘
                            │      │
               ┌────────────┘      └────────────┐
               ▼                                ▼
       ┌───────────────┐                ┌───────────────┐
       │    MongoDB    │                │   Cloudinary  │
       │   Database    │                │ File Storage  │
       └───────────────┘                └───────────────┘

              Socket.io → Real-time Notifications
              Nodemailer → Email / SMTP
```

---

# 💻 Technology Stack

## Backend

| Technology             | Purpose                 |
| ---------------------- | ----------------------- |
| **Node.js 18+**        | Backend runtime         |
| **Express.js 5**       | REST API framework      |
| **MongoDB**            | Database                |
| **Mongoose 9**         | MongoDB ODM             |
| **JWT**                | Authentication          |
| **bcryptjs**           | Password hashing        |
| **Cloudinary**         | File/media storage      |
| **Multer**             | File upload handling    |
| **Socket.io**          | Real-time communication |
| **Nodemailer**         | Email/SMTP              |
| **Helmet**             | Security headers        |
| **CORS**               | Cross-origin requests   |
| **Express Rate Limit** | Rate limiting           |
| **Express Validator**  | Request validation      |

## Frontend

| Technology                 | Purpose                    |
| -------------------------- | -------------------------- |
| **Flutter 3.4+**           | UI/Application framework   |
| **Dart 3**                 | Programming language       |
| **GetX**                   | State management & routing |
| **Dio**                    | API communication          |
| **GetStorage**             | Local storage              |
| **Flutter Secure Storage** | Secure token storage       |
| **Cached Network Image**   | Image caching              |
| **File Picker**            | File selection             |
| **Google Fonts**           | Typography                 |
| **Material 3**             | UI design system           |

---

# 📂 Project Structure

```text
Tms/
│
├── README.md
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   │
│   └── src/
│       ├── server.js
│       ├── app.js
│       │
│       ├── config/
│       ├── constants/
│       ├── jobs/
│       ├── middlewares/
│       ├── models/
│       │
│       ├── modules/
│       │   ├── auth/
│       │   ├── user/
│       │   ├── departments/
│       │   ├── projects/
│       │   ├── tasks/
│       │   ├── timeTracking/
│       │   ├── notifications/
│       │   ├── audit/
│       │   ├── analytics/
│       │   └── reports/
│       │
│       └── utils/
│
└── frontend/
    ├── pubspec.yaml
    ├── assets/
    │
    └── lib/
        ├── main.dart
        │
        ├── core/
        │   ├── constants/
        │   ├── network/
        │   ├── routes/
        │   ├── services/
        │   └── theme/
        │
        ├── shared/
        │   ├── widgets/
        │   ├── buttons/
        │   └── forms/
        │
        └── modules/
            ├── auth/
            ├── super_admin/
            ├── admin/
            ├── employee/
            ├── department/
            ├── profile/
            └── notification/
```

---

# 🔌 API Documentation

### Base URL

```text
http://localhost:5000/api/v1
```

---

## 1. 🔐 Authentication APIs

| Method | Endpoint              | Access        | Purpose              |
| ------ | --------------------- | ------------- | -------------------- |
| POST   | `/auth/register`      | Public        | Register user        |
| POST   | `/auth/login`         | Public        | Login                |
| POST   | `/auth/refresh-token` | Public        | Refresh access token |
| POST   | `/auth/logout`        | Authenticated | Logout               |
| GET    | `/auth/me`            | Authenticated | Get current user     |

---

## 2. 👤 User APIs

| Method | Endpoint                 | Access        | Purpose                |
| ------ | ------------------------ | ------------- | ---------------------- |
| GET    | `/users`                 | Admin+        | List users             |
| GET    | `/users/profile`         | Authenticated | Get profile            |
| PATCH  | `/users/profile`         | Authenticated | Update profile         |
| POST   | `/users/profile/picture` | Authenticated | Upload profile picture |
| POST   | `/users/:id/approve`     | Super Admin   | Approve user           |
| POST   | `/users/:id/reject`      | Super Admin   | Reject user            |
| PATCH  | `/users/:id/role`        | Super Admin   | Change role            |
| DELETE | `/users/:id`             | Super Admin   | Delete user            |

---

## 3. 🏢 Department APIs

| Method | Endpoint                        | Access        | Purpose                 |
| ------ | ------------------------------- | ------------- | ----------------------- |
| GET    | `/departments`                  | Authenticated | List departments        |
| POST   | `/departments`                  | Super Admin   | Create department       |
| GET    | `/departments/:id`              | Authenticated | Get department          |
| PUT    | `/departments/:id`              | Super Admin   | Update department       |
| DELETE | `/departments/:id`              | Super Admin   | Delete department       |
| PUT    | `/departments/:id/admin`        | Super Admin   | Assign department admin |
| GET    | `/departments/admin-candidates` | Super Admin   | Get admin candidates    |
| GET    | `/departments/:id/employees`    | Admin+        | List employees          |

---

## 4. 📁 Project APIs

| Method | Endpoint                     | Access        | Purpose             |
| ------ | ---------------------------- | ------------- | ------------------- |
| GET    | `/projects`                  | Authenticated | List projects       |
| POST   | `/projects`                  | Admin+        | Create project      |
| GET    | `/projects/:id`              | Authenticated | Get project details |
| PUT    | `/projects/:id`              | Admin+        | Update project      |
| DELETE | `/projects/:id`              | Super Admin   | Delete project      |
| POST   | `/projects/:id/deliverables` | Admin+        | Add deliverables    |

---

## 5. ✅ Task APIs

| Method | Endpoint     | Access        | Purpose                |
| ------ | ------------ | ------------- | ---------------------- |
| GET    | `/tasks`     | Authenticated | List/filter tasks      |
| POST   | `/tasks`     | Admin+        | Create and assign task |
| GET    | `/tasks/:id` | Authenticated | Get task details       |
| PATCH  | `/tasks/:id` | Authenticated | Update task status     |
| DELETE | `/tasks/:id` | Admin+        | Delete task            |

---

## 6. ⏱️ Time Tracking APIs

| Method | Endpoint                    | Access        | Purpose            |
| ------ | --------------------------- | ------------- | ------------------ |
| GET    | `/time-tracking`            | Authenticated | Get time logs      |
| POST   | `/time-tracking`            | Authenticated | Add work hours     |
| PATCH  | `/time-tracking/:id/status` | Admin+        | Approve/reject log |

---

## 7. 🤖 AI APIs

| Method | Endpoint                  | Purpose                  |
| ------ | ------------------------- | ------------------------ |
| GET    | `/ai/status`              | Check AI status          |
| POST   | `/ai/improve-description` | Improve task description |
| POST   | `/ai/suggest-subtasks`    | Generate subtasks        |
| POST   | `/ai/summarize-task`      | Summarize task           |
| POST   | `/ai/generate-task`       | Generate task from text  |
| POST   | `/ai/summarize-project`   | Summarize project        |
| POST   | `/ai/estimate-effort`     | Estimate effort          |

---

## 8. 🔔 Notification & Reporting APIs

| Method | Endpoint                  | Access        | Purpose           |
| ------ | ------------------------- | ------------- | ----------------- |
| GET    | `/notifications`          | Authenticated | Get notifications |
| PATCH  | `/notifications/:id/read` | Authenticated | Mark as read      |
| PATCH  | `/notifications/read-all` | Authenticated | Mark all as read  |
| GET    | `/analytics/summary`      | Super Admin   | System analytics  |
| GET    | `/reports/workload`       | Admin+        | Team workload     |
| GET    | `/audit-logs`             | Super Admin   | Audit logs        |
| GET    | `/roles`                  | Authenticated | Get roles         |
| GET    | `/settings`               | Super Admin   | System settings   |

---

# 📖 Swagger / OpenAPI

TeamOrbit provides interactive API documentation using **Swagger**.

### Swagger UI

```text
http://localhost:5000/api-docs
```

### OpenAPI JSON

```text
http://localhost:5000/api-docs/swagger.json
```

Swagger can be used to:

* View all APIs
* Understand request parameters
* See request/response schemas
* Test APIs
* Add JWT Bearer tokens
* Check API permissions

These routes also redirect to Swagger:

```text
/docs
/swagger
/api/v1/docs
```

---

# 🗄️ Database

TeamOrbit uses **MongoDB with Mongoose**.

## Main Models

### 👤 User

Contains:

* Employee code
* First name
* Last name
* Email
* Password
* System role
* Department
* Profile picture
* Designation
* Phone
* Account status
* Active/inactive status

### 🏢 Department

Contains:

* Name
* Code
* Admin
* Description
* Budget
* Active status

### 📁 Project

Contains:

* Name
* Project key
* Department
* Manager
* Status
* Progress
* Due date
* Deliverables

### ✅ Task

Contains:

* Title
* Description
* Project
* Department
* Assignee
* Creator
* Status
* Priority
* Due date
* Attachments

### ⏱️ TimeLog

Contains:

* User
* Task
* Project
* Hours
* Date
* Status
* Notes

---

# ☁️ File Upload System

TeamOrbit uses:

```text
Flutter
   ↓
Dio
   ↓
Node.js / Express
   ↓
Multer
   ↓
Cloudinary
```

Files are stored in Cloudinary.

```text
teamorbit/
│
├── avatars/
├── deliverables/
└── attachments/
```

### Used for

* Profile pictures
* Project deliverables
* Task attachments

Profile images are displayed using the centralized `AppUserAvatar` widget with image caching and fallback initials.

---

# ⚙️ Environment Variables

Create:

```text
backend/.env
```

Example:

```env
NODE_ENV=development
PORT=5000

CLIENT_ORIGIN=http://localhost:3000,http://localhost:5173

MONGO_URI=mongodb://localhost:27017/teamorbit-dev

JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
MAIL_FROM=TeamOrbit <no-reply@teamorbit.com>
```

⚠️ **Never commit real passwords, API keys, or JWT secrets to GitHub.**

---

# 🚀 Installation & Setup

## Prerequisites

Install:

* Node.js 18+
* MongoDB / MongoDB Atlas
* Flutter 3.4+
* Git

---

## 1️⃣ Setup Backend

Open terminal:

```bash
cd backend
```

Install packages:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Update `.env` with your credentials.

Seed the database:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

---

## 2️⃣ Setup Frontend

Open another terminal:

```bash
cd frontend
```

Install Flutter packages:

```bash
flutter pub get
```

### Run on Web

```bash
flutter run -d chrome
```

### Run on Windows

```bash
flutter run -d windows
```

### Run on Mobile

```bash
flutter run
```

---

# 🔒 Security

TeamOrbit uses multiple security mechanisms.

### 🔑 JWT Authentication

Two tokens are used:

```text
Access Token
   ↓
15 minutes

Refresh Token
   ↓
7 days
```

### 🔄 Automatic Token Refresh

If the API returns:

```text
401 Unauthorized
```

the Flutter `ApiClient` automatically:

1. Calls `/auth/refresh-token`
2. Gets a new access token
3. Saves the new token
4. Repeats the original request

### 🔐 Password Security

Passwords are:

* Salted
* Hashed using `bcryptjs`
* Never stored as plain text

### 🛡️ Additional Security

The backend also uses:

* Helmet
* CORS
* Rate limiting
* Request validation
* JWT authentication
* Role-based permissions
* Secure file handling

---

# 📊 Overall System Flow

```text
                 TEAMORBIT
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   Super Admin    Dept Admin   Employee
        │            │            │
        ▼            ▼            ▼
     Users       Workforce      My Tasks
   Departments     Tasks       Time Logs
    Projects      Projects     Deliverables
    Analytics    Time Logs
   Audit Logs    Reports
        │            │            │
        └────────────┼────────────┘
                     ▼
                 MongoDB
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     Cloudinary              Socket.io
     File Storage          Notifications
```

---

# 📌 Project Summary

TeamOrbit is a complete **enterprise task and workforce management platform** built with:

**Frontend**

```text
Flutter + Dart + GetX
```

**Backend**

```text
Node.js + Express.js
```

**Database**

```text
MongoDB + Mongoose
```

**Additional Services**

```text
Cloudinary
Socket.io
Nodemailer
JWT
AI Assistant
Swagger / OpenAPI
```

The system provides a complete workflow for managing **users → departments → projects → tasks → work hours → deliverables → reports**, while maintaining role-based security, notifications, and audit history.

---

# 📄 License

ISC
