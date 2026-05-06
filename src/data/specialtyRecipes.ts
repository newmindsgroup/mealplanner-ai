/**
 * Specialty Diet & Healing Recipes — Batch 5
 * Autoimmune protocol, anti-inflammatory, gut healing,
 * hormone support, brain food, and blood sugar balance.
 * All D'Adamo blood-type aligned.
 */
import type { RecipeResult } from './recipeDatabase';

export const SPECIALTY_RECIPES: RecipeResult[] = [
  // ── AUTOIMMUNE / AIP ──────────────────────────────────────────
  {
    name: 'AIP Turmeric Chicken & Sweet Potato',
    category: 'meal', tags: ['blood-type-o', 'aip', 'autoimmune', 'anti-inflammatory', 'healing'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['1.5 lbs chicken thighs boneless', '2 sweet potatoes cubed', '1 tbsp turmeric', '1 tsp ginger powder', '1/2 tsp cinnamon', '3 tbsp coconut oil', 'sea salt', 'fresh cilantro'],
    instructions: ['Preheat oven to 400°F', 'Toss sweet potatoes with 1 tbsp coconut oil, half the turmeric', 'Season chicken with remaining turmeric, ginger, cinnamon, salt', 'Sear chicken in 2 tbsp coconut oil 3 min per side', 'Place chicken on top of sweet potatoes', 'Bake 25 min until chicken reaches 165°F', 'Garnish with cilantro'],
    healthBenefits: ['No nightshades, grains, dairy, eggs, nuts — full AIP compliance', 'Chicken is "Beneficial" for Type O', 'Turmeric + ginger are potent anti-inflammatories', 'Sweet potato is "Beneficial" for O — gentle starch'],
    nutritionHighlights: '~420 cal, 35g protein, curcumin + gingerols', prepTime: '35 min', servings: 4,
  },
  {
    name: 'Healing Bone Broth with Ginger & Lemon',
    category: 'meal', tags: ['blood-type-o', 'blood-type-b', 'gut-healing', 'collagen', 'sipping'],
    bloodTypes: ['O+', 'O-', 'B+', 'B-'],
    ingredients: ['3 lbs beef or chicken bones', '2 tbsp apple cider vinegar', '1 onion quartered', '3 celery stalks', '2 inches ginger sliced', '4 cloves garlic', '1 lemon juiced', 'sea salt', 'filtered water to cover'],
    instructions: ['Place bones in large pot, cover with water', 'Add apple cider vinegar, let sit 30 min', 'Add vegetables, ginger, garlic', 'Bring to boil, reduce to low simmer', 'Simmer 12-24 hours (or 4 hours in Instant Pot)', 'Strain, add lemon juice and salt to taste', 'Store in jars, refrigerate up to 5 days or freeze'],
    healthBenefits: ['Rich in collagen, glycine, and glutamine for gut repair', 'Ginger is anti-inflammatory', 'ACV helps extract minerals from bones', 'Foundation of gut-healing protocols'],
    nutritionHighlights: '~50 cal per cup, collagen + glycine + minerals', prepTime: '30 min + 12-24hr simmer', servings: 10,
  },

  // ── ANTI-INFLAMMATORY ─────────────────────────────────────────
  {
    name: 'Golden Milk Chia Pudding',
    category: 'snack', tags: ['universal', 'anti-inflammatory', 'breakfast', 'make-ahead', 'golden'],
    bloodTypes: [],
    ingredients: ['1/4 cup chia seeds', '1 cup coconut milk', '1 tsp turmeric', '1/2 tsp cinnamon', '1/4 tsp black pepper', '1 tbsp maple syrup', '1/2 tsp vanilla', 'toppings: berries, coconut flakes, almonds'],
    instructions: ['Whisk coconut milk, turmeric, cinnamon, pepper, maple, vanilla', 'Add chia seeds, stir well', 'Refrigerate at least 4 hours or overnight', 'Stir once after 30 min to prevent clumping', 'Serve with toppings'],
    healthBenefits: ['Curcumin + piperine absorption boost = 2000% bioavailability', 'Chia seeds: omega-3, fiber, plant protein', 'No dairy, no gluten — anti-inflammatory', 'Overnight = zero morning prep'],
    nutritionHighlights: '~280 cal, 8g protein, 10g omega-3, curcumin', prepTime: '5 min + 4hr soak', servings: 2,
  },
  {
    name: 'Wild Salmon with Mango-Avocado Salsa',
    category: 'meal', tags: ['universal', 'anti-inflammatory', 'omega-3', 'fresh', 'colorful'],
    bloodTypes: [],
    ingredients: ['4 wild salmon fillets', '1 ripe mango diced', '1 avocado diced', '1/4 cup red onion finely diced', '1 jalapeño seeded and diced', '2 tbsp lime juice', '2 tbsp cilantro chopped', '2 tbsp olive oil', 'salt and pepper'],
    instructions: ['Season salmon with olive oil, salt, pepper', 'Grill or pan-sear 4 min per side', 'Mix mango, avocado, onion, jalapeño, lime, cilantro for salsa', 'Top salmon with generous salsa', 'Serve with rice or roasted vegetables'],
    healthBenefits: ['Wild salmon is "Beneficial" for ALL types — omega-3', 'Mango provides vitamin C + beta-carotene', 'Avocado: monounsaturated fats + potassium', 'Anti-inflammatory omega-3 + antioxidant combo'],
    nutritionHighlights: '~480 cal, 38g protein, omega-3 + vitamin C + E', prepTime: '20 min', servings: 4,
  },

  // ── HORMONE SUPPORT ───────────────────────────────────────────
  {
    name: 'Seed Cycling Energy Bites',
    category: 'snack', tags: ['universal', 'hormone-support', 'seed-cycling', 'energy', 'womens-health'],
    bloodTypes: [],
    ingredients: ['1/2 cup pumpkin seeds', '1/2 cup flax seeds ground', '1/4 cup sunflower seeds', '1/4 cup sesame seeds', '1/3 cup almond butter', '2 tbsp raw honey', '1/4 cup dark chocolate chips', '1 tsp vanilla', 'pinch sea salt'],
    instructions: ['Pulse all seeds in food processor until roughly chopped', 'Mix with almond butter, honey, vanilla, salt', 'Fold in chocolate chips', 'Roll into 16 balls', 'Refrigerate 30 min to firm', 'Store in airtight container up to 2 weeks'],
    healthBenefits: ['Seed cycling supports estrogen + progesterone balance', 'Pumpkin + flax for follicular phase', 'Sunflower + sesame for luteal phase', 'Zinc + selenium + omega-3 for hormonal health'],
    nutritionHighlights: '~120 cal per bite, zinc + selenium + omega-3 + lignans', prepTime: '15 min', servings: 16,
  },
  {
    name: 'Cruciferous Detox Stir-Fry',
    category: 'meal', tags: ['universal', 'hormone-support', 'detox', 'liver-support', 'quick'],
    bloodTypes: [],
    ingredients: ['2 cups broccoli florets', '1 cup Brussels sprouts halved', '1 cup cauliflower florets', '1 cup kale chopped', '2 cloves garlic minced', '1 tbsp ginger grated', '2 tbsp tamari', '1 tbsp sesame oil', '1 tbsp rice vinegar', 'sesame seeds'],
    instructions: ['Heat sesame oil in large wok over high heat', 'Add Brussels sprouts first (need most time), stir 3 min', 'Add broccoli and cauliflower, stir 3 min', 'Add garlic, ginger, kale, stir 2 min', 'Deglaze with tamari and rice vinegar', 'Serve over rice, top with sesame seeds'],
    healthBenefits: ['Cruciferous vegetables contain DIM and I3C for estrogen metabolism', 'Sulforaphane supports liver Phase 2 detoxification', 'Broccoli is "Beneficial" for Type O, A, and AB', 'High fiber supports hormone clearance'],
    nutritionHighlights: '~180 cal, 8g protein, DIM + I3C + sulforaphane + fiber', prepTime: '15 min', servings: 4,
  },

  // ── BRAIN FOOD ────────────────────────────────────────────────
  {
    name: 'Blueberry-Walnut Brain Bowl',
    category: 'meal', tags: ['blood-type-a', 'blood-type-ab', 'brain-food', 'breakfast', 'cognition'],
    bloodTypes: ['A+', 'A-', 'AB+', 'AB-'],
    ingredients: ['1 cup cooked oatmeal or quinoa', '1/2 cup blueberries', '2 tbsp walnuts chopped', '1 tbsp ground flax', '1 tbsp raw honey', '1/2 tsp cinnamon', '1 tbsp pumpkin seeds', 'splash of oat milk'],
    instructions: ['Cook oatmeal or quinoa as base', 'Top with blueberries and walnuts', 'Sprinkle flax, pumpkin seeds, cinnamon', 'Drizzle honey, add splash of oat milk', 'Eat within 30 min for best texture'],
    healthBenefits: ['Blueberries: BDNF boost — "Beneficial" for Type A', 'Walnuts: DHA precursors — "Beneficial" for Type AB', 'Flax: omega-3 for neuroinflammation', 'Designed to support dopamine + serotonin production'],
    nutritionHighlights: '~350 cal, 10g protein, anthocyanins + omega-3 + BDNF support', prepTime: '10 min', servings: 1,
  },
  {
    name: 'Sardine & Avocado Toast with Microgreens',
    category: 'meal', tags: ['universal', 'brain-food', 'omega-3', 'quick', 'nutrient-dense'],
    bloodTypes: [],
    ingredients: ['2 slices sprouted bread or rice bread', '1 can sardines in olive oil', '1 ripe avocado', '1 cup microgreens', '1 tbsp lemon juice', '1 tsp everything bagel seasoning', 'pinch red pepper flakes', 'sea salt'],
    instructions: ['Toast bread', 'Mash avocado with lemon juice and salt', 'Spread avocado on toast', 'Arrange sardines on top', 'Top with microgreens and seasonings'],
    healthBenefits: ['Sardines: DHA + EPA + B12 + vitamin D + calcium', 'Avocado: monounsaturated fats for brain cell membrane integrity', 'Microgreens: 40x nutrient density vs. mature greens', 'Complete brain-support meal in 5 minutes'],
    nutritionHighlights: '~420 cal, 25g protein, DHA + EPA + B12 + D + choline', prepTime: '5 min', servings: 1,
  },

  // ── BLOOD SUGAR BALANCE ───────────────────────────────────────
  {
    name: 'Cinnamon-Apple Overnight Oats (Type A)',
    category: 'meal', tags: ['blood-type-a', 'blood-sugar', 'breakfast', 'make-ahead', 'fiber'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['1/2 cup rolled oats', '1/2 cup oat milk', '1/4 cup Greek yogurt or soy yogurt', '1 tbsp chia seeds', '1/2 apple diced', '1 tsp cinnamon', '1 tbsp maple syrup', '1 tbsp almond butter'],
    instructions: ['Mix oats, milk, yogurt, chia seeds in jar', 'Stir in cinnamon and maple syrup', 'Top with diced apple', 'Refrigerate overnight', 'Top with almond butter before eating'],
    healthBenefits: ['Cinnamon: proven to improve insulin sensitivity (PubMed PMID: 14633804)', 'Oats are "Neutral" for Type A — soluble fiber', 'Chia seeds: slow carb release', 'Fat + fiber + protein = stable blood sugar response'],
    nutritionHighlights: '~380 cal, 14g protein, 10g fiber, chromium + cinnamon', prepTime: '5 min + overnight', servings: 1,
  },
  {
    name: 'Lentil-Spinach Dal with Brown Rice',
    category: 'meal', tags: ['blood-type-a', 'blood-sugar', 'vegetarian', 'high-fiber', 'budget'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['1 cup red lentils rinsed', '3 cups water or vegetable broth', '2 cups fresh spinach', '1 onion diced', '3 cloves garlic', '1 tsp turmeric', '1 tsp cumin', '1 tsp garam masala', '1 tbsp coconut oil', '2 cups cooked brown rice'],
    instructions: ['Sauté onion and garlic in coconut oil', 'Add spices, toast 30 seconds', 'Add lentils and broth, simmer 20 min until tender', 'Stir in spinach until wilted', 'Season with salt and squeeze of lemon', 'Serve over brown rice'],
    healthBenefits: ['Lentils are "Beneficial" for Type A — low glycemic plant protein', 'Spinach adds iron without meat', 'Turmeric is anti-inflammatory', 'Lentils + rice = complete amino acid profile'],
    nutritionHighlights: '~440 cal, 22g protein, 14g fiber, GI: ~35 (low)', prepTime: '30 min', servings: 4,
  },

  // ── FERMENTED / GUT HEALTH ────────────────────────────────────
  {
    name: 'Kimchi Fried Rice with Egg',
    category: 'meal', tags: ['universal', 'gut-health', 'fermented', 'quick', 'umami'],
    bloodTypes: [],
    ingredients: ['3 cups cold cooked rice', '1 cup kimchi chopped', '2 eggs', '2 green onions sliced', '1 tbsp sesame oil', '1 tbsp tamari', '1 tsp gochujang', '1 tbsp kimchi brine'],
    instructions: ['Heat sesame oil in wok over high heat', 'Add kimchi, stir-fry 2 min', 'Add cold rice, break up clumps, stir-fry 4 min', 'Push rice aside, scramble eggs in center', 'Mix everything, add tamari and kimchi brine', 'Top with green onions and gochujang'],
    healthBenefits: ['Kimchi: Lactobacillus probiotics for gut microbiome', 'Fermented foods improve nutrient absorption', 'Cold rice = resistant starch (prebiotic)', 'Eggs add choline and complete protein'],
    nutritionHighlights: '~380 cal, 14g protein, probiotics + resistant starch', prepTime: '10 min', servings: 2,
  },
  {
    name: 'Coconut Yogurt Parfait with Prebiotic Granola',
    category: 'snack', tags: ['blood-type-a', 'gut-health', 'probiotic', 'breakfast', 'layered'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['1 cup coconut yogurt', '1/4 cup prebiotic granola or oats', '1/4 cup mixed berries', '1 tbsp raw honey', '1 tbsp ground flax', '1 tsp slippery elm powder optional', 'handful of pumpkin seeds'],
    instructions: ['Layer half the yogurt in a glass', 'Add granola layer', 'Add berries layer', 'Top with remaining yogurt', 'Drizzle honey, sprinkle flax and pumpkin seeds'],
    healthBenefits: ['Coconut yogurt: probiotics without dairy (suits Type A)', 'Prebiotic fiber feeds beneficial bacteria', 'Slippery elm soothes gut lining (optional healing add)', 'Berries provide polyphenol prebiotics'],
    nutritionHighlights: '~310 cal, 8g protein, probiotics + prebiotics + fiber', prepTime: '5 min', servings: 1,
  },

  // ── SPORTS NUTRITION ──────────────────────────────────────────
  {
    name: 'Type O Pre-Workout Power Plate',
    category: 'meal', tags: ['blood-type-o', 'pre-workout', 'sports', 'performance', 'energy'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['6 oz lean beef sirloin', '1 cup sweet potato mashed', '1 cup steamed broccoli', '1 tbsp olive oil', 'sea salt', '1 banana for dessert'],
    instructions: ['Grill or pan-sear beef to medium-rare (4 min per side)', 'Steam broccoli until bright green', 'Mash sweet potato with olive oil and salt', 'Plate: beef + sweet potato + broccoli', 'Eat 60-90 min before training', 'Have banana 30 min before for quick energy'],
    healthBenefits: ['Beef is "Highly Beneficial" for Type O — iron + B12 + creatine', 'Sweet potato: complex carbs for sustained energy', 'Broccoli: vitamin C enhances iron absorption', 'Timed for optimal pre-workout glycogen loading'],
    nutritionHighlights: '~520 cal, 42g protein, iron + B12 + creatine + vitamin C', prepTime: '20 min', servings: 1,
  },
  {
    name: 'Post-Workout Recovery Shake',
    category: 'smoothie', tags: ['universal', 'post-workout', 'recovery', 'protein', 'fast'],
    bloodTypes: [],
    ingredients: ['1 scoop whey or plant protein powder', '1 banana', '1 cup tart cherry juice', '1/2 cup Greek yogurt', '1 tbsp honey', '1 cup ice', '1 tsp creatine monohydrate optional'],
    instructions: ['Blend protein, banana, cherry juice, yogurt', 'Add honey and creatine if using', 'Add ice, blend until smooth', 'Drink within 30 min post-workout'],
    healthBenefits: ['Tart cherry juice reduces muscle soreness (PMID: 20459662)', 'Fast-absorbing protein for muscle protein synthesis', 'Banana replenishes potassium lost in sweat', 'Honey: fast glucose for glycogen replenishment'],
    nutritionHighlights: '~350 cal, 30g protein, anthocyanins + leucine + potassium', prepTime: '3 min', servings: 1,
  },

  // ── QUICK 5-MIN MEALS ─────────────────────────────────────────
  {
    name: '5-Min Tuna Avocado Bowl',
    category: 'meal', tags: ['universal', 'quick', '5-minute', 'no-cook', 'protein'],
    bloodTypes: [],
    ingredients: ['1 can wild tuna drained', '1 ripe avocado', '1 tbsp lemon juice', '1 tbsp olive oil', '1/2 cup cherry tomatoes halved', '2 tbsp red onion diced', 'sea salt and pepper', 'rice crackers or greens to serve'],
    instructions: ['Mash avocado with lemon juice', 'Flake tuna over avocado', 'Add tomatoes and red onion', 'Drizzle olive oil, season with salt and pepper', 'Serve with rice crackers or over greens'],
    healthBenefits: ['Tuna is "Beneficial" for all types — omega-3 + selenium', 'Avocado: healthy fats + potassium', 'Zero cooking required', 'Complete meal in under 5 minutes'],
    nutritionHighlights: '~380 cal, 30g protein, omega-3 + selenium + potassium', prepTime: '5 min', servings: 1,
  },
  {
    name: '5-Min Cottage Cheese Protein Bowl',
    category: 'snack', tags: ['blood-type-b', 'quick', '5-minute', 'high-protein', 'no-cook'],
    bloodTypes: ['B+', 'B-'],
    ingredients: ['1 cup cottage cheese', '1/2 cup pineapple chunks', '2 tbsp walnuts', '1 tbsp honey', '1 tbsp ground flax', 'pinch cinnamon'],
    instructions: ['Scoop cottage cheese into bowl', 'Top with pineapple, walnuts', 'Drizzle honey, sprinkle flax and cinnamon', 'Eat immediately'],
    healthBenefits: ['Cottage cheese is "Beneficial" for Type B — casein protein', 'Pineapple is "Beneficial" for B — bromelain enzyme', 'Walnuts add omega-3', '28g slow-release protein — ideal before bed'],
    nutritionHighlights: '~340 cal, 28g protein, casein + omega-3 + bromelain', prepTime: '3 min', servings: 1,
  },

  // ── SEASONAL SOUPS ────────────────────────────────────────────
  {
    name: 'Roasted Butternut Squash Soup',
    category: 'meal', tags: ['universal', 'soup', 'autumn', 'warming', 'vitamin-a'],
    bloodTypes: [],
    ingredients: ['1 large butternut squash halved', '1 onion quartered', '4 cloves garlic', '3 cups vegetable broth', '1/2 cup coconut cream', '1 tsp cumin', '1/2 tsp nutmeg', '2 tbsp olive oil', 'salt and pepper', 'pumpkin seeds for topping'],
    instructions: ['Roast squash, onion, garlic at 400°F 40 min', 'Scoop out squash flesh', 'Blend with broth, cumin, nutmeg until smooth', 'Heat in pot, stir in coconut cream', 'Season to taste', 'Serve topped with pumpkin seeds and a drizzle of olive oil'],
    healthBenefits: ['Butternut squash: beta-carotene (vitamin A precursor)', 'Coconut cream: no dairy, suits Type A and O', 'Roasting concentrates natural sweetness — no sugar needed', 'Warming spices support digestion'],
    nutritionHighlights: '~220 cal, 6g protein, 400% DV vitamin A, fiber', prepTime: '50 min', servings: 6,
  },
  {
    name: 'Thai Chicken & Ginger Healing Soup',
    category: 'meal', tags: ['blood-type-o', 'blood-type-b', 'soup', 'healing', 'immune-support'],
    bloodTypes: ['O+', 'O-', 'B+', 'B-'],
    ingredients: ['1 lb chicken breast sliced thin', '4 cups bone broth', '1 can coconut milk', '2 inches ginger sliced', '2 stalks lemongrass', '2 tbsp fish sauce', '1 cup mushrooms sliced', '1 cup baby bok choy', '1 lime juiced', 'fresh cilantro', 'chili oil optional'],
    instructions: ['Simmer broth with ginger and lemongrass 10 min', 'Add coconut milk and mushrooms', 'Add chicken, simmer 5 min until cooked', 'Add bok choy, cook 2 min', 'Season with fish sauce and lime juice', 'Serve with cilantro and chili oil'],
    healthBenefits: ['Bone broth: collagen + glutamine for gut healing', 'Ginger: anti-nausea + anti-inflammatory', 'Chicken is "Beneficial" for Type O and B', 'Mushrooms support immune system — beta-glucans'],
    nutritionHighlights: '~380 cal, 32g protein, collagen + gingerols + beta-glucans', prepTime: '25 min', servings: 4,
  },

  // ── DESSERTS FOR HEALTH ───────────────────────────────────────
  {
    name: 'Dark Chocolate Avocado Mousse',
    category: 'snack', tags: ['universal', 'dessert', 'healthy-fats', 'antioxidant', 'no-bake'],
    bloodTypes: [],
    ingredients: ['2 ripe avocados', '1/3 cup cacao powder', '1/4 cup maple syrup', '1/4 cup coconut cream', '1 tsp vanilla', 'pinch sea salt', 'berries for topping'],
    instructions: ['Blend avocados until smooth', 'Add cacao, maple, coconut cream, vanilla, salt', 'Blend until silky and uniform', 'Divide into 4 ramekins', 'Refrigerate at least 1 hour', 'Top with berries before serving'],
    healthBenefits: ['Cacao: flavanols improve blood flow to brain (PMID: 23810791)', 'Avocado replaces cream — no dairy', 'Natural sweeteners only — no refined sugar', 'Magnesium + iron + antioxidants'],
    nutritionHighlights: '~250 cal, 5g protein, flavanols + magnesium + healthy fats', prepTime: '10 min + 1hr chill', servings: 4,
  },
  {
    name: 'Banana Nice Cream with Tahini Drizzle',
    category: 'snack', tags: ['universal', 'dessert', 'frozen', 'vegan', 'no-sugar-added'],
    bloodTypes: [],
    ingredients: ['4 frozen bananas', '2 tbsp cacao powder', '1 tbsp almond butter', '2 tbsp tahini', '1 tbsp honey', 'cacao nibs and sesame seeds for topping'],
    instructions: ['Blend frozen bananas in food processor 3-4 min until creamy', 'Add cacao and almond butter, blend 1 more min', 'Scoop into bowls', 'Drizzle tahini mixed with honey', 'Top with cacao nibs and sesame seeds', 'Eat immediately or freeze 30 min for firmer texture'],
    healthBenefits: ['Zero added sugar — natural banana sweetness only', 'Tahini adds calcium + iron + plant protein', 'Cacao nibs: raw chocolate flavanols', 'Frozen bananas = creamy ice cream texture without dairy'],
    nutritionHighlights: '~280 cal, 7g protein, potassium + magnesium + calcium', prepTime: '8 min', servings: 2,
  },
];
