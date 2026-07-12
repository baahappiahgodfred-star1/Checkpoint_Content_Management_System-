const Tag = require('../models/Tag');
const { successResponse, errorResponse, paginate, getPaginationMeta, generateSlug } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Create a new tag
 */
exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug already exists
    const slugExists = await Tag.slugExists(slug);
    if (slugExists) {
      return res.status(400).json(errorResponse('A tag with this name already exists'));
    }

    // Create tag
    const tag = await Tag.create({
      name,
      slug,
      description: description || ''
    });

    logger.info(`Tag created: ${tag.tag_id}`);

    res.status(201).json(successResponse(tag, 'Tag created successfully'));
  } catch (error) {
    logger.error(`Create tag error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to create tag'));
  }
};

/**
 * Get all tags
 */
exports.getAllTags = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    const tags = await Tag.getAll(pageLimit, offset);
    const total = await Tag.count();
    const paginationMeta = getPaginationMeta(total, page, pageLimit);

    res.json(successResponse({
      tags,
      pagination: paginationMeta
    }, 'Tags retrieved successfully'));
  } catch (error) {
    logger.error(`Get tags error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve tags'));
  }
};

/**
 * Get tags with post count
 */
exports.getTagsWithPostCount = async (req, res) => {
  try {
    const tags = await Tag.getAllWithPostCount();

    res.json(successResponse(tags, 'Tags retrieved successfully'));
  } catch (error) {
    logger.error(`Get tags with post count error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve tags'));
  }
};

/**
 * Get tag by ID
 */
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json(errorResponse('Tag not found'));
    }

    res.json(successResponse(tag, 'Tag retrieved successfully'));
  } catch (error) {
    logger.error(`Get tag error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve tag'));
  }
};

/**
 * Get tag by slug
 */
exports.getTagBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tag = await Tag.findBySlug(slug);
    if (!tag) {
      return res.status(404).json(errorResponse('Tag not found'));
    }

    res.json(successResponse(tag, 'Tag retrieved successfully'));
  } catch (error) {
    logger.error(`Get tag by slug error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve tag'));
  }
};

/**
 * Update tag
 */
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json(errorResponse('Tag not found'));
    }

    // Generate new slug if name changed
    let slug = tag.slug;
    if (name && name !== tag.name) {
      slug = generateSlug(name);
      const slugExists = await Tag.slugExists(slug, id);
      if (slugExists) {
        return res.status(400).json(errorResponse('A tag with this name already exists'));
      }
    }

    // Update tag
    const updatedTag = await Tag.update(id, {
      name: name || tag.name,
      slug,
      description: description !== undefined ? description : tag.description
    });

    logger.info(`Tag updated: ${id}`);

    res.json(successResponse(updatedTag, 'Tag updated successfully'));
  } catch (error) {
    logger.error(`Update tag error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to update tag'));
  }
};

/**
 * Delete tag
 */
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json(errorResponse('Tag not found'));
    }

    await Tag.delete(id);

    logger.info(`Tag deleted: ${id}`);

    res.json(successResponse(null, 'Tag deleted successfully'));
  } catch (error) {
    logger.error(`Delete tag error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to delete tag'));
  }
};

module.exports = exports;
