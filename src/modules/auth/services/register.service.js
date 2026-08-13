/**
 * register.service.js — User registration business logic.
 */
'use strict';

const mongoose = require('mongoose');
const authRepository = require('../repositories/auth.repository');
const Role = require('../../roles/models/role.model');
const AppError = require('../../../shared/errors/app.error');
const env = require('../../../config/env');
const { HTTP_STATUS } = require('../../../constants');

/**
 * Generate a unique employee code based on timestamp.
 * TODO: Replace with atomic Counter collection in high-traffic production.
 */
const generateEmployeeCode = () => {
  const ts = Date.now().toString().slice(-6);
  return `EMP${ts}`;
};

/**
 * Register a new user (Admin or Employee).
 * Super Admin cannot be registered via API.
 *
 * @param {Object} payload - { firstName, lastName, email, password, phone, role, department, designation }
 * @returns {Promise<Object>} safe user object
 */
const register = async (payload) => {
  const { firstName, lastName, email, password, phone, role, department, designation } = payload;

  // Block Super Admin registration via API
  if (email?.toLowerCase().trim() === env.SUPER_ADMIN_EMAIL) {
    throw new AppError('Super Admin cannot be registered via API.', HTTP_STATUS.FORBIDDEN);
  }

  // Duplicate email check
  const exists = await authRepository.emailExists(email);
  if (exists) {
    throw new AppError('Email is already registered.', HTTP_STATUS.CONFLICT);
  }

  // Resolve role — accept either ObjectId or role name string
  let roleId = role;
  if (role && typeof role === 'string' && !mongoose.Types.ObjectId.isValid(role)) {
    const roleDoc = await Role.findOne({
      $or: [
        { name: new RegExp(`^${role}$`, 'i') },
        { label: new RegExp(`^${role}$`, 'i') },
      ],
    });
    if (roleDoc) {
      roleId = roleDoc._id;
    } else {
      throw new AppError('Invalid role specified.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (!roleId || !mongoose.Types.ObjectId.isValid(roleId)) {
    throw new AppError('A valid role is required.', HTTP_STATUS.BAD_REQUEST);
  }

  const employeeCode = generateEmployeeCode();

  const user = await authRepository.createUser({
    employeeCode,
    firstName,
    lastName,
    email,
    password,
    phone,
    role: roleId,
    department: department || null,
    designation: designation || '',
    status: 'pending',
    isActive: false,
    isApproved: false,
  });

  return {
    id: user._id,
    employeeCode: user.employeeCode,
    fullName: user.fullName,
    email: user.email,
    status: user.status,
  };
};

module.exports = { register };
