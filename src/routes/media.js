const express = require('express');
const { body } = require('express-validator');
const mediaController = require('../controllers/mediaController');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * POST /api/v1/media/upload
 * Upload media
 */
router.post('/upload', verifyToken, upload.single('file'), [
  body('alt_text').optional().trim(),
  body('caption').optional().trim()
], handleValidationErrors, mediaController.uploadMedia);

/**
 * GET /api/v1/media
 * Get all media
 */
router.get('/', mediaController.getAllMedia);

/**
 * GET /api/v1/media/:id
 * Get media by ID
 */
router.get('/:id', mediaController.getMediaById);

/**
 * PUT /api/v1/media/:id
 * Update media
 */
router.put('/:id', verifyToken, [
  body('alt_text').optional().trim(),
  body('caption').optional().trim()
], handleValidationErrors, mediaController.updateMedia);

/**
 * DELETE /api/v1/media/:id
 * Delete media
 */
router.delete('/:id', verifyToken, mediaController.deleteMedia);

module.exports = router;
