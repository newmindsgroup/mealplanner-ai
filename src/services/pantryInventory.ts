import type { 
  PantryItem, 
  LowStockAlert, 
  ExpirationAlert, 
  AlertPriority,
  UsageFrequency,
  PantryStats 
} from '../types';

/**
 * Check all items and generate low stock alerts
 */
export function checkLowStockItems(items: PantryItem[]): LowStockAlert[] {
  const alerts: LowStockAlert[] = [];
  const now = new Date().toISOString();

  items.forEach(item => {
    if (item.quantity <= item.lowStockThreshold) {
      const priority = determineLowStockPriority(item);
      
      alerts.push({
        id: crypto.randomUUID(),
        itemId: item.id,
        itemName: item.name,
        currentQuantity: item.quantity,
        threshold: item.lowStockThreshold,
        priority,
        createdAt: now,
        acknowledged: false,
        addedToGroceryList: false,
      });
    }
  });

  return alerts;
}

/**
 * Determine priority level for low stock alert
 */
function determineLowStockPriority(item: PantryItem): AlertPriority {
  const percentageRemaining = (item.quantity / item.lowStockThreshold) * 100;
  
  if (item.quantity === 0) {
    return 'urgent';
  }
  
  if (percentageRemaining <= 50) {
    return 'high';
  }
  
  if (percentageRemaining <= 80) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Check items approaching expiration
 */
export function checkExpiringItems(
  items: PantryItem[],
  daysAhead: number = 7
): ExpirationAlert[] {
  const alerts: ExpirationAlert[] = [];
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  items.forEach(item => {
    if (!item.expirationDate) return;

    const expirationDate = new Date(item.expirationDate);
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration <= daysAhead && daysUntilExpiration >= 0) {
      const priority = determineExpirationPriority(daysUntilExpiration);

      alerts.push({
        id: crypto.randomUUID(),
        itemId: item.id,
        itemName: item.name,
        expirationDate: item.expirationDate,
        daysUntilExpiration,
        priority,
        createdAt: now.toISOString(),
        acknowledged: false,
        usedInMeal: false,
      });
    }
  });

  // Sort by days until expiration (soonest first)
  return alerts.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
}

/**
 * Check for expired items
 */
export function checkExpiredItems(items: PantryItem[]): ExpirationAlert[] {
  const alerts: ExpirationAlert[] = [];
  const now = new Date();

  items.forEach(item => {
    if (!item.expirationDate) return;

    const expirationDate = new Date(item.expirationDate);
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration < 0) {
      alerts.push({
        id: crypto.randomUUID(),
        itemId: item.id,
        itemName: item.name,
        expirationDate: item.expirationDate,
        daysUntilExpiration,
        priority: 'urgent',
        createdAt: now.toISOString(),
        acknowledged: false,
        usedInMeal: false,
      });
    }
  });

  return alerts;
}

/**
 * Determine priority level for expiration alert
 */
function determineExpirationPriority(daysUntilExpiration: number): AlertPriority {
  if (daysUntilExpiration <= 1) {
    return 'urgent';
  }
  
  if (daysUntilExpiration <= 3) {
    return 'high';
  }
  
  if (daysUntilExpiration <= 5) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Calculate usage frequency based on usage history
 */
export function calculateUsageFrequency(item: PantryItem): UsageFrequency {
  if (!item.usageHistory || item.usageHistory.length === 0) {
    return 'rarely';
  }

  const history = item.usageHistory;
  const now = new Date();
  const daysSinceAdded = Math.ceil(
    (now.getTime() - new Date(item.addedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceAdded === 0) return 'rarely';

  const usagesPerDay = history.length / daysSinceAdded;

  if (usagesPerDay >= 0.9) {
    return 'daily';
  }
  
  if (usagesPerDay >= 0.25) {
    return 'weekly';
  }
  
  if (usagesPerDay >= 0.033) {
    return 'monthly';
  }
  
  return 'rarely';
}

/**
 * Calculate average consumption rate (units per day)
 */
export function calculateConsumptionRate(item: PantryItem): number {
  if (!item.usageHistory || item.usageHistory.length === 0) {
    return 0;
  }

  const totalUsed = item.usageHistory.reduce((sum, record) => sum + record.quantityUsed, 0);
  const daysSinceAdded = Math.ceil(
    (new Date().getTime() - new Date(item.addedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceAdded === 0) return 0;

  return totalUsed / daysSinceAdded;
}

/**
 * Predict when item will run out based on usage patterns
 */
export function predictRunOutDate(item: PantryItem): Date | null {
  if (item.quantity === 0) {
    return new Date(); // Already out
  }

  const consumptionRate = calculateConsumptionRate(item);
  
  if (consumptionRate === 0) {
    return null; // Cannot predict
  }

  const daysUntilEmpty = item.quantity / consumptionRate;
  const runOutDate = new Date();
  runOutDate.setDate(runOutDate.getDate() + Math.ceil(daysUntilEmpty));

  return runOutDate;
}

/**
 * Suggest optimal restock quantity based on usage patterns
 */
export function suggestRestockQuantity(item: PantryItem): number {
  const frequency = calculateUsageFrequency(item);
  const consumptionRate = calculateConsumptionRate(item);

  // Calculate quantity needed for 2 weeks
  const twoWeekSupply = consumptionRate * 14;

  // Adjust based on frequency
  switch (frequency) {
    case 'daily':
      return Math.ceil(twoWeekSupply);
    case 'weekly':
      return Math.ceil(twoWeekSupply * 0.75);
    case 'monthly':
      return Math.ceil(twoWeekSupply * 0.5);
    case 'rarely':
      return Math.ceil(item.lowStockThreshold * 2);
    default:
      return Math.ceil(item.lowStockThreshold * 2);
  }
}

/**
 * Generate shopping recommendations based on pantry analysis
 */
export function generateShoppingRecommendations(
  items: PantryItem[],
  lowStockAlerts: LowStockAlert[]
): string[] {
  const recommendations: string[] = [];

  // Group low stock items by category
  const lowStockByCategory = new Map<string, number>();
  lowStockAlerts.forEach(alert => {
    const item = items.find(i => i.id === alert.itemId);
    if (item) {
      lowStockByCategory.set(
        item.category,
        (lowStockByCategory.get(item.category) || 0) + 1
      );
    }
  });

  // Generate category-based recommendations
  lowStockByCategory.forEach((count, category) => {
    if (count >= 3) {
      recommendations.push(
        `You're low on ${count} ${category} items. Consider restocking your ${category} supply.`
      );
    }
  });

  // Check for frequently used items
  const frequentItems = items.filter(
    item => calculateUsageFrequency(item) === 'daily' && item.quantity <= item.lowStockThreshold * 2
  );

  if (frequentItems.length > 0) {
    recommendations.push(
      `${frequentItems.length} frequently used item(s) running low: ${frequentItems.map(i => i.name).join(', ')}`
    );
  }

  // Check for items expiring soon
  const expiringSoon = items.filter(item => {
    if (!item.expirationDate) return false;
    const daysUntil = Math.ceil(
      (new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil > 0 && daysUntil <= 3;
  });

  if (expiringSoon.length > 0) {
    recommendations.push(
      `${expiringSoon.length} item(s) expiring soon. Use them in meals before restocking: ${expiringSoon.map(i => i.name).join(', ')}`
    );
  }

  return recommendations;
}

/**
 * Calculate pantry health score (0-100)
 */
export function calculatePantryHealthScore(items: PantryItem[], stats: PantryStats): number {
  let score = 100;

  // Penalize for low stock items
  const lowStockPenalty = Math.min(30, (stats.lowStockCount / Math.max(1, stats.totalItems)) * 100);
  score -= lowStockPenalty;

  // Penalize for expired items
  const expiredPenalty = Math.min(30, (stats.expiredCount / Math.max(1, stats.totalItems)) * 100 * 2);
  score -= expiredPenalty;

  // Penalize for expiring items
  const expiringPenalty = Math.min(20, (stats.expiringCount / Math.max(1, stats.totalItems)) * 100);
  score -= expiringPenalty;

  // Reward for variety (having items in multiple categories)
  const categoryCount = Object.keys(stats.itemsByCategory).length;
  const varietyBonus = Math.min(10, categoryCount);
  score += varietyBonus;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get items that should be used first (expiring soon or low stock)
 */
export function getItemsToUseFirst(items: PantryItem[]): PantryItem[] {
  const now = new Date();
  
  return items
    .filter(item => {
      // Include if expiring within 5 days
      if (item.expirationDate) {
        const daysUntil = Math.ceil(
          (new Date(item.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntil > 0 && daysUntil <= 5) {
          return true;
        }
      }
      
      // Include if very low stock
      if (item.quantity <= item.lowStockThreshold * 0.5) {
        return true;
      }
      
      return false;
    })
    .sort((a, b) => {
      // Sort by expiration date first
      if (a.expirationDate && b.expirationDate) {
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      }
      if (a.expirationDate) return -1;
      if (b.expirationDate) return 1;
      
      // Then by quantity (lowest first)
      return (a.quantity / a.lowStockThreshold) - (b.quantity / b.lowStockThreshold);
    });
}

/**
 * Analyze waste prevention opportunities
 */
export function analyzeWastePrevention(items: PantryItem[]): {
  itemsToUseFirst: string[];
  estimatedWasteCost: number;
  recommendations: string[];
} {
  const itemsToUse = getItemsToUseFirst(items);
  const expiredItems = checkExpiredItems(items);
  
  // Calculate estimated waste cost
  const estimatedWasteCost = expiredItems.reduce((sum, alert) => {
    const item = items.find(i => i.id === alert.itemId);
    return sum + (item?.price || 0);
  }, 0);

  const recommendations: string[] = [];

  if (itemsToUse.length > 0) {
    recommendations.push(
      `Use these ${itemsToUse.length} items soon to prevent waste: ${itemsToUse.slice(0, 3).map(i => i.name).join(', ')}${itemsToUse.length > 3 ? '...' : ''}`
    );
  }

  if (expiredItems.length > 0) {
    recommendations.push(
      `${expiredItems.length} expired item(s) should be disposed of properly.`
    );
  }

  const expiringThisWeek = items.filter(item => {
    if (!item.expirationDate) return false;
    const daysUntil = Math.ceil(
      (new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil > 0 && daysUntil <= 7;
  });

  if (expiringThisWeek.length >= 3) {
    recommendations.push(
      `Plan meals around ${expiringThisWeek.length} items expiring this week to minimize waste.`
    );
  }

  return {
    itemsToUseFirst: itemsToUse.map(i => i.name),
    estimatedWasteCost,
    recommendations,
  };
}

/**
 * Get top used items
 */
export function getTopUsedItems(items: PantryItem[], limit: number = 5): Array<{ name: string; count: number }> {
  return items
    .map(item => ({
      name: item.name,
      count: item.usageHistory?.length || 0,
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

