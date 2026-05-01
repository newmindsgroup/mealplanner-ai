import type { PantryItem, BloodType, ProductInfo } from '../types';
import { getAIService } from './aiService';
import { getFoodsToAvoid, getRecommendedFoods } from '../utils/bloodTypeUtils';

/**
 * Enrich pantry item with AI-generated information
 */
export async function enrichPantryItem(item: PantryItem, bloodTypes?: BloodType[]): Promise<PantryItem> {
  const aiService = getAIService();
  
  if (!aiService) {
    return item;
  }

  try {
    // Build enrichment prompt
    const prompt = `Provide detailed information about this food item: "${item.name}"

Return a JSON object with:
{
  "nutritionalInfo": {
    "servingSize": "typical serving size",
    "calories": number,
    "protein": number (grams),
    "carbs": number (grams),
    "fats": number (grams),
    "fiber": number (grams)
  },
  "healthBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "storageip": "best practice for storing this item",
  "usageSuggestions": ["recipe idea 1", "recipe idea 2"]
}

Provide realistic, accurate nutritional values per typical serving.`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a nutritional expert providing accurate food information. Always return valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.3,
      maxTokens: 500,
    });

    // Parse response
    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const enrichmentData = JSON.parse(jsonString);

    // Update item with enriched data
    const enrichedItem: PantryItem = {
      ...item,
      nutritionalInfo: enrichmentData.nutritionalInfo || item.nutritionalInfo,
      aiSuggestions: [
        ...(enrichmentData.usageSuggestions || []),
        enrichmentData.storageTip,
      ].filter(Boolean),
      tags: [...(item.tags || []), ...(enrichmentData.healthBenefits || [])],
      updatedAt: new Date().toISOString(),
    };

    // Add blood type compatibility if blood types provided
    if (bloodTypes && bloodTypes.length > 0) {
      enrichedItem.bloodTypeCompatibility = await checkBloodTypeCompatibility(
        item.name,
        bloodTypes
      );
    }

    return enrichedItem;
  } catch (error) {
    console.error('Item enrichment error:', error);
    return item;
  }
}

/**
 * Check blood type compatibility for a food item
 */
export async function checkBloodTypeCompatibility(
  foodName: string,
  bloodTypes: BloodType[]
): Promise<{ [key in BloodType]?: 'beneficial' | 'neutral' | 'avoid' }> {
  const compatibility: { [key in BloodType]?: 'beneficial' | 'neutral' | 'avoid' } = {};

  // First check our blood type database
  bloodTypes.forEach(bloodType => {
    const recommended = getRecommendedFoods(bloodType);
    const avoid = getFoodsToAvoid(bloodType);

    const foodLower = foodName.toLowerCase();
    
    if (recommended.some(food => foodLower.includes(food.toLowerCase()))) {
      compatibility[bloodType] = 'beneficial';
    } else if (avoid.some(food => foodLower.includes(food.toLowerCase()))) {
      compatibility[bloodType] = 'avoid';
    } else {
      compatibility[bloodType] = 'neutral';
    }
  });

  // If we have AI, get more detailed analysis
  const aiService = getAIService();
  if (aiService) {
    try {
      const bloodTypesStr = bloodTypes.join(', ');
      const response = await aiService.chat([
        {
          role: 'system',
          content: `You are a blood type diet expert. Classify foods as beneficial, neutral, or avoid for specific blood types.
Respond with ONLY a JSON object mapping blood types to classifications.`,
        },
        {
          role: 'user',
          content: `For the food "${foodName}", what is the blood type compatibility for: ${bloodTypesStr}?

Return JSON format:
{
  "O+": "beneficial|neutral|avoid",
  "A+": "beneficial|neutral|avoid",
  ...
}`,
        },
      ], {
        temperature: 0.2,
        maxTokens: 200,
      });

      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const aiCompatibility = JSON.parse(jsonString);
      
      // Merge AI results with our database results (prefer our database for safety)
      bloodTypes.forEach(bloodType => {
        if (aiCompatibility[bloodType] && compatibility[bloodType] === 'neutral') {
          compatibility[bloodType] = aiCompatibility[bloodType];
        }
      });
    } catch (error) {
      console.error('AI blood type compatibility error:', error);
    }
  }

  return compatibility;
}

/**
 * Generate related product suggestions
 */
export async function generateRelatedProducts(
  item: PantryItem,
  pantryItems: PantryItem[]
): Promise<string[]> {
  const aiService = getAIService();
  
  if (!aiService) {
    return [];
  }

  try {
    const currentCategories = [...new Set(pantryItems.map(i => i.category))];
    
    const prompt = `Based on having "${item.name}" (${item.category}) in the pantry, suggest 5 complementary food items that would pair well for cooking.

Consider:
- Items that commonly go together in recipes
- Nutritional balance
- Variety in food categories

Current pantry categories: ${currentCategories.join(', ')}

Return a JSON array of item names: ["item 1", "item 2", "item 3", "item 4", "item 5"]`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a culinary expert suggesting complementary ingredients.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.7,
      maxTokens: 200,
    });

    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const suggestions = JSON.parse(jsonString);
    return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
  } catch (error) {
    console.error('Related products error:', error);
    return [];
  }
}

/**
 * Analyze pantry and suggest missing essentials
 */
export async function suggestMissingEssentials(pantryItems: PantryItem[]): Promise<string[]> {
  const aiService = getAIService();
  
  if (!aiService) {
    return getBasicEssentials(pantryItems);
  }

  try {
    const itemNames = pantryItems.map(i => i.name).join(', ');
    const categories = [...new Set(pantryItems.map(i => i.category))];

    const prompt = `Analyze this pantry inventory and suggest 5-7 essential items that are missing for a well-stocked kitchen:

Current items: ${itemNames}
Categories represented: ${categories.join(', ')}

Consider:
- Basic cooking essentials (oils, spices, etc.)
- Protein variety
- Fresh produce needs
- Pantry staples

Return a JSON array of suggested items: ["essential 1", "essential 2", ...]`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a culinary advisor helping stock a well-rounded pantry.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.6,
      maxTokens: 300,
    });

    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const suggestions = JSON.parse(jsonString);
    return Array.isArray(suggestions) ? suggestions : getBasicEssentials(pantryItems);
  } catch (error) {
    console.error('Missing essentials error:', error);
    return getBasicEssentials(pantryItems);
  }
}

/**
 * Fallback essentials based on simple rules
 */
function getBasicEssentials(pantryItems: PantryItem[]): string[] {
  const essentials = [
    'olive oil',
    'salt',
    'black pepper',
    'garlic',
    'onions',
    'eggs',
    'rice',
    'pasta',
    'canned tomatoes',
    'chicken breast',
  ];

  const itemNames = pantryItems.map(i => i.name.toLowerCase());
  
  return essentials.filter(
    essential => !itemNames.some(name => name.includes(essential))
  ).slice(0, 7);
}

/**
 * Batch enrich multiple items
 */
export async function batchEnrichItems(
  items: PantryItem[],
  bloodTypes?: BloodType[]
): Promise<PantryItem[]> {
  const enrichedItems: PantryItem[] = [];

  // Process in batches of 3 to avoid rate limiting
  for (let i = 0; i < items.length; i += 3) {
    const batch = items.slice(i, i + 3);
    const enrichedBatch = await Promise.all(
      batch.map(item => enrichPantryItem(item, bloodTypes))
    );
    enrichedItems.push(...enrichedBatch);
    
    // Small delay between batches
    if (i + 3 < items.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return enrichedItems;
}

/**
 * Extract nutritional info from product info
 */
export function extractNutritionalInfo(productInfo: ProductInfo): PantryItem['nutritionalInfo'] {
  if (!productInfo.nutritionalInfo) {
    return undefined;
  }

  return {
    servingSize: productInfo.nutritionalInfo.servingSize,
    calories: productInfo.nutritionalInfo.calories,
    protein: productInfo.nutritionalInfo.protein,
    carbs: productInfo.nutritionalInfo.carbs,
    fats: productInfo.nutritionalInfo.fats,
    fiber: productInfo.nutritionalInfo.fiber,
    sodium: productInfo.nutritionalInfo.sodium,
    sugar: productInfo.nutritionalInfo.sugar,
  };
}

/**
 * Enrich product information from photo using AI
 */
export async function enrichFromPhoto(imageDataUrl: string): Promise<Partial<PantryItem> | null> {
  const aiService = getAIService();
  
  if (!aiService) {
    return null;
  }

  try {
    const prompt = `Analyze this food product image and extract all visible information.

Look for:
1. Product name and brand
2. Quantity and unit (e.g., "16 oz", "500g")
3. Expiration/best-by dates (format as YYYY-MM-DD)
4. Purchase date if visible on receipt
5. Barcode/UPC number if visible
6. Allergen information or symbols
7. Ingredients list if visible
8. Nutritional facts panel (serving size, calories, protein, carbs, fats, fiber, sodium, sugar)
9. Storage location recommendation (pantry, refrigerator, freezer)
10. Supplier/store name if visible

Return a JSON object:
{
  "name": "Product name",
  "brand": "Brand name",
  "category": "proteins|vegetables|fruits|grains|dairy|oils|nuts-seeds|beverages|spices|sweeteners",
  "quantity": number,
  "unit": "count|g|kg|oz|lb|ml|l|cup|tbsp|tsp|can|box|bag|bottle|jar|package",
  "location": "pantry|refrigerator|freezer",
  "expirationDate": "YYYY-MM-DD",
  "purchaseDate": "YYYY-MM-DD",
  "barcode": "barcode if visible",
  "supplier": "store name",
  "allergens": ["allergen1", "allergen2"],
  "ingredients": ["ingredient1", "ingredient2"],
  "nutritionalInfo": {
    "servingSize": "serving size",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "fiber": number,
    "sodium": number,
    "sugar": number
  },
  "confidence": 0-100
}

Only include fields you can detect with high confidence. Set confidence based on image quality and visibility.`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are an expert at analyzing food product labels and packaging. Extract all visible information accurately.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.2,
      maxTokens: 800,
    });

    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const enrichedData = JSON.parse(jsonString);
    
    // Convert to PantryItem partial
    const partial: Partial<PantryItem> = {
      name: enrichedData.name,
      brand: enrichedData.brand,
      category: enrichedData.category,
      quantity: enrichedData.quantity,
      unit: enrichedData.unit,
      location: enrichedData.location || 'pantry',
      expirationDate: enrichedData.expirationDate,
      purchaseDate: enrichedData.purchaseDate,
      barcode: enrichedData.barcode,
      supplier: enrichedData.supplier,
      allergens: enrichedData.allergens,
      ingredients: enrichedData.ingredients,
      nutritionalInfo: enrichedData.nutritionalInfo,
    };

    // Remove undefined values
    Object.keys(partial).forEach(key => {
      if (partial[key as keyof typeof partial] === undefined) {
        delete partial[key as keyof typeof partial];
      }
    });

    return partial;
  } catch (error) {
    console.error('Photo enrichment error:', error);
    return null;
  }
}

/**
 * Detect and parse allergen information from text or image
 */
export async function detectAllergens(text: string): Promise<string[]> {
  const commonAllergens = [
    'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts',
    'wheat', 'soybeans', 'sesame', 'soy', 'dairy', 'gluten',
  ];

  const detectedAllergens: string[] = [];
  const lowerText = text.toLowerCase();

  // Simple keyword detection
  commonAllergens.forEach(allergen => {
    if (lowerText.includes(allergen) || lowerText.includes(`contains ${allergen}`)) {
      detectedAllergens.push(allergen);
    }
  });

  // Use AI for more sophisticated detection
  const aiService = getAIService();
  if (aiService && text.length > 20) {
    try {
      const response = await aiService.chat([
        {
          role: 'system',
          content: 'You are an allergen detection expert. Extract all allergen information from product text.',
        },
        {
          role: 'user',
          content: `Extract all allergens mentioned in this text: "${text}"\n\nReturn a JSON array: ["allergen1", "allergen2"]`,
        },
      ], {
        temperature: 0.1,
        maxTokens: 150,
      });

      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const aiAllergens = JSON.parse(jsonString);
      if (Array.isArray(aiAllergens)) {
        aiAllergens.forEach(allergen => {
          if (!detectedAllergens.includes(allergen.toLowerCase())) {
            detectedAllergens.push(allergen.toLowerCase());
          }
        });
      }
    } catch (error) {
      console.error('AI allergen detection error:', error);
    }
  }

  return detectedAllergens;
}

/**
 * Parse ingredients list from text
 */
export function parseIngredientsList(text: string): string[] {
  // Remove common prefix text
  let ingredientsText = text
    .replace(/ingredients?:?/i, '')
    .replace(/contains?:?/i, '')
    .trim();

  // Split by common separators
  const ingredients = ingredientsText
    .split(/[,،]/) // Regular comma and Arabic comma
    .map(ing => ing.trim())
    .filter(ing => ing.length > 0 && ing.length < 50); // Filter out very long entries

  return ingredients;
}

/**
 * Suggest custom fields based on product type and category
 */
export async function suggestCustomFields(
  name: string,
  category: string
): Promise<Array<{ key: string; label: string; type: 'text' | 'number' | 'date' | 'boolean'; placeholder?: string }>> {
  const aiService = getAIService();
  
  if (!aiService) {
    return getDefaultCustomFieldsForCategory(category);
  }

  try {
    const prompt = `For a product named "${name}" in the ${category} category, suggest 3-5 useful custom fields to track.

Examples:
- For supplements: Dosage, Frequency, Active Ingredient
- For beverages: Caffeine Content, Flavor, Carbonated
- For proteins: Cut Type, Grade, Grass-Fed

Return JSON array:
[
  {
    "key": "dosage",
    "label": "Dosage",
    "type": "text",
    "placeholder": "e.g., 500mg"
  }
]`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a product data specialist. Suggest relevant custom fields for tracking inventory.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.4,
      maxTokens: 300,
    });

    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const suggestions = JSON.parse(jsonString);
    return Array.isArray(suggestions) ? suggestions.slice(0, 5) : getDefaultCustomFieldsForCategory(category);
  } catch (error) {
    console.error('Custom field suggestion error:', error);
    return getDefaultCustomFieldsForCategory(category);
  }
}

/**
 * Get default custom fields based on category
 */
function getDefaultCustomFieldsForCategory(
  category: string
): Array<{ key: string; label: string; type: 'text' | 'number' | 'date' | 'boolean'; placeholder?: string }> {
  const fieldsByCategory: Record<string, any[]> = {
    proteins: [
      { key: 'cutType', label: 'Cut Type', type: 'text', placeholder: 'e.g., Boneless, Ribeye' },
      { key: 'grassFed', label: 'Grass Fed', type: 'boolean' },
      { key: 'organic', label: 'Organic', type: 'boolean' },
    ],
    dairy: [
      { key: 'fatContent', label: 'Fat Content', type: 'text', placeholder: 'e.g., Whole, 2%, Skim' },
      { key: 'lactoseFree', label: 'Lactose Free', type: 'boolean' },
      { key: 'organic', label: 'Organic', type: 'boolean' },
    ],
    beverages: [
      { key: 'caffeineContent', label: 'Caffeine Content', type: 'number', placeholder: 'mg' },
      { key: 'flavor', label: 'Flavor', type: 'text' },
      { key: 'carbonated', label: 'Carbonated', type: 'boolean' },
    ],
    spices: [
      { key: 'heatLevel', label: 'Heat Level', type: 'text', placeholder: 'e.g., Mild, Medium, Hot' },
      { key: 'ground', label: 'Ground', type: 'boolean' },
      { key: 'organic', label: 'Organic', type: 'boolean' },
    ],
  };

  return fieldsByCategory[category] || [
    { key: 'organic', label: 'Organic', type: 'boolean' },
    { key: 'variety', label: 'Variety', type: 'text' },
  ];
}

