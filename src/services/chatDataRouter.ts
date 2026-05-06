/**
 * Chat Data Router — Intelligent extraction & routing engine
 * Detects content type from chat messages + attachments, extracts structured data,
 * and routes it to the correct store slice with user confirmation.
 */
import { getAIService } from './aiService';
import type { ChatAttachment, ExtractedDataPayload, ExtractedDataType, DataDestination } from '../types/chat';

// ─── Intent Detection ───────────────────────────────────────────────────────

export type DetectedIntent = {
  type: ExtractedDataType;
  confidence: number;
  destination: DataDestination;
  destinationLabel: string;
};

/** Keyword-based intent detection (fast, no AI needed) */
export function detectIntent(text: string, attachments?: ChatAttachment[]): DetectedIntent | null {
  const lower = text.toLowerCase();
  const hasImage = attachments?.some((a) => a.type === 'image');
  const hasPdf = attachments?.some((a) => a.type === 'pdf');
  const hasFile = attachments?.some((a) => ['pdf', 'csv', 'text', 'document'].includes(a.type));

  // Lab report detection
  if (
    hasImage && /\b(lab|blood|test|result|panel|cbc|cmp|lipid|thyroid|a1c|cholesterol)\b/.test(lower) ||
    hasPdf && /\b(lab|blood|result|quest|labcorp)\b/.test(lower) ||
    /\b(upload|scan|here('s| is| are) my)\b/.test(lower) && /\b(lab|blood work|blood test|results)\b/.test(lower)
  ) {
    return { type: 'lab_result', confidence: 85, destination: 'labReports', destinationLabel: 'Labs Dashboard' };
  }

  // Food/supplement label detection
  if (
    hasImage && /\b(label|ingredient|supplement|vitamin|nutrition fact|food label)\b/.test(lower) ||
    /\b(scan|analyze|check|read)\b/.test(lower) && /\b(label|ingredient|supplement)\b/.test(lower)
  ) {
    return { type: 'food_label', confidence: 80, destination: 'labelAnalyses', destinationLabel: 'Label Analyzer' };
  }

  // Pantry / grocery receipt
  if (
    hasImage && /\b(receipt|grocery|shopping|pantry|bought|purchased)\b/.test(lower) ||
    /\b(add|put|stock|bought|purchased)\b/.test(lower) && /\b(pantry|fridge|freezer|kitchen)\b/.test(lower)
  ) {
    return { type: 'pantry_item', confidence: 75, destination: 'pantryItems', destinationLabel: 'Pantry' };
  }

  // Recipe detection
  if (
    /\b(recipe|here('s| is) a recipe|cook|how to make)\b/.test(lower) && lower.length > 100 ||
    hasImage && /\b(recipe|dish|meal|food)\b/.test(lower)
  ) {
    return { type: 'recipe', confidence: 70, destination: 'favoriteMeals', destinationLabel: 'Favorites' };
  }

  // Profile / health info
  if (
    /\b(i am|i'm|my (blood type|age|height|weight|allergy|allergies|diet))\b/.test(lower) ||
    /\b(blood type is|i weigh|i('m| am) \d+ (years|lbs|kg|pounds))\b/.test(lower)
  ) {
    return { type: 'profile_info', confidence: 80, destination: 'people', destinationLabel: 'Family Profile' };
  }

  // Allergy / restriction detection
  if (
    /\b(allerg(y|ic|ies)|intoleran(t|ce)|can('t| not) eat|avoid|sensitive to)\b/.test(lower)
  ) {
    return { type: 'allergy', confidence: 85, destination: 'people', destinationLabel: 'Family Profile' };
  }

  // Body measurements
  if (
    /\b(body fat|bmi|waist|body comp|my weight is|i weigh)\b/.test(lower) &&
    /\d/.test(lower)
  ) {
    return { type: 'body_measurement', confidence: 75, destination: 'people', destinationLabel: 'Family Profile' };
  }

  // Fitness goals
  if (
    /\b(fitness goal|want to (lose|gain|build|tone|bulk)|target weight|workout goal)\b/.test(lower)
  ) {
    return { type: 'fitness_goal', confidence: 70, destination: 'fitness', destinationLabel: 'Fitness Dashboard' };
  }

  // URL / article
  if (attachments?.some((a) => a.type === 'url')) {
    return { type: 'article_summary', confidence: 60, destination: 'knowledgeBase', destinationLabel: 'Knowledge Base' };
  }

  // Document upload → knowledge base
  if (hasFile && !hasPdf) {
    return { type: 'doctor_notes', confidence: 55, destination: 'knowledgeBase', destinationLabel: 'Knowledge Base' };
  }

  return null;
}

// ─── AI-Powered Extraction ──────────────────────────────────────────────────

export const EXTRACTION_SYSTEM_PROMPT = `You are a data extraction specialist for a health & nutrition app. 
When given user input (text, OCR text from images, or document content), extract structured data.
ALWAYS respond with valid JSON only. No markdown, no explanations outside the JSON.`;

/** Extract structured data based on detected intent */
export async function extractStructuredData(
  intent: DetectedIntent,
  text: string,
  attachments?: ChatAttachment[],
): Promise<ExtractedDataPayload | null> {
  const aiService = getAIService();
  if (!aiService) return null;

  // Gather all text content (message + attachment extracted text)
  let fullText = text;
  if (attachments) {
    for (const a of attachments) {
      if (a.extractedText) fullText += '\n\n' + a.extractedText;
    }
  }

  try {
    switch (intent.type) {
      case 'profile_info':
      case 'allergy':
      case 'body_measurement':
        return await extractProfileData(aiService, fullText, intent);

      case 'lab_result':
      case 'blood_work':
        return await extractLabData(aiService, fullText, intent);

      case 'pantry_item':
      case 'grocery_receipt':
        return await extractPantryData(aiService, fullText, intent);

      case 'food_label':
      case 'supplement_label':
        return await extractLabelData(aiService, fullText, intent);

      case 'recipe':
        return await extractRecipeData(aiService, fullText, intent);

      case 'fitness_goal':
        return await extractFitnessData(aiService, fullText, intent);

      default:
        return null;
    }
  } catch (error) {
    console.error('Data extraction failed:', error);
    return null;
  }
}

// ─── Extraction Functions ───────────────────────────────────────────────────

async function extractProfileData(ai: any, text: string, intent: DetectedIntent): Promise<ExtractedDataPayload> {
  const response = await ai.generateJSON(
    `Extract personal health profile data from this text:\n"${text.substring(0, 2000)}"\n\nExtract any of: name, bloodType (O+/O-/A+/A-/B+/B-/AB+/AB-), age, allergies (array), dietaryCodes (array), goals (array), weight (number in lbs), height (number in inches), bodyFat (number as %).`,
    { name: 'string?', bloodType: 'string?', age: 'number?', allergies: 'string[]?', dietaryCodes: 'string[]?', goals: 'string[]?', weight: 'number?', height: 'number?', bodyFat: 'number?' },
    { temperature: 0.1 }
  );

  const fields = Object.entries(response).filter(([, v]) => v != null && v !== '' && !(Array.isArray(v) && v.length === 0));
  const summary = `Found ${fields.length} profile field${fields.length !== 1 ? 's' : ''}: ${fields.map(([k]) => k).join(', ')}`;

  return buildPayload(intent, response, summary);
}

async function extractLabData(ai: any, text: string, intent: DetectedIntent): Promise<ExtractedDataPayload> {
  const response = await ai.generateJSON(
    `Extract lab test results from this text:\n"${text.substring(0, 4000)}"\n\nReturn: { testDate (YYYY-MM-DD), labName, results: [{ testName, value (number), unit, referenceRangeLow (number), referenceRangeHigh (number), status ("normal"|"low"|"high") }] }`,
    { testDate: 'string?', labName: 'string?', results: 'array' },
    { temperature: 0.1 }
  );

  const count = Array.isArray(response.results) ? response.results.length : 0;
  const lab = response.labName ? ` from ${response.labName}` : '';
  const summary = `Found ${count} lab result${count !== 1 ? 's' : ''}${lab}`;

  return buildPayload(intent, response, summary);
}

async function extractPantryData(ai: any, text: string, intent: DetectedIntent): Promise<ExtractedDataPayload> {
  const response = await ai.generateJSON(
    `Extract grocery/pantry items from this text:\n"${text.substring(0, 3000)}"\n\nReturn: { items: [{ name, category ("proteins"|"vegetables"|"fruits"|"grains"|"dairy"|"oils"|"nuts-seeds"|"beverages"|"spices"|"sweeteners"), quantity (number), unit (string), estimatedExpiration (string, days from now) }] }`,
    { items: 'array' },
    { temperature: 0.2 }
  );

  const count = Array.isArray(response.items) ? response.items.length : 0;
  const summary = `Found ${count} pantry item${count !== 1 ? 's' : ''} to add`;

  return buildPayload(intent, response, summary);
}

async function extractLabelData(ai: any, text: string, intent: DetectedIntent): Promise<ExtractedDataPayload> {
  const response = await ai.generateJSON(
    `Extract food/supplement label data from this text:\n"${text.substring(0, 3000)}"\n\nReturn: { productName, ingredients (string[]), additives (string[]), allergens (string[]), servingSize, calories (number), bloodTypeConflicts (string[]) }`,
    { productName: 'string', ingredients: 'string[]', additives: 'string[]', allergens: 'string[]' },
    { temperature: 0.2 }
  );

  const name = response.productName || 'Unknown product';
  const conflicts = Array.isArray(response.bloodTypeConflicts) ? response.bloodTypeConflicts.length : 0;
  const summary = `Analyzed label for "${name}" — ${conflicts} potential conflict${conflicts !== 1 ? 's' : ''}`;

  return buildPayload(intent, response, summary);
}

async function extractRecipeData(ai: any, text: string, intent: DetectedIntent): Promise<ExtractedDataPayload> {
  const response = await ai.generateJSON(
    `Extract recipe data from this text:\n"${text.substring(0, 3000)}"\n\nReturn: { name, description, ingredients (string[]), instructions (string[]), prepTime (minutes, number), cookTime (minutes, number), tags (string[]) }`,
    { name: 'string', ingredients: 'string[]', instructions: 'string[]' },
    { temperature: 0.3 }
  );

  const summary = `Extracted recipe: "${response.name || 'Untitled'}"`;
  return buildPayload(intent, response, summary);
}

async function extractFitnessData(ai: any, text: string, intent: DetectedIntent): Promise<ExtractedDataPayload> {
  const response = await ai.generateJSON(
    `Extract fitness goals from this text:\n"${text.substring(0, 2000)}"\n\nReturn: { goals (string[]), targetWeight (number?), currentWeight (number?), fitnessLevel ("beginner"|"intermediate"|"advanced"?), preferredExercises (string[]?) }`,
    { goals: 'string[]' },
    { temperature: 0.3 }
  );

  const count = Array.isArray(response.goals) ? response.goals.length : 0;
  const summary = `Found ${count} fitness goal${count !== 1 ? 's' : ''}`;
  return buildPayload(intent, response, summary);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildPayload(intent: DetectedIntent, data: Record<string, unknown>, summary: string): ExtractedDataPayload {
  return {
    id: crypto.randomUUID(),
    type: intent.type,
    destination: intent.destination,
    destinationLabel: intent.destinationLabel,
    data,
    confidence: intent.confidence,
    summary,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

// ─── Store Writer — Executes confirmed extractions ──────────────────────────

export async function commitExtraction(
  payload: ExtractedDataPayload,
  store: any, // Zustand store instance
): Promise<boolean> {
  try {
    switch (payload.destination) {
      case 'people': {
        const people = store.getState().people;
        if (people.length > 0) {
          const person = people[0]; // Update primary profile
          const updates: Record<string, any> = {};
          const d = payload.data as any;
          if (d.bloodType) updates.bloodType = d.bloodType;
          if (d.age) updates.age = d.age;
          if (d.allergies?.length) updates.allergies = [...new Set([...person.allergies, ...d.allergies])];
          if (d.dietaryCodes?.length) updates.dietaryCodes = [...new Set([...person.dietaryCodes, ...d.dietaryCodes])];
          if (d.goals?.length) updates.goals = [...new Set([...person.goals, ...d.goals])];
          if (d.weight || d.height || d.bodyFat) {
            updates.bodyComposition = {
              ...person.bodyComposition,
              ...(d.weight && { weight: d.weight }),
              ...(d.height && { height: d.height }),
              ...(d.bodyFat && { bodyFat: d.bodyFat }),
            };
          }
          if (d.name && !person.name) updates.name = d.name;
          store.getState().updatePerson(person.id, updates);
        }
        return true;
      }

      case 'labReports': {
        const d = payload.data as any;
        const people = store.getState().people;
        const member = people[0];
        if (!member) return false;

        const results = (d.results || []).map((r: any, i: number) => ({
          id: crypto.randomUUID(),
          reportId: '', // Will be set below
          testName: r.testName || `Test ${i + 1}`,
          value: r.value,
          unit: r.unit || '',
          referenceRangeLow: r.referenceRangeLow,
          referenceRangeHigh: r.referenceRangeHigh,
          referenceRangeText: r.referenceRangeText,
          status: r.status || 'normal',
          category: 'other' as const,
          isPriority: false,
          confidence: payload.confidence,
        }));

        const reportId = crypto.randomUUID();
        results.forEach((r: any) => { r.reportId = reportId; });

        store.getState().addLabReport({
          id: reportId,
          memberId: member.id,
          memberName: member.name,
          testDate: d.testDate || new Date().toISOString().split('T')[0],
          uploadDate: new Date().toISOString(),
          imageUrl: '',
          extractedText: '',
          labName: d.labName,
          results,
          aiInsights: d.insights,
        });
        return true;
      }

      case 'pantryItems': {
        const d = payload.data as any;
        const items = d.items || [];
        for (const item of items) {
          store.getState().addPantryItem({
            id: crypto.randomUUID(),
            name: item.name,
            category: item.category || 'other',
            quantity: item.quantity || 1,
            unit: item.unit || 'item',
            location: 'pantry',
            lowStockThreshold: 1,
            isLowStock: false,
            expirationDate: item.estimatedExpiration || undefined,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageHistory: [],
          });
        }
        return true;
      }

      case 'labelAnalyses': {
        const d = payload.data as any;
        store.getState().addLabelAnalysis({
          id: crypto.randomUUID(),
          imageUrl: '',
          extractedText: (d.ingredients || []).join(', '),
          bloodTypeConflicts: d.bloodTypeConflicts || [],
          additives: d.additives || [],
          safetyFlags: d.allergens?.length ? [{ level: 'warning' as const, message: `Contains allergens: ${d.allergens.join(', ')}` }] : [{ level: 'safe' as const, message: 'No issues detected' }],
          recommendations: [],
          createdAt: new Date().toISOString(),
        });
        return true;
      }

      case 'favoriteMeals': {
        const d = payload.data as any;
        store.getState().toggleFavorite({
          id: crypto.randomUUID(),
          name: d.name || 'Imported Recipe',
          type: 'dinner' as const,
          description: d.description || '',
          ingredients: d.ingredients || [],
          instructions: d.instructions || [],
          prepTime: d.prepTime || 15,
          cookTime: d.cookTime || 30,
          rationale: 'Imported from chat',
          bloodTypeCompatible: [],
          tags: d.tags || ['imported'],
          isFavorite: true,
        });
        return true;
      }

      case 'knowledgeBase': {
        const d = payload.data as any;
        store.getState().addKnowledgeFile({
          id: crypto.randomUUID(),
          name: d.title || d.productName || 'Chat Import',
          type: 'notes' as const,
          content: typeof d === 'string' ? d : JSON.stringify(d, null, 2),
          uploadedAt: new Date().toISOString(),
        });
        return true;
      }

      default:
        console.warn('Unknown destination:', payload.destination);
        return false;
    }
  } catch (error) {
    console.error('Failed to commit extraction:', error);
    return false;
  }
}
