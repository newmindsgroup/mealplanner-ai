/**
 * Admin Migrations — Idempotent
 * 
 * Adds:
 *   1. `role` column to users table
 *   2. `api_usage_logs` table — per-request AI/API usage tracking
 *   3. `audit_logs` table — admin actions & system events
 *   4. `system_health_snapshots` table — periodic health data
 *   5. `service_registry` table — MCPs, CLIs, webhooks, external tools
 *   6. Seeds first super admin from SUPER_ADMIN_EMAIL env var
 */
const { query, queryOne } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function runAdminMigrations() {
  console.log('[Admin Migrations] Running...');

  // ── 1. Add role column to users ─────────────────────────────────────────────
  try {
    const [cols] = await query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`
    );
    // query() returns the result array directly (not [rows, fields])
    // Check if the result set is empty by looking at the array length
    const hasRole = Array.isArray(cols) ? true : false;
    // Actually, let's check properly:
    const roleCheck = await query(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`
    );
    if (roleCheck[0]?.cnt === 0) {
      await query(`ALTER TABLE users ADD COLUMN role ENUM('user','super_admin') DEFAULT 'user'`);
      console.log('[Admin Migrations] ✅ Added role column to users');
    } else {
      console.log('[Admin Migrations] ⏭️  role column already exists');
    }
  } catch (err) {
    // Column may already exist — safe to skip
    if (!err.message.includes('Duplicate column')) {
      console.warn('[Admin Migrations] role column check:', err.message);
    }
  }

  // ── 2. api_usage_logs ────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS api_usage_logs (
      id            VARCHAR(36) PRIMARY KEY,
      user_id       VARCHAR(36) NULL,
      endpoint      VARCHAR(255) NOT NULL,
      method        VARCHAR(10) NOT NULL,
      provider      VARCHAR(50) NULL,
      model         VARCHAR(100) NULL,
      tokens_input  INT DEFAULT 0,
      tokens_output INT DEFAULT 0,
      cost_usd      DECIMAL(10,6) DEFAULT 0,
      latency_ms    INT DEFAULT 0,
      status_code   INT DEFAULT 200,
      error_message TEXT NULL,
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_usage_user (user_id),
      INDEX idx_usage_endpoint (endpoint),
      INDEX idx_usage_provider (provider),
      INDEX idx_usage_created (created_at),
      INDEX idx_usage_cost (created_at, cost_usd)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('[Admin Migrations] ✅ api_usage_logs table ready');

  // ── 3. audit_logs ───────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id          VARCHAR(36) PRIMARY KEY,
      actor_id    VARCHAR(36) NULL,
      actor_email VARCHAR(255) NULL,
      action      VARCHAR(100) NOT NULL,
      target_type VARCHAR(50) NULL,
      target_id   VARCHAR(255) NULL,
      details     JSON NULL,
      ip_address  VARCHAR(45) NULL,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_actor (actor_id),
      INDEX idx_audit_action (action),
      INDEX idx_audit_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('[Admin Migrations] ✅ audit_logs table ready');

  // ── 4. system_health_snapshots ──────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS system_health_snapshots (
      id               VARCHAR(36) PRIMARY KEY,
      snapshot_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      database_size_mb DECIMAL(10,2) NULL,
      active_users_24h INT DEFAULT 0,
      total_users      INT DEFAULT 0,
      api_calls_24h    INT DEFAULT 0,
      tokens_used_24h  BIGINT DEFAULT 0,
      cost_24h         DECIMAL(10,4) DEFAULT 0,
      error_rate_pct   DECIMAL(5,2) DEFAULT 0,
      avg_latency_ms   INT DEFAULT 0,
      services_status  JSON NULL,
      INDEX idx_health_time (snapshot_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('[Admin Migrations] ✅ system_health_snapshots table ready');

  // ── 5. service_registry ─────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS service_registry (
      id            VARCHAR(36) PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      type          ENUM('mcp','api','cli','webhook','swarm') NOT NULL,
      url           VARCHAR(500) NULL,
      status        ENUM('active','inactive','error') DEFAULT 'active',
      config        JSON NULL,
      last_health   DATETIME NULL,
      health_status VARCHAR(20) DEFAULT 'unknown',
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_service_type (type),
      INDEX idx_service_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('[Admin Migrations] ✅ service_registry table ready');

  // ── 6. Seed super admin ─────────────────────────────────────────────────────
  if (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD) {
    try {
      const existing = await queryOne(
        'SELECT id, role FROM users WHERE email = ?',
        [process.env.SUPER_ADMIN_EMAIL.toLowerCase()]
      );

      if (existing) {
        // Promote existing user to super_admin if not already
        if (existing.role !== 'super_admin') {
          await query('UPDATE users SET role = ? WHERE id = ?', ['super_admin', existing.id]);
          console.log(`[Admin Migrations] ✅ Promoted ${process.env.SUPER_ADMIN_EMAIL} to super_admin`);
        } else {
          console.log(`[Admin Migrations] ⏭️  ${process.env.SUPER_ADMIN_EMAIL} is already super_admin`);
        }
      } else {
        // Create new super admin user
        const adminId = uuidv4();
        const passwordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 12);
        const now = new Date();

        await query(
          `INSERT INTO users (id, email, password_hash, name, email_verified, role, created_at, updated_at)
           VALUES (?, ?, ?, ?, TRUE, 'super_admin', ?, ?)`,
          [adminId, process.env.SUPER_ADMIN_EMAIL.toLowerCase(), passwordHash, 'Super Admin', now, now]
        );

        // Create profile
        await query(
          `INSERT INTO user_profiles (user_id, preferences, settings, onboarding_complete)
           VALUES (?, '{}', '{}', TRUE)`,
          [adminId]
        );

        // Create progress
        await query(
          `INSERT INTO user_progress (user_id, level, xp, xp_to_next_level)
           VALUES (?, 1, 0, 100)`,
          [adminId]
        );

        console.log(`[Admin Migrations] ✅ Super admin created: ${process.env.SUPER_ADMIN_EMAIL}`);
      }
    } catch (err) {
      console.warn('[Admin Migrations] Super admin seed skipped:', err.message);
    }
  }

  // ── 7. Seed default service registry entry for NourishAI Swarm ──────────────
  try {
    const swarmEntry = await queryOne(
      "SELECT id FROM service_registry WHERE name = 'NourishAI Swarm'"
    );
    if (!swarmEntry) {
      await query(
        `INSERT INTO service_registry (id, name, type, url, status, config)
         VALUES (?, 'NourishAI Swarm', 'swarm', ?, 'active', '{}')`,
        [uuidv4(), process.env.NOURISH_SWARM_URL || 'http://localhost:8000']
      );
      console.log('[Admin Migrations] ✅ NourishAI Swarm registered in service_registry');
    }
  } catch (err) {
    console.warn('[Admin Migrations] Swarm registry seed skipped:', err.message);
  }

  console.log('[Admin Migrations] ✅ All admin migrations complete');
}

module.exports = { runAdminMigrations };
