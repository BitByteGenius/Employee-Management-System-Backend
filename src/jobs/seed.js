/**
 * seed.js — Startup database seeding job.
 * Automatically ensures system roles and the Super Admin user account exist in MongoDB.
 */
'use strict';

const Role = require('../modules/roles/models/role.model');
const User = require('../modules/user/models/user.model');
const { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } = require('../constants/roles');
const env = require('../config/env');

const seedSuperAdmin = async () => {
  try {
    // 1. Seed Roles
    const rolesToSeed = [
      {
        name: ROLES.SUPER_ADMIN,
        label: 'Super Admin',
        description: 'System-wide full access role',
        permissions: DEFAULT_ROLE_PERMISSIONS[ROLES.SUPER_ADMIN] || Object.values(PERMISSIONS),
        isSystem: true,
      },
      {
        name: ROLES.ADMIN,
        label: 'Department Admin',
        description: 'Departmental management role',
        permissions: DEFAULT_ROLE_PERMISSIONS[ROLES.ADMIN] || [],
        isSystem: true,
      },
      {
        name: ROLES.EMPLOYEE,
        label: 'Employee',
        description: 'Standard employee role',
        permissions: DEFAULT_ROLE_PERMISSIONS[ROLES.EMPLOYEE] || [],
        isSystem: true,
      },
    ];

    const roleDocs = {};
    for (const r of rolesToSeed) {
      try {
        let doc = await Role.findOne({ name: r.name }).withDeleted();
        if (!doc) {
          doc = await Role.create(r);
          console.log(`[Seed] Created role: ${r.name}`);
        } else {
          // Keep permissions updated
          doc.permissions = r.permissions;
          doc.label = r.label;
          doc.description = r.description;
          doc.isSystem = r.isSystem;
          doc.isDeleted = false;
          await doc.save();
          console.log(`[Seed] Updated role: ${r.name}`);
        }
        roleDocs[r.name] = doc;
      } catch (roleError) {
        // If role creation fails (e.g., duplicate), try to find it
        console.warn(`[Seed] Role creation failed for ${r.name}:`, roleError.message);
        const doc = await Role.findOne({ name: r.name }).withDeleted();
        if (doc) {
          doc.permissions = r.permissions;
          doc.label = r.label;
          doc.description = r.description;
          doc.isSystem = r.isSystem;
          doc.isDeleted = false;
          await doc.save();
          roleDocs[r.name] = doc;
          console.log(`[Seed] Using existing role: ${r.name}`);
        } else {
          throw roleError;
        }
      }
    }

    // 2. Seed Super Admin User
    const superAdminEmail = (env.SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || 'superadmin@teamorbit.com').toLowerCase().trim();
    const superAdminPassword = env.SUPER_ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
    const superAdminName = env.SUPER_ADMIN_NAME || process.env.SUPER_ADMIN_NAME || 'Super Admin';

    try {
      let superAdminUser = await User.findOne({ email: superAdminEmail }).withDeleted();

      const nameParts = superAdminName.trim().split(' ');
      const firstName = nameParts[0] || 'Super';
      const lastName = nameParts.slice(1).join(' ') || 'Admin';

      if (!superAdminUser) {
        superAdminUser = new User({
          employeeCode: 'EMP0001',
          firstName,
          lastName,
          fullName: superAdminName,
          email: superAdminEmail,
          password: superAdminPassword, // pre-save hook will hash it
          role: roleDocs[ROLES.SUPER_ADMIN]._id,
          status: 'approved',
          isApproved: true,
          isActive: true,
          isEmailVerified: true,
        });
        await superAdminUser.save();
        console.log(`[Seed] Created Super Admin account: ${superAdminEmail}`);
      } else {
        // Ensure role, status, active state, and password are correctly set
        superAdminUser.role = roleDocs[ROLES.SUPER_ADMIN]._id;
        superAdminUser.status = 'approved';
        superAdminUser.isApproved = true;
        superAdminUser.isActive = true;
        if (superAdminPassword && !await superAdminUser.comparePassword(superAdminPassword)) {
          superAdminUser.password = superAdminPassword;
        }
        await superAdminUser.save();
        console.log(`[Seed] Verified Super Admin account: ${superAdminEmail}`);
      }
    } catch (userError) {
      console.error('[Seed] Error seeding Super Admin user:', userError.message);
      // Don't rethrow - allow system to continue even if user creation fails
    }
  } catch (error) {
    console.error('[Seed] Error during seeding:', error.message);
    // Don't rethrow - allow system to continue even if seeding fails
  }
};


module.exports = seedSuperAdmin;
