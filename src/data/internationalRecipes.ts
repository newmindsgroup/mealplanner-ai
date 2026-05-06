/**
 * International & Specialty Recipes — Batch 4
 * Mediterranean, Asian, Latin, Meal Prep, Baby Food
 * All D'Adamo blood-type aligned
 */
import type { RecipeResult } from './recipeDatabase';

export const INTERNATIONAL_RECIPES: RecipeResult[] = [
  // ── MEDITERRANEAN ─────────────────────────────────────────────
  {
    name: 'Mediterranean Lamb Kofta with Tzatziki',
    category: 'meal', tags: ['blood-type-o', 'blood-type-b', 'mediterranean', 'grilled', 'high-protein'],
    bloodTypes: ['O+', 'O-', 'B+', 'B-'],
    ingredients: ['1 lb ground lamb', '1/4 cup fresh parsley', '2 cloves garlic', '1 tsp cumin', '1 tsp coriander', '1/2 cup Greek yogurt', '1/2 cucumber grated', '1 tbsp lemon juice', '1 tbsp dill', 'pita bread or rice'],
    instructions: ['Mix lamb, parsley, garlic, cumin, coriander, salt', 'Shape into 8 oval kofta on skewers', 'Grill 4 min per side', 'Mix yogurt, cucumber, lemon, dill for tzatziki', 'Serve kofta with tzatziki and rice or pita'],
    healthBenefits: ['Lamb is "Beneficial" for Type O and B', 'Yogurt is "Beneficial" for Type B', 'Cumin aids digestion', 'High in iron and B12'],
    nutritionHighlights: '~480 cal, 36g protein, iron + B12 + probiotics', prepTime: '25 min', servings: 4,
  },
  {
    name: 'Greek Spinach-Rice Stuffed Peppers',
    category: 'meal', tags: ['universal', 'mediterranean', 'vegetarian', 'stuffed', 'colorful'],
    bloodTypes: [],
    ingredients: ['6 bell peppers halved', '2 cups cooked rice', '10 oz frozen spinach thawed', '1/2 cup feta cheese crumbled', '1/4 cup pine nuts', '2 tbsp olive oil', '1 onion diced', '2 cloves garlic', '1 tsp oregano', 'lemon zest'],
    instructions: ['Preheat oven to 375°F', 'Sauté onion, garlic in olive oil', 'Mix rice, spinach, feta, pine nuts, oregano, lemon zest', 'Fill pepper halves with mixture', 'Bake 30 min until peppers are tender'],
    healthBenefits: ['Spinach is "Beneficial" for all types', 'Olive oil is "Beneficial" universal', 'Pine nuts provide plant-based protein', 'No meat — great for Type A'],
    nutritionHighlights: '~290 cal, 10g protein, iron + folate + vitamin C', prepTime: '45 min', servings: 6,
  },
  {
    name: 'Sardinian Minestrone Soup',
    category: 'meal', tags: ['universal', 'mediterranean', 'soup', 'fiber', 'longevity'],
    bloodTypes: [],
    ingredients: ['2 cups white beans soaked', '4 cups vegetable broth', '2 carrots diced', '2 celery stalks', '1 zucchini diced', '1 cup kale chopped', '1 can diced tomatoes', '2 cloves garlic', '2 tbsp olive oil', '1 tsp rosemary', 'parmesan rind optional'],
    instructions: ['Sauté garlic, carrots, celery in olive oil', 'Add broth, beans, tomatoes, rosemary', 'Simmer 30 min until beans tender', 'Add zucchini and kale, cook 10 min more', 'Season with salt and pepper, drizzle olive oil to serve'],
    healthBenefits: ['Blue Zone recipe — associated with longevity', 'Beans provide plant protein and fiber', 'Kale is "Beneficial" for multiple types', 'Anti-inflammatory olive oil base'],
    nutritionHighlights: '~240 cal, 12g protein, 10g fiber', prepTime: '45 min', servings: 6,
  },

  // ── ASIAN ─────────────────────────────────────────────────────
  {
    name: 'Japanese Miso Salmon Bowl',
    category: 'meal', tags: ['universal', 'asian', 'omega-3', 'quick', 'bowl'],
    bloodTypes: [],
    ingredients: ['2 salmon fillets', '2 tbsp white miso paste', '1 tbsp mirin', '1 tbsp tamari', '2 cups cooked sushi rice', '1 cup edamame', '1 avocado sliced', '1 cucumber sliced', 'sesame seeds', 'pickled ginger'],
    instructions: ['Mix miso, mirin, tamari into glaze', 'Brush salmon with miso glaze', 'Broil 6-8 min until caramelized', 'Build bowls: rice, edamame, cucumber, avocado', 'Top with salmon, sesame seeds, pickled ginger'],
    healthBenefits: ['Salmon is "Beneficial" for ALL types', 'Miso provides probiotics', 'Edamame adds plant protein', 'Rich in omega-3 + DHA'],
    nutritionHighlights: '~520 cal, 35g protein, omega-3 + probiotics', prepTime: '20 min', servings: 2,
  },
  {
    name: 'Thai Coconut Lemongrass Soup (Tom Kha)',
    category: 'meal', tags: ['blood-type-a', 'blood-type-ab', 'asian', 'soup', 'warming'],
    bloodTypes: ['A+', 'A-', 'AB+', 'AB-'],
    ingredients: ['14 oz coconut milk', '2 cups vegetable broth', '8 oz firm tofu cubed', '1 cup mushrooms sliced', '2 stalks lemongrass', '3 slices galangal or ginger', '2 kaffir lime leaves', '2 tbsp tamari', '1 tbsp lime juice', 'fresh cilantro', '1 red chili optional'],
    instructions: ['Simmer broth with lemongrass, galangal, lime leaves 10 min', 'Add coconut milk and mushrooms', 'Add tofu, simmer 5 min', 'Season with tamari and lime juice', 'Serve with cilantro and chili'],
    healthBenefits: ['Tofu is "Beneficial" for Type A', 'Mushrooms support immune system', 'Lemongrass is anti-inflammatory', 'Light on digestion for sensitive Type A stomach'],
    nutritionHighlights: '~320 cal, 14g protein, anti-inflammatory + immune', prepTime: '25 min', servings: 4,
  },
  {
    name: 'Korean Bibimbap Bowl',
    category: 'meal', tags: ['blood-type-o', 'asian', 'bowl', 'colorful', 'balanced'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['8 oz beef sirloin sliced thin', '2 cups cooked rice', '1 cup spinach blanched', '1 carrot julienned', '1 zucchini sliced', '1/2 cup bean sprouts', '2 eggs', '2 tbsp gochujang sauce', '1 tbsp sesame oil', '1 tbsp tamari', 'sesame seeds'],
    instructions: ['Marinate beef in tamari and sesame oil', 'Sauté each vegetable separately', 'Stir-fry beef 3 min', 'Build bowls: rice, arrange vegetables and beef', 'Top with fried egg and gochujang', 'Mix everything together before eating'],
    healthBenefits: ['Beef is "Beneficial" for Type O', 'Spinach is "Beneficial" for O', 'Colorful vegetables provide full-spectrum antioxidants', 'Egg adds choline for brain health'],
    nutritionHighlights: '~530 cal, 32g protein, iron + vitamins A, C, K', prepTime: '30 min', servings: 2,
  },

  // ── LATIN ─────────────────────────────────────────────────────
  {
    name: 'Black Bean & Sweet Potato Tacos',
    category: 'meal', tags: ['blood-type-a', 'latin', 'vegetarian', 'fiber', 'fun'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['1 can black beans', '2 sweet potatoes cubed', '8 corn tortillas', '1 avocado sliced', '1/4 cup red onion diced', '2 tbsp lime juice', '1 tsp cumin', '1 tsp smoked paprika', 'fresh cilantro', 'hot sauce optional'],
    instructions: ['Roast sweet potato cubes at 400°F for 20 min with cumin, paprika', 'Warm black beans with a pinch of cumin', 'Warm tortillas in dry pan', 'Fill with sweet potato, beans, avocado, onion', 'Top with cilantro, lime juice, hot sauce'],
    healthBenefits: ['Black beans are "Beneficial" for Type A', 'Sweet potatoes are "Beneficial" for A', 'Plant-based protein combo', 'No dairy — suits Type A'],
    nutritionHighlights: '~380 cal, 14g protein, 12g fiber, vitamin A', prepTime: '30 min', servings: 4,
  },
  {
    name: 'Peruvian Quinoa Bowl with Aji Verde',
    category: 'meal', tags: ['universal', 'latin', 'superfood', 'protein', 'vibrant'],
    bloodTypes: [],
    ingredients: ['1.5 cups quinoa', '1 can black beans', '1 cup corn kernels', '1 avocado diced', '1 cup cherry tomatoes halved', '1/4 cup cilantro', '1/4 cup aji verde sauce or chimichurri', '2 tbsp olive oil', 'lime wedges'],
    instructions: ['Cook quinoa per package', 'Warm black beans and corn', 'Build bowls: quinoa, beans, corn, avocado, tomatoes', 'Drizzle aji verde and olive oil', 'Garnish with cilantro and lime'],
    healthBenefits: ['Quinoa is a complete protein', 'Black beans add fiber and iron', 'Avocado provides healthy fats', 'Corn-free version available for Type O'],
    nutritionHighlights: '~450 cal, 18g protein, 12g fiber, complete amino acids', prepTime: '25 min', servings: 4,
  },

  // ── MEAL PREP ─────────────────────────────────────────────────
  {
    name: 'Type O Weekly Protein Prep: Turkey Meatballs',
    category: 'meal', tags: ['blood-type-o', 'meal-prep', 'batch-cook', 'freezer-friendly', 'protein'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['2 lbs ground turkey', '2 eggs', '1/2 cup almond flour', '1/4 cup fresh parsley', '2 cloves garlic minced', '1 tsp onion powder', '1 tsp Italian seasoning', '1/2 tsp sea salt'],
    instructions: ['Mix all ingredients by hand until combined', 'Roll into 40 small meatballs', 'Place on parchment-lined baking sheets', 'Bake 400°F for 18-20 min', 'Cool completely, divide into 5 containers', 'Refrigerate 5 days or freeze up to 3 months'],
    healthBenefits: ['Turkey is "Beneficial" for Type O', 'Almond flour instead of breadcrumbs (no wheat)', 'Batch cooking = consistent protein all week', 'Freezer-friendly for planning ahead'],
    nutritionHighlights: '~200 cal per serving (8 balls), 28g protein', prepTime: '30 min for full week', servings: 5,
  },
  {
    name: 'Type A Weekly Grain Bowl Prep',
    category: 'meal', tags: ['blood-type-a', 'meal-prep', 'batch-cook', 'plant-based', 'organized'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['3 cups quinoa dry', '2 cans chickpeas', '4 cups broccoli florets', '2 sweet potatoes cubed', '1 cup tahini dressing', '4 tbsp olive oil', '2 tsp cumin', '1 tsp turmeric', 'salt and pepper'],
    instructions: ['Cook quinoa in batch', 'Roast sweet potatoes and broccoli at 400°F 25 min', 'Season chickpeas with cumin, turmeric, roast 20 min', 'Make tahini dressing: tahini, lemon, garlic, water', 'Divide into 5 containers: quinoa + vegetables + chickpeas', 'Drizzle dressing when ready to eat'],
    healthBenefits: ['All "Beneficial" for Type A: quinoa, broccoli, chickpeas', 'Plant-based protein', 'Batch prep saves time and ensures compliance', 'Anti-inflammatory turmeric'],
    nutritionHighlights: '~420 cal, 16g protein, 10g fiber per serving', prepTime: '40 min for full week', servings: 5,
  },

  // ── BREAKFAST EXTRAS ──────────────────────────────────────────
  {
    name: 'Type B Ricotta Pancakes with Berries',
    category: 'meal', tags: ['blood-type-b', 'breakfast', 'weekend', 'treat', 'calcium'],
    bloodTypes: ['B+', 'B-'],
    ingredients: ['1 cup ricotta cheese', '2 eggs', '1/4 cup rice flour', '1 tbsp honey', '1 tsp vanilla', '1/2 tsp baking powder', 'fresh blueberries and strawberries', 'maple syrup'],
    instructions: ['Mix ricotta, eggs, rice flour, honey, vanilla, baking powder', 'Heat pan with butter on medium', 'Scoop 1/4 cup batter, cook 3 min per side', 'Serve stacked with fresh berries and maple syrup'],
    healthBenefits: ['Ricotta is "Beneficial" dairy for Type B', 'Rice flour avoids wheat — B "Neutral"', 'Eggs are "Neutral" for Type B', 'Berries provide antioxidants'],
    nutritionHighlights: '~320 cal, 16g protein, calcium + antioxidants', prepTime: '15 min', servings: 2,
  },
  {
    name: 'Type AB Goat Cheese Frittata',
    category: 'meal', tags: ['blood-type-ab', 'breakfast', 'protein', 'elegant', 'brunch'],
    bloodTypes: ['AB+', 'AB-'],
    ingredients: ['6 eggs', '2 oz goat cheese crumbled', '1 cup spinach', '1/2 cup cherry tomatoes halved', '1/4 cup fresh basil', '1 tbsp olive oil', 'salt and pepper'],
    instructions: ['Preheat oven to 375°F', 'Whisk eggs with salt and pepper', 'Heat olive oil in oven-safe skillet', 'Add spinach, cook 1 min until wilted', 'Pour eggs over, top with tomatoes and goat cheese', 'Cook stovetop 3 min, then oven 10 min until set', 'Top with fresh basil'],
    healthBenefits: ['Goat cheese is "Beneficial" for Type AB', 'Eggs are "Neutral" for AB — better than meat', 'Spinach adds iron without heavy protein', 'Light protein suits AB digestion'],
    nutritionHighlights: '~250 cal, 18g protein, calcium + iron + folate', prepTime: '20 min', servings: 3,
  },

  // ── KIDS & BABY ───────────────────────────────────────────────
  {
    name: 'Baby-Friendly Sweet Potato & Apple Purée',
    category: 'snack', tags: ['universal', 'baby', 'first-foods', 'gentle', 'sweet'],
    bloodTypes: [],
    ingredients: ['2 sweet potatoes peeled and cubed', '2 apples peeled and cubed', '1/2 tsp cinnamon', 'water or breast milk to thin'],
    instructions: ['Steam sweet potatoes and apples until very soft (15 min)', 'Blend until smooth', 'Add cinnamon and thin with water or breast milk to desired consistency', 'Serve warm or at room temperature', 'Freeze extra in ice cube trays for easy portions'],
    healthBenefits: ['Sweet potato is "Beneficial" for most types', 'Apple is gentle first food', 'No added sugar, salt, or allergens', 'Rich in beta-carotene and fiber'],
    nutritionHighlights: '~60 cal per portion, vitamin A + fiber', prepTime: '20 min', servings: 8,
  },
  {
    name: 'Toddler Turkey & Veggie Meatballs',
    category: 'snack', tags: ['universal', 'kids', 'finger-food', 'hidden-veggies', 'protein'],
    bloodTypes: [],
    ingredients: ['1 lb ground turkey', '1 cup zucchini finely grated and squeezed dry', '1/2 cup carrots finely grated', '1 egg', '1/4 cup rice breadcrumbs', '1 tsp Italian seasoning', 'pinch of salt'],
    instructions: ['Mix all ingredients gently', 'Roll into small marble-sized balls for toddlers', 'Bake 375°F for 15 min', 'Cool before serving', 'Freeze extras for quick meals'],
    healthBenefits: ['Turkey is gentle protein for all types', 'Hidden vegetables boost nutrition', 'No common allergens (dairy, wheat, nuts)', 'Perfect finger food size for self-feeding'],
    nutritionHighlights: '~30 cal per meatball, 4g protein', prepTime: '25 min', servings: 30,
  },

  // ── MORE JUICING ──────────────────────────────────────────────
  {
    name: 'Type O Anti-Inflammatory Cherry Juice',
    category: 'juice', tags: ['blood-type-o', 'juice', 'anti-inflammatory', 'post-workout', 'recovery'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['2 cups tart cherries pitted', '1 inch ginger', '1 cup pineapple chunks', '1 small beet', '1/2 lemon juiced', '1 cup water'],
    instructions: ['Juice beet, ginger, pineapple, and cherries', 'Add lemon juice and water', 'Stir and serve over ice', 'Best consumed within 24 hours'],
    healthBenefits: ['Cherries are "Beneficial" for Type O — powerful anti-inflammatory', 'Pineapple is "Beneficial" — bromelain for digestion', 'Ginger reduces muscle soreness', 'Beet boosts nitric oxide for blood flow'],
    nutritionHighlights: '~180 cal, anthocyanins + bromelain + nitrates', prepTime: '10 min', servings: 2,
  },
  {
    name: 'Type A Calming Celery-Pear Juice',
    category: 'juice', tags: ['blood-type-a', 'juice', 'calming', 'gut-health', 'morning'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['4 celery stalks', '2 ripe pears', '1 cucumber', '1 inch ginger', '1/2 lemon', 'handful of fresh mint'],
    instructions: ['Juice celery, pears, cucumber, ginger', 'Add lemon juice', 'Garnish with mint', 'Drink on empty stomach for best results'],
    healthBenefits: ['Celery is "Beneficial" for Type A — alkalizing', 'Pear is gentle on Type A stomach', 'Cucumber is hydrating and "Beneficial" for A', 'Calming for Type A cortisol levels'],
    nutritionHighlights: '~120 cal, potassium + magnesium + hydration', prepTime: '8 min', servings: 2,
  },

  // ── MORE SMOOTHIES ────────────────────────────────────────────
  {
    name: 'Type B Tropical Kefir Smoothie',
    category: 'smoothie', tags: ['blood-type-b', 'smoothie', 'probiotic', 'tropical', 'creamy'],
    bloodTypes: ['B+', 'B-'],
    ingredients: ['1 cup kefir', '1 banana', '1/2 cup pineapple chunks', '1/2 cup papaya chunks', '1 tbsp flax seeds', '1 tsp honey', 'ice cubes'],
    instructions: ['Blend kefir, banana, pineapple, papaya', 'Add flax seeds and honey', 'Add ice and blend until smooth', 'Serve immediately'],
    healthBenefits: ['Kefir is "Beneficial" for Type B — probiotics', 'Banana and papaya are "Beneficial" for B', 'Pineapple aids digestion with bromelain', 'Flax seeds add omega-3'],
    nutritionHighlights: '~280 cal, 12g protein, probiotics + omega-3', prepTime: '5 min', servings: 1,
  },
  {
    name: 'Type AB Recovery Smoothie',
    category: 'smoothie', tags: ['blood-type-ab', 'smoothie', 'post-workout', 'recovery', 'balanced'],
    bloodTypes: ['AB+', 'AB-'],
    ingredients: ['1 cup kefir', '1/2 cup tart cherries', '1 banana', '1 scoop vanilla protein powder', '1 tbsp walnut butter', '1 tsp cinnamon', '1 cup ice'],
    instructions: ['Blend kefir, cherries, banana until smooth', 'Add protein powder and walnut butter', 'Add cinnamon and ice, blend until creamy', 'Drink within 30 min post-workout'],
    healthBenefits: ['Kefir is "Beneficial" for AB — probiotics', 'Cherries reduce muscle soreness', 'Walnuts are "Beneficial" for AB', 'Post-workout window for optimal recovery'],
    nutritionHighlights: '~340 cal, 25g protein, probiotics + anti-inflammatory', prepTime: '5 min', servings: 1,
  },
];
