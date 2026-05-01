import Tesseract from 'tesseract.js';
import type { LabReport, LabResult, LabStatus, LabCategory } from '../types/labs';
import { extractLabValuesWithAI } from './labExtractionAI';
import { TEST_NAME_ALIASES, PRIORITY_MARKERS, LAB_PANELS } from '../types/labs';

export interface LabScanProgress {
  stage: 'ocr' | 'ai-extraction' | 'processing' | 'complete';
  progress: number; // 0-100
  message: string;
}

/**
 * Main function to scan a lab report image
 * Uses hybrid OCR + AI approach for accurate extraction
 */
export async function scanLabReport(
  imageDataUrl: string,
  memberId: string,
  memberName: string,
  onProgress?: (progress: LabScanProgress) => void
): Promise<LabReport> {
  // Stage 1: OCR Extraction
  onProgress?.({
    stage: 'ocr',
    progress: 10,
    message: 'Reading lab report with OCR...',
  });

  const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const progress = Math.floor((m.progress || 0) * 40) + 10;
        onProgress?.({
          stage: 'ocr',
          progress,
          message: `Reading text... ${Math.floor((m.progress || 0) * 100)}%`,
        });
      }
    },
  });

  onProgress?.({
    stage: 'ocr',
    progress: 50,
    message: 'Text extraction complete',
  });

  // Stage 2: AI Extraction and Structuring
  onProgress?.({
    stage: 'ai-extraction',
    progress: 55,
    message: 'Analyzing lab values with AI...',
  });

  const extractedData = await extractLabValuesWithAI(text, imageDataUrl);

  onProgress?.({
    stage: 'ai-extraction',
    progress: 85,
    message: 'Lab values identified',
  });

  // Stage 3: Process and normalize results
  onProgress?.({
    stage: 'processing',
    progress: 90,
    message: 'Processing results...',
  });

  const processedResults = processLabResults(extractedData.results);

  // Create lab report
  const labReport: LabReport = {
    id: crypto.randomUUID(),
    memberId,
    memberName,
    testDate: extractedData.testDate || new Date().toISOString().split('T')[0],
    uploadDate: new Date().toISOString(),
    imageUrl: imageDataUrl,
    extractedText: text,
    labName: extractedData.labName,
    orderingPhysician: extractedData.physician,
    results: processedResults,
    aiInsights: extractedData.insights,
    tags: [],
  };

  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: 'Lab report processed successfully',
  });

  return labReport;
}

/**
 * Process and normalize lab results
 */
function processLabResults(results: Partial<LabResult>[]): LabResult[] {
  return results.map(result => {
    const normalizedTestName = normalizeTestName(result.testName || '');
    const category = categorizeTest(normalizedTestName);
    const isPriority = PRIORITY_MARKERS.includes(normalizedTestName);
    const status = determineStatus(
      result.value,
      result.referenceRangeLow,
      result.referenceRangeHigh
    );

    return {
      id: crypto.randomUUID(),
      reportId: '', // Will be set when added to report
      testName: normalizedTestName,
      testCode: result.testCode,
      value: result.value || '',
      unit: result.unit || '',
      referenceRangeLow: result.referenceRangeLow,
      referenceRangeHigh: result.referenceRangeHigh,
      referenceRangeText: result.referenceRangeText,
      status,
      category,
      isPriority,
      notes: result.notes,
      confidence: result.confidence || 80,
    } as LabResult;
  });
}

/**
 * Normalize test name using aliases
 */
function normalizeTestName(testName: string): string {
  const lowerName = testName.toLowerCase().trim();
  
  // Check if there's an alias mapping
  if (TEST_NAME_ALIASES[lowerName]) {
    return TEST_NAME_ALIASES[lowerName];
  }

  // Capitalize first letter of each word
  return testName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Categorize test into appropriate panel
 */
function categorizeTest(testName: string): LabCategory {
  // Check each panel for the test
  for (const panel of LAB_PANELS) {
    if (panel.tests.some(test => 
      test.toLowerCase() === testName.toLowerCase() ||
      testName.toLowerCase().includes(test.toLowerCase())
    )) {
      return panel.category;
    }
  }

  // Default categorization based on keywords
  const lowerName = testName.toLowerCase();
  
  if (lowerName.includes('cholesterol') || lowerName.includes('triglyceride') || lowerName.includes('ldl') || lowerName.includes('hdl')) {
    return 'lipid';
  }
  if (lowerName.includes('glucose') || lowerName.includes('a1c') || lowerName.includes('insulin')) {
    return 'diabetes';
  }
  if (lowerName.includes('tsh') || lowerName.includes('thyroid') || lowerName.includes('t3') || lowerName.includes('t4')) {
    return 'thyroid';
  }
  if (lowerName.includes('alt') || lowerName.includes('ast') || lowerName.includes('bilirubin') || lowerName.includes('alkaline')) {
    return 'liver';
  }
  if (lowerName.includes('creatinine') || lowerName.includes('bun') || lowerName.includes('gfr')) {
    return 'kidney';
  }
  if (lowerName.includes('wbc') || lowerName.includes('rbc') || lowerName.includes('hemoglobin') || lowerName.includes('hematocrit') || lowerName.includes('platelet')) {
    return 'cbc';
  }
  if (lowerName.includes('vitamin') || lowerName.includes('b12') || lowerName.includes('folate')) {
    return 'vitamins';
  }
  if (lowerName.includes('iron') || lowerName.includes('ferritin') || lowerName.includes('tibc')) {
    return 'iron';
  }

  return 'other';
}

/**
 * Determine if a lab value is normal, high, or low
 */
function determineStatus(
  value: number | string | undefined,
  refLow: number | undefined,
  refHigh: number | undefined
): LabStatus {
  if (typeof value !== 'number' || !refLow || !refHigh) {
    return 'normal'; // Default if we can't determine
  }

  // Critical thresholds (20% beyond normal range)
  const criticalLow = refLow * 0.8;
  const criticalHigh = refHigh * 1.2;

  if (value < criticalLow || value > criticalHigh) {
    return 'critical';
  }

  if (value < refLow) {
    return 'low';
  }

  if (value > refHigh) {
    return 'high';
  }

  return 'normal';
}

/**
 * Parse reference range text into low/high values
 * Handles formats like "70-99", "4.0-11.0", "<100", ">60"
 */
export function parseReferenceRange(rangeText: string): {
  low?: number;
  high?: number;
  text: string;
} {
  const cleaned = rangeText.trim();

  // Handle "X-Y" format
  const dashMatch = cleaned.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
  if (dashMatch) {
    return {
      low: parseFloat(dashMatch[1]),
      high: parseFloat(dashMatch[2]),
      text: cleaned,
    };
  }

  // Handle "<X" format (upper limit only)
  const lessThanMatch = cleaned.match(/<\s*(\d+\.?\d*)/);
  if (lessThanMatch) {
    return {
      high: parseFloat(lessThanMatch[1]),
      text: cleaned,
    };
  }

  // Handle ">X" format (lower limit only)
  const greaterThanMatch = cleaned.match(/>\s*(\d+\.?\d*)/);
  if (greaterThanMatch) {
    return {
      low: parseFloat(greaterThanMatch[1]),
      text: cleaned,
    };
  }

  // Return as text if can't parse
  return { text: cleaned };
}

/**
 * Validate and clean extracted lab data
 */
export function validateLabResults(results: LabResult[]): {
  valid: LabResult[];
  invalid: LabResult[];
} {
  const valid: LabResult[] = [];
  const invalid: LabResult[] = [];

  results.forEach(result => {
    // Check if essential fields are present
    if (!result.testName || !result.value) {
      invalid.push(result);
      return;
    }

    // Check if confidence is too low
    if (result.confidence && result.confidence < 50) {
      invalid.push(result);
      return;
    }

    valid.push(result);
  });

  return { valid, invalid };
}

/**
 * Re-scan a specific section of the image for better accuracy
 */
export async function rescanLabSection(
  imageDataUrl: string,
  coordinates?: { x: number; y: number; width: number; height: number }
): Promise<string> {
  // If coordinates provided, could crop image first (future enhancement)
  const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', {
    logger: (m) => console.log('[Rescan]', m),
  });

  return text;
}

