/**
 * Household Food Comparison Service
 *
 * Side-by-side food compatibility analysis for multi-blood-type households.
 * Helps families meal plan together by finding foods everyone can eat,
 * flagging conflicts, and suggesting household-safe recipes.
 *
 * Sources: D'Adamo blood type classifications
 */

import {
  type BloodTypeGroup,
  type FoodRating,
  type FoodCompatibility,
  getBloodTypeFoodReport,
  getUniversalSafeFoods,
  lookupFoodCompatibility,
  getFoodsByRating,
  FOOD_COUNT,
} from '../data/bloodTypeFoodDatabase';
import { getSmartRecipeRecommendations, getRecipesForBloodType, type RecipeResult } from '../data/recipeDatabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HouseholdMember {
  name: string;
  bloodType: string;
}

export interface FoodComparison {
  food: string;
  category: string;
  ratings: Record<string, FoodRating>;
  /** Is this food safe for EVERYONE in the household? */
  householdSafe: boolean;
  /** Anyone who should avoid this food */
  avoidBy: string[];
  /** Anyone for whom this is beneficial */
  beneficialFor: string[];
}

export interface HouseholdFoodReport {
  members: HouseholdMember[];
  /** Foods everyone can eat (no one "avoids") */
  universalSafe: FoodComparison[];
  /** Foods beneficial for at least one member, safe for all */
  recommended: FoodComparison[];
  /** Foods with conflicts (someone avoids) */
  conflicts: FoodComparison[];
  /** Quick stats */
  stats: {
    totalFoodsAnalyzed: number;
    universalSafeCount: number;
    conflictCount: number;
    biggestConflictFood: string;
  };
}

// ─── Main Analysis ──────────────────────────────────────────────────────────

/**
 * Generate a full household food compatibility report
 */
export function generateHouseholdFoodReport(members: HouseholdMember[]): HouseholdFoodReport {
  if (members.length === 0) {
    return {
      members: [],
      universalSafe: [],
      recommended: [],
      conflicts: [],
      stats: { totalFoodsAnalyzed: 0, universalSafeCount: 0, conflictCount: 0, biggestConflictFood: '' },
    };
  }

  // Get all food reports for each member
  const memberReports = members.map(m => ({
    member: m,
    report: getBloodTypeFoodReport(m.bloodType),
  }));

  // Build comparison for every food in the database
  const allFoods = getUniversalSafeFoods(); // Start with universal, then add conflicts
  const universalSafe: FoodComparison[] = [];
  const recommended: FoodComparison[] = [];
  const conflicts: FoodComparison[] = [];

  // Get ALL foods by getting each type's full report
  const seenFoods = new Set<string>();
  const allFoodEntries: FoodCompatibility[] = [];
  for (const mr of memberReports) {
    for (const f of [...mr.report.beneficial, ...mr.report.neutral, ...mr.report.avoid]) {
      if (!seenFoods.has(f.food)) {
        seenFoods.add(f.food);
        allFoodEntries.push(f);
      }
    }
  }

  for (const food of allFoodEntries) {
    const ratings: Record<string, FoodRating> = {};
    const avoidBy: string[] = [];
    const beneficialFor: string[] = [];

    for (const m of members) {
      const bt = m.bloodType.replace(/[+-]/, '').toUpperCase() as BloodTypeGroup;
      const rating = food[bt];
      ratings[m.name] = rating;
      if (rating === 'avoid') avoidBy.push(m.name);
      if (rating === 'beneficial') beneficialFor.push(m.name);
    }

    const comparison: FoodComparison = {
      food: food.food,
      category: food.category,
      ratings,
      householdSafe: avoidBy.length === 0,
      avoidBy,
      beneficialFor,
    };

    if (avoidBy.length === 0) {
      if (beneficialFor.length > 0) {
        recommended.push(comparison);
      } else {
        universalSafe.push(comparison);
      }
    } else {
      conflicts.push(comparison);
    }
  }

  // Sort: recommended by most beneficiaries, conflicts by most avoiders
  recommended.sort((a, b) => b.beneficialFor.length - a.beneficialFor.length);
  conflicts.sort((a, b) => b.avoidBy.length - a.avoidBy.length);

  const biggestConflictFood = conflicts[0]?.food || '';

  return {
    members,
    universalSafe,
    recommended,
    conflicts,
    stats: {
      totalFoodsAnalyzed: allFoodEntries.length,
      universalSafeCount: universalSafe.length + recommended.length,
      conflictCount: conflicts.length,
      biggestConflictFood,
    },
  };
}

/**
 * Quick check: can this specific food work for the whole household?
 */
export function checkFoodForHousehold(
  food: string,
  members: HouseholdMember[],
): { safe: boolean; details: Array<{ name: string; rating: FoodRating }> } {
  const details = members.map(m => {
    const result = lookupFoodCompatibility(food, m.bloodType);
    return {
      name: m.name,
      rating: result?.rating || ('neutral' as FoodRating),
    };
  });

  return {
    safe: !details.some(d => d.rating === 'avoid'),
    details,
  };
}

/**
 * Get recipes the whole household can enjoy
 */
export function getHouseholdRecipes(members: HouseholdMember[], limit = 10): RecipeResult[] {
  // Find recipes compatible with ALL blood types in the household
  const bloodTypes = [...new Set(members.map(m => m.bloodType.replace(/[+-]/, '').toUpperCase()))];

  // Get recipes for each blood type
  const recipeSets = bloodTypes.map(bt => new Set(
    getRecipesForBloodType(bt).map(r => r.name)
  ));

  // Find intersection
  if (recipeSets.length === 0) return [];
  const commonNames = [...recipeSets[0]].filter(name =>
    recipeSets.every(set => set.has(name))
  );

  // Get the actual recipe objects
  const allRecipes = bloodTypes.flatMap(bt => getRecipesForBloodType(bt));
  const unique = new Map<string, RecipeResult>();
  for (const r of allRecipes) {
    if (commonNames.includes(r.name) && !unique.has(r.name)) {
      unique.set(r.name, r);
    }
  }

  return [...unique.values()].slice(0, limit);
}

/**
 * Get a "Family Meal Plan" summary — what to cook for everyone
 */
export function getHouseholdMealSuggestions(members: HouseholdMember[]): {
  sharedMeals: RecipeResult[];
  perPersonExtras: Record<string, RecipeResult[]>;
  universalSnacks: RecipeResult[];
} {
  const sharedMeals = getHouseholdRecipes(members, 7);

  // Get person-specific extras (beneficial for their type)
  const perPersonExtras: Record<string, RecipeResult[]> = {};
  for (const m of members) {
    const personal = getSmartRecipeRecommendations({
      bloodType: m.bloodType,
      limit: 3,
    });
    perPersonExtras[m.name] = personal;
  }

  // Universal snacks
  const universalSnacks = getSmartRecipeRecommendations({
    category: 'snack',
    limit: 5,
  });

  return { sharedMeals, perPersonExtras, universalSnacks };
}
