const express = require('express');

const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  assignAdmin,
  removeAdmin,
  getDepartmentEmployees,
  updateDepartmentStatus,
  deleteDepartment,
  getDepartmentSettings,
  updateDepartmentSettings,
  getDepartmentReports,
  getAdminCandidates,
} = require('../controller/departmentController');

const authMiddleware = require('../../../middlewares/auth.middleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Department Management
|--------------------------------------------------------------------------
*/

// Admin candidates (search users for department admin assignment)
router.get(
  '/admin-candidates',
  authMiddleware,
  getAdminCandidates,
);

// List departments
router.get(
  '/',
  authMiddleware,
  getDepartments,
);

// Create department
router.post(
  '/',
  authMiddleware,
  createDepartment,
);

// Get department details
router.get(
  '/:id',
  authMiddleware,
  getDepartment,
);

// Update department (supports both PUT and PATCH)
router.put(
  '/:id',
  authMiddleware,
  updateDepartment,
);

router.patch(
  '/:id',
  authMiddleware,
  updateDepartment,
);

// Assign/change department admin
router.patch(
  '/:id/admin',
  authMiddleware,
  assignAdmin,
);

// Remove department admin
router.delete(
  '/:id/admin',
  authMiddleware,
  removeAdmin,
);

// Department employees
router.get(
  '/:id/employees',
  authMiddleware,
  getDepartmentEmployees,
);

// Activate/deactivate department
router.patch(
  '/:id/status',
  authMiddleware,
  updateDepartmentStatus,
);

// Soft delete department
router.delete(
  '/:id',
  authMiddleware,
  deleteDepartment,
);

// Department settings
router.get(
  '/:id/settings',
  authMiddleware,
  getDepartmentSettings,
);

router.patch(
  '/:id/settings',
  authMiddleware,
  updateDepartmentSettings,
);

// Department reports
router.get(
  '/:id/reports',
  authMiddleware,
  getDepartmentReports,
);

module.exports = router;
