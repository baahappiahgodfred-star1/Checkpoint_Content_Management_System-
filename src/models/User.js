const { query } = require('../config/database');

class User {
  /**
   * Create a new user
   */
  static async create(userData) {
    const { username, email, password_hash, first_name, last_name, role } = userData;
    
    const result = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING user_id, username, email, first_name, last_name, role, created_at`,
      [username, email, password_hash, first_name, last_name, role || 'subscriber']
    );
    
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(userId) {
    const result = await query(
      `SELECT user_id, username, email, first_name, last_name, role, bio, avatar, 
              created_at, updated_at, last_login, is_active, email_verified
       FROM users WHERE user_id = $1`,
      [userId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    const result = await query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Get all users with pagination
   */
  static async getAll(limit = 10, offset = 0) {
    const result = await query(
      `SELECT user_id, username, email, first_name, last_name, role, created_at, updated_at, is_active
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Count total users
   */
  static async count() {
    const result = await query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  }

  /**
   * Update user
   */
  static async update(userId, userData) {
    const { first_name, last_name, bio, avatar, role } = userData;
    
    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           bio = COALESCE($3, bio),
           avatar = COALESCE($4, avatar),
           role = COALESCE($5, role),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6
       RETURNING user_id, username, email, first_name, last_name, role, bio, avatar, updated_at`,
      [first_name, last_name, bio, avatar, role, userId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Update last login
   */
  static async updateLastLogin(userId) {
    await query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1`,
      [userId]
    );
  }

  /**
   * Delete user
   */
  static async delete(userId) {
    const result = await query(
      `DELETE FROM users WHERE user_id = $1 RETURNING user_id`,
      [userId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email) {
    const result = await query(
      `SELECT COUNT(*) FROM users WHERE email = $1`,
      [email]
    );
    
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Check if username exists
   */
  static async usernameExists(username) {
    const result = await query(
      `SELECT COUNT(*) FROM users WHERE username = $1`,
      [username]
    );
    
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = User;
