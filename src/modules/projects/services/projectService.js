const mongoose = require('mongoose');
const Project = require('../../../models/Project');
const Department = require('../../departments/models/departmentModel');
const User = require('../../user/models/user.model');
const { isCloudinaryConfigured, uploadBufferToCloudinary } = require('../../../config/cloudinary');

const escapeRegex = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const getValidUserId = (id) =>
  (id && isValidObjectId(id)) ? id : null;

class ProjectService {
  /**
   * List projects with pagination & filters
   */
  async getProjects({
    page = 1,
    limit = 20,
    search = '',
    status = '',
    manager = '',
    department = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  }) {
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(
      Math.max(Number(limit) || 20, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
    };

    if (status && status !== 'all' && ['active', 'archived', 'completed', 'on_hold', 'in_progress', 'planning', 'at_risk'].includes(status.toLowerCase())) {
      filter.status = status.toLowerCase();
    }

    if (manager && manager !== 'all' && isValidObjectId(manager)) {
      filter.$or = [
        { manager: manager },
        { owner: manager },
      ];
    }

    if (department && department !== 'all' && isValidObjectId(department)) {
      filter.department = department;
    }

    if (search && search.trim()) {
      const regex = new RegExp(
        escapeRegex(search.trim()),
        'i',
      );

      const searchFilter = [
        { name: regex },
        { key: regex },
        { description: regex },
      ];

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: searchFilter },
        ];
        delete filter.$or;
      } else {
        filter.$or = searchFilter;
      }
    }

    const allowedSortFields = [
      'name',
      'key',
      'status',
      'progress',
      'dueDate',
      'createdAt',
      'updatedAt',
    ];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = 'createdAt';
    }

    const sort = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('department', 'name code')
        .populate({
          path: 'manager',
          select: 'firstName lastName fullName email profilePicture designation assignedRole',
          populate: { path: 'assignedRole', select: 'name label' },
        })
        .populate({
          path: 'owner',
          select: 'firstName lastName fullName email profilePicture designation assignedRole',
          populate: { path: 'assignedRole', select: 'name label' },
        })
        .populate({
          path: 'members',
          select: 'firstName lastName fullName email profilePicture designation assignedRole',
          populate: { path: 'assignedRole', select: 'name label' },
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Project.countDocuments(filter),
    ]);

    const formattedProjects = projects.map((proj) => {
      const managerUser = proj.manager || proj.owner;
      const managerName = managerUser
        ? (managerUser.fullName || `${managerUser.firstName || ''} ${managerUser.lastName || ''}`.trim() || managerUser.email)
        : null;

      const dynamicRole = proj.role || managerUser?.designation || managerUser?.assignedRole?.label || managerUser?.assignedRole?.name || 'Project Lead';

      return {
        ...proj,
        id: proj._id.toString(),
        role: dynamicRole,
        managerName,
        tasksRatio: `${proj.completedTasksCount || 0}/${proj.tasksCount || 0}`,
        deliverablesCount: (proj.deliverables || []).length,
      };
    });

    return {
      data: formattedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get project by ID
   */
  async getProjectById(id) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid project ID');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate('department', 'name code description')
      .populate({
        path: 'manager',
        select: 'firstName lastName fullName email profilePicture designation assignedRole',
        populate: { path: 'assignedRole', select: 'name label' },
      })
      .populate({
        path: 'owner',
        select: 'firstName lastName fullName email profilePicture designation assignedRole',
        populate: { path: 'assignedRole', select: 'name label' },
      })
      .populate({
        path: 'members',
        select: 'firstName lastName fullName email profilePicture designation assignedRole',
        populate: { path: 'assignedRole', select: 'name label' },
      })
      .populate('deliverables.submittedBy', 'firstName lastName fullName email')
      .lean();

    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const managerUser = project.manager || project.owner;
    const managerName = managerUser
      ? (managerUser.fullName || `${managerUser.firstName || ''} ${managerUser.lastName || ''}`.trim() || managerUser.email)
      : null;

    const dynamicRole = project.role || managerUser?.designation || managerUser?.assignedRole?.label || managerUser?.assignedRole?.name || 'Project Lead';

    return {
      ...project,
      id: project._id.toString(),
      role: dynamicRole,
      managerName,
      tasksRatio: `${project.completedTasksCount || 0}/${project.tasksCount || 0}`,
    };
  }

  /**
   * Create new project
   */
  async createProject(data, currentUserId, file = null) {
    const projectName = (data.name || data.title || '').trim();
    const {
      key,
      code,
      role = '',
      description = '',
      department = null,
      owner = null,
      manager = null,
      members = [],
      status = 'active',
      progress = 0,
      dueDate = null,
      startDate = null,
      tasksCount = 0,
      completedTasksCount = 0,
    } = data;

    if (!projectName) {
      const error = new Error('Project name is required');
      error.statusCode = 400;
      throw error;
    }

    const projectKey = (key || code || '').trim();
    const generatedKey = projectKey
      ? projectKey.toUpperCase()
      : projectName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 6) + '-' + Math.floor(100 + Math.random() * 900);

    const validUserId = getValidUserId(currentUserId);
    const validDepartment = (department && isValidObjectId(department)) ? department : null;
    const validManager = (manager && isValidObjectId(manager)) ? manager : null;
    const validOwner = (owner && isValidObjectId(owner)) ? owner : validUserId;

    const deliverables = [];
    if (file && file.buffer) {
      let fileUrl = null;
      let filePath = null;
      let fileName = file.originalname;
      let fileSize = file.size;

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
          console.error('Cloudinary upload error in createProject:', cloudErr);
        }
      } else {
        filePath = `uploads/${file.originalname}`;
        fileUrl = filePath;
      }

      deliverables.push({
        fileName,
        filePath,
        fileUrl,
        fileSize,
        mimeType: file.mimetype,
        submittedAt: new Date(),
        submittedBy: validUserId,
      });
    }

    const project = await Project.create({
      name: projectName,
      key: generatedKey,
      role: (role || '').trim(),
      description: (description || '').trim(),
      department: validDepartment,
      manager: validManager,
      owner: validOwner,
      members: Array.isArray(members) ? members.filter(isValidObjectId) : [],
      status: ['active', 'archived', 'completed', 'on_hold', 'in_progress', 'planning', 'at_risk'].includes(status) ? status : 'active',
      progress: Math.min(Math.max(Number(progress) || 0, 0), 100),
      dueDate: dueDate ? new Date(dueDate) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      tasksCount: Number(tasksCount) || 0,
      completedTasksCount: Number(completedTasksCount) || 0,
      deliverables,
      createdBy: validUserId,
      updatedBy: validUserId,
    });

    return this.getProjectById(project._id);
  }

  /**
   * Update project
   */
  async updateProject(id, data, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid project ID');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) {
        const error = new Error('Project name cannot be empty');
        error.statusCode = 400;
        throw error;
      }
      project.name = name;
    }

    if (data.key !== undefined) {
      project.key = data.key.trim().toUpperCase();
    }

    if (data.role !== undefined) {
      project.role = (data.role || '').trim();
    }

    if (data.description !== undefined) {
      project.description = (data.description || '').trim();
    }

    if (data.department !== undefined) {
      project.department = (data.department && isValidObjectId(data.department)) ? data.department : null;
    }

    if (data.manager !== undefined) {
      project.manager = (data.manager && isValidObjectId(data.manager)) ? data.manager : null;
    }

    if (data.owner !== undefined) {
      project.owner = (data.owner && isValidObjectId(data.owner)) ? data.owner : null;
    }

    if (data.members !== undefined && Array.isArray(data.members)) {
      project.members = data.members.filter(isValidObjectId);
    }

    if (data.status !== undefined) {
      if (['active', 'archived', 'completed', 'on_hold', 'in_progress', 'planning', 'at_risk'].includes(data.status)) {
        project.status = data.status;
      }
    }

    if (data.progress !== undefined) {
      project.progress = Math.min(Math.max(Number(data.progress) || 0, 0), 100);
    }

    if (data.tasksCount !== undefined) {
      project.tasksCount = Number(data.tasksCount) || 0;
    }

    if (data.completedTasksCount !== undefined) {
      project.completedTasksCount = Number(data.completedTasksCount) || 0;
    }

    if (data.dueDate !== undefined) {
      project.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    if (data.startDate !== undefined) {
      project.startDate = data.startDate ? new Date(data.startDate) : null;
    }

    project.updatedBy = getValidUserId(currentUserId);

    await project.save();

    return this.getProjectById(id);
  }

  /**
   * Update status
   */
  async updateStatus(id, status, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid project ID');
      error.statusCode = 400;
      throw error;
    }

    const normalizedStatus = status?.toLowerCase();
    if (!['active', 'archived', 'completed', 'on_hold', 'in_progress', 'planning', 'at_risk'].includes(normalizedStatus)) {
      const error = new Error('Invalid project status');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    project.status = normalizedStatus;
    project.updatedBy = getValidUserId(currentUserId);

    await project.save();

    return this.getProjectById(id);
  }

  /**
   * Soft delete project
   */
  async deleteProject(id, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid project ID');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    project.isDeleted = true;
    project.status = 'archived';
    project.deletedAt = new Date();
    project.deletedBy = getValidUserId(currentUserId);
    project.updatedBy = getValidUserId(currentUserId);

    await project.save();

    return {
      message: 'Project deleted successfully',
    };
  }
}

module.exports = new ProjectService();
