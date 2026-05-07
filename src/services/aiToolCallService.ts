/**
 * AI Tool Call Service — Gives the AI real-time access to external data.
 *
 * Instead of hallucinating, the AI can now fetch:
 *  - USDA nutrition data (800K+ foods)
 *  - Supplement info (NIH DSLD + built-in DB)
 *  - PubMed research (35M+ papers)
 *  - Clinical trials (ClinicalTrials.gov)
 *  - Biomarker evaluation (built-in DB)
 *  - Supplement-drug interactions
 *  - FDA safety reports
 *  - Recipes, juicing, and smoothie ideas
 *
 * This service is called by chatService BEFORE sending the prompt to the AI,
 * enriching the system prompt with real, cited data.
 */

import { findBiomarker, evaluateResult } from '../data/biomarkerDatabase';
import { checkInteractions, type InteractionResult } from '../data/interactionDatabase';
import { searchRecipeDatabase, type RecipeResult } from '../data/recipeDatabase';
import { lookupFoodCompatibility, getBloodTypeFoodReport, getSuperfoods, FOOD_COUNT } from '../data/bloodTypeFoodDatabase';
import { getExerciseNutritionProtocol, getExercisesForBloodType, searchExerciseNutrition } from '../data/exerciseNutritionDatabase';
import { getSupplementTiming, getDailySupplementSchedule, checkSupplementConflicts, SUPPLEMENT_COUNT } from '../data/supplementTimingDatabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ToolResult {
  tool: string;
  query: string;
  data: unknown;
  citation?: string;
}

export interface DataEnrichmentResult {
  contextBlock: string;        // Formatted text to inject into the system prompt
  tools: ToolResult[];         // Raw tool results for reference
  citations: string[];         // Source URLs for transparency
}

// ─── Intent Detection for Tool Use ──────────────────────────────────────────

interface ToolIntent {
  tools: string[];
  queries: Record<string, string>;
}

export function detectToolNeeds(message: string): ToolIntent | null {
  const lower = message.toLowerCase();
  const tools: string[] = [];
  const queries: Record<string, string> = {};

  // Nutrition / food lookup
  if (/\b(nutrition|calories|protein|carbs?|fat|vitamin|mineral|nutrient|how much|macros?)\b/.test(lower) &&
      /\b(in|of|for|from|contain)\b/.test(lower)) {
    const foodMatch = lower.match(/(?:in|of|for|from)\s+(?:a\s+)?(.+?)(?:\?|$|,|\.|and\b)/);
    if (foodMatch) {
      tools.push('searchUSDA');
      queries.searchUSDA = foodMatch[1].trim();
    }
  }

  // Supplement questions
  if (/\b(supplement|herb|adaptogen|nootropic|mushroom|ashwagandha|rhodiola|lions?\s*mane|turmeric|curcumin|berberine|magnesium|zinc|omega|probiot|melatonin|vitamin\s*[a-z]\d?|b12|d3|collagen|creatine|protein\s*powder)\b/.test(lower)) {
    const suppMatch = lower.match(/\b(ashwagandha|rhodiola|lions?\s*mane|turmeric|curcumin|berberine|magnesium|zinc|omega[\s-]*3|probiot\w*|melatonin|vitamin\s*[a-z]\d*|b12|d3|collagen|creatine|echinacea|elderberry|ginger|holy\s*basil|bacopa|l[\s-]*theanine|reishi|cordyceps|selenium|folate|iron|fish\s*oil)\b/);
    if (suppMatch) {
      tools.push('searchSupplements');
      queries.searchSupplements = suppMatch[1].trim();
    }
  }

  // Drug / medication interaction check
  if (/\b(interact|safe\s*(?:to\s*)?(?:take|with|mix)|combin|medication|drug|medicine|metformin|warfarin|blood\s*thinner|statin|ssri|antidepressant|thyroid\s*med|insulin|aspirin|ibuprofen)\b/.test(lower)) {
    tools.push('checkInteractions');
    queries.checkInteractions = lower;
  }

  // Lab / biomarker questions
  if (/\b(hemoglobin|hgb|rbc|wbc|platelet|glucose|a1c|cholesterol|ldl|hdl|triglyceride|tsh|vitamin\s*d|b12|iron|ferritin|crp|alt|ast|creatinine|bun|potassium|magnesium|lab|blood\s*(?:test|work|panel))\b/.test(lower)) {
    const markerMatch = lower.match(/\b(hemoglobin|hgb|rbc|wbc|platelet|glucose|a1c|cholesterol|ldl|hdl|triglyceride|tsh|vitamin\s*d|b12|iron|ferritin|crp|alt|ast|creatinine|bun|potassium|magnesium)\b/);
    if (markerMatch) {
      tools.push('evaluateBiomarker');
      queries.evaluateBiomarker = markerMatch[1].trim();
    }
  }

  // Research / evidence questions
  if (/\b(research|stud(?:y|ies)|evidence|clinical\s*trial|proven|effective|does\s+\w+\s+work|scientific|pubmed)\b/.test(lower)) {
    tools.push('searchPubMed');
    // Extract the subject of the research query
    const subjectMatch = lower.match(/(?:research|studies?|evidence|trials?)\s+(?:on|for|about|showing|that)\s+(.+?)(?:\?|$|\.)/);
    queries.searchPubMed = subjectMatch ? subjectMatch[1].trim() : lower.slice(0, 100);
  }

  // Recipe / cooking / juicing / smoothie
  if (/\b(recipe|juice|juicing|smoothie|blend|shake|cook|make|prepare|how\s*to\s*make)\b/.test(lower)) {
    tools.push('searchRecipes');
    queries.searchRecipes = lower;
  }

  // Clinical trials
  if (/\b(clinical\s*trial|recruiting|phase\s*[1-4]|trial\s*for)\b/.test(lower)) {
    tools.push('searchTrials');
    const trialSubject = lower.match(/(?:trial|trials)\s+(?:for|on|about)\s+(.+?)(?:\?|$|\.)/);
    queries.searchTrials = trialSubject ? trialSubject[1].trim() : queries.searchSupplements || lower.slice(0, 80);
  }

  // Blood type food compatibility check
  if (/\b(blood\s*type|can\s+i\s+eat|should\s+i\s+eat|is\s+\w+\s+good\s+for|food.*(beneficial|avoid|neutral)|compatible|d'?adamo)\b/.test(lower) &&
      /\b(food|eat|diet|type\s*[oab])\b/.test(lower)) {
    tools.push('checkFoodCompatibility');
    queries.checkFoodCompatibility = lower;
  }

  // Exercise nutrition timing
  if (/\b(pre[\s-]*workout|post[\s-]*workout|before\s+(workout|exercise|gym|training)|after\s+(workout|exercise|gym|training)|workout\s*(food|meal|nutrition|eat)|exercise\s*(nutrition|fuel|diet))\b/.test(lower)) {
    tools.push('exerciseNutrition');
    queries.exerciseNutrition = lower;
  }

  // Supplement timing
  if (/\b(when\s+(?:to|should\s+i)\s+take|best\s+time.*(?:take|supplement)|timing|take.*(?:morning|evening|bedtime|empty\s+stomach|with\s+food)|daily\s+schedule|supplement\s+schedule)\b/.test(lower)) {
    tools.push('supplementTiming');
    queries.supplementTiming = lower;
  }

  if (tools.length === 0) return null;
  return { tools, queries };
}

// ─── Tool Execution ─────────────────────────────────────────────────────────

export async function executeTools(intent: ToolIntent): Promise<DataEnrichmentResult> {
  const results: ToolResult[] = [];
  const citations: string[] = [];

  // Run all tool calls in parallel
  const promises = intent.tools.map(async (tool) => {
    try {
      switch (tool) {
        case 'searchUSDA':
          return await executeUSDA(intent.queries.searchUSDA);
        case 'searchSupplements':
          return await executeSupplementSearch(intent.queries.searchSupplements);
        case 'checkInteractions':
          return await executeInteractionCheck(intent.queries.checkInteractions);
        case 'evaluateBiomarker':
          return await executeBiomarkerEval(intent.queries.evaluateBiomarker);
        case 'searchPubMed':
          return await executePubMedSearch(intent.queries.searchPubMed);
        case 'searchRecipes':
          return await executeRecipeSearch(intent.queries.searchRecipes);
        case 'searchTrials':
          return await executeTrialSearch(intent.queries.searchTrials);
        case 'checkFoodCompatibility':
          return await executeFoodCompatibilityCheck(intent.queries.checkFoodCompatibility);
        case 'exerciseNutrition':
          return await executeExerciseNutritionLookup(intent.queries.exerciseNutrition);
        case 'supplementTiming':
          return await executeSupplementTimingLookup(intent.queries.supplementTiming);
        default:
          return null;
      }
    } catch (err) {
      console.warn(`[Tool ${tool}] failed:`, err);
      return null;
    }
  });

  const toolResults = await Promise.all(promises);
  for (const r of toolResults) {
    if (r) {
      results.push(r);
      if (r.citation) citations.push(r.citation);
    }
  }

  // Format all results into a context block for the AI
  const contextBlock = formatContextBlock(results);
  return { contextBlock, tools: results, citations };
}

// ─── Individual Tool Executors ──────────────────────────────────────────────

async function executeUSDA(query: string): Promise<ToolResult> {
  const resp = await fetch(`/api/nutrition/search?q=${encodeURIComponent(query)}&pageSize=3`);
  const data = await resp.json();
  return {
    tool: 'USDA FoodData Central',
    query,
    data: data.success ? data.data : [],
    citation: 'Source: USDA FoodData Central (usda.gov)',
  };
}

async function executeSupplementSearch(query: string): Promise<ToolResult> {
  const resp = await fetch(`/api/supplements/search?q=${encodeURIComponent(query)}&type=ingredient`);
  const data = await resp.json();
  return {
    tool: 'Supplement Database',
    query,
    data: data.success ? data.data : [],
    citation: data.source === 'dsld' ? 'Source: NIH DSLD (dsld.od.nih.gov)' : 'Source: Built-in supplement reference',
  };
}

async function executeInteractionCheck(query: string): Promise<ToolResult> {
  // Extract supplement and medication names from the query
  const results = checkInteractions(query);
  return {
    tool: 'Interaction Checker',
    query,
    data: results,
    citation: 'Sources: Clinical literature, FDA safety data',
  };
}

async function executeBiomarkerEval(query: string): Promise<ToolResult> {
  const biomarker = findBiomarker(query);
  if (!biomarker) {
    return { tool: 'Biomarker Database', query, data: { found: false } };
  }

  return {
    tool: 'Biomarker Database',
    query,
    data: {
      found: true,
      name: biomarker.name,
      unit: biomarker.unit,
      category: biomarker.category,
      ranges: biomarker.ranges,
      description: biomarker.description,
      highMeans: biomarker.highMeans,
      lowMeans: biomarker.lowMeans,
      nutritionLinks: biomarker.nutritionLinks,
      foodsIfHigh: biomarker.foodsToImprove.ifHigh,
      foodsIfLow: biomarker.foodsToImprove.ifLow,
      bloodTypeNotes: biomarker.bloodTypeNotes,
    },
  };
}

async function executePubMedSearch(query: string): Promise<ToolResult> {
  // Try backend bridge first (for swarm-orchestrated searches)
  try {
    const resp = await fetch(`/api/research/search?q=${encodeURIComponent(query)}&maxResults=3`);
    if (resp.ok) {
      const data = await resp.json();
      if (data.success && data.data?.length > 0) {
        return {
          tool: 'PubMed Research',
          query,
          data: data.data,
          citation: 'Source: PubMed / NCBI (pubmed.ncbi.nlm.nih.gov)',
        };
      }
    }
  } catch {
    // Backend unavailable — fall through to direct PubMed API
  }

  // Direct PubMed E-utilities API (no backend required)
  try {
    const { searchPubMed, formatCitation } = await import('./pubmedService');
    const result = await searchPubMed(query, 3);
    if (result.articles.length > 0) {
      return {
        tool: 'PubMed Research (Direct)',
        query,
        data: result.articles.map(a => ({
          pmid: a.pmid,
          title: a.title,
          authors: a.authors.join(', '),
          journal: a.journal,
          year: a.year,
          abstract: a.abstract.slice(0, 500),
          url: a.url,
          citation: formatCitation(a),
        })),
        citation: `Source: PubMed / NCBI — ${result.totalResults} total results (pubmed.ncbi.nlm.nih.gov)`,
      };
    }
  } catch (err) {
    console.warn('[PubMed Direct] Failed:', err);
  }

  return {
    tool: 'PubMed Research',
    query,
    data: [],
    citation: 'Source: PubMed / NCBI (pubmed.ncbi.nlm.nih.gov)',
  };
}

async function executeRecipeSearch(query: string): Promise<ToolResult> {
  const recipes = searchRecipeDatabase(query);
  return {
    tool: 'Recipe Database',
    query,
    data: recipes.slice(0, 5),
    citation: 'Source: Built-in recipe & wellness database',
  };
}

async function executeTrialSearch(query: string): Promise<ToolResult> {
  const resp = await fetch(`/api/research/trials?q=${encodeURIComponent(query)}&limit=3`);
  const data = await resp.json();
  return {
    tool: 'ClinicalTrials.gov',
    query,
    data: data.success ? data.data : [],
    citation: 'Source: ClinicalTrials.gov (clinicaltrials.gov)',
  };
}

async function executeFoodCompatibilityCheck(query: string): Promise<ToolResult> {
  // Extract blood type from query
  const btMatch = query.match(/(?:blood\s*)?type\s*([oab]{1,2})/i);
  const bloodType = btMatch ? btMatch[1].toUpperCase() : '';

  if (!bloodType) {
    // No blood type specified — return the general food database info
    return {
      tool: 'Blood Type Food Database',
      query,
      data: { message: `Database contains ${FOOD_COUNT} foods classified by D'Adamo. Ask about a specific blood type for personalized results.` },
      citation: 'Source: D\'Adamo "Eat Right 4 Your Type" (dadamo.com)',
    };
  }

  // Try to find a specific food in the query
  const foods = ['salmon', 'chicken', 'beef', 'lamb', 'tofu', 'wheat', 'corn', 'rice', 'milk', 'yogurt',
    'cheese', 'eggs', 'avocado', 'tomato', 'banana', 'orange', 'coffee', 'peanut', 'walnut', 'spinach',
    'kale', 'broccoli', 'lentils', 'oats', 'quinoa', 'shrimp', 'pork', 'turkey', 'coconut', 'ginger'];

  const matchedFood = foods.find(f => query.includes(f));

  if (matchedFood) {
    const result = lookupFoodCompatibility(matchedFood, bloodType);
    if (result) {
      return {
        tool: 'Blood Type Food Database',
        query: `${matchedFood} for Type ${bloodType}`,
        data: {
          food: result.food.food,
          rating: result.rating,
          category: result.food.category,
          notes: result.food.notes,
          allTypes: { O: result.food.O, A: result.food.A, B: result.food.B, AB: result.food.AB },
        },
        citation: 'Source: D\'Adamo "Eat Right 4 Your Type" (dadamo.com)',
      };
    }
  }

  // Return full blood type food report
  const report = getBloodTypeFoodReport(bloodType);
  const superfoods = getSuperfoods(bloodType);
  return {
    tool: 'Blood Type Food Database',
    query: `Type ${bloodType} food report`,
    data: {
      beneficialCount: report.beneficial.length,
      avoidCount: report.avoid.length,
      topBeneficial: report.beneficial.slice(0, 10).map(f => `${f.food} (${f.category})`),
      topAvoid: report.avoid.slice(0, 10).map(f => `${f.food} (${f.category})`),
      superfoods: superfoods.slice(0, 8).map(f => f.food),
    },
    citation: 'Source: D\'Adamo "Eat Right 4 Your Type" (dadamo.com)',
  };
}

async function executeExerciseNutritionLookup(query: string): Promise<ToolResult> {
  // Detect exercise type from query
  const exercisePatterns: Array<[RegExp, string]> = [
    [/\b(strength|weight|lift|squat|deadlift|bench|powerlifting)\b/i, 'strength'],
    [/\b(hiit|interval|sprint|cardio|metabolic)\b/i, 'hiit'],
    [/\b(yoga|tai\s*chi|pilates|stretch|flexibility)\b/i, 'yoga'],
    [/\b(run|marathon|cycling|bike|endurance|long\s*distance|jog)\b/i, 'endurance'],
    [/\b(swim|pool|aquatic|water\s*aerobic)\b/i, 'swimming'],
  ];

  let protocol = null;
  for (const [pattern, keyword] of exercisePatterns) {
    if (pattern.test(query)) {
      protocol = getExerciseNutritionProtocol(keyword);
      break;
    }
  }

  // Extract blood type for personalized notes
  const btMatch = query.match(/(?:blood\s*)?type\s*([oab]{1,2})/i);
  const bloodType = btMatch ? btMatch[1].toUpperCase() : '';

  if (protocol) {
    const data: Record<string, unknown> = {
      exerciseType: protocol.exerciseType,
      idealBloodTypes: protocol.idealBloodTypes,
      preWorkout: protocol.preWorkout,
      postWorkout: protocol.postWorkout,
      hydration: protocol.hydration,
    };
    if (protocol.duringWorkout) {
      data.duringWorkout = protocol.duringWorkout;
    }
    if (bloodType && protocol.bloodTypeNotes[bloodType]) {
      data.bloodTypeNote = protocol.bloodTypeNotes[bloodType];
    }
    return {
      tool: 'Exercise Nutrition',
      query: protocol.exerciseType,
      data,
      citation: 'Sources: ISSN Position Stands, ACSM Guidelines, D\'Adamo (4yourtype.com)',
    };
  }

  // No specific match — return blood-type ranked exercises
  if (bloodType) {
    const ranked = getExercisesForBloodType(bloodType);
    return {
      tool: 'Exercise Nutrition',
      query: `Best exercises for Type ${bloodType}`,
      data: ranked.map(p => ({
        exerciseType: p.exerciseType,
        isIdeal: p.idealBloodTypes.includes(bloodType),
        note: p.bloodTypeNotes[bloodType],
      })),
      citation: 'Sources: ISSN, D\'Adamo (4yourtype.com)',
    };
  }

  // Generic — return all protocols summary
  const all = searchExerciseNutrition('');
  return {
    tool: 'Exercise Nutrition',
    query: 'workout nutrition',
    data: { message: `${all.length} exercise nutrition protocols available. Specify exercise type for details.` },
    citation: 'Sources: ISSN Position Stands, ACSM',
  };
}

async function executeSupplementTimingLookup(query: string): Promise<ToolResult> {
  // Try to find a specific supplement in the query
  const suppNames = ['vitamin d', 'd3', 'vitamin c', 'b12', 'b-complex', 'magnesium', 'iron', 'zinc',
    'calcium', 'omega', 'fish oil', 'ashwagandha', 'rhodiola', 'lion', 'theanine', 'creatine',
    'collagen', 'probiotic', 'vitamin k', 'vitamin a'];
  const matched = suppNames.find(s => query.includes(s));

  if (matched) {
    const timing = getSupplementTiming(matched);
    if (timing) {
      return {
        tool: 'Supplement Timing',
        query: timing.name,
        data: {
          name: timing.name,
          bestTime: timing.bestTime,
          mealTiming: timing.mealTiming,
          dosageRange: timing.dosageRange,
          takeWith: timing.takeWith,
          avoidWith: timing.avoidWith,
          absorptionNotes: timing.absorptionNotes,
          bloodTypeNotes: timing.bloodTypeNotes,
        },
        citation: 'Sources: NIH ODS, ConsumerLab, Examine.com, D\'Adamo',
      };
    }
  }

  // Return full daily schedule
  if (/schedule|daily|routine|stack/i.test(query)) {
    const schedule = getDailySupplementSchedule();
    return {
      tool: 'Supplement Timing',
      query: 'Daily supplement schedule',
      data: {
        morning: schedule.morning.map(s => `${s.name} (${s.mealTiming})`),
        evening: schedule.evening.map(s => `${s.name} (${s.mealTiming})`),
        bedtime: schedule.bedtime.map(s => `${s.name} (${s.mealTiming})`),
        anytime: schedule.any.map(s => `${s.name} (${s.mealTiming})`),
        totalSupplements: SUPPLEMENT_COUNT,
      },
      citation: 'Sources: NIH ODS, ConsumerLab, Examine.com',
    };
  }

  return {
    tool: 'Supplement Timing',
    query,
    data: { message: `${SUPPLEMENT_COUNT} supplements with timing data available. Ask about a specific supplement.` },
    citation: 'Sources: NIH ODS, ConsumerLab',
  };
}

// ─── Context Formatting ─────────────────────────────────────────────────────

function formatContextBlock(results: ToolResult[]): string {
  if (results.length === 0) return '';

  let block = '\n\n--- REAL-TIME DATA (Use this to inform your response — cite sources) ---\n\n';

  for (const r of results) {
    block += `[${r.tool}] Query: "${r.query}"\n`;
    block += JSON.stringify(r.data, null, 1) + '\n';
    if (r.citation) block += `${r.citation}\n`;
    block += '\n';
  }

  block += '--- END REAL-TIME DATA ---\n';
  block += 'IMPORTANT: Base your answer on the data above. Cite sources. If data is missing, say so honestly.\n';

  return block;
}
