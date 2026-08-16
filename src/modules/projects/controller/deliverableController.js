const Project = require('../../../models/Project'); // Adjust path to your Project model

/**
 * Submit project deliverables
 * POST /api/v1/projects/:id/deliverables
 */
const submitDeliverables = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { externalLink, notes, selectedDate } = req.body;
    const file = req.file;

    // 1. Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // 2. Build deliverable submission object
    const deliverableData = {
      fileName: file ? file.originalname : null,
      filePath: file ? file.path : null,
      fileSize: file ? file.size : null,
      mimeType: file ? file.mimetype : null,
      externalLink: externalLink || null,
      submissionDeadline: selectedDate || null,
      notes: notes || null,
      submittedAt: new Date(),
      submittedBy: req.user ? req.user._id : null, // Populated via your auth middleware
    };

    // 3. Push to project deliverables collection/array and save
    project.deliverables = project.deliverables || [];
    project.deliverables.push(deliverableData);
    await project.save();

    // 4. Return success response
    return res.status(200).json({
      success: true,
      message: 'Deliverables have been submitted successfully.',
      data: deliverableData,
    });
  } catch (error) {
    // Handle Multer specific errors (e.g., file size limit exceeded)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 50MB limit.',
      });
    }
    next(error);
  }
};

module.exports = {
  submitDeliverables,
};