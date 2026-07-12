const Category = require('../models/Category');
const { successResponse, errorResponse, paginate, getPaginationMeta, generateSlug } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Create a new category
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parent_id } = req.body;

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug already exists
    const slugExists = await Category.slugExists(slug);
    if (slugExists) {
      return res.status(400).json(errorResponse('A category with this name already exists'));
    }

    // Create category
    const category = await Category.create({
      name,
      slug,
      description: description || '',
      parent_id: parent_id || null
    });

    logger.info(`Category created: ${category.category_id}`);

    res.status(201).json(successResponse(category, 'Category created successfully'));
  } catch (error) {
    logger.error(`Create category error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to create category'));
  }
};

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    const categories = await Category.getAll(pageLimit, offset);
    const total = await Category.count();
    const paginationMeta = getPaginationMeta(total, page, pageLimit);

    res.json(successResponse({
      categories,
      pagination: paginationMeta
    }, 'Categories retrieved successfully'));
  } catch (error) {
    logger.error(`Get categories error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve categories'));
  }
};

/**
 * Get categories with post count
 */
exports.getCategoriesWithPostCount = async (req, res) => {
  try {
    const categories = await Category.getAllWithPostCount();

    res.json(successResponse(categories, 'Categories retrieved successfully'));
  } catch (error) {
    logger.error(`Get categories with post count error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve categories'));
  }
};

/**
 * Get category by ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(errorResponse('Category not found'));
    }

    res.json(successResponse(category, 'Category retrieved successfully'));
  } catch (error) {
    logger.error(`Get category error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve category'));
  }
};

/**
 * Get category by slug
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findBySlug(slug);
    if (!category) {
      return res.status(404).json(errorResponse('Category not found'));
    }

    res.json(successResponse(category, 'Category retrieved successfully'));
  } catch (error) {
    logger.error(`Get category by slug error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve category'));
  }
};

/**
 * Update category
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id, display_order, is_active } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(errorResponse('Category not found'));
    }

    // Generate new slug if name changed
    let slug = category.slug;
    if (name && name !== category.name) {
      slug = generateSlug(name);
      const slugExists = await Category.slugExists(slug, id);
      if (slugExists) {
        return res.status(400).json(errorResponse('A category with this name already exists'));
      }
    }

    // Update category
    const updatedCategory = await Category.update(id, {
      name: name || category.name,
      slug,
      description: description !== undefined ? description : category.description,
      parent_id: parent_id !== undefined ? parent_id : category.parent_id,
      display_order: display_order !== undefined ? display_order : category.display_order,
      is_active: is_active !== undefined ? is_active : category.is_active
    });

    logger.info(`Category updated: ${id}`);

    res.json(successResponse(updatedCategory, 'Category updated successfully'));
  } catch (error) {
    logger.error(`Update category error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to update category'));
  }
};

/**
 * Delete category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(errorResponse('Category not found'));
    }

    await Category.delete(id);

    logger.info(`Category deleted: ${id}`);

    res.json(successResponse(null, 'Category deleted successfully'));
  } catch (error) {
    logger.error(`Delete category error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to delete category'));
  }
};

/**
 * Get subcategories
 */
exports.getSubcategories = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategories = await Category.getSubcategories(id);

    res.json(successResponse(subcategories, 'Subcategories retrieved successfully'));
  } catch (error) {
    logger.error(`Get subcategories error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve subcategories'));
  }
};

module.exports = exports;
