const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json(errorResponse('Email already registered'));
    }

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json(errorResponse('Username already taken'));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      first_name,
      last_name,
      role: 'subscriber'
    });

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    logger.info(`User registered: ${user.username}`);

    res.status(201).json(successResponse({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      token
    }, 'User registered successfully'));
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json(errorResponse('Registration failed'));
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Update last login
    await User.updateLastLogin(user.user_id);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    logger.info(`User logged in: ${user.username}`);

    res.json(successResponse({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      token
    }, 'Login successful'));
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json(errorResponse('Login failed'));
  }
};

/**
 * Get current user
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    res.json(successResponse(user, 'User retrieved successfully'));
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve user'));
  }
};

/**
 * Refresh token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json(errorResponse('Refresh token required'));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const newToken = jwt.sign(
      { user_id: decoded.user_id, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json(successResponse({ token: newToken }, 'Token refreshed successfully'));
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    res.status(401).json(errorResponse('Invalid refresh token'));
  }
};

module.exports = exports;
