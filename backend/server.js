// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import middleware
const { generalLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

// Apply rate limiting
app.use(generalLimiter);

// Import routes
const authRoutes = require('./src/routes/auth');
const confessionRoutes = require('./src/routes/confessions');
const userRoutes = require('./src/routes/users');
const commentRoutes = require('./src/routes/comments');
const adminRoutes = require('./src/routes/admin');
const engagementRoutes = require('./src/routes/engagement');
const moderatorRoutes = require('./src/routes/moderator');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/moderator', moderatorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tausug Confession Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const { supabase } = require('./src/config/supabase');
    
    // Test database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      res.json({
        status: 'setup_required',
        message: 'Database tables do not exist. Please run the SQL schema first.',
        tables: {
          profiles: 'missing',
          confessions: 'missing',
          chapters: 'missing',
          comments: 'missing',
          likes: 'missing',
          bookmarks: 'missing',
          badges: 'missing',
          user_badges: 'missing',
          reports: 'missing',
          activity_logs: 'missing',
          moderation_logs: 'missing'
        }
      });
    } else if (error) {
      res.json({
        status: 'connection_error',
        message: 'Database connection error',
        error: error.message
      });
    } else {
      res.json({
        status: 'ready',
        message: 'Database is ready and tables exist',
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to check database status',
      error: err.message
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
