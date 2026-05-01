// Chat Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { query, queryOne } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getChatResponse } = require('../services/aiService');

/**
 * POST /api/chat/message
 * Send chat message and get AI response
 */
router.post('/message', authenticateToken, asyncHandler(async (req, res) => {
  const { message, sessionId, context } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message required',
    });
  }

  const currentSessionId = sessionId || uuidv4();

  // Get chat history for context
  let chatHistory = [];
  if (sessionId) {
    const session = await queryOne(
      'SELECT messages FROM chat_history WHERE session_id = ? AND user_id = ?',
      [sessionId, req.userId]
    );

    if (session) {
      chatHistory = JSON.parse(session.messages);
    }
  }

  // Get AI response
  const response = await getChatResponse(
    message,
    {
      chatHistory,
      ...context,
    },
    req.userId
  );

  // Update chat history
  const newMessages = [
    ...chatHistory,
    { role: 'user', content: message, timestamp: new Date().toISOString() },
    { role: 'assistant', content: response, timestamp: new Date().toISOString() },
  ];

  // Save or update session
  const existing = await queryOne(
    'SELECT id FROM chat_history WHERE session_id = ? AND user_id = ?',
    [currentSessionId, req.userId]
  );

  if (existing) {
    await query(
      'UPDATE chat_history SET messages = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(newMessages), existing.id]
    );
  } else {
    await query(
      'INSERT INTO chat_history (id, user_id, session_id, messages, context) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), req.userId, currentSessionId, JSON.stringify(newMessages), JSON.stringify(context || {})]
    );
  }

  res.json({
    success: true,
    data: {
      response,
      sessionId: currentSessionId,
    },
  });
}));

/**
 * GET /api/chat/history
 * Get chat sessions
 */
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const sessions = await query(
    'SELECT id, session_id, messages, created_at, updated_at FROM chat_history WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?',
    [req.userId, parseInt(limit)]
  );

  res.json({
    success: true,
    data: sessions.map(s => ({
      id: s.id,
      sessionId: s.session_id,
      messages: JSON.parse(s.messages),
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    })),
  });
}));

/**
 * GET /api/chat/sessions/:sessionId
 * Get specific chat session
 */
router.get('/sessions/:sessionId', authenticateToken, asyncHandler(async (req, res) => {
  const session = await queryOne(
    'SELECT * FROM chat_history WHERE session_id = ? AND user_id = ?',
    [req.params.sessionId, req.userId]
  );

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Chat session not found',
    });
  }

  res.json({
    success: true,
    data: {
      id: session.id,
      sessionId: session.session_id,
      messages: JSON.parse(session.messages),
      context: session.context ? JSON.parse(session.context) : {},
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    },
  });
}));

/**
 * DELETE /api/chat/sessions/:sessionId
 * Delete chat session
 */
router.delete('/sessions/:sessionId', authenticateToken, asyncHandler(async (req, res) => {
  const session = await queryOne(
    'SELECT id FROM chat_history WHERE session_id = ? AND user_id = ?',
    [req.params.sessionId, req.userId]
  );

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Chat session not found',
    });
  }

  await query('DELETE FROM chat_history WHERE id = ?', [session.id]);

  res.json({
    success: true,
    message: 'Chat session deleted successfully',
  });
}));

/**
 * DELETE /api/chat/clear
 * Clear all chat history
 */
router.delete('/clear', authenticateToken, asyncHandler(async (req, res) => {
  await query('DELETE FROM chat_history WHERE user_id = ?', [req.userId]);

  res.json({
    success: true,
    message: 'Chat history cleared successfully',
  });
}));

module.exports = router;

