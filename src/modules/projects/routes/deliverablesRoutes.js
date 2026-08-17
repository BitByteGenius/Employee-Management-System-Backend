const router = require('express').Router();
const uploadDeliverable = require('../../../middlewares/uploadMiddleware'); // Adjust relative dots
const { deliverableValidator } = require('../../../validators/moduleValidators');
const Project = require('../../../models/Project'); // Adjust relative dots


router.post(
  '/:id/deliverables',
  uploadDeliverable.single('file'), // 'file' matches the key sent by multipart form-data
  deliverableValidator,
  async (req, res, next) => {
    try {
      const projectId = req.params.id;
      const { externalLink, notes, selectedDate } = req.body;
      const file = req.file;

      // Find project
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      // Construct deliverable data payload
      const deliverableData = {
        fileName: file ? file.originalname : null,
        filePath: file ? file.path : null,
        fileSize: file ? file.size : null,
        externalLink: externalLink || null,
        submissionDate: selectedDate || null,
        notes: notes || null,
        submittedAt: new Date(),
        submittedBy: req.user ? req.user._id : null, // Assuming auth middleware populates req.user
      };

      // Push or save to project schema (depending on how your Project model is structured)
      project.deliverables = project.deliverables || [];
      project.deliverables.push(deliverableData);
      await project.save();

      return res.status(200).json({
        success: true,
        message: 'Deliverables have been submitted successfully.',
        data: deliverableData,
      });
    } catch (error) {
      // Handle multer file size error or general errors explicitly
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds the 50MB limit.' });
      }
      next(error);
    }
  }
);

module.exports = router;