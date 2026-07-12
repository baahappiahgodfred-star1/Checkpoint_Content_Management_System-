const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/v1/users
 * Get all users
 */
router.get('/', verifyToken, checkRole(['admin']), userController.getAllUsers);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
router.get('/:id', userController.getUserById);

/**
 * PUT /api/v1/users/:id
 * Update user
 */
router.put('/:id', verifyToken, [
  body('first_name').optional().trim(),
  body('last_name').optional().trim(),
  body('bio').optional().trim(),
  body('avatar').optional().trim(),
  body('role').optional().isIn(['admin', 'editor', 'author', 'subscriber'])
], handleValidationErrors, userController.updateUser);

/**
 * DELETE /api/v1/users/:id
 * Delete user
 */
router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;
