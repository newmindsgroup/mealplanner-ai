/**
 * D'Adamo Blood Type Food Compatibility Database
 *
 * Comprehensive food classification by blood type based on
 * "Eat Right 4 Your Type" by Dr. Peter J. D'Adamo.
 *
 * Sources: dadamo.com, 4yourtype.com, Healthline, WebMD
 *
 * Categories: "beneficial" (medicine), "neutral" (food), "avoid" (poison)
 *
 * ⚠️ Disclaimer: The Blood Type Diet is not supported by mainstream
 * clinical evidence. This data is provided for informational purposes
 * based on D'Adamo's published classifications.
 */

export type BloodTypeGroup = 'O' | 'A' | 'B' | 'AB';
export type FoodRating = 'beneficial' | 'neutral' | 'avoid';

export interface FoodCompatibility {
  food: string;
  category: string;
  O: FoodRating;
  A: FoodRating;
  B: FoodRating;
  AB: FoodRating;
  notes?: string;
}

// ─── Complete Food Database ─────────────────────────────────────────────────

const FOOD_COMPATIBILITY: FoodCompatibility[] = [
  // ── PROTEINS: Meats ─────────────────────────────────────────
  { food: 'Beef', category: 'Meat', O: 'beneficial', A: 'avoid', B: 'neutral', AB: 'avoid', notes: 'High heme iron for Type O' },
  { food: 'Lamb', category: 'Meat', O: 'beneficial', A: 'avoid', B: 'beneficial', AB: 'beneficial', notes: 'Best meat for B and AB' },
  { food: 'Turkey', category: 'Meat', O: 'beneficial', A: 'neutral', B: 'neutral', AB: 'beneficial' },
  { food: 'Chicken', category: 'Meat', O: 'neutral', A: 'neutral', B: 'avoid', AB: 'avoid', notes: 'Type B agglutinating lectin' },
  { food: 'Pork', category: 'Meat', O: 'avoid', A: 'avoid', B: 'avoid', AB: 'avoid' },
  { food: 'Venison', category: 'Meat', O: 'beneficial', A: 'avoid', B: 'beneficial', AB: 'neutral' },
  { food: 'Rabbit', category: 'Meat', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'beneficial' },
  { food: 'Liver', category: 'Meat', O: 'beneficial', A: 'neutral', B: 'beneficial', AB: 'neutral' },
  { food: 'Bacon', category: 'Meat', O: 'avoid', A: 'avoid', B: 'avoid', AB: 'avoid' },
  { food: 'Ham', category: 'Meat', O: 'avoid', A: 'avoid', B: 'avoid', AB: 'avoid' },
  { food: 'Veal', category: 'Meat', O: 'beneficial', A: 'avoid', B: 'neutral', AB: 'avoid' },

  // ── PROTEINS: Seafood ───────────────────────────────────────
  { food: 'Salmon', category: 'Seafood', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial', notes: 'Beneficial for ALL types' },
  { food: 'Sardines', category: 'Seafood', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },
  { food: 'Cod', category: 'Seafood', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },
  { food: 'Mackerel', category: 'Seafood', O: 'beneficial', A: 'beneficial', B: 'neutral', AB: 'beneficial' },
  { food: 'Tuna', category: 'Seafood', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'beneficial' },
  { food: 'Shrimp', category: 'Seafood', O: 'neutral', A: 'avoid', B: 'neutral', AB: 'neutral' },
  { food: 'Crab', category: 'Seafood', O: 'avoid', A: 'avoid', B: 'avoid', AB: 'avoid' },
  { food: 'Lobster', category: 'Seafood', O: 'avoid', A: 'avoid', B: 'neutral', AB: 'neutral' },
  { food: 'Catfish', category: 'Seafood', O: 'avoid', A: 'avoid', B: 'avoid', AB: 'avoid' },
  { food: 'Herring', category: 'Seafood', O: 'beneficial', A: 'beneficial', B: 'neutral', AB: 'neutral' },

  // ── DAIRY ──────────────────────────────────────────────────
  { food: 'Goat Cheese', category: 'Dairy', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'beneficial' },
  { food: 'Goat Milk', category: 'Dairy', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'beneficial' },
  { food: 'Yogurt', category: 'Dairy', O: 'avoid', A: 'neutral', B: 'beneficial', AB: 'beneficial' },
  { food: 'Kefir', category: 'Dairy', O: 'avoid', A: 'neutral', B: 'beneficial', AB: 'beneficial', notes: 'Fermented — great for B and AB' },
  { food: 'Mozzarella', category: 'Dairy', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'beneficial' },
  { food: 'Feta', category: 'Dairy', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'beneficial' },
  { food: 'Cottage Cheese', category: 'Dairy', O: 'avoid', A: 'neutral', B: 'beneficial', AB: 'neutral' },
  { food: 'Butter', category: 'Dairy', O: 'avoid', A: 'avoid', B: 'neutral', AB: 'avoid' },
  { food: 'Ice Cream', category: 'Dairy', O: 'avoid', A: 'avoid', B: 'avoid', AB: 'avoid' },
  { food: 'Whole Milk', category: 'Dairy', O: 'avoid', A: 'avoid', B: 'beneficial', AB: 'neutral' },
  { food: 'Eggs', category: 'Dairy', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'neutral' },

  // ── GRAINS ─────────────────────────────────────────────────
  { food: 'Rice', category: 'Grain', O: 'neutral', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },
  { food: 'Oats', category: 'Grain', O: 'neutral', A: 'beneficial', B: 'neutral', AB: 'neutral' },
  { food: 'Millet', category: 'Grain', O: 'neutral', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },
  { food: 'Spelt', category: 'Grain', O: 'neutral', A: 'beneficial', B: 'neutral', AB: 'beneficial' },
  { food: 'Quinoa', category: 'Grain', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Wheat', category: 'Grain', O: 'avoid', A: 'neutral', B: 'avoid', AB: 'neutral', notes: 'Avoid for O and B' },
  { food: 'Corn', category: 'Grain', O: 'avoid', A: 'neutral', B: 'avoid', AB: 'avoid' },
  { food: 'Buckwheat', category: 'Grain', O: 'neutral', A: 'neutral', B: 'avoid', AB: 'avoid' },

  // ── LEGUMES ────────────────────────────────────────────────
  { food: 'Lentils', category: 'Legume', O: 'avoid', A: 'beneficial', B: 'avoid', AB: 'beneficial' },
  { food: 'Black Beans', category: 'Legume', O: 'neutral', A: 'beneficial', B: 'neutral', AB: 'neutral' },
  { food: 'Kidney Beans', category: 'Legume', O: 'avoid', A: 'avoid', B: 'avoid', AB: 'avoid' },
  { food: 'Lima Beans', category: 'Legume', O: 'avoid', A: 'avoid', B: 'neutral', AB: 'avoid' },
  { food: 'Navy Beans', category: 'Legume', O: 'avoid', A: 'neutral', B: 'neutral', AB: 'beneficial' },
  { food: 'Pinto Beans', category: 'Legume', O: 'neutral', A: 'beneficial', B: 'neutral', AB: 'beneficial' },
  { food: 'Soybeans/Tofu', category: 'Legume', O: 'neutral', A: 'beneficial', B: 'neutral', AB: 'beneficial', notes: '#1 protein for Type A' },

  // ── NUTS & SEEDS ───────────────────────────────────────────
  { food: 'Walnuts', category: 'Nuts', O: 'beneficial', A: 'beneficial', B: 'neutral', AB: 'beneficial' },
  { food: 'Almonds', category: 'Nuts', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Peanuts', category: 'Nuts', O: 'avoid', A: 'beneficial', B: 'avoid', AB: 'neutral' },
  { food: 'Pumpkin Seeds', category: 'Nuts', O: 'beneficial', A: 'beneficial', B: 'neutral', AB: 'neutral' },
  { food: 'Flaxseed', category: 'Nuts', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },
  { food: 'Sesame Seeds', category: 'Nuts', O: 'neutral', A: 'neutral', B: 'avoid', AB: 'avoid' },
  { food: 'Sunflower Seeds', category: 'Nuts', O: 'neutral', A: 'beneficial', B: 'avoid', AB: 'neutral' },
  { food: 'Brazil Nuts', category: 'Nuts', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'neutral', notes: 'Rich in selenium — all types' },
  { food: 'Chestnuts', category: 'Nuts', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'beneficial' },

  // ── VEGETABLES ─────────────────────────────────────────────
  { food: 'Spinach', category: 'Vegetable', O: 'beneficial', A: 'beneficial', B: 'neutral', AB: 'neutral' },
  { food: 'Kale', category: 'Vegetable', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },
  { food: 'Broccoli', category: 'Vegetable', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial', notes: 'Beneficial for ALL types' },
  { food: 'Sweet Potato', category: 'Vegetable', O: 'beneficial', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Carrots', category: 'Vegetable', O: 'neutral', A: 'beneficial', B: 'neutral', AB: 'neutral' },
  { food: 'Beets', category: 'Vegetable', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'beneficial' },
  { food: 'Celery', category: 'Vegetable', O: 'neutral', A: 'beneficial', B: 'neutral', AB: 'neutral' },
  { food: 'Cucumber', category: 'Vegetable', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Garlic', category: 'Vegetable', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Onion', category: 'Vegetable', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Tomato', category: 'Vegetable', O: 'neutral', A: 'avoid', B: 'avoid', AB: 'neutral', notes: 'Avoid for A and B' },
  { food: 'Avocado', category: 'Vegetable', O: 'avoid', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Corn', category: 'Vegetable', O: 'avoid', A: 'neutral', B: 'avoid', AB: 'avoid' },
  { food: 'Mushrooms', category: 'Vegetable', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'neutral', notes: 'Avoid shiitake for B' },
  { food: 'Bell Pepper', category: 'Vegetable', O: 'neutral', A: 'avoid', B: 'neutral', AB: 'neutral' },
  { food: 'Eggplant', category: 'Vegetable', O: 'avoid', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Cauliflower', category: 'Vegetable', O: 'avoid', A: 'neutral', B: 'beneficial', AB: 'neutral' },
  { food: 'Cabbage', category: 'Vegetable', O: 'avoid', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Brussels Sprouts', category: 'Vegetable', O: 'avoid', A: 'neutral', B: 'beneficial', AB: 'neutral' },
  { food: 'Ginger', category: 'Vegetable', O: 'neutral', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },

  // ── FRUITS ─────────────────────────────────────────────────
  { food: 'Blueberries', category: 'Fruit', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial', notes: 'Universal superfruit' },
  { food: 'Cherries', category: 'Fruit', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },
  { food: 'Plums', category: 'Fruit', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },
  { food: 'Pineapple', category: 'Fruit', O: 'beneficial', A: 'beneficial', B: 'neutral', AB: 'beneficial' },
  { food: 'Grapes', category: 'Fruit', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'beneficial' },
  { food: 'Banana', category: 'Fruit', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'neutral' },
  { food: 'Mango', category: 'Fruit', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Papaya', category: 'Fruit', O: 'neutral', A: 'neutral', B: 'beneficial', AB: 'neutral' },
  { food: 'Apple', category: 'Fruit', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Lemon', category: 'Fruit', O: 'neutral', A: 'beneficial', B: 'neutral', AB: 'neutral' },
  { food: 'Orange', category: 'Fruit', O: 'avoid', A: 'neutral', B: 'neutral', AB: 'avoid' },
  { food: 'Strawberry', category: 'Fruit', O: 'avoid', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Coconut', category: 'Fruit', O: 'avoid', A: 'neutral', B: 'avoid', AB: 'neutral' },
  { food: 'Melon', category: 'Fruit', O: 'avoid', A: 'neutral', B: 'neutral', AB: 'neutral' },
  { food: 'Kiwi', category: 'Fruit', O: 'neutral', A: 'neutral', B: 'neutral', AB: 'beneficial' },

  // ── OILS ───────────────────────────────────────────────────
  { food: 'Olive Oil', category: 'Oil', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial', notes: 'Universal beneficial oil' },
  { food: 'Flaxseed Oil', category: 'Oil', O: 'beneficial', A: 'beneficial', B: 'neutral', AB: 'neutral' },
  { food: 'Coconut Oil', category: 'Oil', O: 'avoid', A: 'neutral', B: 'avoid', AB: 'neutral' },
  { food: 'Sesame Oil', category: 'Oil', O: 'neutral', A: 'neutral', B: 'avoid', AB: 'neutral' },

  // ── BEVERAGES ──────────────────────────────────────────────
  { food: 'Green Tea', category: 'Beverage', O: 'neutral', A: 'beneficial', B: 'neutral', AB: 'beneficial' },
  { food: 'Ginger Tea', category: 'Beverage', O: 'beneficial', A: 'beneficial', B: 'beneficial', AB: 'beneficial' },
  { food: 'Coffee', category: 'Beverage', O: 'avoid', A: 'beneficial', B: 'neutral', AB: 'neutral' },
  { food: 'Black Tea', category: 'Beverage', O: 'avoid', A: 'avoid', B: 'neutral', AB: 'neutral' },
];

// ─── Lookup Functions ───────────────────────────────────────────────────────

/**
 * Look up a food's compatibility with a specific blood type
 */
export function lookupFoodCompatibility(
  food: string,
  bloodType: string,
): { rating: FoodRating; food: FoodCompatibility } | null {
  const bt = normalizeBloodType(bloodType);
  if (!bt) return null;

  const lower = food.toLowerCase();
  const match = FOOD_COMPATIBILITY.find(f =>
    f.food.toLowerCase() === lower ||
    f.food.toLowerCase().includes(lower) ||
    lower.includes(f.food.toLowerCase())
  );

  if (!match) return null;
  return { rating: match[bt], food: match };
}

/**
 * Get all foods with a specific rating for a blood type
 */
export function getFoodsByRating(
  bloodType: string,
  rating: FoodRating,
  category?: string,
): FoodCompatibility[] {
  const bt = normalizeBloodType(bloodType);
  if (!bt) return [];

  return FOOD_COMPATIBILITY.filter(f =>
    f[bt] === rating &&
    (!category || f.category.toLowerCase() === category.toLowerCase())
  );
}

/**
 * Get a complete food report for a blood type
 */
export function getBloodTypeFoodReport(bloodType: string): {
  beneficial: FoodCompatibility[];
  neutral: FoodCompatibility[];
  avoid: FoodCompatibility[];
} {
  const bt = normalizeBloodType(bloodType);
  if (!bt) return { beneficial: [], neutral: [], avoid: [] };

  return {
    beneficial: FOOD_COMPATIBILITY.filter(f => f[bt] === 'beneficial'),
    neutral: FOOD_COMPATIBILITY.filter(f => f[bt] === 'neutral'),
    avoid: FOOD_COMPATIBILITY.filter(f => f[bt] === 'avoid'),
  };
}

/**
 * Check a list of ingredients for blood type compatibility
 * Returns warnings for any "avoid" foods
 */
export function checkIngredientsCompatibility(
  ingredients: string[],
  bloodType: string,
): Array<{ ingredient: string; rating: FoodRating; food: string; notes?: string }> {
  const bt = normalizeBloodType(bloodType);
  if (!bt) return [];

  const results: Array<{ ingredient: string; rating: FoodRating; food: string; notes?: string }> = [];

  for (const ingredient of ingredients) {
    const lower = ingredient.toLowerCase();
    for (const food of FOOD_COMPATIBILITY) {
      if (lower.includes(food.food.toLowerCase())) {
        results.push({
          ingredient,
          rating: food[bt],
          food: food.food,
          notes: food.notes,
        });
        break;
      }
    }
  }

  return results;
}

/**
 * Get universally safe foods (beneficial or neutral for all types)
 */
export function getUniversalSafeFoods(): FoodCompatibility[] {
  return FOOD_COMPATIBILITY.filter(f =>
    f.O !== 'avoid' && f.A !== 'avoid' && f.B !== 'avoid' && f.AB !== 'avoid'
  );
}

/**
 * Get foods to highlight — beneficial for a specific type
 */
export function getSuperfoods(bloodType: string): FoodCompatibility[] {
  const bt = normalizeBloodType(bloodType);
  if (!bt) return [];
  return FOOD_COMPATIBILITY.filter(f => f[bt] === 'beneficial');
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeBloodType(input: string): BloodTypeGroup | null {
  const clean = input.replace(/[+-]/g, '').toUpperCase().trim();
  if (['O', 'A', 'B', 'AB'].includes(clean)) return clean as BloodTypeGroup;
  return null;
}

/** Total number of foods in the database */
export const FOOD_COUNT = FOOD_COMPATIBILITY.length;

/** Get all food categories */
export function getFoodCategories(): string[] {
  return [...new Set(FOOD_COMPATIBILITY.map(f => f.category))];
}
