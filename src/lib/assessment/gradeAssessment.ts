import questionsData from '../data/bravermanQuestions.json';

export type Category = 'dopamine' | 'acetylcholine' | 'gaba' | 'serotonin';

export interface AssessmentResult {
  natureScores: Record<Category, number>;
  deficiencyScores: Record<Category, number>;
  dominantNature: Category;
  primaryDeficiency: Category | null;
  deficiencyLevels: Record<Category, 'Minor' | 'Moderate' | 'Major' | 'Severe' | 'None'>;
}

export function gradeAssessment(answers: Record<string, boolean>): AssessmentResult {
  const natureScores: Record<Category, number> = { dopamine: 0, acetylcholine: 0, gaba: 0, serotonin: 0 };
  const deficiencyScores: Record<Category, number> = { dopamine: 0, acetylcholine: 0, gaba: 0, serotonin: 0 };

  questionsData.questions.forEach((q) => {
    if (answers[q.id] === true) {
      if (q.section === 'nature') {
        natureScores[q.category as Category]++;
      } else if (q.section === 'deficiency') {
        deficiencyScores[q.category as Category]++;
      }
    }
  });

  // Calculate dominant nature
  let dominantNature: Category = 'dopamine';
  let maxNatureScore = -1;
  (Object.keys(natureScores) as Category[]).forEach((cat) => {
    if (natureScores[cat] > maxNatureScore) {
      maxNatureScore = natureScores[cat];
      dominantNature = cat;
    }
  });

  // Calculate deficiency levels
  const deficiencyLevels: Record<Category, 'Minor' | 'Moderate' | 'Major' | 'Severe' | 'None'> = {
    dopamine: 'None',
    acetylcholine: 'None',
    gaba: 'None',
    serotonin: 'None',
  };

  let primaryDeficiency: Category | null = null;
  let maxDeficiencyScore = 0;

  (Object.keys(deficiencyScores) as Category[]).forEach((cat) => {
    const score = deficiencyScores[cat];
    
    if (score > maxDeficiencyScore) {
      maxDeficiencyScore = score;
      primaryDeficiency = cat;
    }

    if (score >= 16) deficiencyLevels[cat] = 'Severe';
    else if (score >= 9) deficiencyLevels[cat] = 'Major';
    else if (score >= 6) deficiencyLevels[cat] = 'Moderate';
    else if (score >= 1) deficiencyLevels[cat] = 'Minor';
  });

  // If max deficiency score is very low, there might not be a "primary" worth addressing drastically
  if (maxDeficiencyScore === 0) {
    primaryDeficiency = null;
  }

  return {
    natureScores,
    deficiencyScores,
    dominantNature,
    primaryDeficiency,
    deficiencyLevels
  };
}
