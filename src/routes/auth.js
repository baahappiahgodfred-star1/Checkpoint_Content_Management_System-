const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').optional().trim(),
  body('last_name').optional().trim()
], handleValidationErrors, authController.register);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, authController.login);

/**
 * GET /api/v1/auth/me
 * Get current user
 */
router.get('/me', verifyToken, authController.getCurrentUser);

/**
 * POST /api/v1/auth/refresh
 * Refresh token
 */
router.post('/refresh', authController.refreshToken);

module.exports = router;
