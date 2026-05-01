import Tesseract from 'tesseract.js';
import type { LabelAnalysis } from '../types';
import { getAIService } from './aiService';
import { getAllBloodTypes, getFoodsToAvoid } from '../utils/bloodTypeUtils';
import type { BloodType } from '../types';

const problematicAdditives = [
  'artificial colors',
  'artificial flavors',
  'high fructose corn syrup',
  'sodium benzoate',
  'bht',
  'bha',
  'msg',
  'monosodium glutamate',
  'sulfites',
  'nitrates',
  'nitrites',
];

export async function analyzeLabel(imageDataUrl: string): Promise<LabelAnalysis> {
  // Perform OCR
  const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', {
    logger: (m) => console.log(m),
  });

  const extractedText = text.toLowerCase();
  
  // Detect blood type conflicts using comprehensive database
  // Check against all blood types since we don't know user's type
  const conflicts: string[] = [];
  const allBloodTypes = getAllBloodTypes();
  
  allBloodTypes.forEach((bloodType) => {
    const foodsToAvoid = getFoodsToAvoid(bloodType);
    foodsToAvoid.forEach((food) => {
      if (extractedText.includes(food.toLowerCase())) {
        conflicts.push(`Contains ${food} which may conflict with blood type ${bloodType}`);
      }
    });
  });

  // Detect additives
  const detectedAdditives = problematicAdditives.filter((additive) =>
    extractedText.includes(additive.toLowerCase())
  );

  // Generate safety flags
  const safetyFlags: LabelAnalysis['safetyFlags'] = [];
  
  if (conflicts.length > 0) {
    safetyFlags.push({
      level: 'warning',
      message: `Potential blood type compatibility issues detected (${conflicts.length} conflicts)`,
    });
  }

  if (detectedAdditives.length > 0) {
    safetyFlags.push({
      level: 'caution',
      message: `Contains ${detectedAdditives.length} potentially problematic additive(s): ${detectedAdditives.join(', ')}`,
    });
  }

  if (safetyFlags.length === 0) {
    safetyFlags.push({
      level: 'safe',
      message: 'No obvious conflicts detected. This supplement appears compatible with your blood type based on the ingredient analysis.',
    });
  }

  // Generate recommendations (enhanced with AI if available)
  let recommendations: string[] = [];
  
  const aiService = getAIService();
  if (aiService && extractedText.length > 50) {
    try {
      const aiRecommendations = await aiService.chat([
        {
          role: 'system',
          content: `You are a nutrition educator specializing in blood type diets and supplement analysis. 
Analyze the following supplement label text and provide specific, factual, and actionable recommendations.
Consider blood type compatibility based on Blood Type Diet principles, ingredient interactions, and lectin content.
Focus on education and scientific facts. Do NOT include medical disclaimers or suggest consulting healthcare professionals.
Explain the biochemical reasons why certain ingredients may or may not be compatible with specific blood types.`,
        },
        {
          role: 'user',
          content: `Analyze this supplement label and provide 2-3 specific recommendations:
          
${text.substring(0, 2000)}

Blood type conflicts detected: ${conflicts.length > 0 ? conflicts.slice(0, 3).join('; ') : 'None'}
Additives detected: ${detectedAdditives.length > 0 ? detectedAdditives.join(', ') : 'None'}

Provide concise, actionable recommendations.`,
        },
      ], {
        temperature: 0.5,
        maxTokens: 500,
      });

      // Parse AI response into recommendations
      recommendations = aiRecommendations
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-•*]\s*/, '').trim())
        .slice(0, 3);
    } catch (error) {
      console.warn('AI recommendation generation failed:', error);
    }
  }

  // Fallback recommendations
  if (recommendations.length === 0) {
    if (conflicts.length > 0) {
      recommendations.push('Some ingredients may contain lectins incompatible with your blood type. These can affect digestion and nutrient absorption based on Blood Type Diet principles.');
    }
    if (detectedAdditives.length > 0) {
      recommendations.push('Certain additives detected may cause digestive sensitivity in some blood types. Consider the additive content in relation to your blood type\'s digestive characteristics.');
    }
    if (recommendations.length === 0) {
      recommendations.push('This supplement appears compatible with your blood type based on ingredient analysis. No obvious lectin conflicts or problematic additives detected.');
    }
  }

  return {
    id: crypto.randomUUID(),
    imageUrl: imageDataUrl,
    extractedText: text,
    bloodTypeConflicts: conflicts,
    additives: detectedAdditives,
    safetyFlags,
    recommendations,
    createdAt: new Date().toISOString(),
  };
}
