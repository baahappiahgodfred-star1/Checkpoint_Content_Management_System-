const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');
const { successResponse, errorResponse, paginate, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Upload media
 */
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse('No file provided'));
    }

    const { alt_text, caption } = req.body;
    const uploaded_by = req.user.user_id;

    // Create media entry
    const media = await Media.create({
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_path: req.file.path,
      file_type: req.file.mimetype.split('/')[0],
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by,
      alt_text: alt_text || '',
      caption: caption || '',
      width: null,
      height: null
    });

    logger.info(`Media uploaded: ${media.media_id}`);

    res.status(201).json(successResponse({
      ...media,
      url: `/uploads/${req.file.filename}`
    }, 'Media uploaded successfully'));
  } catch (error) {
    logger.error(`Upload media error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to upload media'));
  }
};

/**
 * Get all media
 */
exports.getAllMedia = async (req, res) => {
  try {
    const { page = 1, limit = 20, file_type, uploaded_by } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    const media = await Media.getAll(pageLimit, offset, {
      file_type: file_type || null,
      uploaded_by: uploaded_by ? parseInt(uploaded_by) : null
    });

    const total = await Media.count({
      file_type: file_type || null,
      uploaded_by: uploaded_by ? parseInt(uploaded_by) : null
    });

    const paginationMeta = getPaginationMeta(total, page, pageLimit);

    // Add URLs to media
    const mediaWithUrls = media.map(m => ({
      ...m,
      url: `/uploads/${m.filename}`
    }));

    res.json(successResponse({
      media: mediaWithUrls,
      pagination: paginationMeta
    }, 'Media retrieved successfully'));
  } catch (error) {
    logger.error(`Get media error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve media'));
  }
};

/**
 * Get media by ID
 */
exports.getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json(errorResponse('Media not found'));
    }

    res.json(successResponse({
      ...media,
      url: `/uploads/${media.filename}`
    }, 'Media retrieved successfully'));
  } catch (error) {
    logger.error(`Get media error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve media'));
  }
};

/**
 * Update media
 */
exports.updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, caption } = req.body;

    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json(errorResponse('Media not found'));
    }

    // Check authorization
    if (media.uploaded_by !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Forbidden: You can only edit your own media'));
    }

    // Update media
    const updatedMedia = await Media.update(id, {
      alt_text: alt_text !== undefined ? alt_text : media.alt_text,
      caption: caption !== undefined ? caption : media.caption
    });

    logger.info(`Media updated: ${id}`);

    res.json(successResponse({
      ...updatedMedia,
      url: `/uploads/${updatedMedia.filename}`
    }, 'Media updated successfully'));
  } catch (error) {
    logger.error(`Update media error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to update media'));
  }
};

/**
 * Delete media
 */
exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json(errorResponse('Media not found'));
    }

    // Check authorization
    if (media.uploaded_by !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Forbidden: You can only delete your own media'));
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), media.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Media.delete(id);

    logger.info(`Media deleted: ${id}`);

    res.json(successResponse(null, 'Media deleted successfully'));
  } catch (error) {
    logger.error(`Delete media error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to delete media'));
  }
};

module.exports = exports;
