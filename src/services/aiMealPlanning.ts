import { getAIService } from './aiService';
import type { Person, WeeklyPlan, DayPlan, Meal, BloodType } from '../types';
import { startOfWeek, addDays, format } from 'date-fns';
import { enrichMealIngredients } from '../utils/mealEnrichment';

interface MealPlanRequest {
  people: Person[];
  goals: string[];
  cuisinePreferences: string[];
  timeConstraints?: string;
  pantryItems?: string[];
  budgetPreference?: string;
  prioritizePantryItems?: boolean;
  useExpiringItems?: boolean;
}

const MEAL_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    ingredients: { type: 'array', items: { type: 'string' } },
    instructions: { type: 'array', items: { type: 'string' } },
    prepTime: { type: 'number' },
    cookTime: { type: 'number' },
    rationale: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    cuisine: { type: 'string' },
    servingSize: { type: 'string' },
    nutritionalInfo: {
      type: 'object',
      properties: {
        calories: { type: 'number' },
        protein: { type: 'number' },
        carbs: { type: 'number' },
        fats: { type: 'number' },
        fiber: { type: 'number' },
      },
    },
  },
  required: ['name', 'description', 'ingredients', 'instructions', 'rationale'],
};

const DAY_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    breakfast: MEAL_SCHEMA,
    lunch: MEAL_SCHEMA,
    dinner: MEAL_SCHEMA,
    snack: MEAL_SCHEMA,
  },
  required: ['breakfast', 'lunch', 'dinner', 'snack'],
};

export async function generateAIWeeklyPlan(request: MealPlanRequest): Promise<WeeklyPlan> {
  const aiService = getAIService();

  if (!aiService) {
    // Fallback to basic meal planning
    return generateBasicPlan(request.people);
  }

  const weekStart = startOfWeek(new Date());
  const bloodTypes = [...new Set(request.people.map((p) => p.bloodType))];
  const allergies = [
    ...new Set(request.people.flatMap((p) => p.allergies)),
  ];
  
  // Import blood type utilities
  const { getRecommendedFoods, getFoodsToAvoid, formatBloodType } = await import('../utils/bloodTypeUtils');

  const prompt = `Generate a comprehensive 7-day meal plan for the following family:

Family Members:
${request.people
  .map(
    (p) =>
      `- ${p.name}: Blood Type ${p.bloodType}, Age ${p.age}, Allergies: ${p.allergies.join(', ') || 'None'}, Goals: ${p.goals.join(', ') || 'None'}, Dietary: ${p.dietaryCodes.join(', ') || 'None'}`
  )
  .join('\n')}

Goals: ${request.goals.join(', ') || 'General health'}
Cuisine Preferences: ${request.cuisinePreferences.join(', ') || 'Any'}
Time Constraints: ${request.timeConstraints || 'Flexible'}
Budget: ${request.budgetPreference || 'Moderate'}
Pantry Items Available: ${request.pantryItems?.join(', ') || 'None specified'}
${request.prioritizePantryItems ? 'IMPORTANT: Prioritize using available pantry items in recipes' : ''}
${request.useExpiringItems ? 'IMPORTANT: Use pantry items that are expiring soon when possible' : ''}

Requirements:
1. All meals must be compatible with blood types: ${bloodTypes.join(', ')}
   - Recommended foods for these blood types should be prioritized
   - Foods to avoid for these blood types must be excluded
2. Must avoid: ${allergies.join(', ') || 'None'}
3. Each day needs: breakfast, lunch, dinner, and snack
4. Include detailed information for each meal:
   - Prep time and cook time
   - Serving size (e.g., "2 servings", "Serves 4")
   - Nutritional information (calories, protein, carbs, fats, fiber per serving)
   - Specific ingredient quantities where possible
   - Step-by-step cooking instructions
5. Provide rationale explaining why each meal works for the family's blood types
6. Use seasonal, whole-food ingredients when possible
7. Consider cultural preferences: ${request.cuisinePreferences.join(', ')}
8. Include variety: different protein sources, vegetables, and cooking methods throughout the week

Generate the meal plan as a JSON array with 7 day plans. Each day should have breakfast, lunch, dinner, and snack.
Each meal should include:
- name: meal name
- description: brief appealing description
- ingredients: array of ingredients with quantities (e.g., "2 eggs", "1 cup spinach")
- instructions: detailed step-by-step array
- prepTime: preparation time in minutes
- cookTime: cooking time in minutes
- rationale: why this meal works for the blood types
- tags: array of descriptive tags (e.g., "high-protein", "quick", "vegetarian")
- cuisine: cuisine type
- servingSize: serving information
- nutritionalInfo: object with calories, protein (g), carbs (g), fats (g), fiber (g)

Return ONLY valid JSON matching this structure:
{
  "days": [
    {
      "breakfast": { name, description, ingredients, instructions, prepTime, cookTime, rationale, tags, cuisine, servingSize, nutritionalInfo },
      "lunch": { ... },
      "dinner": { ... },
      "snack": { ... }
    },
    // ... 6 more days
  ]
}`;

  try {
    const response = await aiService.generateJSON<{ days: DayPlan[] }>(
      prompt,
      {
        type: 'object',
        properties: {
          days: {
            type: 'array',
            items: DAY_PLAN_SCHEMA,
            minItems: 7,
            maxItems: 7,
          },
        },
        required: ['days'],
      },
      {
        temperature: 0.8,
        maxTokens: 8000,
      }
    );

    // Transform AI response into WeeklyPlan format
    const days: DayPlan[] = response.days.map((day, index) => {
      const date = addDays(weekStart, index);
      return {
        date: format(date, 'yyyy-MM-dd'),
        breakfast: enrichMeal(day.breakfast, 'breakfast', bloodTypes),
        lunch: enrichMeal(day.lunch, 'lunch', bloodTypes),
        dinner: enrichMeal(day.dinner, 'dinner', bloodTypes),
        snack: enrichMeal(day.snack, 'snack', bloodTypes),
      };
    });

    return {
      id: crypto.randomUUID(),
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      days,
      people: request.people,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('AI meal planning error:', error);
    // Fallback to basic plan
    return generateBasicPlan(request.people);
  }
}

function enrichMeal(
  mealData: any,
  type: Meal['type'],
  bloodTypes: BloodType[]
): Meal {
  // Create base meal from AI data
  const baseMeal: Meal = {
    id: crypto.randomUUID(),
    name: mealData.name,
    type,
    description: mealData.description || '',
    ingredients: mealData.ingredients || [],
    instructions: mealData.instructions || [],
    prepTime: mealData.prepTime || 0,
    cookTime: mealData.cookTime || 0,
    rationale: mealData.rationale || '',
    tags: mealData.tags || [],
    cuisine: mealData.cuisine,
    bloodTypeCompatible: bloodTypes,
    servingSize: mealData.servingSize,
    nutritionalInfo: mealData.nutritionalInfo,
  };
  
  // Enrich meal with food database information
  return enrichMealIngredients(baseMeal, bloodTypes);
}

// Fallback basic plan generator
function generateBasicPlan(people: Person[]): WeeklyPlan {
  const weekStart = startOfWeek(new Date());
  const days: DayPlan[] = [];
  const bloodTypes = [...new Set(people.map((p) => p.bloodType))];

  // This would use the existing basic meal planning logic
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    days.push({
      date: format(date, 'yyyy-MM-dd'),
      breakfast: createBasicMeal('breakfast', i, bloodTypes),
      lunch: createBasicMeal('lunch', i, bloodTypes),
      dinner: createBasicMeal('dinner', i, bloodTypes),
      snack: createBasicMeal('snack', i, bloodTypes),
    });
  }

  return {
    id: crypto.randomUUID(),
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    days,
    people,
    createdAt: new Date().toISOString(),
  };
}

function createBasicMeal(type: Meal['type'], dayIndex: number, bloodTypes: BloodType[]): Meal {
  const meals = {
    breakfast: [
      'Spinach and Mushroom Scramble',
      'Oatmeal with Walnuts and Banana',
      'Yogurt Parfait with Berries',
      'Salmon and Avocado Toast',
      'Quinoa Breakfast Bowl',
      'Berry Smoothie Bowl',
      'Turkey Sausage with Sweet Potato Hash'
    ],
    lunch: [
      'Grilled Salmon Salad',
      'Turkey and Spinach Wrap',
      'Chicken and Vegetable Soup',
      'Quinoa Buddha Bowl',
      'Tuna Salad with Mixed Greens',
      'Mediterranean Chicken Bowl',
      'Beef and Broccoli Stir-Fry'
    ],
    dinner: [
      'Baked Cod with Roasted Vegetables',
      'Grilled Chicken with Quinoa',
      'Salmon with Sweet Potato and Asparagus',
      'Turkey Meatballs with Zucchini Noodles',
      'Lamb Chops with Green Beans',
      'Herb-Crusted Halibut with Brussels Sprouts',
      'Beef Stir-Fry with Bok Choy'
    ],
    snack: [
      'Apple Slices with Almond Butter',
      'Walnuts and Dried Figs',
      'Carrots and Hummus',
      'Pineapple Chunks',
      'Mixed Nuts',
      'Celery with Almond Butter',
      'Fresh Cherries'
    ],
  };
  
  const ingredients = {
    breakfast: [
      ['2 eggs', '1 cup spinach', '1/2 cup mushrooms', '1 tbsp olive oil', 'salt', 'pepper'],
      ['1 cup oats', '1/2 cup walnuts', '1 banana', 'cinnamon', 'pinch salt'],
      ['1 cup yogurt', '1/2 cup blueberries', '1/4 cup strawberries', '2 tbsp walnuts', 'honey'],
      ['3 oz salmon', '1 slice whole grain bread', '1/2 avocado', 'lemon juice', 'spinach'],
      ['1 cup quinoa', '1 banana', '1/4 cup walnuts', 'cinnamon', 'almond milk'],
      ['1 cup mixed berries', '1/2 banana', '1 cup spinach', '1 tbsp almond butter', 'water'],
      ['4 oz turkey sausage', '1 medium sweet potato', '1/2 onion', 'bell peppers', 'olive oil']
    ],
    lunch: [
      ['6 oz salmon', '2 cups mixed greens', '1/2 cucumber', 'tomato', 'olive oil', 'lemon juice'],
      ['4 oz turkey breast', 'whole grain tortilla', '1 cup spinach', 'tomato', 'carrots'],
      ['5 oz chicken breast', '2 cups mixed vegetables', 'carrots', 'celery', 'onion', 'garlic'],
      ['1 cup quinoa', '1/2 cup chickpeas', 'cucumber', 'tomato', 'spinach', 'olive oil', 'lemon'],
      ['5 oz tuna', '2 cups mixed greens', 'cucumber', 'carrots', 'olive oil', 'lemon juice'],
      ['5 oz chicken', '1 cup quinoa', 'cucumber', 'tomato', 'onion', 'olive oil', 'lemon'],
      ['5 oz beef', '2 cups broccoli', 'garlic', 'ginger', 'olive oil', 'tamari']
    ],
    dinner: [
      ['6 oz cod', '1 cup broccoli', '1 cup carrots', '1/2 cup bell peppers', 'olive oil', 'garlic', 'lemon'],
      ['6 oz chicken breast', '1 cup quinoa', '1 cup asparagus', 'olive oil', 'garlic', 'herbs'],
      ['6 oz salmon', '1 medium sweet potato', '1 cup asparagus', 'olive oil', 'lemon', 'dill'],
      ['6 oz ground turkey', 'zucchini', 'onion', 'garlic', 'tomato', 'olive oil', 'herbs'],
      ['6 oz lamb chops', '1.5 cups green beans', 'olive oil', 'garlic', 'rosemary'],
      ['6 oz halibut', '1.5 cups brussels sprouts', 'olive oil', 'garlic', 'lemon', 'herbs'],
      ['6 oz beef', '2 cups bok choy', 'garlic', 'ginger', 'olive oil', 'sesame seeds']
    ],
    snack: [
      ['1 apple', '2 tbsp almond butter', 'cinnamon'],
      ['1/4 cup walnuts', '3-4 dried figs'],
      ['1 cup carrot sticks', '1/4 cup hummus'],
      ['1 cup fresh pineapple chunks'],
      ['1/4 cup mixed nuts (almonds, walnuts)'],
      ['3 celery sticks', '2 tbsp almond butter'],
      ['1 cup fresh cherries']
    ]
  };
  
  const descriptions = {
    breakfast: [
      'Protein-rich scramble with iron-packed greens and savory mushrooms',
      'Hearty oatmeal with omega-3 rich walnuts and sweet banana',
      'Creamy yogurt layered with antioxidant-rich berries and crunchy walnuts',
      'Omega-3 packed salmon on whole grain toast with creamy avocado',
      'Protein-rich quinoa bowl with natural sweetness from banana',
      'Refreshing smoothie bowl loaded with antioxidants and vitamins',
      'Savory breakfast with lean turkey and nutrient-dense sweet potato'
    ],
    lunch: [
      'Omega-3 rich grilled salmon over crisp mixed greens',
      'Lean turkey wrapped with fresh vegetables and whole grains',
      'Warming soup with lean protein and colorful vegetables',
      'Plant-powered bowl with complete protein from quinoa and chickpeas',
      'Light and refreshing tuna salad with crisp vegetables',
      'Mediterranean-inspired bowl with herbs and fresh vegetables',
      'Protein-packed stir-fry with nutrient-dense broccoli'
    ],
    dinner: [
      'Flaky white fish with colorful roasted vegetables',
      'Lean grilled chicken with protein-rich quinoa and asparagus',
      'Heart-healthy salmon with complex carbs and green vegetables',
      'Lean turkey meatballs with low-carb zucchini noodles',
      'Rich lamb chops with crisp-tender green beans',
      'Delicate halibut with roasted brussels sprouts',
      'Tender beef with Asian greens and aromatic spices'
    ],
    snack: [
      'Crisp apple paired with creamy almond butter',
      'Omega-3 rich walnuts with naturally sweet figs',
      'Crunchy carrots with protein-rich chickpea dip',
      'Tropical pineapple chunks for natural sweetness',
      'Energy-boosting mix of nuts',
      'Crunchy celery with creamy almond butter',
      'Antioxidant-rich fresh cherries'
    ],
  };

  const rationales = {
    breakfast: [
      'Eggs provide complete protein. Spinach delivers iron and folate. Mushrooms add vitamin D and B vitamins.',
      'Oats provide sustained energy from complex carbs. Walnuts add omega-3s. Banana offers potassium and natural sweetness.',
      'Yogurt provides probiotics and protein. Berries offer antioxidants. Walnuts add healthy omega-3 fats.',
      'Salmon provides omega-3s and vitamin D. Avocado offers healthy fats. Whole grains provide sustained energy.',
      'Quinoa offers complete protein. Banana provides quick energy. Walnuts add omega-3s and healthy fats.',
      'Berries provide antioxidants. Spinach adds iron and vitamins. Almond butter offers protein and healthy fats.',
      'Turkey provides lean protein. Sweet potato offers complex carbs and vitamin A. Vegetables add fiber and nutrients.'
    ],
    lunch: [
      'Salmon provides omega-3 fatty acids for heart and brain health. Mixed greens offer vitamins and minerals.',
      'Turkey is lean protein rich in B vitamins. Whole grain provides fiber. Vegetables add vitamins and crunch.',
      'Chicken offers lean protein. Variety of vegetables provides diverse nutrients, vitamins, and fiber.',
      'Quinoa provides complete protein. Chickpeas add fiber and protein. Vegetables offer vitamins and minerals.',
      'Tuna is rich in omega-3s and protein. Mixed greens provide vitamins, minerals, and fiber.',
      'Chicken provides lean protein. Quinoa offers complete protein. Fresh vegetables add vitamins and Mediterranean flavor.',
      'Beef provides iron and B12. Broccoli offers vitamin C and fiber. Garlic and ginger support immune function.'
    ],
    dinner: [
      'Cod is lean protein with omega-3s. Roasted vegetables provide fiber, vitamins, and antioxidants.',
      'Chicken is lean protein. Quinoa provides complete protein and fiber. Asparagus adds vitamins K and folate.',
      'Salmon provides omega-3s for heart health. Sweet potato offers complex carbs. Asparagus adds folate and fiber.',
      'Turkey is lean, high-quality protein. Zucchini provides low-carb vegetables with vitamins and minerals.',
      'Lamb offers iron and B12. Green beans provide fiber and vitamin K. Herbs add antioxidants.',
      'Halibut is lean protein with omega-3s. Brussels sprouts provide vitamin C, K, and fiber.',
      'Beef provides iron and complete protein. Bok choy offers calcium and vitamins. Ginger supports digestion.'
    ],
    snack: [
      'Apples provide fiber and vitamin C. Almond butter offers protein, healthy fats, and vitamin E.',
      'Walnuts provide omega-3 fatty acids. Figs offer natural sweetness, fiber, and minerals.',
      'Carrots provide beta-carotene and fiber. Hummus adds protein and healthy fats from chickpeas.',
      'Pineapple provides vitamin C and bromelain enzyme for digestion and anti-inflammation.',
      'Mixed nuts provide healthy fats, protein, vitamin E, and sustained energy.',
      'Celery provides fiber and hydration. Almond butter adds protein and healthy fats.',
      'Cherries provide antioxidants and may support sleep and reduce inflammation.'
    ],
  };

  const baseMeal: Meal = {
    id: crypto.randomUUID(),
    name: meals[type][dayIndex % meals[type].length],
    type,
    description: descriptions[type][dayIndex % descriptions[type].length],
    ingredients: ingredients[type][dayIndex % ingredients[type].length],
    instructions: type === 'snack' 
      ? ['Prepare ingredients as needed', 'Arrange on a plate', 'Serve fresh']
      : ['Prepare and measure all ingredients', 'Follow standard cooking methods for protein and vegetables', 'Cook until properly done', 'Season to taste', 'Serve while fresh'],
    prepTime: type === 'snack' ? 3 : type === 'breakfast' ? 8 : 12,
    cookTime: type === 'snack' ? 0 : type === 'breakfast' ? 12 : 20,
    rationale: rationales[type][dayIndex % rationales[type].length],
    tags: [type, 'healthy', 'balanced'],
    bloodTypeCompatible: bloodTypes,
    servingSize: type === 'snack' ? '1 snack portion' : '1 serving',
  };
  
  // Enrich the basic meal with food database information
  return enrichMealIngredients(baseMeal, bloodTypes);
}

