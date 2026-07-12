const { query } = require('../config/database');

class Tag {
  /**
   * Create a new tag
   */
  static async create(tagData) {
    const { name, slug, description } = tagData;

    const result = await query(
      `INSERT INTO tags (name, slug, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, slug, description]
    );

    return result.rows[0];
  }

  /**
   * Find tag by ID
   */
  static async findById(tagId) {
    const result = await query(
      `SELECT * FROM tags WHERE tag_id = $1`,
      [tagId]
    );

    return result.rows[0] || null;
  }

  /**
   * Find tag by slug
   */
  static async findBySlug(slug) {
    const result = await query(
      `SELECT * FROM tags WHERE slug = $1`,
      [slug]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all tags
   */
  static async getAll(limit = 100, offset = 0) {
    const result = await query(
      `SELECT * FROM tags
       ORDER BY name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  /**
   * Get tags with post count
   */
  static async getAllWithPostCount() {
    const result = await query(
      `SELECT t.*, COUNT(pt.post_id) as post_count
       FROM tags t
       LEFT JOIN post_tags pt ON t.tag_id = pt.tag_id
       GROUP BY t.tag_id
       ORDER BY t.name ASC`
    );

    return result.rows;
  }

  /**
   * Count tags
   */
  static async count() {
    const result = await query('SELECT COUNT(*) FROM tags');
    return parseInt(result.rows[0].count);
  }

  /**
   * Update tag
   */
  static async update(tagId, tagData) {
    const { name, slug, description } = tagData;

    const result = await query(
      `UPDATE tags
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description)
       WHERE tag_id = $4
       RETURNING *`,
      [name, slug, description, tagId]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete tag
   */
  static async delete(tagId) {
    const result = await query(
      `DELETE FROM tags WHERE tag_id = $1 RETURNING tag_id`,
      [tagId]
    );

    return result.rows[0] || null;
  }

  /**
   * Check if slug exists
   */
  static async slugExists(slug, excludeTagId = null) {
    let query_text = 'SELECT COUNT(*) FROM tags WHERE slug = $1';
    let params = [slug];

    if (excludeTagId) {
      query_text += ' AND tag_id != $2';
      params.push(excludeTagId);
    }

    const result = await query(query_text, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Get tags for a post
   */
  static async getPostTags(postId) {
    const result = await query(
      `SELECT t.* FROM tags t
       INNER JOIN post_tags pt ON t.tag_id = pt.tag_id
       WHERE pt.post_id = $1
       ORDER BY t.name ASC`,
      [postId]
    );

    return result.rows;
  }

  /**
   * Add tag to post
   */
  static async addToPost(postId, tagId) {
    await query(
      `INSERT INTO post_tags (post_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [postId, tagId]
    );
  }

  /**
   * Remove tag from post
   */
  static async removeFromPost(postId, tagId) {
    await query(
      `DELETE FROM post_tags WHERE post_id = $1 AND tag_id = $2`,
      [postId, tagId]
    );
  }
}

module.exports = Tag;
