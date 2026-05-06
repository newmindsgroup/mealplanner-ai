/**
 * Smart Autofill Service — Cross-form data population from chat extractions.
 * Reads extracted data from chat sessions and prepopulates forms across the app.
 */
import { useChatSessionStore } from '../store/useChatSessionStore';
import { useStore } from '../store/useStore';
import type { ExtractedDataPayload } from '../types/chat';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AutofillSuggestion {
  id: string;
  field: string;           // Form field name/key
  fieldLabel: string;      // Human-readable label
  value: unknown;          // Suggested value
  source: 'chat' | 'profile' | 'labs' | 'pantry' | 'history';
  sourceLabel: string;     // "From chat: 'My blood type is O+'"
  confidence: number;      // 0-100
  extractionId?: string;   // Links back to the ExtractedDataPayload
}

export interface PageContext {
  page: string;            // Active tab/page name
  formFields?: string[];   // Optional: fields currently visible on the form
}

// ─── Context-Aware Suggestions ──────────────────────────────────────────────

/** Contextual hints the AI can reference based on the active page */
export interface PageContextHint {
  systemPromptAddition: string;
  suggestedPrompts: Array<{ label: string; prompt: string; icon: string }>;
  quickActions: string[];
}

const PAGE_CONTEXT_MAP: Record<string, PageContextHint> = {
  home: {
    systemPromptAddition: 'The user is on the home dashboard. Help with general health, meal planning, or any quick questions.',
    suggestedPrompts: [
      { label: 'Plan My Week', prompt: 'Create a meal plan for this week based on my blood type and what\'s in my pantry', icon: 'Calendar' },
      { label: 'Health Summary', prompt: 'Give me a summary of my health data — labs, diet, and fitness progress', icon: 'Activity' },
      { label: 'Quick Tip', prompt: 'Give me a health tip based on my blood type', icon: 'Lightbulb' },
    ],
    quickActions: ['meal-plan', 'health-summary', 'food-lookup'],
  },
  profile: {
    systemPromptAddition: 'The user is editing their health profile. Help with personal health data like blood type, allergies, dietary restrictions, goals, and body measurements. Offer to auto-fill fields.',
    suggestedPrompts: [
      { label: 'Auto-Fill Profile', prompt: 'I want to update my health profile. Ask me the key questions.', icon: 'User' },
      { label: 'Blood Type Info', prompt: 'What should I know about eating for my blood type?', icon: 'Heart' },
      { label: 'Set Goals', prompt: 'Help me set realistic health and nutrition goals', icon: 'Target' },
    ],
    quickActions: ['profile-update', 'goals'],
  },
  'weekly-plan': {
    systemPromptAddition: 'The user is viewing their weekly meal plan. Help with meal suggestions, swaps, nutrition balance, and scheduling.',
    suggestedPrompts: [
      { label: 'Swap a Meal', prompt: 'Suggest a swap for today\'s lunch that\'s blood-type compatible', icon: 'RefreshCw' },
      { label: 'Add Variety', prompt: 'My meals feel repetitive — suggest new dishes using my pantry items', icon: 'Sparkles' },
      { label: 'Nutrition Check', prompt: 'Am I hitting my macros this week? Analyze my meal plan.', icon: 'BarChart' },
    ],
    quickActions: ['swap-meal', 'nutrition-check', 'meal-prep'],
  },
  'my-pantry': {
    systemPromptAddition: 'The user is managing their pantry. Help with pantry organization, expiration tracking, shopping needs, and using up ingredients.',
    suggestedPrompts: [
      { label: 'What Can I Cook?', prompt: 'What meals can I make with what\'s currently in my pantry?', icon: 'ChefHat' },
      { label: 'Expiring Soon', prompt: 'What items in my pantry are expiring soon and how should I use them?', icon: 'Clock' },
      { label: 'Restock List', prompt: 'Based on my meal plan, what do I need to restock?', icon: 'ShoppingCart' },
    ],
    quickActions: ['recipe-from-pantry', 'restock', 'expiry-check'],
  },
  'food-guide': {
    systemPromptAddition: 'The user is browsing the blood type food guide. Help identify compatible foods, explain why certain foods are beneficial or harmful, and suggest alternatives.',
    suggestedPrompts: [
      { label: 'Check a Food', prompt: 'Is [food name] compatible with my blood type?', icon: 'Search' },
      { label: 'Best Foods', prompt: 'What are the top 10 foods I should eat for my blood type?', icon: 'Star' },
      { label: 'Find Alternatives', prompt: 'What can I eat instead of dairy/gluten/etc?', icon: 'Repeat' },
    ],
    quickActions: ['food-check', 'alternatives'],
  },
  'label-analyzer': {
    systemPromptAddition: 'The user is on the label analyzer page. Help analyze food labels, ingredient lists, and nutrition facts for blood type compatibility and health concerns.',
    suggestedPrompts: [
      { label: 'Scan Label', prompt: 'I want to scan a food label — help me analyze the ingredients', icon: 'ScanLine' },
      { label: 'Ingredient Check', prompt: 'Are these ingredients safe for my blood type: [paste ingredients]', icon: 'List' },
      { label: 'Additive Guide', prompt: 'Which food additives should I avoid for my blood type?', icon: 'AlertTriangle' },
    ],
    quickActions: ['scan-label', 'ingredient-check'],
  },
  labs: {
    systemPromptAddition: 'The user is viewing their lab results. Help interpret blood work, explain biomarker trends, and suggest nutrition-based improvements.',
    suggestedPrompts: [
      { label: 'Upload Labs', prompt: 'I have new lab results to upload — help me extract the data', icon: 'Upload' },
      { label: 'Interpret Results', prompt: 'Explain my latest lab results and what they mean for my health', icon: 'FlaskConical' },
      { label: 'Improve Levels', prompt: 'My [marker] is high/low — what foods can help improve it?', icon: 'TrendingUp' },
    ],
    quickActions: ['upload-labs', 'interpret', 'improve-markers'],
  },
  fitness: {
    systemPromptAddition: 'The user is on the fitness dashboard. Help with workout planning, exercise recommendations, body composition goals, and nutrition-fitness optimization.',
    suggestedPrompts: [
      { label: 'Workout Plan', prompt: 'Create a workout plan aligned with my blood type and fitness goals', icon: 'Dumbbell' },
      { label: 'Recovery Foods', prompt: 'What should I eat after a workout for my blood type?', icon: 'Apple' },
      { label: 'Track Progress', prompt: 'Help me log my body measurements and track progress', icon: 'Activity' },
    ],
    quickActions: ['workout-plan', 'recovery-nutrition', 'body-comp'],
  },
  'neuro-assessment': {
    systemPromptAddition: 'The user is taking a neurotransmitter brain assessment. Help with understanding brain chemistry, neurotransmitter balance, and brain-supporting nutrition.',
    suggestedPrompts: [
      { label: 'Brain Foods', prompt: 'What foods support neurotransmitter balance for my blood type?', icon: 'Brain' },
      { label: 'Assessment Help', prompt: 'Explain what this brain assessment measures and how to interpret results', icon: 'HelpCircle' },
    ],
    quickActions: ['brain-foods', 'assessment-help'],
  },
  settings: {
    systemPromptAddition: 'The user is in settings. Help with API key configuration, notification preferences, and app customization.',
    suggestedPrompts: [
      { label: 'Setup Help', prompt: 'Help me configure my API keys and settings', icon: 'Settings' },
    ],
    quickActions: ['setup-help'],
  },
};

/** Get page-aware context hints for the ChatPanel */
export function getPageContext(page: string): PageContextHint {
  return PAGE_CONTEXT_MAP[page] || PAGE_CONTEXT_MAP.home;
}

// ─── Autofill Suggestions ───────────────────────────────────────────────────

/** Get autofill suggestions for a specific form based on existing extracted data */
export function getAutofillSuggestions(targetForm: string): AutofillSuggestion[] {
  const suggestions: AutofillSuggestion[] = [];
  const store = useStore.getState();
  const sessionStore = useChatSessionStore.getState();

  // Scan confirmed extractions from all sessions
  for (const session of sessionStore.sessions) {
    for (const message of session.messages) {
      if (!message.extractedData) continue;
      for (const extraction of message.extractedData) {
        if (extraction.status !== 'confirmed') continue;
        const sug = mapExtractionToSuggestions(extraction, targetForm);
        suggestions.push(...sug);
      }
    }
  }

  // Also pull from existing store data for smart defaults
  if (targetForm === 'profile' && store.people.length > 0) {
    const person = store.people[0];
    if (person.bloodType) {
      suggestions.push({
        id: `store-bt-${person.id}`,
        field: 'bloodType',
        fieldLabel: 'Blood Type',
        value: person.bloodType,
        source: 'profile',
        sourceLabel: `Current profile: ${person.name}`,
        confidence: 100,
      });
    }
  }

  // Deduplicate by field, keeping highest confidence
  const deduped = new Map<string, AutofillSuggestion>();
  for (const s of suggestions) {
    const existing = deduped.get(s.field);
    if (!existing || s.confidence > existing.confidence) {
      deduped.set(s.field, s);
    }
  }

  return Array.from(deduped.values()).sort((a, b) => b.confidence - a.confidence);
}

/** Map an extraction payload to form field suggestions */
function mapExtractionToSuggestions(
  extraction: ExtractedDataPayload,
  targetForm: string,
): AutofillSuggestion[] {
  const results: AutofillSuggestion[] = [];
  const data = extraction.data as Record<string, unknown>;

  if (targetForm === 'profile') {
    const profileFields: Array<[string, string]> = [
      ['bloodType', 'Blood Type'],
      ['age', 'Age'],
      ['name', 'Name'],
      ['weight', 'Weight'],
      ['height', 'Height'],
      ['bodyFat', 'Body Fat %'],
    ];
    for (const [key, label] of profileFields) {
      if (data[key] != null && data[key] !== '') {
        results.push({
          id: `${extraction.id}-${key}`,
          field: key,
          fieldLabel: label,
          value: data[key],
          source: 'chat',
          sourceLabel: extraction.summary,
          confidence: extraction.confidence,
          extractionId: extraction.id,
        });
      }
    }
    // Array fields
    for (const [key, label] of [['allergies', 'Allergies'], ['dietaryCodes', 'Dietary Restrictions'], ['goals', 'Health Goals']] as const) {
      if (Array.isArray(data[key]) && (data[key] as unknown[]).length > 0) {
        results.push({
          id: `${extraction.id}-${key}`,
          field: key,
          fieldLabel: label,
          value: data[key],
          source: 'chat',
          sourceLabel: extraction.summary,
          confidence: extraction.confidence,
          extractionId: extraction.id,
        });
      }
    }
  }

  if (targetForm === 'pantry' && extraction.type === 'pantry_item') {
    const items = data.items as Array<Record<string, unknown>> | undefined;
    if (items) {
      for (const item of items) {
        results.push({
          id: `${extraction.id}-item-${item.name}`,
          field: 'pantryItem',
          fieldLabel: String(item.name),
          value: item,
          source: 'chat',
          sourceLabel: extraction.summary,
          confidence: extraction.confidence,
          extractionId: extraction.id,
        });
      }
    }
  }

  if (targetForm === 'labs' && (extraction.type === 'lab_result' || extraction.type === 'blood_work')) {
    const labResults = data.results as Array<Record<string, unknown>> | undefined;
    if (labResults) {
      for (const result of labResults) {
        results.push({
          id: `${extraction.id}-lab-${result.testName}`,
          field: 'labResult',
          fieldLabel: String(result.testName),
          value: result,
          source: 'chat',
          sourceLabel: extraction.summary,
          confidence: extraction.confidence,
          extractionId: extraction.id,
        });
      }
    }
  }

  return results;
}

// ─── System Prompt Enrichment ───────────────────────────────────────────────

/** Build a context-enriched system prompt based on active page */
export function buildContextualSystemPrompt(page: string): string {
  const context = getPageContext(page);
  const store = useStore.getState();
  const person = store.people[0];

  let prompt = context.systemPromptAddition;

  if (person) {
    prompt += `\n\nUser profile: ${person.name || 'User'}`;
    if (person.bloodType) prompt += `, blood type ${person.bloodType}`;
    if (person.allergies?.length) prompt += `, allergies: ${person.allergies.join(', ')}`;
    if (person.dietaryCodes?.length) prompt += `, diet: ${person.dietaryCodes.join(', ')}`;
    if (person.goals?.length) prompt += `, goals: ${person.goals.join(', ')}`;
  }

  // Add pantry context for meal-related pages
  if (['home', 'weekly-plan', 'my-pantry', 'food-guide'].includes(page)) {
    const pantryItems = store.pantryItems;
    if (pantryItems.length > 0) {
      const topItems = pantryItems.slice(0, 15).map((i: { name: string }) => i.name).join(', ');
      prompt += `\n\nPantry items (${pantryItems.length} total): ${topItems}`;
    }
  }

  // Add lab context for health pages
  if (['home', 'labs', 'fitness', 'profile'].includes(page)) {
    const reports = store.labReports;
    if (reports.length > 0) {
      const latest = reports[0];
      const abnormal = latest.results?.filter((r: { status: string }) => r.status !== 'normal').map((r: { testName: string; value: number; unit: string; status: string }) => `${r.testName}: ${r.value} ${r.unit} (${r.status})`);
      if (abnormal?.length) {
        prompt += `\n\nRecent abnormal lab values: ${abnormal.slice(0, 5).join(', ')}`;
      }
    }
  }

  return prompt;
}
