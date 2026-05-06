/**
 * Supplement Timing Matrix
 *
 * Optimal timing for common supplements relative to meals, exercise,
 * sleep, and other supplements. Includes absorption notes and
 * blood-type-specific considerations.
 *
 * Sources: NIH ODS, ConsumerLab, Examine.com, D'Adamo
 */

export interface SupplementTiming {
  name: string;
  category: string;
  /** Best time of day */
  bestTime: 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'any';
  /** Relative to meals */
  mealTiming: 'with food' | 'empty stomach' | 'either';
  /** Relative to exercise */
  exerciseTiming?: 'pre-workout' | 'post-workout' | 'not near exercise' | 'any';
  /** What to take it with for better absorption */
  takeWith?: string[];
  /** What NOT to take it with */
  avoidWith?: string[];
  /** Standard dosage range */
  dosageRange: string;
  /** Key absorption notes */
  absorptionNotes: string;
  /** Blood-type-specific notes */
  bloodTypeNotes?: Record<string, string>;
}

const SUPPLEMENT_TIMING: SupplementTiming[] = [
  // ── FAT-SOLUBLE VITAMINS ──────────────────────────────────────
  {
    name: 'Vitamin D3',
    category: 'Vitamin',
    bestTime: 'morning',
    mealTiming: 'with food',
    takeWith: ['Fatty meal (olive oil, avocado, nuts)', 'Vitamin K2 (synergy for bone health)'],
    avoidWith: ['Calcium supplements at same time (compete)', 'Thyroid medication (4hr gap)'],
    dosageRange: '1,000–5,000 IU/day',
    absorptionNotes: 'Fat-soluble — absorbs 32% better with fatty meal. Take largest meal of the day. NOT at bedtime — may disrupt melatonin.',
    bloodTypeNotes: {
      O: 'Type O often needs higher D3 — active lifestyle demands it. Take with morning protein meal.',
      A: 'Type A may have lower D levels due to plant-heavy diet. Pair with olive oil for absorption.',
      B: 'Type B can take with dairy-based meal. Goat cheese or yogurt provides fat for absorption.',
      AB: 'Type AB: take with largest meal. Pair with kefir or goat cheese for fat.',
    },
  },
  {
    name: 'Vitamin K2 (MK-7)',
    category: 'Vitamin',
    bestTime: 'morning',
    mealTiming: 'with food',
    takeWith: ['Vitamin D3 (synergy)', 'Fatty meal'],
    avoidWith: ['Warfarin/blood thinners (CRITICAL — affects clotting)'],
    dosageRange: '100–200 mcg/day',
    absorptionNotes: 'Fat-soluble. Always pair with D3. MK-7 form has longer half-life than MK-4.',
  },
  {
    name: 'Vitamin A',
    category: 'Vitamin',
    bestTime: 'morning',
    mealTiming: 'with food',
    takeWith: ['Fatty meal', 'Zinc (synergistic)'],
    avoidWith: ['Other retinoid medications', 'Excessive alcohol'],
    dosageRange: '2,500–10,000 IU/day (retinol form)',
    absorptionNotes: 'Fat-soluble. Beta-carotene form is safer but less bioavailable. Retinol form is more potent.',
  },

  // ── WATER-SOLUBLE VITAMINS ────────────────────────────────────
  {
    name: 'Vitamin B12',
    category: 'Vitamin',
    bestTime: 'morning',
    mealTiming: 'empty stomach',
    takeWith: ['Folate (B9) — they work together', 'Sublingual form bypasses gut absorption issues'],
    avoidWith: ['Vitamin C megadoses (may destroy B12)', 'Metformin depletes B12 — supplement separately'],
    dosageRange: '500–2,000 mcg/day (methylcobalamin form)',
    absorptionNotes: 'Sublingual or liquid absorbs best. Morning empty stomach. Methylcobalamin > cyanocobalamin.',
    bloodTypeNotes: {
      A: 'Type A on plant-based diet MUST supplement B12. Deficiency is common.',
      AB: 'Type AB may need extra B12 — lower stomach acid reduces absorption.',
    },
  },
  {
    name: 'Vitamin C',
    category: 'Vitamin',
    bestTime: 'morning',
    mealTiming: 'either',
    takeWith: ['Iron supplements (dramatically increases iron absorption)', 'Bioflavonoids (enhance absorption)'],
    avoidWith: ['B12 (may degrade it at high doses)', 'Aluminum-containing antacids'],
    dosageRange: '500–2,000 mg/day (split doses)',
    absorptionNotes: 'Water-soluble — excess is excreted. Split into 2-3 doses for better absorption. Liposomal form absorbs best.',
  },
  {
    name: 'B-Complex',
    category: 'Vitamin',
    bestTime: 'morning',
    mealTiming: 'with food',
    takeWith: ['Breakfast — provides energy for the day'],
    avoidWith: ['Evening/bedtime — B vitamins are energizing and may disrupt sleep'],
    dosageRange: 'Varies by formula — look for methylated forms',
    absorptionNotes: 'Take with food to prevent nausea. ALWAYS take in morning — B vitamins boost energy and can cause insomnia if taken at night.',
  },

  // ── MINERALS ──────────────────────────────────────────────────
  {
    name: 'Magnesium Glycinate',
    category: 'Mineral',
    bestTime: 'bedtime',
    mealTiming: 'with food',
    exerciseTiming: 'post-workout',
    takeWith: ['Evening meal or bedtime snack', 'Vitamin D3 (helps magnesium absorption)'],
    avoidWith: ['Calcium supplements (take at different times)', 'Zinc (compete for absorption — separate by 2hr)'],
    dosageRange: '200–400 mg elemental magnesium/day',
    absorptionNotes: 'Glycinate form is best for sleep and anxiety (crosses blood-brain barrier). Citrate for constipation. Threonate for cognition.',
    bloodTypeNotes: {
      O: 'Type O benefits from post-workout magnesium — supports muscle recovery after intense exercise.',
      A: 'Type A: excellent for stress/cortisol management. Take at bedtime with calming tea.',
      B: 'Type B: good for sleep and nervous system. Glycinate form preferred.',
      AB: 'Type AB: supports the calming exercise Type AB needs. Take with evening kefir.',
    },
  },
  {
    name: 'Iron (Ferrous Bisglycinate)',
    category: 'Mineral',
    bestTime: 'morning',
    mealTiming: 'empty stomach',
    takeWith: ['Vitamin C (increases absorption 2-6x)', 'Small amount of meat (heme iron enhances non-heme)'],
    avoidWith: ['Calcium (blocks absorption — 4hr gap)', 'Coffee/tea (tannins block absorption — 1hr gap)', 'Thyroid medication (4hr gap)', 'Dairy, eggs, whole grains (phytates block absorption)'],
    dosageRange: '18–65 mg/day (as directed by doctor)',
    absorptionNotes: 'Bisglycinate form is gentlest on stomach. Take on empty stomach with vitamin C for max absorption. Most people absorb only 10-15% of iron.',
    bloodTypeNotes: {
      O: 'Type O: heme iron from beef is best absorbed. If supplementing, pair with pineapple (vitamin C + Beneficial for O).',
      A: 'Type A on plant-based diet often needs iron supplementation. Pair with lemon juice.',
    },
  },
  {
    name: 'Zinc',
    category: 'Mineral',
    bestTime: 'evening',
    mealTiming: 'with food',
    takeWith: ['Small protein-containing meal', 'Copper (2mg copper per 30mg zinc to prevent depletion)'],
    avoidWith: ['Iron supplements (compete — separate by 2hr)', 'Calcium (separate by 2hr)', 'Phytate-rich foods (grains, legumes)'],
    dosageRange: '15–30 mg/day (zinc picolinate or bisglycinate)',
    absorptionNotes: 'Can cause nausea on empty stomach. Picolinate and bisglycinate forms absorb best. Long-term use depletes copper.',
  },
  {
    name: 'Calcium',
    category: 'Mineral',
    bestTime: 'evening',
    mealTiming: 'with food',
    takeWith: ['Vitamin D3 (essential for calcium absorption)', 'Vitamin K2 (directs calcium to bones, not arteries)'],
    avoidWith: ['Iron (blocks absorption — 4hr gap)', 'Thyroid medication (4hr gap)', 'Magnesium (separate by 2hr)'],
    dosageRange: '500–600 mg per dose (max 2x/day)',
    absorptionNotes: 'Body absorbs max 500mg at once — split doses. Citrate form absorbs on empty stomach. Carbonate needs stomach acid (take with food).',
  },

  // ── ADAPTOGENS ────────────────────────────────────────────────
  {
    name: 'Ashwagandha (KSM-66)',
    category: 'Adaptogen',
    bestTime: 'evening',
    mealTiming: 'with food',
    exerciseTiming: 'post-workout',
    takeWith: ['Dinner or evening snack', 'Black pepper (piperine increases absorption)'],
    avoidWith: ['Thyroid medication (may potentiate — consult doctor)', 'SSRIs (theoretical interaction)', 'Morning (can be sedating for some)'],
    dosageRange: '300–600 mg/day (KSM-66 extract)',
    absorptionNotes: 'KSM-66 is the most researched form. Takes 4-8 weeks for full effect. Can be calming — many prefer evening.',
    bloodTypeNotes: {
      A: 'Type A: EXCELLENT choice — Type A has highest cortisol response. Evening dosing supports sleep.',
      AB: 'Type AB: good for calming the nervous system. Take with evening meal.',
      O: 'Type O: use if recovering from overtraining. Not needed daily for most Type O.',
    },
  },
  {
    name: 'Rhodiola Rosea',
    category: 'Adaptogen',
    bestTime: 'morning',
    mealTiming: 'empty stomach',
    exerciseTiming: 'pre-workout',
    takeWith: ['Morning on empty stomach for max energy', 'Before exercise for endurance'],
    avoidWith: ['Evening/bedtime (stimulating)', 'SSRIs (mild MAO inhibition risk)', 'Other stimulants'],
    dosageRange: '200–600 mg/day (3% rosavins, 1% salidroside)',
    absorptionNotes: 'Energizing — always take morning or pre-workout. Empty stomach for best absorption. Not for evening use.',
  },
  {
    name: "Lion's Mane",
    category: 'Adaptogen',
    bestTime: 'morning',
    mealTiming: 'either',
    takeWith: ['Morning coffee or tea', 'Other nootropics (pairs well with L-theanine)'],
    avoidWith: ['Blood thinners (mild anticoagulant properties)'],
    dosageRange: '500–3,000 mg/day (fruiting body extract)',
    absorptionNotes: 'Can take any time, but morning is ideal for cognitive benefits. Fruiting body extract > mycelium-on-grain.',
  },

  // ── AMINO ACIDS ───────────────────────────────────────────────
  {
    name: 'L-Theanine',
    category: 'Amino Acid',
    bestTime: 'any',
    mealTiming: 'empty stomach',
    takeWith: ['Coffee/caffeine (smooth focus without jitters)', 'Magnesium (synergy for calm)'],
    avoidWith: ['Blood pressure medication (may enhance effect)'],
    dosageRange: '100–400 mg/day',
    absorptionNotes: 'Fast-acting (30 min). Great with morning coffee for calm alertness. Also good at bedtime for sleep.',
  },
  {
    name: 'Creatine Monohydrate',
    category: 'Amino Acid',
    bestTime: 'any',
    mealTiming: 'with food',
    exerciseTiming: 'post-workout',
    takeWith: ['Carbohydrate-containing meal (insulin drives uptake)', 'Post-workout shake'],
    avoidWith: ['Caffeine (may slightly reduce uptake — controversial)'],
    dosageRange: '3–5 g/day (no loading phase needed)',
    absorptionNotes: 'Most researched sports supplement. Take daily — timing is less important than consistency. Dissolve fully in water.',
    bloodTypeNotes: {
      O: 'Type O: pair with post-workout protein meal. Excellent for Type O intense training.',
      B: 'Type B: take with rice or oat-based meal post-exercise.',
    },
  },
  {
    name: 'Collagen Peptides',
    category: 'Amino Acid',
    bestTime: 'morning',
    mealTiming: 'either',
    takeWith: ['Vitamin C (required for collagen synthesis)', 'Morning coffee or smoothie'],
    avoidWith: ['Nothing significant — very safe'],
    dosageRange: '10–20 g/day (hydrolyzed)',
    absorptionNotes: 'Hydrolyzed form absorbs well. MUST pair with vitamin C for your body to actually use it. Type I & III for skin, Type II for joints.',
  },

  // ── OMEGA-3 / ESSENTIAL FATS ──────────────────────────────────
  {
    name: 'Omega-3 Fish Oil',
    category: 'Essential Fat',
    bestTime: 'morning',
    mealTiming: 'with food',
    takeWith: ['Largest fatty meal of the day', 'Vitamin E (prevents oxidation)'],
    avoidWith: ['Blood thinners (increases bleeding risk at >3g/day)', 'Before surgery (stop 2 weeks prior)'],
    dosageRange: '1,000–3,000 mg EPA+DHA combined/day',
    absorptionNotes: 'Take with fattiest meal for 3x better absorption. Freeze capsules to prevent fishy burps. Triglyceride form > ethyl ester.',
    bloodTypeNotes: {
      O: 'Type O: essential for anti-inflammatory support. Pair with morning protein meal.',
      A: 'Type A: especially important on plant-heavy diet. Consider algae-based omega-3 if avoiding fish.',
      B: 'Type B: salmon and sardines provide natural omega-3. Supplement if not eating 2-3x/week.',
    },
  },

  // ── PROBIOTICS ────────────────────────────────────────────────
  {
    name: 'Probiotics',
    category: 'Gut Health',
    bestTime: 'morning',
    mealTiming: 'empty stomach',
    takeWith: ['First thing in morning, 30 min before food', 'Prebiotic fiber (feeds the bacteria)'],
    avoidWith: ['Hot beverages (kills bacteria)', 'Antibiotics (take 2hr apart)'],
    dosageRange: '10–50 billion CFU/day (multi-strain)',
    absorptionNotes: 'Survive stomach acid best on empty stomach or with low-acid food. Refrigerated strains are generally higher quality. Saccharomyces boulardii is antibiotic-resistant.',
    bloodTypeNotes: {
      A: 'Type A: gut health is critical for A immune system. Prioritize Lactobacillus strains.',
      B: 'Type B: kefir is a natural probiotic food. Supplement if not consuming fermented foods.',
      AB: 'Type AB: gut health directly affects AB digestion. Kefir + supplemental probiotics recommended.',
    },
  },
];

// ─── Lookup Functions ───────────────────────────────────────────────────────

/**
 * Get timing info for a specific supplement
 */
export function getSupplementTiming(name: string): SupplementTiming | null {
  const lower = name.toLowerCase();
  return SUPPLEMENT_TIMING.find(s =>
    s.name.toLowerCase().includes(lower) ||
    lower.includes(s.name.toLowerCase().split(' ')[0])
  ) || null;
}

/**
 * Get all supplements for a specific time of day
 */
export function getSupplementsByTime(time: SupplementTiming['bestTime']): SupplementTiming[] {
  return SUPPLEMENT_TIMING.filter(s => s.bestTime === time);
}

/**
 * Get a full daily schedule organized by time
 */
export function getDailySupplementSchedule(): Record<string, SupplementTiming[]> {
  const schedule: Record<string, SupplementTiming[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    bedtime: [],
    any: [],
  };
  for (const s of SUPPLEMENT_TIMING) {
    schedule[s.bestTime].push(s);
  }
  return schedule;
}

/**
 * Check for supplement-supplement timing conflicts
 */
export function checkSupplementConflicts(
  supplements: string[],
): Array<{ supplement1: string; supplement2: string; conflict: string }> {
  const conflicts: Array<{ supplement1: string; supplement2: string; conflict: string }> = [];
  const entries = supplements.map(s => ({
    name: s,
    data: getSupplementTiming(s),
  })).filter(e => e.data);

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      if (!a.data || !b.data) continue;

      // Check if A should avoid B
      if (a.data.avoidWith?.some(av => av.toLowerCase().includes(b.name.toLowerCase()))) {
        conflicts.push({
          supplement1: a.name,
          supplement2: b.name,
          conflict: a.data.avoidWith.find(av => av.toLowerCase().includes(b.name.toLowerCase())) || 'timing conflict',
        });
      }
      // Check if B should avoid A
      if (b.data.avoidWith?.some(av => av.toLowerCase().includes(a.name.toLowerCase()))) {
        conflicts.push({
          supplement1: b.name,
          supplement2: a.name,
          conflict: b.data.avoidWith.find(av => av.toLowerCase().includes(a.name.toLowerCase())) || 'timing conflict',
        });
      }
    }
  }

  return conflicts;
}

/**
 * Get blood-type-specific notes for a supplement
 */
export function getSupplementBloodTypeNote(supplementName: string, bloodType: string): string | null {
  const timing = getSupplementTiming(supplementName);
  if (!timing?.bloodTypeNotes) return null;
  const bt = bloodType.replace(/[+-]/, '').toUpperCase();
  return timing.bloodTypeNotes[bt] || null;
}

/** Total supplement count */
export const SUPPLEMENT_COUNT = SUPPLEMENT_TIMING.length;

/** Get all supplement categories */
export function getSupplementCategories(): string[] {
  return [...new Set(SUPPLEMENT_TIMING.map(s => s.category))];
}

/** Get all supplements */
export function getAllSupplements(): SupplementTiming[] {
  return SUPPLEMENT_TIMING;
}
