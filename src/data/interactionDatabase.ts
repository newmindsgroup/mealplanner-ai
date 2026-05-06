/**
 * Supplement-Drug Interaction Database
 *
 * Built-in database covering critical supplement-drug interactions.
 * Includes CYP450 pathway data, severity levels, and clinical recommendations.
 *
 * MEDICAL DISCLAIMER: This is for educational purposes only.
 * Always consult a healthcare professional before combining supplements with medications.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Interaction {
  supplement: string;
  drug: string;
  drugClass: string;
  severity: 'major' | 'moderate' | 'minor';
  mechanism: string;
  effect: string;
  recommendation: string;
  cyp450?: string;       // CYP enzyme pathway involved
  pmid?: string;         // PubMed reference
}

export interface InteractionResult {
  found: boolean;
  interactions: Interaction[];
  disclaimer: string;
}

// ─── Interaction Database ───────────────────────────────────────────────────

const INTERACTIONS: Interaction[] = [
  // ── Blood Thinners (Anticoagulants) ─────────────────────────────────────
  {
    supplement: 'omega-3',
    drug: 'warfarin',
    drugClass: 'Anticoagulant',
    severity: 'major',
    mechanism: 'Omega-3 fatty acids inhibit platelet aggregation, adding to anticoagulant effect',
    effect: 'Increased bleeding risk',
    recommendation: 'If taking >3g/day EPA+DHA with warfarin, monitor INR closely. Inform your doctor.',
    pmid: '15280904',
  },
  {
    supplement: 'turmeric',
    drug: 'warfarin',
    drugClass: 'Anticoagulant',
    severity: 'major',
    mechanism: 'Curcumin inhibits platelet aggregation and may inhibit CYP2C9 (warfarin metabolism)',
    effect: 'Increased bleeding risk, elevated INR',
    recommendation: 'Avoid high-dose curcumin supplements with warfarin. Culinary turmeric in food is generally safe.',
    cyp450: 'CYP2C9 inhibitor',
    pmid: '22531131',
  },
  {
    supplement: 'ginger',
    drug: 'warfarin',
    drugClass: 'Anticoagulant',
    severity: 'moderate',
    mechanism: 'Ginger inhibits thromboxane synthase, reducing platelet aggregation',
    effect: 'May increase bleeding risk at high doses',
    recommendation: 'Moderate culinary use is generally safe. Avoid concentrated ginger supplements >4g/day with anticoagulants.',
    pmid: '17309383',
  },
  {
    supplement: 'ginkgo biloba',
    drug: 'warfarin',
    drugClass: 'Anticoagulant',
    severity: 'major',
    mechanism: 'Ginkgolide B is a potent platelet-activating factor (PAF) antagonist',
    effect: 'Increased bleeding risk, reported cases of hemorrhage',
    recommendation: 'AVOID combining ginkgo with any blood thinners. Multiple case reports of bleeding events.',
    cyp450: 'CYP3A4 inducer',
    pmid: '15930096',
  },
  {
    supplement: 'vitamin e',
    drug: 'warfarin',
    drugClass: 'Anticoagulant',
    severity: 'moderate',
    mechanism: 'Vitamin E has antiplatelet properties at high doses (>400 IU/day)',
    effect: 'May increase anticoagulant effect',
    recommendation: 'Keep vitamin E below 400 IU/day. Monitor INR if supplementing.',
    pmid: '15585762',
  },
  {
    supplement: 'garlic',
    drug: 'warfarin',
    drugClass: 'Anticoagulant',
    severity: 'moderate',
    mechanism: 'Garlic inhibits platelet aggregation via ajoene and other compounds',
    effect: 'Increased bleeding risk',
    recommendation: 'Culinary garlic is safe in normal amounts. Avoid garlic supplements (aged garlic extract) with blood thinners.',
    pmid: '16484551',
  },

  // ── Diabetes Medications ────────────────────────────────────────────────
  {
    supplement: 'berberine',
    drug: 'metformin',
    drugClass: 'Antidiabetic',
    severity: 'moderate',
    mechanism: 'Both activate AMPK pathway and lower blood glucose independently',
    effect: 'Risk of hypoglycemia (dangerously low blood sugar)',
    recommendation: 'If combining, monitor blood sugar carefully. Start berberine at low dose (500mg/day). Inform your doctor.',
    pmid: '18442638',
  },
  {
    supplement: 'chromium',
    drug: 'metformin',
    drugClass: 'Antidiabetic',
    severity: 'minor',
    mechanism: 'Chromium enhances insulin sensitivity',
    effect: 'May potentiate glucose-lowering effects',
    recommendation: 'Generally safe at standard doses (200-400mcg). Monitor blood sugar more frequently.',
    pmid: '17109600',
  },
  {
    supplement: 'alpha-lipoic acid',
    drug: 'insulin',
    drugClass: 'Antidiabetic',
    severity: 'moderate',
    mechanism: 'ALA improves glucose uptake and insulin sensitivity',
    effect: 'Risk of hypoglycemia',
    recommendation: 'Monitor blood sugar closely. May need insulin dose adjustment with healthcare provider.',
    pmid: '21751149',
  },
  {
    supplement: 'cinnamon',
    drug: 'metformin',
    drugClass: 'Antidiabetic',
    severity: 'minor',
    mechanism: 'Cinnamon may improve insulin sensitivity and lower fasting glucose',
    effect: 'Additive glucose-lowering',
    recommendation: 'Generally safe at standard doses (1-6g/day). Monitor blood sugar.',
    pmid: '14633804',
  },

  // ── Thyroid Medications ─────────────────────────────────────────────────
  {
    supplement: 'iron',
    drug: 'levothyroxine',
    drugClass: 'Thyroid hormone',
    severity: 'major',
    mechanism: 'Iron binds to levothyroxine in the GI tract, preventing absorption',
    effect: 'Reduced thyroid medication effectiveness',
    recommendation: 'Take iron supplements at least 4 HOURS apart from levothyroxine. Morning thyroid med, evening iron.',
    pmid: '1551842',
  },
  {
    supplement: 'calcium',
    drug: 'levothyroxine',
    drugClass: 'Thyroid hormone',
    severity: 'major',
    mechanism: 'Calcium forms insoluble complex with levothyroxine',
    effect: 'Reduced thyroid medication absorption by up to 50%',
    recommendation: 'Separate by at least 4 HOURS. Take thyroid med first thing in morning, calcium with lunch/dinner.',
    pmid: '10738111',
  },
  {
    supplement: 'ashwagandha',
    drug: 'levothyroxine',
    drugClass: 'Thyroid hormone',
    severity: 'moderate',
    mechanism: 'Ashwagandha may stimulate thyroid hormone production (T3/T4)',
    effect: 'May cause hyperthyroid symptoms when combined with thyroid medication',
    recommendation: 'Use only under medical supervision. May require thyroid medication dose adjustment.',
    pmid: '28829155',
  },
  {
    supplement: 'kelp',
    drug: 'levothyroxine',
    drugClass: 'Thyroid hormone',
    severity: 'moderate',
    mechanism: 'Kelp contains high iodine which affects thyroid hormone synthesis',
    effect: 'Unpredictable thyroid function — can cause hyper or hypothyroidism',
    recommendation: 'Avoid kelp/seaweed supplements with thyroid medications. Dietary seaweed in moderation is usually OK.',
    pmid: '16571087',
  },

  // ── SSRIs / Antidepressants ─────────────────────────────────────────────
  {
    supplement: 'st johns wort',
    drug: 'sertraline',
    drugClass: 'SSRI Antidepressant',
    severity: 'major',
    mechanism: 'St. John\'s Wort is a potent CYP3A4 and P-glycoprotein inducer; also has serotonergic activity',
    effect: 'Serotonin syndrome risk (potentially fatal); reduced drug effectiveness',
    recommendation: 'NEVER combine St. John\'s Wort with SSRIs. This is a dangerous interaction with risk of serotonin syndrome.',
    cyp450: 'CYP3A4 inducer, CYP2C9 inducer',
    pmid: '10817750',
  },
  {
    supplement: '5-htp',
    drug: 'sertraline',
    drugClass: 'SSRI Antidepressant',
    severity: 'major',
    mechanism: '5-HTP is a direct serotonin precursor; SSRIs increase serotonin availability',
    effect: 'Serotonin syndrome risk — agitation, hyperthermia, tachycardia',
    recommendation: 'Do NOT combine 5-HTP with any SSRI/SNRI. Risk of serotonin syndrome.',
    pmid: '15555770',
  },
  {
    supplement: 'same',
    drug: 'sertraline',
    drugClass: 'SSRI Antidepressant',
    severity: 'moderate',
    mechanism: 'SAMe increases serotonin and dopamine levels',
    effect: 'Possible serotonin excess',
    recommendation: 'Use only under psychiatric supervision. May increase side effects.',
    pmid: '15671130',
  },
  {
    supplement: 'rhodiola',
    drug: 'sertraline',
    drugClass: 'SSRI Antidepressant',
    severity: 'minor',
    mechanism: 'Rhodiola may have mild MAO inhibitory activity',
    effect: 'Theoretical risk of increased serotonin',
    recommendation: 'Limited evidence of interaction. Use cautiously and monitor for increased anxiety or agitation.',
  },

  // ── Blood Pressure Medications ──────────────────────────────────────────
  {
    supplement: 'coq10',
    drug: 'lisinopril',
    drugClass: 'ACE Inhibitor',
    severity: 'minor',
    mechanism: 'CoQ10 may lower blood pressure independently',
    effect: 'Additive blood pressure reduction',
    recommendation: 'May need BP medication dose adjustment. Monitor blood pressure closely.',
    pmid: '17287847',
  },
  {
    supplement: 'potassium',
    drug: 'lisinopril',
    drugClass: 'ACE Inhibitor',
    severity: 'major',
    mechanism: 'ACE inhibitors increase potassium retention; adding potassium can cause hyperkalemia',
    effect: 'Dangerously elevated potassium — cardiac arrhythmia risk',
    recommendation: 'Do NOT supplement potassium with ACE inhibitors unless directed by your doctor. Monitor serum potassium.',
    pmid: '16434509',
  },
  {
    supplement: 'magnesium',
    drug: 'amlodipine',
    drugClass: 'Calcium Channel Blocker',
    severity: 'minor',
    mechanism: 'Magnesium has mild calcium-channel blocking activity',
    effect: 'May enhance blood pressure lowering',
    recommendation: 'Generally safe. Monitor blood pressure when starting magnesium supplementation.',
    pmid: '27402922',
  },

  // ── Immunosuppressants ──────────────────────────────────────────────────
  {
    supplement: 'echinacea',
    drug: 'cyclosporine',
    drugClass: 'Immunosuppressant',
    severity: 'major',
    mechanism: 'Echinacea stimulates immune function, directly opposing immunosuppression',
    effect: 'May reduce drug effectiveness, increasing organ rejection risk',
    recommendation: 'AVOID all immune-stimulating herbs with immunosuppressants. This includes echinacea, elderberry, and astragalus.',
    pmid: '15080016',
  },
  {
    supplement: 'reishi',
    drug: 'cyclosporine',
    drugClass: 'Immunosuppressant',
    severity: 'moderate',
    mechanism: 'Reishi modulates immune function (both stimulatory and regulatory)',
    effect: 'Unpredictable effect on immunosuppression',
    recommendation: 'Avoid medicinal mushroom extracts with immunosuppressants unless approved by transplant team.',
  },

  // ── Statins (Cholesterol) ───────────────────────────────────────────────
  {
    supplement: 'red yeast rice',
    drug: 'atorvastatin',
    drugClass: 'Statin',
    severity: 'major',
    mechanism: 'Red yeast rice contains monacolin K (identical to lovastatin)',
    effect: 'Double-dosing statin — increased risk of rhabdomyolysis and liver damage',
    recommendation: 'NEVER combine red yeast rice with prescription statins. It IS a statin.',
    cyp450: 'CYP3A4 substrate',
    pmid: '18363027',
  },
  {
    supplement: 'coq10',
    drug: 'atorvastatin',
    drugClass: 'Statin',
    severity: 'minor',
    mechanism: 'Statins deplete CoQ10; supplementation may reduce statin side effects',
    effect: 'Beneficial interaction — may reduce muscle pain and fatigue',
    recommendation: 'CoQ10 supplementation (100-200mg/day) is often recommended with statins. Discuss with your doctor.',
    pmid: '15295624',
  },
  {
    supplement: 'grapefruit',
    drug: 'atorvastatin',
    drugClass: 'Statin',
    severity: 'major',
    mechanism: 'Grapefruit furanocoumarins irreversibly inhibit CYP3A4 in gut wall',
    effect: 'Dramatically increases statin blood levels — rhabdomyolysis risk',
    recommendation: 'Avoid grapefruit and grapefruit juice with atorvastatin, simvastatin, and lovastatin.',
    cyp450: 'CYP3A4 inhibitor',
    pmid: '22869830',
  },
];

// ─── Lookup Functions ───────────────────────────────────────────────────────

const DRUG_ALIASES: Record<string, string[]> = {
  warfarin: ['coumadin', 'blood thinner', 'anticoagulant'],
  metformin: ['glucophage', 'diabetes medication', 'diabetic med'],
  levothyroxine: ['synthroid', 'thyroid medication', 'thyroid med', 'thyroid pill'],
  sertraline: ['zoloft', 'ssri', 'antidepressant'],
  lisinopril: ['ace inhibitor', 'blood pressure medication', 'bp med'],
  amlodipine: ['norvasc', 'calcium channel blocker'],
  cyclosporine: ['immunosuppressant', 'transplant med'],
  atorvastatin: ['lipitor', 'statin', 'cholesterol medication'],
  insulin: ['insulin'],
};

const SUPPLEMENT_ALIASES: Record<string, string[]> = {
  'omega-3': ['fish oil', 'epa', 'dha', 'omega 3'],
  'turmeric': ['curcumin', 'curcuma'],
  'st johns wort': ["st john's wort", 'st johns', 'hypericum'],
  '5-htp': ['5 htp', '5htp', 'hydroxytryptophan'],
  'same': ['s-adenosylmethionine', 's-adenosyl', 'sam-e'],
  'coq10': ['coenzyme q10', 'ubiquinone', 'ubiquinol'],
  'vitamin e': ['tocopherol'],
  'alpha-lipoic acid': ['ala', 'lipoic acid'],
  'red yeast rice': ['monacolin k'],
};

function normalizeToKey(input: string, aliases: Record<string, string[]>): string[] {
  const lower = input.toLowerCase();
  const matches: string[] = [];
  for (const [key, alts] of Object.entries(aliases)) {
    if (lower.includes(key) || alts.some(a => lower.includes(a))) {
      matches.push(key);
    }
  }
  return matches;
}

/**
 * Check for interactions given a free-text query mentioning supplements and medications
 */
export function checkInteractions(query: string): InteractionResult {
  const suppMatches = normalizeToKey(query, SUPPLEMENT_ALIASES);
  const drugMatches = normalizeToKey(query, DRUG_ALIASES);

  // Also check direct supplement names from the database
  const directSuppMatches = [...new Set(INTERACTIONS.map(i => i.supplement))].filter(s => query.toLowerCase().includes(s));
  const allSupps = [...new Set([...suppMatches, ...directSuppMatches])];

  const directDrugMatches = [...new Set(INTERACTIONS.map(i => i.drug))].filter(d => query.toLowerCase().includes(d));
  const allDrugs = [...new Set([...drugMatches, ...directDrugMatches])];

  // Find matching interactions
  let found: Interaction[] = [];

  if (allSupps.length > 0 && allDrugs.length > 0) {
    // Specific supplement + drug pair
    found = INTERACTIONS.filter(i =>
      allSupps.includes(i.supplement) && allDrugs.includes(i.drug)
    );
  } else if (allSupps.length > 0) {
    // All interactions for a supplement
    found = INTERACTIONS.filter(i => allSupps.includes(i.supplement));
  } else if (allDrugs.length > 0) {
    // All interactions for a drug
    found = INTERACTIONS.filter(i => allDrugs.includes(i.drug));
  }

  return {
    found: found.length > 0,
    interactions: found.sort((a, b) => {
      const order = { major: 0, moderate: 1, minor: 2 };
      return order[a.severity] - order[b.severity];
    }),
    disclaimer: '⚕️ MEDICAL DISCLAIMER: This information is for educational purposes only. Always consult your healthcare provider or pharmacist before combining supplements with medications.',
  };
}

/**
 * Get all interactions for a specific supplement
 */
export function getSupplementInteractions(supplementName: string): Interaction[] {
  const lower = supplementName.toLowerCase();
  return INTERACTIONS.filter(i =>
    i.supplement === lower ||
    Object.entries(SUPPLEMENT_ALIASES).some(([key, alts]) =>
      key === lower || alts.some(a => a === lower)
    ) && INTERACTIONS.some(ii => ii.supplement === Object.entries(SUPPLEMENT_ALIASES).find(([, alts]) => alts.includes(lower))?.[0])
  );
}

/**
 * Get all supplements that interact with a drug class
 */
export function getInteractionsByDrugClass(drugClass: string): Interaction[] {
  return INTERACTIONS.filter(i =>
    i.drugClass.toLowerCase().includes(drugClass.toLowerCase())
  );
}
