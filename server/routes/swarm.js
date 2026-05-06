// Swarm Intelligence Bridge — Routes requests to NourishAI multi-agent system
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const SWARM_BASE = process.env.SWARM_API_URL || 'http://localhost:8080';
const SWARM_AGENCY = 'nourish-ai';

// ============================================================================
// HEALTH CHECK (no auth required)
// ============================================================================

router.get('/health', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const resp = await fetch(`${SWARM_BASE}/docs`, { signal: controller.signal });
    clearTimeout(timeout);

    res.json({
      success: true,
      status: resp.ok ? 'healthy' : 'degraded',
      swarmUrl: SWARM_BASE,
      agency: SWARM_AGENCY,
    });
  } catch (err) {
    res.json({
      success: false,
      status: 'offline',
      error: err.name === 'AbortError' ? 'Connection timeout' : err.message,
      swarmUrl: SWARM_BASE,
    });
  }
});

// ============================================================================
// CREATE THREAD — Start a new conversation with the swarm
// ============================================================================

router.post('/threads', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Enrich message with user context data if provided
    let enrichedMessage = message;
    if (context && Object.keys(context).length > 0) {
      enrichedMessage = `${message}\n\n[CONTEXT DATA]\n${JSON.stringify(context, null, 2)}`;
    }

    const resp = await fetch(`${SWARM_BASE}/api/v1/agencies/${SWARM_AGENCY}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: enrichedMessage }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Swarm API error (${resp.status}): ${errText}`);
    }

    const data = await resp.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[Swarm Bridge] Create thread error:', err.message);
    res.status(502).json({ success: false, error: 'Failed to reach NourishAI swarm', details: err.message });
  }
});

// ============================================================================
// SEND MESSAGE — Continue conversation in existing thread
// ============================================================================

router.post('/threads/:threadId/messages', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    let enrichedMessage = message;
    if (context && Object.keys(context).length > 0) {
      enrichedMessage = `${message}\n\n[CONTEXT DATA]\n${JSON.stringify(context, null, 2)}`;
    }

    const resp = await fetch(
      `${SWARM_BASE}/api/v1/agencies/${SWARM_AGENCY}/threads/${req.params.threadId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: enrichedMessage }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Swarm API error (${resp.status}): ${errText}`);
    }

    const data = await resp.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[Swarm Bridge] Send message error:', err.message);
    res.status(502).json({ success: false, error: 'Failed to reach NourishAI swarm', details: err.message });
  }
});

// ============================================================================
// GET FILES — Retrieve generated files (PDFs, charts, images)
// ============================================================================

router.get('/files/:filename', authenticateToken, async (req, res) => {
  try {
    const resp = await fetch(`${SWARM_BASE}/files/${encodeURIComponent(req.params.filename)}`);

    if (!resp.ok) {
      throw new Error(`File not found (${resp.status})`);
    }

    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const buffer = await resp.arrayBuffer();

    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `inline; filename="${req.params.filename}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[Swarm Bridge] Get file error:', err.message);
    res.status(404).json({ success: false, error: 'File not found', details: err.message });
  }
});

// ============================================================================
// GET THREAD HISTORY — List messages in a thread
// ============================================================================

router.get('/threads/:threadId', authenticateToken, async (req, res) => {
  try {
    const resp = await fetch(
      `${SWARM_BASE}/api/v1/agencies/${SWARM_AGENCY}/threads/${req.params.threadId}`
    );

    if (!resp.ok) {
      throw new Error(`Thread not found (${resp.status})`);
    }

    const data = await resp.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[Swarm Bridge] Get thread error:', err.message);
    res.status(502).json({ success: false, error: 'Failed to reach NourishAI swarm', details: err.message });
  }
});

module.exports = router;
