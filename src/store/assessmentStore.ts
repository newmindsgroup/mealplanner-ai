import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssessmentResult, gradeAssessment, Category } from '../lib/assessment/gradeAssessment';
import type { NeuroProtocol, ConversationalScoring, DriftAdjustment } from '../services/aiNeuroAnalysis';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DailyLog {
  id: string;
  date: string;
  text: string;
  adjustment: DriftAdjustment;
  timestamp: string;
}

export interface ConversationalMessage {
  role: 'user' | 'assistant';
  content: string;
  scoring?: ConversationalScoring;
  timestamp: string;
}

/** All assessment data for a single person */
export interface PersonAssessmentData {
  personId: string;
  answers: Record<string, boolean>;
  isCompleted: boolean;
  result: AssessmentResult | null;
  completedAt: string | null;

  // Phase 1: AI Protocol
  aiProtocol: NeuroProtocol | null;
  isGeneratingProtocol: boolean;
  disclaimerAccepted: boolean;

  // Phase 2: Conversational assessment
  conversationalMessages: ConversationalMessage[];
  conversationalScoring: ConversationalScoring | null;
  assessmentMode: 'standard' | 'conversational';

  // Phase 3: Drift detection
  dailyLogs: DailyLog[];
  driftModifiers: Record<Category, number>;
}

function createEmptyPersonData(personId: string): PersonAssessmentData {
  return {
    personId,
    answers: {},
    isCompleted: false,
    result: null,
    completedAt: null,
    aiProtocol: null,
    isGeneratingProtocol: false,
    disclaimerAccepted: false,
    conversationalMessages: [],
    conversationalScoring: null,
    assessmentMode: 'standard',
    dailyLogs: [],
    driftModifiers: { dopamine: 0, acetylcholine: 0, gaba: 0, serotonin: 0 },
  };
}

interface AssessmentState {
  // Multi-person data keyed by personId
  assessments: Record<string, PersonAssessmentData>;
  activePersonId: string | null;
  isMonetizationEnabled: boolean;

  // ─── Person Selection ────────────────────────────────────────────
  setActivePersonId: (id: string | null) => void;
  getPersonAssessment: (id: string) => PersonAssessmentData;
  getCompletedAssessments: () => PersonAssessmentData[];
  getInProgressAssessments: () => PersonAssessmentData[];

  // ─── Active-person-scoped actions (operate on activePersonId) ───
  // Core
  answers: Record<string, boolean>;
  isCompleted: boolean;
  result: AssessmentResult | null;

  setAnswer: (questionId: string, value: boolean) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  toggleMonetization: (enabled: boolean) => void;

  // Phase 1
  aiProtocol: NeuroProtocol | null;
  isGeneratingProtocol: boolean;
  disclaimerAccepted: boolean;
  setAiProtocol: (protocol: NeuroProtocol | null) => void;
  setIsGeneratingProtocol: (generating: boolean) => void;
  setDisclaimerAccepted: (accepted: boolean) => void;

  // Phase 2
  conversationalMessages: ConversationalMessage[];
  conversationalScoring: ConversationalScoring | null;
  assessmentMode: 'standard' | 'conversational';
  setAssessmentMode: (mode: 'standard' | 'conversational') => void;
  addConversationalMessage: (message: ConversationalMessage) => void;
  updateConversationalScoring: (scoring: ConversationalScoring) => void;
  completeConversationalAssessment: (result: AssessmentResult) => void;
  clearConversation: () => void;

  // Phase 3
  dailyLogs: DailyLog[];
  driftModifiers: Record<Category, number>;
  addDailyLog: (log: DailyLog) => void;
  applyDriftAdjustment: (adjustment: DriftAdjustment) => void;
  getAdjustedResult: () => AssessmentResult | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get the active person's data from state, or a blank slate */
function active(state: { assessments: Record<string, PersonAssessmentData>; activePersonId: string | null }): PersonAssessmentData {
  const id = state.activePersonId;
  if (!id) return createEmptyPersonData('__none__');
  return state.assessments[id] || createEmptyPersonData(id);
}

/** Return a patch that writes updated person data back into assessments and also surfaces the computed fields */
function patchPerson(
  state: { assessments: Record<string, PersonAssessmentData>; activePersonId: string | null },
  update: Partial<PersonAssessmentData>
) {
  const id = state.activePersonId;
  if (!id) return {};

  const current = state.assessments[id] || createEmptyPersonData(id);
  const updated = { ...current, ...update };

  const newAssessments = { ...state.assessments, [id]: updated };

  return {
    assessments: newAssessments,
    // Surface active person fields for backward compatibility
    answers: updated.answers,
    isCompleted: updated.isCompleted,
    result: updated.result,
    aiProtocol: updated.aiProtocol,
    isGeneratingProtocol: updated.isGeneratingProtocol,
    disclaimerAccepted: updated.disclaimerAccepted,
    conversationalMessages: updated.conversationalMessages,
    conversationalScoring: updated.conversationalScoring,
    assessmentMode: updated.assessmentMode,
    dailyLogs: updated.dailyLogs,
    driftModifiers: updated.driftModifiers,
  };
}

/** Surface the active person's data to top-level computed fields */
function surfaceActive(assessments: Record<string, PersonAssessmentData>, activePersonId: string | null) {
  const data = activePersonId ? assessments[activePersonId] : null;
  if (!data) {
    return {
      answers: {} as Record<string, boolean>,
      isCompleted: false,
      result: null as AssessmentResult | null,
      aiProtocol: null as NeuroProtocol | null,
      isGeneratingProtocol: false,
      disclaimerAccepted: false,
      conversationalMessages: [] as ConversationalMessage[],
      conversationalScoring: null as ConversationalScoring | null,
      assessmentMode: 'standard' as const,
      dailyLogs: [] as DailyLog[],
      driftModifiers: { dopamine: 0, acetylcholine: 0, gaba: 0, serotonin: 0 } as Record<Category, number>,
    };
  }
  return {
    answers: data.answers,
    isCompleted: data.isCompleted,
    result: data.result,
    aiProtocol: data.aiProtocol,
    isGeneratingProtocol: data.isGeneratingProtocol,
    disclaimerAccepted: data.disclaimerAccepted,
    conversationalMessages: data.conversationalMessages,
    conversationalScoring: data.conversationalScoring,
    assessmentMode: data.assessmentMode,
    dailyLogs: data.dailyLogs,
    driftModifiers: data.driftModifiers,
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      // Multi-person data
      assessments: {},
      activePersonId: null,
      isMonetizationEnabled: false,

      // Surfaced active-person fields (defaults)
      answers: {},
      isCompleted: false,
      result: null,
      aiProtocol: null,
      isGeneratingProtocol: false,
      disclaimerAccepted: false,
      conversationalMessages: [],
      conversationalScoring: null,
      assessmentMode: 'standard',
      dailyLogs: [],
      driftModifiers: { dopamine: 0, acetylcholine: 0, gaba: 0, serotonin: 0 },

      // ─── Person Selection ──────────────────────────────────────────

      setActivePersonId: (id) => {
        const { assessments } = get();
        // Ensure person slot exists
        if (id && !assessments[id]) {
          const newAssessments = { ...assessments, [id]: createEmptyPersonData(id) };
          set({
            activePersonId: id,
            assessments: newAssessments,
            ...surfaceActive(newAssessments, id),
          });
        } else {
          set({
            activePersonId: id,
            ...surfaceActive(assessments, id),
          });
        }
      },

      getPersonAssessment: (id) => {
        const { assessments } = get();
        return assessments[id] || createEmptyPersonData(id);
      },

      getCompletedAssessments: () => {
        const { assessments } = get();
        return Object.values(assessments).filter((a) => a.isCompleted);
      },

      getInProgressAssessments: () => {
        const { assessments } = get();
        return Object.values(assessments).filter(
          (a) => !a.isCompleted && Object.keys(a.answers).length > 0
        );
      },

      // ─── Core Actions (active-person-scoped) ───────────────────────

      setAnswer: (questionId, value) =>
        set((state) => {
          const data = active(state);
          return patchPerson(state, {
            answers: { ...data.answers, [questionId]: value },
          });
        }),

      completeAssessment: () => {
        const state = get();
        const data = active(state);
        const result = gradeAssessment(data.answers);
        set(patchPerson(state, {
          isCompleted: true,
          result,
          aiProtocol: null,
          completedAt: new Date().toISOString(),
        }));
      },

      resetAssessment: () =>
        set((state) => {
          const id = state.activePersonId;
          if (!id) return {};
          return patchPerson(state, {
            answers: {},
            isCompleted: false,
            result: null,
            completedAt: null,
            aiProtocol: null,
            isGeneratingProtocol: false,
            disclaimerAccepted: false,
            conversationalMessages: [],
            conversationalScoring: null,
            dailyLogs: [],
            driftModifiers: { dopamine: 0, acetylcholine: 0, gaba: 0, serotonin: 0 },
          });
        }),

      toggleMonetization: (enabled) => set({ isMonetizationEnabled: enabled }),

      // ─── Phase 1 Actions ───────────────────────────────────────────

      setAiProtocol: (protocol) =>
        set((state) => patchPerson(state, { aiProtocol: protocol, isGeneratingProtocol: false })),

      setIsGeneratingProtocol: (generating) =>
        set((state) => patchPerson(state, { isGeneratingProtocol: generating })),

      setDisclaimerAccepted: (accepted) =>
        set((state) => patchPerson(state, { disclaimerAccepted: accepted })),

      // ─── Phase 2 Actions ───────────────────────────────────────────

      setAssessmentMode: (mode) =>
        set((state) => patchPerson(state, { assessmentMode: mode })),

      addConversationalMessage: (message) =>
        set((state) => {
          const data = active(state);
          return patchPerson(state, {
            conversationalMessages: [...data.conversationalMessages, message],
          });
        }),

      updateConversationalScoring: (scoring) =>
        set((state) => patchPerson(state, { conversationalScoring: scoring })),

      completeConversationalAssessment: (result) =>
        set((state) => patchPerson(state, {
          isCompleted: true,
          result,
          aiProtocol: null,
          completedAt: new Date().toISOString(),
        })),

      clearConversation: () =>
        set((state) => patchPerson(state, {
          conversationalMessages: [],
          conversationalScoring: null,
        })),

      // ─── Phase 3 Actions ───────────────────────────────────────────

      addDailyLog: (log) =>
        set((state) => {
          const data = active(state);
          return patchPerson(state, {
            dailyLogs: [...data.dailyLogs.slice(-29), log],
          });
        }),

      applyDriftAdjustment: (adjustment) =>
        set((state) => {
          const data = active(state);
          return patchPerson(state, {
            driftModifiers: {
              dopamine: data.driftModifiers.dopamine + adjustment.dopamine_adjustment,
              acetylcholine: data.driftModifiers.acetylcholine + adjustment.acetylcholine_adjustment,
              gaba: data.driftModifiers.gaba + adjustment.gaba_adjustment,
              serotonin: data.driftModifiers.serotonin + adjustment.serotonin_adjustment,
            },
          });
        }),

      getAdjustedResult: () => {
        const state = get();
        const data = active(state);
        if (!data.result) return null;

        const adjustedDeficiency = { ...data.result.deficiencyScores };
        for (const cat of Object.keys(data.driftModifiers) as Category[]) {
          adjustedDeficiency[cat] = Math.max(
            0,
            Math.min(20, adjustedDeficiency[cat] + data.driftModifiers[cat])
          );
        }

        const deficiencyLevels = { ...data.result.deficiencyLevels };
        let primaryDeficiency: Category | null = null;
        let maxDef = 0;

        for (const cat of Object.keys(adjustedDeficiency) as Category[]) {
          const score = adjustedDeficiency[cat];
          if (score > maxDef) {
            maxDef = score;
            primaryDeficiency = cat;
          }
          if (score >= 16) deficiencyLevels[cat] = 'Severe';
          else if (score >= 9) deficiencyLevels[cat] = 'Major';
          else if (score >= 6) deficiencyLevels[cat] = 'Moderate';
          else if (score >= 1) deficiencyLevels[cat] = 'Minor';
          else deficiencyLevels[cat] = 'None';
        }

        if (maxDef === 0) primaryDeficiency = null;

        return {
          ...data.result,
          deficiencyScores: adjustedDeficiency,
          deficiencyLevels,
          primaryDeficiency,
        };
      },
    }),
    {
      name: 'assessment-storage',
      version: 2,
      migrate: (persisted: any, version: number) => {
        // Migrate from v0/v1 (flat single-person) to v2 (multi-person)
        if (version < 2 && persisted) {
          const old = persisted as any;
          // If old data has flat answers/result, migrate into a default person slot
          if (old.answers && typeof old.answers === 'object' && !old.assessments) {
            const legacyId = '__legacy__';
            const migrated: PersonAssessmentData = {
              personId: legacyId,
              answers: old.answers || {},
              isCompleted: old.isCompleted || false,
              result: old.result || null,
              completedAt: old.isCompleted ? new Date().toISOString() : null,
              aiProtocol: old.aiProtocol || null,
              isGeneratingProtocol: false,
              disclaimerAccepted: old.disclaimerAccepted || false,
              conversationalMessages: old.conversationalMessages || [],
              conversationalScoring: old.conversationalScoring || null,
              assessmentMode: old.assessmentMode || 'standard',
              dailyLogs: old.dailyLogs || [],
              driftModifiers: old.driftModifiers || { dopamine: 0, acetylcholine: 0, gaba: 0, serotonin: 0 },
            };
            return {
              assessments: { [legacyId]: migrated },
              activePersonId: null,
              isMonetizationEnabled: old.isMonetizationEnabled || false,
              // Surface defaults
              answers: {},
              isCompleted: false,
              result: null,
              aiProtocol: null,
              isGeneratingProtocol: false,
              disclaimerAccepted: false,
              conversationalMessages: [],
              conversationalScoring: null,
              assessmentMode: 'standard',
              dailyLogs: [],
              driftModifiers: { dopamine: 0, acetylcholine: 0, gaba: 0, serotonin: 0 },
            };
          }
        }
        return persisted as any;
      },
    }
  )
);
