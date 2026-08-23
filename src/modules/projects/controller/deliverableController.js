const Project = require('../../../models/Project');
const { isCloudinaryConfigured, uploadBufferToCloudinary } = require('../../../config/cloudinary');

/**
 * Submit project deliverables
 * POST /api/v1/projects/:id/deliverables
 */
const submitDeliverables = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { externalLink, notes, selectedDate, departmentId } = req.body;
    const file = req.file;

    // 1. Verify project exists
    const project = await Project.findOne({ _id: projectId, isDeleted: false });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    let fileUrl = null;
    let filePath = null;
    let fileName = file ? file.originalname : null;
    let fileSize = file ? file.size : null;
    let mimeType = file ? file.mimetype : null;

    // 2. Upload file buffer to Cloudinary
    if (file && file.buffer) {
      if (isCloudinaryConfigured()) {
        try {
          const uploadResult = await uploadBufferToCloudinary(file.buffer, {
            folder: 'teamorbit/projects',
            resource_type: 'auto',
          });
          fileUrl = uploadResult.secure_url;
          filePath = uploadResult.secure_url;
          if (uploadResult.bytes) fileSize = uploadResult.bytes;
        } catch (cloudErr) {
          console.error('Cloudinary upload error:', cloudErr);
          return res.status(500).json({
            success: false,
            message: `Cloudinary upload failed: ${cloudErr.message || cloudErr}`,
          });
        }
      } else {
        console.warn('Warning: Cloudinary credentials are not configured in environment variables.');
        filePath = `uploads/${file.originalname}`;
        fileUrl = filePath;
      }
    }

    // 3. Build deliverable submission object
    const deliverableData = {
      fileName,
      filePath,
      fileUrl,
      fileSize,
      mimeType,
      externalLink: externalLink || null,
      submissionDeadline: selectedDate ? new Date(selectedDate) : null,
      selectedDate: selectedDate ? new Date(selectedDate) : null,
      notes: notes || null,
      submittedAt: new Date(),
      submittedBy: req.user ? (req.user._id || req.user.id) : null,
    };

    // If departmentId was provided and project didn't have a department set, assign it
    if (departmentId && (!project.department || project.department.toString() !== departmentId)) {
      project.department = departmentId;
    }

    // 4. Push to project deliverables and save
    project.deliverables = project.deliverables || [];
    project.deliverables.push(deliverableData);
    await project.save();

    // 5. Return success response
    return res.status(200).json({
      success: true,
      message: 'Deliverables have been submitted successfully to Cloudinary.',
      data: deliverableData,
    });
  } catch (error) {
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