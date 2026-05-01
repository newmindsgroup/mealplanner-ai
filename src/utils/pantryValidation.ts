import type { PantryItem, CustomField, QuantityUnit, StorageLocation, FoodCategory } from '../types';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate a pantry item
 */
export function validatePantryItem(item: Partial<PantryItem>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!item.name || item.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Item name is required',
      severity: 'error',
    });
  } else if (item.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Item name must be less than 100 characters',
      severity: 'error',
    });
  }

  if (!item.category) {
    errors.push({
      field: 'category',
      message: 'Category is required',
      severity: 'error',
    });
  }

  if (item.quantity === undefined || item.quantity === null) {
    errors.push({
      field: 'quantity',
      message: 'Quantity is required',
      severity: 'error',
    });
  } else if (item.quantity < 0) {
    errors.push({
      field: 'quantity',
      message: 'Quantity cannot be negative',
      severity: 'error',
    });
  } else if (item.quantity === 0) {
    warnings.push({
      field: 'quantity',
      message: 'Item quantity is zero - consider removing the item',
      severity: 'warning',
    });
  }

  if (!item.unit) {
    errors.push({
      field: 'unit',
      message: 'Unit is required',
      severity: 'error',
    });
  }

  if (!item.location) {
    errors.push({
      field: 'location',
      message: 'Storage location is required',
      severity: 'error',
    });
  }

  // Date validations
  if (item.purchaseDate && item.expirationDate) {
    const purchase = new Date(item.purchaseDate);
    const expiration = new Date(item.expirationDate);
    
    if (purchase > expiration) {
      errors.push({
        field: 'expirationDate',
        message: 'Expiration date cannot be before purchase date',
        severity: 'error',
      });
    }
  }

  if (item.purchaseDate && item.openedDate) {
    const purchase = new Date(item.purchaseDate);
    const opened = new Date(item.openedDate);
    
    if (purchase > opened) {
      errors.push({
        field: 'openedDate',
        message: 'Opened date cannot be before purchase date',
        severity: 'error',
      });
    }
  }

  if (item.openedDate && item.expirationDate) {
    const opened = new Date(item.openedDate);
    const expiration = new Date(item.expirationDate);
    
    if (opened > expiration) {
      warnings.push({
        field: 'expirationDate',
        message: 'Item was opened after its expiration date',
        severity: 'warning',
      });
    }
  }

  // Expiration warnings
  if (item.expirationDate) {
    const expiration = new Date(item.expirationDate);
    const now = new Date();
    
    if (expiration < now) {
      warnings.push({
        field: 'expirationDate',
        message: 'Item has already expired',
        severity: 'warning',
      });
    }
  }

  // Low stock threshold validation
  if (item.lowStockThreshold !== undefined && item.lowStockThreshold < 0) {
    errors.push({
      field: 'lowStockThreshold',
      message: 'Low stock threshold cannot be negative',
      severity: 'error',
    });
  }

  // Price validation
  if (item.price !== undefined && item.price < 0) {
    errors.push({
      field: 'price',
      message: 'Price cannot be negative',
      severity: 'error',
    });
  }

  // Brand validation
  if (item.brand && item.brand.length > 50) {
    warnings.push({
      field: 'brand',
      message: 'Brand name is unusually long',
      severity: 'warning',
    });
  }

  // Supplier validation
  if (item.supplier && item.supplier.length > 100) {
    warnings.push({
      field: 'supplier',
      message: 'Supplier name is unusually long',
      severity: 'warning',
    });
  }

  // Notes validation
  if (item.notes && item.notes.length > 500) {
    warnings.push({
      field: 'notes',
      message: 'Notes are very long - consider shortening',
      severity: 'warning',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a custom field
 */
export function validateCustomField(field: CustomField): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!field.key || field.key.trim().length === 0) {
    errors.push({
      field: 'key',
      message: 'Field key is required',
      severity: 'error',
    });
  }

  if (!field.type) {
    errors.push({
      field: 'type',
      message: 'Field type is required',
      severity: 'error',
    });
  }

  // Type-specific validation
  switch (field.type) {
    case 'number':
      if (typeof field.value !== 'number') {
        errors.push({
          field: 'value',
          message: 'Value must be a number',
          severity: 'error',
        });
      }
      break;
    
    case 'boolean':
      if (typeof field.value !== 'boolean') {
        errors.push({
          field: 'value',
          message: 'Value must be true or false',
          severity: 'error',
        });
      }
      break;
    
    case 'date':
      if (typeof field.value === 'string') {
        const date = new Date(field.value);
        if (isNaN(date.getTime())) {
          errors.push({
            field: 'value',
            message: 'Invalid date format',
            severity: 'error',
          });
        }
      } else {
        errors.push({
          field: 'value',
          message: 'Date must be a string in ISO format',
          severity: 'error',
        });
      }
      break;
    
    case 'select':
      if (!field.options || field.options.length === 0) {
        errors.push({
          field: 'options',
          message: 'Select field must have options',
          severity: 'error',
        });
      } else if (typeof field.value === 'string' && !field.options.includes(field.value)) {
        errors.push({
          field: 'value',
          message: 'Value must be one of the available options',
          severity: 'error',
        });
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate date range logic
 */
export function validateDateRange(
  purchaseDate?: string,
  openedDate?: string,
  expirationDate?: string
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!purchaseDate && !openedDate && !expirationDate) {
    return { valid: true, errors: [], warnings: [] };
  }

  const dates = {
    purchase: purchaseDate ? new Date(purchaseDate) : null,
    opened: openedDate ? new Date(openedDate) : null,
    expiration: expirationDate ? new Date(expirationDate) : null,
  };

  // Check for invalid dates
  for (const [key, date] of Object.entries(dates)) {
    if (date && isNaN(date.getTime())) {
      errors.push({
        field: `${key}Date`,
        message: `Invalid ${key} date format`,
        severity: 'error',
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Logical date checks
  if (dates.purchase && dates.expiration && dates.purchase > dates.expiration) {
    errors.push({
      field: 'expirationDate',
      message: 'Expiration date must be after purchase date',
      severity: 'error',
    });
  }

  if (dates.purchase && dates.opened && dates.purchase > dates.opened) {
    errors.push({
      field: 'openedDate',
      message: 'Opened date must be after purchase date',
      severity: 'error',
    });
  }

  if (dates.opened && dates.expiration && dates.opened > dates.expiration) {
    warnings.push({
      field: 'openedDate',
      message: 'Item was opened after expiration date',
      severity: 'warning',
    });
  }

  // Future date warnings
  const now = new Date();
  if (dates.purchase && dates.purchase > now) {
    warnings.push({
      field: 'purchaseDate',
      message: 'Purchase date is in the future',
      severity: 'warning',
    });
  }

  if (dates.opened && dates.opened > now) {
    warnings.push({
      field: 'openedDate',
      message: 'Opened date is in the future',
      severity: 'warning',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitize input value based on type
 */
export function sanitizeInput(value: any, type: 'text' | 'number' | 'date' | 'boolean'): any {
  switch (type) {
    case 'text':
      if (typeof value === 'string') {
        return value.trim().substring(0, 500); // Max length
      }
      return String(value).trim().substring(0, 500);
    
    case 'number':
      const num = parseFloat(value);
      return isNaN(num) ? 0 : Math.max(0, num);
    
    case 'date':
      if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? '' : value;
      }
      return '';
    
    case 'boolean':
      return Boolean(value);
    
    default:
      return value;
  }
}

/**
 * Validate quantity and unit combination
 */
export function validateQuantityUnit(quantity: number, unit: QuantityUnit): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (quantity < 0) {
    errors.push({
      field: 'quantity',
      message: 'Quantity cannot be negative',
      severity: 'error',
    });
  }

  if (quantity === 0) {
    warnings.push({
      field: 'quantity',
      message: 'Quantity is zero',
      severity: 'warning',
    });
  }

  // Unit-specific validations
  const countUnits: QuantityUnit[] = ['count', 'can', 'box', 'bag', 'bottle', 'jar', 'package'];
  if (countUnits.includes(unit) && !Number.isInteger(quantity)) {
    warnings.push({
      field: 'quantity',
      message: `${unit} quantity should typically be a whole number`,
      severity: 'warning',
    });
  }

  // Very large quantity warnings
  if (quantity > 1000 && !['g', 'ml'].includes(unit)) {
    warnings.push({
      field: 'quantity',
      message: 'Unusually large quantity - please verify',
      severity: 'warning',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate storage location for food category
 */
export function validateLocationForCategory(
  category: FoodCategory,
  location: StorageLocation
): ValidationResult {
  const warnings: ValidationError[] = [];

  const recommendedLocations: Record<FoodCategory, StorageLocation[]> = {
    proteins: ['refrigerator', 'freezer'],
    vegetables: ['refrigerator', 'pantry'],
    fruits: ['refrigerator', 'counter', 'pantry'],
    grains: ['pantry', 'cabinet'],
    dairy: ['refrigerator'],
    oils: ['pantry', 'cabinet'],
    'nuts-seeds': ['pantry', 'cabinet', 'refrigerator'],
    beverages: ['pantry', 'refrigerator', 'cabinet'],
    spices: ['pantry', 'cabinet'],
    sweeteners: ['pantry', 'cabinet'],
  };

  const recommended = recommendedLocations[category] || [];
  
  if (recommended.length > 0 && !recommended.includes(location)) {
    warnings.push({
      field: 'location',
      message: `${category} is typically stored in: ${recommended.join(', ')}`,
      severity: 'warning',
    });
  }

  return {
    valid: true,
    errors: [],
    warnings,
  };
}

/**
 * Validate allergens list
 */
export function validateAllergens(allergens?: string[]): ValidationResult {
  const warnings: ValidationError[] = [];

  if (!allergens || allergens.length === 0) {
    return { valid: true, errors: [], warnings: [] };
  }

  const commonAllergens = [
    'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts',
    'wheat', 'soybeans', 'sesame',
  ];

  allergens.forEach((allergen) => {
    const normalized = allergen.toLowerCase();
    if (!commonAllergens.some((common) => normalized.includes(common))) {
      warnings.push({
        field: 'allergens',
        message: `"${allergen}" is not a commonly recognized allergen`,
        severity: 'warning',
      });
    }
  });

  return {
    valid: true,
    errors: [],
    warnings,
  };
}

