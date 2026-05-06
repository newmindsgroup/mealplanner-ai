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
  const resp = await fetch(`/api/research/search?q=${encodeURIComponent(query)}&maxResults=3`);
  const data = await resp.json();
  return {
    tool: 'PubMed Research',
    query,
    data: data.success ? data.data : [],
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
