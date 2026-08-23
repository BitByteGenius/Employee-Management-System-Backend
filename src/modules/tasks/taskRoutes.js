const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('./taskController');

const uploadDeliverable = require('../../middlewares/uploadMiddleware');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

// List tasks
router.get('/', authMiddleware, getTasks);

// Create task (supports multipart file attachment uploaded to Cloudinary)
router.post('/', authMiddleware, uploadDeliverable.single('file'), createTask);

// Get single task
router.get('/:id', authMiddleware, getTask);

// Update task (PUT & PATCH)
router.put('/:id', authMiddleware, updateTask);
router.patch('/:id', authMiddleware, updateTask);

// Update status
router.patch('/:id/status', authMiddleware, updateTaskStatus);

// Soft delete task
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;
