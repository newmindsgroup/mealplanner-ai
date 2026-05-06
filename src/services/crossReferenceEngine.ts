/**
 * Cross-Reference Engine — Correlates data across labs, diet, pantry, and fitness.
 * Produces actionable intelligence by finding relationships between siloed health data.
 */
import { useStore } from '../store/useStore';
import type { LabReport, LabResult } from '../types/labs';
import type { PantryItem } from '../types/pantry';
import type { Person } from '../types/index';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CrossReference {
  id: string;
  type: 'lab-diet' | 'lab-pantry' | 'diet-fitness' | 'pantry-nutrition' | 'goal-gap';
  severity: 'info' | 'suggestion' | 'warning' | 'urgent';
  title: string;
  description: string;
  /** Source data points that form this cross-reference */
  sources: Array<{
    domain: 'labs' | 'pantry' | 'diet' | 'fitness' | 'profile';
    label: string;
    value: string;
  }>;
  /** Specific actionable recommendations */
  actions: string[];
  createdAt: string;
}

// ─── Biomarker ↔ Nutrient knowledge base ────────────────────────────────────

interface NutrientGuidance {
  nutrientName: string;
  helpfulFoods: string[];
  avoidFoods: string[];
  explanation: string;
}

const BIOMARKER_NUTRIENT_MAP: Record<string, NutrientGuidance> = {
  // Iron markers
  'iron': {
    nutrientName: 'Iron',
    helpfulFoods: ['red meat', 'spinach', 'lentils', 'beans', 'tofu', 'quinoa', 'dark chocolate', 'liver'],
    avoidFoods: ['coffee', 'tea', 'calcium-rich foods (when eating iron-rich foods)'],
    explanation: 'Iron is essential for oxygen transport. Pair iron-rich foods with vitamin C for better absorption.',
  },
  'ferritin': {
    nutrientName: 'Iron (Ferritin)',
    helpfulFoods: ['red meat', 'organ meats', 'shellfish', 'spinach', 'legumes', 'fortified cereals'],
    avoidFoods: ['excessive dairy during iron-rich meals', 'tannin-heavy teas'],
    explanation: 'Ferritin reflects stored iron. Low levels indicate depleted reserves even when hemoglobin is normal.',
  },
  // Vitamin D
  'vitamin d': {
    nutrientName: 'Vitamin D',
    helpfulFoods: ['fatty fish', 'egg yolks', 'fortified milk', 'mushrooms', 'cod liver oil'],
    avoidFoods: [],
    explanation: 'Vitamin D supports calcium absorption, immune function, and mood regulation. Sun exposure is the primary source.',
  },
  // B12
  'vitamin b12': {
    nutrientName: 'Vitamin B12',
    helpfulFoods: ['clams', 'liver', 'nutritional yeast', 'sardines', 'beef', 'fortified cereals', 'eggs'],
    avoidFoods: [],
    explanation: 'B12 is critical for nerve function and red blood cell formation. Vegans/vegetarians are at higher risk of deficiency.',
  },
  // Cholesterol
  'total cholesterol': {
    nutrientName: 'Cholesterol Management',
    helpfulFoods: ['oats', 'almonds', 'avocado', 'olive oil', 'fatty fish', 'flaxseed', 'beans'],
    avoidFoods: ['fried foods', 'processed meats', 'trans fats', 'excessive saturated fat'],
    explanation: 'Total cholesterol includes LDL and HDL. Focus on raising HDL and lowering LDL through diet and exercise.',
  },
  'ldl cholesterol': {
    nutrientName: 'LDL Reduction',
    helpfulFoods: ['soluble fiber foods', 'oats', 'barley', 'walnuts', 'almonds', 'olive oil', 'plant sterols'],
    avoidFoods: ['trans fats', 'fried foods', 'processed snacks', 'full-fat dairy', 'red meat'],
    explanation: 'LDL carries cholesterol to artery walls. Reducing it lowers cardiovascular risk.',
  },
  'hdl cholesterol': {
    nutrientName: 'HDL Enhancement',
    helpfulFoods: ['fatty fish', 'olive oil', 'nuts', 'avocado', 'flaxseed', 'chia seeds'],
    avoidFoods: ['trans fats', 'refined carbohydrates', 'sugary drinks'],
    explanation: 'HDL removes excess cholesterol. Higher levels are protective. Exercise and healthy fats raise HDL.',
  },
  'triglycerides': {
    nutrientName: 'Triglyceride Control',
    helpfulFoods: ['fatty fish', 'walnuts', 'flaxseed', 'olive oil', 'whole grains', 'legumes'],
    avoidFoods: ['sugar', 'refined carbs', 'alcohol', 'sugary drinks', 'white bread'],
    explanation: 'Triglycerides rise with excess sugar and refined carbs. Omega-3s and fiber help lower them.',
  },
  // Blood sugar
  'glucose': {
    nutrientName: 'Blood Sugar Management',
    helpfulFoods: ['leafy greens', 'berries', 'cinnamon', 'whole grains', 'legumes', 'nuts'],
    avoidFoods: ['white bread', 'sugary drinks', 'candy', 'fruit juice', 'white rice'],
    explanation: 'Fasting glucose reflects blood sugar control. Fiber and protein slow glucose absorption.',
  },
  'hba1c': {
    nutrientName: 'Long-term Blood Sugar',
    helpfulFoods: ['non-starchy vegetables', 'legumes', 'whole grains', 'nuts', 'seeds', 'lean protein'],
    avoidFoods: ['refined sugars', 'processed carbs', 'sugary beverages', 'white flour'],
    explanation: 'HbA1c reflects average blood sugar over 2-3 months. Lower values indicate better glucose management.',
  },
  // Thyroid
  'tsh': {
    nutrientName: 'Thyroid Support',
    helpfulFoods: ['seaweed', 'iodized salt', 'brazil nuts (selenium)', 'eggs', 'dairy', 'fish'],
    avoidFoods: ['excessive soy', 'raw cruciferous vegetables (in large amounts)', 'highly processed foods'],
    explanation: 'TSH reflects thyroid function. Both high and low values need attention. Iodine and selenium support thyroid health.',
  },
  // Inflammation
  'crp': {
    nutrientName: 'Anti-Inflammatory Diet',
    helpfulFoods: ['turmeric', 'ginger', 'fatty fish', 'berries', 'leafy greens', 'tomatoes', 'olive oil'],
    avoidFoods: ['refined sugar', 'fried foods', 'processed meats', 'excessive alcohol', 'refined carbs'],
    explanation: 'CRP is a key inflammation marker. Chronic elevation increases disease risk. Anti-inflammatory foods help.',
  },
};

// ─── Main Engine ────────────────────────────────────────────────────────────

/** Run the full cross-reference analysis and return all findings */
export function runCrossReferenceAnalysis(): CrossReference[] {
  const store = useStore.getState();
  const { people, labReports, pantryItems } = store;
  const results: CrossReference[] = [];

  if (people.length === 0) return results;
  const person = people[0];

  // 1. Lab ↔ Pantry correlations
  if (labReports.length > 0 && pantryItems.length > 0) {
    results.push(...correlateLabsWithPantry(labReports, pantryItems, person));
  }

  // 2. Lab ↔ Diet goal gaps
  if (labReports.length > 0) {
    results.push(...detectLabDietGaps(labReports, person));
  }

  // 3. Pantry nutritional balance
  if (pantryItems.length >= 3) {
    results.push(...analyzePantryNutrition(pantryItems, person));
  }

  // 4. Goal alignment checks
  if (person.goals.length > 0) {
    results.push(...checkGoalAlignment(person, labReports, pantryItems));
  }

  return results.sort((a, b) => {
    const severityOrder = { urgent: 0, warning: 1, suggestion: 2, info: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// ─── Correlation Functions ──────────────────────────────────────────────────

function correlateLabsWithPantry(
  reports: LabReport[],
  pantry: PantryItem[],
  _person: Person,
): CrossReference[] {
  const refs: CrossReference[] = [];
  const latest = reports[0];
  if (!latest?.results) return refs;

  const pantryNames = pantry.map((p) => p.name.toLowerCase());

  for (const result of latest.results) {
    if (result.status === 'normal') continue;

    const testKey = result.testName.toLowerCase();
    const guidance = findGuidanceForTest(testKey);
    if (!guidance) continue;

    // Check if pantry has helpful foods
    const helpfulInPantry = guidance.helpfulFoods.filter((f) =>
      pantryNames.some((pn) => pn.includes(f.toLowerCase()) || f.toLowerCase().includes(pn))
    );

    // Check if pantry has foods to avoid
    const avoidInPantry = guidance.avoidFoods.filter((f) =>
      pantryNames.some((pn) => pn.includes(f.toLowerCase()) || f.toLowerCase().includes(pn))
    );

    if (avoidInPantry.length > 0) {
      refs.push({
        id: `lab-pantry-avoid-${result.id}`,
        type: 'lab-pantry',
        severity: result.status === 'critical' ? 'urgent' : 'warning',
        title: `Pantry contains foods that may worsen your ${result.testName}`,
        description: `Your ${result.testName} is ${result.status} (${result.value} ${result.unit}). You have ${avoidInPantry.join(', ')} in your pantry which may negatively affect this marker.`,
        sources: [
          { domain: 'labs', label: result.testName, value: `${result.value} ${result.unit} (${result.status})` },
          { domain: 'pantry', label: 'Foods to reconsider', value: avoidInPantry.join(', ') },
        ],
        actions: [
          `Consider reducing consumption of: ${avoidInPantry.join(', ')}`,
          ...guidance.helpfulFoods.slice(0, 3).map((f) => `Try adding ${f} to your diet`),
        ],
        createdAt: new Date().toISOString(),
      });
    }

    if (helpfulInPantry.length > 0 && (result.status === 'low' || result.status === 'high')) {
      refs.push({
        id: `lab-pantry-help-${result.id}`,
        type: 'lab-pantry',
        severity: 'suggestion',
        title: `Your pantry has foods that can help improve ${result.testName}`,
        description: `${guidance.explanation} You already have ${helpfulInPantry.join(', ')} — increase these in your meals.`,
        sources: [
          { domain: 'labs', label: result.testName, value: `${result.value} ${result.unit} (${result.status})` },
          { domain: 'pantry', label: 'Helpful foods available', value: helpfulInPantry.join(', ') },
        ],
        actions: [
          `Increase consumption of: ${helpfulInPantry.join(', ')}`,
          `${guidance.explanation}`,
        ],
        createdAt: new Date().toISOString(),
      });
    }

    // Missing helpful foods
    const missingHelpful = guidance.helpfulFoods.filter((f) =>
      !pantryNames.some((pn) => pn.includes(f.toLowerCase()) || f.toLowerCase().includes(pn))
    );
    if (missingHelpful.length > 0) {
      refs.push({
        id: `lab-pantry-missing-${result.id}`,
        type: 'lab-pantry',
        severity: 'suggestion',
        title: `Add these to your pantry to support ${result.testName}`,
        description: `Your ${result.testName} is ${result.status}. Consider stocking: ${missingHelpful.slice(0, 5).join(', ')}`,
        sources: [
          { domain: 'labs', label: result.testName, value: `${result.value} ${result.unit}` },
          { domain: 'pantry', label: 'Suggested additions', value: missingHelpful.slice(0, 5).join(', ') },
        ],
        actions: missingHelpful.slice(0, 5).map((f) => `Add ${f} to your grocery list`),
        createdAt: new Date().toISOString(),
      });
    }
  }

  return refs;
}

function detectLabDietGaps(reports: LabReport[], _person: Person): CrossReference[] {
  const refs: CrossReference[] = [];
  const latest = reports[0];
  if (!latest?.results) return refs;

  const abnormalResults = latest.results.filter((r) => r.status !== 'normal');
  if (abnormalResults.length === 0) return refs;

  // Cluster abnormal results by category for a holistic view
  const byCategory = new Map<string, LabResult[]>();
  for (const r of abnormalResults) {
    const cat = r.category || 'other';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(r);
  }

  for (const [category, results] of byCategory) {
    if (results.length >= 2) {
      refs.push({
        id: `lab-cluster-${category}`,
        type: 'lab-diet',
        severity: results.some((r) => r.status === 'critical') ? 'urgent' : 'warning',
        title: `Multiple ${formatCategory(category)} markers are abnormal`,
        description: `${results.length} tests in your ${formatCategory(category)} panel are outside normal range: ${results.map((r) => `${r.testName} (${r.status})`).join(', ')}. This pattern may indicate a dietary or lifestyle concern worth discussing with your provider.`,
        sources: results.map((r) => ({
          domain: 'labs' as const,
          label: r.testName,
          value: `${r.value} ${r.unit} (${r.status})`,
        })),
        actions: [
          `Schedule a follow-up with your healthcare provider to discuss ${formatCategory(category)} results`,
          `Review your diet for ${formatCategory(category)}-supporting foods`,
        ],
        createdAt: new Date().toISOString(),
      });
    }
  }

  return refs;
}

function analyzePantryNutrition(pantry: PantryItem[], person: Person): CrossReference[] {
  const refs: CrossReference[] = [];

  // Check blood type compatibility of pantry
  if (person.bloodType) {
    const incompatible = pantry.filter((item) => {
      const compat = item.bloodTypeCompatibility?.[person.bloodType];
      return compat === 'avoid';
    });

    if (incompatible.length > 0) {
      refs.push({
        id: 'pantry-bloodtype-avoid',
        type: 'pantry-nutrition',
        severity: 'warning',
        title: `${incompatible.length} pantry items to avoid for blood type ${person.bloodType}`,
        description: `These items in your pantry are flagged as "avoid" for blood type ${person.bloodType}: ${incompatible.map((i) => i.name).slice(0, 8).join(', ')}`,
        sources: [
          { domain: 'profile', label: 'Blood Type', value: person.bloodType },
          { domain: 'pantry', label: 'Items to avoid', value: `${incompatible.length} items` },
        ],
        actions: incompatible.slice(0, 5).map((i) => `Consider replacing ${i.name} with a blood-type compatible alternative`),
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Check for allergens in pantry
  if (person.allergies.length > 0) {
    const allergenItems = pantry.filter((item) =>
      item.allergens?.some((a) =>
        person.allergies.some((pa) => pa.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(pa.toLowerCase()))
      )
    );

    if (allergenItems.length > 0) {
      refs.push({
        id: 'pantry-allergen-alert',
        type: 'pantry-nutrition',
        severity: 'urgent',
        title: `⚠️ ${allergenItems.length} pantry items contain your allergens`,
        description: `These items may contain allergens you've flagged: ${allergenItems.map((i) => i.name).join(', ')}`,
        sources: [
          { domain: 'profile', label: 'Allergies', value: person.allergies.join(', ') },
          { domain: 'pantry', label: 'Items with allergens', value: allergenItems.map((i) => i.name).join(', ') },
        ],
        actions: allergenItems.map((i) => `Verify ${i.name} ingredients — may contain ${person.allergies.join(' or ')}`),
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Expiring items → use in meals
  const expiring = pantry.filter((i) => i.isExpiringSoon);
  if (expiring.length >= 2) {
    refs.push({
      id: 'pantry-expiring-cook',
      type: 'pantry-nutrition',
      severity: 'suggestion',
      title: `${expiring.length} items expiring soon — cook with them!`,
      description: `Use these before they expire: ${expiring.map((i) => i.name).join(', ')}. Ask Nourish AI for recipe ideas using these ingredients.`,
      sources: expiring.map((i) => ({
        domain: 'pantry' as const,
        label: i.name,
        value: `Expires: ${i.expirationDate || 'soon'}`,
      })),
      actions: [
        `Ask AI: "What can I cook with ${expiring.slice(0, 3).map((i) => i.name).join(', ')}?"`,
        'Plan meals around expiring items to reduce food waste',
      ],
      createdAt: new Date().toISOString(),
    });
  }

  return refs;
}

function checkGoalAlignment(
  person: Person,
  reports: LabReport[],
  pantry: PantryItem[],
): CrossReference[] {
  const refs: CrossReference[] = [];
  const goals = person.goals.map((g) => g.toLowerCase());

  // Weight loss goal checks
  if (goals.some((g) => g.includes('weight') || g.includes('lose') || g.includes('lean'))) {
    const highCalPantry = pantry.filter((i) => (i.nutritionalInfo?.calories || 0) > 400);
    if (highCalPantry.length > 3) {
      refs.push({
        id: 'goal-weight-pantry',
        type: 'goal-gap',
        severity: 'suggestion',
        title: 'Your pantry has many calorie-dense items',
        description: `You have a weight management goal, but ${highCalPantry.length} pantry items are high-calorie (>400 cal/serving). Consider balancing with more vegetables and lean proteins.`,
        sources: [
          { domain: 'profile', label: 'Goal', value: 'Weight management' },
          { domain: 'pantry', label: 'High-cal items', value: `${highCalPantry.length} items over 400 cal` },
        ],
        actions: [
          'Stock up on leafy greens, lean proteins, and high-fiber foods',
          'Use portion control for calorie-dense items',
        ],
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Heart health goal checks
  if (goals.some((g) => g.includes('heart') || g.includes('cardio') || g.includes('cholesterol'))) {
    const latest = reports[0];
    const lipidResults = latest?.results?.filter((r) => r.category === 'lipid') || [];
    const abnormalLipids = lipidResults.filter((r) => r.status !== 'normal');

    if (abnormalLipids.length > 0) {
      refs.push({
        id: 'goal-heart-labs',
        type: 'goal-gap',
        severity: 'warning',
        title: 'Your heart health goal has actionable lab data',
        description: `You have a heart health goal and ${abnormalLipids.length} lipid markers are abnormal. Dietary changes can make a significant impact.`,
        sources: [
          { domain: 'profile', label: 'Goal', value: 'Heart health' },
          ...abnormalLipids.map((r) => ({
            domain: 'labs' as const,
            label: r.testName,
            value: `${r.value} ${r.unit} (${r.status})`,
          })),
        ],
        actions: [
          'Increase omega-3 fatty acids (fish, walnuts, flaxseed)',
          'Add soluble fiber (oats, beans, lentils)',
          'Reduce saturated fat and trans fat intake',
          'Exercise at least 30 minutes most days',
        ],
        createdAt: new Date().toISOString(),
      });
    }
  }

  return refs;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function findGuidanceForTest(testName: string): NutrientGuidance | null {
  const lower = testName.toLowerCase();
  for (const [key, guidance] of Object.entries(BIOMARKER_NUTRIENT_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return guidance;
    }
  }
  return null;
}

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    cbc: 'Complete Blood Count',
    cmp: 'Metabolic Panel',
    lipid: 'Lipid Panel',
    thyroid: 'Thyroid',
    diabetes: 'Blood Sugar',
    liver: 'Liver Function',
    kidney: 'Kidney Function',
    vitamins: 'Vitamin',
    iron: 'Iron',
    hormones: 'Hormone',
    inflammation: 'Inflammation',
  };
  return map[cat] || cat;
}
