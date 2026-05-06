/**
 * Vercel Serverless Function — NIH Dietary Supplement Label Database Proxy
 * 
 * Searches the NIH DSLD for supplement products, ingredients, and brands.
 * 100% free, US government data, no API key required.
 * 
 * GET /api/supplements/search?q=ashwagandha&type=ingredient
 * GET /api/supplements/search?q=vitamin+D&type=product
 */

export const config = {
  runtime: 'edge',
};

const DSLD_BASE = 'https://dsld.od.nih.gov/api/v1';

export default async function handler(req) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const type = url.searchParams.get('type') || 'ingredient'; // ingredient | product | brand
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 25);

  if (!query) {
    return jsonResponse({
      success: false,
      error: 'Query parameter "q" is required',
    }, 400);
  }

  try {
    let apiUrl;
    
    if (type === 'ingredient') {
      // Search ingredients
      apiUrl = `${DSLD_BASE}/ingredient?name=${encodeURIComponent(query)}&rows=${limit}`;
    } else if (type === 'product') {
      // Search products
      apiUrl = `${DSLD_BASE}/label?name=${encodeURIComponent(query)}&rows=${limit}`;
    } else if (type === 'brand') {
      // Search by brand
      apiUrl = `${DSLD_BASE}/label?brand=${encodeURIComponent(query)}&rows=${limit}`;
    } else {
      return jsonResponse({ success: false, error: 'Invalid type. Use: ingredient, product, brand' }, 400);
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MealPlanAssistant/1.0 (info@newmindsgroup.com)',
      },
    });

    if (!response.ok) {
      // Fallback: return curated data from our built-in database
      return jsonResponse({
        success: true,
        source: 'built-in',
        message: 'Using built-in supplement reference data',
        data: getBuiltInSupplementData(query),
      });
    }

    const data = await response.json();
    
    return jsonResponse({
      success: true,
      source: 'dsld',
      totalResults: data.totalResults || data.length || 0,
      data: Array.isArray(data) ? data.slice(0, limit) : data,
    });
  } catch (error) {
    console.error('[Supplement Proxy Error]', error);
    // Graceful fallback to built-in data
    return jsonResponse({
      success: true,
      source: 'built-in',
      message: 'Using built-in supplement reference data',
      data: getBuiltInSupplementData(query),
    });
  }
}

/**
 * Built-in supplement reference data for common supplements
 * Used as fallback when DSLD API is unavailable
 */
function getBuiltInSupplementData(query) {
  const q = query.toLowerCase();
  const matches = SUPPLEMENT_REFERENCE.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.aliases.some(a => a.toLowerCase().includes(q)) ||
    s.category.toLowerCase().includes(q)
  );
  return matches.length > 0 ? matches : [];
}

const SUPPLEMENT_REFERENCE = [
  // ── Adaptogens ──────────────────────────────────────────────────────
  {
    name: 'Ashwagandha',
    aliases: ['Withania somnifera', 'Indian Ginseng', 'KSM-66'],
    category: 'Adaptogen',
    primaryUses: ['Stress reduction', 'Cortisol regulation', 'Sleep quality', 'Muscle recovery'],
    dosage: { typical: '300-600mg', form: 'Root extract (standardized to withanolides)' },
    timing: 'Evening or with meals',
    evidenceLevel: 'Strong — multiple RCTs support cortisol reduction and anxiety relief',
    interactions: ['Thyroid medications', 'Sedatives', 'Immunosuppressants'],
    bloodTypeNotes: { O: 'Well tolerated', A: 'Start with lower dose', B: 'Well tolerated' },
    pubmedTerms: 'ashwagandha AND (cortisol OR stress OR anxiety)',
  },
  {
    name: 'Rhodiola Rosea',
    aliases: ['Golden Root', 'Arctic Root', 'Roseroot'],
    category: 'Adaptogen',
    primaryUses: ['Mental fatigue', 'Physical endurance', 'Stress resilience', 'Focus'],
    dosage: { typical: '200-600mg', form: 'Root extract (3% rosavins, 1% salidroside)' },
    timing: 'Morning on empty stomach',
    evidenceLevel: 'Moderate — evidence for fatigue reduction and mild depression',
    interactions: ['Antidepressants (SSRIs)', 'Blood thinners', 'Stimulants'],
    pubmedTerms: 'rhodiola AND (fatigue OR cognitive OR stress)',
  },
  {
    name: 'Holy Basil (Tulsi)',
    aliases: ['Ocimum sanctum', 'Tulsi', 'Sacred Basil'],
    category: 'Adaptogen',
    primaryUses: ['Stress relief', 'Blood sugar regulation', 'Anti-inflammatory', 'Immune support'],
    dosage: { typical: '300-600mg', form: 'Leaf extract' },
    timing: 'Twice daily with meals',
    evidenceLevel: 'Moderate — traditional use supported by emerging clinical evidence',
    interactions: ['Blood thinners', 'Diabetes medications', 'Fertility treatments'],
    pubmedTerms: 'tulsi OR "holy basil" AND (stress OR glucose)',
  },

  // ── Nootropics & Brain Health ───────────────────────────────────────
  {
    name: "Lion's Mane Mushroom",
    aliases: ['Hericium erinaceus', 'Yamabushitake', 'Lions Mane'],
    category: 'Nootropic / Mushroom',
    primaryUses: ['Nerve growth factor (NGF)', 'Cognitive function', 'Memory', 'Neuroprotection'],
    dosage: { typical: '500-3000mg', form: 'Fruiting body or dual extract' },
    timing: 'Morning with food',
    evidenceLevel: 'Moderate — promising human trials for cognitive improvement',
    interactions: ['Blood thinners', 'Diabetes medications'],
    pubmedTerms: '"hericium erinaceus" AND (cognitive OR NGF OR memory)',
  },
  {
    name: 'Bacopa Monnieri',
    aliases: ['Brahmi', 'Water Hyssop', 'Bacopa'],
    category: 'Nootropic',
    primaryUses: ['Memory consolidation', 'Learning', 'Anxiety reduction', 'Attention'],
    dosage: { typical: '300-450mg', form: 'Extract standardized to 55% bacosides' },
    timing: 'With fat-containing meal (fat-soluble)',
    evidenceLevel: 'Strong — well-studied in multiple RCTs for memory',
    interactions: ['Thyroid medications', 'Sedatives', 'Anticholinergics'],
    pubmedTerms: '"bacopa monnieri" AND (memory OR cognitive OR learning)',
  },
  {
    name: 'L-Theanine',
    aliases: ['Theanine', 'γ-glutamylethylamide'],
    category: 'Nootropic / Amino Acid',
    primaryUses: ['Calm focus', 'Anxiety reduction', 'Sleep quality', 'Synergy with caffeine'],
    dosage: { typical: '100-200mg', form: 'L-theanine capsule or powder' },
    timing: 'Morning with coffee or evening for sleep',
    evidenceLevel: 'Strong — well-established for relaxation without sedation',
    interactions: ['Blood pressure medications'],
    pubmedTerms: 'L-theanine AND (anxiety OR focus OR sleep)',
  },

  // ── Vitamins ────────────────────────────────────────────────────────
  {
    name: 'Vitamin D3',
    aliases: ['Cholecalciferol', 'Vitamin D', 'D3'],
    category: 'Vitamin',
    primaryUses: ['Bone health', 'Immune function', 'Mood regulation', 'Muscle function'],
    dosage: { typical: '1000-5000 IU', form: 'D3 (cholecalciferol) with K2' },
    timing: 'With fatty meal for absorption',
    evidenceLevel: 'Very Strong — deficiency linked to multiple diseases',
    interactions: ['Steroids', 'Cholesterol medications', 'Calcium supplements'],
    pubmedTerms: 'vitamin D AND (deficiency OR immune OR bone)',
  },
  {
    name: 'Vitamin B12',
    aliases: ['Cobalamin', 'Methylcobalamin', 'Cyanocobalamin', 'B12'],
    category: 'Vitamin',
    primaryUses: ['Energy metabolism', 'Nerve health', 'Red blood cell formation', 'DNA synthesis'],
    dosage: { typical: '500-1000mcg', form: 'Methylcobalamin (sublingual preferred)' },
    timing: 'Morning on empty stomach',
    evidenceLevel: 'Very Strong — essential, especially for vegans/vegetarians',
    interactions: ['Metformin', 'Proton pump inhibitors', 'H2 blockers'],
    bloodTypeNotes: { A: 'Type A often deficient — supplement recommended' },
    pubmedTerms: 'vitamin B12 AND (deficiency OR neuropathy OR anemia)',
  },
  {
    name: 'Folate',
    aliases: ['Vitamin B9', 'Folic Acid', 'Methylfolate', '5-MTHF'],
    category: 'Vitamin',
    primaryUses: ['DNA synthesis', 'Cell division', 'Neural tube development', 'Homocysteine metabolism'],
    dosage: { typical: '400-800mcg', form: 'Methylfolate (5-MTHF) preferred over folic acid' },
    timing: 'Morning with food',
    evidenceLevel: 'Very Strong — essential for pregnancy, cardiovascular health',
    interactions: ['Methotrexate', 'Anti-seizure medications', 'NSAIDs'],
    pubmedTerms: 'folate OR methylfolate AND (deficiency OR homocysteine)',
  },

  // ── Minerals ────────────────────────────────────────────────────────
  {
    name: 'Magnesium Glycinate',
    aliases: ['Magnesium', 'Mag Glycinate', 'Chelated Magnesium'],
    category: 'Mineral',
    primaryUses: ['Sleep quality', 'Muscle relaxation', 'Stress relief', 'Heart rhythm'],
    dosage: { typical: '200-400mg elemental', form: 'Glycinate (best absorbed, least GI distress)' },
    timing: 'Evening, 30-60 min before bed',
    evidenceLevel: 'Strong — 50%+ of population is deficient',
    interactions: ['Antibiotics', 'Bisphosphonates', 'Diuretics'],
    pubmedTerms: 'magnesium AND (sleep OR anxiety OR deficiency)',
  },
  {
    name: 'Zinc',
    aliases: ['Zinc Picolinate', 'Zinc Citrate', 'Zn'],
    category: 'Mineral',
    primaryUses: ['Immune function', 'Wound healing', 'Testosterone production', 'Taste/smell'],
    dosage: { typical: '15-30mg', form: 'Zinc picolinate or citrate' },
    timing: 'With food to avoid nausea; separate from iron supplements',
    evidenceLevel: 'Strong — essential trace mineral with broad evidence',
    interactions: ['Antibiotics', 'Penicillamine', 'Iron supplements (take separately)'],
    pubmedTerms: 'zinc AND (immune OR testosterone OR deficiency)',
  },
  {
    name: 'Selenium',
    aliases: ['Selenomethionine', 'Se'],
    category: 'Mineral',
    primaryUses: ['Thyroid function', 'Antioxidant defense', 'Immune support', 'Fertility'],
    dosage: { typical: '55-200mcg', form: 'Selenomethionine' },
    timing: 'With meals',
    evidenceLevel: 'Moderate — important for thyroid, narrow therapeutic window',
    interactions: ['Blood thinners', 'Cholesterol medications'],
    pubmedTerms: 'selenium AND (thyroid OR antioxidant)',
  },

  // ── Omega-3 & Essential Fats ────────────────────────────────────────
  {
    name: 'Omega-3 Fish Oil',
    aliases: ['EPA', 'DHA', 'Fish Oil', 'Omega-3'],
    category: 'Essential Fat',
    primaryUses: ['Heart health', 'Brain function', 'Anti-inflammatory', 'Joint health', 'Mood'],
    dosage: { typical: '1000-3000mg EPA+DHA', form: 'Triglyceride form (better absorbed)' },
    timing: 'With fatty meal',
    evidenceLevel: 'Very Strong — extensive cardiovascular and cognitive evidence',
    interactions: ['Blood thinners', 'Blood pressure medications'],
    pubmedTerms: 'omega-3 AND (cardiovascular OR cognitive OR inflammation)',
  },

  // ── Gut Health ──────────────────────────────────────────────────────
  {
    name: 'Probiotics',
    aliases: ['Lactobacillus', 'Bifidobacterium', 'Probiotic'],
    category: 'Gut Health',
    primaryUses: ['Gut microbiome', 'Immune function', 'Digestion', 'Mental health (gut-brain axis)'],
    dosage: { typical: '10-50 billion CFU', form: 'Multi-strain with delayed-release capsule' },
    timing: 'Morning on empty stomach or before bed',
    evidenceLevel: 'Moderate-Strong — strain-specific evidence varies',
    interactions: ['Immunosuppressants', 'Antibiotics (take 2hrs apart)'],
    pubmedTerms: 'probiotics AND (gut microbiome OR immune OR IBS)',
  },

  // ── Anti-Inflammatory / Herbs ───────────────────────────────────────
  {
    name: 'Turmeric / Curcumin',
    aliases: ['Curcuma longa', 'Curcumin', 'Turmeric Extract'],
    category: 'Anti-inflammatory / Herb',
    primaryUses: ['Inflammation reduction', 'Joint pain', 'Antioxidant', 'Liver support'],
    dosage: { typical: '500-1000mg curcumin', form: 'With piperine/black pepper for absorption' },
    timing: 'With meals',
    evidenceLevel: 'Strong — well-documented anti-inflammatory effects',
    interactions: ['Blood thinners', 'Diabetes medications', 'Iron supplements'],
    pubmedTerms: 'curcumin AND (inflammation OR arthritis OR antioxidant)',
  },
  {
    name: 'Ginger',
    aliases: ['Zingiber officinale', 'Ginger Root', 'Ginger Extract'],
    category: 'Anti-inflammatory / Herb',
    primaryUses: ['Nausea relief', 'Anti-inflammatory', 'Digestion', 'Muscle soreness'],
    dosage: { typical: '250-1000mg', form: 'Dried ginger extract or fresh root' },
    timing: 'Before or with meals',
    evidenceLevel: 'Strong — well-established for nausea and inflammation',
    interactions: ['Blood thinners', 'Diabetes medications'],
    pubmedTerms: 'ginger AND (nausea OR inflammation OR muscle)',
  },
  {
    name: 'Berberine',
    aliases: ['Berberine HCl', 'Chinese Goldthread'],
    category: 'Metabolic / Herb',
    primaryUses: ['Blood sugar regulation', 'Cholesterol support', 'Gut health', 'AMPK activation'],
    dosage: { typical: '500mg 2-3x/day', form: 'Berberine HCl' },
    timing: 'With meals',
    evidenceLevel: 'Strong — comparable to metformin in some studies',
    interactions: ['Diabetes medications', 'Blood pressure drugs', 'Cyclosporine', 'Antibiotics'],
    pubmedTerms: 'berberine AND (glucose OR cholesterol OR AMPK)',
  },

  // ── Sleep ───────────────────────────────────────────────────────────
  {
    name: 'Melatonin',
    aliases: ['N-acetyl-5-methoxytryptamine'],
    category: 'Sleep',
    primaryUses: ['Sleep onset', 'Circadian rhythm', 'Jet lag', 'Antioxidant'],
    dosage: { typical: '0.5-3mg', form: 'Sublingual or extended-release' },
    timing: '30-60 minutes before bed',
    evidenceLevel: 'Strong — well-established for sleep onset, less for maintenance',
    interactions: ['Blood thinners', 'Immunosuppressants', 'Diabetes medications', 'Sedatives'],
    pubmedTerms: 'melatonin AND (sleep OR circadian OR insomnia)',
  },

  // ── Immune Support ──────────────────────────────────────────────────
  {
    name: 'Elderberry',
    aliases: ['Sambucus nigra', 'Sambucol'],
    category: 'Immune / Herb',
    primaryUses: ['Cold/flu prevention', 'Immune modulation', 'Antiviral', 'Antioxidant'],
    dosage: { typical: '500-1000mg', form: 'Standardized berry extract' },
    timing: 'Daily during cold season or at symptom onset',
    evidenceLevel: 'Moderate — reduced cold/flu duration in some trials',
    interactions: ['Immunosuppressants', 'Diuretics', 'Diabetes medications'],
    pubmedTerms: 'elderberry OR sambucus AND (immune OR influenza OR cold)',
  },
  {
    name: 'Echinacea',
    aliases: ['Echinacea purpurea', 'Purple Coneflower'],
    category: 'Immune / Herb',
    primaryUses: ['Cold prevention', 'Immune stimulation', 'Upper respiratory infections'],
    dosage: { typical: '300-500mg', form: 'Standardized extract (aerial parts + root)' },
    timing: 'At first sign of illness, 3x daily for 7-10 days',
    evidenceLevel: 'Mixed — some evidence for cold duration reduction',
    interactions: ['Immunosuppressants', 'Liver-metabolized drugs'],
    pubmedTerms: 'echinacea AND (cold OR immune OR respiratory)',
  },

  // ── Joint & Connective Tissue ───────────────────────────────────────
  {
    name: 'Collagen Peptides',
    aliases: ['Hydrolyzed Collagen', 'Type I/III Collagen', 'Collagen'],
    category: 'Joint / Connective Tissue',
    primaryUses: ['Joint health', 'Skin elasticity', 'Gut lining', 'Bone density'],
    dosage: { typical: '10-15g', form: 'Hydrolyzed collagen peptides (Type I/III)' },
    timing: 'Morning in coffee/smoothie or evening',
    evidenceLevel: 'Moderate — growing evidence for skin and joint benefits',
    interactions: ['Generally safe; may affect calcium absorption'],
    pubmedTerms: 'collagen peptides AND (joint OR skin OR bone)',
  },
  {
    name: 'Glucosamine & Chondroitin',
    aliases: ['Glucosamine Sulfate', 'Chondroitin Sulfate'],
    category: 'Joint',
    primaryUses: ['Osteoarthritis', 'Joint cartilage', 'Joint pain reduction'],
    dosage: { typical: '1500mg glucosamine + 1200mg chondroitin', form: 'Sulfate forms' },
    timing: 'With meals, may take 4-8 weeks to notice effects',
    evidenceLevel: 'Moderate — mixed results, some benefit for knee OA',
    interactions: ['Blood thinners (especially chondroitin)', 'Diabetes medications'],
    pubmedTerms: 'glucosamine AND chondroitin AND (osteoarthritis OR joint)',
  },

  // ── Mushroom Extracts ───────────────────────────────────────────────
  {
    name: 'Reishi Mushroom',
    aliases: ['Ganoderma lucidum', 'Lingzhi', 'Reishi'],
    category: 'Mushroom / Adaptogen',
    primaryUses: ['Immune modulation', 'Sleep support', 'Stress relief', 'Longevity'],
    dosage: { typical: '1000-3000mg', form: 'Dual extract (hot water + alcohol)' },
    timing: 'Evening with food',
    evidenceLevel: 'Moderate — long history of traditional use, emerging clinical data',
    interactions: ['Blood thinners', 'Blood pressure medications', 'Immunosuppressants'],
    pubmedTerms: '"ganoderma lucidum" AND (immune OR sleep OR adaptogen)',
  },
  {
    name: 'Cordyceps',
    aliases: ['Cordyceps militaris', 'Cordyceps sinensis', 'Caterpillar Fungus'],
    category: 'Mushroom / Performance',
    primaryUses: ['Athletic performance', 'Energy', 'Oxygen utilization', 'Lung function'],
    dosage: { typical: '1000-3000mg', form: 'Cordyceps militaris fruiting body extract' },
    timing: 'Morning or pre-workout',
    evidenceLevel: 'Moderate — some evidence for VO2 max and exercise performance',
    interactions: ['Blood thinners', 'Immunosuppressants', 'Diabetes medications'],
    pubmedTerms: 'cordyceps AND (exercise OR performance OR oxygen)',
  },
];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
