const { query } = require('../config/database');

class Comment {
  /**
   * Create a new comment
   */
  static async create(commentData) {
    const { post_id, user_id, parent_id, content, ip_address, user_agent } = commentData;

    const result = await query(
      `INSERT INTO comments (post_id, user_id, parent_id, content, ip_address, user_agent, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [post_id, user_id, parent_id || null, content, ip_address, user_agent]
    );

    return result.rows[0];
  }

  /**
   * Find comment by ID
   */
  static async findById(commentId) {
    const result = await query(
      `SELECT c.*, u.username as author_name
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.user_id
       WHERE c.comment_id = $1`,
      [commentId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get comments for a post
   */
  static async getPostComments(postId, limit = 20, offset = 0, status = 'approved') {
    const result = await query(
      `SELECT c.*, u.username as author_name, u.avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.user_id
       WHERE c.post_id = $1 AND c.status = $2
       ORDER BY c.created_at DESC
       LIMIT $3 OFFSET $4`,
      [postId, status, limit, offset]
    );

    return result.rows;
  }

  /**
   * Count comments for a post
   */
  static async countPostComments(postId, status = 'approved') {
    const result = await query(
      `SELECT COUNT(*) FROM comments WHERE post_id = $1 AND status = $2`,
      [postId, status]
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Get all comments (for moderation)
   */
  static async getAll(limit = 20, offset = 0, status = null) {
    let whereClause = '';
    let params = [];

    if (status) {
      whereClause = 'WHERE status = $1';
      params = [status];
    }

    const result = await query(
      `SELECT c.*, u.username as author_name, p.title as post_title
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.user_id
       LEFT JOIN posts p ON c.post_id = p.post_id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${status ? 2 : 1} OFFSET $${status ? 3 : 2}`,
      status ? [...params, limit, offset] : [limit, offset]
    );

    return result.rows;
  }

  /**
   * Count all comments
   */
  static async count(status = null) {
    let whereClause = '';
    let params = [];

    if (status) {
      whereClause = 'WHERE status = $1';
      params = [status];
    }

    const result = await query(
      `SELECT COUNT(*) FROM comments ${whereClause}`,
      params
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Update comment
   */
  static async update(commentId, commentData) {
    const { content, status } = commentData;

    const result = await query(
      `UPDATE comments
       SET content = COALESCE($1, content),
           status = COALESCE($2, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE comment_id = $3
       RETURNING *`,
      [content, status, commentId]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete comment
   */
  static async delete(commentId) {
    const result = await query(
      `DELETE FROM comments WHERE comment_id = $1 RETURNING comment_id`,
      [commentId]
    );

    return result.rows[0] || null;
  }

  /**
   * Approve comment
   */
  static async approve(commentId) {
    return await this.update(commentId, { status: 'approved' });
  }

  /**
   * Reject comment
   */
  static async reject(commentId) {
    return await this.update(commentId, { status: 'spam' });
  }

  /**
   * Get replies to a comment
   */
  static async getReplies(parentCommentId) {
    const result = await query(
      `SELECT c.*, u.username as author_name
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.user_id
       WHERE c.parent_id = $1 AND c.status = 'approved'
       ORDER BY c.created_at ASC`,
      [parentCommentId]
    );

    return result.rows;
  }
}

module.exports = Comment;
