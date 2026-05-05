/**
 * Fitness Cleanup Jobs
 * - Auto-deletes body analysis photos past their retention date
 * - Resets daily streaks for inactive users (non-breaking, best-effort)
 * 
 * Run via: node server/jobs/fitnessCleanup.js (standalone)
 * Or scheduled from server/index.js at startup
 */

const fs = require('fs');
const path = require('path');
const { query, execute } = require('../config/database');

/**
 * Delete expired body analysis photos.
 * Runs every hour. Keeps the DB record (without photo_path) for analytics.
 */
async function cleanupExpiredPhotos() {
  try {
    const expired = await query(
      `SELECT id, photo_path FROM body_analyses
       WHERE delete_at <= NOW() AND photo_path IS NOT NULL`,
      []
    );

    let deleted = 0;
    for (const row of expired) {
      if (row.photo_path && fs.existsSync(row.photo_path)) {
        try {
          fs.unlinkSync(row.photo_path);
          deleted++;
        } catch (err) {
          console.warn(`[FitnessCleanup] Could not delete file ${row.photo_path}:`, err.message);
        }
      }
      // Null out the path in DB even if file was already gone
      await execute(
        'UPDATE body_analyses SET photo_path = NULL WHERE id = ?',
        [row.id]
      );
    }

    if (deleted > 0) {
      console.log(`[FitnessCleanup] Deleted ${deleted} expired body analysis photo(s)`);
    }
  } catch (err) {
    console.error('[FitnessCleanup] Photo cleanup error:', err.message);
  }
}

/**
 * Clean up old water logs (older than 90 days) to prevent table bloat.
 */
async function cleanupOldWaterLogs() {
  try {
    const result = await execute(
      'DELETE FROM water_logs WHERE logged_at < DATE_SUB(NOW(), INTERVAL 90 DAY)',
      []
    ).catch(() => ({ affectedRows: 0 }));

    if (result?.affectedRows > 0) {
      console.log(`[FitnessCleanup] Pruned ${result.affectedRows} old water log entries`);
    }
  } catch (err) {
    console.error('[FitnessCleanup] Water log cleanup error:', err.message);
  }
}

/**
 * Schedule cleanup jobs using setInterval.
 * Call this once from server/index.js at startup.
 */
function startFitnessCleanupJobs() {
  // Run immediately on startup
  cleanupExpiredPhotos();

  // Then run every hour
  setInterval(cleanupExpiredPhotos, 60 * 60 * 1000);

  // Water log cleanup once per day (at startup + daily)
  cleanupOldWaterLogs();
  setInterval(cleanupOldWaterLogs, 24 * 60 * 60 * 1000);

  console.log('[FitnessCleanup] Cleanup jobs scheduled (photos: hourly, water logs: daily)');
}

module.exports = { startFitnessCleanupJobs, cleanupExpiredPhotos, cleanupOldWaterLogs };
