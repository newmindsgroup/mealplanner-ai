// Knowledge Base Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const { query, queryOne } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const config = require('../config/config');

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(config.upload.uploadDir, 'knowledge-base');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter: (req, file, cb) => {
    const allowedTypes = config.upload.allowedTypes;
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

/**
 * GET /api/knowledge/files
 * Get all knowledge base files
 */
router.get('/files', authenticateToken, asyncHandler(async (req, res) => {
  const { householdId, fileType } = req.query;

  let sql = 'SELECT * FROM knowledge_base_files WHERE user_id = ?';
  const params = [req.userId];

  if (householdId) {
    sql += ' AND household_id = ?';
    params.push(householdId);
  }

  if (fileType) {
    sql += ' AND file_type = ?';
    params.push(fileType);
  }

  sql += ' ORDER BY created_at DESC';

  const files = await query(sql, params);

  res.json({
    success: true,
    data: files.map(f => ({
      id: f.id,
      userId: f.user_id,
      householdId: f.household_id,
      filename: f.filename,
      filePath: f.file_path,
      fileType: f.file_type,
      fileSize: f.file_size,
      metadata: f.metadata ? JSON.parse(f.metadata) : {},
      tags: f.tags ? JSON.parse(f.tags) : [],
      createdAt: f.created_at,
    })),
  });
}));

/**
 * POST /api/knowledge/upload
 * Upload knowledge base file
 */
router.post('/upload',
  authenticateToken,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'File required',
      });
    }

    const { householdId, tags, contentText } = req.body;

    const fileId = uuidv4();
    const filePath = `/uploads/knowledge-base/${req.file.filename}`;

    await query(
      `INSERT INTO knowledge_base_files (
        id, user_id, household_id, filename, file_path, file_type, file_size, content_text, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileId,
        req.userId,
        householdId || null,
        req.file.originalname,
        filePath,
        req.file.mimetype,
        req.file.size,
        contentText || null,
        tags ? JSON.stringify(JSON.parse(tags)) : JSON.stringify([]),
      ]
    );

    const file = await queryOne('SELECT * FROM knowledge_base_files WHERE id = ?', [fileId]);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: file.id,
        filename: file.filename,
        filePath: file.file_path,
        fileType: file.file_type,
        fileSize: file.file_size,
      },
    });
  })
);

/**
 * GET /api/knowledge/:id
 * Get specific knowledge base file
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const file = await queryOne(
    'SELECT * FROM knowledge_base_files WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found',
    });
  }

  res.json({
    success: true,
    data: {
      id: file.id,
      filename: file.filename,
      filePath: file.file_path,
      fileType: file.file_type,
      fileSize: file.file_size,
      contentText: file.content_text,
      metadata: file.metadata ? JSON.parse(file.metadata) : {},
      tags: file.tags ? JSON.parse(file.tags) : [],
      createdAt: file.created_at,
    },
  });
}));

/**
 * DELETE /api/knowledge/:id
 * Delete knowledge base file
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const file = await queryOne(
    'SELECT file_path FROM knowledge_base_files WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found',
    });
  }

  // Delete physical file
  const filePath = path.join(__dirname, '..', '..', file.file_path);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  await query('DELETE FROM knowledge_base_files WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'File deleted successfully',
  });
}));

/**
 * GET /api/knowledge/search
 * Search knowledge base
 */
router.get('/search', authenticateToken, asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Search query required',
    });
  }

  // Full-text search on content_text
  const files = await query(
    `SELECT * FROM knowledge_base_files
     WHERE user_id = ? AND (
       filename LIKE ? OR
       content_text LIKE ? OR
       MATCH(content_text) AGAINST(? IN NATURAL LANGUAGE MODE)
     )
     ORDER BY created_at DESC
     LIMIT 20`,
    [req.userId, `%${q}%`, `%${q}%`, q]
  );

  res.json({
    success: true,
    data: files.map(f => ({
      id: f.id,
      filename: f.filename,
      fileType: f.file_type,
      tags: f.tags ? JSON.parse(f.tags) : [],
      createdAt: f.created_at,
    })),
  });
}));

module.exports = router;

