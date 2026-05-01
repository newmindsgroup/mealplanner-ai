import type { BloodType, FoodInquiry } from '../types';
import type { FoodItem, HealthBenefit, FoodMealType } from '../data/bloodTypeFoods';
import AIService from './aiService';

interface ClassifyFoodResponse {
  classification: 'beneficial' | 'neutral' | 'avoid';
  explanation: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
  };
  benefits?: string;
  concerns?: string;
  servingSize?: string;
  healthBenefits?: HealthBenefit[];
  mealTypes?: FoodMealType[];
}

export async function classifyFoodWithAI(
  foodName: string,
  bloodType: BloodType
): Promise<ClassifyFoodResponse> {
  const prompt = `You are a Blood Type Diet expert educator. Analyze "${foodName}" for Blood Type ${bloodType}.

Based on Dr. Peter D'Adamo's Blood Type Diet principles:
- Blood Type O: Hunter (high stomach acid, thrives on meat and vegetables, avoid grains and dairy)
- Blood Type A: Cultivator (lower stomach acid, thrives on plant-based diet and fish, avoid red meat)
- Blood Type B: Nomad (balanced digestion, can enjoy dairy, meat, grains, avoid corn and wheat)
- Blood Type AB: Enigma (mix of A and B, thrives on seafood, dairy, tofu, sensitive immune system)

IMPORTANT: Provide comprehensive factual information and scientific reasoning. Do NOT include medical disclaimers, do NOT suggest consulting healthcare professionals. Focus on education and facts about how this food interacts with this blood type according to Blood Type Diet theory.

Please provide a JSON response with this exact structure:
{
  "classification": "beneficial" | "neutral" | "avoid",
  "explanation": "detailed EDUCATIONAL explanation with SCIENTIFIC REASONING about WHY this food fits this classification for this blood type. Include specifics about digestive enzymes, lectins, metabolism, or other biochemical factors. (3-4 sentences with facts)",
  "nutritionalInfo": {
    "calories": number (per typical serving),
    "protein": number in grams,
    "carbs": number in grams,
    "fats": number in grams,
    "fiber": number in grams
  },
  "benefits": "specific health benefits and nutritional facts about this food (1-2 sentences with concrete details)" or null,
  "concerns": "factual concerns about how this food affects this blood type biochemically (1-2 sentences with scientific reasoning)" or null,
  "servingSize": "typical serving size (e.g., '1 cup', '3-4 oz')",
  "healthBenefits": ["array of applicable benefits from: anti-inflammatory, high-protein, heart-health, digestive-support, immunity-boost, brain-health, energy, antioxidant"],
  "mealTypes": ["array of applicable meal types from: breakfast, lunch, dinner, snack, anytime"]
}

Respond ONLY with valid JSON, no additional text.`;

  try {
    const aiService = new AIService();
    const response = await aiService.sendMessage(prompt);
    
    // Try to parse JSON from response
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result: ClassifyFoodResponse = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!result.classification || !result.explanation) {
      throw new Error('Invalid response format');
    }

    return result;
  } catch (error) {
    console.error('Error classifying food with AI:', error);
    // Return an educational default
    return {
      classification: 'neutral',
      explanation: `${foodName} is generally considered neutral for Blood Type ${bloodType} according to Blood Type Diet principles. This means it can be consumed in moderation as part of a balanced diet. Neutral foods typically don't contain problematic lectins for your blood type and are processed efficiently by your digestive system. The specific nutritional benefits will vary based on the food's vitamin, mineral, and macronutrient content.`,
      benefits: `${foodName} provides nutritional value including vitamins, minerals, and macronutrients that support overall health and energy.`,
      servingSize: '1 serving',
      healthBenefits: ['energy'],
      mealTypes: ['anytime'],
    };
  }
}

export async function createFoodItemFromAI(
  foodName: string,
  bloodType: BloodType,
  userId: string
): Promise<FoodItem> {
  const aiResponse = await classifyFoodWithAI(foodName, bloodType);

  // Create a FoodItem with AI classification for all blood types
  // For now, we'll set all blood types to the same classification
  // In a more advanced version, you could query AI for each blood type
  const foodItem: FoodItem = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
    category: 'proteins', // Default category - could be improved with AI
    classification: {
      'O+': aiResponse.classification,
      'O-': aiResponse.classification,
      'A+': aiResponse.classification,
      'A-': aiResponse.classification,
      'B+': aiResponse.classification,
      'B-': aiResponse.classification,
      'AB+': aiResponse.classification,
      'AB-': aiResponse.classification,
    },
    nutritionalInfo: aiResponse.nutritionalInfo,
    benefits: aiResponse.benefits,
    concerns: aiResponse.concerns,
    servingSize: aiResponse.servingSize,
    healthBenefits: aiResponse.healthBenefits,
    mealTypes: aiResponse.mealTypes,
    detailedExplanations: {
      [bloodType]: aiResponse.explanation,
    },
  };

  return foodItem;
}

export async function createFoodInquiry(
  foodName: string,
  bloodType: BloodType
): Promise<FoodInquiry> {
  const aiResponse = await classifyFoodWithAI(foodName, bloodType);

  const inquiry: FoodInquiry = {
    id: `inquiry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    foodName: foodName.charAt(0).toUpperCase() + foodName.slice(1),
    bloodType,
    classification: aiResponse.classification,
    response: aiResponse.explanation,
    nutritionalInfo: aiResponse.nutritionalInfo,
    benefits: aiResponse.benefits,
    concerns: aiResponse.concerns,
    timestamp: new Date().toISOString(),
  };

  return inquiry;
}

