// Complete blood type system with Rh factor
export type BloodType = 
  | 'O+' | 'O-' 
  | 'A+' | 'A-' 
  | 'B+' | 'B-' 
  | 'AB+' | 'AB-';

// Helper to get base blood type (without Rh factor)
export function getBaseBloodType(bloodType: BloodType): 'O' | 'A' | 'B' | 'AB' {
  return bloodType.replace(/[+-]/, '') as 'O' | 'A' | 'B' | 'AB';
}

// Helper to check if Rh positive
export function isRhPositive(bloodType: BloodType): boolean {
  return bloodType.endsWith('+');
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type CuisineType = 
  | 'latin' 
  | 'mediterranean' 
  | 'african' 
  | 'caribbean' 
  | 'asian' 
  | 'american' 
  | 'european' 
  | 'middle-eastern';

export type HealthBenefit = 
  | 'anti-inflammatory' 
  | 'high-protein' 
  | 'heart-health' 
  | 'digestive-support' 
  | 'immunity-boost' 
  | 'brain-health' 
  | 'energy' 
  | 'antioxidant';

export type FoodCategory = 
  | 'proteins' 
  | 'vegetables' 
  | 'fruits' 
  | 'grains' 
  | 'dairy' 
  | 'oils' 
  | 'nuts-seeds' 
  | 'beverages' 
  | 'spices' 
  | 'sweeteners';

export interface IngredientDetail {
  name: string;
  category: FoodCategory;
  healthBenefits?: HealthBenefit[];
  bloodTypeStatus?: Record<BloodType, 'beneficial' | 'neutral' | 'avoid'>;
  serving?: string;
}

export interface ComponentBreakdown {
  proteins?: string[];
  vegetables?: string[];
  grains?: string[];
  fruits?: string[];
  dairy?: string[];
  other?: string[];
}

export interface Person {
  id: string;
  name: string;
  bloodType: BloodType;
  age: number;
  allergies: string[];
  dietaryCodes: string[];
  eatingPreferences: string[];
  goals: string[];
  bodyComposition?: {
    weight?: number;
    height?: number;
    bodyFat?: number;
  };
  kidsNotes?: string;
}

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  rationale: string;
  bloodTypeCompatible: BloodType[];
  tags: string[];
  cuisine?: CuisineType;
  isFavorite?: boolean;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
  };
  // Enhanced meal properties
  healthBenefits?: HealthBenefit[];
  ingredientDetails?: IngredientDetail[];
  servingSize?: string;
  totalTime?: number;
  componentBreakdown?: ComponentBreakdown;
  bloodTypeExplanations?: Record<BloodType, string>;
}

export interface DayPlan {
  date: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
}

export interface WeeklyPlan {
  id: string;
  weekStart: string;
  days: DayPlan[];
  people: Person[];
  createdAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
}

export interface GroceryList {
  id: string;
  items: GroceryItem[];
  createdAt: string;
}

export interface LabelAnalysis {
  id: string;
  imageUrl: string;
  extractedText: string;
  bloodTypeConflicts: string[];
  additives: string[];
  safetyFlags: {
    level: 'safe' | 'caution' | 'warning' | 'danger';
    message: string;
  }[];
  recommendations: string[];
  createdAt: string;
}

// Scan types for Label Analyzer
export type ScanMode = 'supplement' | 'pantry' | 'grocery';

// Pantry Scan Result
export interface IdentifiedFood {
  id: string;
  name: string;
  category: FoodCategory;
  confidence: number; // 0-100
  estimatedQuantity?: string;
  expirationEstimate?: string;
  addedToFoodGuide?: boolean;
}

export interface PantryScanResult {
  id: string;
  imageUrl: string;
  scanMode: 'pantry';
  identifiedFoods: IdentifiedFood[];
  totalItemsFound: number;
  recommendations: string[];
  createdAt: string;
}

// Grocery Label Scan Result
export interface HarmfulIngredient {
  name: string;
  category: 'additive' | 'preservative' | 'artificial-color' | 'artificial-flavor' | 'sugar' | 'sodium' | 'trans-fat' | 'allergen';
  severity: 'low' | 'moderate' | 'high';
  reason: string;
  bloodTypeConflicts?: BloodType[];
}

export interface GroceryScanResult {
  id: string;
  imageUrl: string;
  scanMode: 'grocery';
  productName: string;
  extractedText: string;
  harmfulIngredients: HarmfulIngredient[];
  healthScore: number; // 0-100 (100 = healthiest)
  safetyFlags: {
    level: 'safe' | 'caution' | 'warning' | 'danger';
    message: string;
  }[];
  recommendations: string[];
  bloodTypeCompatibility?: {
    [key in BloodType]?: 'beneficial' | 'neutral' | 'avoid';
  };
  createdAt: string;
}

// Union type for all scan results
export type ScanResult = LabelAnalysis | PantryScanResult | GroceryScanResult;

export interface KnowledgeBaseFile {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'csv' | 'recipe' | 'notes';
  content: string;
  uploadedAt: string;
}

export interface Settings {
  darkMode: boolean;
  voiceEnabled: boolean;
  voiceSpeed: number;
  voiceSelection: string;
  autoReadResponses: boolean;
  emojisEnabled: boolean;
  chefMode: boolean;
  culturalAdaptation: boolean;
  seasonalAdaptation: boolean;
  language: string;
  
  // AI API Configuration
  customOpenAIKey?: string; // User's custom OpenAI API key (encrypted)
  useCustomAPIKey?: boolean; // Whether to use custom key or default
  
  // Email notifications
  smtp: import('./notifications').SMTPSettings;
  notifications: import('./notifications').NotificationPreferences;
}

export interface Progress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  badges: string[];
  mealsCompleted: number;
  weeklyActivity: { date: string; meals: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Food Guide Types
export type { FoodItem } from '../data/bloodTypeFoods';

export interface UserFoodGuide {
  id: string;
  userId: string;
  bloodType: BloodType;
  customFoods: import('../data/bloodTypeFoods').FoodItem[];
  hiddenFoods: string[];
  lastUpdated: string;
}

export interface FoodInquiry {
  id: string;
  foodName: string;
  bloodType: BloodType;
  classification: 'beneficial' | 'neutral' | 'avoid';
  response: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
  };
  benefits?: string;
  concerns?: string;
  timestamp: string;
}

// Export all pantry-related types
export type {
  PantryItem,
  UsageRecord,
  LowStockAlert,
  ExpirationAlert,
  PantryStats,
  PantrySettings,
  BarcodeScanResult,
  ProductInfo,
  PantryExport,
  PantryRecipeSuggestion,
  SmartGroceryItem,
  PantryShare,
  PantryMealSuggestion,
  QuantityUnit,
  StorageLocation,
  AlertPriority,
  UsageFrequency,
  CustomField,
  CustomFieldType,
  CustomFieldTemplate,
  CSVValidationError,
  CSVImportResult,
} from './pantry';

// Export all lab-related types
export type {
  LabCategory,
  LabStatus,
  AlertSeverity,
  TrendDirection,
  LabResult,
  LabPanel,
  LabReport,
  LabTrend,
  LabAlert,
  LabEducationContent,
  LabComparison,
  LabAnalyticsSummary,
  LabCorrelation,
  LabInsight,
  LabExport,
} from './labs';

export { LAB_PANELS, PRIORITY_MARKERS, TEST_NAME_ALIASES } from './labs';

