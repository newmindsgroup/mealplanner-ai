import type { PantryItem, QuantityUnit, StorageLocation, FoodCategory, ProductInfo, CustomField, CustomFieldType } from '../types';
import { getAIService } from './aiService';

/**
 * Create a new pantry item from product info
 */
export function createPantryItemFromProduct(
  productInfo: ProductInfo,
  quantity: number = 1,
  unit: QuantityUnit = 'count'
): PantryItem {
  const now = new Date().toISOString();
  
  // Calculate expiration date if shelf life is provided
  let expirationDate: string | undefined;
  if (productInfo.shelfLife) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + productInfo.shelfLife);
    expirationDate = expDate.toISOString().split('T')[0];
  }

  return {
    id: crypto.randomUUID(),
    name: productInfo.name,
    category: productInfo.category || 'proteins',
    quantity,
    unit,
    location: productInfo.storageLocation || 'pantry',
    barcode: undefined,
    brand: productInfo.brand,
    imageUrl: productInfo.imageUrl,
    expirationDate,
    lowStockThreshold: getDefaultThreshold(unit),
    nutritionalInfo: productInfo.nutritionalInfo,
    addedAt: now,
    updatedAt: now,
  };
}

/**
 * Create a pantry item manually
 */
export function createPantryItem(
  name: string,
  category: FoodCategory,
  quantity: number,
  unit: QuantityUnit,
  options?: {
    location?: StorageLocation;
    expirationDate?: string;
    lowStockThreshold?: number;
    brand?: string;
    barcode?: string;
    price?: number;
    notes?: string;
  }
): PantryItem {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name,
    category,
    quantity,
    unit,
    location: options?.location || 'pantry',
    brand: options?.brand,
    barcode: options?.barcode,
    expirationDate: options?.expirationDate,
    lowStockThreshold: options?.lowStockThreshold || getDefaultThreshold(unit),
    price: options?.price,
    notes: options?.notes,
    addedAt: now,
    updatedAt: now,
  };
}

/**
 * Get default low stock threshold based on unit type
 */
function getDefaultThreshold(unit: QuantityUnit): number {
  switch (unit) {
    case 'count':
      return 1;
    case 'g':
    case 'oz':
      return 100;
    case 'kg':
    case 'lb':
      return 0.5;
    case 'ml':
    case 'cup':
      return 100;
    case 'l':
      return 0.25;
    case 'tbsp':
    case 'tsp':
      return 5;
    case 'can':
    case 'box':
    case 'bag':
    case 'bottle':
    case 'jar':
    case 'package':
      return 1;
    default:
      return 1;
  }
}

/**
 * AI-powered category detection
 */
export async function detectCategory(itemName: string): Promise<FoodCategory> {
  const aiService = getAIService();
  
  if (!aiService) {
    return guessCategory(itemName);
  }

  try {
    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You categorize food items. Respond with ONLY one word: proteins, vegetables, fruits, grains, dairy, oils, nuts-seeds, beverages, spices, or sweeteners.',
      },
      {
        role: 'user',
        content: `Categorize this food item: "${itemName}"`,
      },
    ], {
      temperature: 0.1,
      maxTokens: 10,
    });

    const category = response.trim().toLowerCase();
    
    const validCategories: FoodCategory[] = [
      'proteins', 'vegetables', 'fruits', 'grains', 'dairy', 
      'oils', 'nuts-seeds', 'beverages', 'spices', 'sweeteners'
    ];

    if (validCategories.includes(category as FoodCategory)) {
      return category as FoodCategory;
    }

    return guessCategory(itemName);
  } catch (error) {
    console.error('AI category detection error:', error);
    return guessCategory(itemName);
  }
}

/**
 * Fallback category guessing based on keywords
 */
function guessCategory(itemName: string): FoodCategory {
  const name = itemName.toLowerCase();

  // Proteins
  if (/(chicken|beef|pork|fish|salmon|tuna|turkey|lamb|egg|tofu|tempeh|meat|protein)/i.test(name)) {
    return 'proteins';
  }

  // Vegetables
  if (/(broccoli|carrot|spinach|lettuce|tomato|potato|onion|garlic|pepper|cucumber|celery|kale|vegetable)/i.test(name)) {
    return 'vegetables';
  }

  // Fruits
  if (/(apple|banana|orange|grape|berry|strawberry|melon|peach|pear|plum|fruit|mango|pineapple)/i.test(name)) {
    return 'fruits';
  }

  // Grains
  if (/(rice|pasta|bread|cereal|oat|quinoa|wheat|flour|grain|barley)/i.test(name)) {
    return 'grains';
  }

  // Dairy
  if (/(milk|cheese|yogurt|butter|cream|dairy)/i.test(name)) {
    return 'dairy';
  }

  // Oils
  if (/(oil|olive|coconut|avocado|vegetable oil)/i.test(name)) {
    return 'oils';
  }

  // Nuts & Seeds
  if (/(almond|walnut|peanut|cashew|nut|seed|sunflower|pumpkin)/i.test(name)) {
    return 'nuts-seeds';
  }

  // Beverages
  if (/(water|juice|soda|coffee|tea|beverage|drink|wine|beer)/i.test(name)) {
    return 'beverages';
  }

  // Spices
  if (/(spice|pepper|salt|cinnamon|paprika|cumin|garlic powder|herb|basil|oregano)/i.test(name)) {
    return 'spices';
  }

  // Sweeteners
  if (/(sugar|honey|syrup|sweetener|stevia|agave)/i.test(name)) {
    return 'sweeteners';
  }

  // Default to proteins
  return 'proteins';
}

/**
 * AI-powered expiration date prediction
 */
export async function predictExpirationDate(
  itemName: string,
  category: FoodCategory,
  location: StorageLocation,
  purchaseDate?: string
): Promise<string | undefined> {
  const aiService = getAIService();
  const purchase = purchaseDate ? new Date(purchaseDate) : new Date();

  if (!aiService) {
    // Fallback to simple rules
    return estimateExpirationFallback(category, location, purchase);
  }

  try {
    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a food storage expert. Provide the estimated shelf life in days for food items based on storage conditions. Respond with ONLY a number.',
      },
      {
        role: 'user',
        content: `How many days will "${itemName}" (category: ${category}) last when stored in ${location}? Respond with only the number of days.`,
      },
    ], {
      temperature: 0.3,
      maxTokens: 10,
    });

    const days = parseInt(response.trim());
    
    if (isNaN(days) || days <= 0) {
      return estimateExpirationFallback(category, location, purchase);
    }

    const expirationDate = new Date(purchase);
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('AI expiration prediction error:', error);
    return estimateExpirationFallback(category, location, purchase);
  }
}

/**
 * Fallback expiration estimation
 */
function estimateExpirationFallback(
  category: FoodCategory,
  location: StorageLocation,
  purchaseDate: Date
): string {
  let daysToAdd = 7; // default: 1 week

  // Adjust based on category
  switch (category) {
    case 'proteins':
      daysToAdd = location === 'freezer' ? 180 : location === 'refrigerator' ? 3 : 730;
      break;
    case 'vegetables':
      daysToAdd = location === 'freezer' ? 180 : location === 'refrigerator' ? 7 : 3;
      break;
    case 'fruits':
      daysToAdd = location === 'freezer' ? 180 : location === 'refrigerator' ? 7 : 5;
      break;
    case 'grains':
      daysToAdd = 365;
      break;
    case 'dairy':
      daysToAdd = location === 'freezer' ? 90 : 14;
      break;
    case 'oils':
      daysToAdd = 365;
      break;
    case 'nuts-seeds':
      daysToAdd = location === 'freezer' ? 365 : 180;
      break;
    case 'beverages':
      daysToAdd = 365;
      break;
    case 'spices':
      daysToAdd = 730;
      break;
    case 'sweeteners':
      daysToAdd = 730;
      break;
  }

  const expirationDate = new Date(purchaseDate);
  expirationDate.setDate(expirationDate.getDate() + daysToAdd);
  return expirationDate.toISOString().split('T')[0];
}

/**
 * Generate AI suggestions for a pantry item
 */
export async function generateItemSuggestions(item: PantryItem): Promise<string[]> {
  const aiService = getAIService();
  
  if (!aiService) {
    return [];
  }

  try {
    const isLowStock = item.quantity <= item.lowStockThreshold;
    const isExpiring = item.expirationDate && 
      new Date(item.expirationDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    const prompt = `Provide 2-3 brief, actionable suggestions for managing this pantry item:
    
Item: ${item.name}
Category: ${item.category}
Quantity: ${item.quantity} ${item.unit}
Storage: ${item.location}
${isLowStock ? 'Status: LOW STOCK' : ''}
${isExpiring ? `Expires: ${item.expirationDate}` : ''}

Suggestions should be practical and helpful. Examples:
- Recipe ideas to use this ingredient
- Storage tips to extend shelf life
- Pairing suggestions with other ingredients
- Health benefits or nutritional tips

Return as a JSON array of strings: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a helpful pantry management assistant providing practical food storage and usage suggestions.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.7,
      maxTokens: 300,
    });

    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const suggestions = JSON.parse(jsonString);
    return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
  } catch (error) {
    console.error('AI suggestions error:', error);
    return [];
  }
}

/**
 * Bulk import pantry items from CSV
 */
export function parsePantryCSV(csvContent: string): Partial<PantryItem>[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return [];
  }

  // Expected headers: name, category, quantity, unit, location, expirationDate, brand, barcode
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const items: Partial<PantryItem>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const item: Partial<PantryItem> = {};

    headers.forEach((header, index) => {
      const value = values[index];
      if (!value) return;

      switch (header) {
        case 'name':
          item.name = value;
          break;
        case 'category':
          item.category = value as FoodCategory;
          break;
        case 'quantity':
          item.quantity = parseFloat(value);
          break;
        case 'unit':
          item.unit = value as QuantityUnit;
          break;
        case 'location':
          item.location = value as StorageLocation;
          break;
        case 'expirationdate':
        case 'expiration_date':
        case 'expiration':
          item.expirationDate = value;
          break;
        case 'brand':
          item.brand = value;
          break;
        case 'barcode':
          item.barcode = value;
          break;
        case 'lowstockthreshold':
        case 'low_stock_threshold':
        case 'threshold':
          item.lowStockThreshold = parseFloat(value);
          break;
        case 'price':
          item.price = parseFloat(value);
          break;
      }
    });

    if (item.name && item.category && item.quantity && item.unit) {
      items.push(item);
    }
  }

  return items;
}

/**
 * Export pantry items to CSV
 */
export function exportPantryToCSV(items: PantryItem[]): string {
  const headers = [
    'name', 'category', 'quantity', 'unit', 'location', 
    'expirationDate', 'brand', 'barcode', 'lowStockThreshold', 'price'
  ];

  const rows = items.map(item => [
    item.name,
    item.category,
    item.quantity,
    item.unit,
    item.location,
    item.expirationDate || '',
    item.brand || '',
    item.barcode || '',
    item.lowStockThreshold,
    item.price || '',
  ].map(value => `"${value}"`).join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Create a pantry item with custom fields
 */
export function createPantryItemWithCustomFields(
  baseItem: Omit<PantryItem, 'id' | 'addedAt' | 'updatedAt'>,
  customFields: CustomField[] = []
): PantryItem {
  const now = new Date().toISOString();

  return {
    ...baseItem,
    id: crypto.randomUUID(),
    customFields,
    addedAt: now,
    updatedAt: now,
  };
}

/**
 * Enrich pantry item from barcode - fetch detailed product information
 * This uses AI to try to identify the product from the barcode
 */
export async function enrichItemFromBarcode(barcode: string): Promise<Partial<PantryItem>> {
  const aiService = getAIService();
  
  if (!aiService) {
    return { barcode };
  }

  try {
    // Use AI to try to identify product from barcode
    // In a real implementation, this would query a product database API (e.g., Open Food Facts, UPC Database)
    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a product identification assistant. Given a barcode, try to identify common product information. If you cannot identify the product, return minimal information. Always return valid JSON.',
      },
      {
        role: 'user',
        content: `Identify this product barcode: ${barcode}. Return a JSON object with: name, brand, category, allergens (array), ingredients (array), and nutritional info (calories, protein, carbs, fats). If unsure, omit fields.`,
      },
    ], {
      temperature: 0.3,
      maxTokens: 500,
    });

    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const productData = JSON.parse(jsonString);
    
    return {
      barcode,
      name: productData.name,
      category: productData.category || 'other',
      brand: productData.brand,
      allergens: productData.allergens,
      ingredients: productData.ingredients,
      nutritionalInfo: productData.nutritionalInfo,
      quantity: 1,
      unit: 'count',
      location: 'pantry',
      lowStockThreshold: 1,
    };
  } catch (error) {
    console.error('Error enriching item from barcode:', error);
    return { barcode };
  }
}

/**
 * AI-powered custom field suggestions based on product name and category
 */
export async function suggestCustomFields(
  productName: string,
  category: FoodCategory
): Promise<CustomField[]> {
  const aiService = getAIService();
  
  if (!aiService) {
    return [];
  }

  try {
    const prompt = `For a "${productName}" in the "${category}" category, suggest 2-4 relevant custom fields that would be useful to track.
    
Consider fields like:
- For supplements: Dosage, Frequency, Active Ingredients, Certification
- For produce: Organic Status, Farm/Origin, Ripeness Level
- For packaged foods: Serving Size, Servings Per Container, Diet Compatibility
- For beverages: Caffeine Content, Alcohol %, Vintage Year
- For meats: Cut Type, Grade, Animal Welfare Certification

Return ONLY a JSON array with this exact structure:
[
  {
    "key": "field_key_name",
    "label": "Display Name",
    "type": "text|number|date|boolean|select",
    "placeholder": "Example value",
    "helpText": "Why this field is useful"
  }
]`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a pantry management expert who suggests useful custom fields for tracking food items. Always return valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.7,
      maxTokens: 500,
    });

    let jsonString = response.trim();
    // Clean up markdown code blocks if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const suggestions = JSON.parse(jsonString);
    
    if (!Array.isArray(suggestions)) {
      return [];
    }

    // Convert suggestions to CustomField format
    return suggestions.map((suggestion: any) => ({
      id: crypto.randomUUID(),
      key: suggestion.key || suggestion.label.toLowerCase().replace(/\s+/g, '_'),
      value: '',
      type: (suggestion.type || 'text') as CustomFieldType,
      label: suggestion.label,
      ...(suggestion.placeholder && { placeholder: suggestion.placeholder }),
      ...(suggestion.helpText && { helpText: suggestion.helpText }),
      ...(suggestion.options && { options: suggestion.options }),
    }));
  } catch (error) {
    console.error('Error suggesting custom fields:', error);
    return [];
  }
}

