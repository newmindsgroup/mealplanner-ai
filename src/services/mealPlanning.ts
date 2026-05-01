import type { Person, WeeklyPlan, DayPlan, Meal, BloodType } from '../types';
import { startOfWeek, addDays, format } from 'date-fns';
import { generateAIWeeklyPlan } from './aiMealPlanning';
import { enrichMealIngredients } from '../utils/mealEnrichment';

// Import blood type utilities for compatibility checking
import { getRecommendedFoods, getBaseBloodType } from '../utils/bloodTypeUtils';

// Sample meal templates with realistic ingredients
const mealTemplates: Omit<Meal, 'id' | 'bloodTypeCompatible'>[] = [
  {
    name: 'Spinach and Mushroom Scramble',
    type: 'breakfast',
    description: 'Protein-rich breakfast with iron-packed greens and savory mushrooms',
    ingredients: ['2 eggs', '1 cup fresh spinach', '1/2 cup sliced mushrooms', '1 tbsp olive oil', 'pinch of salt', 'black pepper'],
    instructions: [
      'Heat olive oil in a non-stick pan over medium heat',
      'Add sliced mushrooms and sauté for 3-4 minutes',
      'Add fresh spinach and cook until wilted, about 2 minutes',
      'Beat eggs in a bowl with salt and pepper',
      'Pour eggs over vegetables and gently scramble',
      'Cook until eggs are set but still moist, about 3 minutes',
    ],
    prepTime: 5,
    cookTime: 10,
    rationale: 'Eggs provide complete protein and essential amino acids. Spinach is rich in iron and folate, while mushrooms add vitamin D and umami flavor. Olive oil provides healthy monounsaturated fats.',
    tags: ['quick', 'protein', 'iron', 'vegetarian'],
    cuisine: 'american',
    servingSize: '1 serving (2 eggs)',
  },
  {
    name: 'Grilled Salmon with Quinoa and Broccoli',
    type: 'lunch',
    description: 'Omega-3 rich salmon with protein-packed quinoa and nutrient-dense broccoli',
    ingredients: ['6 oz salmon fillet', '1 cup cooked quinoa', '1.5 cups broccoli florets', '1 tbsp olive oil', 'lemon juice', 'garlic', 'salt', 'black pepper'],
    instructions: [
      'Cook quinoa according to package directions (1/3 cup dry quinoa)',
      'Season salmon with salt, pepper, and garlic',
      'Grill or pan-sear salmon for 4-5 minutes per side until cooked through',
      'Steam broccoli florets for 5-7 minutes until tender-crisp',
      'Drizzle olive oil and fresh lemon juice over cooked salmon',
      'Serve salmon over quinoa with broccoli on the side',
    ],
    prepTime: 10,
    cookTime: 20,
    rationale: 'Salmon is an excellent source of omega-3 fatty acids for brain and heart health. Quinoa provides complete protein with all essential amino acids. Broccoli delivers vitamins C, K, and fiber for digestive health.',
    tags: ['omega-3', 'protein', 'brain-health', 'heart-health'],
    cuisine: 'mediterranean',
    servingSize: '1 serving (6 oz salmon, 1 cup quinoa)',
  },
  {
    name: 'Asian Chicken Stir-Fry with Vegetables',
    type: 'dinner',
    description: 'Colorful chicken stir-fry loaded with fresh vegetables and aromatic spices',
    ingredients: ['6 oz chicken breast', '1 cup broccoli florets', '1/2 cup sliced carrots', '1/2 cup bell peppers', '2 cloves garlic', '1 tbsp fresh ginger', '2 tbsp olive oil', 'tamari sauce', 'sesame seeds'],
    instructions: [
      'Cut chicken breast into bite-sized strips',
      'Heat olive oil in a wok or large skillet over high heat',
      'Add minced garlic and grated ginger, stir for 30 seconds',
      'Add chicken and stir-fry for 5-6 minutes until cooked through',
      'Add broccoli, carrots, and bell peppers',
      'Stir-fry vegetables for 4-5 minutes until crisp-tender',
      'Add tamari sauce and toss to coat evenly',
      'Garnish with sesame seeds before serving',
    ],
    prepTime: 15,
    cookTime: 15,
    rationale: 'Chicken provides lean protein for muscle health. The variety of vegetables offers diverse vitamins, minerals, and antioxidants. Garlic and ginger support immune function and reduce inflammation.',
    tags: ['quick', 'protein', 'vegetables', 'anti-inflammatory'],
    cuisine: 'asian',
    servingSize: '1 serving (6 oz chicken, 2 cups vegetables)',
  },
  {
    name: 'Apple Slices with Almond Butter',
    type: 'snack',
    description: 'Crisp apple paired with creamy almond butter for sustained energy',
    ingredients: ['1 medium apple', '2 tbsp almond butter', 'cinnamon'],
    instructions: [
      'Wash and slice apple into 8-10 wedges',
      'Arrange apple slices on a plate',
      'Serve with almond butter for dipping',
      'Sprinkle with cinnamon if desired',
    ],
    prepTime: 3,
    cookTime: 0,
    rationale: 'Apples provide fiber and vitamin C for digestive and immune health. Almonds offer healthy fats, protein, and vitamin E. This combination provides steady energy without blood sugar spikes.',
    tags: ['quick', 'fiber', 'healthy-fats', 'no-cook'],
    servingSize: '1 medium apple with 2 tbsp almond butter',
  },
  {
    name: 'Turkey and Vegetable Bowl',
    type: 'lunch',
    description: 'Lean turkey with roasted vegetables over nutritious grains',
    ingredients: ['5 oz ground turkey', '1 cup spinach', '1/2 cup carrots', '1/2 cup broccoli', '1 cup cooked quinoa', 'olive oil', 'garlic', 'onion', 'salt', 'pepper'],
    instructions: [
      'Cook quinoa according to package directions',
      'Heat olive oil in a pan and sauté diced onion and garlic',
      'Add ground turkey and cook until browned',
      'Add chopped carrots and broccoli, cook for 5 minutes',
      'Add fresh spinach and cook until wilted',
      'Season with salt and pepper to taste',
      'Serve turkey and vegetables over quinoa',
    ],
    prepTime: 10,
    cookTime: 20,
    rationale: 'Turkey is a lean protein source rich in tryptophan and B vitamins. Quinoa provides complete protein and fiber. The vegetable variety ensures a wide range of vitamins and minerals.',
    tags: ['protein', 'fiber', 'balanced', 'nutrient-dense'],
    cuisine: 'american',
    servingSize: '1 bowl (5 oz turkey, 1 cup quinoa)',
  },
  {
    name: 'Baked Cod with Sweet Potato',
    type: 'dinner',
    description: 'Flaky white fish with nutrient-rich sweet potato and green beans',
    ingredients: ['6 oz cod fillet', '1 medium sweet potato', '1 cup green beans', 'olive oil', 'lemon', 'garlic', 'parsley', 'salt', 'pepper'],
    instructions: [
      'Preheat oven to 400°F (200°C)',
      'Cut sweet potato into cubes and toss with olive oil',
      'Roast sweet potato for 20 minutes',
      'Season cod with lemon, garlic, salt, and pepper',
      'Bake cod for 12-15 minutes until flaky',
      'Steam green beans for 5-7 minutes',
      'Serve cod with roasted sweet potato and green beans',
      'Garnish with fresh parsley',
    ],
    prepTime: 10,
    cookTime: 25,
    rationale: 'Cod is a lean protein rich in omega-3s and vitamin B12. Sweet potatoes provide beta-carotene and complex carbohydrates. Green beans add fiber and vitamins K and C.',
    tags: ['omega-3', 'protein', 'complex-carbs', 'heart-health'],
    cuisine: 'american',
    servingSize: '1 serving (6 oz cod, 1 sweet potato)',
  },
];

export async function generateWeeklyPlan(
  people: Person[],
  options?: {
    goals?: string[];
    cuisinePreferences?: string[];
    timeConstraints?: string;
    pantryItems?: string[];
    budgetPreference?: string;
    prioritizePantryItems?: boolean;
    useExpiringItems?: boolean;
  }
): Promise<WeeklyPlan> {
  // Try AI generation first if available
  const { getAIService } = await import('./aiService');
  if (getAIService()) {
    try {
      return await generateAIWeeklyPlan({
        people,
        goals: options?.goals || [],
        cuisinePreferences: options?.cuisinePreferences || [],
        timeConstraints: options?.timeConstraints,
        pantryItems: options?.pantryItems,
        budgetPreference: options?.budgetPreference,
        prioritizePantryItems: options?.prioritizePantryItems,
        useExpiringItems: options?.useExpiringItems,
      });
    } catch (error) {
      console.warn('AI meal planning failed, falling back to basic plan:', error);
    }
  }

  // Fallback to basic plan
  const weekStart = new Date(); // Start from today
  const days: DayPlan[] = [];

  // Get compatible blood types (group by base type for meal compatibility)
  const bloodTypes = [...new Set(people.map((p) => p.bloodType))];
  const baseBloodTypes = [...new Set(people.map((p) => getBaseBloodType(p.bloodType)))];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Generate meals for each type
    const breakfast = createMeal('breakfast', bloodTypes, i);
    const lunch = createMeal('lunch', bloodTypes, i);
    const dinner = createMeal('dinner', bloodTypes, i);
    const snack = createMeal('snack', bloodTypes, i);

    days.push({
      date: dateStr,
      breakfast,
      lunch,
      dinner,
      snack,
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

function createMeal(
  type: Meal['type'],
  bloodTypes: BloodType[],
  dayIndex: number
): Meal {
  // Select a template based on type and day
  const templates = mealTemplates.filter((m) => m.type === type);
  const template = templates[dayIndex % templates.length] || templates[0];

  const baseMeal: Meal = {
    ...template,
    id: crypto.randomUUID(),
    bloodTypeCompatible: bloodTypes,
  };
  
  // Enrich meal with food database information
  return enrichMealIngredients(baseMeal, bloodTypes);
}

