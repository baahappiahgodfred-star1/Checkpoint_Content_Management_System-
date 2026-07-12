const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/v1/categories
 * Create a new category
 */
router.post('/', verifyToken, checkRole(['admin', 'editor']), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim(),
  body('parent_id').optional().isInt()
], handleValidationErrors, categoryController.createCategory);

/**
 * GET /api/v1/categories
 * Get all categories
 */
router.get('/', categoryController.getAllCategories);

/**
 * GET /api/v1/categories/with-count
 * Get categories with post count
 */
router.get('/with-count', categoryController.getCategoriesWithPostCount);

/**
 * GET /api/v1/categories/:id
 * Get category by ID
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * GET /api/v1/categories/slug/:slug
 * Get category by slug
 */
router.get('/slug/:slug', categoryController.getCategoryBySlug);

/**
 * PUT /api/v1/categories/:id
 * Update category
 */
router.put('/:id', verifyToken, checkRole(['admin', 'editor']), [
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('parent_id').optional().isInt(),
  body('display_order').optional().isInt(),
  body('is_active').optional().isBoolean()
], handleValidationErrors, categoryController.updateCategory);

/**
 * DELETE /api/v1/categories/:id
 * Delete category
 */
router.delete('/:id', verifyToken, checkRole(['admin']), categoryController.deleteCategory);

/**
 * GET /api/v1/categories/:id/subcategories
 * Get subcategories
 */
router.get('/:id/subcategories', categoryController.getSubcategories);

module.exports = router;
