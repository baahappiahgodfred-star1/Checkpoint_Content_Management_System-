const slugify = require('slugify');
const crypto = require('crypto');

/**
 * Generate slug from text
 */
const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

/**
 * Generate unique slug by appending random string if needed
 */
const generateUniqueSlug = async (text, checkExistsCallback) => {
  let slug = generateSlug(text);
  let exists = await checkExistsCallback(slug);
  
  if (exists) {
    const randomString = crypto.randomBytes(4).toString('hex');
    slug = `${slug}-${randomString}`;
  }
  
  return slug;
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 10) => {
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  
  // Ensure reasonable limits
  if (limit > 100) limit = 100;
  if (limit < 1) limit = 10;
  if (page < 1) page = 1;
  
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

/**
 * Calculate pagination metadata
 */
const getPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    currentPage: parseInt(page),
    totalPages,
    totalItems,
    itemsPerPage: parseInt(limit),
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Format success response
 */
const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Format error response
 */
const errorResponse = (message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

/**
 * Calculate reading time from text
 */
const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(readingTime, 1); // Minimum 1 minute
};

/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000); // Limit length
};

/**
 * Generate random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Check if date is valid
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Format date to readable string
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    default:
      return d.toISOString();
  }
};

/**
 * Extract excerpt from content
 */
const extractExcerpt = (content, length = 200) => {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  
  if (text.length <= length) {
    return text;
  }
  
  return text.substring(0, length).trim() + '...';
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate random password
 */
const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

module.exports = {
  generateSlug,
  generateUniqueSlug,
  paginate,
  getPaginationMeta,
  successResponse,
  errorResponse,
  calculateReadingTime,
  sanitizeInput,
  generateToken,
  isValidDate,
  formatDate,
  extractExcerpt,
  isValidEmail,
  generatePassword
};
