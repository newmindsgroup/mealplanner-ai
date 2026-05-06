/**
 * Proactive Insights Service — Automated health intelligence that surfaces
 * personalized recommendations without the user having to ask.
 * 
 * Runs analysis on app data and produces prioritized insight cards
 * for the dashboard and chat panel.
 */
import { useStore } from '../store/useStore';
import { runCrossReferenceAnalysis, type CrossReference } from './crossReferenceEngine';
import { searchRecipeDatabase } from '../data/recipeDatabase';
import type { LabReport } from '../types/labs';
import type { PantryItem } from '../types/pantry';
import type { Person } from '../types/index';

// ─── Types ──────────────────────────────────────────────────────────────────

export type InsightCategory =
  | 'lab_trend'
  | 'nutrition_gap'
  | 'pantry_alert'
  | 'goal_progress'
  | 'cross_reference'
  | 'health_tip'
  | 'data_quality';

export interface ProactiveInsight {
  id: string;
  category: InsightCategory;
  severity: 'info' | 'suggestion' | 'warning' | 'urgent';
  title: string;
  description: string;
  /** Markdown-formatted detail for expanded view */
  detail?: string;
  /** Suggested chat prompt the user can click to get more info */
  chatPrompt?: string;
  /** Page to navigate to for action */
  targetPage?: string;
  /** When this insight was generated */
  createdAt: string;
  /** Whether the user has seen/dismissed this */
  dismissed?: boolean;
}

// ─── Main Analysis ──────────────────────────────────────────────────────────

/** Run all proactive analyses and return a prioritized list of insights */
export function generateProactiveInsights(): ProactiveInsight[] {
  const store = useStore.getState();
  const { people, labReports, pantryItems, currentPlan } = store;
  const insights: ProactiveInsight[] = [];

  if (people.length === 0) {
    insights.push({
      id: 'setup-profile',
      category: 'data_quality',
      severity: 'suggestion',
      title: 'Complete your health profile',
      description: 'Set up your blood type, allergies, and health goals so Nourish AI can give you personalized recommendations.',
      chatPrompt: 'Help me set up my health profile',
      targetPage: 'profile',
      createdAt: new Date().toISOString(),
    });
    return insights;
  }

  const person = people[0];

  // 1. Data completeness checks
  insights.push(...checkDataCompleteness(person, labReports, pantryItems));

  // 2. Lab trends & anomalies
  if (labReports.length > 0) {
    insights.push(...analyzeLabTrends(labReports, person));
  }

  // 3. Pantry intelligence
  if (pantryItems.length > 0) {
    insights.push(...analyzePantryInsights(pantryItems, person));
  }

  // 4. Cross-reference insights (from the engine)
  const crossRefs = runCrossReferenceAnalysis();
  insights.push(...crossRefs.map(crossRefToInsight));

  // 5. Goal-based tips
  if (person.goals.length > 0) {
    insights.push(...generateGoalTips(person));
  }

  // 6. Meal plan gaps
  if (!currentPlan) {
    insights.push({
      id: 'no-meal-plan',
      category: 'nutrition_gap',
      severity: 'suggestion',
      title: 'No active meal plan',
      description: 'Create a personalized meal plan based on your blood type and health goals for optimal nutrition.',
      chatPrompt: 'Create a meal plan for this week based on my blood type and what\'s in my pantry',
      targetPage: 'weekly-plan',
      createdAt: new Date().toISOString(),
    });
  }

  // 7. Supplement-aware recipe suggestions
  if (person.bloodType && labReports.length > 0) {
    insights.push(...generateSupplementRecipeSuggestions(person, labReports));
  }

  // Deduplicate by ID and sort by severity
  const deduped = new Map<string, ProactiveInsight>();
  for (const insight of insights) {
    if (!deduped.has(insight.id)) {
      deduped.set(insight.id, insight);
    }
  }

  const severityOrder: Record<string, number> = { urgent: 0, warning: 1, suggestion: 2, info: 3 };
  return Array.from(deduped.values())
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 15); // Cap at 15 insights to avoid overwhelm
}

// ─── Data Completeness ──────────────────────────────────────────────────────

function checkDataCompleteness(
  person: Person,
  reports: LabReport[],
  pantry: PantryItem[],
): ProactiveInsight[] {
  const insights: ProactiveInsight[] = [];

  if (!person.bloodType) {
    insights.push({
      id: 'missing-bloodtype',
      category: 'data_quality',
      severity: 'warning',
      title: 'Blood type not set',
      description: 'Your blood type drives personalized food recommendations. Set it in your profile or tell me in chat.',
      chatPrompt: 'I want to set my blood type',
      targetPage: 'profile',
      createdAt: new Date().toISOString(),
    });
  }

  if (person.allergies.length === 0) {
    insights.push({
      id: 'missing-allergies',
      category: 'data_quality',
      severity: 'info',
      title: 'No allergies listed',
      description: 'Even if you have no allergies, confirming this helps Nourish AI give safer recommendations.',
      chatPrompt: 'I want to update my allergy information',
      targetPage: 'profile',
      createdAt: new Date().toISOString(),
    });
  }

  if (reports.length === 0) {
    insights.push({
      id: 'no-labs',
      category: 'data_quality',
      severity: 'suggestion',
      title: 'Upload your lab results',
      description: 'Lab data unlocks powerful health insights — Nourish AI can correlate your bloodwork with your diet and pantry.',
      chatPrompt: 'I have lab results to upload',
      targetPage: 'labs',
      createdAt: new Date().toISOString(),
    });
  }

  if (pantry.length === 0) {
    insights.push({
      id: 'no-pantry',
      category: 'data_quality',
      severity: 'suggestion',
      title: 'Add items to your pantry',
      description: 'Stocking your digital pantry enables meal planning from what you already have.',
      chatPrompt: 'Help me add items to my pantry',
      targetPage: 'my-pantry',
      createdAt: new Date().toISOString(),
    });
  }

  // Stale labs check
  if (reports.length > 0) {
    const latest = reports[0];
    const daysSinceLab = Math.floor(
      (Date.now() - new Date(latest.testDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLab > 180) {
      insights.push({
        id: 'stale-labs',
        category: 'lab_trend',
        severity: 'suggestion',
        title: 'Lab results may be outdated',
        description: `Your most recent lab report is ${daysSinceLab} days old. Consider getting updated bloodwork for more accurate recommendations.`,
        chatPrompt: 'When should I get my next blood test?',
        targetPage: 'labs',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return insights;
}

// ─── Lab Trend Analysis ─────────────────────────────────────────────────────

function analyzeLabTrends(reports: LabReport[], _person: Person): ProactiveInsight[] {
  const insights: ProactiveInsight[] = [];
  const latest = reports[0];
  if (!latest?.results) return insights;

  // Count abnormal results
  const abnormal = latest.results.filter((r) => r.status !== 'normal');
  const critical = abnormal.filter((r) => r.status === 'critical');

  if (critical.length > 0) {
    insights.push({
      id: 'critical-labs',
      category: 'lab_trend',
      severity: 'urgent',
      title: `🚨 ${critical.length} critical lab value${critical.length > 1 ? 's' : ''}`,
      description: `Critical values detected: ${critical.map((r) => `${r.testName} (${r.value} ${r.unit})`).join(', ')}. Please consult your healthcare provider.`,
      detail: critical.map((r) => `- **${r.testName}**: ${r.value} ${r.unit} — *${r.status}* (range: ${r.referenceRangeLow}–${r.referenceRangeHigh} ${r.unit})`).join('\n'),
      chatPrompt: `Explain my critical lab values: ${critical.map((r) => r.testName).join(', ')}`,
      targetPage: 'labs',
      createdAt: new Date().toISOString(),
    });
  }

  if (abnormal.length > 0 && critical.length === 0) {
    insights.push({
      id: 'abnormal-labs-summary',
      category: 'lab_trend',
      severity: 'warning',
      title: `${abnormal.length} lab value${abnormal.length > 1 ? 's' : ''} outside normal range`,
      description: `Markers to watch: ${abnormal.slice(0, 5).map((r) => `${r.testName} (${r.status})`).join(', ')}`,
      chatPrompt: `Explain my abnormal lab results and what I can eat to improve them`,
      targetPage: 'labs',
      createdAt: new Date().toISOString(),
    });
  }

  // Multi-report trend analysis
  if (reports.length >= 2) {
    const previous = reports[1];
    if (previous.results) {
      const improving: string[] = [];
      const worsening: string[] = [];

      for (const current of latest.results) {
        const prev = previous.results.find((r) => r.testName === current.testName);
        if (!prev || typeof current.value !== 'number' || typeof prev.value !== 'number') continue;

        const wasAbnormal = prev.status !== 'normal';
        const isAbnormal = current.status !== 'normal';

        if (wasAbnormal && !isAbnormal) improving.push(current.testName);
        if (!wasAbnormal && isAbnormal) worsening.push(current.testName);
      }

      if (improving.length > 0) {
        insights.push({
          id: 'labs-improving',
          category: 'lab_trend',
          severity: 'info',
          title: `📈 ${improving.length} marker${improving.length > 1 ? 's' : ''} improving!`,
          description: `Great progress: ${improving.join(', ')} ${improving.length > 1 ? 'have' : 'has'} returned to normal range since your last test.`,
          chatPrompt: 'What changes helped improve my lab results?',
          targetPage: 'labs',
          createdAt: new Date().toISOString(),
        });
      }

      if (worsening.length > 0) {
        insights.push({
          id: 'labs-worsening',
          category: 'lab_trend',
          severity: 'warning',
          title: `${worsening.length} marker${worsening.length > 1 ? 's' : ''} trending worse`,
          description: `New concerns: ${worsening.join(', ')} ${worsening.length > 1 ? 'have' : 'has'} moved outside normal range since your last test.`,
          chatPrompt: `Why are my ${worsening.join(', ')} results getting worse?`,
          targetPage: 'labs',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return insights;
}

// ─── Pantry Intelligence ────────────────────────────────────────────────────

function analyzePantryInsights(pantry: PantryItem[], _person: Person): ProactiveInsight[] {
  const insights: ProactiveInsight[] = [];

  // Expiring items
  const expiring = pantry.filter((i) => i.isExpiringSoon);
  const expired = pantry.filter((i) => i.isExpired);

  if (expired.length > 0) {
    insights.push({
      id: 'pantry-expired',
      category: 'pantry_alert',
      severity: 'warning',
      title: `${expired.length} expired item${expired.length > 1 ? 's' : ''} in pantry`,
      description: `Remove or compost: ${expired.map((i) => i.name).slice(0, 5).join(', ')}${expired.length > 5 ? ` +${expired.length - 5} more` : ''}`,
      targetPage: 'my-pantry',
      createdAt: new Date().toISOString(),
    });
  }

  if (expiring.length > 0) {
    insights.push({
      id: 'pantry-expiring',
      category: 'pantry_alert',
      severity: 'suggestion',
      title: `${expiring.length} item${expiring.length > 1 ? 's' : ''} expiring soon`,
      description: `Use these before they go bad: ${expiring.map((i) => i.name).slice(0, 5).join(', ')}`,
      chatPrompt: `What can I cook with ${expiring.slice(0, 3).map((i) => i.name).join(', ')} before they expire?`,
      targetPage: 'my-pantry',
      createdAt: new Date().toISOString(),
    });
  }

  // Low stock
  const lowStock = pantry.filter((i) => i.isLowStock);
  if (lowStock.length >= 3) {
    insights.push({
      id: 'pantry-restock',
      category: 'pantry_alert',
      severity: 'suggestion',
      title: `${lowStock.length} items running low`,
      description: `Time to restock: ${lowStock.map((i) => i.name).slice(0, 5).join(', ')}`,
      chatPrompt: 'Create a grocery list based on my low-stock pantry items',
      targetPage: 'grocery-list',
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

// ─── Goal-Based Tips ────────────────────────────────────────────────────────

function generateGoalTips(person: Person): ProactiveInsight[] {
  const insights: ProactiveInsight[] = [];
  const goals = person.goals.map((g) => g.toLowerCase());

  const goalTips: Array<{
    keywords: string[];
    title: string;
    description: string;
    prompt: string;
  }> = [
    {
      keywords: ['weight', 'lose', 'lean', 'slim'],
      title: '🎯 Weight management tip',
      description: 'Prioritize protein and fiber at every meal to stay full longer. Track portions rather than restricting food groups.',
      prompt: 'Give me a high-protein, high-fiber meal plan for weight management',
    },
    {
      keywords: ['muscle', 'gain', 'bulk', 'strength'],
      title: '💪 Muscle building tip',
      description: 'Aim for 1.6-2.2g of protein per kg of body weight daily, spread across 4-5 meals. Pair with progressive resistance training.',
      prompt: 'Create a high-protein meal plan for muscle building',
    },
    {
      keywords: ['energy', 'fatigue', 'tired'],
      title: '⚡ Energy optimization tip',
      description: 'Focus on complex carbs, iron-rich foods, and B vitamins. Check your vitamin D and B12 levels if fatigue persists.',
      prompt: 'What foods can help me boost my energy levels?',
    },
    {
      keywords: ['gut', 'digestion', 'bloat', 'ibs'],
      title: '🌱 Gut health tip',
      description: 'Fermented foods (yogurt, kimchi, sauerkraut) and prebiotic fiber (garlic, onions, bananas) support a healthy microbiome.',
      prompt: 'Recommend gut-friendly foods for my blood type',
    },
    {
      keywords: ['sleep', 'insomnia', 'rest'],
      title: '😴 Sleep nutrition tip',
      description: 'Magnesium-rich foods (almonds, dark chocolate, avocado) and tryptophan sources (turkey, milk) can improve sleep quality.',
      prompt: 'What foods support better sleep?',
    },
    {
      keywords: ['immune', 'immunity', 'cold', 'sick'],
      title: '🛡️ Immune support tip',
      description: 'Vitamin C, zinc, and vitamin D are your immune trifecta. Citrus fruits, shellfish, and mushrooms are excellent sources.',
      prompt: 'What foods strengthen my immune system?',
    },
    {
      keywords: ['inflam', 'joint', 'pain', 'arthritis', 'crp'],
      title: '🔥 Anti-inflammatory tip',
      description: 'Omega-3 (salmon, walnuts), turmeric with black pepper, and tart cherries are top anti-inflammatory foods backed by research.',
      prompt: 'Give me an anti-inflammatory meal plan with smoothies and juices',
    },
    {
      keywords: ['brain', 'focus', 'memory', 'cognitive', 'nootropic'],
      title: '🧠 Brain nutrition tip',
      description: 'Blueberries, fatty fish, walnuts, and lion\'s mane mushroom support cognitive function. Try a brain-boosting smoothie daily.',
      prompt: 'What supplements and foods boost brain health?',
    },
    {
      keywords: ['hormone', 'thyroid', 'cortisol', 'testosterone', 'estrogen'],
      title: '⚖️ Hormone balance tip',
      description: 'Brazil nuts (selenium for thyroid), ashwagandha (cortisol), and cruciferous vegetables (estrogen metabolism) support hormone balance.',
      prompt: 'What supplements help with hormone balance?',
    },
    {
      keywords: ['heart', 'cardio', 'cholesterol', 'blood pressure'],
      title: '❤️ Heart health tip',
      description: 'CoQ10, omega-3, magnesium, and beet juice nitrates support cardiovascular function. Our heart juice recipe is a great start.',
      prompt: 'Show me heart-healthy recipes and juices',
    },
    {
      keywords: ['detox', 'liver', 'cleanse', 'toxin'],
      title: '🌿 Detox nutrition tip',
      description: 'Support your liver with cruciferous vegetables, beets, dandelion greens, and milk thistle. Try our Liver Detox Green Juice.',
      prompt: 'Give me a liver detox juice recipe for my blood type',
    },
  ];

  for (const tip of goalTips) {
    if (goals.some((g) => tip.keywords.some((k) => g.includes(k)))) {
      insights.push({
        id: `goal-tip-${tip.keywords[0]}`,
        category: 'health_tip',
        severity: 'info',
        title: tip.title,
        description: tip.description,
        chatPrompt: tip.prompt,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return insights;
}

// ─── Cross-Reference Adapter ────────────────────────────────────────────────

function crossRefToInsight(ref: CrossReference): ProactiveInsight {
  return {
    id: `xref-${ref.id}`,
    category: 'cross_reference',
    severity: ref.severity,
    title: ref.title,
    description: ref.description,
    detail: [
      '**Data Sources:**',
      ...ref.sources.map((s) => `- *${s.domain}*: ${s.label} → ${s.value}`),
      '',
      '**Recommended Actions:**',
      ...ref.actions.map((a) => `- ${a}`),
    ].join('\n'),
    chatPrompt: `Tell me more about: ${ref.title}`,
    createdAt: ref.createdAt,
  };
}

// ─── Supplement-Recipe Suggestions ──────────────────────────────────────────

function generateSupplementRecipeSuggestions(
  person: Person,
  reports: LabReport[],
): ProactiveInsight[] {
  const insights: ProactiveInsight[] = [];
  const latest = reports[0];
  if (!latest?.results) return insights;

  // Map abnormal lab markers to recipe search queries
  const LAB_TO_RECIPE: Record<string, string> = {
    iron: 'iron booster',
    ferritin: 'iron',
    'vitamin d': 'immune',
    b12: 'energy',
    cholesterol: 'cholesterol heart',
    ldl: 'cholesterol heart',
    hdl: 'heart omega-3',
    triglyceride: 'heart omega-3',
    crp: 'anti-inflammatory',
    tsh: 'thyroid',
    glucose: 'blood sugar',
    a1c: 'blood sugar',
    hemoglobin: 'iron booster',
    alt: 'liver detox',
    ast: 'liver detox',
    magnesium: 'magnesium sleep',
  };

  const abnormal = latest.results.filter(r => r.status !== 'normal');
  if (abnormal.length === 0) return insights;

  // Find recipes that match abnormal markers AND user's blood type
  for (const result of abnormal.slice(0, 3)) {
    const testKey = result.testName.toLowerCase();
    let searchQuery = '';

    for (const [key, query] of Object.entries(LAB_TO_RECIPE)) {
      if (testKey.includes(key)) {
        searchQuery = `blood type ${person.bloodType || ''} ${query}`;
        break;
      }
    }
    if (!searchQuery) continue;

    const recipes = searchRecipeDatabase(searchQuery);
    if (recipes.length === 0) continue;

    const topRecipe = recipes[0];
    insights.push({
      id: `recipe-for-${testKey}`,
      category: 'health_tip',
      severity: 'suggestion',
      title: `🥤 Recipe for your ${result.testName}: ${topRecipe.name}`,
      description: `Your ${result.testName} is ${result.status}. Try "${topRecipe.name}" (${topRecipe.category}) — ${topRecipe.healthBenefits[0]}.`,
      chatPrompt: `Give me the full recipe for ${topRecipe.name} and explain how it helps my ${result.testName}`,
      targetPage: 'weekly-plan',
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

// ─── Insight Summary (for AI system prompt) ─────────────────────────────────

/** Generate a condensed text summary of current insights for AI context injection */
export function getInsightsSummary(): string {
  const insights = generateProactiveInsights();
  if (insights.length === 0) return '';

  const urgent = insights.filter((i) => i.severity === 'urgent' || i.severity === 'warning');
  if (urgent.length === 0) return '';

  return `\n\n[Proactive Health Insights — ${urgent.length} items need attention]\n${urgent.map((i) => `• ${i.severity.toUpperCase()}: ${i.title} — ${i.description}`).join('\n')}`;
}
