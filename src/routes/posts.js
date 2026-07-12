const express = require('express');
const { body } = require('express-validator');
const postController = require('../controllers/postController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/v1/posts
 * Create a new post
 */
router.post('/', verifyToken, checkRole(['admin', 'editor', 'author']), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('excerpt').optional().trim(),
  body('category_id').optional().isInt(),
  body('meta_title').optional().trim(),
  body('meta_description').optional().trim(),
  body('meta_keywords').optional().trim(),
  body('tags').optional().isArray()
], handleValidationErrors, postController.createPost);

/**
 * GET /api/v1/posts
 * Get all posts
 */
router.get('/', postController.getAllPosts);

/**
 * GET /api/v1/posts/:id
 * Get post by ID
 */
router.get('/:id', postController.getPostById);

/**
 * GET /api/v1/posts/slug/:slug
 * Get post by slug
 */
router.get('/slug/:slug', postController.getPostBySlug);

/**
 * PUT /api/v1/posts/:id
 * Update post
 */
router.put('/:id', verifyToken, checkRole(['admin', 'editor', 'author']), [
  body('title').optional().trim(),
  body('content').optional(),
  body('excerpt').optional().trim(),
  body('category_id').optional().isInt(),
  body('meta_title').optional().trim(),
  body('meta_description').optional().trim(),
  body('meta_keywords').optional().trim(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('tags').optional().isArray()
], handleValidationErrors, postController.updatePost);

/**
 * DELETE /api/v1/posts/:id
 * Delete post
 */
router.delete('/:id', verifyToken, checkRole(['admin', 'editor', 'author']), postController.deletePost);

module.exports = router;
