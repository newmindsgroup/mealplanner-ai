import type {
  PantryItem,
  CSVImportResult,
  CSVValidationError,
  QuantityUnit,
  StorageLocation,
  FoodCategory,
  CustomField,
} from '../types';
import { validatePantryItem, validateDateRange, validateQuantityUnit } from '../utils/pantryValidation';

// CSV column headers
const CSV_HEADERS = [
  'name',
  'category',
  'brand',
  'quantity',
  'unit',
  'location',
  'purchaseDate',
  'expirationDate',
  'openedDate',
  'supplier',
  'barcode',
  'price',
  'lowStockThreshold',
  'allergens',
  'ingredients',
  'servingSize',
  'calories',
  'protein',
  'carbs',
  'fats',
  'fiber',
  'sodium',
  'sugar',
  'notes',
  'tags',
  'customFields',
];

interface ParsedRow {
  row: number;
  data: Record<string, string>;
  errors: CSVValidationError[];
}

/**
 * Generate a CSV template with all fields and example data
 */
export function generateCSVTemplate(): string {
  const headers = CSV_HEADERS.join(',');
  
  const exampleRow = [
    'Chicken Breast', // name
    'proteins', // category
    'Perdue', // brand
    '2', // quantity
    'lb', // unit
    'freezer', // location
    '2024-01-15', // purchaseDate
    '2024-02-15', // expirationDate
    '', // openedDate
    'Whole Foods', // supplier
    '1234567890123', // barcode
    '12.99', // price
    '0.5', // lowStockThreshold
    'none', // allergens
    'Chicken', // ingredients
    '4 oz', // servingSize
    '165', // calories
    '31', // protein
    '0', // carbs
    '3.6', // fats
    '0', // fiber
    '74', // sodium
    '0', // sugar
    'Fresh organic chicken', // notes
    'organic,fresh', // tags
    '{"supplierCode":"WF123"}', // customFields (JSON format)
  ].map(escapeCSVField).join(',');

  return `${headers}\n${exampleRow}`;
}

/**
 * Parse CSV file content
 */
export async function parseCSVFile(file: File): Promise<ParsedRow[]> {
  const text = await file.text();
  return parseCSVText(text);
}

/**
 * Parse CSV text content
 */
export function parseCSVText(text: string): ParsedRow[] {
  const lines = text.trim().split('\n');
  
  if (lines.length < 2) {
    return [];
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Parse rows
  const parsedRows: ParsedRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const rowData: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      rowData[header] = values[index] || '';
    });
    
    parsedRows.push({
      row: i + 1,
      data: rowData,
      errors: [],
    });
  }
  
  return parsedRows;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Validate a parsed CSV row
 */
export function validatePantryRow(row: ParsedRow): CSVValidationError[] {
  const errors: CSVValidationError[] = [];
  const { data, row: rowNumber } = row;

  // Required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      row: rowNumber,
      field: 'name',
      value: data.name || '',
      error: 'Name is required',
      severity: 'error',
    });
  }

  // Category validation
  const validCategories: FoodCategory[] = [
    'proteins', 'vegetables', 'fruits', 'grains', 'dairy',
    'oils', 'nuts-seeds', 'beverages', 'spices', 'sweeteners'
  ];
  
  if (!data.category) {
    errors.push({
      row: rowNumber,
      field: 'category',
      value: '',
      error: 'Category is required',
      severity: 'error',
    });
  } else if (!validCategories.includes(data.category as FoodCategory)) {
    errors.push({
      row: rowNumber,
      field: 'category',
      value: data.category,
      error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      severity: 'error',
    });
  }

  // Quantity validation
  const quantity = parseFloat(data.quantity);
  if (isNaN(quantity)) {
    errors.push({
      row: rowNumber,
      field: 'quantity',
      value: data.quantity,
      error: 'Quantity must be a number',
      severity: 'error',
    });
  } else if (quantity < 0) {
    errors.push({
      row: rowNumber,
      field: 'quantity',
      value: data.quantity,
      error: 'Quantity cannot be negative',
      severity: 'error',
    });
  } else if (quantity === 0) {
    errors.push({
      row: rowNumber,
      field: 'quantity',
      value: data.quantity,
      error: 'Quantity is zero',
      severity: 'warning',
    });
  }

  // Unit validation
  const validUnits: QuantityUnit[] = [
    'count', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'cup', 'tbsp', 'tsp',
    'can', 'box', 'bag', 'bottle', 'jar', 'package'
  ];
  
  if (!data.unit) {
    errors.push({
      row: rowNumber,
      field: 'unit',
      value: '',
      error: 'Unit is required',
      severity: 'error',
    });
  } else if (!validUnits.includes(data.unit as QuantityUnit)) {
    errors.push({
      row: rowNumber,
      field: 'unit',
      value: data.unit,
      error: `Invalid unit. Must be one of: ${validUnits.join(', ')}`,
      severity: 'error',
    });
  }

  // Location validation
  const validLocations: StorageLocation[] = [
    'pantry', 'refrigerator', 'freezer', 'cabinet', 'counter', 'other'
  ];
  
  if (!data.location) {
    errors.push({
      row: rowNumber,
      field: 'location',
      value: '',
      error: 'Location is required',
      severity: 'error',
    });
  } else if (!validLocations.includes(data.location as StorageLocation)) {
    errors.push({
      row: rowNumber,
      field: 'location',
      value: data.location,
      error: `Invalid location. Must be one of: ${validLocations.join(', ')}`,
      severity: 'error',
    });
  }

  // Date validations
  if (data.purchaseDate && !isValidDate(data.purchaseDate)) {
    errors.push({
      row: rowNumber,
      field: 'purchaseDate',
      value: data.purchaseDate,
      error: 'Invalid date format. Use YYYY-MM-DD',
      severity: 'error',
    });
  }

  if (data.expirationDate && !isValidDate(data.expirationDate)) {
    errors.push({
      row: rowNumber,
      field: 'expirationDate',
      value: data.expirationDate,
      error: 'Invalid date format. Use YYYY-MM-DD',
      severity: 'error',
    });
  }

  if (data.openedDate && !isValidDate(data.openedDate)) {
    errors.push({
      row: rowNumber,
      field: 'openedDate',
      value: data.openedDate,
      error: 'Invalid date format. Use YYYY-MM-DD',
      severity: 'error',
    });
  }

  // Date range validation
  const dateValidation = validateDateRange(
    data.purchaseDate || undefined,
    data.openedDate || undefined,
    data.expirationDate || undefined
  );

  dateValidation.errors.forEach((err) => {
    errors.push({
      row: rowNumber,
      field: err.field,
      value: data[err.field] || '',
      error: err.message,
      severity: 'error',
    });
  });

  dateValidation.warnings.forEach((warn) => {
    errors.push({
      row: rowNumber,
      field: warn.field,
      value: data[warn.field] || '',
      error: warn.message,
      severity: 'warning',
    });
  });

  // Price validation
  if (data.price && isNaN(parseFloat(data.price))) {
    errors.push({
      row: rowNumber,
      field: 'price',
      value: data.price,
      error: 'Price must be a number',
      severity: 'error',
    });
  } else if (data.price && parseFloat(data.price) < 0) {
    errors.push({
      row: rowNumber,
      field: 'price',
      value: data.price,
      error: 'Price cannot be negative',
      severity: 'error',
    });
  }

  // Low stock threshold validation
  if (data.lowStockThreshold && isNaN(parseFloat(data.lowStockThreshold))) {
    errors.push({
      row: rowNumber,
      field: 'lowStockThreshold',
      value: data.lowStockThreshold,
      error: 'Low stock threshold must be a number',
      severity: 'error',
    });
  }

  // Nutritional info validation
  const nutritionalFields = ['calories', 'protein', 'carbs', 'fats', 'fiber', 'sodium', 'sugar'];
  nutritionalFields.forEach((field) => {
    if (data[field] && isNaN(parseFloat(data[field]))) {
      errors.push({
        row: rowNumber,
        field,
        value: data[field],
        error: `${field} must be a number`,
        severity: 'warning',
      });
    }
  });

  // Custom fields validation (must be valid JSON)
  if (data.customFields && data.customFields.trim().length > 0) {
    try {
      JSON.parse(data.customFields);
    } catch (e) {
      errors.push({
        row: rowNumber,
        field: 'customFields',
        value: data.customFields,
        error: 'Custom fields must be valid JSON',
        severity: 'error',
      });
    }
  }

  return errors;
}

/**
 * Convert parsed CSV row to PantryItem
 */
function rowToPantryItem(row: ParsedRow): PantryItem {
  const { data } = row;
  const now = new Date().toISOString();

  // Parse custom fields
  let customFields: CustomField[] | undefined;
  if (data.customFields && data.customFields.trim().length > 0) {
    try {
      const parsed = JSON.parse(data.customFields);
      customFields = Object.entries(parsed).map(([key, value]) => ({
        id: crypto.randomUUID(),
        key,
        value: value as string | number | boolean,
        type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'text',
      }));
    } catch (e) {
      // Ignore invalid JSON
    }
  }

  // Parse allergens and ingredients (comma-separated)
  const allergens = data.allergens && data.allergens.trim() !== 'none' && data.allergens.trim().length > 0
    ? data.allergens.split(',').map((a) => a.trim())
    : undefined;

  const ingredients = data.ingredients && data.ingredients.trim().length > 0
    ? data.ingredients.split(',').map((i) => i.trim())
    : undefined;

  // Parse tags (comma-separated)
  const tags = data.tags && data.tags.trim().length > 0
    ? data.tags.split(',').map((t) => t.trim())
    : undefined;

  const item: PantryItem = {
    id: crypto.randomUUID(),
    name: data.name,
    category: data.category as FoodCategory,
    quantity: parseFloat(data.quantity),
    unit: data.unit as QuantityUnit,
    location: data.location as StorageLocation,
    brand: data.brand || undefined,
    barcode: data.barcode || undefined,
    purchaseDate: data.purchaseDate || undefined,
    expirationDate: data.expirationDate || undefined,
    openedDate: data.openedDate || undefined,
    supplier: data.supplier || undefined,
    price: data.price ? parseFloat(data.price) : undefined,
    lowStockThreshold: data.lowStockThreshold ? parseFloat(data.lowStockThreshold) : 1,
    allergens,
    ingredients,
    notes: data.notes || undefined,
    tags,
    customFields,
    addedAt: now,
    updatedAt: now,
  };

  // Add nutritional info if any fields are present
  const hasNutritionalData = ['servingSize', 'calories', 'protein', 'carbs', 'fats', 'fiber', 'sodium', 'sugar']
    .some((field) => data[field] && data[field].trim().length > 0);

  if (hasNutritionalData) {
    item.nutritionalInfo = {
      servingSize: data.servingSize || undefined,
      calories: data.calories ? parseFloat(data.calories) : undefined,
      protein: data.protein ? parseFloat(data.protein) : undefined,
      carbs: data.carbs ? parseFloat(data.carbs) : undefined,
      fats: data.fats ? parseFloat(data.fats) : undefined,
      fiber: data.fiber ? parseFloat(data.fiber) : undefined,
      sodium: data.sodium ? parseFloat(data.sodium) : undefined,
      sugar: data.sugar ? parseFloat(data.sugar) : undefined,
    };
  }

  return item;
}

/**
 * Import pantry items from parsed CSV data
 */
export async function importPantryItems(parsedRows: ParsedRow[]): Promise<CSVImportResult> {
  const errors: CSVValidationError[] = [];
  const importedItems: PantryItem[] = [];
  const skippedRows: number[] = [];

  // Validate all rows first
  parsedRows.forEach((row) => {
    const rowErrors = validatePantryRow(row);
    errors.push(...rowErrors);
    row.errors = rowErrors;
  });

  // Import valid rows
  parsedRows.forEach((row) => {
    const hasErrors = row.errors.some((err) => err.severity === 'error');
    
    if (hasErrors) {
      skippedRows.push(row.row);
    } else {
      try {
        const item = rowToPantryItem(row);
        importedItems.push(item);
      } catch (err) {
        errors.push({
          row: row.row,
          field: 'general',
          value: '',
          error: `Failed to import row: ${err instanceof Error ? err.message : 'Unknown error'}`,
          severity: 'error',
        });
        skippedRows.push(row.row);
      }
    }
  });

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  return {
    success: errorCount === 0,
    totalRows: parsedRows.length,
    successCount: importedItems.length,
    errorCount,
    warningCount,
    errors,
    importedItems,
    skippedRows,
  };
}

/**
 * Export pantry items to CSV
 */
export function exportPantryToCSV(items: PantryItem[]): string {
  const headers = CSV_HEADERS.join(',');
  
  const rows = items.map((item) => {
    // Convert custom fields to JSON
    const customFieldsJson = item.customFields && item.customFields.length > 0
      ? JSON.stringify(
          item.customFields.reduce((acc, field) => {
            acc[field.key] = field.value;
            return acc;
          }, {} as Record<string, any>)
        )
      : '';

    const row = [
      item.name,
      item.category,
      item.brand || '',
      item.quantity.toString(),
      item.unit,
      item.location,
      item.purchaseDate || '',
      item.expirationDate || '',
      item.openedDate || '',
      item.supplier || '',
      item.barcode || '',
      item.price?.toString() || '',
      item.lowStockThreshold.toString(),
      item.allergens?.join(',') || '',
      item.ingredients?.join(',') || '',
      item.nutritionalInfo?.servingSize || '',
      item.nutritionalInfo?.calories?.toString() || '',
      item.nutritionalInfo?.protein?.toString() || '',
      item.nutritionalInfo?.carbs?.toString() || '',
      item.nutritionalInfo?.fats?.toString() || '',
      item.nutritionalInfo?.fiber?.toString() || '',
      item.nutritionalInfo?.sodium?.toString() || '',
      item.nutritionalInfo?.sugar?.toString() || '',
      item.notes || '',
      item.tags?.join(',') || '',
      customFieldsJson,
    ].map(escapeCSVField);

    return row.join(',');
  });

  return `${headers}\n${rows.join('\n')}`;
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Helper functions

function escapeCSVField(field: string): string {
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

