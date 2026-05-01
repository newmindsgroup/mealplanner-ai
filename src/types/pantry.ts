import type { BloodType, FoodCategory } from './index';

// Quantity units for pantry items
export type QuantityUnit = 
  | 'count' // pieces, items, units
  | 'g' // grams
  | 'kg' // kilograms
  | 'oz' // ounces
  | 'lb' // pounds
  | 'ml' // milliliters
  | 'l' // liters
  | 'cup' // cups
  | 'tbsp' // tablespoons
  | 'tsp' // teaspoons
  | 'can' // cans
  | 'box' // boxes
  | 'bag' // bags
  | 'bottle' // bottles
  | 'jar' // jars
  | 'package'; // packages

// Storage location in home
export type StorageLocation = 
  | 'pantry'
  | 'refrigerator'
  | 'freezer'
  | 'cabinet'
  | 'counter'
  | 'other';

// Alert priority levels
export type AlertPriority = 'low' | 'medium' | 'high' | 'urgent';

// Usage frequency patterns
export type UsageFrequency = 'daily' | 'weekly' | 'monthly' | 'rarely';

// Custom field types
export type CustomFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';

// Custom field for pantry items
export interface CustomField {
  id: string;
  key: string;
  value: string | number | boolean;
  type: CustomFieldType;
  options?: string[]; // For select type
  label?: string;
  unit?: string; // Optional unit for number fields (e.g., "mg", "servings")
}

// Template for category-specific custom fields
export interface CustomFieldTemplate {
  id: string;
  category: FoodCategory;
  fieldName: string;
  fieldKey: string;
  fieldType: CustomFieldType;
  defaultValue?: string | number | boolean;
  options?: string[]; // For select type
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  unit?: string;
  order: number; // Display order
}

// Core pantry item interface
export interface PantryItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: QuantityUnit;
  location: StorageLocation;
  
  // Identification
  barcode?: string;
  brand?: string;
  imageUrl?: string;
  
  // Tracking
  purchaseDate?: string;
  expirationDate?: string;
  openedDate?: string;
  supplier?: string; // Store or supplier name
  
  // Product details
  allergens?: string[]; // List of allergens
  ingredients?: string[]; // List of ingredients
  
  // Inventory management
  lowStockThreshold: number;
  idealStockLevel?: number;
  isLowStock?: boolean;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
  
  // Financial
  price?: number;
  pricePerUnit?: number;
  
  // Nutritional (from AI/database)
  nutritionalInfo?: {
    servingSize?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
  };
  
  // Blood type compatibility
  bloodTypeCompatibility?: {
    [key in BloodType]?: 'beneficial' | 'neutral' | 'avoid';
  };
  
  // Usage tracking
  usageHistory?: UsageRecord[];
  usageFrequency?: UsageFrequency;
  averageConsumptionRate?: number; // units per day
  
  // AI-generated insights
  aiSuggestions?: string[];
  notes?: string;
  tags?: string[];
  
  // Custom fields
  customFields?: CustomField[];
  
  // Metadata
  addedBy?: string; // user id
  addedAt: string;
  updatedAt: string;
  householdId?: string;
}

// Track usage over time
export interface UsageRecord {
  id: string;
  itemId: string;
  quantityUsed: number;
  date: string;
  usedInMeal?: string; // meal id
  notes?: string;
}

// Low stock alert configuration
export interface LowStockAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentQuantity: number;
  threshold: number;
  priority: AlertPriority;
  createdAt: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
  addedToGroceryList?: boolean;
}

// Expiration alert
export interface ExpirationAlert {
  id: string;
  itemId: string;
  itemName: string;
  expirationDate: string;
  daysUntilExpiration: number;
  priority: AlertPriority;
  createdAt: string;
  acknowledged?: boolean;
  usedInMeal?: boolean;
}

// Pantry statistics and analytics
export interface PantryStats {
  totalItems: number;
  totalValue?: number;
  itemsByCategory: Record<FoodCategory, number>;
  itemsByLocation: Record<StorageLocation, number>;
  lowStockCount: number;
  expiringCount: number;
  expiredCount: number;
  lastUpdated: string;
  
  // AI-generated insights
  topUsedItems?: Array<{ name: string; count: number }>;
  wastePrevention?: {
    itemsToUseFirst: string[];
    suggestedRecipes?: string[];
  };
  shoppingRecommendations?: string[];
  healthScore?: number; // 0-100 based on nutritional balance
}

// Pantry settings and preferences
export interface PantrySettings {
  // Notification preferences
  enableLowStockAlerts: boolean;
  enableExpirationAlerts: boolean;
  expirationAlertDays: number; // days before expiration to alert
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
  
  // Default values
  defaultLocation: StorageLocation;
  defaultLowStockThreshold: number;
  
  // Display preferences
  defaultView: 'grid' | 'list';
  sortBy: 'name' | 'quantity' | 'expiration' | 'category' | 'added';
  sortOrder: 'asc' | 'desc';
  showEmptyCategories: boolean;
  
  // Advanced features
  enableUsageTracking: boolean;
  enableAISuggestions: boolean;
  enableBarcodeScanning: boolean;
  autoAddToGroceryList: boolean;
  
  // Budget tracking
  enablePriceTracking: boolean;
  monthlyBudget?: number;
}

// Barcode scan result with product info
export interface BarcodeScanResult {
  barcode: string;
  format: string; // UPC-A, EAN-13, QR-Code, etc.
  productInfo?: ProductInfo;
  scanDate: string;
}

// Product information from databases or AI
export interface ProductInfo {
  name: string;
  brand?: string;
  category?: FoodCategory;
  description?: string;
  imageUrl?: string;
  
  // Nutritional data
  nutritionalInfo?: {
    servingSize?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
  };
  
  // Additional info
  ingredients?: string[];
  allergens?: string[];
  certifications?: string[]; // organic, non-GMO, etc.
  
  // Storage info
  shelfLife?: number; // days
  storageLocation?: StorageLocation;
  
  // Source
  source: 'openfoodfacts' | 'upc-database' | 'ai-generated' | 'manual';
  confidence?: number; // 0-100
}

// Bulk import/export format
export interface PantryExport {
  exportDate: string;
  items: PantryItem[];
  settings?: PantrySettings;
  version: string;
}

// Recipe suggestion from pantry
export interface PantryRecipeSuggestion {
  id: string;
  name: string;
  description: string;
  matchPercentage: number; // % of ingredients available
  missingIngredients: string[];
  availableIngredients: string[];
  estimatedPrepTime: number;
  estimatedCookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  aiGenerated: boolean;
  instructions?: string[];
  nutritionalEstimate?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
}

// Smart shopping list item (enhanced from pantry)
export interface SmartGroceryItem {
  pantryItemId?: string;
  name: string;
  category: string;
  quantityNeeded: number;
  unit: QuantityUnit;
  currentStock: number;
  priority: AlertPriority;
  estimatedPrice?: number;
  reason: 'low-stock' | 'out-of-stock' | 'recipe-ingredient' | 'manual';
  addedAt: string;
}

// Pantry sharing for household members
export interface PantryShare {
  id: string;
  pantryOwnerId: string;
  sharedWithUserId: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAddItems: boolean;
  };
  sharedAt: string;
}

// AI-powered meal suggestion based on pantry
export interface PantryMealSuggestion {
  id: string;
  mealName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  canMakeNow: boolean;
  matchScore: number; // 0-100
  availableIngredients: Array<{
    pantryItemId: string;
    name: string;
    quantityNeeded: number;
    quantityAvailable: number;
  }>;
  missingIngredients: Array<{
    name: string;
    quantityNeeded: number;
    suggestedSubstitutes?: string[];
  }>;
  recipe?: {
    description: string;
    instructions: string[];
    prepTime: number;
    cookTime: number;
  };
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  bloodTypeCompatible: BloodType[];
  usesByDateItems: string[]; // pantry items expiring soon
  aiGenerated: boolean;
  createdAt: string;
}

// CSV validation error
export interface CSVValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
  severity: 'error' | 'warning';
}

// CSV import result
export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  errors: CSVValidationError[];
  importedItems: PantryItem[];
  skippedRows: number[];
}

