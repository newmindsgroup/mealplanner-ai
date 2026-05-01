import type { PantryItem, Meal, BloodType, PantryMealSuggestion } from '../types';
import { getAIService } from './aiService';
import { getRecommendedFoods, getFoodsToAvoid } from '../utils/bloodTypeUtils';

/**
 * Generate recipe suggestions based on available pantry items
 */
export async function generateRecipesFromPantry(
  pantryItems: PantryItem[],
  bloodTypes: BloodType[],
  options?: {
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    useExpiringFirst?: boolean;
    maxRecipes?: number;
  }
): Promise<PantryMealSuggestion[]> {
  const aiService = getAIService();
  
  if (!aiService || pantryItems.length === 0) {
    return [];
  }

  // Sort items - prioritize expiring items if requested
  let availableItems = [...pantryItems];
  if (options?.useExpiringFirst) {
    availableItems = availableItems.sort((a, b) => {
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });
  }

  const itemsList = availableItems
    .map(item => `${item.name} (${item.quantity} ${item.unit})`)
    .join(', ');

  const bloodTypeStr = bloodTypes.join(', ');
  const mealTypeFilter = options?.mealType ? `${options.mealType}` : 'any meal type';

  try {
    const prompt = `Create ${options?.maxRecipes || 3} creative recipe suggestions using these available pantry items:

Available: ${itemsList}

Requirements:
- Blood type compatibility: ${bloodTypeStr}
- Meal type: ${mealTypeFilter}
- Use items that are expiring soon when possible
- Each recipe should use at least 3-4 of the available items
- Provide realistic serving sizes
- Include detailed nutritional estimates

Return a JSON array with this structure:
[
  {
    "mealName": "Recipe name",
    "mealType": "breakfast|lunch|dinner|snack",
    "canMakeNow": true,
    "matchScore": 85,
    "availableIngredients": [
      {"itemName": "name", "quantityNeeded": 1, "quantityAvailable": 2, "unit": "count"}
    ],
    "missingIngredients": [
      {"name": "optional ingredient", "quantityNeeded": 1, "unit": "count", "suggestedSubstitutes": ["alt1", "alt2"]}
    ],
    "recipe": {
      "description": "Brief appetizing description",
      "instructions": ["step 1", "step 2", ...],
      "prepTime": 10,
      "cookTime": 20
    },
    "nutritionalInfo": {
      "calories": 450,
      "protein": 25,
      "carbs": 45,
      "fats": 15
    },
    "usesByDateItems": ["item1", "item2"]
  }
]`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: `You are a creative chef who specializes in creating delicious recipes from available ingredients. 
You understand blood type diet principles and create nutritionally balanced meals. Always return valid JSON.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.8,
      maxTokens: 3000,
    });

    // Parse response
    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const recipes = JSON.parse(jsonString);
    
    // Convert to PantryMealSuggestion format
    return recipes.map((recipe: any) => ({
      id: crypto.randomUUID(),
      mealName: recipe.mealName,
      mealType: recipe.mealType,
      canMakeNow: recipe.canMakeNow,
      matchScore: recipe.matchScore,
      availableIngredients: recipe.availableIngredients.map((ing: any) => ({
        pantryItemId: findPantryItemId(pantryItems, ing.itemName),
        name: ing.itemName,
        quantityNeeded: ing.quantityNeeded,
        quantityAvailable: ing.quantityAvailable,
      })),
      missingIngredients: recipe.missingIngredients || [],
      recipe: recipe.recipe,
      nutritionalInfo: recipe.nutritionalInfo,
      bloodTypeCompatible: bloodTypes,
      usesByDateItems: recipe.usesByDateItems || [],
      aiGenerated: true,
      createdAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Recipe generation error:', error);
    return [];
  }
}

/**
 * Check if a meal can be made with current pantry items
 */
export function checkMealIngredientAvailability(
  meal: Meal,
  pantryItems: PantryItem[]
): {
  canMake: boolean;
  matchPercentage: number;
  availableIngredients: string[];
  missingIngredients: string[];
  substitutionSuggestions: Array<{ missing: string; available: string[] }>;
} {
  const availableItems = pantryItems
    .filter(item => item.quantity > 0)
    .map(item => item.name.toLowerCase());

  const mealIngredients = meal.ingredients.map(ing => 
    extractIngredientName(ing).toLowerCase()
  );

  const available: string[] = [];
  const missing: string[] = [];

  mealIngredients.forEach(ingredient => {
    const found = availableItems.some(item => 
      item.includes(ingredient) || ingredient.includes(item)
    );
    
    if (found) {
      available.push(ingredient);
    } else {
      missing.push(ingredient);
    }
  });

  const matchPercentage = mealIngredients.length > 0
    ? Math.round((available.length / mealIngredients.length) * 100)
    : 0;

  const canMake = matchPercentage >= 80; // Can make if 80%+ ingredients available

  // Generate substitution suggestions
  const substitutions = missing.map(missingIng => ({
    missing: missingIng,
    available: findSubstitutes(missingIng, pantryItems),
  })).filter(sub => sub.available.length > 0);

  return {
    canMake,
    matchPercentage,
    availableIngredients: available,
    missingIngredients: missing,
    substitutionSuggestions: substitutions,
  };
}

/**
 * Extract ingredient name from full ingredient string
 */
function extractIngredientName(ingredient: string): string {
  // Remove quantities, measurements, and common descriptors
  return ingredient
    .replace(/^\d+(\.\d+)?\s*(cup|tbsp|tsp|oz|lb|g|kg|ml|l)s?\s*/i, '')
    .replace(/^(fresh|frozen|canned|dried|chopped|diced|sliced|minced)\s+/i, '')
    .trim()
    .split(',')[0]
    .split('(')[0]
    .trim();
}

/**
 * Find pantry item ID by name
 */
function findPantryItemId(pantryItems: PantryItem[], itemName: string): string {
  const item = pantryItems.find(i => 
    i.name.toLowerCase() === itemName.toLowerCase() ||
    i.name.toLowerCase().includes(itemName.toLowerCase()) ||
    itemName.toLowerCase().includes(i.name.toLowerCase())
  );
  return item?.id || '';
}

/**
 * Find possible substitutes from pantry
 */
function findSubstitutes(missingIngredient: string, pantryItems: PantryItem[]): string[] {
  const substitutionMap: { [key: string]: string[] } = {
    // Proteins
    'chicken': ['turkey', 'tofu', 'tempeh'],
    'beef': ['lamb', 'pork', 'turkey'],
    'fish': ['salmon', 'tuna', 'cod', 'tofu'],
    
    // Vegetables
    'spinach': ['kale', 'chard', 'lettuce'],
    'broccoli': ['cauliflower', 'brussels sprouts', 'asparagus'],
    'carrots': ['sweet potato', 'butternut squash'],
    
    // Grains
    'rice': ['quinoa', 'couscous', 'pasta'],
    'pasta': ['rice', 'quinoa', 'zucchini noodles'],
    'bread': ['tortillas', 'pita', 'crackers'],
    
    // Dairy
    'milk': ['almond milk', 'oat milk', 'coconut milk'],
    'cheese': ['nutritional yeast', 'tofu'],
    'yogurt': ['sour cream', 'buttermilk'],
    
    // Others
    'lemon': ['lime', 'vinegar'],
    'butter': ['olive oil', 'coconut oil'],
    'soy sauce': ['tamari', 'coconut aminos'],
  };

  const missing = missingIngredient.toLowerCase();
  const possibleSubs = substitutionMap[missing] || [];
  
  return possibleSubs.filter(sub =>
    pantryItems.some(item => 
      item.name.toLowerCase().includes(sub) && item.quantity > 0
    )
  );
}

/**
 * Filter meals by pantry availability
 */
export function filterMealsByAvailability(
  meals: Meal[],
  pantryItems: PantryItem[],
  minMatchPercentage: number = 80
): Array<Meal & { matchPercentage: number; canMake: boolean }> {
  return meals
    .map(meal => {
      const availability = checkMealIngredientAvailability(meal, pantryItems);
      return {
        ...meal,
        matchPercentage: availability.matchPercentage,
        canMake: availability.canMake,
      };
    })
    .filter(meal => meal.matchPercentage >= minMatchPercentage)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * Suggest AI-powered ingredient substitutions
 */
export async function suggestSmartSubstitutions(
  missingIngredient: string,
  availablePantryItems: PantryItem[],
  bloodTypes: BloodType[]
): Promise<string[]> {
  const aiService = getAIService();
  
  if (!aiService) {
    return findSubstitutes(missingIngredient, availablePantryItems);
  }

  try {
    const availableList = availablePantryItems
      .filter(item => item.quantity > 0)
      .map(item => item.name)
      .join(', ');

    const prompt = `Suggest 3-5 smart ingredient substitutions for "${missingIngredient}" using only these available items:

Available: ${availableList}

Consider:
- Blood type compatibility: ${bloodTypes.join(', ')}
- Culinary compatibility and taste
- Nutritional similarity
- Cooking properties

Return a JSON array of substitute names: ["substitute1", "substitute2", ...]
If no good substitutes available, return empty array.`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a culinary expert providing smart ingredient substitutions based on what is available.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.6,
      maxTokens: 200,
    });

    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const substitutes = JSON.parse(jsonString);
    return Array.isArray(substitutes) ? substitutes : [];
  } catch (error) {
    console.error('Substitution suggestion error:', error);
    return findSubstitutes(missingIngredient, availablePantryItems);
  }
}

