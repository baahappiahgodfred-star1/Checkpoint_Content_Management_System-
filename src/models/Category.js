const { query } = require('../config/database');

class Category {
  /**
   * Create a new category
   */
  static async create(categoryData) {
    const { name, slug, description, parent_id } = categoryData;

    const result = await query(
      `INSERT INTO categories (name, slug, description, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, slug, description, parent_id || null]
    );

    return result.rows[0];
  }

  /**
   * Find category by ID
   */
  static async findById(categoryId) {
    const result = await query(
      `SELECT * FROM categories WHERE category_id = $1`,
      [categoryId]
    );

    return result.rows[0] || null;
  }

  /**
   * Find category by slug
   */
  static async findBySlug(slug) {
    const result = await query(
      `SELECT * FROM categories WHERE slug = $1`,
      [slug]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all categories
   */
  static async getAll(limit = 100, offset = 0) {
    const result = await query(
      `SELECT * FROM categories
       WHERE is_active = true
       ORDER BY display_order ASC, name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  /**
   * Get categories with post count
   */
  static async getAllWithPostCount() {
    const result = await query(
      `SELECT c.*, COUNT(p.post_id) as post_count
       FROM categories c
       LEFT JOIN posts p ON c.category_id = p.category_id AND p.status = 'published'
       WHERE c.is_active = true
       GROUP BY c.category_id
       ORDER BY c.display_order ASC, c.name ASC`
    );

    return result.rows;
  }

  /**
   * Count categories
   */
  static async count() {
    const result = await query(
      `SELECT COUNT(*) FROM categories WHERE is_active = true`
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Update category
   */
  static async update(categoryId, categoryData) {
    const { name, slug, description, parent_id, display_order, is_active } = categoryData;

    const result = await query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           parent_id = COALESCE($4, parent_id),
           display_order = COALESCE($5, display_order),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE category_id = $7
       RETURNING *`,
      [name, slug, description, parent_id, display_order, is_active, categoryId]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete category
   */
  static async delete(categoryId) {
    const result = await query(
      `DELETE FROM categories WHERE category_id = $1 RETURNING category_id`,
      [categoryId]
    );

    return result.rows[0] || null;
  }

  /**
   * Check if slug exists
   */
  static async slugExists(slug, excludeCategoryId = null) {
    let query_text = 'SELECT COUNT(*) FROM categories WHERE slug = $1';
    let params = [slug];

    if (excludeCategoryId) {
      query_text += ' AND category_id != $2';
      params.push(excludeCategoryId);
    }

    const result = await query(query_text, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Get subcategories
   */
  static async getSubcategories(parentId) {
    const result = await query(
      `SELECT * FROM categories
       WHERE parent_id = $1 AND is_active = true
       ORDER BY display_order ASC, name ASC`,
      [parentId]
    );

    return result.rows;
  }
}

module.exports = Category;
