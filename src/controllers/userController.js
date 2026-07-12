const User = require('../models/User');
const { successResponse, errorResponse, paginate, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    const users = await User.getAll(pageLimit, offset);
    const total = await User.count();
    const paginationMeta = getPaginationMeta(total, page, pageLimit);

    res.json(successResponse({
      users,
      pagination: paginationMeta
    }, 'Users retrieved successfully'));
  } catch (error) {
    logger.error(`Get users error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve users'));
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    res.json(successResponse(user, 'User retrieved successfully'));
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve user'));
  }
};

/**
 * Update user
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, bio, avatar, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    // Check authorization
    if (id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Forbidden: You can only edit your own profile'));
    }

    // Only admin can change roles
    let updateRole = role;
    if (role && req.user.role !== 'admin') {
      updateRole = undefined;
    }

    // Update user
    const updatedUser = await User.update(id, {
      first_name: first_name !== undefined ? first_name : user.first_name,
      last_name: last_name !== undefined ? last_name : user.last_name,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar,
      role: updateRole !== undefined ? updateRole : user.role
    });

    logger.info(`User updated: ${id}`);

    res.json(successResponse(updatedUser, 'User updated successfully'));
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to update user'));
  }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    // Check authorization
    if (id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Forbidden: You can only delete your own account'));
    }

    await User.delete(id);

    logger.info(`User deleted: ${id}`);

    res.json(successResponse(null, 'User deleted successfully'));
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to delete user'));
  }
};

module.exports = exports;
