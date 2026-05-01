/**
 * Blood Type Utilities
 * Comprehensive blood type compatibility and food recommendations
 */

import type { BloodType } from '../types';

// Blood type diet food compatibility (based on Dr. D'Adamo's research)
// Note: Rh factor doesn't typically affect food compatibility in blood type diet theory
// but we include it for completeness and potential future medical considerations

export interface BloodTypeFoodCompatibility {
  beneficial: string[];
  neutral: string[];
  avoid: string[];
}

const bloodTypeFoodDatabase: Record<BloodType, BloodTypeFoodCompatibility> = {
  'O+': {
    beneficial: ['beef', 'lamb', 'venison', 'salmon', 'mackerel', 'cod', 'broccoli', 'spinach', 'kale', 'onions', 'sweet potatoes', 'olive oil', 'walnuts', 'pumpkin seeds'],
    neutral: ['chicken', 'turkey', 'eggs', 'goat cheese', 'butter', 'rice', 'quinoa', 'oats', 'apples', 'berries', 'figs'],
    avoid: ['pork', 'bacon', 'dairy', 'wheat', 'corn', 'lentils', 'cabbage', 'cauliflower', 'avocado', 'coconut'],
  },
  'O-': {
    beneficial: ['beef', 'lamb', 'venison', 'salmon', 'mackerel', 'cod', 'broccoli', 'spinach', 'kale', 'onions', 'sweet potatoes', 'olive oil', 'walnuts', 'pumpkin seeds'],
    neutral: ['chicken', 'turkey', 'eggs', 'goat cheese', 'butter', 'rice', 'quinoa', 'oats', 'apples', 'berries', 'figs'],
    avoid: ['pork', 'bacon', 'dairy', 'wheat', 'corn', 'lentils', 'cabbage', 'cauliflower', 'avocado', 'coconut'],
  },
  'A+': {
    beneficial: ['chicken', 'turkey', 'tofu', 'tempeh', 'salmon', 'sardines', 'broccoli', 'carrots', 'spinach', 'garlic', 'onions', 'berries', 'cherries', 'pineapple', 'olive oil', 'flaxseed'],
    neutral: ['eggs', 'goat cheese', 'yogurt', 'rice', 'quinoa', 'oats', 'apples', 'pears', 'peaches', 'avocado'],
    avoid: ['beef', 'pork', 'lamb', 'dairy', 'wheat', 'potatoes', 'tomatoes', 'peppers', 'bananas', 'oranges', 'coconut'],
  },
  'A-': {
    beneficial: ['chicken', 'turkey', 'tofu', 'tempeh', 'salmon', 'sardines', 'broccoli', 'carrots', 'spinach', 'garlic', 'onions', 'berries', 'cherries', 'pineapple', 'olive oil', 'flaxseed'],
    neutral: ['eggs', 'goat cheese', 'yogurt', 'rice', 'quinoa', 'oats', 'apples', 'pears', 'peaches', 'avocado'],
    avoid: ['beef', 'pork', 'lamb', 'dairy', 'wheat', 'potatoes', 'tomatoes', 'peppers', 'bananas', 'oranges', 'coconut'],
  },
  'B+': {
    beneficial: ['lamb', 'venison', 'salmon', 'cod', 'mackerel', 'eggs', 'goat cheese', 'yogurt', 'rice', 'oats', 'millet', 'bananas', 'grapes', 'plums', 'olive oil', 'walnuts'],
    neutral: ['beef', 'turkey', 'tofu', 'broccoli', 'carrots', 'spinach', 'apples', 'berries', 'quinoa'],
    avoid: ['chicken', 'pork', 'corn', 'lentils', 'peanuts', 'sesame seeds', 'tomatoes', 'wheat'],
  },
  'B-': {
    beneficial: ['lamb', 'venison', 'salmon', 'cod', 'mackerel', 'eggs', 'goat cheese', 'yogurt', 'rice', 'oats', 'millet', 'bananas', 'grapes', 'plums', 'olive oil', 'walnuts'],
    neutral: ['beef', 'turkey', 'tofu', 'broccoli', 'carrots', 'spinach', 'apples', 'berries', 'quinoa'],
    avoid: ['chicken', 'pork', 'corn', 'lentils', 'peanuts', 'sesame seeds', 'tomatoes', 'wheat'],
  },
  'AB+': {
    beneficial: ['turkey', 'lamb', 'salmon', 'tuna', 'cod', 'tofu', 'tempeh', 'eggs', 'goat cheese', 'yogurt', 'rice', 'oats', 'berries', 'cherries', 'grapes', 'olive oil', 'walnuts'],
    neutral: ['chicken', 'beef', 'broccoli', 'carrots', 'spinach', 'apples', 'pears', 'quinoa'],
    avoid: ['pork', 'chicken (some)', 'corn', 'buckwheat', 'sesame seeds', 'bananas', 'oranges'],
  },
  'AB-': {
    beneficial: ['turkey', 'lamb', 'salmon', 'tuna', 'cod', 'tofu', 'tempeh', 'eggs', 'goat cheese', 'yogurt', 'rice', 'oats', 'berries', 'cherries', 'grapes', 'olive oil', 'walnuts'],
    neutral: ['chicken', 'beef', 'broccoli', 'carrots', 'spinach', 'apples', 'pears', 'quinoa'],
    avoid: ['pork', 'chicken (some)', 'corn', 'buckwheat', 'sesame seeds', 'bananas', 'oranges'],
  },
};

/**
 * Get food compatibility for a blood type
 */
export function getFoodCompatibility(bloodType: BloodType): BloodTypeFoodCompatibility {
  return bloodTypeFoodDatabase[bloodType] || bloodTypeFoodDatabase['O+'];
}

/**
 * Check if a food is compatible with blood type
 */
export function isFoodCompatible(food: string, bloodType: BloodType): boolean {
  const compatibility = getFoodCompatibility(bloodType);
  const foodLower = food.toLowerCase();
  
  return (
    compatibility.beneficial.some(f => foodLower.includes(f.toLowerCase())) ||
    compatibility.neutral.some(f => foodLower.includes(f.toLowerCase()))
  );
}

/**
 * Get all compatible blood types for a food
 */
export function getCompatibleBloodTypes(food: string): BloodType[] {
  const foodLower = food.toLowerCase();
  const compatible: BloodType[] = [];
  
  (Object.keys(bloodTypeFoodDatabase) as BloodType[]).forEach(bloodType => {
    const compatibility = bloodTypeFoodDatabase[bloodType];
    if (
      compatibility.beneficial.some(f => foodLower.includes(f.toLowerCase())) ||
      compatibility.neutral.some(f => foodLower.includes(f.toLowerCase()))
    ) {
      compatible.push(bloodType);
    }
  });
  
  return compatible;
}

/**
 * Get recommended foods for blood type
 */
export function getRecommendedFoods(bloodType: BloodType): string[] {
  return getFoodCompatibility(bloodType).beneficial;
}

/**
 * Get foods to avoid for blood type
 */
export function getFoodsToAvoid(bloodType: BloodType): string[] {
  return getFoodCompatibility(bloodType).avoid;
}

/**
 * Format blood type for display
 */
export function formatBloodType(bloodType: BloodType): string {
  return bloodType;
}

/**
 * Get all available blood types
 */
export function getAllBloodTypes(): BloodType[] {
  return ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
}

/**
 * Get base blood type (without Rh factor)
 */
export function getBaseBloodType(bloodType: BloodType): 'O' | 'A' | 'B' | 'AB' {
  return bloodType.replace(/[+-]/, '') as 'O' | 'A' | 'B' | 'AB';
}

/**
 * Check if Rh positive
 */
export function isRhPositive(bloodType: BloodType): boolean {
  return bloodType.endsWith('+');
}

