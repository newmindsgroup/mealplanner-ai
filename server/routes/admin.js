/**
 * Super Admin Routes — /api/admin
 * 
 * All routes protected by authenticateToken + requireSuperAdmin.
 * 
 * Modules:
 *   Dashboard    — /api/admin/dashboard
 *   Users        — /api/admin/users
 *   API Keys     — /api/admin/api-keys
 *   Tokenomics   — /api/admin/tokenomics
 *   Health       — /api/admin/health
 *   Audit Logs   — /api/admin/audit-logs
 *   Services     — /api/admin/services
 *   Config       — /api/admin/config
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const config = require('../config/config');
const { query, queryOne } = require('../config/database');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Apply auth + super admin check to ALL admin routes
router.use(authenticateToken, requireSuperAdmin);

// ============================================================================
// AUDIT HELPER — Log every admin action
// ============================================================================

async function auditLog(req, action, targetType = null, targetId = null, details = null) {
  try {
    await query(
      `INSERT INTO audit_logs (id, actor_id, actor_email, action, target_type, target_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), req.userId, req.user.email, action, targetType, targetId, details ? JSON.stringify(details) : null, req.ip]
    );
  } catch (err) {
    console.warn('[Admin Audit] Log failed:', err.message);
  }
}

// ============================================================================
// DASHBOARD — Aggregated platform overview
// ============================================================================

router.get('/dashboard', asyncHandler(async (req, res) => {
  await auditLog(req, 'admin.dashboard_viewed');

  // User stats
  const userStats = await queryOne(`
    SELECT 
      COUNT(*) as total_users,
      SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as active_24h,
      SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as active_7d,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as new_24h,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_7d
    FROM users
  `);

  // Subscription tier distribution
  const tierDist = await query(`
    SELECT COALESCE(subscription_tier, 'free') as tier, COUNT(*) as count
    FROM users
    GROUP BY COALESCE(subscription_tier, 'free')
  `).catch(() => []);

  // API usage last 24h
  const apiStats = await queryOne(`
    SELECT 
      COUNT(*) as total_calls,
      COALESCE(SUM(tokens_input + tokens_output), 0) as total_tokens,
      ROUND(COALESCE(SUM(cost_usd), 0), 4) as total_cost,
      ROUND(AVG(latency_ms), 0) as avg_latency,
      ROUND((SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) / GREATEST(COUNT(*), 1)) * 100, 2) as error_rate
    FROM api_usage_logs
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  `);

  // Top endpoints
  const topEndpoints = await query(`
    SELECT endpoint, COUNT(*) as calls, ROUND(AVG(latency_ms), 0) as avg_ms
    FROM api_usage_logs
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    GROUP BY endpoint
    ORDER BY calls DESC
    LIMIT 10
  `);

  // Service health (latest snapshot)
  const latestHealth = await queryOne(`
    SELECT * FROM system_health_snapshots 
    ORDER BY snapshot_at DESC LIMIT 1
  `);

  // Active services from registry
  const services = await query(`
    SELECT name, type, status, health_status, last_health 
    FROM service_registry ORDER BY name
  `);

  res.json({
    success: true,
    data: {
      users: {
        total: userStats?.total_users || 0,
        active24h: userStats?.active_24h || 0,
        active7d: userStats?.active_7d || 0,
        new24h: userStats?.new_24h || 0,
        new7d: userStats?.new_7d || 0,
        tierDistribution: tierDist,
      },
      api: {
        calls24h: apiStats?.total_calls || 0,
        tokens24h: apiStats?.total_tokens || 0,
        cost24h: apiStats?.total_cost || 0,
        avgLatency: apiStats?.avg_latency || 0,
        errorRate: apiStats?.error_rate || 0,
        topEndpoints,
      },
      health: latestHealth,
      services,
    },
  });
}));

// ============================================================================
// USER MANAGEMENT — No private data exposed
// ============================================================================

router.get('/users', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 25, 100);
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const tier = req.query.tier || '';

  let whereClause = '1=1';
  const params = [];

  if (search) {
    whereClause += ' AND (u.email LIKE ? OR u.name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (role) {
    whereClause += ' AND u.role = ?';
    params.push(role);
  }
  if (tier) {
    whereClause += ' AND COALESCE(u.subscription_tier, "free") = ?';
    params.push(tier);
  }

  const total = await queryOne(
    `SELECT COUNT(*) as cnt FROM users u WHERE ${whereClause}`,
    params
  );

  const users = await query(
    `SELECT 
      u.id, u.email, u.name, u.role, u.email_verified,
      COALESCE(u.subscription_tier, 'free') as tier,
      u.created_at, u.last_login,
      (SELECT COUNT(*) FROM api_usage_logs WHERE user_id = u.id) as api_calls,
      (SELECT COALESCE(SUM(tokens_input + tokens_output), 0) FROM api_usage_logs WHERE user_id = u.id) as total_tokens,
      (SELECT ROUND(COALESCE(SUM(cost_usd), 0), 4) FROM api_usage_logs WHERE user_id = u.id) as total_cost
     FROM users u
     WHERE ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total: total?.cnt || 0,
        pages: Math.ceil((total?.cnt || 0) / limit),
      },
    },
  });
}));

// Promote/demote user role
router.patch('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'super_admin'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' });
  }

  // Prevent self-demotion
  if (req.params.id === req.userId && role !== 'super_admin') {
    return res.status(400).json({ success: false, error: 'Cannot demote yourself' });
  }

  const user = await queryOne('SELECT id, email FROM users WHERE id = ?', [req.params.id]);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  await query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  await auditLog(req, 'admin.user_role_changed', 'user', req.params.id, { newRole: role, email: user.email });

  res.json({ success: true, message: `User ${user.email} role updated to ${role}` });
}));

// Per-user usage breakdown
router.get('/users/:id/usage', asyncHandler(async (req, res) => {
  const usage = await query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as calls,
      COALESCE(SUM(tokens_input), 0) as tokens_in,
      COALESCE(SUM(tokens_output), 0) as tokens_out,
      ROUND(COALESCE(SUM(cost_usd), 0), 4) as cost,
      ROUND(AVG(latency_ms), 0) as avg_latency
    FROM api_usage_logs
    WHERE user_id = ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `, [req.params.id]);

  const byEndpoint = await query(`
    SELECT endpoint, COUNT(*) as calls, ROUND(AVG(latency_ms), 0) as avg_ms
    FROM api_usage_logs
    WHERE user_id = ?
    GROUP BY endpoint
    ORDER BY calls DESC
    LIMIT 20
  `, [req.params.id]);

  res.json({ success: true, data: { daily: usage, byEndpoint } });
}));

// ============================================================================
// API KEY MANAGEMENT — System-level keys
// ============================================================================

router.get('/api-keys', asyncHandler(async (req, res) => {
  await auditLog(req, 'admin.api_keys_viewed');

  // Return system key status (masked)
  const systemKeys = [
    { provider: 'openai', configured: !!config.ai.openaiKey, maskedKey: maskKey(config.ai.openaiKey) },
    { provider: 'anthropic', configured: !!config.ai.anthropicKey, maskedKey: maskKey(config.ai.anthropicKey) },
    { provider: 'usda', configured: !!process.env.USDA_API_KEY, maskedKey: maskKey(process.env.USDA_API_KEY) },
    { provider: 'google_ai', configured: !!process.env.GOOGLE_AI_STUDIO_KEY, maskedKey: maskKey(process.env.GOOGLE_AI_STUDIO_KEY) },
    { provider: 'search', configured: !!process.env.SEARCH_API_KEY, maskedKey: maskKey(process.env.SEARCH_API_KEY) },
    { provider: 'stripe', configured: !!process.env.STRIPE_SECRET_KEY, maskedKey: maskKey(process.env.STRIPE_SECRET_KEY) },
  ];

  // User-level keys (count only, no actual key data)
  const userKeyStats = await query(`
    SELECT provider, COUNT(*) as count, SUM(is_active) as active
    FROM api_keys
    GROUP BY provider
  `);

  // Cost breakdown by provider
  const costByProvider = await query(`
    SELECT 
      provider,
      COUNT(*) as calls,
      COALESCE(SUM(tokens_input + tokens_output), 0) as total_tokens,
      ROUND(COALESCE(SUM(cost_usd), 0), 4) as total_cost
    FROM api_usage_logs
    WHERE provider IS NOT NULL AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY provider
  `);

  res.json({
    success: true,
    data: {
      systemKeys,
      userKeyStats,
      costByProvider,
    },
  });
}));

router.get('/api-keys/consumption', asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;

  const consumption = await query(`
    SELECT 
      DATE(created_at) as date,
      provider,
      COUNT(*) as calls,
      COALESCE(SUM(tokens_input), 0) as tokens_in,
      COALESCE(SUM(tokens_output), 0) as tokens_out,
      ROUND(COALESCE(SUM(cost_usd), 0), 6) as cost
    FROM api_usage_logs
    WHERE provider IS NOT NULL AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(created_at), provider
    ORDER BY date DESC, provider
  `, [days]);

  res.json({ success: true, data: consumption });
}));

// ============================================================================
// TOKEN ECONOMICS
// ============================================================================

router.get('/tokenomics', asyncHandler(async (req, res) => {
  const range = req.query.range || '30d';
  let interval, groupBy;

  switch (range) {
    case '24h':
      interval = '24 HOUR';
      groupBy = "DATE_FORMAT(created_at, '%Y-%m-%d %H:00')";
      break;
    case '7d':
      interval = '7 DAY';
      groupBy = 'DATE(created_at)';
      break;
    case '90d':
      interval = '90 DAY';
      groupBy = "DATE_FORMAT(created_at, '%Y-%u')";
      break;
    default:
      interval = '30 DAY';
      groupBy = 'DATE(created_at)';
  }

  const timeline = await query(`
    SELECT 
      ${groupBy} as period,
      COUNT(*) as calls,
      COALESCE(SUM(tokens_input), 0) as tokens_in,
      COALESCE(SUM(tokens_output), 0) as tokens_out,
      ROUND(COALESCE(SUM(cost_usd), 0), 4) as cost,
      ROUND(AVG(latency_ms), 0) as avg_latency
    FROM api_usage_logs
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
    GROUP BY period
    ORDER BY period ASC
  `);

  // Totals
  const totals = await queryOne(`
    SELECT 
      COUNT(*) as total_calls,
      COALESCE(SUM(tokens_input + tokens_output), 0) as total_tokens,
      ROUND(COALESCE(SUM(cost_usd), 0), 4) as total_cost
    FROM api_usage_logs
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
  `);

  res.json({ success: true, data: { timeline, totals, range } });
}));

router.get('/tokenomics/by-user', asyncHandler(async (req, res) => {
  const topUsers = await query(`
    SELECT 
      u.id, u.email, u.name,
      COUNT(l.id) as calls,
      COALESCE(SUM(l.tokens_input + l.tokens_output), 0) as total_tokens,
      ROUND(COALESCE(SUM(l.cost_usd), 0), 4) as total_cost
    FROM api_usage_logs l
    JOIN users u ON u.id = l.user_id
    WHERE l.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY u.id, u.email, u.name
    ORDER BY total_cost DESC
    LIMIT 25
  `);

  res.json({ success: true, data: topUsers });
}));

router.get('/tokenomics/by-model', asyncHandler(async (req, res) => {
  const byModel = await query(`
    SELECT 
      COALESCE(model, 'unknown') as model,
      provider,
      COUNT(*) as calls,
      COALESCE(SUM(tokens_input), 0) as tokens_in,
      COALESCE(SUM(tokens_output), 0) as tokens_out,
      ROUND(COALESCE(SUM(cost_usd), 0), 4) as total_cost
    FROM api_usage_logs
    WHERE provider IS NOT NULL AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY model, provider
    ORDER BY total_cost DESC
  `);

  res.json({ success: true, data: byModel });
}));

router.get('/tokenomics/forecast', asyncHandler(async (req, res) => {
  // Simple linear forecast based on last 7 days → project 30 days
  const last7d = await queryOne(`
    SELECT 
      ROUND(COALESCE(SUM(cost_usd), 0), 4) as cost_7d,
      COUNT(*) as calls_7d,
      COALESCE(SUM(tokens_input + tokens_output), 0) as tokens_7d
    FROM api_usage_logs
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  `);

  const dailyAvgCost = (last7d?.cost_7d || 0) / 7;
  const dailyAvgCalls = (last7d?.calls_7d || 0) / 7;
  const dailyAvgTokens = (last7d?.tokens_7d || 0) / 7;

  res.json({
    success: true,
    data: {
      last7d,
      projectedMonthly: {
        cost: Math.round(dailyAvgCost * 30 * 100) / 100,
        calls: Math.round(dailyAvgCalls * 30),
        tokens: Math.round(dailyAvgTokens * 30),
      },
      dailyAvg: {
        cost: Math.round(dailyAvgCost * 100) / 100,
        calls: Math.round(dailyAvgCalls),
        tokens: Math.round(dailyAvgTokens),
      },
    },
  });
}));

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

router.get('/health', asyncHandler(async (req, res) => {
  // Live health checks
  const checks = {};

  // MySQL
  try {
    const start = Date.now();
    await queryOne('SELECT 1');
    checks.mysql = { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err) {
    checks.mysql = { status: 'error', error: err.message };
  }

  // Swarm
  const swarmUrl = process.env.NOURISH_SWARM_URL || process.env.SWARM_API_URL || 'http://localhost:8000';
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(`${swarmUrl}/docs`, { signal: controller.signal });
    clearTimeout(timeout);
    checks.swarm = { status: resp.ok ? 'healthy' : 'degraded', latencyMs: Date.now() - start, url: swarmUrl };
  } catch (err) {
    checks.swarm = { status: 'offline', error: err.message, url: swarmUrl };
  }

  // Stripe
  checks.stripe = { status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured' };

  // SMTP
  checks.smtp = { status: process.env.SMTP_HOST ? 'configured' : 'not_configured' };

  // Database stats
  let dbStats = {};
  try {
    const tableCount = await queryOne(`
      SELECT COUNT(*) as cnt FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    const dbSize = await queryOne(`
      SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.tables WHERE table_schema = DATABASE()
    `);
    dbStats = { tables: tableCount?.cnt || 0, sizeMb: dbSize?.size_mb || 0 };
  } catch {
    dbStats = { tables: 'unavailable', sizeMb: 'unavailable' };
  }

  res.json({
    success: true,
    data: {
      checks,
      database: dbStats,
      environment: config.nodeEnv,
      serverTime: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
}));

router.get('/health/history', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  const snapshots = await query(`
    SELECT * FROM system_health_snapshots
    ORDER BY snapshot_at DESC
    LIMIT ?
  `, [limit]);

  res.json({ success: true, data: snapshots });
}));

router.get('/health/database', asyncHandler(async (req, res) => {
  const tables = await query(`
    SELECT 
      table_name as name,
      table_rows as rows,
      ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb,
      ROUND(index_length / 1024 / 1024, 2) as index_size_mb
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
    ORDER BY (data_length + index_length) DESC
  `);

  res.json({ success: true, data: tables });
}));

// ============================================================================
// AUDIT LOGS
// ============================================================================

router.get('/audit-logs', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = (page - 1) * limit;
  const action = req.query.action || '';
  const actorId = req.query.actor_id || '';

  let whereClause = '1=1';
  const params = [];

  if (action) {
    whereClause += ' AND action LIKE ?';
    params.push(`%${action}%`);
  }
  if (actorId) {
    whereClause += ' AND actor_id = ?';
    params.push(actorId);
  }

  const total = await queryOne(
    `SELECT COUNT(*) as cnt FROM audit_logs WHERE ${whereClause}`,
    params
  );

  const logs = await query(
    `SELECT * FROM audit_logs 
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page,
        limit,
        total: total?.cnt || 0,
        pages: Math.ceil((total?.cnt || 0) / limit),
      },
    },
  });
}));

// ============================================================================
// SERVICE REGISTRY (MCPs, CLIs, webhooks)
// ============================================================================

router.get('/services', asyncHandler(async (req, res) => {
  const services = await query('SELECT * FROM service_registry ORDER BY name');
  res.json({ success: true, data: services });
}));

router.post('/services', asyncHandler(async (req, res) => {
  const { name, type, url, config: svcConfig } = req.body;

  if (!name || !type) {
    return res.status(400).json({ success: false, error: 'name and type are required' });
  }

  const validTypes = ['mcp', 'api', 'cli', 'webhook', 'swarm'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ success: false, error: `type must be one of: ${validTypes.join(', ')}` });
  }

  const id = uuidv4();
  await query(
    `INSERT INTO service_registry (id, name, type, url, config)
     VALUES (?, ?, ?, ?, ?)`,
    [id, name, type, url || null, svcConfig ? JSON.stringify(svcConfig) : '{}']
  );

  await auditLog(req, 'admin.service_created', 'service', id, { name, type, url });

  res.status(201).json({ success: true, data: { id, name, type, url } });
}));

router.patch('/services/:id', asyncHandler(async (req, res) => {
  const { name, type, url, status, config: svcConfig } = req.body;
  const updates = [];
  const params = [];

  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (type !== undefined) { updates.push('type = ?'); params.push(type); }
  if (url !== undefined) { updates.push('url = ?'); params.push(url); }
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (svcConfig !== undefined) { updates.push('config = ?'); params.push(JSON.stringify(svcConfig)); }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, error: 'No fields to update' });
  }

  params.push(req.params.id);
  await query(`UPDATE service_registry SET ${updates.join(', ')} WHERE id = ?`, params);
  await auditLog(req, 'admin.service_updated', 'service', req.params.id, req.body);

  res.json({ success: true, message: 'Service updated' });
}));

router.delete('/services/:id', asyncHandler(async (req, res) => {
  const svc = await queryOne('SELECT name FROM service_registry WHERE id = ?', [req.params.id]);
  if (!svc) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }

  await query('DELETE FROM service_registry WHERE id = ?', [req.params.id]);
  await auditLog(req, 'admin.service_deleted', 'service', req.params.id, { name: svc.name });

  res.json({ success: true, message: 'Service deleted' });
}));

router.post('/services/:id/health-check', asyncHandler(async (req, res) => {
  const svc = await queryOne('SELECT * FROM service_registry WHERE id = ?', [req.params.id]);
  if (!svc) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }

  let healthStatus = 'unknown';
  let latencyMs = 0;
  let errorMsg = null;

  if (svc.url) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const resp = await fetch(svc.url, { signal: controller.signal });
      clearTimeout(timeout);
      latencyMs = Date.now() - start;
      healthStatus = resp.ok ? 'healthy' : 'degraded';
    } catch (err) {
      latencyMs = Date.now() - start;
      healthStatus = 'offline';
      errorMsg = err.message;
    }
  }

  await query(
    'UPDATE service_registry SET last_health = NOW(), health_status = ? WHERE id = ?',
    [healthStatus, svc.id]
  );

  await auditLog(req, 'admin.service_health_checked', 'service', svc.id, { name: svc.name, healthStatus });

  res.json({
    success: true,
    data: { name: svc.name, healthStatus, latencyMs, error: errorMsg },
  });
}));

// ============================================================================
// CONFIGURATION — Read-only view + runtime updates
// ============================================================================

router.get('/config', asyncHandler(async (req, res) => {
  await auditLog(req, 'admin.config_viewed');

  res.json({
    success: true,
    data: {
      environment: config.nodeEnv,
      server: {
        port: config.port,
        frontendUrl: config.frontendUrl,
      },
      database: {
        host: config.database.host,
        name: config.database.name,
        // Never expose password
      },
      ai: {
        preferredProvider: config.ai.preferredProvider,
        openaiConfigured: !!config.ai.openaiKey,
        anthropicConfigured: !!config.ai.anthropicKey,
      },
      rateLimit: config.rateLimit,
      upload: {
        maxSize: config.upload.maxSize,
        allowedTypes: config.upload.allowedTypes,
      },
      smtp: {
        host: config.smtp.host || 'not configured',
        port: config.smtp.port,
        from: config.smtp.from,
      },
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      },
      swarm: {
        url: process.env.NOURISH_SWARM_URL || process.env.SWARM_API_URL || 'not configured',
      },
    },
  });
}));

// ============================================================================
// HELPERS
// ============================================================================

function maskKey(key) {
  if (!key) return null;
  if (key.length <= 8) return '****';
  return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}

module.exports = router;
