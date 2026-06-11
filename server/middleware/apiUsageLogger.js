/**
 * API Usage Logger Middleware
 * 
 * Logs every /api/ request into the api_usage_logs table.
 * For AI-powered routes, picks up token metadata from req._aiUsage
 * (set by the instrumented aiService).
 * 
 * Non-blocking — uses fire-and-forget async insert to avoid
 * impacting response latency.
 */
const { v4: uuidv4 } = require('uuid');

// Lazy-load database to avoid circular dependency at require time
let _query = null;
function getQuery() {
  if (!_query) {
    _query = require('../config/database').query;
  }
  return _query;
}

/**
 * Creates the API usage logging middleware
 */
function apiUsageLogger() {
  return (req, res, next) => {
    // Only log /api/ routes (skip static assets, health checks from load balancers)
    if (!req.path.startsWith('/api/')) {
      return next();
    }

    // Skip logging the admin audit/usage endpoints themselves to avoid recursion
    if (req.path.startsWith('/api/admin/')) {
      return next();
    }

    const startTime = Date.now();

    // Intercept the response finish to capture status code and latency
    const originalEnd = res.end;
    res.end = function (...args) {
      const latencyMs = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Fire-and-forget — don't await, don't block response
      logUsage(req, statusCode, latencyMs).catch(err => {
        // Silent failure — usage logging must never break the app
        if (process.env.NODE_ENV === 'development') {
          console.warn('[API Usage Logger] Insert failed:', err.message);
        }
      });

      originalEnd.apply(res, args);
    };

    next();
  };
}

/**
 * Insert a usage log row
 */
async function logUsage(req, statusCode, latencyMs) {
  const query = getQuery();
  const aiUsage = req._aiUsage || {};

  await query(
    `INSERT INTO api_usage_logs 
     (id, user_id, endpoint, method, provider, model, tokens_input, tokens_output, cost_usd, latency_ms, status_code, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      req.userId || null,
      req.path,
      req.method,
      aiUsage.provider || null,
      aiUsage.model || null,
      aiUsage.tokensInput || 0,
      aiUsage.tokensOutput || 0,
      aiUsage.costUsd || 0,
      latencyMs,
      statusCode,
      aiUsage.error || null,
    ]
  );
}

module.exports = { apiUsageLogger };
