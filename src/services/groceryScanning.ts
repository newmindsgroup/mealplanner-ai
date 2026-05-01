import Tesseract from 'tesseract.js';
import type { GroceryScanResult, HarmfulIngredient, BloodType } from '../types';
import { getAIService } from './aiService';
import { getAllBloodTypes, getFoodsToAvoid } from '../utils/bloodTypeUtils';

// Comprehensive list of potentially harmful ingredients
const harmfulIngredientsDatabase = {
  additives: [
    'monosodium glutamate', 'msg', 'disodium inosinate', 'disodium guanylate',
    'tbhq', 'bht', 'bha', 'propyl gallate',
  ],
  preservatives: [
    'sodium benzoate', 'potassium benzoate', 'sodium nitrite', 'sodium nitrate',
    'sulfur dioxide', 'sulfites', 'potassium sorbate', 'calcium propionate',
  ],
  artificialColors: [
    'red 40', 'yellow 5', 'yellow 6', 'blue 1', 'blue 2', 'green 3',
    'red 3', 'caramel color', 'tartrazine', 'allura red',
  ],
  artificialFlavors: [
    'artificial flavor', 'artificial flavoring', 'natural and artificial flavors',
  ],
  sugars: [
    'high fructose corn syrup', 'hfcs', 'corn syrup', 'agave nectar',
    'dextrose', 'maltodextrin', 'sucralose', 'aspartame', 'acesulfame potassium',
  ],
  transFats: [
    'partially hydrogenated', 'hydrogenated oil', 'trans fat', 'shortening',
  ],
  allergens: [
    'wheat gluten', 'soy lecithin', 'casein', 'whey', 'lactose',
  ],
};

/**
 * Analyze grocery product label for harmful ingredients
 */
export async function scanGroceryLabel(imageDataUrl: string): Promise<GroceryScanResult> {
  const aiService = getAIService();
  
  if (!aiService) {
    throw new Error('AI service is not configured. Please configure your API key in Settings.');
  }

  // Perform OCR to extract label text
  const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', {
    logger: (m) => console.log('[Grocery OCR]', m),
  });

  const extractedText = text.toLowerCase();

  // Detect harmful ingredients using pattern matching
  const detectedHarmful: HarmfulIngredient[] = [];
  
  // Check additives
  harmfulIngredientsDatabase.additives.forEach((additive) => {
    if (extractedText.includes(additive.toLowerCase())) {
      detectedHarmful.push({
        name: additive,
        category: 'additive',
        severity: 'moderate',
        reason: 'May cause adverse reactions in sensitive individuals. Some studies link this additive to health concerns.',
      });
    }
  });

  // Check preservatives
  harmfulIngredientsDatabase.preservatives.forEach((preservative) => {
    if (extractedText.includes(preservative.toLowerCase())) {
      const severity = preservative.includes('nitrite') || preservative.includes('nitrate') ? 'high' : 'moderate';
      detectedHarmful.push({
        name: preservative,
        category: 'preservative',
        severity: severity as 'low' | 'moderate' | 'high',
        reason: severity === 'high' 
          ? 'Nitrites/nitrates may form carcinogenic compounds when heated.'
          : 'Preservative that may cause sensitivities in some individuals.',
      });
    }
  });

  // Check artificial colors
  harmfulIngredientsDatabase.artificialColors.forEach((color) => {
    if (extractedText.includes(color.toLowerCase())) {
      detectedHarmful.push({
        name: color,
        category: 'artificial-color',
        severity: 'moderate',
        reason: 'Artificial colors have been linked to hyperactivity in children and may cause allergic reactions.',
      });
    }
  });

  // Check artificial flavors
  harmfulIngredientsDatabase.artificialFlavors.forEach((flavor) => {
    if (extractedText.includes(flavor.toLowerCase())) {
      detectedHarmful.push({
        name: flavor,
        category: 'artificial-flavor',
        severity: 'low',
        reason: 'Synthetic flavoring that may contain undisclosed chemical compounds.',
      });
    }
  });

  // Check sugars
  harmfulIngredientsDatabase.sugars.forEach((sugar) => {
    if (extractedText.includes(sugar.toLowerCase())) {
      const severity = sugar.includes('high fructose') || sugar.includes('hfcs') ? 'high' : 'moderate';
      detectedHarmful.push({
        name: sugar,
        category: 'sugar',
        severity: severity as 'low' | 'moderate' | 'high',
        reason: severity === 'high'
          ? 'High fructose corn syrup is linked to obesity, diabetes, and metabolic issues.'
          : 'Added sweetener that may contribute to health issues when consumed in excess.',
      });
    }
  });

  // Check trans fats
  harmfulIngredientsDatabase.transFats.forEach((transFat) => {
    if (extractedText.includes(transFat.toLowerCase())) {
      detectedHarmful.push({
        name: transFat,
        category: 'trans-fat',
        severity: 'high',
        reason: 'Trans fats raise bad cholesterol and lower good cholesterol, increasing heart disease risk.',
      });
    }
  });

  // Check blood type conflicts
  const bloodTypeConflicts: { [key in BloodType]?: string[] } = {};
  const allBloodTypes = getAllBloodTypes();
  
  allBloodTypes.forEach((bloodType) => {
    const foodsToAvoid = getFoodsToAvoid(bloodType);
    const conflicts: string[] = [];
    
    foodsToAvoid.forEach((food) => {
      if (extractedText.includes(food.toLowerCase())) {
        conflicts.push(food);
        
        // Add to harmful ingredients with blood type info
        const existing = detectedHarmful.find(h => h.name.toLowerCase() === food.toLowerCase());
        if (existing) {
          if (!existing.bloodTypeConflicts) {
            existing.bloodTypeConflicts = [];
          }
          existing.bloodTypeConflicts.push(bloodType);
        } else {
          detectedHarmful.push({
            name: food,
            category: 'allergen',
            severity: 'moderate',
            reason: `May not be compatible with blood type ${bloodType} according to blood type diet principles.`,
            bloodTypeConflicts: [bloodType],
          });
        }
      }
    });
    
    if (conflicts.length > 0) {
      bloodTypeConflicts[bloodType] = conflicts;
    }
  });

  // Calculate health score (0-100, higher is better)
  let healthScore = 100;
  detectedHarmful.forEach((ingredient) => {
    if (ingredient.severity === 'high') healthScore -= 15;
    else if (ingredient.severity === 'moderate') healthScore -= 8;
    else healthScore -= 3;
  });
  healthScore = Math.max(0, healthScore);

  // Generate safety flags
  const safetyFlags: GroceryScanResult['safetyFlags'] = [];
  
  const highSeverity = detectedHarmful.filter(h => h.severity === 'high');
  const moderateSeverity = detectedHarmful.filter(h => h.severity === 'moderate');
  
  if (highSeverity.length > 0) {
    safetyFlags.push({
      level: 'danger',
      message: `⚠️ Contains ${highSeverity.length} high-risk ingredient${highSeverity.length !== 1 ? 's' : ''}: ${highSeverity.map(h => h.name).join(', ')}`,
    });
  }
  
  if (moderateSeverity.length > 0) {
    safetyFlags.push({
      level: 'warning',
      message: `Contains ${moderateSeverity.length} moderately concerning ingredient${moderateSeverity.length !== 1 ? 's' : ''}`,
    });
  }
  
  if (Object.keys(bloodTypeConflicts).length > 0) {
    safetyFlags.push({
      level: 'caution',
      message: `May conflict with ${Object.keys(bloodTypeConflicts).length} blood type${Object.keys(bloodTypeConflicts).length !== 1 ? 's' : ''}`,
    });
  }
  
  if (detectedHarmful.length === 0) {
    safetyFlags.push({
      level: 'safe',
      message: '✓ No obvious harmful ingredients detected based on the label scan.',
    });
  }

  // Use AI to generate detailed analysis and recommendations
  let productName = 'Unknown Product';
  let recommendations: string[] = [];
  
  try {
    const aiAnalysis = await aiService.chat([
      {
        role: 'system',
        content: `You are a nutrition expert analyzing food product labels. Provide clear, educational information about ingredients and health implications.`,
      },
      {
        role: 'user',
        content: `Analyze this food product label:

${text.substring(0, 1500)}

Detected concerning ingredients: ${detectedHarmful.map(h => h.name).join(', ') || 'None'}
Health Score: ${healthScore}/100

Provide:
1. Product name (first line)
2. 2-3 specific recommendations or health insights

Format as:
PRODUCT: [name]
- [recommendation 1]
- [recommendation 2]`,
      },
    ], {
      temperature: 0.5,
      maxTokens: 500,
    });

    // Parse AI response
    const lines = aiAnalysis.split('\n').filter(line => line.trim());
    const productLine = lines.find(line => line.toLowerCase().startsWith('product:'));
    if (productLine) {
      productName = productLine.replace(/^product:\s*/i, '').trim();
    }
    
    recommendations = lines
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .slice(0, 3);
  } catch (error) {
    console.warn('AI analysis failed, using fallback recommendations:', error);
  }

  // Fallback recommendations
  if (recommendations.length === 0) {
    if (healthScore >= 80) {
      recommendations.push('This product appears to have relatively clean ingredients based on the label scan.');
    } else if (healthScore >= 60) {
      recommendations.push('Consider this product occasionally rather than as a regular choice.');
    } else {
      recommendations.push('This product contains multiple concerning ingredients. Consider healthier alternatives.');
    }
    
    if (highSeverity.length > 0) {
      recommendations.push(`High-risk ingredients detected: ${highSeverity.map(h => h.name).join(', ')}. These may have significant health implications.`);
    }
    
    if (Object.keys(bloodTypeConflicts).length > 0) {
      recommendations.push('Some ingredients may not be compatible with certain blood types according to blood type diet principles.');
    }
  }

  return {
    id: crypto.randomUUID(),
    imageUrl: imageDataUrl,
    scanMode: 'grocery',
    productName,
    extractedText: text,
    harmfulIngredients: detectedHarmful,
    healthScore,
    safetyFlags,
    recommendations,
    bloodTypeCompatibility: calculateBloodTypeCompatibility(detectedHarmful),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Calculate overall blood type compatibility based on detected ingredients
 */
function calculateBloodTypeCompatibility(
  harmfulIngredients: HarmfulIngredient[]
): { [key in BloodType]?: 'beneficial' | 'neutral' | 'avoid' } {
  const compatibility: { [key in BloodType]?: 'beneficial' | 'neutral' | 'avoid' } = {};
  
  const allBloodTypes = getAllBloodTypes();
  allBloodTypes.forEach((bloodType) => {
    const hasConflict = harmfulIngredients.some(
      h => h.bloodTypeConflicts?.includes(bloodType)
    );
    
    if (hasConflict) {
      compatibility[bloodType] = 'avoid';
    } else if (harmfulIngredients.length > 3) {
      compatibility[bloodType] = 'neutral';
    }
    // If no conflicts and few harmful ingredients, don't add entry (unknown/beneficial)
  });
  
  return compatibility;
}

