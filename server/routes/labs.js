// Lab Reports and Results Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const { query, queryOne, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const config = require('../config/config');

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(config.upload.uploadDir, 'lab-reports');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images allowed.'));
    }
  },
});

// ============================================================================
// LAB REPORTS
// ============================================================================

/**
 * GET /api/labs/reports
 * Get all lab reports for user
 */
router.get('/reports', authenticateToken, asyncHandler(async (req, res) => {
  const { memberId } = req.query;

  let sql = `
    SELECT lr.*, p.name as member_name
    FROM lab_reports lr
    JOIN people p ON lr.member_id = p.id
    WHERE lr.user_id = ?
  `;
  const params = [req.userId];

  if (memberId) {
    sql += ' AND lr.member_id = ?';
    params.push(memberId);
  }

  sql += ' ORDER BY lr.test_date DESC';

  const reports = await query(sql, params);

  res.json({
    success: true,
    data: reports.map(r => ({
      id: r.id,
      memberId: r.member_id,
      memberName: r.member_name,
      testDate: r.test_date,
      provider: r.provider,
      reportType: r.report_type,
      filePath: r.file_path,
      reportData: r.report_data ? JSON.parse(r.report_data) : null,
      notes: r.notes,
      createdAt: r.created_at,
    })),
  });
}));

/**
 * POST /api/labs/reports
 * Create new lab report
 */
router.post('/reports',
  authenticateToken,
  upload.single('file'),
  validate(schemas.createLabReport),
  asyncHandler(async (req, res) => {
    const { memberId, testDate, provider, reportType, results, notes } = req.body;

    // Verify member belongs to user
    const member = await queryOne(
      'SELECT id FROM people WHERE id = ? AND user_id = ?',
      [memberId, req.userId]
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found',
      });
    }

    const reportId = await transaction(async (conn) => {
      const id = uuidv4();
      const filePath = req.file ? `/uploads/lab-reports/${req.file.filename}` : null;

      // Insert report
      await conn.execute(
        `INSERT INTO lab_reports (id, user_id, member_id, test_date, provider, report_type, file_path, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, req.userId, memberId, testDate, provider || null, reportType || null, filePath, notes || null]
      );

      // Insert results if provided
      if (results && Array.isArray(results)) {
        for (const result of results) {
          const resultId = uuidv4();
          const numericValue = parseFloat(result.value);
          const status = result.status || 'normal';

          await conn.execute(
            `INSERT INTO lab_results (id, report_id, test_name, value, numeric_value, unit, reference_range, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              resultId,
              id,
              result.testName,
              result.value.toString(),
              isNaN(numericValue) ? null : numericValue,
              result.unit || null,
              result.referenceRange || null,
              status,
            ]
          );

          // Create alert for abnormal results
          if (['high', 'low', 'critical'].includes(status)) {
            const severity = status === 'critical' ? 'critical' : 'warning';
            const message = `${result.testName}: ${result.value} ${result.unit || ''} (${status.toUpperCase()})`;

            await conn.execute(
              `INSERT INTO lab_alerts (id, user_id, member_id, report_id, result_id, severity, message)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [uuidv4(), req.userId, memberId, id, resultId, severity, message]
            );
          }
        }
      }

      return id;
    });

    const report = await queryOne('SELECT * FROM lab_reports WHERE id = ?', [reportId]);

    res.status(201).json({
      success: true,
      message: 'Lab report created successfully',
      data: {
        id: report.id,
        memberId: report.member_id,
        testDate: report.test_date,
        provider: report.provider,
        filePath: report.file_path,
      },
    });
  })
);

/**
 * GET /api/labs/reports/:id
 * Get specific lab report with results
 */
router.get('/reports/:id', authenticateToken, asyncHandler(async (req, res) => {
  const report = await queryOne(
    `SELECT lr.*, p.name as member_name
     FROM lab_reports lr
     JOIN people p ON lr.member_id = p.id
     WHERE lr.id = ? AND lr.user_id = ?`,
    [req.params.id, req.userId]
  );

  if (!report) {
    return res.status(404).json({
      success: false,
      error: 'Lab report not found',
    });
  }

  // Get results
  const results = await query(
    'SELECT * FROM lab_results WHERE report_id = ?',
    [req.params.id]
  );

  res.json({
    success: true,
    data: {
      id: report.id,
      memberId: report.member_id,
      memberName: report.member_name,
      testDate: report.test_date,
      provider: report.provider,
      reportType: report.report_type,
      filePath: report.file_path,
      reportData: report.report_data ? JSON.parse(report.report_data) : null,
      notes: report.notes,
      results: results.map(r => ({
        id: r.id,
        testName: r.test_name,
        value: r.value,
        numericValue: r.numeric_value ? parseFloat(r.numeric_value) : null,
        unit: r.unit,
        referenceRange: r.reference_range,
        status: r.status,
        isPriority: Boolean(r.is_priority),
        notes: r.notes,
      })),
      createdAt: report.created_at,
    },
  });
}));

/**
 * PATCH /api/labs/reports/:id
 * Update lab report
 */
router.patch('/reports/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { provider, reportType, notes } = req.body;

  const report = await queryOne(
    'SELECT id FROM lab_reports WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!report) {
    return res.status(404).json({
      success: false,
      error: 'Lab report not found',
    });
  }

  const updates = {};
  if (provider !== undefined) updates.provider = provider;
  if (reportType !== undefined) updates.report_type = reportType;
  if (notes !== undefined) updates.notes = notes;

  if (Object.keys(updates).length > 0) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    await query(
      `UPDATE lab_reports SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...Object.values(updates), req.params.id]
    );
  }

  res.json({
    success: true,
    message: 'Lab report updated successfully',
  });
}));

/**
 * DELETE /api/labs/reports/:id
 * Delete lab report
 */
router.delete('/reports/:id', authenticateToken, asyncHandler(async (req, res) => {
  const report = await queryOne(
    'SELECT file_path FROM lab_reports WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!report) {
    return res.status(404).json({
      success: false,
      error: 'Lab report not found',
    });
  }

  // Delete file if exists
  if (report.file_path) {
    const filePath = path.join(__dirname, '..', '..', report.file_path);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  await query('DELETE FROM lab_reports WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Lab report deleted successfully',
  });
}));

// ============================================================================
// LAB ALERTS
// ============================================================================

/**
 * GET /api/labs/alerts
 * Get lab alerts
 */
router.get('/alerts', authenticateToken, asyncHandler(async (req, res) => {
  const { memberId, acknowledged } = req.query;

  let sql = 'SELECT * FROM lab_alerts WHERE user_id = ?';
  const params = [req.userId];

  if (memberId) {
    sql += ' AND member_id = ?';
    params.push(memberId);
  }

  if (acknowledged === 'false') {
    sql += ' AND acknowledged = FALSE';
  }

  sql += ' ORDER BY created_at DESC';

  const alerts = await query(sql, params);

  res.json({
    success: true,
    data: alerts.map(a => ({
      id: a.id,
      memberId: a.member_id,
      reportId: a.report_id,
      resultId: a.result_id,
      severity: a.severity,
      message: a.message,
      acknowledged: Boolean(a.acknowledged),
      acknowledgedAt: a.acknowledged_at,
      createdAt: a.created_at,
    })),
  });
}));

/**
 * POST /api/labs/alerts/:id/acknowledge
 * Acknowledge lab alert
 */
router.post('/alerts/:id/acknowledge', authenticateToken, asyncHandler(async (req, res) => {
  await query(
    'UPDATE lab_alerts SET acknowledged = TRUE, acknowledged_at = NOW() WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  res.json({
    success: true,
    message: 'Alert acknowledged',
  });
}));

// ============================================================================
// LAB INSIGHTS
// ============================================================================

/**
 * GET /api/labs/insights
 * Get lab insights for a member
 */
router.get('/insights', authenticateToken, asyncHandler(async (req, res) => {
  const { memberId } = req.query;

  if (!memberId) {
    return res.status(400).json({
      success: false,
      error: 'Member ID required',
    });
  }

  const insights = await query(
    'SELECT * FROM lab_insights WHERE user_id = ? AND member_id = ? AND dismissed = FALSE ORDER BY created_at DESC',
    [req.userId, memberId]
  );

  res.json({
    success: true,
    data: insights.map(i => ({
      id: i.id,
      memberId: i.member_id,
      insightType: i.insight_type,
      title: i.title,
      content: i.content,
      recommendations: i.recommendations ? JSON.parse(i.recommendations) : [],
      createdAt: i.created_at,
    })),
  });
}));

/**
 * POST /api/labs/insights/:id/dismiss
 * Dismiss an insight
 */
router.post('/insights/:id/dismiss', authenticateToken, asyncHandler(async (req, res) => {
  await query(
    'UPDATE lab_insights SET dismissed = TRUE WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  res.json({
    success: true,
    message: 'Insight dismissed',
  });
}));

/**
 * GET /api/labs/trends/:memberId/:testName
 * Get trends for a specific test
 */
router.get('/trends/:memberId/:testName', authenticateToken, asyncHandler(async (req, res) => {
  const { memberId, testName } = req.params;

  // Get all results for this test
  const results = await query(
    `SELECT lr.test_date, lre.value, lre.numeric_value, lre.unit, lre.status
     FROM lab_results lre
     JOIN lab_reports lr ON lre.report_id = lr.id
     WHERE lr.member_id = ? AND lr.user_id = ? AND lre.test_name = ?
     ORDER BY lr.test_date ASC`,
    [memberId, req.userId, testName]
  );

  if (results.length < 2) {
    return res.json({
      success: true,
      data: null,
      message: 'Insufficient data for trend analysis',
    });
  }

  const values = results.map(r => ({
    date: r.test_date,
    value: r.numeric_value ? parseFloat(r.numeric_value) : null,
    status: r.status,
  })).filter(v => v.value !== null);

  // Calculate trend
  const numericValues = values.map(v => v.value);
  const firstValue = numericValues[0];
  const lastValue = numericValues[numericValues.length - 1];
  const percentChange = ((lastValue - firstValue) / firstValue) * 100;

  const sum = numericValues.reduce((a, b) => a + b, 0);
  const avg = sum / numericValues.length;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  res.json({
    success: true,
    data: {
      testName,
      memberId,
      values,
      percentChange,
      averageValue: avg,
      minValue: min,
      maxValue: max,
      dataPoints: values.length,
    },
  });
}));

module.exports = router;

