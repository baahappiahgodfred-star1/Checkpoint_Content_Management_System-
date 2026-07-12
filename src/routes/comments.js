const express = require('express');
const { body } = require('express-validator');
const commentController = require('../controllers/commentController');
const { verifyToken, checkRole, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/v1/comments
 * Create a new comment
 */
router.post('/', verifyToken, [
  body('post_id').isInt().withMessage('Post ID is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('parent_id').optional().isInt()
], handleValidationErrors, commentController.createComment);

/**
 * GET /api/v1/comments/post/:post_id
 * Get comments for a post
 */
router.get('/post/:post_id', commentController.getPostComments);

/**
 * GET /api/v1/comments
 * Get all comments (for moderation)
 */
router.get('/', verifyToken, checkRole(['admin', 'editor']), commentController.getAllComments);

/**
 * GET /api/v1/comments/:id
 * Get comment by ID
 */
router.get('/:id', commentController.getCommentById);

/**
 * PUT /api/v1/comments/:id
 * Update comment
 */
router.put('/:id', verifyToken, [
  body('content').optional().trim(),
  body('status').optional().isIn(['pending', 'approved', 'spam', 'trash'])
], handleValidationErrors, commentController.updateComment);

/**
 * DELETE /api/v1/comments/:id
 * Delete comment
 */
router.delete('/:id', verifyToken, commentController.deleteComment);

/**
 * POST /api/v1/comments/:id/approve
 * Approve comment
 */
router.post('/:id/approve', verifyToken, checkRole(['admin', 'editor']), commentController.approveComment);

/**
 * POST /api/v1/comments/:id/reject
 * Reject comment
 */
router.post('/:id/reject', verifyToken, checkRole(['admin', 'editor']), commentController.rejectComment);

/**
 * GET /api/v1/comments/:id/replies
 * Get comment replies
 */
router.get('/:id/replies', commentController.getCommentReplies);

module.exports = router;
