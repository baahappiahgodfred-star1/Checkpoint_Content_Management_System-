const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/helpers');

/**
 * Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    
    return res.status(400).json(errorResponse('Validation failed', errorMessages));
  }
  
  next();
};

module.exports = {
  handleValidationErrors
};
