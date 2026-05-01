// Lab Analysis Types - Comprehensive blood work tracking system

export type LabCategory = 
  | 'cbc' // Complete Blood Count
  | 'cmp' // Comprehensive Metabolic Panel
  | 'lipid' // Lipid Panel
  | 'thyroid' // Thyroid Function
  | 'diabetes' // Diabetes Markers
  | 'liver' // Liver Function
  | 'kidney' // Kidney Function
  | 'vitamins' // Vitamin Levels
  | 'iron' // Iron Studies
  | 'hormones' // Hormones
  | 'inflammation' // Inflammation Markers
  | 'other'; // Other Tests

export type LabStatus = 'normal' | 'low' | 'high' | 'critical';

export type AlertSeverity = 'critical' | 'high' | 'moderate' | 'low' | 'info';

export type TrendDirection = 'improving' | 'stable' | 'worsening' | 'fluctuating';

// Individual lab test result
export interface LabResult {
  id: string;
  reportId: string; // Reference to parent report
  testName: string; // e.g., "Total Cholesterol"
  testCode?: string; // e.g., "CHOL"
  value: number | string; // Numeric or text result
  unit: string; // e.g., "mg/dL", "mmol/L"
  referenceRangeLow?: number;
  referenceRangeHigh?: number;
  referenceRangeText?: string; // For non-numeric ranges
  status: LabStatus;
  category: LabCategory;
  isPriority: boolean; // Key health marker flag
  notes?: string;
  confidence?: number; // AI extraction confidence (0-100)
}

// Grouped lab panel (e.g., Lipid Panel)
export interface LabPanel {
  id: string;
  name: string;
  category: LabCategory;
  description: string;
  tests: string[]; // Array of test names that belong to this panel
  displayOrder: number;
}

// Complete lab report from a single visit/test
export interface LabReport {
  id: string;
  memberId: string; // Household member ID
  memberName: string; // Cached for display
  testDate: string; // Date labs were taken
  uploadDate: string; // Date uploaded to system
  imageUrl: string; // Base64 or future blob URL
  extractedText: string; // Raw OCR text
  labName?: string; // Lab facility (Quest, LabCorp, etc.)
  orderingPhysician?: string;
  results: LabResult[]; // All individual test results
  aiInsights?: string; // AI-generated analysis of this report
  notes?: string; // User notes
  tags?: string[]; // Custom tags for organization
}

// Trend analysis data for a specific test over time
export interface LabTrend {
  testName: string;
  memberId: string;
  values: Array<{
    date: string;
    value: number;
    reportId: string;
    status: LabStatus;
  }>;
  direction: TrendDirection;
  percentChange?: number; // % change from first to last
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
  standardDeviation?: number;
  withinNormalRange: boolean;
}

// Alert for abnormal lab values
export interface LabAlert {
  id: string;
  reportId: string;
  resultId: string;
  memberId: string;
  memberName: string;
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  severity: AlertSeverity;
  status: LabStatus;
  message: string;
  recommendation?: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

// Comprehensive educational content for each lab test
export interface LabEducationContent {
  testName: string;
  category: LabCategory;
  description: string;
  purpose: string; // What this test measures
  normalRange: {
    male?: string;
    female?: string;
    general?: string;
  };
  highMeans: {
    description: string;
    causes: string[];
    symptoms?: string[];
  };
  lowMeans: {
    description: string;
    causes: string[];
    symptoms?: string[];
  };
  lifestyleFactors: string[]; // Factors that affect this value
  relatedTests: string[]; // Related lab tests
  bloodTypeConcerns?: string; // Blood type diet connections if applicable
  criticalValues?: {
    high: number;
    low: number;
    unit: string;
  };
}

// Comparison data for multiple members
export interface LabComparison {
  testName: string;
  members: Array<{
    memberId: string;
    memberName: string;
    latestValue: number;
    latestDate: string;
    status: LabStatus;
    trend: TrendDirection;
  }>;
}

// Analytics summary for dashboard
export interface LabAnalyticsSummary {
  memberId: string;
  memberName: string;
  totalReports: number;
  latestReportDate?: string;
  activeAlerts: number;
  criticalAlerts: number;
  keyMarkers: Array<{
    testName: string;
    value: number | string;
    unit: string;
    status: LabStatus;
    trend?: TrendDirection;
    date: string;
  }>;
  improvementCount: number; // Tests showing improvement
  concernCount: number; // Tests showing concern
}

// Correlation analysis between tests
export interface LabCorrelation {
  test1: string;
  test2: string;
  correlationCoefficient: number; // -1 to 1
  significance: 'strong' | 'moderate' | 'weak';
  description: string;
}

// AI-powered insight
export interface LabInsight {
  id: string;
  memberId: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'correlation' | 'recommendation';
  severity: AlertSeverity;
  title: string;
  description: string;
  affectedTests: string[];
  generatedAt: string;
  dismissed: boolean;
}

// Export/share data structure
export interface LabExport {
  exportType: 'pdf' | 'csv' | 'json';
  memberId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  includeImages: boolean;
  includeCharts: boolean;
  includeEducation: boolean;
  includeInsights: boolean;
}

// Standard lab panels configuration
export const LAB_PANELS: LabPanel[] = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    category: 'cbc',
    description: 'Measures different components of blood',
    tests: [
      'WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets',
      'MCV', 'MCH', 'MCHC', 'RDW', 'Neutrophils', 'Lymphocytes',
      'Monocytes', 'Eosinophils', 'Basophils'
    ],
    displayOrder: 1,
  },
  {
    id: 'cmp',
    name: 'Comprehensive Metabolic Panel (CMP)',
    category: 'cmp',
    description: 'Measures blood sugar, electrolytes, and kidney function',
    tests: [
      'Glucose', 'BUN', 'Creatinine', 'Sodium', 'Potassium',
      'Chloride', 'CO2', 'Calcium', 'Protein Total', 'Albumin',
      'Bilirubin Total', 'Alkaline Phosphatase', 'AST', 'ALT'
    ],
    displayOrder: 2,
  },
  {
    id: 'lipid',
    name: 'Lipid Panel',
    category: 'lipid',
    description: 'Measures cholesterol and triglycerides',
    tests: [
      'Total Cholesterol', 'LDL Cholesterol', 'HDL Cholesterol',
      'Triglycerides', 'VLDL Cholesterol', 'Cholesterol/HDL Ratio',
      'Non-HDL Cholesterol'
    ],
    displayOrder: 3,
  },
  {
    id: 'thyroid',
    name: 'Thyroid Function',
    category: 'thyroid',
    description: 'Measures thyroid hormone levels',
    tests: ['TSH', 'T3 Total', 'T4 Total', 'Free T3', 'Free T4', 'Thyroid Peroxidase Ab'],
    displayOrder: 4,
  },
  {
    id: 'diabetes',
    name: 'Diabetes Panel',
    category: 'diabetes',
    description: 'Measures blood sugar control',
    tests: ['Hemoglobin A1C', 'Fasting Glucose', 'Insulin', 'C-Peptide'],
    displayOrder: 5,
  },
  {
    id: 'liver',
    name: 'Liver Function',
    category: 'liver',
    description: 'Measures liver health and function',
    tests: ['ALT', 'AST', 'Alkaline Phosphatase', 'Bilirubin Total', 'Bilirubin Direct', 'Albumin', 'GGT'],
    displayOrder: 6,
  },
  {
    id: 'kidney',
    name: 'Kidney Function',
    category: 'kidney',
    description: 'Measures kidney health and function',
    tests: ['Creatinine', 'BUN', 'eGFR', 'BUN/Creatinine Ratio', 'Protein Total', 'Albumin'],
    displayOrder: 7,
  },
  {
    id: 'vitamins',
    name: 'Vitamin Levels',
    category: 'vitamins',
    description: 'Measures essential vitamin levels',
    tests: ['Vitamin D 25-Hydroxy', 'Vitamin B12', 'Folate', 'Vitamin A', 'Vitamin E'],
    displayOrder: 8,
  },
  {
    id: 'iron',
    name: 'Iron Studies',
    category: 'iron',
    description: 'Measures iron levels and storage',
    tests: ['Iron Serum', 'Ferritin', 'TIBC', 'Transferrin', 'Transferrin Saturation'],
    displayOrder: 9,
  },
];

// Priority health markers for dashboard quick view
export const PRIORITY_MARKERS = [
  'Glucose',
  'Hemoglobin A1C',
  'Total Cholesterol',
  'LDL Cholesterol',
  'HDL Cholesterol',
  'Triglycerides',
  'TSH',
  'Vitamin D 25-Hydroxy',
  'Hemoglobin',
  'Creatinine',
  'eGFR',
  'ALT',
  'AST',
  'WBC',
  'Platelet Count',
];

// Test name normalization mapping (handles variations)
export const TEST_NAME_ALIASES: Record<string, string> = {
  'glucose': 'Glucose',
  'blood sugar': 'Glucose',
  'fasting glucose': 'Fasting Glucose',
  'cholesterol total': 'Total Cholesterol',
  'total chol': 'Total Cholesterol',
  'ldl': 'LDL Cholesterol',
  'ldl-c': 'LDL Cholesterol',
  'hdl': 'HDL Cholesterol',
  'hdl-c': 'HDL Cholesterol',
  'trig': 'Triglycerides',
  'hgb': 'Hemoglobin',
  'hct': 'Hematocrit',
  'wbc': 'WBC',
  'white blood cell': 'WBC',
  'rbc': 'RBC',
  'red blood cell': 'RBC',
  'plt': 'Platelets',
  'platelet': 'Platelets',
  'a1c': 'Hemoglobin A1C',
  'hba1c': 'Hemoglobin A1C',
  'vitamin d': 'Vitamin D 25-Hydroxy',
  'vit d': 'Vitamin D 25-Hydroxy',
  '25-oh vitamin d': 'Vitamin D 25-Hydroxy',
  'b12': 'Vitamin B12',
  'egfr': 'eGFR',
  'gfr': 'eGFR',
};

