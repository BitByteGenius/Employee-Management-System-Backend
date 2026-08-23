const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
} = require('../controller/projectController');

const uploadDeliverable = require('../../../middlewares/uploadMiddleware');
const { deliverableValidator } = require('../../../validators/moduleValidators');
const Project = require('../../../models/Project');
const authMiddleware = require('../../../middlewares/auth.middleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Projects Routes
|--------------------------------------------------------------------------
*/

// List projects
router.get('/', authMiddleware, getProjects);

// Create project (supports multipart file attachment)
router.post('/', authMiddleware, uploadDeliverable.single('file'), createProject);

// Get single project
router.get('/:id', authMiddleware, getProject);

// Update project (PUT & PATCH)
router.put('/:id', authMiddleware, updateProject);
router.patch('/:id', authMiddleware, updateProject);

// Update status
router.patch('/:id/status', authMiddleware, updateProjectStatus);

// Soft delete project
router.delete('/:id', authMiddleware, deleteProject);

const { submitDeliverables } = require('../controller/deliverableController');

// Submit deliverables
router.post(
  '/:id/deliverables',
  authMiddleware,
  uploadDeliverable.single('file'),
  deliverableValidator,
  submitDeliverables,
);

module.exports = router;
