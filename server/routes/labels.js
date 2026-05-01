// Label Analysis Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const { query, queryOne } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { analyzeFoodLabel } = require('../services/aiService');
const config = require('../config/config');

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(config.upload.uploadDir, 'labels');
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images allowed.'));
    }
  },
});

/**
 * POST /api/labels/analyze
 * Analyze food label image
 */
router.post('/analyze',
  authenticateToken,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file required',
      });
    }

    const { ocrText, bloodTypes } = req.body;

    if (!ocrText) {
      return res.status(400).json({
        success: false,
        error: 'OCR text required',
      });
    }

    // Parse blood types
    const bloodTypesArray = bloodTypes ? JSON.parse(bloodTypes) : [];

    // Analyze with AI
    const analysis = await analyzeFoodLabel(ocrText, bloodTypesArray, req.userId);

    // Save analysis
    const analysisId = uuidv4();
    const imagePath = `/uploads/labels/${req.file.filename}`;

    await query(
      `INSERT INTO label_analyses (
        id, user_id, image_path, ocr_text, analysis_data
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        analysisId,
        req.userId,
        imagePath,
        ocrText,
        JSON.stringify(analysis),
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Label analyzed successfully',
      data: {
        id: analysisId,
        imagePath,
        analysis,
      },
    });
  })
);

/**
 * GET /api/labels/history
 * Get label analysis history
 */
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const analyses = await query(
    'SELECT * FROM label_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [req.userId, parseInt(limit)]
  );

  res.json({
    success: true,
    data: analyses.map(a => ({
      id: a.id,
      imagePath: a.image_path,
      productName: a.product_name,
      brand: a.brand,
      analysisData: JSON.parse(a.analysis_data),
      createdAt: a.created_at,
    })),
  });
}));

/**
 * GET /api/labels/:id
 * Get specific label analysis
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const analysis = await queryOne(
    'SELECT * FROM label_analyses WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!analysis) {
    return res.status(404).json({
      success: false,
      error: 'Label analysis not found',
    });
  }

  res.json({
    success: true,
    data: {
      id: analysis.id,
      imagePath: analysis.image_path,
      productName: analysis.product_name,
      brand: analysis.brand,
      ocrText: analysis.ocr_text,
      analysisData: JSON.parse(analysis.analysis_data),
      createdAt: analysis.created_at,
    },
  });
}));

/**
 * DELETE /api/labels/:id
 * Delete label analysis
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const analysis = await queryOne(
    'SELECT image_path FROM label_analyses WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!analysis) {
    return res.status(404).json({
      success: false,
      error: 'Label analysis not found',
    });
  }

  // Delete image file
  if (analysis.image_path) {
    const filePath = path.join(__dirname, '..', '..', analysis.image_path);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  await query('DELETE FROM label_analyses WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Label analysis deleted successfully',
  });
}));

module.exports = router;

