/**
 * Exercise Nutrition Timing Database
 *
 * Maps workout types to optimal pre/post nutrition protocols,
 * with blood-type-specific food recommendations.
 *
 * Based on sports nutrition research (ISSN Position Stands) +
 * D'Adamo blood type exercise recommendations.
 *
 * Sources: ISSN, ACSM, D'Adamo (4yourtype.com)
 */

export interface NutritionWindow {
  timing: string;
  macroFocus: string;
  foods: string[];
  supplements?: string[];
  notes?: string;
}

export interface ExerciseNutritionProtocol {
  exerciseType: string;
  description: string;
  /** Ideal blood types for this exercise per D'Adamo */
  idealBloodTypes: string[];
  preWorkout: NutritionWindow;
  duringWorkout?: NutritionWindow;
  postWorkout: NutritionWindow;
  hydration: string;
  bloodTypeNotes: Record<string, string>;
}

// ─── Protocols ──────────────────────────────────────────────────────────────

const PROTOCOLS: ExerciseNutritionProtocol[] = [
  {
    exerciseType: 'Strength Training (Heavy)',
    description: 'Compound lifts, powerlifting, heavy resistance training',
    idealBloodTypes: ['O', 'B'],
    preWorkout: {
      timing: '60-90 min before',
      macroFocus: 'Moderate protein + complex carbs',
      foods: ['Oatmeal with banana', 'Rice with turkey', 'Sweet potato with eggs', 'Quinoa with salmon'],
      supplements: ['Creatine 5g', 'Caffeine 200mg (optional)', 'Beta-alanine 3g'],
      notes: 'Avoid high-fat meals — slows digestion',
    },
    postWorkout: {
      timing: 'Within 30-45 min',
      macroFocus: 'High protein (0.4g/kg) + fast carbs (0.8g/kg)',
      foods: ['Whey protein + banana', 'Chicken with white rice', 'Greek yogurt + honey', 'Protein shake + oats'],
      supplements: ['Whey/plant protein 25-40g', 'Creatine 5g (if not pre)', 'Magnesium glycinate 200mg'],
    },
    hydration: '500ml water 2hr before + 200ml every 15-20min during + 500ml+ after',
    bloodTypeNotes: {
      O: 'Type O thrives with intense exercise. Use beef or lamb as post-workout protein. Avoid dairy-based shakes — use plant protein.',
      A: 'Heavy lifting may spike cortisol in Type A. Keep sessions under 45 min. Use tofu or fish protein post-workout.',
      B: 'Type B handles heavy lifting well. Can use dairy protein (goat yogurt, whey). Avoid chicken — use lamb or fish.',
      AB: 'Moderate the volume. Use turkey or fish protein. Kefir-based recovery shakes work great for Type AB.',
    },
  },
  {
    exerciseType: 'HIIT / Cardio Intervals',
    description: 'High-intensity interval training, sprints, metabolic conditioning',
    idealBloodTypes: ['O'],
    preWorkout: {
      timing: '30-60 min before',
      macroFocus: 'Quick carbs + small protein',
      foods: ['Banana + almond butter', 'Rice cake + honey', 'Smoothie with berries', 'Toast with peanut butter'],
      supplements: ['Caffeine 200mg', 'BCAAs 5g (fasted only)', 'L-citrulline 6g'],
    },
    postWorkout: {
      timing: 'Within 30 min',
      macroFocus: 'Protein + carbs (2:1 carb to protein ratio)',
      foods: ['Chocolate protein shake', 'Turkey wrap with veggies', 'Smoothie with protein + banana', 'Rice bowl with salmon'],
      supplements: ['Protein 20-30g', 'Electrolytes (sodium + potassium)', 'Tart cherry juice (reduces DOMS)'],
    },
    hydration: '400ml 30min before + electrolyte drink during + 600ml+ after (replace 150% of sweat loss)',
    bloodTypeNotes: {
      O: 'HIIT is ideal for Type O — the "Hunter" thrives on vigorous exercise. Cherry juice is Beneficial.',
      A: 'Type A should limit HIIT to 1-2x/week max. High cortisol response. Better with yoga and walking.',
      B: 'Type B can do moderate HIIT. Balance with swimming or cycling. Avoid overtraining.',
      AB: 'Type AB should do shorter HIIT sessions (15-20 min). Combine with tai chi or calming movement.',
    },
  },
  {
    exerciseType: 'Yoga / Tai Chi / Pilates',
    description: 'Low-intensity mind-body exercise, flexibility, stress reduction',
    idealBloodTypes: ['A', 'AB'],
    preWorkout: {
      timing: '60-120 min before (light stomach)',
      macroFocus: 'Light — mostly complex carbs',
      foods: ['Small piece of fruit', 'Handful of almonds', 'Green tea', 'Light oatmeal'],
      notes: 'Practice is best on a mostly empty stomach',
    },
    postWorkout: {
      timing: 'Within 60 min',
      macroFocus: 'Balanced — moderate protein + healthy fats',
      foods: ['Tofu stir-fry with rice', 'Smoothie with soy milk + berries', 'Avocado toast with hemp seeds', 'Lentil soup with greens'],
      supplements: ['Magnesium glycinate 200mg', 'Ashwagandha 300mg (cortisol support)', 'L-theanine 200mg (calm focus)'],
    },
    hydration: '300ml water 30min before + small sips during + herbal tea after',
    bloodTypeNotes: {
      O: 'Type O benefits from yoga as recovery, but needs vigorous exercise as primary. Add power yoga for more intensity.',
      A: 'Yoga and tai chi are IDEAL for Type A. Reduces cortisol, supports the sensitive Type A immune system.',
      B: 'Good for recovery days. Type B should balance with more active exercises like tennis or hiking.',
      AB: 'Tai chi and yoga are top exercises for Type AB. The calming effect supports AB digestive health.',
    },
  },
  {
    exerciseType: 'Endurance / Long-Distance',
    description: 'Running, cycling, swimming — steady-state cardio over 60 min',
    idealBloodTypes: ['O', 'B'],
    preWorkout: {
      timing: '2-3 hours before',
      macroFocus: 'High complex carbs + moderate protein',
      foods: ['Oatmeal with banana and honey', 'Pasta with light sauce', 'Rice with eggs', 'Sweet potato with turkey'],
      supplements: ['Caffeine 3-6mg/kg', 'Sodium bicarbonate (optional for >90min)', 'Beta-alanine 3g'],
    },
    duringWorkout: {
      timing: 'Every 45-60 min (for sessions >60 min)',
      macroFocus: 'Quick carbs (30-60g/hr)',
      foods: ['Energy gels', 'Dates', 'Banana', 'Sports drink'],
      notes: 'Start fueling before you feel hungry',
    },
    postWorkout: {
      timing: 'Within 30 min',
      macroFocus: 'Carbs + protein (3:1 ratio)',
      foods: ['Chocolate milk', 'Rice with salmon', 'Sweet potato with turkey', 'Recovery smoothie with banana + protein'],
      supplements: ['Protein 20-30g', 'Electrolytes (sodium 500-1000mg)', 'Tart cherry juice', 'Omega-3 fish oil'],
    },
    hydration: '500ml 2hr before + 150-250ml every 15-20min during + weigh yourself: drink 500ml per 0.5kg lost',
    bloodTypeNotes: {
      O: 'Type O has excellent endurance capacity. Use beef bone broth for electrolytes post-run. Avoid wheat-based energy bars.',
      A: 'Type A can do moderate endurance but should keep heart rate in zone 2-3. Prioritize soy-based recovery drinks.',
      B: 'Type B does well with moderate endurance. Swimming and cycling are especially good. Use dairy-based recovery.',
      AB: 'Type AB should keep endurance sessions moderate (45-60 min). Use kefir smoothies for recovery.',
    },
  },
  {
    exerciseType: 'Swimming / Aquatic Exercise',
    description: 'Pool-based exercise, lap swimming, water aerobics',
    idealBloodTypes: ['B', 'AB'],
    preWorkout: {
      timing: '60-90 min before',
      macroFocus: 'Light carbs + moderate protein',
      foods: ['Banana', 'Rice cakes with almond butter', 'Small smoothie', 'Toast with egg'],
      notes: 'Lighter meal than land-based cardio — avoid heavy stomach in water',
    },
    postWorkout: {
      timing: 'Within 45 min',
      macroFocus: 'Balanced protein + carbs',
      foods: ['Fish with rice', 'Smoothie with protein + banana', 'Eggs with toast', 'Greek yogurt with granola'],
      supplements: ['Protein 20-25g', 'Vitamin D3 2000IU (chlorine depletes)', 'Zinc 15mg'],
    },
    hydration: '400ml before + bring water bottle poolside — you sweat more than you think in water',
    bloodTypeNotes: {
      O: 'Good cross-training for Type O. Follow with high-protein meal.',
      A: 'Excellent calming exercise for Type A. Reduces cortisol while building fitness.',
      B: 'Swimming is one of the TOP exercises for Type B — the "Nomad" thrives in varied movement.',
      AB: 'Great for Type AB. The buoyancy reduces joint stress. Use kefir recovery drinks.',
    },
  },
];

// ─── Lookup Functions ───────────────────────────────────────────────────────

/**
 * Get the nutrition protocol for a specific exercise type
 */
export function getExerciseNutritionProtocol(exerciseType: string): ExerciseNutritionProtocol | null {
  const lower = exerciseType.toLowerCase();
  return PROTOCOLS.find(p =>
    p.exerciseType.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    lower.includes(p.exerciseType.toLowerCase().split(' ')[0])
  ) || null;
}

/**
 * Get recommended exercises for a blood type
 */
export function getExercisesForBloodType(bloodType: string): ExerciseNutritionProtocol[] {
  const bt = bloodType.replace(/[+-]/, '').toUpperCase();
  return PROTOCOLS
    .sort((a, b) => {
      const aIdeal = a.idealBloodTypes.includes(bt) ? 1 : 0;
      const bIdeal = b.idealBloodTypes.includes(bt) ? 1 : 0;
      return bIdeal - aIdeal;
    });
}

/**
 * Get blood-type-specific notes for an exercise
 */
export function getBloodTypeExerciseNotes(exerciseType: string, bloodType: string): string | null {
  const protocol = getExerciseNutritionProtocol(exerciseType);
  if (!protocol) return null;
  const bt = bloodType.replace(/[+-]/, '').toUpperCase();
  return protocol.bloodTypeNotes[bt] || null;
}

/**
 * Get all protocols
 */
export function getAllExerciseProtocols(): ExerciseNutritionProtocol[] {
  return PROTOCOLS;
}

/**
 * Search exercise nutrition by keyword
 */
export function searchExerciseNutrition(query: string): ExerciseNutritionProtocol[] {
  const lower = query.toLowerCase();
  return PROTOCOLS.filter(p =>
    p.exerciseType.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.preWorkout.foods.some(f => f.toLowerCase().includes(lower)) ||
    p.postWorkout.foods.some(f => f.toLowerCase().includes(lower))
  );
}
