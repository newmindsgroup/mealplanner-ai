/**
 * Blood-Type-Specific Recipes — Based on D'Adamo's Eat Right 4 Your Type
 * Sources: dadamo.com, 4yourtype.com, Healthline, WebMD
 *
 * Each recipe uses ONLY "Beneficial" or "Neutral" ingredients for the listed types
 * and avoids known "Avoid" foods per D'Adamo classification.
 */
import type { RecipeResult } from './recipeDatabase';

export const BLOOD_TYPE_RECIPES: RecipeResult[] = [
  // ══════════════════════════════════════════════════════════════
  // TYPE O — "The Hunter" — High protein, avoid wheat/dairy/corn
  // Beneficial: beef, lamb, salmon, cod, kale, spinach, broccoli, plums, cherries, olive oil
  // Avoid: wheat, corn, dairy, kidney beans, oranges, strawberries, coconut, avocado
  // ══════════════════════════════════════════════════════════════
  {
    name: 'Type O Hunter\'s Lamb & Kale Bowl',
    category: 'meal',
    tags: ['blood-type-o', 'high-protein', 'iron', 'paleo', 'dinner'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['6 oz lamb loin chops', '2 cups chopped kale', '1 sweet potato cubed', '2 tbsp olive oil', '3 cloves garlic', '1 tsp rosemary', '1 tsp turmeric', 'sea salt and pepper'],
    instructions: ['Roast sweet potato at 400°F 25 min with 1 tbsp olive oil', 'Massage kale with remaining olive oil and lemon', 'Season lamb with rosemary, turmeric, salt, pepper', 'Grill or pan-sear lamb 4 min per side for medium', 'Plate kale, sweet potato, sliced lamb, drizzle pan juices'],
    healthBenefits: ['Lamb is "Beneficial" for Type O — high heme iron', 'Kale provides vitamin C to boost iron absorption', 'Turmeric reduces Type O inflammation tendency', 'No wheat, dairy, or corn — all Type O "Avoid" foods'],
    nutritionHighlights: '~540 cal, 38g protein, 6mg iron, vitamin A + K',
    prepTime: '35 min', servings: 1,
  },
  {
    name: 'Type O Salmon & Broccoli Power Plate',
    category: 'meal',
    tags: ['blood-type-o', 'omega-3', 'anti-inflammatory', 'dinner', 'brain'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['6 oz wild salmon', '2 cups broccoli florets', '1 tbsp olive oil', '2 cloves garlic minced', '1 lemon juiced', '1 tsp dried dill', 'sea salt and pepper'],
    instructions: ['Steam broccoli 5 min until crisp-tender', 'Season salmon with dill, garlic, lemon, salt', 'Pan-sear salmon in olive oil 4 min each side', 'Plate with broccoli, drizzle remaining lemon-garlic oil'],
    healthBenefits: ['Salmon and broccoli are both "Beneficial" for Type O', 'Rich in EPA/DHA for cardiovascular protection', 'No grains needed — aligns with Type O low-carb focus', 'Broccoli supports Phase 2 liver detox'],
    nutritionHighlights: '~420 cal, 40g protein, 2g+ omega-3, vitamin C + D',
    prepTime: '20 min', servings: 1,
  },
  {
    name: 'Type O Cherry-Plum Ginger Juice',
    category: 'juice',
    tags: ['blood-type-o', 'detox', 'anti-inflammatory', 'gut-health'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['1 cup dark cherries (pitted)', '2 plums', '1 inch fresh ginger', '2 celery stalks', '1/2 lemon'],
    instructions: ['Wash all produce', 'Juice celery first, then cherries, plums, ginger, lemon', 'Stir and drink immediately'],
    healthBenefits: ['Cherries and plums are "Beneficial" fruits for Type O', 'Ginger soothes the overactive Type O digestive tract', 'No oranges or strawberries — Type O "Avoid" fruits', 'Cherry anthocyanins reduce inflammation'],
    nutritionHighlights: '~130 cal, high anthocyanins, anti-inflammatory',
    prepTime: '8 min', servings: 1,
  },
  {
    name: 'Type O Spinach-Banana Protein Smoothie',
    category: 'smoothie',
    tags: ['blood-type-o', 'protein', 'iron', 'pre-workout', 'energy'],
    bloodTypes: ['O+', 'O-'],
    ingredients: ['2 cups spinach', '1 frozen banana', '1 cup rice milk (not dairy)', '1 scoop plant protein', '1 tbsp walnut butter', '1 tsp maca powder', '1/4 tsp cinnamon'],
    instructions: ['Blend spinach and rice milk until smooth', 'Add banana, protein, walnut butter, maca, cinnamon', 'Blend 60 seconds, serve immediately'],
    healthBenefits: ['Spinach and walnuts are "Beneficial" for Type O', 'Rice milk avoids dairy — a Type O "Avoid"', 'Maca supports the intense exercise Type O needs', 'No coconut milk or strawberries — Type O avoids'],
    nutritionHighlights: '~320 cal, 25g protein, iron + magnesium',
    prepTime: '5 min', servings: 1,
  },

  // ══════════════════════════════════════════════════════════════
  // TYPE A — "The Agrarian" — Plant-forward, avoid red meat/dairy
  // Beneficial: tofu, soy, salmon, sardines, peanuts, pumpkin seeds, broccoli, carrots, spinach, berries, pineapple
  // Avoid: red meat, dairy, kidney beans, lima beans, wheat (some), peppers, tomatoes
  // ══════════════════════════════════════════════════════════════
  {
    name: 'Type A Tofu Stir-Fry with Greens',
    category: 'meal',
    tags: ['blood-type-a', 'plant-based', 'high-protein', 'dinner', 'asian'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['14 oz firm tofu pressed and cubed', '2 cups broccoli florets', '1 cup sliced carrots', '2 cups spinach', '2 tbsp tamari (wheat-free soy sauce)', '1 tbsp olive oil', '2 cloves garlic', '1 tsp fresh ginger', '1 cup cooked brown rice'],
    instructions: ['Press tofu 15 min, cube into 1-inch pieces', 'Heat olive oil, cook tofu until golden on all sides', 'Add garlic, ginger, carrots, broccoli — stir-fry 5 min', 'Add tamari and spinach, cook until wilted', 'Serve over brown rice'],
    healthBenefits: ['Tofu is the #1 "Beneficial" protein for Type A', 'All vegetables used are "Beneficial" for Type A', 'No red meat or dairy — Type A "Avoid" foods', 'Olive oil supports the sensitive Type A immune system'],
    nutritionHighlights: '~480 cal, 28g protein, 12g fiber, complete aminos from soy',
    prepTime: '30 min', servings: 2,
  },
  {
    name: 'Type A Berry-Pineapple Antioxidant Smoothie',
    category: 'smoothie',
    tags: ['blood-type-a', 'antioxidant', 'immune', 'breakfast', 'vitamin-c'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['1 cup blueberries', '1/2 cup frozen pineapple', '1 cup soy milk', '1 tbsp ground flaxseed', '1 tbsp peanut butter', '1/2 frozen banana', '1 tsp honey'],
    instructions: ['Blend soy milk and berries until smooth', 'Add pineapple, banana, peanut butter, flaxseed, honey', 'Blend 45 seconds, serve immediately'],
    healthBenefits: ['Blueberries, pineapple, and peanuts are "Beneficial" for Type A', 'Soy milk provides plant protein without dairy', 'Pineapple bromelain aids Type A digestion', 'Flaxseed provides omega-3 without fish oil'],
    nutritionHighlights: '~310 cal, 14g protein, high antioxidants + vitamin C',
    prepTime: '5 min', servings: 1,
  },
  {
    name: 'Type A Carrot-Celery-Ginger Cleanse Juice',
    category: 'juice',
    tags: ['blood-type-a', 'cleanse', 'immune', 'digestion', 'detox'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['4 large carrots', '3 celery stalks', '1 inch fresh ginger', '1 green apple', '1/2 lemon', '1 cup spinach'],
    instructions: ['Wash all produce thoroughly', 'Juice carrots, celery, spinach, apple, ginger, lemon', 'Drink fresh — pairs well with Type A calming morning routine'],
    healthBenefits: ['Carrots and spinach are "Beneficial" vegetables for Type A', 'Ginger supports the sluggish Type A stomach acid', 'No tomatoes or peppers — Type A "Avoid" items', 'Alkalizing juice supports Type A immune sensitivity'],
    nutritionHighlights: '~110 cal, high beta-carotene + vitamin K',
    prepTime: '10 min', servings: 1,
  },
  {
    name: 'Type A Lentil-Spinach Soup',
    category: 'soup',
    tags: ['blood-type-a', 'plant-based', 'iron', 'comfort', 'fiber'],
    bloodTypes: ['A+', 'A-'],
    ingredients: ['1 cup green lentils', '3 cups spinach', '1 large carrot diced', '1 onion diced', '3 cloves garlic', '2 tbsp olive oil', '4 cups vegetable broth', '1 tsp cumin', '1/2 tsp turmeric', 'juice of 1 lemon'],
    instructions: ['Sauté onion, garlic, carrot in olive oil 5 min', 'Add lentils, broth, cumin, turmeric — bring to boil', 'Simmer 25 min until lentils are tender', 'Stir in spinach, cook 2 min until wilted', 'Finish with lemon juice, season to taste'],
    healthBenefits: ['Lentils are "Beneficial" legumes for Type A', 'Spinach provides iron for the plant-focused Type A diet', 'No dairy cream — uses broth base instead', 'Cumin and turmeric are anti-inflammatory'],
    nutritionHighlights: '~380 cal, 22g protein, 16g fiber, iron + folate',
    prepTime: '35 min', servings: 3,
  },

  // ══════════════════════════════════════════════════════════════
  // TYPE B — "The Nomad" — Balanced omnivore, avoid chicken/corn/wheat
  // Beneficial: lamb, venison, rabbit, cod, salmon, dairy (goat), eggs, green veggies, beets
  // Avoid: chicken, corn, wheat, buckwheat, lentils, peanuts, sesame, tomatoes
  // ══════════════════════════════════════════════════════════════
  {
    name: 'Type B Lamb & Root Vegetable Stew',
    category: 'soup',
    tags: ['blood-type-b', 'comfort', 'iron', 'winter', 'dinner'],
    bloodTypes: ['B+', 'B-'],
    ingredients: ['1 lb lamb shoulder cubed', '2 carrots chopped', '2 parsnips chopped', '1 beet cubed', '1 onion diced', '3 cloves garlic', '2 tbsp olive oil', '4 cups beef broth', '1 sprig rosemary', '1 bay leaf'],
    instructions: ['Brown lamb cubes in olive oil in dutch oven', 'Add onion, garlic — sauté 3 min', 'Add carrots, parsnips, beets, broth, herbs', 'Bring to boil, reduce to simmer 90 min covered', 'Remove bay leaf, season with salt and pepper'],
    healthBenefits: ['Lamb is the #1 "Beneficial" meat for Type B', 'Beets support liver detox — "Beneficial" for Type B', 'No chicken — the main Type B "Avoid" protein', 'Root vegetables are all "Beneficial" or "Neutral" for Type B'],
    nutritionHighlights: '~520 cal, 38g protein, iron + B12 + potassium',
    prepTime: '2 hours', servings: 4,
  },
  {
    name: 'Type B Cod with Beet & Egg Salad',
    category: 'salad',
    tags: ['blood-type-b', 'omega-3', 'brain', 'light', 'lunch'],
    bloodTypes: ['B+', 'B-'],
    ingredients: ['6 oz cod fillet', '2 roasted beets cubed', '2 hard-boiled eggs', 'mixed greens', '1/4 cup goat cheese crumbled', '2 tbsp olive oil', '1 tbsp apple cider vinegar', 'fresh dill'],
    instructions: ['Bake cod at 400°F for 12 min with olive oil and dill', 'Roast beets ahead of time (or use pre-cooked)', 'Hard boil eggs, slice in half', 'Assemble: greens, beets, flaked cod, eggs, goat cheese', 'Dress with olive oil and apple cider vinegar'],
    healthBenefits: ['Cod, eggs, goat cheese, beets — ALL "Beneficial" for Type B', 'Type B is unique: dairy is encouraged (especially goat)', 'No peanuts or sesame in dressing — Type B "Avoid"', 'Complete protein from three sources'],
    nutritionHighlights: '~450 cal, 36g protein, omega-3 + B12 + folate',
    prepTime: '25 min', servings: 1,
  },
  {
    name: 'Type B Beet-Grape-Ginger Juice',
    category: 'juice',
    tags: ['blood-type-b', 'detox', 'liver', 'energy', 'circulation'],
    bloodTypes: ['B+', 'B-'],
    ingredients: ['2 medium beets', '1 cup red grapes', '1 inch ginger', '2 carrots', '1/2 lemon'],
    instructions: ['Wash and chop produce', 'Juice beets, carrots, grapes, ginger, lemon', 'Stir well and drink fresh'],
    healthBenefits: ['Beets and grapes are "Beneficial" for Type B', 'Beet nitrates improve blood flow and exercise performance', 'No tomato juice — tomatoes are Type B "Avoid"', 'Ginger supports Type B digestive balance'],
    nutritionHighlights: '~160 cal, high nitrates + antioxidants',
    prepTime: '10 min', servings: 1,
  },
  {
    name: 'Type B Banana-Goat Yogurt Smoothie',
    category: 'smoothie',
    tags: ['blood-type-b', 'probiotic', 'breakfast', 'gut-health', 'calcium'],
    bloodTypes: ['B+', 'B-'],
    ingredients: ['1 cup goat milk yogurt', '1 frozen banana', '1/2 cup papaya chunks', '1 tbsp flaxseed', '1 tsp vanilla extract', '1 tsp honey', 'pinch of ginger'],
    instructions: ['Blend yogurt, banana, and papaya until smooth', 'Add flaxseed, vanilla, honey, ginger', 'Blend briefly, serve immediately'],
    healthBenefits: ['Goat yogurt is "Beneficial" dairy for Type B', 'Banana and papaya are "Beneficial" fruits for Type B', 'No coconut or peanut butter — Type B avoids', 'Probiotics from yogurt support Type B gut health'],
    nutritionHighlights: '~290 cal, 12g protein, calcium + probiotics',
    prepTime: '5 min', servings: 1,
  },

  // ══════════════════════════════════════════════════════════════
  // TYPE AB — "The Enigma" — Mixed A+B, avoid red meat/corn/kidney beans
  // Beneficial: tofu, lamb, turkey, salmon, sardines, goat cheese, kefir, greens, grapes, cherries
  // Avoid: beef, chicken, corn, buckwheat, kidney beans, smoked meats
  // ══════════════════════════════════════════════════════════════
  {
    name: 'Type AB Turkey-Tofu Lettuce Wraps',
    category: 'meal',
    tags: ['blood-type-ab', 'light', 'high-protein', 'lunch', 'low-carb'],
    bloodTypes: ['AB+', 'AB-'],
    ingredients: ['8 oz ground turkey', '4 oz firm tofu crumbled', 'butter lettuce leaves', '1 carrot shredded', '1/4 cup walnuts chopped', '2 tbsp tamari', '1 tsp ginger grated', '1 clove garlic', '1 tbsp olive oil', 'fresh cilantro'],
    instructions: ['Crumble tofu and press dry', 'Cook turkey and tofu in olive oil with garlic and ginger', 'Add tamari, cook 2 min more', 'Spoon into lettuce cups', 'Top with shredded carrot, walnuts, cilantro'],
    healthBenefits: ['Turkey and tofu are both "Beneficial" proteins for Type AB', 'Walnuts are "Beneficial" nuts for Type AB', 'No beef or chicken — both are Type AB "Avoid"', 'Small portions align with Type AB low stomach acid'],
    nutritionHighlights: '~420 cal, 34g protein, omega-3 from walnuts',
    prepTime: '20 min', servings: 2,
  },
  {
    name: 'Type AB Salmon-Kefir Power Bowl',
    category: 'meal',
    tags: ['blood-type-ab', 'omega-3', 'probiotic', 'dinner', 'brain'],
    bloodTypes: ['AB+', 'AB-'],
    ingredients: ['6 oz wild salmon', '1/2 cup millet cooked', '1 cup mixed greens', '1/4 cup kefir dressing (kefir + lemon + dill)', '1/4 avocado', '1 tbsp olive oil', 'cherry tomatoes (small amount OK for AB)', 'sea salt'],
    instructions: ['Cook millet according to package', 'Season salmon, pan-sear in olive oil 4 min per side', 'Mix kefir with lemon juice and dill for dressing', 'Assemble: millet, greens, flaked salmon, avocado', 'Drizzle kefir dressing, add cherry tomatoes'],
    healthBenefits: ['Salmon and kefir are "Beneficial" for Type AB', 'Millet is a "Beneficial" grain for Type AB (not wheat/corn)', 'Kefir provides probiotics for Type AB gut health', 'Smaller portion size suits Type AB low stomach acid'],
    nutritionHighlights: '~510 cal, 36g protein, omega-3 + probiotics + calcium',
    prepTime: '25 min', servings: 1,
  },
  {
    name: 'Type AB Cherry-Grape Antioxidant Juice',
    category: 'juice',
    tags: ['blood-type-ab', 'antioxidant', 'heart', 'alkalizing'],
    bloodTypes: ['AB+', 'AB-'],
    ingredients: ['1 cup dark cherries pitted', '1 cup red grapes', '2 celery stalks', '1/2 cucumber', '1/2 lemon'],
    instructions: ['Juice all ingredients in order', 'Stir well, drink immediately', 'Best consumed mid-morning for Type AB'],
    healthBenefits: ['Cherries and grapes are "Beneficial" fruits for Type AB', 'Alkalizing juice balances Type AB acidity issues', 'No oranges — some sources list as "Avoid" for AB', 'Heart-protective polyphenols from dark fruits'],
    nutritionHighlights: '~140 cal, high polyphenols + anthocyanins',
    prepTime: '8 min', servings: 1,
  },
  {
    name: 'Type AB Green Kefir Smoothie',
    category: 'smoothie',
    tags: ['blood-type-ab', 'probiotic', 'greens', 'breakfast', 'calcium'],
    bloodTypes: ['AB+', 'AB-'],
    ingredients: ['1 cup kefir', '1 cup spinach', '1/2 frozen banana', '1/2 cup pineapple', '1 tbsp walnut butter', '1 tsp spirulina (optional)', '1 tsp honey'],
    instructions: ['Blend kefir and spinach first', 'Add banana, pineapple, walnut butter, spirulina, honey', 'Blend until smooth, drink immediately'],
    healthBenefits: ['Kefir is "Beneficial" cultured dairy for Type AB', 'Pineapple bromelain aids Type AB protein digestion', 'Walnuts are "Beneficial" — no peanuts (Neutral for AB)', 'Spinach provides iron for plant-leaning Type AB diet'],
    nutritionHighlights: '~300 cal, 14g protein, calcium + probiotics + iron',
    prepTime: '5 min', servings: 1,
  },

  // ══════════════════════════════════════════════════════════════
  // UNIVERSAL — Blood-type-safe for ALL types (only overlapping "Beneficial"/"Neutral")
  // ══════════════════════════════════════════════════════════════
  {
    name: 'Universal Healing Bone Broth Soup',
    category: 'soup',
    tags: ['gut-health', 'collagen', 'immune', 'joint', 'healing', 'universal'],
    bloodTypes: [],
    ingredients: ['4 cups bone broth (lamb or turkey)', '2 carrots sliced', '2 celery stalks sliced', '1 cup spinach', '1 inch ginger sliced', '2 cloves garlic', '1 tbsp olive oil', '1 tsp turmeric', 'sea salt and pepper', 'fresh parsley'],
    instructions: ['Sauté garlic, carrots, celery in olive oil 3 min', 'Add bone broth, ginger, turmeric — simmer 15 min', 'Add spinach last 2 min', 'Season with salt, pepper, fresh parsley', 'Sip warm — great for illness recovery'],
    healthBenefits: ['Lamb/turkey broth safe for all blood types', 'Collagen supports gut lining and joints', 'Carrots, celery, spinach are universal safe veggies', 'Turmeric + ginger for systemic anti-inflammatory effect'],
    nutritionHighlights: '~180 cal, 15g protein, collagen + minerals',
    prepTime: '25 min', servings: 2,
  },
  {
    name: 'Universal Green Detox Juice',
    category: 'juice',
    tags: ['detox', 'alkalizing', 'energy', 'cleansing', 'universal'],
    bloodTypes: [],
    ingredients: ['4 celery stalks', '1 cucumber', '2 cups spinach', '1/2 green apple', '1/2 lemon', '1 inch ginger'],
    instructions: ['Juice celery, spinach, cucumber, apple, ginger, lemon', 'Drink on empty stomach', 'All ingredients are safe for every blood type'],
    healthBenefits: ['Every ingredient is "Beneficial" or "Neutral" for O, A, B, AB', 'Celery provides electrolytes without sugar', 'Spinach adds iron and folate', 'Ginger supports digestion across all types'],
    nutritionHighlights: '~70 cal, alkalizing, high vitamin K + folate',
    prepTime: '8 min', servings: 1,
  },
  {
    name: 'Universal Omega-3 Sardine Salad',
    category: 'salad',
    tags: ['omega-3', 'brain', 'heart', 'quick', 'lunch', 'universal'],
    bloodTypes: [],
    ingredients: ['1 can sardines in olive oil', 'mixed greens', '1/4 red onion sliced thin', '1 carrot shredded', '1/4 cup walnuts', '2 tbsp olive oil', '1 tbsp lemon juice', 'fresh parsley', 'sea salt and pepper'],
    instructions: ['Arrange greens on plate', 'Top with sardines, onion, carrot, walnuts', 'Drizzle olive oil and lemon juice', 'Season with salt, pepper, parsley'],
    healthBenefits: ['Sardines are "Beneficial" for ALL blood types', 'Walnuts are safe across all types', 'Olive oil is universally "Beneficial"', '2g+ EPA+DHA per serving from sardines'],
    nutritionHighlights: '~380 cal, 28g protein, 2g+ omega-3, calcium from bones',
    prepTime: '10 min', servings: 1,
  },
];
