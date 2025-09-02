// server/src/utils/helpers.js

// Generate a random string
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Format date to readable string
const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffInHours = (now - d) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - d) / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 168) { // 7 days
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Sanitize text content
const sanitizeText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate username format
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Pagination helper
const getPagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    offset
  };
};

// Error response helper
const createErrorResponse = (message, statusCode = 500, details = null) => {
  const error = {
    success: false,
    error: message,
    statusCode
  };
  
  if (details) {
    error.details = details;
  }
  
  return error;
};

// Success response helper
const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

// Check if user can perform action on resource
const canPerformAction = (user, resourceUserId, requiredRole = 'member') => {
  // Admin can do anything
  if (user.role === 'admin') return true;
  
  // Moderator can do most things
  if (user.role === 'moderator') return true;
  
  // User can only perform actions on their own resources
  if (user.role === requiredRole && user.id === resourceUserId) return true;
  
  return false;
};

// Rate limiting helper
const createRateLimitKey = (req, prefix = '') => {
  const key = `${prefix}:${req.ip}:${req.user?.id || 'anonymous'}`;
  return key;
};

module.exports = {
  generateRandomString,
  formatDate,
  sanitizeText,
  isValidEmail,
  isValidUsername,
  generateSlug,
  getPagination,
  createErrorResponse,
  createSuccessResponse,
  canPerformAction,
  createRateLimitKey
};
