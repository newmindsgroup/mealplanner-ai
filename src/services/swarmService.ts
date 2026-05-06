// NourishAI Swarm Intelligence Service
// Communicates with the multi-agent system through the Express bridge
// Handles thread management, message sending, file downloads, and health checks

import { api, apiFetch, getToken } from './apiClient';
import { getApiUrl } from '../config';

// ============================================================================
// TYPES
// ============================================================================

export interface SwarmThreadResponse {
  threadId: string;
  agentName: string;
  message: string;
  files?: SwarmFile[];
  status: 'completed' | 'in_progress' | 'error';
}

export interface SwarmFile {
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'pptx' | 'docx' | 'csv' | 'json' | 'other';
}

export interface SwarmHealthStatus {
  success: boolean;
  status: 'healthy' | 'degraded' | 'offline';
  swarmUrl?: string;
  agency?: string;
  error?: string;
}

export type SwarmTaskType =
  | 'lab_deep_analysis'
  | 'lab_report_pdf'
  | 'lab_trend_charts'
  | 'neuro_research_protocol'
  | 'neuro_lab_correlation'
  | 'neuro_protocol_pdf'
  | 'meal_plan_verified'
  | 'meal_plan_pdf'
  | 'fitness_analysis'
  | 'fitness_monthly_report'
  | 'exercise_demo_video'
  | 'health_report_comprehensive'
  | 'doctor_visit_prep'
  | 'health_presentation'
  | 'custom';

// ============================================================================
// PROMPT BUILDERS — Create rich prompts for each task type
// ============================================================================

const TASK_PROMPTS: Record<SwarmTaskType, (context: Record<string, unknown>) => string> = {
  lab_deep_analysis: (ctx) =>
    `Perform a comprehensive deep analysis of my lab results. Evaluate each biomarker against optimal functional ranges (not just lab normal). Identify trends if historical data is provided. Research the latest clinical literature for any abnormal values. Provide evidence-based nutritional recommendations with PubMed citations.`,

  lab_report_pdf: (ctx) =>
    `Generate a professional PDF lab analysis report. Include: executive summary, detailed biomarker evaluation with optimal ranges, trend charts for historical data, food-based intervention recommendations, supplement suggestions with interaction safety checks, and PubMed citations for all clinical claims.`,

  lab_trend_charts: (ctx) =>
    `Analyze my historical lab data and create statistical trend charts. Generate matplotlib/plotly visualizations for: biomarker trend lines over time, radar chart comparing current values to optimal ranges, heatmap of improving vs declining markers, and delta analysis from last panel.`,

  neuro_research_protocol: (ctx) =>
    `Based on my Braverman Assessment results, create a research-backed neuro-nutritional recovery protocol. Search PubMed for the latest studies on each identified neurotransmitter deficiency. Validate all supplement recommendations against my current medications for drug interactions. Include specific dosing, timing, and food-based support strategies.`,

  neuro_lab_correlation: (ctx) =>
    `Run a statistical correlation analysis between my neurotransmitter assessment results and my lab data. Use scipy/pandas to identify significant correlations between biomarker levels and neurotransmitter deficiencies. Create correlation matrix charts and explain the clinical significance of each finding.`,

  neuro_protocol_pdf: (ctx) =>
    `Generate a professional PDF neuro-nutritional recovery protocol document. Include: assessment results summary, dominant/deficient neurotransmitter profiles, 4-week phased recovery plan, supplement schedule with timing, dietary protocol, lifestyle recommendations, and clinical references.`,

  meal_plan_verified: (ctx) =>
    `Create a nutritionally verified weekly meal plan. Cross-reference with USDA data for actual macro/micronutrient content. Ensure blood type compatibility, neuro-optimization based on my assessment results, and alignment with my lab-identified deficiencies. Validate that meal combinations don't conflict with my supplements or medications.`,

  meal_plan_pdf: (ctx) =>
    `Generate a beautiful print-ready PDF weekly meal plan. Include: daily meals with recipes, detailed nutrition breakdown per meal, grocery shopping list organized by store section, meal prep schedule, and food images for each meal.`,

  fitness_analysis: (ctx) =>
    `Perform a statistical analysis of my workout history. Calculate: strength progression curves, volume load trends, plateau detection using moving averages, muscle group balance analysis, and recovery adequacy assessment. Create professional matplotlib charts for each metric.`,

  fitness_monthly_report: (ctx) =>
    `Generate a comprehensive monthly fitness progress report as a PDF. Include: workout frequency and consistency, strength milestones achieved, body composition trends, muscle group balance radar chart, volume progression, and next-month programming recommendations based on identified plateaus or imbalances.`,

  exercise_demo_video: (ctx) =>
    `Create an exercise demonstration video showing proper form for the specified exercise. Include: starting position, movement execution, breathing cues, common mistakes to avoid, and modification options for different fitness levels.`,

  health_report_comprehensive: (ctx) =>
    `Generate a comprehensive health intelligence report covering ALL domains: lab results analysis, neurotransmitter profile, fitness progress, nutritional status, and cross-domain correlations. This is the full picture — combine insights from all data sources into one professional PDF report with charts, citations, and a unified action plan.`,

  doctor_visit_prep: (ctx) =>
    `Create a doctor visit preparation package as a PDF. Format all my health data for a healthcare provider: recent lab results with trends, current supplement protocol, neurotransmitter assessment summary, fitness metrics, and a list of specific questions/concerns to discuss. Use clinical formatting that a physician would expect.`,

  health_presentation: (ctx) =>
    `Create a professional slide presentation summarizing my health data. Include key charts, progress highlights, protocol summaries, and action items. Format for easy sharing with family members or healthcare providers.`,

  custom: () => '',
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Check if the NourishAI swarm is online and responsive
 */
export async function checkSwarmHealth(): Promise<SwarmHealthStatus> {
  try {
    const result = await api.get<SwarmHealthStatus>('/swarm/health');
    return result.data || { success: false, status: 'offline' };
  } catch {
    return { success: false, status: 'offline', error: 'Bridge unreachable' };
  }
}

/**
 * Start a new swarm conversation with a specific task type
 */
export async function startSwarmTask(
  taskType: SwarmTaskType,
  context: Record<string, unknown>,
  customMessage?: string
): Promise<SwarmThreadResponse> {
  const prompt = taskType === 'custom'
    ? (customMessage || '')
    : TASK_PROMPTS[taskType](context);

  const fullMessage = customMessage && taskType !== 'custom'
    ? `${prompt}\n\nAdditional instructions: ${customMessage}`
    : prompt;

  const result = await api.post<SwarmThreadResponse>('/swarm/threads', {
    message: fullMessage,
    context,
  });

  return result.data!;
}

/**
 * Send a follow-up message in an existing swarm thread
 */
export async function sendSwarmMessage(
  threadId: string,
  message: string,
  context?: Record<string, unknown>
): Promise<SwarmThreadResponse> {
  const result = await api.post<SwarmThreadResponse>(
    `/swarm/threads/${threadId}/messages`,
    { message, context }
  );
  return result.data!;
}

/**
 * Download a generated file (PDF, chart image, etc.)
 */
export async function downloadSwarmFile(filename: string): Promise<Blob> {
  const apiUrl = getApiUrl();
  const token = getToken();

  const response = await fetch(`${apiUrl}/swarm/files/${encodeURIComponent(filename)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Download and save a swarm-generated file to the user's device
 */
export async function saveSwarmFile(filename: string, saveAs?: string): Promise<void> {
  const blob = await downloadSwarmFile(filename);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = saveAs || filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get conversation history for a thread
 */
export async function getSwarmThread(threadId: string) {
  const result = await api.get(`/swarm/threads/${threadId}`);
  return result.data;
}
