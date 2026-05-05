// Main Express Server Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Create Express app
const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now, configure later if needed
}));

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Compression
app.use(compression());

// Request logging (only in development)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// User routes
app.use('/api/users', require('./routes/users'));

// Household routes
app.use('/api/households', require('./routes/households'));

// People routes
app.use('/api/people', require('./routes/people'));

// Meal planning routes
app.use('/api/meals', require('./routes/meals'));

// Pantry routes
app.use('/api/pantry', require('./routes/pantry'));

// Lab routes
app.use('/api/labs', require('./routes/labs'));

// Grocery list routes
app.use('/api/grocery', require('./routes/grocery'));

// Label analysis routes
app.use('/api/labels', require('./routes/labels'));

// Chat routes
app.use('/api/chat', require('./routes/chat'));

// Knowledge base routes
app.use('/api/knowledge', require('./routes/knowledge'));

// Fitness routes
app.use('/api/fitness', require('./routes/fitness'));

// Fitness AI Coach Chat routes
app.use('/api/fitness-chat', require('./routes/fitnessChat'));

// Fitness Family Leaderboard
app.use('/api/fitness/leaderboard', require('./routes/fitnessLeaderboard'));

// Fitness Weekly Check-In
app.use('/api/fitness/weekly-checkin', require('./routes/fitnessCheckIn'));

// Fitness Custom Plan Builder
app.use('/api/fitness/custom-plan', require('./routes/fitnessCustomPlan'));

// Family Challenges
app.use('/api/fitness/challenges', require('./routes/fitnessChallenges'));

// AI Progress Review
app.use('/api/fitness/progress-review', require('./routes/fitnessProgressReview'));


// Data import route
app.use('/api/import', require('./routes/import'));

// ============================================================================
// SERVE FRONTEND (Production)
// ============================================================================

if (config.nodeEnv === 'production') {
  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, '../public')));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    }
  });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Run Phase 5 fitness migrations (add person_id columns) — idempotent
    try {
      const { runFitnessMigrations } = require('./database/fitnessMigrations');
      await runFitnessMigrations();
    } catch (migErr) {
      console.warn('[Migrations] Fitness migrations skipped:', migErr.message);
    }

    // Start listening
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Meal Plan Assistant Server');
      console.log('================================');
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Port: ${PORT}`);
      console.log(`   Database: ${config.database.name}`);
      console.log(`   Frontend: ${config.frontendUrl}`);
      console.log('================================');
      console.log('');

      // Start background jobs
      try {
        const { startFitnessCleanupJobs } = require('./jobs/fitnessCleanup');
        startFitnessCleanupJobs();
      } catch (jobErr) {
        console.warn('[Jobs] Fitness cleanup jobs failed to start:', jobErr.message);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;

