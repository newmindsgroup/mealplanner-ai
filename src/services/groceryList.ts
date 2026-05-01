import type { WeeklyPlan, GroceryList, GroceryItem, PantryItem, LowStockAlert, SmartGroceryItem } from '../types';

const categoryMap: Record<string, string> = {
  // Proteins
  chicken: 'Proteins',
  beef: 'Proteins',
  pork: 'Proteins',
  fish: 'Proteins',
  salmon: 'Proteins',
  eggs: 'Proteins',
  tofu: 'Proteins',
  turkey: 'Proteins',
  lamb: 'Proteins',
  
  // Vegetables
  broccoli: 'Vegetables',
  spinach: 'Vegetables',
  carrots: 'Vegetables',
  bell: 'Vegetables',
  peppers: 'Vegetables',
  tomatoes: 'Vegetables',
  onions: 'Vegetables',
  garlic: 'Vegetables',
  
  // Grains
  rice: 'Grains',
  quinoa: 'Grains',
  pasta: 'Grains',
  bread: 'Grains',
  oats: 'Grains',
  
  // Dairy
  milk: 'Dairy',
  cheese: 'Dairy',
  yogurt: 'Dairy',
  butter: 'Dairy',
  
  // Fruits
  apple: 'Fruits',
  banana: 'Fruits',
  berries: 'Fruits',
  orange: 'Fruits',
  
  // Pantry
  oil: 'Pantry',
  olive: 'Pantry',
  salt: 'Pantry',
  pepper: 'Pantry',
  soy: 'Pantry',
  sauce: 'Pantry',
  spices: 'Pantry',
  
  // Nuts & Seeds
  almonds: 'Nuts & Seeds',
  walnuts: 'Nuts & Seeds',
  seeds: 'Nuts & Seeds',
};

function getCategory(ingredient: string): string {
  const lower = ingredient.toLowerCase();
  for (const [key, category] of Object.entries(categoryMap)) {
    if (lower.includes(key)) {
      return category;
    }
  }
  return 'Other';
}

export function generateGroceryList(plan: WeeklyPlan): GroceryList {
  const itemMap = new Map<string, { quantity: string; category: string }>();

  plan.days.forEach((day) => {
    const meals = [day.breakfast, day.lunch, day.dinner, day.snack];
    meals.forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        const normalized = ingredient.toLowerCase().trim();
        const existing = itemMap.get(normalized);
        
        if (existing) {
          // Increment quantity (simplified - could be smarter)
          const currentQty = parseInt(existing.quantity) || 1;
          itemMap.set(normalized, {
            ...existing,
            quantity: `${currentQty + 1}`,
          });
        } else {
          itemMap.set(normalized, {
            quantity: '1',
            category: getCategory(normalized),
          });
        }
      });
    });
  });

  const items: GroceryItem[] = Array.from(itemMap.entries()).map(([name, data]) => ({
    id: crypto.randomUUID(),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category: data.category,
    quantity: data.quantity,
    checked: false,
  }));

  // Sort by category
  items.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return {
    id: crypto.randomUUID(),
    items,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate grocery list with pantry awareness
 */
export function generateSmartGroceryList(
  plan: WeeklyPlan,
  pantryItems: PantryItem[],
  lowStockAlerts: LowStockAlert[]
): GroceryList {
  const itemMap = new Map<string, { quantity: string; category: string; inPantry: boolean; stockLevel: number }>();

  // First, add items from meal plan
  plan.days.forEach((day) => {
    const meals = [day.breakfast, day.lunch, day.dinner, day.snack];
    meals.forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        const normalized = ingredient.toLowerCase().trim();
        
        // Check if item is in pantry with sufficient quantity
        const pantryItem = pantryItems.find(p => 
          p.name.toLowerCase().includes(normalized) || 
          normalized.includes(p.name.toLowerCase())
        );

        const inPantry = pantryItem && pantryItem.quantity > pantryItem.lowStockThreshold;
        const stockLevel = pantryItem ? pantryItem.quantity : 0;

        // Only add if not sufficiently stocked
        if (!inPantry) {
          const existing = itemMap.get(normalized);
          
          if (existing) {
            const currentQty = parseInt(existing.quantity) || 1;
            itemMap.set(normalized, {
              ...existing,
              quantity: `${currentQty + 1}`,
            });
          } else {
            itemMap.set(normalized, {
              quantity: '1',
              category: getCategory(normalized),
              inPantry: false,
              stockLevel: 0,
            });
          }
        }
      });
    });
  });

  // Add low stock pantry items
  lowStockAlerts.forEach(alert => {
    const pantryItem = pantryItems.find(p => p.id === alert.itemId);
    if (!pantryItem) return;

    const normalized = pantryItem.name.toLowerCase().trim();
    const needed = pantryItem.lowStockThreshold * 2 - pantryItem.quantity; // Restock to double threshold

    itemMap.set(normalized, {
      quantity: `${Math.ceil(needed)}`,
      category: pantryItem.category,
      inPantry: true,
      stockLevel: pantryItem.quantity,
    });
  });

  const items: GroceryItem[] = Array.from(itemMap.entries()).map(([name, data]) => ({
    id: crypto.randomUUID(),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category: data.category,
    quantity: data.quantity,
    checked: false,
  }));

  // Sort by category
  items.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return {
    id: crypto.randomUUID(),
    items,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Auto-add low stock items to existing grocery list
 */
export function addLowStockItemsToList(
  existingList: GroceryList,
  lowStockAlerts: LowStockAlert[],
  pantryItems: PantryItem[]
): GroceryList {
  const existingNames = new Set(
    existingList.items.map(item => item.name.toLowerCase())
  );

  const newItems: GroceryItem[] = [];

  lowStockAlerts.forEach(alert => {
    const pantryItem = pantryItems.find(p => p.id === alert.itemId);
    if (!pantryItem) return;

    const itemName = pantryItem.name.toLowerCase();
    
    // Skip if already in list
    if (existingNames.has(itemName)) return;

    const needed = pantryItem.lowStockThreshold * 2 - pantryItem.quantity;

    newItems.push({
      id: crypto.randomUUID(),
      name: pantryItem.name,
      category: pantryItem.category,
      quantity: `${Math.ceil(needed)} ${pantryItem.unit}`,
      checked: false,
    });
  });

  return {
    ...existingList,
    items: [...existingList.items, ...newItems].sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    }),
  };
}

/**
 * Check which grocery list items are already in pantry
 */
export function checkGroceryItemsInPantry(
  groceryList: GroceryList,
  pantryItems: PantryItem[]
): GroceryList & { itemsInPantry: string[] } {
  const itemsInPantry: string[] = [];

  const updatedItems = groceryList.items.map(groceryItem => {
    const pantryItem = pantryItems.find(p => 
      p.name.toLowerCase() === groceryItem.name.toLowerCase() ||
      p.name.toLowerCase().includes(groceryItem.name.toLowerCase()) ||
      groceryItem.name.toLowerCase().includes(p.name.toLowerCase())
    );

    if (pantryItem && pantryItem.quantity > pantryItem.lowStockThreshold) {
      itemsInPantry.push(groceryItem.name);
      return {
        ...groceryItem,
        checked: true, // Auto-check items already in stock
      };
    }

    return groceryItem;
  });

  return {
    ...groceryList,
    items: updatedItems,
    itemsInPantry,
  };
}

/**
 * Suggest smart shopping based on pantry and usage patterns
 */
export function generateShoppingRecommendations(
  pantryItems: PantryItem[],
  lowStockAlerts: LowStockAlert[]
): string[] {
  const recommendations: string[] = [];

  // Check for missing essential categories
  const categories = new Set(pantryItems.map(i => i.category));
  const essentialCategories = ['proteins', 'vegetables', 'fruits', 'grains'];
  
  essentialCategories.forEach(category => {
    if (!categories.has(category as any)) {
      recommendations.push(`Consider adding ${category} to your pantry for a balanced diet.`);
    }
  });

  // Check for frequently used items running low
  const frequentItems = pantryItems.filter(item => 
    item.usageHistory && 
    item.usageHistory.length >= 3 &&
    item.quantity <= item.lowStockThreshold
  );

  if (frequentItems.length > 0) {
    recommendations.push(
      `You frequently use: ${frequentItems.slice(0, 3).map(i => i.name).join(', ')}. Consider buying in bulk to save money.`
    );
  }

  // Priority items
  const urgentItems = lowStockAlerts.filter(a => a.priority === 'urgent' || a.priority === 'high');
  if (urgentItems.length > 0) {
    recommendations.push(
      `${urgentItems.length} high-priority item${urgentItems.length !== 1 ? 's' : ''} need immediate restocking.`
    );
  }

  return recommendations;
}

