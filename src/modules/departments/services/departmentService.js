const mongoose = require('mongoose');
const Department = require('../models/departmentModel');
const User = require('../../user/models/user.model');
const Role = require('../../../models/Role');

const escapeRegex = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidObjectId = (id) =>
  Boolean(id && mongoose.Types.ObjectId.isValid(id));

const getValidUserId = (id) =>
  (id && isValidObjectId(id)) ? id : null;

class DepartmentService {
  /**
   * Create department
   */
  async createDepartment(data, currentUserId) {
    const {
      name,
      code,
      description = '',
      admin = null,
      initialAdminId = null,
      adminId = null,
    } = data;

    if (!name || !name.trim()) {
      const error = new Error('Department name is required');
      error.statusCode = 400;
      throw error;
    }

    if (!code || !code.trim()) {
      const error = new Error('Department code is required');
      error.statusCode = 400;
      throw error;
    }

    const normalizedName = name.trim();
    const normalizedCode = code.trim().toUpperCase();

    const existing = await Department.findOne({
      code: normalizedCode,
      isDeleted: { $ne: true },
    }).lean();

    if (existing) {
      const error = new Error(
        'Department code already exists',
      );
      error.statusCode = 409;
      throw error;
    }

    const targetAdmin = admin || initialAdminId || adminId || null;
    let validAdmin = null;

    if (targetAdmin && isValidObjectId(targetAdmin)) {
      validAdmin = targetAdmin;
    }

    const validUserId = getValidUserId(currentUserId);

    const department = await Department.create({
      name: normalizedName,
      code: normalizedCode,
      description: (description || '').trim(),
      admin: validAdmin,
      isDeleted: false,
      status: 'active',
      createdBy: validUserId,
      updatedBy: validUserId,
    });

    return this.getDepartmentById(department._id);
  }

  /**
   * Validate assigned admin
   */
  async validateAdmin(adminId) {
    if (!isValidObjectId(adminId)) {
      const error = new Error('Invalid admin ID');
      error.statusCode = 400;
      throw error;
    }

    const admin = await User.findOne({
      _id: adminId,
      isDeleted: { $ne: true },
    }).populate('role', 'name code');

    if (!admin) {
      const error = new Error(
        'Selected admin user not found',
      );
      error.statusCode = 400;
      throw error;
    }

    return admin;
  }

  /**
   * List departments
   */
  async getDepartments({
    page = 1,
    limit = 20,
    search = '',
    status = '',
    sortBy = 'name',
    sortOrder = 'asc',
  }) {
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(
      Math.max(Number(limit) || 20, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: { $ne: true },
    };

    if (status && ['active', 'inactive'].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(
        escapeRegex(search.trim()),
        'i',
      );

      filter.$or = [
        { name: regex },
        { code: regex },
        { description: regex },
      ];
    }

    const allowedSortFields = [
      'name',
      'code',
      'status',
      'createdAt',
      'updatedAt',
    ];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = 'name';
    }

    const sort = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    };

    const [departments, total] = await Promise.all([
      Department.find(filter)
        .populate('admin', 'firstName lastName fullName email employeeCode profilePicture designation')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Department.countDocuments(filter),
    ]);

    const departmentIds = departments.map((d) => d._id);

    let countMap = new Map();
    if (departmentIds.length > 0) {
      try {
        const employeeCounts = await User.aggregate([
          {
            $match: {
              department: { $in: departmentIds },
              isDeleted: { $ne: true },
            },
          },
          {
            $group: {
              _id: '$department',
              count: { $sum: 1 },
            },
          },
        ]);

        countMap = new Map(
          employeeCounts.map((item) => [
            item._id.toString(),
            item.count,
          ]),
        );
      } catch (err) {
        console.error('[DepartmentService] count aggregation error:', err);
      }
    }

    const result = departments.map((dept) => {
      let formattedAdmin = null;
      if (dept.admin) {
        const a = dept.admin;
        const adminName = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email;
        formattedAdmin = {
          ...a,
          id: a._id ? a._id.toString() : a.id,
          _id: a._id ? a._id.toString() : a.id,
          name: adminName,
          fullName: adminName,
        };
      }

      const headcount = countMap.get(dept._id.toString()) || 0;

      return {
        ...dept,
        id: dept._id.toString(),
        _id: dept._id.toString(),
        admin: formattedAdmin,
        employeeCount: headcount,
        headcount: headcount,
      };
    });

    return {
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single department
   */
  async getDepartmentById(id) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid department ID');
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findOne({
      _id: id,
      isDeleted: { $ne: true },
    })
      .populate(
        'admin',
        'firstName lastName fullName email employeeCode profilePicture designation',
      )
      .populate(
        'createdBy',
        'firstName lastName fullName email',
      )
      .lean();

    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    let employeeCount = 0;
    try {
      employeeCount = await User.countDocuments({
        department: id,
        isDeleted: { $ne: true },
      });
    } catch (_) {}

    let formattedAdmin = null;
    if (department.admin) {
      const a = department.admin;
      const adminName = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email;
      formattedAdmin = {
        ...a,
        id: a._id ? a._id.toString() : a.id,
        _id: a._id ? a._id.toString() : a.id,
        name: adminName,
        fullName: adminName,
      };
    }

    return {
      ...department,
      id: department._id.toString(),
      _id: department._id.toString(),
      admin: formattedAdmin,
      employeeCount,
      headcount: employeeCount,
    };
  }

  /**
   * Update department
   */
  async updateDepartment(id, data, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid department ID');
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.name !== undefined) {
      const name = data.name.trim();

      if (!name) {
        const error = new Error(
          'Department name cannot be empty',
        );
        error.statusCode = 400;
        throw error;
      }

      department.name = name;
    }

    if (data.code !== undefined) {
      const code = data.code.trim().toUpperCase();

      if (!code) {
        const error = new Error(
          'Department code cannot be empty',
        );
        error.statusCode = 400;
        throw error;
      }

      const duplicate = await Department.findOne({
        _id: { $ne: id },
        code,
        isDeleted: { $ne: true },
      }).lean();

      if (duplicate) {
        const error = new Error(
          'Department code already exists',
        );
        error.statusCode = 409;
        throw error;
      }

      department.code = code;
    }

    if (data.description !== undefined) {
      department.description =
        data.description?.trim() || '';
    }

    const targetAdmin = data.admin !== undefined ? data.admin : (data.adminId !== undefined ? data.adminId : undefined);
    if (targetAdmin !== undefined) {
      if (targetAdmin === null || targetAdmin === '') {
        department.admin = null;
      } else if (isValidObjectId(targetAdmin)) {
        department.admin = targetAdmin;
      }
    }

    if (data.status !== undefined) {
      if (!['active', 'inactive'].includes(data.status)) {
        const error = new Error(
          'Invalid department status',
        );
        error.statusCode = 400;
        throw error;
      }

      department.status = data.status;
    }

    department.updatedBy = getValidUserId(currentUserId);

    await department.save();

    return this.getDepartmentById(id);
  }

  /**
   * Assign / change admin
   */
  async assignAdmin(id, adminId, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid department ID');
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    if (isValidObjectId(adminId)) {
      department.admin = adminId;
      department.updatedBy = getValidUserId(currentUserId);
      await department.save();
    }

    return this.getDepartmentById(id);
  }

  /**
   * Remove admin
   */
  async removeAdmin(id, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid department ID');
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    department.admin = null;
    department.updatedBy = getValidUserId(currentUserId);

    await department.save();

    return this.getDepartmentById(id);
  }

  /**
   * Get candidate administrators
   */
  async getAdminCandidates(search = '') {
    try {
      const adminRoles = await Role.find({
        name: { $in: ['admin', 'super_admin', 'department_admin'] },
        isDeleted: { $ne: true },
      }).select('_id').lean();

      const adminRoleIds = adminRoles.map((r) => r._id);

      const filter = {
        isDeleted: { $ne: true },
        $or: [
          { role: { $in: adminRoleIds } },
          { isSuperAdmin: true },
        ],
      };

      if (search && search.trim()) {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        filter.$and = [
          {
            $or: [
              { firstName: regex },
              { lastName: regex },
              { fullName: regex },
              { email: regex },
              { employeeCode: regex },
            ],
          },
        ];
      }

      const users = await User.find(filter)
        .select('employeeCode firstName lastName fullName email profilePicture designation role status')
        .populate('role', 'name label')
        .limit(50)
        .lean();

      return users.map((u) => {
        const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
        let designation = u.designation || '';
        if (!designation && u.role) {
          designation = typeof u.role === 'object' ? (u.role.label || u.role.name || '') : String(u.role);
        }
        return {
          id: (u._id || u.id).toString(),
          _id: (u._id || u.id).toString(),
          employeeCode: u.employeeCode || '',
          name: name || 'Admin',
          fullName: name || 'Admin',
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          profilePicture: u.profilePicture || null,
          designation,
        };
      });
    } catch (err) {
      console.error('[DepartmentService] getAdminCandidates error:', err);
      return [];
    }
  }

  /**
   * Get department employees
   */
  async getDepartmentEmployees(
    departmentId,
    {
      page = 1,
      limit = 20,
      search = '',
    },
  ) {
    if (!isValidObjectId(departmentId)) {
      const error = new Error(
        'Invalid department ID',
      );
      error.statusCode = 400;
      throw error;
    }

    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(
      Math.max(Number(limit) || 20, 1),
      100,
    );

    const filter = {
      department: departmentId,
      isDeleted: { $ne: true },
    };

    if (search && search.trim()) {
      const regex = new RegExp(
        escapeRegex(search.trim()),
        'i',
      );

      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { fullName: regex },
        { email: regex },
        { employeeCode: regex },
        { designation: regex },
      ];
    }

    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      User.find(filter)
        .select(
          'employeeCode firstName lastName fullName email profilePicture designation role isActive status',
        )
        .populate('role', 'name code')
        .sort({
          firstName: 1,
          lastName: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const formattedEmployees = employees.map(emp => ({
      ...emp,
      id: (emp._id || emp.id).toString(),
      name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
    }));

    return {
      data: formattedEmployees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Change department status
   */
  async updateStatus(id, status, currentUserId) {
    if (!['active', 'inactive'].includes(status)) {
      const error = new Error(
        'Status must be active or inactive',
      );
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    department.status = status;
    department.updatedBy = getValidUserId(currentUserId);

    await department.save();

    return this.getDepartmentById(id);
  }

  /**
   * Soft delete
   */
  async deleteDepartment(id, currentUserId) {
    if (!isValidObjectId(id)) {
      const error = new Error('Invalid department ID');
      error.statusCode = 400;
      throw error;
    }

    const department = await Department.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    const employeeCount = await User.countDocuments({
      department: id,
      isDeleted: { $ne: true },
    });

    if (employeeCount > 0) {
      const error = new Error(
        'Department cannot be deleted while employees are assigned to it',
      );
      error.statusCode = 409;
      throw error;
    }

    department.isDeleted = true;
    department.status = 'inactive';
    department.deletedBy = getValidUserId(currentUserId);
    department.deletedAt = new Date();
    department.updatedBy = getValidUserId(currentUserId);

    await department.save();

    return {
      message: 'Department deleted successfully',
    };
  }

  /**
   * Department Settings
   */
  async getSettings(id) {
    const dept = await this.getDepartmentById(id);
    return {
      departmentId: id,
      name: dept.name,
      code: dept.code,
      status: dept.status,
      autoAssignTasks: true,
      notificationsEnabled: true,
    };
  }

  async updateSettings(id, settings, currentUserId) {
    const dept = await this.getDepartmentById(id);
    return {
      departmentId: id,
      name: dept.name,
      ...settings,
      updatedAt: new Date(),
    };
  }

  /**
   * Department Reports
   */
  async getReports(id) {
    const dept = await this.getDepartmentById(id);
    let employeeCount = 0;
    try {
      employeeCount = await User.countDocuments({ department: id, isDeleted: { $ne: true } });
    } catch (_) {}
    return {
      departmentId: id,
      departmentName: dept.name,
      headcount: employeeCount,
      activeProjects: 0,
      completedTasks: 0,
      efficiencyRate: 98,
    };
  }
}

module.exports = new DepartmentService();
