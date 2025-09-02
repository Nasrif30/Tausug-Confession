// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    console.log('🔐 Auth Debug - Token received:', token.substring(0, 20) + '...');
    console.log('🔐 Auth Debug - JWT_SECRET exists:', !!process.env.JWT_SECRET);

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Auth Debug - Token decoded:', decoded);
    
    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    console.log('🔐 Auth Debug - Profile lookup result:', { profile: !!profile, error: error?.message });

    if (error || !profile) {
      console.log('🔐 Auth Debug - Profile lookup failed, returning 403');
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Token is invalid or user not found'
      });
    }

    // Check if user is banned
    if (profile.is_banned) {
      console.log('🔐 Auth Debug - User is banned, returning 403');
      return res.status(403).json({ 
        error: 'Account suspended',
        message: profile.ban_reason || 'Your account has been suspended'
      });
    }

    // Check if user account is active
    console.log('🔐 Auth Debug - Authentication successful, user:', { id: profile.id, username: profile.username, role: profile.role });
    req.user = profile;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Token is malformed or invalid'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token expired',
        message: 'Please login again'
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        error: 'Authentication failed',
        message: 'Internal server error during authentication'
      });
    }
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = requireRole(['admin']);

// Middleware to check if user is moderator or admin
const requireModerator = requireRole(['moderator', 'admin']);

// Middleware to check if user is admin or moderator
const requireAdminOrModerator = requireRole(['admin', 'moderator']);

// Middleware to check if user can create content (member, moderator, or admin)
const requireMember = requireRole(['member', 'moderator', 'admin']);

// Optional authentication - sets req.user if token is valid, but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (!error && profile && !profile.is_banned) {
      req.user = profile;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireModerator,
  requireAdminOrModerator,
  requireMember,
  optionalAuth
};