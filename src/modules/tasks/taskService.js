const mongoose = require('mongoose');
const Task = require('../../models/Task');
const Project = require('../../models/Project');
const { isCloudinaryConfigured, uploadBufferToCloudinary } = require('../../config/cloudinary');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

class TaskService {
  /**
   * List tasks with pagination, filters, and department scoping
   */
  async getTasks({
    page = 1,
    limit = 50,
    search = '',
    status = '',
    priority = '',
    project = '',
    assignee = '',
    department = '',
  }) {
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }
    if (priority && priority !== 'all') {
      filter.priority = priority.toLowerCase();
    }
    if (project && isValidObjectId(project)) {
      filter.project = project;
    }
    if (assignee && isValidObjectId(assignee)) {
      filter.assignee = assignee;
    }
    if (department && isValidObjectId(department)) {
      filter.department = department;
    }

    if (search && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('project', 'name key status')
        .populate({
          path: 'assignee',
          select: 'firstName lastName fullName email profilePicture designation assignedRole',
          populate: { path: 'assignedRole', select: 'name label' },
        })
        .populate('department', 'name code')
        .populate('createdBy', 'firstName lastName fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    return {
      data: tasks.map(t => ({ ...t, id: t._id.toString() })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single task
   */
  async getTaskById(id) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid task ID');
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findOne({ _id: id, isDeleted: false })
      .populate('project', 'name key status')
      .populate({
        path: 'assignee',
        select: 'firstName lastName fullName email profilePicture designation assignedRole',
        populate: { path: 'assignedRole', select: 'name label' },
      })
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName fullName email')
      .lean();

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    return { ...task, id: task._id.toString() };
  }

  /**
   * Create task with Cloudinary file attachment & database persistence
   */
  async createTask(data, currentUserId, file = null) {
    const title = (data.title || '').trim();
    if (!title) {
      const error = new Error('Task title is required');
      error.statusCode = 400;
      throw error;
    }

    const validUserId = isValidObjectId(currentUserId) ? currentUserId : null;
    const validProject = (data.project && isValidObjectId(data.project)) ? data.project : null;
    const validAssignee = (data.assignee && isValidObjectId(data.assignee)) ? data.assignee : null;
    const validDepartment = (data.department && isValidObjectId(data.department)) ? data.department : null;

    let fileUrl = null;
    let filePath = null;
    let fileName = null;
    let fileSize = null;
    let mimeType = null;
    const attachments = [];

    // 1. Upload file buffer to Cloudinary
    if (file && file.buffer) {
      fileName = file.originalname;
      fileSize = file.size;
      mimeType = file.mimetype;

      if (isCloudinaryConfigured()) {
        try {
          const uploadResult = await uploadBufferToCloudinary(file.buffer, {
            folder: 'teamorbit/tasks',
            resource_type: 'auto',
          });
          fileUrl = uploadResult.secure_url;
          filePath = uploadResult.secure_url;
          if (uploadResult.bytes) fileSize = uploadResult.bytes;
        } catch (cloudErr) {
          console.error('Cloudinary upload error in createTask:', cloudErr);
          filePath = `uploads/${file.originalname}`;
          fileUrl = filePath;
        }
      } else {
        filePath = `uploads/${file.originalname}`;
        fileUrl = filePath;
      }

      attachments.push({
        fileName,
        filePath,
        fileUrl,
        fileSize,
        mimeType,
        uploadedAt: new Date(),
        uploadedBy: validUserId,
      });
    }

    // 2. Persist task to MongoDB
    const task = await Task.create({
      title,
      description: (data.description || '').trim(),
      project: validProject,
      assignee: validAssignee,
      department: validDepartment,
      reporter: validUserId,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      fileUrl,
      filePath,
      fileName,
      fileSize,
      attachments,
      createdBy: validUserId,
      updatedBy: validUserId,
    });

    // 3. If attached to a project, update project task counters and deliverables
    if (validProject) {
      try {
        const projectDoc = await Project.findById(validProject);
        if (projectDoc) {
          projectDoc.tasksCount = (projectDoc.tasksCount || 0) + 1;
          if (fileUrl) {
            projectDoc.deliverables = projectDoc.deliverables || [];
            projectDoc.deliverables.push({
              fileName,
              filePath,
              fileUrl,
              fileSize,
              mimeType,
              notes: `Task: ${title}`,
              submittedAt: new Date(),
              submittedBy: validUserId,
            });
          }
          await projectDoc.save();
        }
      } catch (projErr) {
        console.error('Warning updating project for task:', projErr);
      }
    }

    return this.getTaskById(task._id);
  }

  /**
   * Update task in MongoDB
   */
  async updateTask(id, data, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid task ID');
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.title !== undefined) task.title = data.title.trim();
    if (data.description !== undefined) task.description = data.description.trim();
    if (data.status !== undefined) task.status = data.status;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assignee !== undefined) task.assignee = (data.assignee && isValidObjectId(data.assignee)) ? data.assignee : null;
    if (data.department !== undefined) task.department = (data.department && isValidObjectId(data.department)) ? data.department : null;

    task.updatedBy = isValidObjectId(currentUserId) ? currentUserId : null;
    await task.save();

    return this.getTaskById(id);
  }

  /**
   * Update task status in MongoDB & update project progress
   */
  async updateStatus(id, status, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid task ID');
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedBy = isValidObjectId(currentUserId) ? currentUserId : null;
    await task.save();

    // If attached to a project, refresh project completed count & progress
    if (task.project) {
      try {
        const [totalTasks, completedTasks] = await Promise.all([
          Task.countDocuments({ project: task.project, isDeleted: false }),
          Task.countDocuments({ project: task.project, status: 'completed', isDeleted: false }),
        ]);

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        await Project.findByIdAndUpdate(task.project, {
          tasksCount: totalTasks,
          completedTasksCount: completedTasks,
          progress,
        });
      } catch (pErr) {
        console.error('Warning updating project progress:', pErr);
      }
    }

    return this.getTaskById(id);
  }

  /**
   * Soft delete task
   */
  async deleteTask(id, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid task ID');
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    task.isDeleted = true;
    task.deletedAt = new Date();
    task.updatedBy = isValidObjectId(currentUserId) ? currentUserId : null;
    await task.save();

    return { message: 'Task deleted successfully' };
  }
}

module.exports = new TaskService();
