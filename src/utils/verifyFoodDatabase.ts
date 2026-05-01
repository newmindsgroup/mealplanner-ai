import { bloodTypeFoodDatabase } from '../data/bloodTypeFoods';
import type { FoodItem } from '../data/bloodTypeFoods';

interface VerificationResult {
  totalFoods: number;
  completeFoods: number;
  incompleteFoods: {
    name: string;
    id: string;
    missingFields: string[];
  }[];
}

/**
 * Verifies that all foods in the database have complete enhanced fields
 * @returns VerificationResult with details of incomplete foods
 */
export function verifyFoodDatabase(): VerificationResult {
  const incompleteFoods: VerificationResult['incompleteFoods'] = [];
  
  for (const food of bloodTypeFoodDatabase) {
    const missingFields: string[] = [];
    
    // Check for required enhanced fields (except for foods with avoidanceDetails)
    if (!food.avoidanceDetails) {
      if (!food.healthBenefits || food.healthBenefits.length === 0) {
        missingFields.push('healthBenefits');
      }
      
      if (!food.mealTypes || food.mealTypes.length === 0) {
        missingFields.push('mealTypes');
      }
      
      if (!food.detailedExplanations) {
        missingFields.push('detailedExplanations');
      } else {
        // Check if all blood types have explanations
        const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;
        const missingBloodTypes = bloodTypes.filter(bt => !food.detailedExplanations![bt]);
        if (missingBloodTypes.length > 0) {
          missingFields.push(`detailedExplanations (missing: ${missingBloodTypes.join(', ')})`);
        }
      }
    } else {
      // Foods with avoidanceDetails should still have healthBenefits and mealTypes
      if (!food.healthBenefits || food.healthBenefits.length === 0) {
        missingFields.push('healthBenefits');
      }
      
      if (!food.mealTypes || food.mealTypes.length === 0) {
        missingFields.push('mealTypes');
      }
    }
    
    if (missingFields.length > 0) {
      incompleteFoods.push({
        name: food.name,
        id: food.id,
        missingFields,
      });
    }
  }
  
  return {
    totalFoods: bloodTypeFoodDatabase.length,
    completeFoods: bloodTypeFoodDatabase.length - incompleteFoods.length,
    incompleteFoods,
  };
}

/**
 * Pretty print the verification results to console
 */
export function printVerificationResults(): void {
  const results = verifyFoodDatabase();
  
  console.log('\n=================================');
  console.log('FOOD DATABASE VERIFICATION REPORT');
  console.log('=================================\n');
  
  console.log(`✅ Complete Foods: ${results.completeFoods}/${results.totalFoods}`);
  console.log(`❌ Incomplete Foods: ${results.incompleteFoods.length}/${results.totalFoods}`);
  console.log(`📊 Completion: ${((results.completeFoods / results.totalFoods) * 100).toFixed(1)}%\n`);
  
  if (results.incompleteFoods.length > 0) {
    console.log('INCOMPLETE FOODS:\n');
    results.incompleteFoods.forEach((food, index) => {
      console.log(`${index + 1}. ${food.name} (${food.id})`);
      console.log(`   Missing: ${food.missingFields.join(', ')}\n`);
    });
  } else {
    console.log('🎉 ALL FOODS ARE COMPLETE! 🎉\n');
  }
  
  console.log('=================================\n');
}

/**
 * Get list of foods grouped by category that need completion
 */
export function getFoodsNeedingCompletionByCategory() {
  const results = verifyFoodDatabase();
  const byCategory: Record<string, typeof results.incompleteFoods> = {};
  
  for (const incompleteFood of results.incompleteFoods) {
    const food = bloodTypeFoodDatabase.find(f => f.id === incompleteFood.id);
    if (food) {
      if (!byCategory[food.category]) {
        byCategory[food.category] = [];
      }
      byCategory[food.category].push(incompleteFood);
    }
  }
  
  return byCategory;
}

// Allow running from console
if (typeof window !== 'undefined') {
  (window as any).verifyFoodDatabase = printVerificationResults;
  (window as any).getFoodsNeedingCompletionByCategory = getFoodsNeedingCompletionByCategory;
}

