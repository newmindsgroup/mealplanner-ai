/**
 * Recipe, Juicing & Smoothie Database
 *
 * Built-in collection of health-focused recipes searchable by
 * blood type, dietary restriction, health goal, ingredient, and category.
 *
 * Sources: D'Adamo (dadamo.com, 4yourtype.com), Healthline, WebMD
 */
import { BLOOD_TYPE_RECIPES } from './bloodTypeRecipes';
import { EXTENDED_RECIPES } from './extendedRecipes';
import { DINNER_DESSERT_RECIPES } from './dinnerDessertRecipes';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RecipeResult {
  name: string;
  category: 'meal' | 'smoothie' | 'juice' | 'snack' | 'soup' | 'salad';
  tags: string[];
  bloodTypes: string[];       // Compatible blood types (empty = all)
  ingredients: string[];
  instructions: string[];
  healthBenefits: string[];
  nutritionHighlights: string;
  prepTime: string;
  servings: number;
}

// ─── Recipe Database ────────────────────────────────────────────────────────

const RECIPES: RecipeResult[] = [
  // ── Smoothies ─────────────────────────────────────────────────────────
  {
    name: 'Anti-Inflammatory Turmeric Smoothie',
    category: 'smoothie',
    tags: ['anti-inflammatory', 'immune', 'gut-health', 'breakfast'],
    bloodTypes: ['O+', 'O-', 'B+', 'B-'],
    ingredients: ['1 cup coconut milk', '1 frozen banana', '1 tsp turmeric powder', '1/2 tsp cinnamon', '1 tbsp almond butter', '1/2 inch fresh ginger', 'pinch black pepper (for curcumin absorption)', '1 tsp honey'],
    instructions: ['Add all ingredients to blender', 'Blend on high for 60 seconds until smooth', 'Pour into glass, sprinkle with cinnamon'],
    healthBenefits: ['Reduces inflammation (CRP)', 'Supports joint health', 'Aids digestion', 'Boosts curcumin absorption with black pepper'],
    nutritionHighlights: '~280 cal, 8g protein, 12g healthy fats, anti-inflammatory compounds',
    prepTime: '5 min',
    servings: 1,
  },
  {
    name: 'Iron Booster Green Smoothie',
    category: 'smoothie',
    tags: ['iron', 'energy', 'anemia', 'blood-builder', 'vitamin-c'],
    bloodTypes: [],
    ingredients: ['2 cups spinach', '1 cup orange juice (vitamin C for iron absorption)', '1/2 cup frozen mango', '1 tbsp blackstrap molasses (rich in iron)', '1 tbsp chia seeds', '1/2 frozen banana'],
    instructions: ['Blend spinach and OJ first until smooth', 'Add remaining ingredients and blend 45 seconds', 'Drink immediately for max vitamin C benefit'],
    healthBenefits: ['Raises iron levels naturally', 'Vitamin C enhances non-heme iron absorption by 6x', 'Supports hemoglobin production', 'Provides folate for red blood cells'],
    nutritionHighlights: '~250 cal, 6g protein, 4.5mg iron (25% DV), 120mg vitamin C',
    prepTime: '5 min',
    servings: 1,
  },
  {
    name: 'Brain-Boosting Blueberry Smoothie',
    category: 'smoothie',
    tags: ['brain', 'nootropic', 'memory', 'focus', 'antioxidant'],
    bloodTypes: [],
    ingredients: ['1 cup blueberries', '1 cup almond milk', '1 tbsp lions mane mushroom powder', '1 tbsp walnut butter', '1 tsp MCT oil', '1/2 frozen banana', '1 tsp cacao nibs'],
    instructions: ['Blend almond milk, blueberries, and banana first', 'Add mushroom powder, walnut butter, and MCT oil', 'Blend until smooth, top with cacao nibs'],
    healthBenefits: ['Lions Mane supports NGF production', 'Blueberry anthocyanins protect brain cells', 'Omega-3 from walnuts supports neural membranes', 'MCT provides instant brain fuel'],
    nutritionHighlights: '~310 cal, 7g protein, 16g healthy fats, high antioxidants',
    prepTime: '5 min',
    servings: 1,
  },
  {
    name: 'Gut Healing Probiotic Smoothie',
    category: 'smoothie',
    tags: ['gut-health', 'probiotic', 'digestion', 'immune'],
    bloodTypes: ['A+', 'A-', 'AB+', 'AB-'],
    ingredients: ['1 cup kefir or coconut yogurt', '1/2 cup frozen pineapple', '1 tbsp ground flaxseed', '1/2 avocado', '1 tsp raw honey', 'handful of fresh mint', '1/4 tsp ginger powder'],
    instructions: ['Blend kefir, avocado, and pineapple until creamy', 'Add flaxseed, honey, ginger, and mint', 'Blend briefly, pour, and enjoy'],
    healthBenefits: ['Live probiotics from kefir', 'Prebiotic fiber from flaxseed', 'Bromelain from pineapple aids digestion', 'Avocado provides gut-healing fats'],
    nutritionHighlights: '~320 cal, 12g protein, 18g healthy fats, probiotics + prebiotics',
    prepTime: '5 min',
    servings: 1,
  },
  {
    name: 'Post-Workout Recovery Shake',
    category: 'smoothie',
    tags: ['fitness', 'recovery', 'muscle', 'protein', 'post-workout'],
    bloodTypes: [],
    ingredients: ['1.5 cups milk (or plant milk)', '1 scoop whey or plant protein', '1 frozen banana', '2 tbsp oats', '1 tbsp peanut butter', '1 tsp cacao powder', '1/4 tsp cinnamon'],
    instructions: ['Blend milk, protein powder, and banana', 'Add oats, peanut butter, cacao, and cinnamon', 'Blend until smooth, consume within 30 min of workout'],
    healthBenefits: ['Fast-absorbing protein for muscle repair', 'Carbs from banana + oats replenish glycogen', 'Healthy fats sustain recovery', 'Cacao provides magnesium for muscle relaxation'],
    nutritionHighlights: '~420 cal, 30g protein, 45g carbs, 15g fat',
    prepTime: '5 min',
    servings: 1,
  },
  {
    name: 'Thyroid Support Smoothie',
    category: 'smoothie',
    tags: ['thyroid', 'selenium', 'iodine', 'tsh'],
    bloodTypes: [],
    ingredients: ['1 cup coconut milk', '3 brazil nuts (selenium)', '1/2 cup frozen strawberries', '1 tbsp pumpkin seeds (zinc)', '1 tsp maca powder', '1/2 frozen banana', '1 pinch sea salt (iodine)'],
    instructions: ['Blend coconut milk and brazil nuts first until smooth', 'Add remaining ingredients and blend', 'Top with extra pumpkin seeds'],
    healthBenefits: ['Brazil nuts provide 544mcg selenium (990% DV) per 3 nuts', 'Zinc from pumpkin seeds supports T3 conversion', 'Maca supports endocrine balance', 'Iodine from sea salt supports thyroid hormone production'],
    nutritionHighlights: '~280 cal, 8g protein, selenium + zinc + iodine for thyroid',
    prepTime: '5 min',
    servings: 1,
  },

  // ── Juices ────────────────────────────────────────────────────────────
  {
    name: 'Liver Detox Green Juice',
    category: 'juice',
    tags: ['liver', 'detox', 'cleansing', 'alt', 'ast'],
    bloodTypes: [],
    ingredients: ['4 celery stalks', '1 green apple', '1 cucumber', '1 lemon (peeled)', '1 inch ginger', '1 cup kale or dandelion greens', '1 small beet'],
    instructions: ['Wash all produce thoroughly', 'Run through juicer in order: celery, kale, cucumber, apple, beet, ginger, lemon', 'Stir and drink immediately for max enzyme activity'],
    healthBenefits: ['Beet supports Phase 2 liver detoxification', 'Dandelion/kale provides liver-protective compounds', 'Ginger reduces liver inflammation', 'Lemon provides glutathione precursors'],
    nutritionHighlights: '~120 cal, low sugar, high in liver-supportive phytonutrients',
    prepTime: '10 min',
    servings: 1,
  },
  {
    name: 'Blood Sugar Balancing Juice',
    category: 'juice',
    tags: ['blood-sugar', 'glucose', 'diabetes', 'a1c', 'insulin-resistance'],
    bloodTypes: [],
    ingredients: ['3 celery stalks', '1/2 green apple', '1 cucumber', '2 cups spinach', '1 lemon', '1/2 inch fresh turmeric', '1/4 tsp cinnamon (stir in after)'],
    instructions: ['Juice celery, spinach, cucumber, green apple, lemon, and turmeric', 'Stir in cinnamon (do not juice it)', 'Drink on an empty stomach for best blood sugar response'],
    healthBenefits: ['Low glycemic index juice', 'Cinnamon improves insulin sensitivity', 'Turmeric reduces insulin resistance', 'Celery has a very low glycemic impact'],
    nutritionHighlights: '~80 cal, very low sugar, blood sugar-stabilizing compounds',
    prepTime: '10 min',
    servings: 1,
  },
  {
    name: 'Immune Defense Citrus Juice',
    category: 'juice',
    tags: ['immune', 'cold', 'flu', 'vitamin-c', 'zinc', 'wbc'],
    bloodTypes: [],
    ingredients: ['2 oranges', '1 grapefruit', '1 lemon', '1 inch ginger', '1/4 tsp cayenne pepper (stir in)', '1 tbsp raw honey (stir in)'],
    instructions: ['Juice oranges, grapefruit, lemon, and ginger', 'Stir in cayenne and honey', 'Drink immediately — vitamin C degrades quickly in juice'],
    healthBenefits: ['200%+ DV vitamin C', 'Ginger has antiviral properties', 'Cayenne boosts circulation', 'Citrus flavonoids enhance immune cell activity'],
    nutritionHighlights: '~180 cal, 200mg+ vitamin C, immune-boosting compounds',
    prepTime: '8 min',
    servings: 1,
  },
  {
    name: 'Cholesterol-Lowering Heart Juice',
    category: 'juice',
    tags: ['cholesterol', 'ldl', 'hdl', 'heart', 'triglycerides', 'cardiovascular'],
    bloodTypes: [],
    ingredients: ['2 medium beets', '2 carrots', '2 celery stalks', '1 green apple', '1 inch ginger', '1/2 lemon'],
    instructions: ['Wash and chop all produce', 'Juice beets first, then carrots, celery, apple, ginger, lemon', 'Drink immediately or store in airtight container for up to 24hrs'],
    healthBenefits: ['Beet nitrates improve blood vessel function', 'Carrots provide soluble fiber precursors', 'Celery contains phthalides that lower cholesterol', 'Ginger reduces LDL oxidation'],
    nutritionHighlights: '~150 cal, high in nitrates, pectin, and cardiovascular-protective compounds',
    prepTime: '10 min',
    servings: 1,
  },

  // ── Meals ─────────────────────────────────────────────────────────────
  {
    name: 'Anti-Inflammatory Salmon Bowl',
    category: 'meal',
    tags: ['anti-inflammatory', 'omega-3', 'crp', 'heart', 'brain'],
    bloodTypes: ['O+', 'O-', 'B+', 'B-'],
    ingredients: ['6 oz wild salmon fillet', '1 cup quinoa', '1 cup mixed greens', '1/2 avocado', '1/4 cup shredded carrots', '2 tbsp olive oil', '1 tbsp lemon juice', '1 tsp turmeric', 'sesame seeds'],
    instructions: ['Cook quinoa according to package', 'Season salmon with turmeric, salt, pepper', 'Pan-sear salmon 4 min per side', 'Assemble bowl: quinoa base, greens, salmon, avocado, carrots', 'Drizzle with olive oil and lemon, top with sesame seeds'],
    healthBenefits: ['EPA/DHA from salmon reduces CRP inflammation', 'Quinoa provides complete plant protein', 'Avocado provides monounsaturated fats', 'Turmeric enhances anti-inflammatory effect'],
    nutritionHighlights: '~580 cal, 38g protein, 28g healthy fats, 2g+ EPA+DHA',
    prepTime: '25 min',
    servings: 1,
  },
  {
    name: 'Blood Type O Power Plate',
    category: 'meal',
    tags: ['blood-type-o', 'high-protein', 'paleo', 'iron'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['6 oz grass-fed beef', '2 cups broccoli', '1 sweet potato', '2 tbsp olive oil', '2 cloves garlic', 'fresh rosemary', 'sea salt and pepper'],
    instructions: ['Cube sweet potato, toss with 1 tbsp olive oil, roast at 400°F for 25 min', 'Steam broccoli for 5 min until crisp-tender', 'Season beef with rosemary, salt, pepper', 'Cook beef in remaining olive oil with garlic to desired doneness', 'Plate with sweet potato and broccoli'],
    healthBenefits: ['Lean beef provides heme iron (best absorbed form)', 'Broccoli provides vitamin C for iron absorption', 'Sweet potato provides complex carbs and vitamin A', 'All ingredients are "Beneficial" for Type O'],
    nutritionHighlights: '~520 cal, 42g protein, 5mg iron (28% DV), vitamin A + C',
    prepTime: '35 min',
    servings: 1,
  },
  {
    name: 'Blood Type A Mediterranean Bowl',
    category: 'meal',
    tags: ['blood-type-a', 'plant-based', 'mediterranean', 'heart'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['1 cup cooked lentils', '1 cup roasted vegetables (zucchini, bell pepper, eggplant)', '2 tbsp hummus', '1/4 cup feta or tofu feta', 'mixed greens', 'olive oil', 'lemon juice', 'fresh herbs (parsley, mint)'],
    instructions: ['Roast vegetables at 425°F for 20 min', 'Cook lentils with bay leaf and garlic', 'Assemble bowl with greens, lentils, roasted veg', 'Top with hummus, feta, herbs, olive oil, and lemon'],
    healthBenefits: ['Plant-based protein ideal for Type A', 'Lentils provide folate and iron', 'Mediterranean diet pattern lowers heart disease risk', 'Olive oil provides anti-inflammatory polyphenols'],
    nutritionHighlights: '~450 cal, 22g protein, 18g fiber, plant-based iron + folate',
    prepTime: '30 min',
    servings: 1,
  },
  {
    name: 'Magnesium-Rich Relaxation Dinner',
    category: 'meal',
    tags: ['magnesium', 'sleep', 'stress', 'muscle-cramps', 'anxiety'],
    bloodTypes: [],
    ingredients: ['1 cup cooked black beans', '1 cup sautéed spinach', '1/2 cup brown rice', '1/4 cup pumpkin seeds', '1 avocado', '2 squares dark chocolate (85%+ cacao) for dessert', 'lime juice and cilantro'],
    instructions: ['Cook brown rice', 'Sauté spinach with garlic and olive oil', 'Warm black beans with cumin and chili powder', 'Assemble bowl, top with avocado, pumpkin seeds, lime, cilantro', 'Enjoy dark chocolate as dessert for extra magnesium'],
    healthBenefits: ['Every ingredient is a top magnesium source', '~250mg magnesium total (63% DV)', 'Supports sleep quality and muscle relaxation', 'Dark chocolate provides mood-boosting theobromine'],
    nutritionHighlights: '~620 cal, 24g protein, 250mg+ magnesium, high fiber',
    prepTime: '25 min',
    servings: 1,
  },

  // ── Snacks ────────────────────────────────────────────────────────────
  {
    name: 'Adaptogen Energy Balls',
    category: 'snack',
    tags: ['adaptogen', 'energy', 'ashwagandha', 'stress', 'pre-workout'],
    bloodTypes: [],
    ingredients: ['1 cup oats', '1/2 cup almond butter', '1/4 cup honey', '1 tsp ashwagandha powder', '2 tbsp cacao nibs', '1 tbsp chia seeds', '1/4 cup coconut flakes', 'pinch of sea salt'],
    instructions: ['Mix all ingredients in a bowl until combined', 'Refrigerate 30 min until firm', 'Roll into 12 balls', 'Store in refrigerator for up to 1 week'],
    healthBenefits: ['Ashwagandha reduces cortisol and stress', 'Oats provide sustained energy', 'Almond butter provides protein and magnesium', 'Cacao nibs provide iron and antioxidants'],
    nutritionHighlights: '~120 cal per ball, 4g protein, adaptogenic compounds',
    prepTime: '15 min + 30 min chill',
    servings: 12,
  },
  ...BLOOD_TYPE_RECIPES,
  ...EXTENDED_RECIPES,
  ...DINNER_DESSERT_RECIPES,
];

// ─── Search Function ────────────────────────────────────────────────────────

export function searchRecipeDatabase(query: string): RecipeResult[] {
  const lower = query.toLowerCase();
  const terms = lower.split(/\s+/).filter(t => t.length > 2);

  return RECIPES
    .map(recipe => {
      let score = 0;

      // Category match (highest priority)
      if (lower.includes(recipe.category)) score += 10;
      if (lower.includes('smoothie') && recipe.category === 'smoothie') score += 15;
      if (lower.includes('juice') && recipe.category === 'juice') score += 15;
      if (lower.includes('juicing') && recipe.category === 'juice') score += 15;
      if (lower.includes('recipe') && recipe.category === 'meal') score += 5;

      // Tag matches
      for (const tag of recipe.tags) {
        if (lower.includes(tag)) score += 8;
        for (const term of terms) {
          if (tag.includes(term)) score += 4;
        }
      }

      // Ingredient matches
      for (const ing of recipe.ingredients) {
        for (const term of terms) {
          if (ing.toLowerCase().includes(term)) score += 3;
        }
      }

      // Health benefit matches
      for (const benefit of recipe.healthBenefits) {
        for (const term of terms) {
          if (benefit.toLowerCase().includes(term)) score += 5;
        }
      }

      // Blood type match
      if (/blood\s*type\s*([oab]{1,2}[+-]?)/i.test(lower)) {
        const btMatch = lower.match(/blood\s*type\s*([oab]{1,2}[+-]?)/i);
        if (btMatch) {
          const bt = btMatch[1].toUpperCase();
          if (recipe.bloodTypes.length === 0 || recipe.bloodTypes.some(b => b.startsWith(bt))) {
            score += 10;
          }
        }
      }

      // Name match
      for (const term of terms) {
        if (recipe.name.toLowerCase().includes(term)) score += 6;
      }

      return { recipe, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.recipe);
}

/**
 * Get recipes by category
 */
export function getRecipesByCategory(category: RecipeResult['category']): RecipeResult[] {
  return RECIPES.filter(r => r.category === category);
}

/**
 * Get recipes compatible with a blood type
 */
export function getRecipesForBloodType(bloodType: string): RecipeResult[] {
  return RECIPES.filter(r =>
    r.bloodTypes.length === 0 || r.bloodTypes.some(bt => bt.startsWith(bloodType.replace(/[+-]/, '')))
  );
}

/**
 * Get recipes targeting a specific health concern
 */
export function getRecipesForHealthConcern(concern: string): RecipeResult[] {
  return searchRecipeDatabase(concern);
}

/**
 * Validate a recipe's ingredients against a blood type
 * Returns warnings for any "avoid" ingredients
 */
export function validateRecipeForBloodType(
  recipe: RecipeResult,
  bloodType: string,
): { safe: boolean; warnings: string[]; beneficial: string[] } {
  // Lazy import to avoid circular deps
  const { checkIngredientsCompatibility } = require('../data/bloodTypeFoodDatabase');
  const results = checkIngredientsCompatibility(recipe.ingredients, bloodType);

  const warnings = results
    .filter((r: any) => r.rating === 'avoid')
    .map((r: any) => `⚠️ ${r.food} is "Avoid" for Type ${bloodType.replace(/[+-]/, '')}${r.notes ? ` — ${r.notes}` : ''}`);

  const beneficial = results
    .filter((r: any) => r.rating === 'beneficial')
    .map((r: any) => `✅ ${r.food} is "Beneficial" for Type ${bloodType.replace(/[+-]/, '')}`);

  return {
    safe: warnings.length === 0,
    warnings,
    beneficial,
  };
}

/**
 * Smart recipe recommendations — combines blood type + health concern + category
 */
export function getSmartRecipeRecommendations(params: {
  bloodType?: string;
  healthConcern?: string;
  category?: RecipeResult['category'];
  limit?: number;
}): RecipeResult[] {
  let results = [...RECIPES];

  // Filter by blood type compatibility
  if (params.bloodType) {
    const bt = params.bloodType.replace(/[+-]/, '').toUpperCase();
    results = results.filter(r =>
      r.bloodTypes.length === 0 || r.bloodTypes.some(b => b.startsWith(bt))
    );
  }

  // Filter by category
  if (params.category) {
    results = results.filter(r => r.category === params.category);
  }

  // Score by health concern relevance
  if (params.healthConcern) {
    const concern = params.healthConcern.toLowerCase();
    results = results
      .map(r => {
        let score = 0;
        for (const tag of r.tags) {
          if (concern.includes(tag) || tag.includes(concern)) score += 10;
        }
        for (const benefit of r.healthBenefits) {
          if (benefit.toLowerCase().includes(concern)) score += 5;
        }
        return { recipe: r, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.recipe);
  }

  return results.slice(0, params.limit || 10);
}

/** Total recipe count */
export function getRecipeCount(): { total: number; byCategory: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  for (const r of RECIPES) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  }
  return { total: RECIPES.length, byCategory };
}
