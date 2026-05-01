// Pantry Management Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { query, queryOne } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================================================
// PANTRY ITEMS
// ============================================================================

/**
 * GET /api/pantry/items
 * Get all pantry items for current user
 */
router.get('/items', authenticateToken, asyncHandler(async (req, res) => {
  const { householdId, category, location, lowStock, expiring } = req.query;

  let sql = 'SELECT * FROM pantry_items WHERE user_id = ?';
  const params = [req.userId];

  if (householdId) {
    sql += ' AND household_id = ?';
    params.push(householdId);
  }

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (location) {
    sql += ' AND location = ?';
    params.push(location);
  }

  if (lowStock === 'true') {
    sql += ' AND is_low_stock = TRUE';
  }

  if (expiring === 'true') {
    const days = parseInt(req.query.days) || 7;
    sql += ' AND expiration_date IS NOT NULL AND expiration_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)';
    params.push(days);
  }

  sql += ' ORDER BY name ASC';

  const items = await query(sql, params);

  res.json({
    success: true,
    data: items.map(item => ({
      id: item.id,
      userId: item.user_id,
      householdId: item.household_id,
      name: item.name,
      category: item.category,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      location: item.location,
      barcode: item.barcode,
      brand: item.brand,
      price: item.price ? parseFloat(item.price) : null,
      purchaseDate: item.purchase_date,
      expirationDate: item.expiration_date,
      lowStockThreshold: parseFloat(item.low_stock_threshold),
      isLowStock: Boolean(item.is_low_stock),
      customFields: item.custom_fields ? JSON.parse(item.custom_fields) : {},
      usageHistory: item.usage_history ? JSON.parse(item.usage_history) : [],
      nutritionalInfo: item.nutritional_info ? JSON.parse(item.nutritional_info) : null,
      allergens: item.allergens ? JSON.parse(item.allergens) : [],
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
  });
}));

/**
 * POST /api/pantry/items
 * Add new pantry item
 */
router.post('/items', authenticateToken, validate(schemas.createPantryItem), asyncHandler(async (req, res) => {
  const {
    name,
    category,
    quantity,
    unit,
    location,
    barcode,
    brand,
    price,
    expirationDate,
    lowStockThreshold,
    householdId,
    customFields,
    nutritionalInfo,
    allergens,
    ingredients,
    notes,
  } = req.body;

  const itemId = uuidv4();
  const threshold = lowStockThreshold || 1;
  const isLowStock = quantity <= threshold;

  await query(
    `INSERT INTO pantry_items (
      id, user_id, household_id, name, category, quantity, unit,
      location, barcode, brand, price, expiration_date,
      low_stock_threshold, is_low_stock, custom_fields,
      nutritional_info, allergens, ingredients, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      itemId,
      req.userId,
      householdId || null,
      name,
      category,
      quantity,
      unit,
      location || null,
      barcode || null,
      brand || null,
      price || null,
      expirationDate || null,
      threshold,
      isLowStock,
      JSON.stringify(customFields || {}),
      JSON.stringify(nutritionalInfo || null),
      JSON.stringify(allergens || []),
      JSON.stringify(ingredients || []),
      notes || null,
    ]
  );

  // Create low stock alert if needed
  if (isLowStock) {
    await query(
      'INSERT INTO low_stock_alerts (id, item_id, user_id, threshold, current_quantity) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), itemId, req.userId, threshold, quantity]
    );
  }

  // Create expiration alert if needed
  if (expirationDate) {
    const expDate = new Date(expirationDate);
    const now = new Date();
    const daysUntil = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntil >= 0 && daysUntil <= 7) {
      await query(
        'INSERT INTO expiration_alerts (id, item_id, user_id, expiration_date, days_until_expiry) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), itemId, req.userId, expirationDate, daysUntil]
      );
    }
  }

  const item = await queryOne('SELECT * FROM pantry_items WHERE id = ?', [itemId]);

  res.status(201).json({
    success: true,
    message: 'Pantry item added successfully',
    data: {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
    },
  });
}));

/**
 * GET /api/pantry/items/:id
 * Get specific pantry item
 */
router.get('/items/:id', authenticateToken, asyncHandler(async (req, res) => {
  const item = await queryOne(
    'SELECT * FROM pantry_items WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Pantry item not found',
    });
  }

  res.json({
    success: true,
    data: {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      location: item.location,
      barcode: item.barcode,
      brand: item.brand,
      price: item.price ? parseFloat(item.price) : null,
      expirationDate: item.expiration_date,
      lowStockThreshold: parseFloat(item.low_stock_threshold),
      isLowStock: Boolean(item.is_low_stock),
      customFields: item.custom_fields ? JSON.parse(item.custom_fields) : {},
      usageHistory: item.usage_history ? JSON.parse(item.usage_history) : [],
      nutritionalInfo: item.nutritional_info ? JSON.parse(item.nutritional_info) : null,
      allergens: item.allergens ? JSON.parse(item.allergens) : [],
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    },
  });
}));

/**
 * PATCH /api/pantry/items/:id
 * Update pantry item
 */
router.patch('/items/:id', authenticateToken, asyncHandler(async (req, res) => {
  const item = await queryOne(
    'SELECT * FROM pantry_items WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Pantry item not found',
    });
  }

  const updates = {};
  const allowedFields = [
    'name', 'category', 'quantity', 'unit', 'location', 'barcode',
    'brand', 'price', 'expiration_date', 'low_stock_threshold',
    'custom_fields', 'nutritional_info', 'allergens', 'ingredients', 'notes'
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (['custom_fields', 'nutritional_info', 'allergens', 'ingredients'].includes(dbField)) {
        updates[dbField] = JSON.stringify(req.body[field]);
      } else {
        updates[dbField] = req.body[field];
      }
    }
  }

  // Update low stock status
  const newQuantity = updates.quantity || item.quantity;
  const threshold = updates.low_stock_threshold || item.low_stock_threshold;
  updates.is_low_stock = newQuantity <= threshold;

  if (Object.keys(updates).length > 0) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    await query(
      `UPDATE pantry_items SET ${setClause} WHERE id = ?`,
      [...Object.values(updates), req.params.id]
    );
  }

  const updated = await queryOne('SELECT * FROM pantry_items WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Pantry item updated successfully',
    data: {
      id: updated.id,
      name: updated.name,
      quantity: parseFloat(updated.quantity),
      isLowStock: Boolean(updated.is_low_stock),
    },
  });
}));

/**
 * DELETE /api/pantry/items/:id
 * Delete pantry item
 */
router.delete('/items/:id', authenticateToken, asyncHandler(async (req, res) => {
  const item = await queryOne(
    'SELECT id FROM pantry_items WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Pantry item not found',
    });
  }

  await query('DELETE FROM pantry_items WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Pantry item deleted successfully',
  });
}));

// ============================================================================
// PANTRY SETTINGS
// ============================================================================

/**
 * GET /api/pantry/settings
 * Get pantry settings
 */
router.get('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const settings = await queryOne(
    'SELECT settings FROM pantry_settings WHERE user_id = ?',
    [req.userId]
  );

  res.json({
    success: true,
    data: settings ? JSON.parse(settings.settings) : {},
  });
}));

/**
 * PATCH /api/pantry/settings
 * Update pantry settings
 */
router.patch('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const newSettings = req.body;

  const existing = await queryOne(
    'SELECT settings FROM pantry_settings WHERE user_id = ?',
    [req.userId]
  );

  const current = existing ? JSON.parse(existing.settings) : {};
  const updated = { ...current, ...newSettings };

  if (existing) {
    await query(
      'UPDATE pantry_settings SET settings = ? WHERE user_id = ?',
      [JSON.stringify(updated), req.userId]
    );
  } else {
    await query(
      'INSERT INTO pantry_settings (user_id, settings) VALUES (?, ?)',
      [req.userId, JSON.stringify(updated)]
    );
  }

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: updated,
  });
}));

// ============================================================================
// ALERTS
// ============================================================================

/**
 * GET /api/pantry/alerts
 * Get all pantry alerts
 */
router.get('/alerts', authenticateToken, asyncHandler(async (req, res) => {
  const { acknowledged } = req.query;

  // Low stock alerts
  let lowStockSql = 'SELECT * FROM low_stock_alerts WHERE user_id = ?';
  const lowStockParams = [req.userId];

  if (acknowledged === 'false') {
    lowStockSql += ' AND acknowledged = FALSE';
  }

  const lowStockAlerts = await query(lowStockSql, lowStockParams);

  // Expiration alerts
  let expirationSql = 'SELECT * FROM expiration_alerts WHERE user_id = ?';
  const expirationParams = [req.userId];

  if (acknowledged === 'false') {
    expirationSql += ' AND acknowledged = FALSE';
  }

  const expirationAlerts = await query(expirationSql, expirationParams);

  res.json({
    success: true,
    data: {
      lowStock: lowStockAlerts.map(a => ({
        id: a.id,
        itemId: a.item_id,
        threshold: parseFloat(a.threshold),
        currentQuantity: parseFloat(a.current_quantity),
        acknowledged: Boolean(a.acknowledged),
        acknowledgedAt: a.acknowledged_at,
        createdAt: a.created_at,
      })),
      expiration: expirationAlerts.map(a => ({
        id: a.id,
        itemId: a.item_id,
        expirationDate: a.expiration_date,
        daysUntilExpiry: a.days_until_expiry,
        acknowledged: Boolean(a.acknowledged),
        acknowledgedAt: a.acknowledged_at,
        createdAt: a.created_at,
      })),
    },
  });
}));

/**
 * POST /api/pantry/alerts/:id/acknowledge
 * Acknowledge an alert
 */
router.post('/alerts/:id/acknowledge', authenticateToken, asyncHandler(async (req, res) => {
  const { type } = req.body; // 'lowStock' or 'expiration'

  if (!type || !['lowStock', 'expiration'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Valid alert type required',
    });
  }

  const table = type === 'lowStock' ? 'low_stock_alerts' : 'expiration_alerts';

  await query(
    `UPDATE ${table} SET acknowledged = TRUE, acknowledged_at = NOW() WHERE id = ? AND user_id = ?`,
    [req.params.id, req.userId]
  );

  res.json({
    success: true,
    message: 'Alert acknowledged',
  });
}));

/**
 * GET /api/pantry/stats
 * Get pantry statistics
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const items = await query(
    'SELECT * FROM pantry_items WHERE user_id = ?',
    [req.userId]
  );

  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const lowStockCount = items.filter(item => item.is_low_stock).length;

  const now = new Date();
  const expiringItems = items.filter(item => {
    if (!item.expiration_date) return false;
    const expDate = new Date(item.expiration_date);
    const daysUntil = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  });

  const expiredItems = items.filter(item => {
    if (!item.expiration_date) return false;
    return new Date(item.expiration_date) < now;
  });

  res.json({
    success: true,
    data: {
      totalItems,
      totalValue,
      lowStockCount,
      expiringCount: expiringItems.length,
      expiredCount: expiredItems.length,
    },
  });
}));

module.exports = router;

