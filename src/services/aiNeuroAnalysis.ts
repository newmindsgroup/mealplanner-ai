import { getAIService } from './aiService';
import type { AssessmentResult, Category } from '../lib/assessment/gradeAssessment';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NeuroProtocol {
  narrative: string;
  dietaryProtocol: {
    category: string;
    priority: 'critical' | 'high' | 'moderate' | 'low';
    foods: string[];
    avoidFoods: string[];
    mealTimingAdvice: string;
  }[];
  supplementStack: {
    name: string;
    dosage: string;
    timing: string;
    rationale: string;
    priority: 'essential' | 'recommended' | 'optional';
    warnings?: string;
  }[];
  lifestyleProtocol: {
    category: string;
    recommendations: string[];
  }[];
  weeklyFocusAreas: string[];
}

export interface ConversationalScoring {
  dopamine: { nature: number; deficiency: number; confidence: number };
  acetylcholine: { nature: number; deficiency: number; confidence: number };
  gaba: { nature: number; deficiency: number; confidence: number };
  serotonin: { nature: number; deficiency: number; confidence: number };
  overallConfidence: number;
  assessmentComplete: boolean;
  nextQuestionFocus: string;
  reasoning: string;
}

export interface DriftAdjustment {
  dopamine_adjustment: number;
  acetylcholine_adjustment: number;
  gaba_adjustment: number;
  serotonin_adjustment: number;
  reasoning: string;
  alerts: string[];
  mealPlanSuggestion?: string;
}

export interface NeuroLabCorrelation {
  correlations: {
    biomarker: string;
    value: string;
    neurotransmitter: Category;
    relationship: string;
    impact: 'supporting' | 'contributing_to_deficiency' | 'neutral';
    actionItem: string;
  }[];
  synthesis: string;
  recoveryProtocol?: string;
}

// ─── Phase 1: AI-Generated Neuro Protocol ────────────────────────────────────

export async function generateNeuroProtocol(
  result: AssessmentResult,
  userContext?: {
    bloodType?: string;
    age?: number;
    allergies?: string[];
    goals?: string[];
    dietaryCodes?: string[];
  }
): Promise<NeuroProtocol> {
  const aiService = getAIService();

  if (!aiService) {
    return getFallbackProtocol(result);
  }

  const contextBlock = userContext
    ? `
User Profile:
- Blood Type: ${userContext.bloodType || 'Unknown'}
- Age: ${userContext.age || 'Unknown'}
- Allergies: ${userContext.allergies?.join(', ') || 'None'}
- Health Goals: ${userContext.goals?.join(', ') || 'General wellness'}
- Dietary Restrictions: ${userContext.dietaryCodes?.join(', ') || 'None'}
`
    : '';

  const prompt = `You are an expert functional medicine practitioner and neuro-nutritionist specializing in neurotransmitter optimization through diet, supplementation, and lifestyle modification.

A patient has completed a comprehensive Braverman Nature Assessment. Analyze their results and generate a highly personalized neuro-nutritional recovery protocol.

ASSESSMENT RESULTS:
- Dominant Nature: ${result.dominantNature} (Score: ${result.natureScores[result.dominantNature]}/15)
- Nature Scores: Dopamine=${result.natureScores.dopamine}, Acetylcholine=${result.natureScores.acetylcholine}, GABA=${result.natureScores.gaba}, Serotonin=${result.natureScores.serotonin}
- Primary Deficiency: ${result.primaryDeficiency || 'None detected'}
- Deficiency Scores: Dopamine=${result.deficiencyScores.dopamine}, Acetylcholine=${result.deficiencyScores.acetylcholine}, GABA=${result.deficiencyScores.gaba}, Serotonin=${result.deficiencyScores.serotonin}
- Deficiency Levels: ${Object.entries(result.deficiencyLevels).map(([k, v]) => `${k}=${v}`).join(', ')}
${contextBlock}

Generate a comprehensive protocol as JSON with this exact structure:
{
  "narrative": "A 2-3 paragraph empathetic, personalized narrative explaining who they are biochemically, what their brain needs, and why they may have been experiencing certain symptoms. Write in second person ('you'). Reference their specific scores.",
  "dietaryProtocol": [
    {
      "category": "Target neurotransmitter (e.g., Dopamine Support)",
      "priority": "critical|high|moderate|low",
      "foods": ["Specific foods with quantities, e.g. 'Wild-caught salmon (3-4 servings/week)'"],
      "avoidFoods": ["Foods that worsen this deficiency"],
      "mealTimingAdvice": "Specific timing guidance for this nutrient category"
    }
  ],
  "supplementStack": [
    {
      "name": "Supplement name (e.g., L-Tyrosine)",
      "dosage": "Specific dosage (e.g., 500mg-1000mg)",
      "timing": "When to take (e.g., Morning on empty stomach)",
      "rationale": "Why this supplement helps this specific deficiency",
      "priority": "essential|recommended|optional",
      "warnings": "Any contraindications or interactions"
    }
  ],
  "lifestyleProtocol": [
    {
      "category": "Category (e.g., Exercise, Sleep, Stress Management)",
      "recommendations": ["Specific actionable recommendations"]
    }
  ],
  "weeklyFocusAreas": ["Top 3-5 priority actions for this week"]
}

CRITICAL RULES:
- Only recommend supplements with strong clinical evidence for the specific deficiency detected
- If blood type is provided, ensure dietary recommendations are compatible
- If allergies are listed, ensure NO recommendations conflict
- Prioritize food-based solutions over supplementation
- Be specific with dosages, timing, and food quantities
- Include at least one warning per supplement about potential interactions

Return ONLY valid JSON.`;

  try {
    const response = await aiService.chat(
      [
        {
          role: 'system',
          content:
            'You are an expert functional medicine AI generating precise, evidence-based neuro-nutritional protocols. Always respond with valid JSON only. Never include markdown code fences.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.4, maxTokens: 4000 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return getFallbackProtocol(result);

    return JSON.parse(jsonMatch[0]) as NeuroProtocol;
  } catch (error) {
    console.error('AI neuro protocol generation error:', error);
    return getFallbackProtocol(result);
  }
}

// ─── Phase 2: Conversational Assessment Scoring ──────────────────────────────

const CONVERSATIONAL_SYSTEM_PROMPT = `You are Dr. Neura, an expert neuro-nutritionist conducting a Braverman Nature Assessment through natural conversation. Your goal is to accurately assess the patient's neurotransmitter profile across four domains: Dopamine, Acetylcholine, GABA, and Serotonin.

ASSESSMENT FRAMEWORK:
Each neurotransmitter has two dimensions:
1. NATURE (dominance/strength): How much this neurotransmitter defines who they are
2. DEFICIENCY: Signs that production of this neurotransmitter is insufficient

SCORING GUIDE (0-15 scale for each):
- Dopamine Nature: Leadership, competitiveness, risk-taking, high energy, decisiveness, power-seeking
- Dopamine Deficiency: Fatigue, lack of motivation, brain fog, sugar/caffeine cravings, procrastination
- Acetylcholine Nature: Creativity, intuition, quick thinking, verbal fluency, social charm, adventurousness
- Acetylcholine Deficiency: Memory lapses, slow processing, difficulty learning, poor concentration, disorganized
- GABA Nature: Stability, reliability, punctuality, organization, nurturing, consistency, loyalty
- GABA Deficiency: Anxiety, insomnia, muscle tension, racing thoughts, restlessness, emotional instability
- Serotonin Nature: Optimism, cooperativeness, team spirit, flexibility, peacemaking, contentment
- Serotonin Deficiency: Depression, insomnia (can't stay asleep), carb cravings, low self-esteem, obsessive thoughts, seasonal mood changes

CONVERSATION RULES:
1. Ask ONE open-ended question at a time
2. Be warm, empathetic, and conversational — NOT clinical
3. Listen for behavioral cues, emotional language, and lifestyle patterns
4. Do NOT tell the patient what you're scoring — this is invisible
5. Start broadly (energy, sleep, stress) then probe specific areas where confidence is low
6. Ask follow-up questions to clarify ambiguous answers
7. Continue until you reach 90% confidence across ALL four categories
8. When confident, naturally conclude: "I now have a thorough understanding of your neurochemical profile..."

After EVERY response, you MUST output a hidden JSON scoring block wrapped in <NEURO_SCORING> tags. This block will be parsed by the system — the patient never sees it.

Example:
<NEURO_SCORING>
{
  "dopamine": {"nature": 8, "deficiency": 12, "confidence": 75},
  "acetylcholine": {"nature": 6, "deficiency": 4, "confidence": 60},
  "gaba": {"nature": 10, "deficiency": 7, "confidence": 55},
  "serotonin": {"nature": 5, "deficiency": 9, "confidence": 45},
  "overallConfidence": 58,
  "assessmentComplete": false,
  "nextQuestionFocus": "serotonin",
  "reasoning": "User shows strong dopamine deficiency signs (fatigue, cravings) but need more data on serotonin sleep patterns"
}
</NEURO_SCORING>

Begin with a warm greeting and your first assessment question about their general energy and motivation patterns.`;

export function getConversationalSystemPrompt(): string {
  return CONVERSATIONAL_SYSTEM_PROMPT;
}

export function parseConversationalScoring(aiResponse: string): {
  visibleMessage: string;
  scoring: ConversationalScoring | null;
} {
  const scoringMatch = aiResponse.match(
    /<NEURO_SCORING>([\s\S]*?)<\/NEURO_SCORING>/
  );

  const visibleMessage = aiResponse
    .replace(/<NEURO_SCORING>[\s\S]*?<\/NEURO_SCORING>/, '')
    .trim();

  if (!scoringMatch) {
    return { visibleMessage, scoring: null };
  }

  try {
    const scoring = JSON.parse(scoringMatch[1].trim()) as ConversationalScoring;
    return { visibleMessage, scoring };
  } catch (e) {
    console.warn('Failed to parse conversational scoring:', e);
    return { visibleMessage, scoring: null };
  }
}

export function convertConversationalToResult(
  scoring: ConversationalScoring
): AssessmentResult {
  const natureScores = {
    dopamine: scoring.dopamine.nature,
    acetylcholine: scoring.acetylcholine.nature,
    gaba: scoring.gaba.nature,
    serotonin: scoring.serotonin.nature,
  };

  const deficiencyScores = {
    dopamine: scoring.dopamine.deficiency,
    acetylcholine: scoring.acetylcholine.deficiency,
    gaba: scoring.gaba.deficiency,
    serotonin: scoring.serotonin.deficiency,
  };

  // Determine dominant nature
  let dominantNature: Category = 'dopamine';
  let maxNature = -1;
  for (const [cat, score] of Object.entries(natureScores)) {
    if (score > maxNature) {
      maxNature = score;
      dominantNature = cat as Category;
    }
  }

  // Determine deficiency levels and primary deficiency
  const deficiencyLevels: Record<Category, 'Minor' | 'Moderate' | 'Major' | 'Severe' | 'None'> = {
    dopamine: 'None',
    acetylcholine: 'None',
    gaba: 'None',
    serotonin: 'None',
  };

  let primaryDeficiency: Category | null = null;
  let maxDef = 0;

  for (const [cat, score] of Object.entries(deficiencyScores)) {
    if (score > maxDef) {
      maxDef = score;
      primaryDeficiency = cat as Category;
    }
    if (score >= 16) deficiencyLevels[cat as Category] = 'Severe';
    else if (score >= 9) deficiencyLevels[cat as Category] = 'Major';
    else if (score >= 6) deficiencyLevels[cat as Category] = 'Moderate';
    else if (score >= 1) deficiencyLevels[cat as Category] = 'Minor';
  }

  if (maxDef === 0) primaryDeficiency = null;

  return {
    natureScores,
    deficiencyScores,
    dominantNature,
    primaryDeficiency,
    deficiencyLevels,
  };
}

// ─── Phase 3: Daily Sentiment Analysis ───────────────────────────────────────

export async function analyzeDailySentiment(
  text: string,
  currentResult: AssessmentResult
): Promise<DriftAdjustment> {
  const aiService = getAIService();

  if (!aiService) {
    return {
      dopamine_adjustment: 0,
      acetylcholine_adjustment: 0,
      gaba_adjustment: 0,
      serotonin_adjustment: 0,
      reasoning: 'AI service not available',
      alerts: [],
    };
  }

  const prompt = `You are an expert neuro-nutritionist monitoring a patient's daily mood and behavioral patterns to detect neurotransmitter fluctuations.

CURRENT BASELINE (from their Braverman Assessment):
- Deficiency Scores: Dopamine=${currentResult.deficiencyScores.dopamine}, Acetylcholine=${currentResult.deficiencyScores.acetylcholine}, GABA=${currentResult.deficiencyScores.gaba}, Serotonin=${currentResult.deficiencyScores.serotonin}
- Primary Deficiency: ${currentResult.primaryDeficiency || 'None'}

TODAY'S CHECK-IN FROM PATIENT:
"${text}"

Analyze the patient's language for behavioral and emotional cues that indicate neurotransmitter fluctuations. Return a JSON object:
{
  "dopamine_adjustment": number (-3 to +3, where negative means worsening),
  "acetylcholine_adjustment": number (-3 to +3),
  "gaba_adjustment": number (-3 to +3),
  "serotonin_adjustment": number (-3 to +3),
  "reasoning": "Brief explanation of what signals you detected",
  "alerts": ["Array of urgent alerts if any deficiency is significantly worsening"],
  "mealPlanSuggestion": "One specific meal or food suggestion to help based on today's state"
}

SIGNAL MAPPING:
- Fatigue, procrastination, brain fog → Dopamine worsening
- Forgetfulness, confusion, scattered → Acetylcholine worsening
- Anxiety, tension, racing thoughts, insomnia → GABA worsening
- Sadness, irritability, cravings, hopelessness → Serotonin worsening
- High energy, motivation, focus → Dopamine improving
- Sharp memory, creativity → Acetylcholine improving
- Calm, relaxed, grounded → GABA improving
- Happy, optimistic, content → Serotonin improving

Return ONLY valid JSON.`;

  try {
    const response = await aiService.chat(
      [
        {
          role: 'system',
          content: 'You are a neurotransmitter monitoring AI. Respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, maxTokens: 500 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        dopamine_adjustment: 0,
        acetylcholine_adjustment: 0,
        gaba_adjustment: 0,
        serotonin_adjustment: 0,
        reasoning: 'Could not parse response',
        alerts: [],
      };
    }

    return JSON.parse(jsonMatch[0]) as DriftAdjustment;
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return {
      dopamine_adjustment: 0,
      acetylcholine_adjustment: 0,
      gaba_adjustment: 0,
      serotonin_adjustment: 0,
      reasoning: 'Analysis failed',
      alerts: [],
    };
  }
}

// ─── Phase 4: Lab-Neuro Correlation ──────────────────────────────────────────

export async function generateLabNeuroCorrelation(
  labResults: { testName: string; value: any; unit: string; referenceRangeLow?: number; referenceRangeHigh?: number }[],
  assessmentResult: AssessmentResult
): Promise<NeuroLabCorrelation> {
  const aiService = getAIService();

  if (!aiService) {
    return {
      correlations: [],
      synthesis: 'AI service not available for correlation analysis.',
    };
  }

  const labText = labResults
    .map((r) => `${r.testName}: ${r.value} ${r.unit} (Ref: ${r.referenceRangeLow ?? '?'}-${r.referenceRangeHigh ?? '?'} ${r.unit})`)
    .join('\n');

  const prompt = `You are a functional medicine specialist correlating blood work biomarkers with neurotransmitter assessment results.

BRAVERMAN ASSESSMENT RESULTS:
- Dominant Nature: ${assessmentResult.dominantNature}
- Primary Deficiency: ${assessmentResult.primaryDeficiency || 'None'}
- Deficiency Levels: ${Object.entries(assessmentResult.deficiencyLevels).map(([k, v]) => `${k}=${v}`).join(', ')}
- Raw Deficiency Scores: Dopamine=${assessmentResult.deficiencyScores.dopamine}, Acetylcholine=${assessmentResult.deficiencyScores.acetylcholine}, GABA=${assessmentResult.deficiencyScores.gaba}, Serotonin=${assessmentResult.deficiencyScores.serotonin}

BLOOD WORK RESULTS:
${labText}

KNOWN BIOMARKER-NEUROTRANSMITTER RELATIONSHIPS:
- Vitamin D (25-OH): Essential cofactor for serotonin synthesis. Low D = low serotonin.
- Vitamin B12: Required for dopamine and serotonin production. Low B12 = brain fog, depression.
- Iron/Ferritin: Critical for dopamine receptor function. Low iron = fatigue, restless legs.
- Folate: Required for neurotransmitter methylation. Low folate = depression, cognitive decline.
- Magnesium: GABA receptor agonist. Low Mg = anxiety, insomnia.
- Zinc: Dopamine transporter modulation. Low zinc = attention issues.
- Homocysteine: High levels = impaired methylation = poor neurotransmitter recycling.
- TSH/Thyroid: Thyroid dysfunction mimics and worsens neurotransmitter deficiencies.
- Cortisol: Chronic elevation depletes serotonin and GABA.
- CRP/Inflammation markers: Systemic inflammation impairs all neurotransmitter synthesis.
- Omega-3 Index: Low omega-3 = impaired cell membrane function affecting all neurotransmitters.

Generate a JSON correlation report:
{
  "correlations": [
    {
      "biomarker": "Test name from blood work",
      "value": "Value and unit",
      "neurotransmitter": "dopamine|acetylcholine|gaba|serotonin",
      "relationship": "Explain how this specific lab value relates to the specific deficiency",
      "impact": "supporting|contributing_to_deficiency|neutral",
      "actionItem": "Specific action to address this correlation"
    }
  ],
  "synthesis": "A 2-3 paragraph narrative tying the blood work to the behavioral assessment. Explain to the patient WHY they feel the way they do, connecting the hard data to their subjective experience. Write in second person.",
  "recoveryProtocol": "A prioritized 4-week protocol addressing the most critical correlations first"
}

CRITICAL: Only include correlations where the lab data directly relates to a neurotransmitter system. Do not force connections that don't exist clinically.

Return ONLY valid JSON.`;

  try {
    const response = await aiService.chat(
      [
        {
          role: 'system',
          content: 'You are a functional medicine AI correlating lab biomarkers with neurotransmitter profiles. Respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, maxTokens: 3000 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        correlations: [],
        synthesis: 'Could not generate correlation analysis.',
      };
    }

    return JSON.parse(jsonMatch[0]) as NeuroLabCorrelation;
  } catch (error) {
    console.error('Lab-neuro correlation error:', error);
    return {
      correlations: [],
      synthesis: 'An error occurred during correlation analysis.',
    };
  }
}

// ─── Fallback Protocol ───────────────────────────────────────────────────────

function getFallbackProtocol(result: AssessmentResult): NeuroProtocol {
  const protocols: Record<Category, NeuroProtocol['dietaryProtocol'][0]> = {
    dopamine: {
      category: 'Dopamine Support',
      priority: 'critical',
      foods: ['Wild-caught salmon (3-4x/week)', 'Free-range eggs (daily)', 'Almonds (1/4 cup daily)', 'Lean turkey breast', 'Avocados', 'Dark chocolate (85%+ cacao, 1oz)'],
      avoidFoods: ['Excessive sugar', 'Processed carbohydrates', 'Alcohol'],
      mealTimingAdvice: 'Front-load protein at breakfast to boost morning dopamine. Eat within 1 hour of waking.',
    },
    acetylcholine: {
      category: 'Acetylcholine Support',
      priority: 'critical',
      foods: ['Egg yolks (2-3 daily)', 'Beef liver (2x/week)', 'Cruciferous vegetables', 'Shrimp', 'Sunflower lecithin (1 tbsp daily)'],
      avoidFoods: ['Anticholinergic medications (discuss with doctor)', 'Excessive alcohol'],
      mealTimingAdvice: 'Include choline-rich foods at breakfast and lunch for optimal cognitive performance.',
    },
    gaba: {
      category: 'GABA Support',
      priority: 'critical',
      foods: ['Fermented foods (kimchi, sauerkraut, yogurt)', 'Complex carbohydrates (sweet potatoes, oats)', 'Bananas', 'Brown rice', 'Spinach', 'Broccoli'],
      avoidFoods: ['Caffeine after noon', 'Artificial sweeteners', 'Excessive stimulants'],
      mealTimingAdvice: 'Eat complex carbohydrates with dinner to promote GABA-mediated relaxation and sleep.',
    },
    serotonin: {
      category: 'Serotonin Support',
      priority: 'critical',
      foods: ['Turkey (tryptophan-rich)', 'Pineapple', 'Nuts and seeds', 'Salmon', 'Tofu', 'Dark leafy greens'],
      avoidFoods: ['Alcohol', 'Excessive caffeine', 'Artificial sweeteners'],
      mealTimingAdvice: 'Pair tryptophan-rich proteins with healthy carbs at dinner to maximize serotonin conversion.',
    },
  };

  const deficientCategories = (Object.entries(result.deficiencyLevels) as [Category, string][])
    .filter(([, level]) => level !== 'None')
    .sort((a, b) => result.deficiencyScores[b[0]] - result.deficiencyScores[a[0]]);

  return {
    narrative: `Your assessment reveals a ${result.dominantNature}-dominant nature, which means your brain naturally excels in ${result.dominantNature === 'dopamine' ? 'drive and energy' : result.dominantNature === 'acetylcholine' ? 'creativity and speed' : result.dominantNature === 'gaba' ? 'stability and calm' : 'mood and social harmony'}. ${result.primaryDeficiency ? `However, you are showing signs of ${result.primaryDeficiency} deficiency at the ${result.deficiencyLevels[result.primaryDeficiency]} level, which may be affecting your daily quality of life.` : 'Your neurotransmitter levels appear well-balanced.'}\n\nThe protocol below is designed to support your brain chemistry through targeted nutrition, evidence-based supplementation, and lifestyle modifications.`,
    dietaryProtocol: deficientCategories.map(([cat]) => protocols[cat]),
    supplementStack: [],
    lifestyleProtocol: [
      {
        category: 'General Wellness',
        recommendations: [
          'Exercise 30 minutes daily (mix of cardio and strength training)',
          'Sleep 7-9 hours in a dark, cool room',
          'Practice 10 minutes of mindfulness daily',
          'Spend 20 minutes in morning sunlight',
        ],
      },
    ],
    weeklyFocusAreas: [
      'Establish consistent meal timing',
      'Prioritize sleep hygiene',
      'Increase consumption of recommended foods',
      'Begin daily mindfulness practice',
    ],
  };
}
