/**
 * Family Challenges API — Phase 9
 * POST   /api/fitness/challenges            — create a challenge
 * GET    /api/fitness/challenges            — list all for this user's family
 * POST   /api/fitness/challenges/:id/log   — log progress for a member
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { execute, query, queryOne } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

router.use(authenticateToken);

async function ensureTables() {
  await execute(`
    CREATE TABLE IF NOT EXISTS fitness_challenges (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      goal_type VARCHAR(50) NOT NULL DEFAULT 'sessions',
      goal_value INT NOT NULL DEFAULT 10,
      goal_unit VARCHAR(50) DEFAULT 'sessions',
      duration_days INT NOT NULL DEFAULT 7,
      ends_at DATETIME NOT NULL,
      created_by_person_id VARCHAR(36),
      created_by_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ch_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `).catch(() => {});

  await execute(`
    CREATE TABLE IF NOT EXISTS fitness_challenge_progress (
      id VARCHAR(36) PRIMARY KEY,
      challenge_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      person_id VARCHAR(36),
      person_name VARCHAR(255),
      current_value INT NOT NULL DEFAULT 0,
      completed TINYINT(1) DEFAULT 0,
      last_logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_ch_person (challenge_id, user_id, person_id),
      INDEX idx_cp_challenge (challenge_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `).catch(() => {});
}

// GET /api/fitness/challenges
router.get('/', asyncHandler(async (req, res) => {
  await ensureTables();
  const challenges = await query(
    `SELECT * FROM fitness_challenges WHERE user_id = ? AND ends_at >= DATE_SUB(NOW(), INTERVAL 3 DAY) ORDER BY ends_at ASC`,
    [req.userId]
  );
  if (!challenges.length) return res.json({ success: true, data: [] });

  const ids = challenges.map(c => c.id);
  const progress = await query(
    `SELECT * FROM fitness_challenge_progress WHERE challenge_id IN (${ids.map(() => '?').join(',')})`,
    ids
  );

  const result = challenges.map(c => ({
    ...c,
    progress: progress.filter(p => p.challenge_id === c.id).map(p => ({
      person_id: p.person_id,
      person_name: p.person_name,
      current_value: p.current_value,
      completed: !!p.completed,
    })),
  }));

  res.json({ success: true, data: result });
}));

// POST /api/fitness/challenges
router.post('/', asyncHandler(async (req, res) => {
  await ensureTables();
  const { title, description, goal_type, goal_value, goal_unit, duration, person_id, person_name } = req.body;
  if (!title || !goal_value) return res.status(400).json({ success: false, error: 'title and goal_value are required' });

  const id = uuidv4();
  const days = parseInt(duration) || 7;
  const endsAt = new Date(Date.now() + days * 86400000);

  await execute(
    `INSERT INTO fitness_challenges (id, user_id, title, description, goal_type, goal_value, goal_unit, duration_days, ends_at, created_by_person_id, created_by_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.userId, title, description || null, goal_type || 'sessions', goal_value, goal_unit || 'sessions', days, endsAt, person_id || null, person_name || 'Unknown']
  );

  res.json({ success: true, data: { id } });
}));

// POST /api/fitness/challenges/:id/log
router.post('/:id/log', asyncHandler(async (req, res) => {
  await ensureTables();
  const { person_id, person_name, value } = req.body;
  const amount = parseInt(value) || 1;

  const challenge = await queryOne(
    'SELECT * FROM fitness_challenges WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );
  if (!challenge) return res.status(404).json({ success: false, error: 'Challenge not found' });

  // Upsert progress row
  await execute(
    `INSERT INTO fitness_challenge_progress (id, challenge_id, user_id, person_id, person_name, current_value, completed)
     VALUES (?, ?, ?, ?, ?, ?, 0)
     ON DUPLICATE KEY UPDATE
       current_value = current_value + VALUES(current_value),
       completed = IF(current_value + VALUES(current_value) >= ?, 1, 0)`,
    [uuidv4(), req.params.id, req.userId, person_id || null, person_name || 'Member', amount, challenge.goal_value]
  );

  res.json({ success: true });
}));

module.exports = router;
