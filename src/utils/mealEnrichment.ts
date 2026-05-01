/**
 * Meal Enrichment Utility
 * Maps meal ingredients to food database and enriches with health benefits, blood type data, etc.
 */

import type { Meal, BloodType, HealthBenefit, IngredientDetail, ComponentBreakdown, FoodCategory } from '../types';
import { bloodTypeFoodDatabase, type FoodItem } from '../data/bloodTypeFoods';
import { roundTo } from './numberFormat';

/**
 * Find a food item in the database by name (fuzzy matching)
 */
function findFoodItem(ingredientName: string): FoodItem | null {
  const searchTerm = ingredientName.toLowerCase().trim();
  
  // Remove quantity and measurement words
  const quantityWords = /\d+\s*(cup|cups|tablespoon|tablespoons|tbsp|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|ml|slice|slices|piece|pieces|whole|half|quarter)?s?\s*/gi;
  let cleanedSearch = searchTerm.replace(quantityWords, '').trim();
  
  // Remove common descriptors
  const descriptors = ['fresh', 'dried', 'cooked', 'raw', 'organic', 'chopped', 'diced', 'sliced', 'minced', 'grated', 'shredded', 'ground', 'whole', 'extra virgin', 'virgin', 'unsalted', 'salted', 'plain', 'greek', 'non-fat', 'low-fat', 'full-fat'];
  descriptors.forEach(descriptor => {
    const regex = new RegExp(`\\b${descriptor}\\b`, 'gi');
    cleanedSearch = cleanedSearch.replace(regex, '').trim();
  });
  
  // Try exact match first
  let match = bloodTypeFoodDatabase.find(food => 
    food.name.toLowerCase() === cleanedSearch
  );
  
  if (match) return match;
  
  // Try exact match with original search term
  match = bloodTypeFoodDatabase.find(food => 
    food.name.toLowerCase() === searchTerm
  );
  
  if (match) return match;
  
  // Try partial match - search term contains food name
  match = bloodTypeFoodDatabase.find(food => {
    const foodName = food.name.toLowerCase();
    return cleanedSearch.includes(foodName) || searchTerm.includes(foodName);
  });
  
  if (match) return match;
  
  // Try partial match - food name contains search term
  match = bloodTypeFoodDatabase.find(food => {
    const foodName = food.name.toLowerCase();
    return foodName.includes(cleanedSearch) || foodName.includes(searchTerm);
  });
  
  if (match) return match;
  
  // Try matching individual words
  const searchWords = cleanedSearch.split(/\s+/).filter(word => word.length > 2);
  for (const word of searchWords) {
    match = bloodTypeFoodDatabase.find(food => {
      const foodName = food.name.toLowerCase();
      return foodName.includes(word) || word.includes(foodName);
    });
    if (match) return match;
  }
  
  return null;
}

/**
 * Infer category from ingredient name when not found in database
 */
function inferCategoryFromName(ingredientName: string): FoodCategory {
  const name = ingredientName.toLowerCase();
  
  // Proteins
  if (name.includes('egg') || name.includes('chicken') || name.includes('turkey') || 
      name.includes('beef') || name.includes('pork') || name.includes('lamb') || 
      name.includes('fish') || name.includes('salmon') || name.includes('tuna') || 
      name.includes('cod') || name.includes('shrimp') || name.includes('tofu') ||
      name.includes('tempeh') || name.includes('meat') || name.includes('sausage')) {
    return 'proteins';
  }
  
  // Vegetables
  if (name.includes('spinach') || name.includes('kale') || name.includes('lettuce') ||
      name.includes('broccoli') || name.includes('carrot') || name.includes('pepper') ||
      name.includes('tomato') || name.includes('cucumber') || name.includes('celery') ||
      name.includes('onion') || name.includes('garlic') || name.includes('mushroom') ||
      name.includes('zucchini') || name.includes('squash') || name.includes('cabbage') ||
      name.includes('cauliflower') || name.includes('asparagus') || name.includes('bean') ||
      name.includes('greens') || name.includes('bok choy')) {
    return 'vegetables';
  }
  
  // Fruits
  if (name.includes('apple') || name.includes('banana') || name.includes('orange') ||
      name.includes('berry') || name.includes('berries') || name.includes('grape') ||
      name.includes('melon') || name.includes('peach') || name.includes('pear') ||
      name.includes('plum') || name.includes('cherry') || name.includes('pineapple') ||
      name.includes('mango') || name.includes('lemon') || name.includes('lime') ||
      name.includes('avocado')) {
    return 'fruits';
  }
  
  // Grains
  if (name.includes('rice') || name.includes('quinoa') || name.includes('oat') ||
      name.includes('bread') || name.includes('pasta') || name.includes('tortilla') ||
      name.includes('cereal') || name.includes('grain') || name.includes('flour') ||
      name.includes('wheat') || name.includes('barley') || name.includes('millet')) {
    return 'grains';
  }
  
  // Dairy
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') ||
      name.includes('butter') || name.includes('cream') || name.includes('dairy')) {
    return 'dairy';
  }
  
  // Oils
  if (name.includes('oil') || name.includes('fat')) {
    return 'oils';
  }
  
  // Nuts and seeds
  if (name.includes('nut') || name.includes('almond') || name.includes('walnut') ||
      name.includes('cashew') || name.includes('pecan') || name.includes('seed') ||
      name.includes('sesame') || name.includes('sunflower')) {
    return 'nuts-seeds';
  }
  
  // Beverages
  if (name.includes('water') || name.includes('juice') || name.includes('tea') ||
      name.includes('coffee') || name.includes('broth') || name.includes('stock')) {
    return 'beverages';
  }
  
  // Spices and seasonings
  if (name.includes('salt') || name.includes('pepper') || name.includes('spice') ||
      name.includes('herb') || name.includes('seasoning') || name.includes('cinnamon') ||
      name.includes('ginger') || name.includes('turmeric') || name.includes('cumin') ||
      name.includes('paprika') || name.includes('oregano') || name.includes('basil') ||
      name.includes('thyme') || name.includes('rosemary') || name.includes('parsley') ||
      name.includes('cilantro') || name.includes('dill') || name.includes('soy sauce') ||
      name.includes('tamari') || name.includes('vinegar')) {
    return 'spices';
  }
  
  // Sweeteners
  if (name.includes('sugar') || name.includes('honey') || name.includes('syrup') ||
      name.includes('sweetener') || name.includes('molasses')) {
    return 'sweeteners';
  }
  
  // Default to spices for unknown items
  return 'spices';
}

/**
 * Map ingredient name to detailed ingredient with food database data
 */
function enrichIngredient(ingredientName: string, bloodTypes: BloodType[]): IngredientDetail {
  const foodItem = findFoodItem(ingredientName);
  
  if (!foodItem) {
    // If not found in database, infer category from name
    const category = inferCategoryFromName(ingredientName);
    return {
      name: ingredientName,
      category,
    };
  }
  
  // Extract blood type status for all relevant blood types
  const bloodTypeStatus: Record<BloodType, 'beneficial' | 'neutral' | 'avoid'> = {} as any;
  bloodTypes.forEach(bt => {
    bloodTypeStatus[bt] = foodItem.classification[bt];
  });
  
  return {
    name: foodItem.name,
    category: foodItem.category,
    healthBenefits: foodItem.healthBenefits,
    bloodTypeStatus,
    serving: foodItem.servingSize,
  };
}

/**
 * Get all health benefits from a list of ingredients
 */
export function getMealHealthBenefits(ingredients: IngredientDetail[]): HealthBenefit[] {
  const benefits = new Set<HealthBenefit>();
  
  ingredients.forEach(ingredient => {
    if (ingredient.healthBenefits) {
      ingredient.healthBenefits.forEach(benefit => benefits.add(benefit));
    }
  });
  
  return Array.from(benefits);
}

/**
 * Create component breakdown by grouping ingredients by category
 */
export function createComponentBreakdown(ingredients: IngredientDetail[]): ComponentBreakdown {
  const breakdown: ComponentBreakdown = {};
  
  // Group all ingredients by their category
  const grouped: Record<string, string[]> = {};
  
  ingredients.forEach(ingredient => {
    const category = ingredient.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(ingredient.name);
  });
  
  // Map to breakdown structure, prioritizing main food groups
  if (grouped.proteins) breakdown.proteins = grouped.proteins;
  if (grouped.vegetables) breakdown.vegetables = grouped.vegetables;
  if (grouped.grains) breakdown.grains = grouped.grains;
  if (grouped.fruits) breakdown.fruits = grouped.fruits;
  if (grouped.dairy) breakdown.dairy = grouped.dairy;
  
  // Combine less common categories into "other"
  const otherCategories: string[] = [];
  ['oils', 'nuts-seeds', 'beverages', 'spices', 'sweeteners'].forEach(cat => {
    if (grouped[cat]) {
      otherCategories.push(...grouped[cat]);
    }
  });
  
  if (otherCategories.length > 0) {
    breakdown.other = otherCategories;
  }
  
  return breakdown;
}

/**
 * Generate blood type explanations based on ingredients
 */
function generateBloodTypeExplanations(
  ingredients: IngredientDetail[],
  bloodTypes: BloodType[],
  mealRationale?: string
): Record<BloodType, string> {
  const explanations: Record<BloodType, string> = {} as any;
  
  bloodTypes.forEach(bloodType => {
    const beneficialIngredients = ingredients.filter(ing => 
      ing.bloodTypeStatus && ing.bloodTypeStatus[bloodType] === 'beneficial'
    );
    
    const neutralIngredients = ingredients.filter(ing => 
      ing.bloodTypeStatus && ing.bloodTypeStatus[bloodType] === 'neutral'
    );
    
    const avoidIngredients = ingredients.filter(ing => 
      ing.bloodTypeStatus && ing.bloodTypeStatus[bloodType] === 'avoid'
    );
    
    let explanation = '';
    
    if (beneficialIngredients.length > 0) {
      const names = beneficialIngredients.slice(0, 3).map(i => i.name).join(', ');
      explanation += `This meal includes beneficial foods for Blood Type ${bloodType}: ${names}. `;
    }
    
    if (avoidIngredients.length > 0) {
      const names = avoidIngredients.slice(0, 2).map(i => i.name).join(', ');
      explanation += `Note: Contains ${names} which should be limited for Blood Type ${bloodType}. `;
    } else if (neutralIngredients.length > 0) {
      explanation += `Most ingredients are well-tolerated by Blood Type ${bloodType}. `;
    }
    
    if (mealRationale) {
      explanation += mealRationale;
    }
    
    explanations[bloodType] = explanation.trim() || `This meal is compatible with Blood Type ${bloodType}.`;
  });
  
  return explanations;
}

/**
 * Calculate aggregate nutritional info from ingredients
 */
function calculateNutritionalInfo(ingredients: IngredientDetail[]): {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
} | undefined {
  let hasNutrition = false;
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
  };
  
  ingredients.forEach(ingredient => {
    const foodItem = findFoodItem(ingredient.name);
    if (foodItem?.nutritionalInfo) {
      hasNutrition = true;
      totals.calories += foodItem.nutritionalInfo.calories || 0;
      totals.protein += foodItem.nutritionalInfo.protein || 0;
      totals.carbs += foodItem.nutritionalInfo.carbs || 0;
      totals.fats += foodItem.nutritionalInfo.fats || 0;
      totals.fiber += foodItem.nutritionalInfo.fiber || 0;
    }
  });
  
  // Round all values to 1 decimal place to prevent floating point precision errors
  if (hasNutrition) {
    return {
      calories: Math.round(totals.calories), // Calories are always whole numbers
      protein: roundTo(totals.protein, 1),
      carbs: roundTo(totals.carbs, 1),
      fats: roundTo(totals.fats, 1),
      fiber: roundTo(totals.fiber, 1),
    };
  }
  
  return undefined;
}

/**
 * Main function to enrich a meal with detailed ingredient information
 */
export function enrichMealIngredients(meal: Meal, bloodTypes: BloodType[]): Meal {
  // Map all ingredients to detailed ingredients
  const ingredientDetails = meal.ingredients.map(ing => enrichIngredient(ing, bloodTypes));
  
  // Calculate health benefits from ingredients
  const healthBenefits = getMealHealthBenefits(ingredientDetails);
  
  // Create component breakdown
  const componentBreakdown = createComponentBreakdown(ingredientDetails);
  
  // Generate blood type explanations
  const bloodTypeExplanations = generateBloodTypeExplanations(
    ingredientDetails,
    bloodTypes,
    meal.rationale
  );
  
  // Calculate total time
  const totalTime = meal.prepTime + meal.cookTime;
  
  // Try to calculate nutritional info if not provided
  const nutritionalInfo = meal.nutritionalInfo || calculateNutritionalInfo(ingredientDetails);
  
  return {
    ...meal,
    ingredientDetails,
    healthBenefits,
    componentBreakdown,
    bloodTypeExplanations,
    totalTime,
    nutritionalInfo,
  };
}

/**
 * Enrich multiple meals at once
 */
export function enrichMeals(meals: Meal[], bloodTypes: BloodType[]): Meal[] {
  return meals.map(meal => enrichMealIngredients(meal, bloodTypes));
}

