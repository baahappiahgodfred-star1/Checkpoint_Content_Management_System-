const { query } = require('../config/database');

class Media {
  /**
   * Create a new media entry
   */
  static async create(mediaData) {
    const {
      filename, original_name, file_path, file_type, file_size,
      mime_type, uploaded_by, alt_text, caption, width, height
    } = mediaData;

    const result = await query(
      `INSERT INTO media (
        filename, original_name, file_path, file_type, file_size,
        mime_type, uploaded_by, alt_text, caption, width, height
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        filename, original_name, file_path, file_type, file_size,
        mime_type, uploaded_by, alt_text, caption, width, height
      ]
    );

    return result.rows[0];
  }

  /**
   * Find media by ID
   */
  static async findById(mediaId) {
    const result = await query(
      `SELECT m.*, u.username as uploaded_by_name
       FROM media m
       LEFT JOIN users u ON m.uploaded_by = u.user_id
       WHERE m.media_id = $1`,
      [mediaId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all media with pagination
   */
  static async getAll(limit = 20, offset = 0, filters = {}) {
    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    if (filters.file_type) {
      whereClause += `file_type = $${paramIndex}`;
      params.push(filters.file_type);
      paramIndex++;
    }

    if (filters.uploaded_by) {
      whereClause += `${whereClause ? ' AND ' : ''}uploaded_by = $${paramIndex}`;
      params.push(filters.uploaded_by);
      paramIndex++;
    }

    const whereClauseStr = whereClause ? `WHERE ${whereClause}` : '';

    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT m.*, u.username as uploaded_by_name
       FROM media m
       LEFT JOIN users u ON m.uploaded_by = u.user_id
       ${whereClauseStr}
       ORDER BY m.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return result.rows;
  }

  /**
   * Count media files
   */
  static async count(filters = {}) {
    let whereClause = '';
    let params = [];

    if (filters.file_type) {
      whereClause = 'WHERE file_type = $1';
      params.push(filters.file_type);
    }

    const result = await query(
      `SELECT COUNT(*) FROM media ${whereClause}`,
      params
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Update media
   */
  static async update(mediaId, mediaData) {
    const { alt_text, caption } = mediaData;

    const result = await query(
      `UPDATE media
       SET alt_text = COALESCE($1, alt_text),
           caption = COALESCE($2, caption)
       WHERE media_id = $3
       RETURNING *`,
      [alt_text, caption, mediaId]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete media
   */
  static async delete(mediaId) {
    const result = await query(
      `DELETE FROM media WHERE media_id = $1 RETURNING *`,
      [mediaId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get media by file type
   */
  static async getByFileType(fileType, limit = 20, offset = 0) {
    const result = await query(
      `SELECT * FROM media
       WHERE file_type = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [fileType, limit, offset]
    );

    return result.rows;
  }

  /**
   * Get media uploaded by user
   */
  static async getByUser(userId, limit = 20, offset = 0) {
    const result = await query(
      `SELECT * FROM media
       WHERE uploaded_by = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }
}

module.exports = Media;
