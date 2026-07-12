const express = require('express');
const { body } = require('express-validator');
const tagController = require('../controllers/tagController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/v1/tags
 * Create a new tag
 */
router.post('/', verifyToken, checkRole(['admin', 'editor']), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim()
], handleValidationErrors, tagController.createTag);

/**
 * GET /api/v1/tags
 * Get all tags
 */
router.get('/', tagController.getAllTags);

/**
 * GET /api/v1/tags/with-count
 * Get tags with post count
 */
router.get('/with-count', tagController.getTagsWithPostCount);

/**
 * GET /api/v1/tags/:id
 * Get tag by ID
 */
router.get('/:id', tagController.getTagById);

/**
 * GET /api/v1/tags/slug/:slug
 * Get tag by slug
 */
router.get('/slug/:slug', tagController.getTagBySlug);

/**
 * PUT /api/v1/tags/:id
 * Update tag
 */
router.put('/:id', verifyToken, checkRole(['admin', 'editor']), [
  body('name').optional().trim(),
  body('description').optional().trim()
], handleValidationErrors, tagController.updateTag);

/**
 * DELETE /api/v1/tags/:id
 * Delete tag
 */
router.delete('/:id', verifyToken, checkRole(['admin']), tagController.deleteTag);

module.exports = router;
