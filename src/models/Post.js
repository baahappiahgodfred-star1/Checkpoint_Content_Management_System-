const { query } = require('../config/database');

class Post {
  /**
   * Create a new post
   */
  static async create(postData) {
    const {
      title, slug, content, excerpt, author_id, category_id,
      featured_image, meta_title, meta_description, meta_keywords,
      reading_time
    } = postData;

    const result = await query(
      `INSERT INTO posts (
        title, slug, content, excerpt, author_id, category_id,
        featured_image, meta_title, meta_description, meta_keywords,
        reading_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'draft')
       RETURNING *`,
      [
        title, slug, content, excerpt, author_id, category_id,
        featured_image, meta_title, meta_description, meta_keywords,
        reading_time
      ]
    );

    return result.rows[0];
  }

  /**
   * Find post by ID
   */
  static async findById(postId) {
    const result = await query(
      `SELECT p.*, u.username as author_name, c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.user_id
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.post_id = $1`,
      [postId]
    );

    return result.rows[0] || null;
  }

  /**
   * Find post by slug
   */
  static async findBySlug(slug) {
    const result = await query(
      `SELECT p.*, u.username as author_name, c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.user_id
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.slug = $1`,
      [slug]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all posts with pagination
   */
  static async getAll(limit = 10, offset = 0, filters = {}) {
    let whereClause = 'WHERE p.status = $1';
    let params = ['published'];
    let paramIndex = 2;

    if (filters.category_id) {
      whereClause += ` AND p.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.author_id) {
      whereClause += ` AND p.author_id = $${paramIndex}`;
      params.push(filters.author_id);
      paramIndex++;
    }

    if (filters.search) {
      whereClause += ` AND (p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT p.*, u.username as author_name, c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.user_id
       LEFT JOIN categories c ON p.category_id = c.category_id
       ${whereClause}
       ORDER BY p.published_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return result.rows;
  }

  /**
   * Count posts
   */
  static async count(filters = {}) {
    let whereClause = 'WHERE status = $1';
    let params = ['published'];

    if (filters.category_id) {
      whereClause += ` AND category_id = $2`;
      params.push(filters.category_id);
    }

    const result = await query(
      `SELECT COUNT(*) FROM posts ${whereClause}`,
      params
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Update post
   */
  static async update(postId, postData) {
    const {
      title, slug, content, excerpt, category_id,
      featured_image, meta_title, meta_description, meta_keywords,
      status, reading_time
    } = postData;

    const result = await query(
      `UPDATE posts
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           content = COALESCE($3, content),
           excerpt = COALESCE($4, excerpt),
           category_id = COALESCE($5, category_id),
           featured_image = COALESCE($6, featured_image),
           meta_title = COALESCE($7, meta_title),
           meta_description = COALESCE($8, meta_description),
           meta_keywords = COALESCE($9, meta_keywords),
           status = COALESCE($10, status),
           reading_time = COALESCE($11, reading_time),
           published_at = CASE WHEN $10 = 'published' THEN CURRENT_TIMESTAMP ELSE published_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE post_id = $12
       RETURNING *`,
      [
        title, slug, content, excerpt, category_id,
        featured_image, meta_title, meta_description, meta_keywords,
        status, reading_time, postId
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete post
   */
  static async delete(postId) {
    const result = await query(
      `DELETE FROM posts WHERE post_id = $1 RETURNING post_id`,
      [postId]
    );

    return result.rows[0] || null;
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(postId) {
    await query(
      `UPDATE posts SET view_count = view_count + 1 WHERE post_id = $1`,
      [postId]
    );
  }

  /**
   * Check if slug exists
   */
  static async slugExists(slug, excludePostId = null) {
    let query_text = 'SELECT COUNT(*) FROM posts WHERE slug = $1';
    let params = [slug];

    if (excludePostId) {
      query_text += ' AND post_id != $2';
      params.push(excludePostId);
    }

    const result = await query(query_text, params);
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = Post;
