// Fitness Service — frontend API client for /api/fitness/*
import { api, getToken } from './apiClient';

export interface FitnessProfile {
  id?: string;
  user_id?: string;
  height_cm?: number;
  weight_kg?: number;
  body_fat_pct?: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  primary_goal?: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general_health';
  secondary_goals?: string[];
  equipment?: string[];
  training_styles?: string[];
  days_per_week: number;
  session_duration_min: number;
  preferred_time?: 'morning' | 'afternoon' | 'evening';
  injuries?: string[];
  photo_retention?: '30_days' | 'immediate';
}

export interface BodyAnalysis {
  id: string;
  analyzed_at: string;
  body_type?: string;
  bodyType?: string;
  estimated_bf?: number;
  estimatedBodyFat?: number;
  muscle_mass?: string;
  muscleDistribution?: string;
  ai_notes?: string;
  recommendations?: Record<string, unknown>;
  priorityAreas?: string[];
  strengths?: string[];
  cautions?: string[];
  recommendedApproach?: string;
  motivationalNote?: string;
  retention?: string;
}

export interface WorkoutExercise {
  name: string;
  muscleGroups: string[];
  sets: number;
  reps: string;
  restSec: number;
  rpe?: number;
  technique?: string;
  alternatives?: string[];
}

export interface WorkoutDay {
  dayOfWeek: string;
  type: string;
  name: string;
  duration_min: number;
  intensity?: string;
  warmup?: Array<{ exercise: string; duration: string; notes?: string }>;
  exercises: WorkoutExercise[];
  cooldown?: Array<{ exercise: string; duration: string; notes?: string }>;
  recoveryMeal?: string;
  coachNote?: string;
}

export interface WorkoutPlan {
  id?: string;
  planName: string;
  weeklyFocus?: string;
  totalWeeklyVolume?: string;
  progressionStrategy?: string;
  days: WorkoutDay[];
  weeklyRecoveryTips?: string;
  deloadWeek?: boolean;
}

export interface BodyMeasurement {
  id?: string;
  measured_at?: string;
  weight_kg?: number;
  body_fat_pct?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  bicep_cm?: number;
  thigh_cm?: number;
  notes?: string;
}

export interface PersonalRecord {
  id?: string;
  exercise: string;
  record_type: 'max_weight' | 'max_reps' | 'fastest_time' | 'longest_distance';
  value: number;
  unit?: string;
  achieved_at?: string;
}

// ── Profile ──────────────────────────────────────────────────────────────────
export const getFitnessProfile = () =>
  api.get<{ success: boolean; data: FitnessProfile | null }>('/fitness/profile');

export const saveFitnessProfile = (profile: Partial<FitnessProfile>) =>
  api.post<{ success: boolean; data: FitnessProfile }>('/fitness/profile', profile);

// ── Body Analysis ─────────────────────────────────────────────────────────────
export const getBodyAnalyses = () =>
  api.get<{ success: boolean; data: BodyAnalysis[] }>('/fitness/body-analysis');

export const analyzeBodyPhoto = async (file: File): Promise<{ success: boolean; data: BodyAnalysis }> => {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await fetch('/api/fitness/body-analysis', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  return res.json();
};

export const deleteBodyAnalysis = (id: string) =>
  api.delete<{ success: boolean }>(`/fitness/body-analysis/${id}`);

// ── Workout Plans ─────────────────────────────────────────────────────────────
export const getCurrentWorkoutPlan = () =>
  api.get<{ success: boolean; data: WorkoutPlan | null }>('/fitness/workout-plan');

export const generateWorkoutPlan = (weekStart?: string) =>
  api.post<{ success: boolean; data: WorkoutPlan }>('/fitness/workout-plan', { week_start: weekStart });

// ── Sessions ──────────────────────────────────────────────────────────────────
export const getSessions = () =>
  api.get<{ success: boolean; data: unknown[] }>('/fitness/sessions');

export const completeSession = (sessionId: string, data: { duration_min?: number; exercises?: unknown[]; notes?: string; mood?: string }) =>
  api.post<{ success: boolean; message: string }>(`/fitness/session/${sessionId}/complete`, data);

// ── Measurements ──────────────────────────────────────────────────────────────
export const getMeasurements = () =>
  api.get<{ success: boolean; data: BodyMeasurement[] }>('/fitness/measurements');

export const logMeasurement = (data: BodyMeasurement) =>
  api.post<{ success: boolean; data: { id: string } }>('/fitness/measurements', data);

// ── Personal Records ──────────────────────────────────────────────────────────
export const getPersonalRecords = () =>
  api.get<{ success: boolean; data: PersonalRecord[] }>('/fitness/records');

export const logPersonalRecord = (data: PersonalRecord) =>
  api.post<{ success: boolean; data: { id: string } }>('/fitness/records', data);

// ── Progress Analysis ─────────────────────────────────────────────────────────
export const getProgressAnalysis = () =>
  api.get<{ success: boolean; data: unknown }>('/fitness/progress-analysis');
