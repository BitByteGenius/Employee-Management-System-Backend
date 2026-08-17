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

// Create project
router.post('/', authMiddleware, createProject);

// Get single project
router.get('/:id', authMiddleware, getProject);

// Update project (PUT & PATCH)
router.put('/:id', authMiddleware, updateProject);
router.patch('/:id', authMiddleware, updateProject);

// Update status
router.patch('/:id/status', authMiddleware, updateProjectStatus);

// Soft delete project
router.delete('/:id', authMiddleware, deleteProject);

// Submit deliverables
router.post(
  '/:id/deliverables',
  authMiddleware,
  uploadDeliverable.single('file'),
  deliverableValidator,
  async (req, res, next) => {
    try {
      const projectId = req.params.id;
      const { externalLink, notes, selectedDate } = req.body;
      const file = req.file;

      const project = await Project.findOne({ _id: projectId, isDeleted: false });
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const deliverableData = {
        fileName: file ? file.originalname : null,
        filePath: file ? (file.path || file.filename) : null,
        fileSize: file ? file.size : null,
        externalLink: externalLink || null,
        submissionDate: selectedDate ? new Date(selectedDate) : null,
        notes: notes || null,
        submittedAt: new Date(),
        submittedBy: (req.user && req.user._id) ? req.user._id : null,
      };

      project.deliverables = project.deliverables || [];
      project.deliverables.push(deliverableData);
      await project.save();

      return res.status(200).json({
        success: true,
        message: 'Deliverables have been submitted successfully.',
        data: deliverableData,
      });
    } catch (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds the 50MB limit.' });
      }
      next(error);
    }
  },
);

module.exports = router;
