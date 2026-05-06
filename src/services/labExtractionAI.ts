import { getAIService } from './aiService';
import type { LabResult } from '../types/labs';
import { parseReferenceRange } from './labScanning';

export interface ExtractedLabData {
  testDate?: string;
  labName?: string;
  physician?: string;
  results: Partial<LabResult>[];
  insights?: string;
}

/**
 * Use AI to extract and structure lab values from OCR text
 * Handles various lab report formats (Quest, LabCorp, hospital labs)
 */
export async function extractLabValuesWithAI(
  ocrText: string,
  imageDataUrl?: string
): Promise<ExtractedLabData> {
  const aiService = getAIService();

  if (!aiService) {
    // Fallback to basic extraction if no AI available
    return fallbackExtraction(ocrText);
  }

  try {
    const prompt = `You are a medical lab report parser. Extract lab test values from this lab report text.

OCR Text:
${ocrText.substring(0, 4000)}

Extract the following information in JSON format:
{
  "testDate": "YYYY-MM-DD format if found",
  "labName": "Name of lab facility (Quest, LabCorp, etc.)",
  "physician": "Ordering physician name if found",
  "results": [
    {
      "testName": "standardized test name",
      "testCode": "lab code if present (e.g., GLU, CHOL)",
      "value": numeric value or text result,
      "unit": "measurement unit (mg/dL, mmol/L, etc.)",
      "referenceRangeLow": numeric lower limit,
      "referenceRangeHigh": numeric upper limit,
      "referenceRangeText": "original text of reference range",
      "confidence": 0-100 confidence score
    }
  ]
}

Guidelines:
- Standardize test names (e.g., "Glucose, Serum" → "Glucose")
- Extract numeric values only for the value field
- Parse reference ranges into low/high numbers when possible
- Common test codes: GLU (glucose), CHOL (cholesterol), HDL, LDL, TRIG (triglycerides), TSH, etc.
- If value has flags like "H" (high) or "L" (low), note in range but extract pure numeric value
- Confidence should be 90+ for clear values, 70-89 for somewhat unclear, <70 for very uncertain

Return ONLY valid JSON, no other text.`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are an expert at parsing medical lab reports. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.1, // Low temperature for consistency
      maxTokens: 3000,
    });

    // Parse AI response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('AI response did not contain valid JSON, using fallback');
      return fallbackExtraction(ocrText);
    }

    const extracted = JSON.parse(jsonMatch[0]) as ExtractedLabData;

    // Process and validate results
    extracted.results = extracted.results.map(result => {
      // Parse reference range if provided as text but not as numbers
      if (result.referenceRangeText && !result.referenceRangeLow && !result.referenceRangeHigh) {
        const parsed = parseReferenceRange(result.referenceRangeText);
        result.referenceRangeLow = parsed.low;
        result.referenceRangeHigh = parsed.high;
      }

      return result;
    });

    // Generate AI insights about the overall results
    const insights = await generateLabInsights(extracted.results, aiService);
    extracted.insights = insights;

    return extracted;

  } catch (error) {
    console.error('AI extraction error:', error);
    return fallbackExtraction(ocrText);
  }
}

/**
 * Generate AI-powered insights about lab results
 */
async function generateLabInsights(
  results: Partial<LabResult>[],
  aiService: any
): Promise<string> {
  try {
    // Filter out results with low confidence
    const reliableResults = results.filter(r => !r.confidence || r.confidence >= 70);

    if (reliableResults.length === 0) {
      return 'Unable to generate insights due to low confidence in extracted values.';
    }

    const resultsText = reliableResults.map(r => 
      `${r.testName}: ${r.value} ${r.unit} (Ref: ${r.referenceRangeLow}-${r.referenceRangeHigh} ${r.unit})`
    ).join('\n');

    const insightPrompt = `Analyze these lab results and provide a brief 2-3 sentence summary of key findings:

${resultsText}

Focus on:
- Any values outside reference ranges
- Notable patterns or concerns
- Positive aspects if all values are normal

Keep it educational and factual. Do not provide medical advice.`;

    const insights = await aiService.chat([
      {
        role: 'system',
        content: 'You are a medical educator providing factual, educational insights about lab results. Be concise and clear.',
      },
      {
        role: 'user',
        content: insightPrompt,
      },
    ], {
      temperature: 0.5,
      maxTokens: 300,
    });

    return insights.trim();

  } catch (error) {
    console.error('Error generating insights:', error);
    return 'Lab results extracted successfully. Review individual values for details.';
  }
}

/**
 * Fallback extraction using pattern matching
 * Used when AI is not available or fails
 */
function fallbackExtraction(ocrText: string): ExtractedLabData {
  const results: Partial<LabResult>[] = [];
  const lines = ocrText.split('\n');

  // Common test patterns
  const testPatterns = [
    // Format: "Test Name    Value  Unit  Reference Range"
    /^([A-Za-z][A-Za-z\s,.-]+?)\s+(\d+\.?\d*)\s+([a-zA-Z/%]+)\s+([\d.-]+)\s*-\s*([\d.-]+)/,
    // Format: "Test Name: Value Unit (Range)"
    /([A-Za-z][A-Za-z\s,.-]+?):\s*(\d+\.?\d*)\s*([a-zA-Z/%]+)\s*\(?([\d.-]+)\s*-\s*([\d.-]+)\)?/,
  ];

  lines.forEach(line => {
    for (const pattern of testPatterns) {
      const match = line.match(pattern);
      if (match) {
        results.push({
          testName: match[1].trim(),
          value: parseFloat(match[2]),
          unit: match[3].trim(),
          referenceRangeLow: parseFloat(match[4]),
          referenceRangeHigh: parseFloat(match[5]),
          referenceRangeText: `${match[4]}-${match[5]}`,
          confidence: 60, // Lower confidence for pattern matching
        });
        break;
      }
    }
  });

  // Try to extract date
  const datePattern = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/;
  const dateMatch = ocrText.match(datePattern);
  let testDate: string | undefined;
  
  if (dateMatch) {
    try {
      const date = new Date(dateMatch[1]);
      if (!isNaN(date.getTime())) {
        testDate = date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Invalid date, ignore
    }
  }

  // Try to detect lab name
  let labName: string | undefined;
  const labNames = ['Quest', 'LabCorp', 'Mayo', 'Cleveland', 'Johns Hopkins'];
  for (const name of labNames) {
    if (ocrText.toLowerCase().includes(name.toLowerCase())) {
      labName = name;
      break;
    }
  }

  return {
    testDate,
    labName,
    results,
  };
}

/**
 * Validate specific lab value format
 */
export function validateLabValue(value: any, testName: string): {
  valid: boolean;
  normalized?: number;
  error?: string;
} {
  // Handle numeric values
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      return { valid: false, error: 'Invalid numeric value' };
    }
    return { valid: true, normalized: value };
  }

  // Handle string values that should be numeric
  if (typeof value === 'string') {
    // Remove common annotations
    const cleaned = value.replace(/[HL*<>]/g, '').trim();
    const numeric = parseFloat(cleaned);
    
    if (!isNaN(numeric) && isFinite(numeric)) {
      return { valid: true, normalized: numeric };
    }

    // Some tests have text results (e.g., "Negative", "Positive")
    const textResults = ['negative', 'positive', 'normal', 'abnormal', 'detected', 'not detected'];
    if (textResults.includes(cleaned.toLowerCase())) {
      return { valid: true }; // Valid text result
    }

    return { valid: false, error: 'Could not parse value' };
  }

  return { valid: false, error: 'Unsupported value type' };
}

/**
 * Enhance extracted data with additional AI analysis
 */
export async function enhanceLabData(
  report: ExtractedLabData,
  patientInfo?: { age?: number; sex?: 'male' | 'female'; bloodType?: string },
  neuroProfile?: { primaryDeficiency: string | null; deficiencyLevels: Record<string, string> }
): Promise<string> {
  const aiService = getAIService();
  if (!aiService) return '';

  try {
    const context = patientInfo 
      ? `Patient: ${patientInfo.sex || 'unknown'}, Age: ${patientInfo.age || 'unknown'}, Blood Type: ${patientInfo.bloodType || 'unknown'}`
      : 'Patient demographics unknown';

    const neuroContext = neuroProfile?.primaryDeficiency
      ? `\nNEURO-NUTRITIONAL CONTEXT: This patient has completed a Braverman Nature Assessment and shows a ${neuroProfile.primaryDeficiency} deficiency (${neuroProfile.deficiencyLevels[neuroProfile.primaryDeficiency]}). Deficiency levels: ${Object.entries(neuroProfile.deficiencyLevels).map(([k, v]) => `${k}=${v}`).join(', ')}. When analyzing their blood work, specifically look for biomarkers that may be CONTRIBUTING to or EXPLAINING this neurotransmitter deficiency (e.g., low Vitamin D/B12 → Serotonin deficiency, low Iron/Ferritin → Dopamine deficiency, low Magnesium → GABA deficiency). Highlight these correlations prominently.`
      : '';

    const resultsText = report.results.map(r => 
      `${r.testName}: ${r.value} ${r.unit}`
    ).join(', ');

    const prompt = `${context}${neuroContext}
Lab Results: ${resultsText}

Provide 2-3 personalized insights considering the patient's demographics, blood type diet principles, and neurotransmitter profile where relevant. Focus on actionable lifestyle factors. If neuro context is provided, explicitly connect lab findings to their brain chemistry.`;

    const enhancement = await aiService.chat([
      {
        role: 'system',
        content: 'You are a functional medicine health educator specializing in personalized nutrition, neurotransmitter optimization, and wellness based on lab results and blood type.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.6,
      maxTokens: 600,
    });

    return enhancement.trim();

  } catch (error) {
    console.error('Error enhancing lab data:', error);
    return '';
  }
}

