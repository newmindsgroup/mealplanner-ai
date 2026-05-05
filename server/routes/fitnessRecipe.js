/**
 * AI Recipe Generator API — Phase 10
 * POST /api/fitness/ai-recipe — Generate a meal recipe from AI based on macros, preferences, and goals
 * POST /api/fitness/ai-recipe/analyze — Analyze a pasted recipe for nutrition
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

let Anthropic;
try { Anthropic = require('@anthropic-ai/sdk'); } catch { Anthropic = null; }

router.use(authenticateToken);

// POST /api/fitness/ai-recipe
router.post('/', asyncHandler(async (req, res) => {
  const {
    mealType = 'any',         // breakfast | lunch | dinner | snack | pre-workout | post-workout
    targetCalories,            // e.g. 500
    targetProtein,             // g
    targetCarbs,               // g
    targetFat,                 // g
    dietaryPreferences = [],   // ['vegetarian', 'gluten-free', 'dairy-free', ...]
    allergies = [],            // ['peanuts', 'shellfish', ...]
    cuisinePreference = 'any', // 'Mediterranean', 'Asian', 'Mexican', etc.
    cookingTime = 'any',       // 'quick' (<15min), 'moderate' (<30min), 'elaborate' (<60min)
    ingredients = [],          // preferred or available ingredients
    servings = 1,
    personName,
    bloodType,
    fitnessGoal,
  } = req.body;

  if (!Anthropic || !process.env.ANTHROPIC_API_KEY) {
    return res.json({
      success: true,
      data: getFallbackRecipe(mealType, targetCalories),
    });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are a world-class nutritionist and chef. Generate a delicious, healthy recipe.

REQUIREMENTS:
- Meal type: ${mealType}
- Target: ${targetCalories ? `~${targetCalories} calories` : 'balanced'} | Protein: ${targetProtein ? `~${targetProtein}g` : 'moderate'} | Carbs: ${targetCarbs ? `~${targetCarbs}g` : 'moderate'} | Fat: ${targetFat ? `~${targetFat}g` : 'moderate'}
- Dietary: ${dietaryPreferences.length ? dietaryPreferences.join(', ') : 'none'}
- Allergies: ${allergies.length ? allergies.join(', ') : 'none'}
- Cuisine: ${cuisinePreference}
- Cooking time: ${cookingTime}
- Available ingredients: ${ingredients.length ? ingredients.join(', ') : 'any'}
- Servings: ${servings}
${bloodType ? `- Blood type: ${bloodType} (use as supplementary context only — not medically proven)` : ''}
${fitnessGoal ? `- Fitness goal: ${fitnessGoal}` : ''}
${personName ? `- For: ${personName}` : ''}

Return ONLY valid JSON:
{
  "name": "<recipe name>",
  "description": "<one line description>",
  "prepTime": "<e.g. 10 min>",
  "cookTime": "<e.g. 20 min>",
  "servings": ${servings},
  "difficulty": "easy|medium|hard",
  "tags": ["<tag1>", "<tag2>"],
  "ingredients": [
    {"name": "<ingredient>", "amount": "<e.g. 200g>", "notes": "<optional>"}
  ],
  "instructions": ["<step 1>", "<step 2>"],
  "nutrition": {
    "calories": <number>,
    "protein": <grams>,
    "carbs": <grams>,
    "fat": <grams>,
    "fiber": <grams>,
    "sugar": <grams>
  },
  "tips": "<chef tip>",
  "substitutions": [{"original": "<ingredient>", "substitute": "<alternative>", "note": "<why>"}],
  "mealPrepNotes": "<how to store/prep ahead>"
}`;

  const msg = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return res.json({ success: true, data: getFallbackRecipe(mealType, targetCalories) });
  }

  const recipe = JSON.parse(match[0]);
  res.json({ success: true, data: recipe });
}));

// POST /api/fitness/ai-recipe/analyze — analyze a pasted recipe
router.post('/analyze', asyncHandler(async (req, res) => {
  const { recipeText } = req.body;
  if (!recipeText) return res.status(400).json({ success: false, error: 'recipeText is required' });

  if (!Anthropic || !process.env.ANTHROPIC_API_KEY) {
    return res.json({
      success: true,
      data: {
        name: 'Analyzed Recipe',
        nutrition: { calories: 450, protein: 30, carbs: 45, fat: 18, fiber: 6, sugar: 8 },
        ingredients: [{ name: 'Could not analyze', amount: '-', notes: 'AI key required' }],
        dietLabels: ['Balanced'],
        allergenWarnings: [],
      },
    });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const msg = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Analyze this recipe and return its nutritional breakdown. Be precise.

RECIPE:
${recipeText.slice(0, 2000)}

Return ONLY valid JSON:
{
  "name": "<detected recipe name>",
  "servings": <number>,
  "nutrition": {"calories": <num>, "protein": <g>, "carbs": <g>, "fat": <g>, "fiber": <g>, "sugar": <g>},
  "ingredients": [{"name": "<ingredient>", "amount": "<amount>"}],
  "dietLabels": ["<e.g. High Protein>", "<e.g. Low Carb>"],
  "allergenWarnings": ["<e.g. Contains dairy>"],
  "healthScore": <1-10>,
  "suggestions": "<how to improve this recipe nutritionally>"
}`
    }],
  });

  const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return res.status(500).json({ success: false, error: 'Analysis failed' });

  res.json({ success: true, data: JSON.parse(match[0]) });
}));

function getFallbackRecipe(mealType, calories) {
  return {
    name: 'Grilled Chicken Power Bowl',
    description: 'High-protein bowl with quinoa, roasted vegetables, and tahini dressing',
    prepTime: '10 min', cookTime: '25 min', servings: 1, difficulty: 'easy',
    tags: ['high-protein', 'meal-prep', 'balanced'],
    ingredients: [
      { name: 'Chicken breast', amount: '150g' },
      { name: 'Quinoa', amount: '80g dry' },
      { name: 'Sweet potato', amount: '100g' },
      { name: 'Broccoli', amount: '100g' },
      { name: 'Tahini', amount: '1 tbsp' },
      { name: 'Olive oil', amount: '1 tsp' },
    ],
    instructions: [
      'Cook quinoa according to package directions.',
      'Season chicken with salt, pepper, and paprika. Grill for 6-7 min per side.',
      'Dice sweet potato, toss with olive oil. Roast at 200°C for 20 min with broccoli.',
      'Assemble bowl: quinoa base, sliced chicken, roasted vegetables. Drizzle tahini.',
    ],
    nutrition: { calories: calories || 520, protein: 42, carbs: 52, fat: 14, fiber: 8, sugar: 6 },
    tips: 'Prep 4 portions on Sunday — stores 4 days in the fridge.',
    substitutions: [{ original: 'Chicken', substitute: 'Tofu (firm)', note: 'Press and bake at 200°C for crispy texture' }],
    mealPrepNotes: 'Store in glass containers. Reheat chicken and quinoa separately for best texture.',
  };
}

module.exports = router;
