/**
 * Phase 5: Multi-member fitness — adds person_id column to all fitness tables.
 * Safe, additive migration: existing data keeps user_id, person_id is nullable
 * for backward compatibility. New data from the UI will always include person_id.
 *
 * Run once at server startup via server/index.js:
 *   const { runFitnessMigrations } = require('./database/fitnessMigrations');
 *   await runFitnessMigrations();
 */
const { execute, query } = require('../config/database');

async function columnExists(table, column) {
  try {
    const rows = await query(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    return rows[0]?.cnt > 0;
  } catch {
    return false;
  }
}

async function runFitnessMigrations() {
  console.log('[FitnessMigrations] Running Phase 5 multi-member migrations...');

  const migrations = [
    // fitness_profiles: unique constraint was user_id, add person_id
    {
      table: 'fitness_profiles',
      column: 'person_id',
      sql: `ALTER TABLE fitness_profiles 
              ADD COLUMN person_id VARCHAR(36) NULL AFTER user_id,
              ADD INDEX idx_fp_person (person_id),
              MODIFY COLUMN user_id VARCHAR(36) NOT NULL`,
    },
    // Drop the UNIQUE on user_id so multiple people per user can have profiles
    // (we'll enforce unique per user+person_id in application layer)
    {
      table: 'fitness_profiles',
      column: '__unique_drop', // sentinel — skip column check
      sql: `ALTER TABLE fitness_profiles DROP INDEX user_id`,
      optional: true,
    },
    {
      table: 'fitness_profiles',
      column: '__unique_add',
      sql: `ALTER TABLE fitness_profiles 
              ADD UNIQUE KEY unique_user_person (user_id, person_id)`,
      optional: true,
    },
    {
      table: 'body_analyses',
      column: 'person_id',
      sql: `ALTER TABLE body_analyses 
              ADD COLUMN person_id VARCHAR(36) NULL AFTER user_id,
              ADD INDEX idx_ba_person (person_id)`,
    },
    {
      table: 'workout_plans',
      column: 'person_id',
      sql: `ALTER TABLE workout_plans 
              ADD COLUMN person_id VARCHAR(36) NULL AFTER user_id,
              ADD INDEX idx_wp_person (person_id)`,
    },
    {
      table: 'workout_sessions',
      column: 'person_id',
      sql: `ALTER TABLE workout_sessions 
              ADD COLUMN person_id VARCHAR(36) NULL AFTER user_id,
              ADD INDEX idx_ws_person (person_id)`,
    },
    {
      table: 'body_measurements',
      column: 'person_id',
      sql: `ALTER TABLE body_measurements 
              ADD COLUMN person_id VARCHAR(36) NULL AFTER user_id,
              ADD INDEX idx_bm_person (person_id)`,
    },
    {
      table: 'personal_records',
      column: 'person_id',
      sql: `ALTER TABLE personal_records 
              ADD COLUMN person_id VARCHAR(36) NULL AFTER user_id,
              ADD INDEX idx_pr_person (person_id)`,
    },
    {
      table: 'water_logs',
      column: 'person_id',
      sql: `ALTER TABLE water_logs 
              ADD COLUMN person_id VARCHAR(36) NULL AFTER user_id,
              ADD INDEX idx_wl_person (person_id)`,
    },
    {
      table: 'fitness_chat_messages',
      column: 'person_id',
      sql: `ALTER TABLE fitness_chat_messages 
              ADD COLUMN person_id VARCHAR(36) NULL AFTER user_id,
              ADD INDEX idx_fcm_person (person_id)`,
    },
  ];

  let applied = 0;
  let skipped = 0;
  let failed = 0;

  for (const m of migrations) {
    // For sentinel entries, run unconditionally (wrapped in try for optional)
    if (m.column.startsWith('__')) {
      if (m.optional) {
        try { await execute(m.sql); applied++; } catch { skipped++; }
      } else {
        try { await execute(m.sql); applied++; }
        catch (e) { console.warn(`[FitnessMigrations] ${m.table}: ${e.message}`); failed++; }
      }
      continue;
    }

    const exists = await columnExists(m.table, m.column);
    if (exists) {
      skipped++;
      continue;
    }

    try {
      await execute(m.sql);
      console.log(`[FitnessMigrations] ✓ Added ${m.column} to ${m.table}`);
      applied++;
    } catch (e) {
      if (m.optional) {
        skipped++;
      } else {
        console.warn(`[FitnessMigrations] ✗ ${m.table}.${m.column}: ${e.message}`);
        failed++;
      }
    }
  }

  console.log(`[FitnessMigrations] Done. applied=${applied} skipped=${skipped} failed=${failed}`);
}

module.exports = { runFitnessMigrations };
