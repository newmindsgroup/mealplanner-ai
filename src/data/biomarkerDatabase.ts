/**
 * Comprehensive Biomarker Reference Database
 * Maps lab tests to reference ranges, nutrition links, and food recommendations.
 * Used by the Labs Analysis feature for AI-powered blood work interpretation.
 */

export interface BiomarkerInfo {
  name: string;
  aliases: string[];
  loinc?: string;
  unit: string;
  category: string;
  ranges: {
    male: { low: number; high: number; optimal?: [number, number] };
    female: { low: number; high: number; optimal?: [number, number] };
  };
  description: string;
  highMeans: string;
  lowMeans: string;
  nutritionLinks: string[];
  foodsToImprove: { ifHigh: string[]; ifLow: string[] };
  bloodTypeNotes?: Record<string, string>;
}

export const BIOMARKER_DATABASE: Record<string, BiomarkerInfo> = {
  // ── CBC Panel ─────────────────────────────────────────────────────────
  hemoglobin: {
    name: 'Hemoglobin',
    aliases: ['Hgb', 'Hb', 'HGB'],
    loinc: '718-7',
    unit: 'g/dL',
    category: 'CBC',
    ranges: {
      male: { low: 13.5, high: 17.5, optimal: [14.5, 16.5] },
      female: { low: 12.0, high: 16.0, optimal: [13.0, 15.0] },
    },
    description: 'Oxygen-carrying protein in red blood cells',
    highMeans: 'Possible dehydration, lung disease, or polycythemia',
    lowMeans: 'Possible iron deficiency anemia, B12 deficiency, or chronic disease',
    nutritionLinks: ['iron', 'vitamin B12', 'folate', 'copper'],
    foodsToImprove: {
      ifHigh: ['hydrating foods', 'watermelon', 'cucumber', 'celery'],
      ifLow: ['red meat', 'spinach', 'lentils', 'fortified cereals', 'liver', 'dark chocolate'],
    },
    bloodTypeNotes: {
      O: 'Type O tends to have higher hemoglobin — lean red meat is ideal',
      A: 'Type A may benefit from plant-based iron sources like spinach and legumes',
    },
  },

  rbc: {
    name: 'Red Blood Cell Count',
    aliases: ['RBC', 'Erythrocytes'],
    loinc: '789-8',
    unit: 'M/uL',
    category: 'CBC',
    ranges: {
      male: { low: 4.5, high: 5.9 },
      female: { low: 4.0, high: 5.2 },
    },
    description: 'Number of red blood cells per microliter',
    highMeans: 'Dehydration, heart disease, or polycythemia vera',
    lowMeans: 'Anemia, nutritional deficiency, or bone marrow issues',
    nutritionLinks: ['iron', 'vitamin B12', 'folate', 'vitamin B6'],
    foodsToImprove: {
      ifHigh: ['omega-3 fish', 'garlic', 'ginger', 'turmeric'],
      ifLow: ['beef', 'organ meats', 'eggs', 'beans', 'leafy greens'],
    },
  },

  wbc: {
    name: 'White Blood Cell Count',
    aliases: ['WBC', 'Leukocytes'],
    loinc: '6690-2',
    unit: 'K/uL',
    category: 'CBC',
    ranges: {
      male: { low: 4.5, high: 11.0 },
      female: { low: 4.5, high: 11.0 },
    },
    description: 'Immune system cells that fight infection',
    highMeans: 'Active infection, inflammation, stress, or immune response',
    lowMeans: 'Weakened immune system, bone marrow issues, or autoimmune conditions',
    nutritionLinks: ['vitamin C', 'vitamin D', 'zinc', 'probiotics'],
    foodsToImprove: {
      ifHigh: ['anti-inflammatory foods', 'turmeric', 'ginger', 'leafy greens', 'berries'],
      ifLow: ['citrus fruits', 'bell peppers', 'yogurt', 'garlic', 'almonds'],
    },
  },

  platelets: {
    name: 'Platelet Count',
    aliases: ['PLT', 'Thrombocytes'],
    loinc: '777-3',
    unit: 'K/uL',
    category: 'CBC',
    ranges: {
      male: { low: 150, high: 400 },
      female: { low: 150, high: 400 },
    },
    description: 'Blood cells that help with clotting',
    highMeans: 'Inflammation, infection, iron deficiency, or bone marrow disorder',
    lowMeans: 'Viral infections, autoimmune conditions, or medication side effects',
    nutritionLinks: ['vitamin K', 'folate', 'iron', 'vitamin B12'],
    foodsToImprove: {
      ifHigh: ['omega-3 fatty acids', 'garlic', 'ginger', 'dark chocolate'],
      ifLow: ['leafy greens', 'papaya', 'pumpkin', 'wheatgrass', 'pomegranate'],
    },
  },

  // ── Metabolic Panel ───────────────────────────────────────────────────
  glucose: {
    name: 'Fasting Glucose',
    aliases: ['Blood Sugar', 'FBS', 'Fasting Blood Sugar', 'GLU'],
    loinc: '1558-6',
    unit: 'mg/dL',
    category: 'Metabolic',
    ranges: {
      male: { low: 70, high: 100, optimal: [75, 90] },
      female: { low: 70, high: 100, optimal: [75, 90] },
    },
    description: 'Blood sugar level after fasting',
    highMeans: 'Pre-diabetes or diabetes risk, insulin resistance',
    lowMeans: 'Hypoglycemia, excessive insulin, or liver issues',
    nutritionLinks: ['fiber', 'chromium', 'magnesium', 'cinnamon'],
    foodsToImprove: {
      ifHigh: ['cinnamon', 'berries', 'leafy greens', 'nuts', 'whole grains', 'apple cider vinegar'],
      ifLow: ['complex carbs', 'fruit', 'honey', 'whole grain bread'],
    },
    bloodTypeNotes: {
      O: 'Type O should focus on protein-rich meals to stabilize blood sugar',
      A: 'Type A benefits from plant-based complex carbs for steady glucose',
    },
  },

  hba1c: {
    name: 'Hemoglobin A1c',
    aliases: ['HbA1c', 'A1C', 'Glycated Hemoglobin'],
    loinc: '4548-4',
    unit: '%',
    category: 'Metabolic',
    ranges: {
      male: { low: 4.0, high: 5.6, optimal: [4.5, 5.2] },
      female: { low: 4.0, high: 5.6, optimal: [4.5, 5.2] },
    },
    description: '3-month average blood sugar level',
    highMeans: 'Poor blood sugar control, diabetes or pre-diabetes',
    lowMeans: 'Frequent low blood sugar episodes or blood disorders',
    nutritionLinks: ['fiber', 'chromium', 'omega-3', 'magnesium'],
    foodsToImprove: {
      ifHigh: ['leafy greens', 'berries', 'nuts', 'cinnamon', 'chia seeds', 'legumes'],
      ifLow: ['balanced meals', 'complex carbohydrates', 'regular meal timing'],
    },
  },

  // ── Lipid Panel ───────────────────────────────────────────────────────
  totalCholesterol: {
    name: 'Total Cholesterol',
    aliases: ['TC', 'Cholesterol Total', 'CHOL'],
    loinc: '2093-3',
    unit: 'mg/dL',
    category: 'Lipid Panel',
    ranges: {
      male: { low: 125, high: 200, optimal: [150, 190] },
      female: { low: 125, high: 200, optimal: [150, 190] },
    },
    description: 'Total amount of cholesterol in blood',
    highMeans: 'Increased cardiovascular risk',
    lowMeans: 'May indicate malnutrition, liver disease, or hyperthyroidism',
    nutritionLinks: ['omega-3', 'fiber', 'plant sterols', 'niacin'],
    foodsToImprove: {
      ifHigh: ['oats', 'almonds', 'avocado', 'olive oil', 'salmon', 'flaxseed'],
      ifLow: ['eggs', 'healthy fats', 'coconut oil', 'grass-fed butter'],
    },
  },

  ldl: {
    name: 'LDL Cholesterol',
    aliases: ['LDL', 'LDL-C', 'Bad Cholesterol'],
    loinc: '2089-1',
    unit: 'mg/dL',
    category: 'Lipid Panel',
    ranges: {
      male: { low: 0, high: 100, optimal: [50, 80] },
      female: { low: 0, high: 100, optimal: [50, 80] },
    },
    description: '"Bad" cholesterol that can build up in arteries',
    highMeans: 'Higher risk of heart disease and stroke',
    lowMeans: 'Generally favorable, but very low may indicate other issues',
    nutritionLinks: ['soluble fiber', 'omega-3', 'plant sterols'],
    foodsToImprove: {
      ifHigh: ['oats', 'beans', 'nuts', 'olive oil', 'avocado', 'barley', 'eggplant'],
      ifLow: [],
    },
  },

  hdl: {
    name: 'HDL Cholesterol',
    aliases: ['HDL', 'HDL-C', 'Good Cholesterol'],
    loinc: '2085-9',
    unit: 'mg/dL',
    category: 'Lipid Panel',
    ranges: {
      male: { low: 40, high: 100, optimal: [50, 80] },
      female: { low: 50, high: 100, optimal: [55, 80] },
    },
    description: '"Good" cholesterol that removes bad cholesterol',
    highMeans: 'Generally protective against heart disease',
    lowMeans: 'Increased cardiovascular risk',
    nutritionLinks: ['omega-3', 'monounsaturated fats', 'exercise'],
    foodsToImprove: {
      ifHigh: [],
      ifLow: ['olive oil', 'avocado', 'fatty fish', 'nuts', 'chia seeds', 'coconut oil'],
    },
  },

  triglycerides: {
    name: 'Triglycerides',
    aliases: ['TG', 'TRIG', 'Trigs'],
    loinc: '2571-8',
    unit: 'mg/dL',
    category: 'Lipid Panel',
    ranges: {
      male: { low: 0, high: 150, optimal: [50, 100] },
      female: { low: 0, high: 150, optimal: [50, 100] },
    },
    description: 'Fat molecules stored from excess calories',
    highMeans: 'Heart disease risk, metabolic syndrome, excess sugar/alcohol',
    lowMeans: 'May indicate malnutrition or hyperthyroidism',
    nutritionLinks: ['omega-3', 'fiber', 'reduced sugar'],
    foodsToImprove: {
      ifHigh: ['salmon', 'mackerel', 'walnuts', 'flaxseed', 'reduce sugar', 'limit alcohol'],
      ifLow: ['healthy fats', 'olive oil', 'avocado'],
    },
  },

  // ── Thyroid ───────────────────────────────────────────────────────────
  tsh: {
    name: 'Thyroid Stimulating Hormone',
    aliases: ['TSH', 'Thyrotropin'],
    loinc: '3016-3',
    unit: 'mIU/L',
    category: 'Thyroid',
    ranges: {
      male: { low: 0.4, high: 4.0, optimal: [1.0, 2.5] },
      female: { low: 0.4, high: 4.0, optimal: [1.0, 2.5] },
    },
    description: 'Controls thyroid hormone production and metabolism',
    highMeans: 'Hypothyroidism (underactive thyroid), fatigue, weight gain',
    lowMeans: 'Hyperthyroidism (overactive thyroid), anxiety, weight loss',
    nutritionLinks: ['iodine', 'selenium', 'zinc', 'vitamin D'],
    foodsToImprove: {
      ifHigh: ['seaweed', 'brazil nuts', 'fish', 'eggs', 'dairy', 'iodized salt'],
      ifLow: ['cruciferous vegetables (in moderation)', 'selenium-rich foods'],
    },
  },

  // ── Vitamins & Minerals ───────────────────────────────────────────────
  vitaminD: {
    name: 'Vitamin D, 25-Hydroxy',
    aliases: ['Vitamin D', '25(OH)D', 'Calcidiol', 'VIT D'],
    loinc: '1989-3',
    unit: 'ng/mL',
    category: 'Vitamins',
    ranges: {
      male: { low: 30, high: 100, optimal: [40, 60] },
      female: { low: 30, high: 100, optimal: [40, 60] },
    },
    description: 'Essential for bone health, immunity, and mood',
    highMeans: 'Possible toxicity from supplementation (rare from food/sun)',
    lowMeans: 'Weak bones, fatigue, depression, poor immune function',
    nutritionLinks: ['vitamin D3', 'calcium', 'magnesium', 'vitamin K2'],
    foodsToImprove: {
      ifHigh: ['reduce supplementation', 'monitor calcium levels'],
      ifLow: ['fatty fish', 'egg yolks', 'fortified milk', 'mushrooms', 'sunlight exposure'],
    },
  },

  vitaminB12: {
    name: 'Vitamin B12',
    aliases: ['B12', 'Cobalamin', 'VIT B12'],
    loinc: '2132-9',
    unit: 'pg/mL',
    category: 'Vitamins',
    ranges: {
      male: { low: 200, high: 900, optimal: [400, 700] },
      female: { low: 200, high: 900, optimal: [400, 700] },
    },
    description: 'Essential for nerve function, DNA synthesis, and red blood cells',
    highMeans: 'Usually from supplementation; rarely indicates liver disease',
    lowMeans: 'Fatigue, numbness, memory issues, megaloblastic anemia',
    nutritionLinks: ['vitamin B12', 'folate', 'iron'],
    foodsToImprove: {
      ifHigh: [],
      ifLow: ['clams', 'liver', 'sardines', 'beef', 'eggs', 'nutritional yeast', 'fortified cereals'],
    },
    bloodTypeNotes: {
      A: 'Type A often has lower B12 due to plant-forward diets — supplementation recommended',
      O: 'Type O typically gets adequate B12 from their protein-heavy diet',
    },
  },

  iron: {
    name: 'Serum Iron',
    aliases: ['Iron', 'Fe', 'Serum Fe'],
    loinc: '2498-4',
    unit: 'mcg/dL',
    category: 'Minerals',
    ranges: {
      male: { low: 65, high: 175 },
      female: { low: 50, high: 170 },
    },
    description: 'Mineral essential for oxygen transport in blood',
    highMeans: 'Hemochromatosis, liver damage risk, iron overload',
    lowMeans: 'Iron deficiency anemia, fatigue, weakness, pale skin',
    nutritionLinks: ['iron', 'vitamin C', 'copper'],
    foodsToImprove: {
      ifHigh: ['avoid red meat temporarily', 'reduce vitamin C with meals', 'drink tea with meals'],
      ifLow: ['red meat', 'spinach', 'lentils', 'tofu', 'dark chocolate', 'pumpkin seeds'],
    },
  },

  ferritin: {
    name: 'Ferritin',
    aliases: ['Serum Ferritin', 'FERR'],
    loinc: '2276-4',
    unit: 'ng/mL',
    category: 'Minerals',
    ranges: {
      male: { low: 30, high: 300, optimal: [50, 150] },
      female: { low: 15, high: 150, optimal: [30, 100] },
    },
    description: 'Iron storage protein — best indicator of total iron stores',
    highMeans: 'Iron overload, inflammation, infection, or liver disease',
    lowMeans: 'Depleted iron stores, early iron deficiency',
    nutritionLinks: ['iron', 'vitamin C', 'copper'],
    foodsToImprove: {
      ifHigh: ['turmeric', 'green tea', 'reduce red meat', 'calcium-rich foods with meals'],
      ifLow: ['liver', 'beef', 'oysters', 'white beans', 'spinach', 'fortified cereals'],
    },
  },

  // ── Inflammation ──────────────────────────────────────────────────────
  crp: {
    name: 'C-Reactive Protein',
    aliases: ['CRP', 'hs-CRP', 'High Sensitivity CRP'],
    loinc: '1988-5',
    unit: 'mg/L',
    category: 'Inflammation',
    ranges: {
      male: { low: 0, high: 3.0, optimal: [0, 1.0] },
      female: { low: 0, high: 3.0, optimal: [0, 1.0] },
    },
    description: 'Marker of systemic inflammation and cardiovascular risk',
    highMeans: 'Active inflammation, infection, autoimmune disease, or heart disease risk',
    lowMeans: 'Low inflammation (desirable)',
    nutritionLinks: ['omega-3', 'antioxidants', 'turmeric', 'fiber'],
    foodsToImprove: {
      ifHigh: ['fatty fish', 'turmeric', 'ginger', 'berries', 'leafy greens', 'olive oil', 'walnuts'],
      ifLow: [],
    },
    bloodTypeNotes: {
      O: 'Type O may have higher CRP with grains/dairy — try elimination diet',
      A: 'Type A benefits from anti-inflammatory plant foods',
    },
  },

  // ── Liver Panel ───────────────────────────────────────────────────────
  alt: {
    name: 'Alanine Aminotransferase',
    aliases: ['ALT', 'SGPT', 'GPT'],
    loinc: '1742-6',
    unit: 'U/L',
    category: 'Liver',
    ranges: {
      male: { low: 7, high: 56 },
      female: { low: 7, high: 45 },
    },
    description: 'Liver enzyme — elevated levels indicate liver stress',
    highMeans: 'Liver inflammation, fatty liver, hepatitis, or medication effects',
    lowMeans: 'Generally normal',
    nutritionLinks: ['milk thistle', 'NAC', 'vitamin E', 'omega-3'],
    foodsToImprove: {
      ifHigh: ['leafy greens', 'beets', 'artichoke', 'garlic', 'green tea', 'reduce alcohol'],
      ifLow: [],
    },
  },

  ast: {
    name: 'Aspartate Aminotransferase',
    aliases: ['AST', 'SGOT', 'GOT'],
    loinc: '1920-8',
    unit: 'U/L',
    category: 'Liver',
    ranges: {
      male: { low: 10, high: 40 },
      female: { low: 9, high: 32 },
    },
    description: 'Enzyme found in liver, heart, and muscles',
    highMeans: 'Liver damage, muscle injury, or heart issues',
    lowMeans: 'Generally normal',
    nutritionLinks: ['B vitamins', 'vitamin D', 'omega-3'],
    foodsToImprove: {
      ifHigh: ['cruciferous vegetables', 'turmeric', 'dandelion tea', 'reduce processed foods'],
      ifLow: [],
    },
  },

  // ── Kidney ────────────────────────────────────────────────────────────
  creatinine: {
    name: 'Creatinine',
    aliases: ['CREAT', 'Cr', 'Serum Creatinine'],
    loinc: '2160-0',
    unit: 'mg/dL',
    category: 'Kidney',
    ranges: {
      male: { low: 0.7, high: 1.3 },
      female: { low: 0.6, high: 1.1 },
    },
    description: 'Waste product from muscle metabolism — kidney function marker',
    highMeans: 'Impaired kidney function, dehydration, or high muscle mass',
    lowMeans: 'Low muscle mass or malnutrition',
    nutritionLinks: ['hydration', 'reduced protein if kidney issues'],
    foodsToImprove: {
      ifHigh: ['increase water', 'reduce red meat', 'eat more vegetables', 'cranberries'],
      ifLow: ['adequate protein', 'strength training'],
    },
  },

  bun: {
    name: 'Blood Urea Nitrogen',
    aliases: ['BUN', 'Urea Nitrogen'],
    loinc: '3094-0',
    unit: 'mg/dL',
    category: 'Kidney',
    ranges: {
      male: { low: 7, high: 20 },
      female: { low: 7, high: 20 },
    },
    description: 'Waste product from protein metabolism',
    highMeans: 'Kidney issues, dehydration, or very high protein diet',
    lowMeans: 'Low protein intake, liver disease, or over-hydration',
    nutritionLinks: ['protein balance', 'hydration'],
    foodsToImprove: {
      ifHigh: ['reduce protein temporarily', 'increase water', 'eat more fruits/vegetables'],
      ifLow: ['increase lean protein', 'eggs', 'fish', 'legumes'],
    },
  },

  // ── Electrolytes ──────────────────────────────────────────────────────
  potassium: {
    name: 'Potassium',
    aliases: ['K+', 'Serum Potassium'],
    loinc: '2823-3',
    unit: 'mEq/L',
    category: 'Electrolytes',
    ranges: {
      male: { low: 3.5, high: 5.0 },
      female: { low: 3.5, high: 5.0 },
    },
    description: 'Essential electrolyte for heart and muscle function',
    highMeans: 'Kidney issues, medication effects, or dangerous heart rhythm risk',
    lowMeans: 'Muscle weakness, cramps, fatigue, irregular heartbeat',
    nutritionLinks: ['potassium', 'magnesium'],
    foodsToImprove: {
      ifHigh: ['reduce high-potassium foods temporarily', 'increase water'],
      ifLow: ['bananas', 'potatoes', 'avocado', 'spinach', 'sweet potatoes', 'coconut water'],
    },
  },

  magnesium: {
    name: 'Magnesium',
    aliases: ['Mg', 'Serum Magnesium'],
    loinc: '19123-9',
    unit: 'mg/dL',
    category: 'Electrolytes',
    ranges: {
      male: { low: 1.7, high: 2.2 },
      female: { low: 1.7, high: 2.2 },
    },
    description: 'Essential mineral for 300+ enzymatic reactions',
    highMeans: 'Kidney issues or excessive supplementation',
    lowMeans: 'Muscle cramps, anxiety, insomnia, poor sleep quality',
    nutritionLinks: ['magnesium', 'vitamin D', 'vitamin B6'],
    foodsToImprove: {
      ifHigh: ['reduce supplementation'],
      ifLow: ['dark chocolate', 'almonds', 'pumpkin seeds', 'spinach', 'avocado', 'black beans'],
    },
  },
};

// ─── Lookup Helpers ────────────────────────────────────────────────────────────

/**
 * Find a biomarker by name or alias (case-insensitive)
 */
export function findBiomarker(nameOrAlias: string): BiomarkerInfo | null {
  const search = nameOrAlias.toLowerCase().trim();

  // Direct key match
  if (BIOMARKER_DATABASE[search]) {
    return BIOMARKER_DATABASE[search];
  }

  // Search by name or alias
  for (const [, info] of Object.entries(BIOMARKER_DATABASE)) {
    if (info.name.toLowerCase() === search) return info;
    if (info.aliases.some(a => a.toLowerCase() === search)) return info;
  }

  // Fuzzy match
  for (const [, info] of Object.entries(BIOMARKER_DATABASE)) {
    if (info.name.toLowerCase().includes(search)) return info;
    if (info.aliases.some(a => a.toLowerCase().includes(search))) return info;
  }

  return null;
}

/**
 * Get all biomarkers in a category
 */
export function getBiomarkersByCategory(category: string): BiomarkerInfo[] {
  return Object.values(BIOMARKER_DATABASE).filter(
    b => b.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get all available categories
 */
export function getBiomarkerCategories(): string[] {
  return [...new Set(Object.values(BIOMARKER_DATABASE).map(b => b.category))];
}

/**
 * Evaluate a lab result against reference ranges
 */
export function evaluateResult(
  nameOrAlias: string,
  value: number,
  sex: 'male' | 'female' = 'male'
): {
  biomarker: BiomarkerInfo;
  status: 'optimal' | 'normal' | 'low' | 'high' | 'critical';
  deviation: number;
  foods: string[];
  message: string;
} | null {
  const biomarker = findBiomarker(nameOrAlias);
  if (!biomarker) return null;

  const range = biomarker.ranges[sex];
  let status: 'optimal' | 'normal' | 'low' | 'high' | 'critical';
  let deviation = 0;

  if (value < range.low) {
    deviation = (range.low - value) / (range.high - range.low);
    status = deviation > 0.5 ? 'critical' : 'low';
  } else if (value > range.high) {
    deviation = (value - range.high) / (range.high - range.low);
    status = deviation > 0.5 ? 'critical' : 'high';
  } else if (range.optimal && value >= range.optimal[0] && value <= range.optimal[1]) {
    status = 'optimal';
  } else {
    status = 'normal';
  }

  const foods = status === 'high' || status === 'critical'
    ? biomarker.foodsToImprove.ifHigh
    : status === 'low'
      ? biomarker.foodsToImprove.ifLow
      : [];

  const message = status === 'optimal'
    ? `${biomarker.name} is in the optimal range`
    : status === 'normal'
      ? `${biomarker.name} is within normal limits`
      : status === 'high' || status === 'critical'
        ? `${biomarker.name} is elevated: ${biomarker.highMeans}`
        : `${biomarker.name} is low: ${biomarker.lowMeans}`;

  return { biomarker, status, deviation, foods, message };
}
