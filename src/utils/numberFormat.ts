/**
 * Number formatting utilities for nutritional values and other numeric displays
 */

/**
 * Round a number to a specified number of decimal places
 */
export function roundTo(value: number | undefined | null, decimals: number = 1): number {
  if (value === undefined || value === null || isNaN(value)) {
    return 0;
  }
  
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Format a nutritional value (protein, carbs, fats, fiber)
 * Rounds to 1 decimal place and removes trailing .0
 */
export function formatNutrition(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  
  const rounded = roundTo(value, 1);
  
  // If it's a whole number, don't show decimal
  if (rounded % 1 === 0) {
    return rounded.toString();
  }
  
  return rounded.toFixed(1);
}

/**
 * Format calories (always whole number)
 */
export function formatCalories(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  
  return Math.round(value).toString();
}

/**
 * Format a number with unit (g, mg, etc.)
 */
export function formatWithUnit(
  value: number | undefined | null, 
  unit: string = 'g',
  decimals: number = 1
): string {
  const formatted = formatNutrition(value);
  return `${formatted}${unit}`;
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  
  const rounded = roundTo(value, 0);
  return `${rounded}%`;
}

/**
 * Safely parse a number from various input types
 */
export function safeNumber(value: any): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}

