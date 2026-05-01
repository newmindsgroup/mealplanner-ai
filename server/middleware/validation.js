// Request Validation Middleware using Joi
const Joi = require('joi');

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
}

// Common validation schemas
const schemas = {
  // User registration
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
      .messages({ 'any.only': 'Passwords must match' }),
    name: Joi.string().min(2).max(255).required(),
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().optional(),
  }),

  // Update user profile
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    email: Joi.string().email().optional(),
  }),

  // Update settings
  updateSettings: Joi.object({
    darkMode: Joi.boolean().optional(),
    voiceEnabled: Joi.boolean().optional(),
    voiceSpeed: Joi.number().min(0.5).max(2.0).optional(),
    language: Joi.string().optional(),
    smtp: Joi.object().optional(),
    notifications: Joi.object().optional(),
  }),

  // Create household
  createHousehold: Joi.object({
    name: Joi.string().min(2).max(255).required(),
  }),

  // Create person
  createPerson: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    bloodType: Joi.string().valid('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-').optional(),
    age: Joi.number().integer().min(0).max(150).optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    goals: Joi.array().items(Joi.string()).optional(),
    dietaryRestrictions: Joi.array().items(Joi.string()).optional(),
    healthConditions: Joi.array().items(Joi.string()).optional(),
    householdId: Joi.string().uuid().optional(),
  }),

  // Create meal plan
  createMealPlan: Joi.object({
    weekStart: Joi.date().required(),
    peopleIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    preferences: Joi.object().optional(),
    householdId: Joi.string().uuid().optional(),
  }),

  // Create pantry item
  createPantryItem: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    unit: Joi.string().required(),
    location: Joi.string().optional(),
    barcode: Joi.string().optional(),
    brand: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    expirationDate: Joi.date().optional(),
    lowStockThreshold: Joi.number().min(0).optional(),
    householdId: Joi.string().uuid().optional(),
  }),

  // Create lab report
  createLabReport: Joi.object({
    memberId: Joi.string().uuid().required(),
    testDate: Joi.date().required(),
    provider: Joi.string().optional(),
    reportType: Joi.string().optional(),
    results: Joi.array().items(Joi.object({
      testName: Joi.string().required(),
      value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      unit: Joi.string().optional(),
      referenceRange: Joi.string().optional(),
      status: Joi.string().valid('normal', 'low', 'high', 'critical').optional(),
    })).optional(),
  }),

  // UUID parameter
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

module.exports = {
  validate,
  schemas,
};

