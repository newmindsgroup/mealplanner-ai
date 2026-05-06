import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssessmentResult, gradeAssessment } from '../lib/assessment/gradeAssessment';

interface AssessmentState {
  answers: Record<string, boolean>;
  isCompleted: boolean;
  result: AssessmentResult | null;
  isMonetizationEnabled: boolean;
  
  setAnswer: (questionId: string, value: boolean) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  toggleMonetization: (enabled: boolean) => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      answers: {},
      isCompleted: false,
      result: null,
      isMonetizationEnabled: false,

      setAnswer: (questionId, value) => set((state) => ({
        answers: { ...state.answers, [questionId]: value }
      })),

      completeAssessment: () => {
        const { answers } = get();
        const result = gradeAssessment(answers);
        set({ isCompleted: true, result });
      },

      resetAssessment: () => set({ answers: {}, isCompleted: false, result: null }),

      toggleMonetization: (enabled) => set({ isMonetizationEnabled: enabled }),
    }),
    {
      name: 'assessment-storage',
    }
  )
);
