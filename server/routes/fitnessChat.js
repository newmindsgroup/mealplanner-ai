// Fitness Chat Routes — /api/fitness-chat/*
// AI Coach powered by the user's fitness profile + workout plan
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query, queryOne, execute } = require('../config/database');
const { generateResponse } = require('../services/aiService');

// All routes require authentication
router.use(authenticateToken);

// ── Ensure chat table exists ────────────────────────────────────────────────
const ensureChatTable = async () => {
  await execute(`
    CREATE TABLE IF NOT EXISTS fitness_chat_messages (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      role ENUM('user', 'assistant') NOT NULL,
      content TEXT NOT NULL,
      context_type VARCHAR(50) DEFAULT 'text',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_chat_user_date (user_id, created_at)
    )
  `);
};

// ── Build personalized system prompt ────────────────────────────────────────
function buildCoachPrompt(profile, plan) {
  const profileSection = profile
    ? `USER PROFILE:
- Fitness Level: ${profile.fitness_level || 'not specified'}
- Primary Goal: ${profile.primary_goal?.replace('_', ' ') || 'not specified'}
- Days per week: ${profile.days_per_week || 3}
- Session duration: ${profile.session_duration_min || 45} minutes
- Equipment: ${(typeof profile.equipment === 'string' ? JSON.parse(profile.equipment) : profile.equipment || []).join(', ') || 'not specified'}
- Injuries/limitations: ${(typeof profile.injuries === 'string' ? JSON.parse(profile.injuries) : profile.injuries || []).join(', ') || 'none'}`
    : 'USER PROFILE: Not completed yet. Give general advice.';

  const planSection = plan && plan.plan_data
    ? (() => {
        const pd = typeof plan.plan_data === 'string' ? JSON.parse(plan.plan_data) : plan.plan_data;
        const daysSummary = (pd.days || [])
          .map(d => `  - ${d.dayOfWeek}: ${d.name} (${d.type}, ${d.duration_min}min)`)
          .join('\n');
        return `CURRENT WORKOUT PLAN (${pd.planName || 'Active Plan'}):\n${daysSummary}`;
      })()
    : 'CURRENT WORKOUT PLAN: No plan generated yet.';

  return `You are an expert AI fitness coach integrated into a personalized meal planning and fitness app. You are knowledgeable, motivating, and highly specific.

${profileSection}

${planSection}

You can help with:
- Exercise form and technique  
- Workout modifications based on equipment/injuries
- Nutrition timing around workouts (pre/post workout meals)
- Motivation and mental approach to training
- Explaining exercise science concepts clearly
- Warm-up and cool-down routines
- Rest and recovery advice
- Progression strategies for any fitness level

Be concise (under 200 words unless asked for detail), conversational, and encouraging. Always personalize advice to the user's profile above. If the user mentions completing a workout, celebrate it and ask about intensity/energy levels.`;
}

// GET /api/fitness-chat/history
router.get('/history', asyncHandler(async (req, res) => {
  await ensureChatTable();
  const messages = await query(
    `SELECT id, role, content, created_at
     FROM fitness_chat_messages
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [req.userId]
  );
  res.json({ success: true, data: messages });
}));

// POST /api/fitness-chat/message
router.post('/message', asyncHandler(async (req, res) => {
  await ensureChatTable();

  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'message is required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ success: false, error: 'message must be under 2000 characters' });
  }

  // Fetch user context in parallel
  const [profile, plan, history] = await Promise.all([
    queryOne('SELECT * FROM fitness_profiles WHERE user_id = ?', [req.userId]).catch(() => null),
    queryOne('SELECT plan_data FROM workout_plans WHERE user_id = ? AND is_active = 1 ORDER BY week_start DESC LIMIT 1', [req.userId]).catch(() => null),
    query(
      `SELECT role, content FROM fitness_chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
      [req.userId]
    ).catch(() => []),
  ]);

  // Build conversation messages for AI (reverse to chronological order)
  const conversationHistory = history.reverse().map(m => ({
    role: m.role,
    content: m.content,
  }));
  // Append the new user message
  conversationHistory.push({ role: 'user', content: message });

  const systemPrompt = buildCoachPrompt(profile, plan);

  // Call AI
  let reply;
  try {
    reply = await generateResponse(conversationHistory, systemPrompt, 'anthropic');
  } catch (err) {
    return res.status(500).json({ success: false, error: 'AI response failed: ' + err.message });
  }

  // Save both messages to DB
  const userMsgId = uuidv4();
  const assistantMsgId = uuidv4();
  await Promise.all([
    execute(
      'INSERT INTO fitness_chat_messages (id, user_id, role, content) VALUES (?, ?, ?, ?)',
      [userMsgId, req.userId, 'user', message]
    ),
    execute(
      'INSERT INTO fitness_chat_messages (id, user_id, role, content) VALUES (?, ?, ?, ?)',
      [assistantMsgId, req.userId, 'assistant', reply]
    ),
  ]);

  res.json({ success: true, data: { reply, messageId: assistantMsgId } });
}));

// DELETE /api/fitness-chat/history
router.delete('/history', asyncHandler(async (req, res) => {
  await ensureChatTable();
  await execute('DELETE FROM fitness_chat_messages WHERE user_id = ?', [req.userId]);
  res.json({ success: true, message: 'Chat history cleared' });
}));

module.exports = router;
