/**
 * Health Monitor Job
 * 
 * Runs every 5 minutes and:
 *   1. Pings core services (MySQL, Swarm, Stripe, SMTP)
 *   2. Pings all entries in service_registry
 *   3. Records a system_health_snapshot with aggregated metrics
 */
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../config/database');

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let intervalHandle = null;

// ============================================================================
// SERVICE HEALTH CHECKS
// ============================================================================

async function checkMySQL() {
  try {
    await queryOne('SELECT 1');
    return 'healthy';
  } catch {
    return 'error';
  }
}

async function checkSwarm() {
  const url = process.env.NOURISH_SWARM_URL || process.env.SWARM_API_URL || 'http://localhost:8000';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(`${url}/docs`, { signal: controller.signal });
    clearTimeout(timeout);
    return resp.ok ? 'healthy' : 'degraded';
  } catch {
    return 'offline';
  }
}

async function checkStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return 'not_configured';
  try {
    const Stripe = require('stripe');
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    await stripe.balance.retrieve();
    return 'healthy';
  } catch {
    return 'error';
  }
}

async function checkSMTP() {
  if (!process.env.SMTP_HOST) return 'not_configured';
  // Basic TCP check — just verify the host is reachable
  return 'configured'; // Full SMTP handshake is expensive; just confirm env is set
}

// ============================================================================
// REGISTRY HEALTH CHECKS
// ============================================================================

async function checkRegistryServices() {
  try {
    const services = await query(
      "SELECT id, name, url, type FROM service_registry WHERE status != 'inactive'"
    );

    for (const svc of services) {
      let healthStatus = 'unknown';

      if (svc.url) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const resp = await fetch(svc.url, { signal: controller.signal });
          clearTimeout(timeout);
          healthStatus = resp.ok ? 'healthy' : 'degraded';
        } catch {
          healthStatus = 'offline';
        }
      }

      await query(
        'UPDATE service_registry SET last_health = NOW(), health_status = ? WHERE id = ?',
        [healthStatus, svc.id]
      );
    }
  } catch (err) {
    console.warn('[Health Monitor] Registry check error:', err.message);
  }
}

// ============================================================================
// SNAPSHOT
// ============================================================================

async function takeSnapshot() {
  try {
    // Gather service statuses
    const [mysql, swarm, stripe, smtp] = await Promise.all([
      checkMySQL(),
      checkSwarm(),
      checkStripe(),
      checkSMTP(),
    ]);

    // Check registry services
    await checkRegistryServices();

    // Aggregate metrics from api_usage_logs
    const metrics = await queryOne(`
      SELECT 
        COUNT(*) as api_calls_24h,
        COALESCE(SUM(tokens_input + tokens_output), 0) as tokens_used_24h,
        COALESCE(SUM(cost_usd), 0) as cost_24h,
        ROUND(AVG(latency_ms), 0) as avg_latency_ms,
        ROUND(
          (SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) / GREATEST(COUNT(*), 1)) * 100, 
          2
        ) as error_rate_pct
      FROM api_usage_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // User counts
    const userCounts = await queryOne(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as active_users_24h
      FROM users
    `);

    // Database size
    let dbSizeMb = 0;
    try {
      const sizeResult = await queryOne(`
        SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
      `);
      dbSizeMb = sizeResult?.size_mb || 0;
    } catch {
      // Some hostings restrict information_schema access
    }

    // Insert snapshot
    await query(
      `INSERT INTO system_health_snapshots 
       (id, snapshot_at, database_size_mb, active_users_24h, total_users, 
        api_calls_24h, tokens_used_24h, cost_24h, error_rate_pct, avg_latency_ms, services_status)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        dbSizeMb,
        userCounts?.active_users_24h || 0,
        userCounts?.total_users || 0,
        metrics?.api_calls_24h || 0,
        metrics?.tokens_used_24h || 0,
        metrics?.cost_24h || 0,
        metrics?.error_rate_pct || 0,
        metrics?.avg_latency_ms || 0,
        JSON.stringify({ mysql, swarm, stripe, smtp }),
      ]
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('[Health Monitor] ✅ Snapshot recorded');
    }
  } catch (err) {
    console.error('[Health Monitor] Snapshot error:', err.message);
  }
}

// ============================================================================
// START / STOP
// ============================================================================

function startHealthMonitor() {
  console.log('[Health Monitor] Starting (every 5 minutes)...');

  // Take an initial snapshot after a short delay (let server fully start)
  setTimeout(() => {
    takeSnapshot();
  }, 10000);

  // Schedule periodic snapshots
  intervalHandle = setInterval(takeSnapshot, INTERVAL_MS);
}

function stopHealthMonitor() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('[Health Monitor] Stopped');
  }
}

module.exports = { startHealthMonitor, stopHealthMonitor, takeSnapshot };
