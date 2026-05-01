import type { Person, WeeklyPlan, GroceryList, Meal, PantryItem, ChatMessage, LabelAnalysis, Progress } from '../types';

// Demo People
export const demoPeople: Person[] = [
  {
    id: 'demo-person-1',
    name: 'Sarah Johnson',
    bloodType: 'A+',
    age: 34,
    allergies: ['peanuts'],
    dietaryCodes: [],
    eatingPreferences: ['Mediterranean', 'Vegetarian-friendly'],
    goals: ['Weight management', 'Increase energy'],
    bodyComposition: {
      weight: 145,
      height: 66,
      bmi: 23.4,
      bodyFat: 28
    }
  },
  {
    id: 'demo-person-2',
    name: 'Michael Chen',
    bloodType: 'O-',
    age: 42,
    allergies: [],
    dietaryCodes: [],
    eatingPreferences: ['High protein', 'Asian cuisine'],
    goals: ['Build muscle', 'Improve heart health'],
    bodyComposition: {
      weight: 185,
      height: 70,
      bmi: 26.6,
      bodyFat: 18
    }
  },
  {
    id: 'demo-person-3',
    name: 'Emma Rodriguez',
    bloodType: 'B+',
    age: 8,
    allergies: ['dairy'],
    dietaryCodes: [],
    eatingPreferences: ['Kid-friendly', 'Fruits'],
    goals: ['Healthy growth', 'Strong immunity'],
    bodyComposition: {
      weight: 60,
      height: 50
    }
  }
];

// Demo Meals
export const demoMeals: Meal[] = [
  {
    id: 'demo-meal-1',
    name: 'Mediterranean Quinoa Bowl',
    type: 'lunch',
    day: 'monday',
    ingredients: [
      'Quinoa (1 cup)',
      'Cherry tomatoes (1 cup)',
      'Cucumber (1/2 cup)',
      'Kalamata olives (1/4 cup)',
      'Feta cheese (2 oz)',
      'Olive oil (2 tbsp)',
      'Lemon juice',
      'Fresh mint'
    ],
    instructions: [
      'Cook quinoa according to package directions',
      'Dice tomatoes and cucumber',
      'Mix all ingredients in a large bowl',
      'Drizzle with olive oil and lemon juice',
      'Garnish with fresh mint'
    ],
    servings: 2,
    prepTime: 15,
    cookTime: 20,
    cuisine: 'mediterranean',
    healthBenefits: ['heart-health', 'high-protein', 'anti-inflammatory'],
    bloodTypeCompatibility: {
      'A+': { status: 'beneficial', score: 95, conflicts: [] },
      'A-': { status: 'beneficial', score: 95, conflicts: [] },
      'O+': { status: 'neutral', score: 75, conflicts: ['feta cheese'] },
      'O-': { status: 'neutral', score: 75, conflicts: ['feta cheese'] },
      'B+': { status: 'beneficial', score: 90, conflicts: [] },
      'B-': { status: 'beneficial', score: 90, conflicts: [] },
      'AB+': { status: 'beneficial', score: 92, conflicts: [] },
      'AB-': { status: 'beneficial', score: 92, conflicts: [] }
    },
    nutrition: {
      calories: 420,
      protein: 18,
      carbs: 45,
      fat: 16,
      fiber: 8
    },
    rationale: 'This Mediterranean bowl provides excellent nutrition for Type A blood, with quinoa as a beneficial grain and abundant vegetables. The olive oil supports heart health while fresh herbs add anti-inflammatory benefits.'
  },
  {
    id: 'demo-meal-2',
    name: 'Grilled Salmon with Asparagus',
    type: 'dinner',
    day: 'monday',
    ingredients: [
      'Wild salmon fillet (6 oz)',
      'Fresh asparagus (1 bunch)',
      'Garlic (3 cloves)',
      'Lemon (1)',
      'Olive oil (2 tbsp)',
      'Dill (fresh)',
      'Sea salt',
      'Black pepper'
    ],
    instructions: [
      'Preheat grill to medium-high',
      'Season salmon with salt, pepper, and dill',
      'Toss asparagus with olive oil and garlic',
      'Grill salmon 4-5 minutes per side',
      'Grill asparagus until tender-crisp',
      'Serve with lemon wedges'
    ],
    servings: 2,
    prepTime: 10,
    cookTime: 15,
    cuisine: 'american',
    healthBenefits: ['heart-health', 'high-protein', 'brain-health', 'anti-inflammatory'],
    bloodTypeCompatibility: {
      'A+': { status: 'beneficial', score: 85, conflicts: [] },
      'A-': { status: 'beneficial', score: 85, conflicts: [] },
      'O+': { status: 'beneficial', score: 98, conflicts: [] },
      'O-': { status: 'beneficial', score: 98, conflicts: [] },
      'B+': { status: 'beneficial', score: 92, conflicts: [] },
      'B-': { status: 'beneficial', score: 92, conflicts: [] },
      'AB+': { status: 'beneficial', score: 90, conflicts: [] },
      'AB-': { status: 'beneficial', score: 90, conflicts: [] }
    },
    nutrition: {
      calories: 380,
      protein: 42,
      carbs: 12,
      fat: 18,
      fiber: 5
    },
    rationale: 'Wild salmon is rich in omega-3 fatty acids, making it excellent for all blood types. The combination with asparagus provides a nutrient-dense, anti-inflammatory meal perfect for muscle building and heart health.'
  },
  {
    id: 'demo-meal-3',
    name: 'Berry Smoothie Bowl',
    type: 'breakfast',
    day: 'tuesday',
    ingredients: [
      'Frozen mixed berries (1.5 cups)',
      'Banana (1)',
      'Almond milk (1/2 cup)',
      'Chia seeds (1 tbsp)',
      'Granola (1/4 cup)',
      'Fresh blueberries',
      'Sliced almonds',
      'Honey drizzle'
    ],
    instructions: [
      'Blend frozen berries, banana, and almond milk until smooth',
      'Pour into a bowl',
      'Top with granola, fresh berries, almonds, and chia seeds',
      'Drizzle with honey if desired'
    ],
    servings: 1,
    prepTime: 5,
    cookTime: 0,
    cuisine: 'american',
    healthBenefits: ['antioxidant', 'energy', 'digestive-support', 'immunity-boost'],
    bloodTypeCompatibility: {
      'A+': { status: 'beneficial', score: 92, conflicts: [] },
      'A-': { status: 'beneficial', score: 92, conflicts: [] },
      'O+': { status: 'neutral', score: 78, conflicts: ['banana'] },
      'O-': { status: 'neutral', score: 78, conflicts: ['banana'] },
      'B+': { status: 'beneficial', score: 88, conflicts: [] },
      'B-': { status: 'beneficial', score: 88, conflicts: [] },
      'AB+': { status: 'beneficial', score: 90, conflicts: [] },
      'AB-': { status: 'beneficial', score: 90, conflicts: [] }
    },
    nutrition: {
      calories: 320,
      protein: 8,
      carbs: 58,
      fat: 9,
      fiber: 12
    },
    rationale: 'Packed with antioxidants from berries and omega-3s from chia seeds, this smoothie bowl provides sustained energy and supports immune function. Perfect for a quick, nutritious breakfast.'
  },
  {
    id: 'demo-meal-4',
    name: 'Asian Stir-Fry with Tofu',
    type: 'dinner',
    day: 'wednesday',
    ingredients: [
      'Firm tofu (14 oz)',
      'Broccoli florets (2 cups)',
      'Bell peppers (2)',
      'Snap peas (1 cup)',
      'Ginger (2 tbsp, minced)',
      'Garlic (4 cloves)',
      'Tamari sauce (3 tbsp)',
      'Sesame oil (1 tbsp)',
      'Brown rice (cooked)'
    ],
    instructions: [
      'Press tofu and cut into cubes',
      'Heat sesame oil in wok over high heat',
      'Stir-fry tofu until golden, set aside',
      'Stir-fry vegetables with ginger and garlic',
      'Add tofu back in with tamari sauce',
      'Serve over brown rice'
    ],
    servings: 3,
    prepTime: 15,
    cookTime: 12,
    cuisine: 'asian',
    healthBenefits: ['high-protein', 'anti-inflammatory', 'immunity-boost', 'digestive-support'],
    bloodTypeCompatibility: {
      'A+': { status: 'beneficial', score: 96, conflicts: [] },
      'A-': { status: 'beneficial', score: 96, conflicts: [] },
      'O+': { status: 'avoid', score: 45, conflicts: ['tofu', 'brown rice'] },
      'O-': { status: 'avoid', score: 45, conflicts: ['tofu', 'brown rice'] },
      'B+': { status: 'neutral', score: 72, conflicts: ['tofu'] },
      'B-': { status: 'neutral', score: 72, conflicts: ['tofu'] },
      'AB+': { status: 'beneficial', score: 88, conflicts: [] },
      'AB-': { status: 'beneficial', score: 88, conflicts: [] }
    },
    nutrition: {
      calories: 340,
      protein: 22,
      carbs: 42,
      fat: 11,
      fiber: 8
    },
    rationale: 'Tofu is an excellent plant-based protein for Type A blood. Combined with colorful vegetables and anti-inflammatory ginger, this stir-fry supports overall wellness and provides complete nutrition.'
  }
];

// Demo Weekly Plan
export const demoWeeklyPlan: WeeklyPlan = {
  id: 'demo-plan-1',
  name: 'Family Wellness Week',
  weekOf: new Date().toISOString().split('T')[0],
  people: demoPeople.map(p => p.id),
  meals: {
    monday: {
      breakfast: {
        ...demoMeals[2],
        day: 'monday',
        type: 'breakfast'
      },
      lunch: demoMeals[0],
      dinner: demoMeals[1],
      snack: {
        id: 'demo-snack-1',
        name: 'Apple Slices with Almond Butter',
        type: 'snack',
        day: 'monday',
        ingredients: ['Apple (1)', 'Almond butter (2 tbsp)'],
        instructions: ['Slice apple', 'Serve with almond butter'],
        servings: 1,
        prepTime: 2,
        cookTime: 0,
        bloodTypeCompatibility: {
          'A+': { status: 'beneficial', score: 90, conflicts: [] },
          'A-': { status: 'beneficial', score: 90, conflicts: [] },
          'O+': { status: 'beneficial', score: 85, conflicts: [] },
          'O-': { status: 'beneficial', score: 85, conflicts: [] },
          'B+': { status: 'beneficial', score: 88, conflicts: [] },
          'B-': { status: 'beneficial', score: 88, conflicts: [] },
          'AB+': { status: 'beneficial', score: 90, conflicts: [] },
          'AB-': { status: 'beneficial', score: 90, conflicts: [] }
        },
        nutrition: {
          calories: 180,
          protein: 4,
          carbs: 22,
          fat: 9,
          fiber: 5
        }
      }
    },
    tuesday: {
      breakfast: demoMeals[2],
      lunch: {
        ...demoMeals[3],
        type: 'lunch',
        day: 'tuesday'
      },
      dinner: {
        ...demoMeals[1],
        day: 'tuesday'
      },
      snack: {
        id: 'demo-snack-2',
        name: 'Greek Yogurt with Berries',
        type: 'snack',
        day: 'tuesday',
        ingredients: ['Greek yogurt (1 cup)', 'Mixed berries (1/2 cup)', 'Honey (1 tsp)'],
        instructions: ['Mix yogurt with berries', 'Drizzle with honey'],
        servings: 1,
        prepTime: 2,
        cookTime: 0,
        bloodTypeCompatibility: {
          'A+': { status: 'neutral', score: 70, conflicts: [] },
          'A-': { status: 'neutral', score: 70, conflicts: [] },
          'O+': { status: 'avoid', score: 40, conflicts: ['yogurt'] },
          'O-': { status: 'avoid', score: 40, conflicts: ['yogurt'] },
          'B+': { status: 'beneficial', score: 92, conflicts: [] },
          'B-': { status: 'beneficial', score: 92, conflicts: [] },
          'AB+': { status: 'beneficial', score: 88, conflicts: [] },
          'AB-': { status: 'beneficial', score: 88, conflicts: [] }
        },
        nutrition: {
          calories: 150,
          protein: 15,
          carbs: 20,
          fat: 2,
          fiber: 3
        }
      }
    },
    wednesday: {
      breakfast: { ...demoMeals[2], day: 'wednesday' },
      lunch: { ...demoMeals[0], day: 'wednesday' },
      dinner: demoMeals[3],
      snack: {
        id: 'demo-snack-3',
        name: 'Hummus with Veggie Sticks',
        type: 'snack',
        day: 'wednesday',
        ingredients: ['Hummus (1/4 cup)', 'Carrots', 'Celery', 'Bell peppers'],
        instructions: ['Cut vegetables into sticks', 'Serve with hummus'],
        servings: 1,
        prepTime: 5,
        cookTime: 0,
        bloodTypeCompatibility: {
          'A+': { status: 'beneficial', score: 94, conflicts: [] },
          'A-': { status: 'beneficial', score: 94, conflicts: [] },
          'O+': { status: 'neutral', score: 68, conflicts: [] },
          'O-': { status: 'neutral', score: 68, conflicts: [] },
          'B+': { status: 'beneficial', score: 86, conflicts: [] },
          'B-': { status: 'beneficial', score: 86, conflicts: [] },
          'AB+': { status: 'beneficial', score: 90, conflicts: [] },
          'AB-': { status: 'beneficial', score: 90, conflicts: [] }
        },
        nutrition: {
          calories: 120,
          protein: 5,
          carbs: 15,
          fat: 5,
          fiber: 4
        }
      }
    },
    thursday: { breakfast: { ...demoMeals[2], day: 'thursday' }, lunch: { ...demoMeals[3], day: 'thursday', type: 'lunch' }, dinner: { ...demoMeals[1], day: 'thursday' } },
    friday: { breakfast: { ...demoMeals[2], day: 'friday' }, lunch: { ...demoMeals[0], day: 'friday' }, dinner: { ...demoMeals[3], day: 'friday' } },
    saturday: { breakfast: { ...demoMeals[2], day: 'saturday' }, lunch: { ...demoMeals[0], day: 'saturday' }, dinner: { ...demoMeals[1], day: 'saturday' } },
    sunday: { breakfast: { ...demoMeals[2], day: 'sunday' }, lunch: { ...demoMeals[3], day: 'sunday', type: 'lunch' }, dinner: { ...demoMeals[1], day: 'sunday' } }
  },
  createdAt: new Date().toISOString(),
  preferences: {
    cuisinePreferences: ['mediterranean', 'asian', 'american'],
    avoidIngredients: ['peanuts', 'shellfish'],
    maxPrepTime: 45,
    budget: 'moderate',
    seasonalFocus: true
  }
};

// Demo Grocery List
export const demoGroceryList: GroceryList = {
  id: 'demo-grocery-1',
  name: 'Weekly Shopping List',
  planId: 'demo-plan-1',
  createdAt: new Date().toISOString(),
  items: [
    // Proteins
    { id: 'g1', name: 'Wild Salmon Fillets', category: 'proteins', quantity: '12 oz', checked: false, aisle: 'Seafood' },
    { id: 'g2', name: 'Firm Tofu', category: 'proteins', quantity: '2 packages', checked: false, aisle: 'Refrigerated' },
    { id: 'g3', name: 'Greek Yogurt', category: 'dairy', quantity: '32 oz', checked: false, aisle: 'Dairy' },
    
    // Vegetables
    { id: 'g4', name: 'Fresh Asparagus', category: 'vegetables', quantity: '2 bunches', checked: false, aisle: 'Produce' },
    { id: 'g5', name: 'Broccoli Florets', category: 'vegetables', quantity: '4 cups', checked: false, aisle: 'Produce' },
    { id: 'g6', name: 'Bell Peppers', category: 'vegetables', quantity: '6', checked: false, aisle: 'Produce' },
    { id: 'g7', name: 'Cherry Tomatoes', category: 'vegetables', quantity: '2 pints', checked: false, aisle: 'Produce' },
    { id: 'g8', name: 'Cucumber', category: 'vegetables', quantity: '2', checked: false, aisle: 'Produce' },
    { id: 'g9', name: 'Snap Peas', category: 'vegetables', quantity: '2 cups', checked: false, aisle: 'Produce' },
    
    // Fruits
    { id: 'g10', name: 'Frozen Mixed Berries', category: 'fruits', quantity: '32 oz', checked: false, aisle: 'Frozen' },
    { id: 'g11', name: 'Fresh Blueberries', category: 'fruits', quantity: '1 pint', checked: false, aisle: 'Produce' },
    { id: 'g12', name: 'Bananas', category: 'fruits', quantity: '6', checked: false, aisle: 'Produce' },
    { id: 'g13', name: 'Apples', category: 'fruits', quantity: '6', checked: false, aisle: 'Produce' },
    { id: 'g14', name: 'Lemons', category: 'fruits', quantity: '4', checked: false, aisle: 'Produce' },
    
    // Grains
    { id: 'g15', name: 'Quinoa', category: 'grains', quantity: '1 lb', checked: false, aisle: 'Grains & Rice' },
    { id: 'g16', name: 'Brown Rice', category: 'grains', quantity: '2 lbs', checked: false, aisle: 'Grains & Rice' },
    { id: 'g17', name: 'Granola', category: 'grains', quantity: '12 oz', checked: false, aisle: 'Cereal' },
    
    // Dairy & Alternatives
    { id: 'g18', name: 'Almond Milk', category: 'dairy', quantity: '64 oz', checked: false, aisle: 'Dairy' },
    { id: 'g19', name: 'Feta Cheese', category: 'dairy', quantity: '8 oz', checked: false, aisle: 'Dairy' },
    
    // Nuts & Seeds
    { id: 'g20', name: 'Almond Butter', category: 'nuts-seeds', quantity: '16 oz', checked: false, aisle: 'Nut Butter' },
    { id: 'g21', name: 'Chia Seeds', category: 'nuts-seeds', quantity: '8 oz', checked: false, aisle: 'Baking' },
    { id: 'g22', name: 'Sliced Almonds', category: 'nuts-seeds', quantity: '8 oz', checked: false, aisle: 'Baking' },
    { id: 'g23', name: 'Kalamata Olives', category: 'oils', quantity: '8 oz', checked: false, aisle: 'International' },
    
    // Pantry
    { id: 'g24', name: 'Olive Oil', category: 'oils', quantity: '1 bottle', checked: false, aisle: 'Oils' },
    { id: 'g25', name: 'Sesame Oil', category: 'oils', quantity: '1 bottle', checked: false, aisle: 'Asian' },
    { id: 'g26', name: 'Tamari Sauce', category: 'oils', quantity: '1 bottle', checked: false, aisle: 'Asian' },
    { id: 'g27', name: 'Honey', category: 'sweeteners', quantity: '12 oz', checked: false, aisle: 'Baking' },
    { id: 'g28', name: 'Hummus', category: 'proteins', quantity: '16 oz', checked: false, aisle: 'Deli' },
    
    // Fresh Herbs & Aromatics
    { id: 'g29', name: 'Fresh Garlic', category: 'spices', quantity: '2 bulbs', checked: false, aisle: 'Produce' },
    { id: 'g30', name: 'Fresh Ginger', category: 'spices', quantity: '4 oz', checked: false, aisle: 'Produce' },
    { id: 'g31', name: 'Fresh Dill', category: 'spices', quantity: '1 bunch', checked: false, aisle: 'Produce' },
    { id: 'g32', name: 'Fresh Mint', category: 'spices', quantity: '1 bunch', checked: false, aisle: 'Produce' }
  ]
};

// Demo Pantry Items
export const demoPantryItems: PantryItem[] = [
  {
    id: 'p1',
    name: 'Olive Oil',
    category: 'oils',
    quantity: 500,
    unit: 'ml',
    location: 'Pantry Shelf',
    purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_stock',
    minimumQuantity: 250,
    tags: ['cooking', 'healthy-fat'],
    notes: 'Extra virgin, cold-pressed'
  },
  {
    id: 'p2',
    name: 'Quinoa',
    category: 'grains',
    quantity: 200,
    unit: 'g',
    location: 'Pantry Container',
    purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'low_stock',
    minimumQuantity: 500,
    tags: ['grain', 'protein'],
    notes: 'Organic tri-color'
  },
  {
    id: 'p3',
    name: 'Almond Butter',
    category: 'nuts-seeds',
    quantity: 150,
    unit: 'g',
    location: 'Refrigerator Door',
    purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_stock',
    minimumQuantity: 100,
    tags: ['protein', 'snack'],
    notes: 'Natural, no added sugar'
  },
  {
    id: 'p4',
    name: 'Chia Seeds',
    category: 'nuts-seeds',
    quantity: 300,
    unit: 'g',
    location: 'Pantry Jar',
    purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_stock',
    minimumQuantity: 100,
    tags: ['superfood', 'omega-3'],
    notes: 'Organic black chia'
  },
  {
    id: 'p5',
    name: 'Greek Yogurt',
    category: 'dairy',
    quantity: 500,
    unit: 'g',
    location: 'Refrigerator Main',
    purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expiring_soon',
    minimumQuantity: 250,
    tags: ['protein', 'probiotic'],
    notes: 'Plain, full-fat'
  },
  {
    id: 'p6',
    name: 'Brown Rice',
    category: 'grains',
    quantity: 1000,
    unit: 'g',
    location: 'Pantry Container',
    purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_stock',
    minimumQuantity: 500,
    tags: ['grain', 'whole-grain'],
    notes: 'Long grain'
  }
];

// Demo Chat Messages
export const demoChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Can you suggest a quick dinner for tonight? We have salmon and asparagus.',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Great choice! I recommend Grilled Salmon with Asparagus - it\'s quick (25 min total), heart-healthy, and excellent for all blood types in your family. The omega-3s from wild salmon support brain health, while asparagus provides fiber and antioxidants. Would you like the full recipe?',
    timestamp: new Date(Date.now() - 119 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Yes please! And can you add it to this week\'s meal plan?',
    timestamp: new Date(Date.now() - 118 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: 'Perfect! I\'ve added Grilled Salmon with Asparagus to Monday\'s dinner. Here\'s the recipe:\n\n**Ingredients:** Wild salmon fillet (6 oz), Fresh asparagus, Garlic, Lemon, Olive oil, Fresh dill\n\n**Instructions:**\n1. Preheat grill to medium-high\n2. Season salmon with dill, salt, and pepper\n3. Toss asparagus with olive oil and minced garlic\n4. Grill salmon 4-5 minutes per side\n5. Grill asparagus until tender-crisp\n6. Serve with lemon wedges\n\nThis meal scores 98/100 for Type O, 85/100 for Type A, and 92/100 for Type B! 🎯',
    timestamp: new Date(Date.now() - 117 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-5',
    role: 'user',
    content: 'That sounds perfect! What about blood type compatibility with the quinoa bowl for lunch?',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-6',
    role: 'assistant',
    content: 'The Mediterranean Quinoa Bowl is excellent! Here\'s the breakdown:\n\n✅ **Type A (Sarah):** 95/100 - Beneficial! Quinoa is perfect for Type A\n⚠️ **Type O (Michael):** 75/100 - Neutral. The feta cheese is a minor conflict, but overall good\n✅ **Type B (Emma):** 90/100 - Beneficial! Great for kids\n\nFor Michael, you could substitute feta with avocado to boost it to 85/100. Would you like me to make that adjustment?',
    timestamp: new Date(Date.now() - 89 * 60 * 1000).toISOString()
  }
];

// Demo Label Analysis
export const demoLabelAnalysis: LabelAnalysis = {
  id: 'label-1',
  name: 'Whole Grain Crackers',
  imageUrl: '',
  analyzedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  extractedText: 'INGREDIENTS: Whole Wheat Flour, Canola Oil, Sea Salt, Yeast, Malted Barley Flour, Natural Flavor. CONTAINS: WHEAT',
  ingredients: [
    { name: 'Whole Wheat Flour', category: 'grains', warnings: [] },
    { name: 'Canola Oil', category: 'oils', warnings: [] },
    { name: 'Sea Salt', category: 'spices', warnings: [] },
    { name: 'Yeast', category: 'other', warnings: [] },
    { name: 'Malted Barley Flour', category: 'grains', warnings: [] }
  ],
  bloodTypeConflicts: {
    'O+': ['Whole Wheat Flour', 'Malted Barley Flour'],
    'O-': ['Whole Wheat Flour', 'Malted Barley Flour'],
    'A+': [],
    'A-': [],
    'B+': ['Whole Wheat Flour'],
    'B-': ['Whole Wheat Flour'],
    'AB+': [],
    'AB-': []
  },
  overallSafety: 'caution',
  recommendations: [
    'Type O individuals should avoid wheat-based products',
    'Type B should limit wheat consumption',
    'Consider rice crackers or almond flour alternatives'
  ],
  personSpecificAnalysis: demoPeople.map(person => ({
    personId: person.id,
    personName: person.name,
    conflicts: person.bloodType === 'O+' || person.bloodType === 'O-' 
      ? ['Whole Wheat Flour', 'Malted Barley Flour']
      : person.bloodType === 'B+' || person.bloodType === 'B-'
      ? ['Whole Wheat Flour']
      : [],
    overallRating: person.bloodType.startsWith('O') ? 'avoid' : person.bloodType.startsWith('B') ? 'caution' : 'safe'
  }))
};

// Demo Progress
export const demoProgress: Progress = {
  level: 8,
  xp: 2450,
  xpToNextLevel: 3000,
  streak: 12,
  longestStreak: 28,
  mealsCompleted: 87,
  badges: [
    { id: 'first-meal', name: 'First Meal', icon: '🍽️', unlockedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'week-streak', name: 'Week Warrior', icon: '🔥', unlockedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'label-scanner', name: 'Label Scanner', icon: '📱', unlockedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'meal-planner', name: 'Master Planner', icon: '📅', unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'health-conscious', name: 'Health Hero', icon: '💪', unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  achievements: {
    plansCreated: 14,
    favoritesAdded: 23,
    groceryListsGenerated: 18,
    labelsScanned: 34
  }
};

