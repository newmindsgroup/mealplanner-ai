/**
 * Stripe Billing Migration — Adds subscription fields to users table
 * Idempotent: safe to run multiple times
 */
const { getPool } = require('../config/database');

async function runBillingMigrations() {
  const pool = getPool();

  const migrations = [
    {
      name: 'add_stripe_customer_id',
      sql: `ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255) DEFAULT NULL`,
      check: `SHOW COLUMNS FROM users LIKE 'stripe_customer_id'`,
    },
    {
      name: 'add_subscription_tier',
      sql: `ALTER TABLE users ADD COLUMN subscription_tier ENUM('free', 'pro', 'family', 'clinical') NOT NULL DEFAULT 'free'`,
      check: `SHOW COLUMNS FROM users LIKE 'subscription_tier'`,
    },
    {
      name: 'add_stripe_customer_id_index',
      sql: `CREATE INDEX idx_users_stripe_customer ON users (stripe_customer_id)`,
      check: `SHOW INDEX FROM users WHERE Key_name = 'idx_users_stripe_customer'`,
    },
  ];

  for (const migration of migrations) {
    try {
      const [rows] = await pool.execute(migration.check);
      if (rows.length > 0) {
        console.log(`[Billing Migration] ✅ ${migration.name} — already applied`);
        continue;
      }

      await pool.execute(migration.sql);
      console.log(`[Billing Migration] ✅ ${migration.name} — applied`);
    } catch (error) {
      // Likely already exists or table doesn't exist yet
      if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
        console.log(`[Billing Migration] ✅ ${migration.name} — already exists`);
      } else {
        console.warn(`[Billing Migration] ⚠️ ${migration.name} — skipped: ${error.message}`);
      }
    }
  }
}

module.exports = { runBillingMigrations };
