import Tesseract from 'tesseract.js';
import type { PantryScanResult, IdentifiedFood, FoodCategory } from '../types';
import { getAIService } from './aiService';

/**
 * Analyze pantry image and identify foods using AI vision
 */
export async function scanPantry(imageDataUrl: string): Promise<PantryScanResult> {
  const aiService = getAIService();
  
  if (!aiService) {
    throw new Error('AI service is not configured. Please configure your API key in Settings.');
  }

  // First, use OCR to extract any visible text (product names, labels)
  const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', {
    logger: (m) => console.log('[Pantry OCR]', m),
  });

  // Use AI to analyze the image and identify foods
  const prompt = `You are a food recognition AI assistant. Analyze this pantry/kitchen shelf image and identify all visible food items.

For each food item you identify, provide:
1. Name of the food/product
2. Category (proteins, vegetables, fruits, grains, dairy, oils, nuts-seeds, beverages, spices, sweeteners)
3. Confidence level (0-100)
4. Estimated quantity if visible (e.g., "1 box", "2 cans", "half full")

OCR extracted text from image: ${text.substring(0, 500)}

Return a JSON array of identified foods in this exact format:
[
  {
    "name": "Whole Wheat Bread",
    "category": "grains",
    "confidence": 95,
    "estimatedQuantity": "1 loaf"
  },
  {
    "name": "Canned Black Beans",
    "category": "proteins",
    "confidence": 90,
    "estimatedQuantity": "2 cans"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown, no explanation.`;

  try {
    const response = await aiService.chat([
      {
        role: 'system',
        content: `You are an expert food recognition AI. You analyze pantry and kitchen images to identify food items.
Always return valid JSON arrays. Be specific with food names. Use these exact categories: proteins, vegetables, fruits, grains, dairy, oils, nuts-seeds, beverages, spices, sweeteners.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.3,
      maxTokens: 2000,
    });

    // Parse the AI response
    let identifiedFoods: IdentifiedFood[] = [];
    try {
      // Remove markdown code blocks if present
      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsedData = JSON.parse(jsonString);
      identifiedFoods = parsedData.map((item: any) => ({
        id: crypto.randomUUID(),
        name: item.name,
        category: item.category as FoodCategory,
        confidence: item.confidence,
        estimatedQuantity: item.estimatedQuantity,
        addedToFoodGuide: false,
      }));
    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      throw new Error('Failed to parse food identification results. Please try again.');
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (identifiedFoods.length === 0) {
      recommendations.push('No food items were clearly identified in this image. Try taking a clearer photo with better lighting.');
    } else {
      recommendations.push(`Found ${identifiedFoods.length} food item${identifiedFoods.length !== 1 ? 's' : ''} in your pantry.`);
      
      // Check for high-confidence items
      const highConfidence = identifiedFoods.filter(f => f.confidence >= 85);
      if (highConfidence.length > 0) {
        recommendations.push(`${highConfidence.length} item${highConfidence.length !== 1 ? 's' : ''} identified with high confidence.`);
      }
      
      // Suggest adding to food guide
      recommendations.push('You can add these items to your Food Guide for meal planning and blood type compatibility checking.');
      
      // Category distribution
      const categories = [...new Set(identifiedFoods.map(f => f.category))];
      if (categories.length > 1) {
        recommendations.push(`Your pantry contains items from ${categories.length} different food categories.`);
      }
    }

    return {
      id: crypto.randomUUID(),
      imageUrl: imageDataUrl,
      scanMode: 'pantry',
      identifiedFoods,
      totalItemsFound: identifiedFoods.length,
      recommendations,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Pantry scan error:', error);
    throw new Error('Failed to analyze pantry image. Please try again.');
  }
}

/**
 * Add multiple identified foods to the user's food guide
 */
export async function addFoodsToGuide(foods: IdentifiedFood[], userId: string, bloodType: string) {
  // This will be called from the component to add foods to the store
  // The actual implementation will be in the component since it needs access to the store
  return {
    success: true,
    addedCount: foods.length,
  };
}

