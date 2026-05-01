import type { LabEducationContent, LabCategory } from '../types/labs';

// Comprehensive educational content for lab tests
export const labEducationDatabase: Record<string, LabEducationContent> = {
  // ========== COMPLETE BLOOD COUNT (CBC) ==========
  'WBC': {
    testName: 'WBC (White Blood Cell Count)',
    category: 'cbc',
    description: 'Measures the total number of white blood cells in your blood. White blood cells are part of the immune system and help fight infections.',
    purpose: 'Screens for infection, immune system disorders, and blood disorders',
    normalRange: {
      general: '4,000-11,000 cells/mcL',
    },
    highMeans: {
      description: 'Elevated WBC (leukocytosis) may indicate infection, inflammation, or stress',
      causes: ['Bacterial or viral infection', 'Inflammation', 'Leukemia or blood disorders', 'Stress or tissue damage', 'Medications (corticosteroids)', 'Smoking'],
      symptoms: ['Fever', 'Fatigue', 'Body aches', 'Night sweats'],
    },
    lowMeans: {
      description: 'Low WBC (leukopenia) may indicate weakened immune system',
      causes: ['Bone marrow disorders', 'Autoimmune diseases', 'Viral infections', 'Chemotherapy or radiation', 'Nutritional deficiencies', 'HIV/AIDS'],
      symptoms: ['Frequent infections', 'Fatigue', 'Mouth sores', 'Fever'],
    },
    lifestyleFactors: ['Diet rich in vitamins C and E', 'Adequate sleep', 'Stress management', 'Regular exercise', 'Avoid smoking'],
    relatedTests: ['Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils'],
    criticalValues: { high: 30000, low: 2000, unit: 'cells/mcL' },
  },

  'RBC': {
    testName: 'RBC (Red Blood Cell Count)',
    category: 'cbc',
    description: 'Measures the number of red blood cells in your blood. Red blood cells carry oxygen throughout your body.',
    purpose: 'Diagnoses anemia, polycythemia, and monitors blood health',
    normalRange: {
      male: '4.7-6.1 million cells/mcL',
      female: '4.2-5.4 million cells/mcL',
    },
    highMeans: {
      description: 'Elevated RBC (polycythemia) means blood is thicker than normal',
      causes: ['Dehydration', 'Lung disease', 'Heart disease', 'Kidney tumors', 'Smoking', 'Living at high altitude', 'Polycythemia vera'],
      symptoms: ['Headache', 'Dizziness', 'Shortness of breath', 'Blurred vision'],
    },
    lowMeans: {
      description: 'Low RBC indicates anemia - insufficient oxygen delivery to tissues',
      causes: ['Iron deficiency', 'Vitamin B12 or folate deficiency', 'Blood loss', 'Chronic kidney disease', 'Bone marrow disorders', 'Chronic diseases'],
      symptoms: ['Fatigue', 'Weakness', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands and feet'],
    },
    lifestyleFactors: ['Iron-rich foods (red meat, leafy greens)', 'Vitamin B12 and folate', 'Stay hydrated', 'Avoid excessive alcohol'],
    relatedTests: ['Hemoglobin', 'Hematocrit', 'MCV', 'MCH', 'MCHC', 'Iron', 'Ferritin'],
  },

  'Hemoglobin': {
    testName: 'Hemoglobin (Hgb)',
    category: 'cbc',
    description: 'Measures the protein in red blood cells that carries oxygen. Hemoglobin gives blood its red color.',
    purpose: 'Diagnoses and monitors anemia and polycythemia',
    normalRange: {
      male: '13.8-17.2 g/dL',
      female: '12.1-15.1 g/dL',
    },
    highMeans: {
      description: 'High hemoglobin indicates blood is carrying more oxygen than normal',
      causes: ['Living at high altitude', 'Smoking', 'Dehydration', 'Lung or heart disease', 'Polycythemia vera', 'Erythropoietin abuse'],
    },
    lowMeans: {
      description: 'Low hemoglobin (anemia) means insufficient oxygen-carrying capacity',
      causes: ['Iron deficiency', 'Vitamin deficiencies (B12, folate)', 'Blood loss', 'Chronic diseases', 'Kidney disease', 'Bone marrow problems'],
      symptoms: ['Extreme fatigue', 'Weakness', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Chest pain', 'Cold extremities'],
    },
    lifestyleFactors: ['Iron-rich diet', 'Vitamin C helps iron absorption', 'B vitamins', 'Avoid excessive tea/coffee with meals'],
    relatedTests: ['RBC', 'Hematocrit', 'Iron', 'Ferritin', 'Vitamin B12', 'Folate'],
    bloodTypeConcerns: 'Type O individuals may have slightly lower hemoglobin on average; focus on iron-rich proteins beneficial for blood type',
    criticalValues: { high: 20, low: 7, unit: 'g/dL' },
  },

  'Hematocrit': {
    testName: 'Hematocrit (Hct)',
    category: 'cbc',
    description: 'Measures the percentage of blood volume occupied by red blood cells.',
    purpose: 'Evaluates anemia, dehydration, and blood disorders',
    normalRange: {
      male: '38.3-48.6%',
      female: '35.5-44.9%',
    },
    highMeans: {
      description: 'High hematocrit means blood is more concentrated',
      causes: ['Dehydration', 'Polycythemia', 'Lung disease', 'Congenital heart disease', 'Smoking', 'High altitude'],
    },
    lowMeans: {
      description: 'Low hematocrit indicates anemia or blood loss',
      causes: ['Anemia', 'Blood loss', 'Bone marrow problems', 'Leukemia', 'Nutritional deficiencies', 'Kidney disease'],
    },
    lifestyleFactors: ['Adequate hydration', 'Iron-rich foods', 'B vitamins', 'Regular health monitoring'],
    relatedTests: ['Hemoglobin', 'RBC', 'MCV'],
  },

  'Platelets': {
    testName: 'Platelets (Platelet Count)',
    category: 'cbc',
    description: 'Measures the number of platelets in blood. Platelets help blood clot and stop bleeding.',
    purpose: 'Evaluates bleeding and clotting disorders',
    normalRange: {
      general: '150,000-400,000 platelets/mcL',
    },
    highMeans: {
      description: 'High platelets (thrombocytosis) may increase clotting risk',
      causes: ['Iron deficiency', 'Recent blood loss', 'Inflammatory conditions', 'Cancer', 'Bone marrow disorders', 'Post-surgery or trauma'],
      symptoms: ['Usually no symptoms', 'Increased clotting risk', 'Headache', 'Dizziness'],
    },
    lowMeans: {
      description: 'Low platelets (thrombocytopenia) increases bleeding risk',
      causes: ['Viral infections', 'Autoimmune disorders', 'Leukemia', 'Chemotherapy', 'Alcohol abuse', 'Medications', 'Vitamin B12 deficiency'],
      symptoms: ['Easy bruising', 'Prolonged bleeding', 'Nosebleeds', 'Bleeding gums', 'Small red spots on skin (petechiae)'],
    },
    lifestyleFactors: ['Avoid excessive alcohol', 'Vitamin K rich foods', 'Leafy greens', 'Avoid NSAIDs if low'],
    relatedTests: ['PT', 'PTT', 'Bleeding Time', 'Von Willebrand Factor'],
    criticalValues: { high: 1000000, low: 50000, unit: 'platelets/mcL' },
  },

  'MCV': {
    testName: 'MCV (Mean Corpuscular Volume)',
    category: 'cbc',
    description: 'Measures the average size of red blood cells. Helps diagnose the type of anemia.',
    purpose: 'Classifies anemia types based on red blood cell size',
    normalRange: {
      general: '80-100 fL',
    },
    highMeans: {
      description: 'High MCV (macrocytic) means red blood cells are larger than normal',
      causes: ['Vitamin B12 deficiency', 'Folate deficiency', 'Liver disease', 'Alcoholism', 'Hypothyroidism', 'Certain medications'],
    },
    lowMeans: {
      description: 'Low MCV (microcytic) means red blood cells are smaller than normal',
      causes: ['Iron deficiency anemia', 'Thalassemia', 'Chronic disease', 'Lead poisoning'],
    },
    lifestyleFactors: ['B12 and folate rich foods', 'Iron supplementation if deficient', 'Limit alcohol', 'Treat underlying conditions'],
    relatedTests: ['MCH', 'MCHC', 'RDW', 'Iron', 'Ferritin', 'B12', 'Folate'],
  },

  // ========== COMPREHENSIVE METABOLIC PANEL (CMP) ==========
  'Glucose': {
    testName: 'Glucose (Blood Sugar)',
    category: 'cmp',
    description: 'Measures the amount of sugar (glucose) in your blood. Glucose is your body\'s main energy source.',
    purpose: 'Screens for and monitors diabetes and hypoglycemia',
    normalRange: {
      general: 'Fasting: 70-99 mg/dL; Random: <140 mg/dL',
    },
    highMeans: {
      description: 'High glucose (hyperglycemia) indicates diabetes or prediabetes',
      causes: ['Type 1 or Type 2 diabetes', 'Prediabetes', 'Stress', 'Medications (steroids)', 'Pancreatic disease', 'Cushing syndrome'],
      symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow-healing wounds', 'Numbness in extremities'],
    },
    lowMeans: {
      description: 'Low glucose (hypoglycemia) can cause immediate symptoms',
      causes: ['Too much insulin', 'Skipped meals', 'Excessive exercise', 'Alcohol consumption', 'Certain medications', 'Hormonal deficiencies'],
      symptoms: ['Shakiness', 'Sweating', 'Confusion', 'Dizziness', 'Hunger', 'Irritability', 'Heart palpitations'],
    },
    lifestyleFactors: ['Balanced diet with complex carbs', 'Regular exercise', 'Maintain healthy weight', 'Limit refined sugars', 'Consistent meal timing'],
    relatedTests: ['Hemoglobin A1C', 'Insulin', 'C-Peptide', 'Fructosamine'],
    bloodTypeConcerns: 'Type O individuals may benefit from higher protein intake; Type A may do better with plant-based carbs for blood sugar control',
    criticalValues: { high: 400, low: 40, unit: 'mg/dL' },
  },

  'BUN': {
    testName: 'BUN (Blood Urea Nitrogen)',
    category: 'kidney',
    description: 'Measures the amount of urea nitrogen in blood. Urea is a waste product formed in the liver when protein is broken down.',
    purpose: 'Evaluates kidney function and hydration status',
    normalRange: {
      general: '7-20 mg/dL',
    },
    highMeans: {
      description: 'High BUN indicates kidneys may not be removing waste properly',
      causes: ['Kidney disease', 'Dehydration', 'High-protein diet', 'Heart failure', 'GI bleeding', 'Urinary tract obstruction'],
    },
    lowMeans: {
      description: 'Low BUN is usually not concerning',
      causes: ['Low-protein diet', 'Malnutrition', 'Liver disease', 'Overhydration'],
    },
    lifestyleFactors: ['Adequate hydration', 'Moderate protein intake', 'Limit salt', 'Avoid NSAIDs'],
    relatedTests: ['Creatinine', 'eGFR', 'BUN/Creatinine Ratio'],
  },

  'Creatinine': {
    testName: 'Creatinine',
    category: 'kidney',
    description: 'Measures the level of creatinine, a waste product from muscle metabolism. Kidneys filter creatinine from blood.',
    purpose: 'Primary test for kidney function assessment',
    normalRange: {
      male: '0.74-1.35 mg/dL',
      female: '0.59-1.04 mg/dL',
    },
    highMeans: {
      description: 'High creatinine indicates reduced kidney function',
      causes: ['Chronic kidney disease', 'Acute kidney injury', 'Dehydration', 'High muscle mass', 'High meat intake', 'Certain medications'],
      symptoms: ['Fatigue', 'Swelling in legs/ankles', 'Decreased urine output', 'Nausea', 'Confusion'],
    },
    lowMeans: {
      description: 'Low creatinine is usually not concerning',
      causes: ['Low muscle mass', 'Aging', 'Pregnancy', 'Malnutrition'],
    },
    lifestyleFactors: ['Stay hydrated', 'Limit protein if kidneys are impaired', 'Avoid NSAIDs', 'Control blood pressure', 'Manage diabetes'],
    relatedTests: ['BUN', 'eGFR', 'Cystatin C', 'Urinalysis'],
    criticalValues: { high: 10, low: 0, unit: 'mg/dL' },
  },

  'eGFR': {
    testName: 'eGFR (Estimated Glomerular Filtration Rate)',
    category: 'kidney',
    description: 'Estimates how well kidneys are filtering waste from blood. Calculated from creatinine, age, sex, and race.',
    purpose: 'Assesses kidney function and stages chronic kidney disease',
    normalRange: {
      general: '>60 mL/min/1.73m²',
    },
    highMeans: {
      description: 'High eGFR is generally good, indicating normal kidney function',
      causes: ['Normal kidney function', 'Young age', 'Athletes with high muscle mass'],
    },
    lowMeans: {
      description: 'Low eGFR indicates reduced kidney function',
      causes: ['Chronic kidney disease', 'Acute kidney injury', 'Diabetes complications', 'High blood pressure', 'Glomerulonephritis'],
      symptoms: ['Fatigue', 'Poor appetite', 'Swelling', 'Muscle cramps', 'Difficulty concentrating'],
    },
    lifestyleFactors: ['Control blood pressure', 'Manage diabetes', 'Heart-healthy diet', 'Limit salt', 'Stay hydrated', 'Avoid nephrotoxic drugs'],
    relatedTests: ['Creatinine', 'BUN', 'Cystatin C', 'Urinalysis', 'Albumin/Creatinine Ratio'],
    criticalValues: { high: 150, low: 15, unit: 'mL/min/1.73m²' },
  },

  // ========== LIPID PANEL ==========
  'Total Cholesterol': {
    testName: 'Total Cholesterol',
    category: 'lipid',
    description: 'Measures the total amount of cholesterol in blood, including LDL and HDL.',
    purpose: 'Assesses cardiovascular disease risk',
    normalRange: {
      general: '<200 mg/dL (Desirable); 200-239 mg/dL (Borderline High); ≥240 mg/dL (High)',
    },
    highMeans: {
      description: 'High cholesterol increases risk of heart disease and stroke',
      causes: ['High-fat diet', 'Obesity', 'Lack of exercise', 'Genetics', 'Diabetes', 'Hypothyroidism', 'Kidney disease'],
      symptoms: ['Usually no symptoms', 'May lead to chest pain', 'Heart attack', 'Stroke'],
    },
    lowMeans: {
      description: 'Very low cholesterol may affect hormone production',
      causes: ['Malnutrition', 'Malabsorption', 'Hyperthyroidism', 'Liver disease', 'Cancer'],
    },
    lifestyleFactors: ['Heart-healthy diet (less saturated fat)', 'Regular exercise', 'Maintain healthy weight', 'Quit smoking', 'Limit alcohol'],
    relatedTests: ['LDL Cholesterol', 'HDL Cholesterol', 'Triglycerides', 'VLDL', 'Cholesterol/HDL Ratio'],
    bloodTypeConcerns: 'Type O may handle higher fat intake better; Type A may benefit from plant-based fats',
    criticalValues: { high: 300, low: 100, unit: 'mg/dL' },
  },

  'LDL Cholesterol': {
    testName: 'LDL Cholesterol (Bad Cholesterol)',
    category: 'lipid',
    description: 'Low-density lipoprotein carries cholesterol to arteries where it can build up as plaque.',
    purpose: 'Primary target for cardiovascular disease prevention',
    normalRange: {
      general: '<100 mg/dL (Optimal); 100-129 (Near Optimal); 130-159 (Borderline High); ≥160 (High)',
    },
    highMeans: {
      description: 'High LDL leads to plaque buildup in arteries (atherosclerosis)',
      causes: ['Diet high in saturated/trans fats', 'Obesity', 'Inactivity', 'Smoking', 'Genetics', 'Diabetes'],
      symptoms: ['No direct symptoms', 'Increases heart attack and stroke risk'],
    },
    lowMeans: {
      description: 'Lower LDL is generally better for heart health',
      causes: ['Healthy lifestyle', 'Medications (statins)', 'Genetics'],
    },
    lifestyleFactors: ['Limit saturated fats', 'Avoid trans fats', 'Increase fiber', 'Exercise regularly', 'Lose excess weight'],
    relatedTests: ['Total Cholesterol', 'HDL', 'Triglycerides', 'ApoB'],
    criticalValues: { high: 190, low: 0, unit: 'mg/dL' },
  },

  'HDL Cholesterol': {
    testName: 'HDL Cholesterol (Good Cholesterol)',
    category: 'lipid',
    description: 'High-density lipoprotein carries cholesterol away from arteries back to liver for removal.',
    purpose: 'Protective factor against heart disease',
    normalRange: {
      male: '>40 mg/dL',
      female: '>50 mg/dL',
      general: '≥60 mg/dL is protective',
    },
    highMeans: {
      description: 'High HDL is protective against heart disease',
      causes: ['Regular exercise', 'Moderate alcohol', 'Genetics', 'Healthy diet'],
    },
    lowMeans: {
      description: 'Low HDL increases cardiovascular disease risk',
      causes: ['Sedentary lifestyle', 'Obesity', 'Smoking', 'Type 2 diabetes', 'High triglycerides', 'Genetics'],
      symptoms: ['No direct symptoms', 'Increased heart disease risk'],
    },
    lifestyleFactors: ['Regular aerobic exercise', 'Lose excess weight', 'Quit smoking', 'Healthy fats (olive oil, nuts)', 'Limit simple carbs'],
    relatedTests: ['Total Cholesterol', 'LDL', 'Triglycerides', 'Cholesterol/HDL Ratio'],
  },

  'Triglycerides': {
    testName: 'Triglycerides',
    category: 'lipid',
    description: 'Measures the most common type of fat in blood. Body converts excess calories into triglycerides.',
    purpose: 'Assesses cardiovascular disease and metabolic syndrome risk',
    normalRange: {
      general: '<150 mg/dL (Normal); 150-199 (Borderline High); 200-499 (High); ≥500 (Very High)',
    },
    highMeans: {
      description: 'High triglycerides increase heart disease and pancreatitis risk',
      causes: ['Excess calories/carbs', 'Obesity', 'Alcohol abuse', 'Diabetes', 'Kidney disease', 'Hypothyroidism', 'Medications'],
      symptoms: ['Usually no symptoms', 'Very high levels may cause pancreatitis'],
    },
    lowMeans: {
      description: 'Low triglycerides are generally healthy',
      causes: ['Healthy diet', 'Regular exercise', 'Malnutrition', 'Hyperthyroidism'],
    },
    lifestyleFactors: ['Limit simple sugars', 'Reduce refined carbs', 'Limit alcohol', 'Exercise regularly', 'Lose weight if overweight', 'Omega-3 fatty acids'],
    relatedTests: ['Total Cholesterol', 'LDL', 'HDL', 'Glucose', 'A1C'],
    criticalValues: { high: 500, low: 0, unit: 'mg/dL' },
  },

  // ========== THYROID FUNCTION ==========
  'TSH': {
    testName: 'TSH (Thyroid Stimulating Hormone)',
    category: 'thyroid',
    description: 'Measures thyroid-stimulating hormone from pituitary gland. TSH tells thyroid how much hormone to make.',
    purpose: 'Primary screening test for thyroid function',
    normalRange: {
      general: '0.4-4.0 mIU/L',
    },
    highMeans: {
      description: 'High TSH indicates hypothyroidism (underactive thyroid)',
      causes: ['Hashimoto\'s thyroiditis', 'Thyroid removal', 'Iodine deficiency', 'Pituitary tumor', 'Medications'],
      symptoms: ['Fatigue', 'Weight gain', 'Cold sensitivity', 'Constipation', 'Dry skin', 'Hair loss', 'Depression'],
    },
    lowMeans: {
      description: 'Low TSH indicates hyperthyroidism (overactive thyroid)',
      causes: ['Graves\' disease', 'Thyroid nodules', 'Thyroiditis', 'Too much thyroid medication', 'Pituitary disorder'],
      symptoms: ['Weight loss', 'Rapid heartbeat', 'Anxiety', 'Tremors', 'Heat sensitivity', 'Insomnia', 'Frequent bowel movements'],
    },
    lifestyleFactors: ['Adequate iodine intake', 'Selenium-rich foods', 'Manage stress', 'Avoid excessive soy', 'Regular sleep'],
    relatedTests: ['Free T4', 'Free T3', 'Thyroid Peroxidase Antibodies'],
    criticalValues: { high: 10, low: 0.01, unit: 'mIU/L' },
  },

  'Free T4': {
    testName: 'Free T4 (Free Thyroxine)',
    category: 'thyroid',
    description: 'Measures the active form of thyroid hormone T4 in blood. T4 regulates metabolism.',
    purpose: 'Evaluates thyroid function and diagnoses thyroid disorders',
    normalRange: {
      general: '0.8-1.8 ng/dL',
    },
    highMeans: {
      description: 'High T4 indicates hyperthyroidism',
      causes: ['Graves\' disease', 'Toxic nodular goiter', 'Thyroiditis', 'Excessive thyroid medication'],
    },
    lowMeans: {
      description: 'Low T4 indicates hypothyroidism',
      causes: ['Hashimoto\'s thyroiditis', 'Iodine deficiency', 'Pituitary disorder', 'Medications'],
    },
    lifestyleFactors: ['Balanced iodine intake', 'Selenium and zinc', 'Avoid goitrogens if hypothyroid', 'Stress management'],
    relatedTests: ['TSH', 'Free T3', 'Thyroid Antibodies'],
  },

  // ========== DIABETES MARKERS ==========
  'Hemoglobin A1C': {
    testName: 'Hemoglobin A1C (HbA1c)',
    category: 'diabetes',
    description: 'Measures average blood sugar levels over the past 2-3 months. Shows how well diabetes is controlled.',
    purpose: 'Diagnoses diabetes and monitors long-term blood sugar control',
    normalRange: {
      general: '<5.7% (Normal); 5.7-6.4% (Prediabetes); ≥6.5% (Diabetes)',
    },
    highMeans: {
      description: 'High A1C indicates poor blood sugar control and diabetes risk',
      causes: ['Type 1 or Type 2 diabetes', 'Prediabetes', 'Poor diabetes management', 'Insulin resistance'],
      symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow-healing wounds'],
    },
    lowMeans: {
      description: 'Low A1C indicates good blood sugar control',
      causes: ['Excellent diabetes management', 'Normal metabolism', 'Recent blood loss', 'Hemolytic anemia'],
    },
    lifestyleFactors: ['Low glycemic diet', 'Regular exercise', 'Weight management', 'Consistent meal timing', 'Limit processed carbs'],
    relatedTests: ['Fasting Glucose', 'Insulin', 'C-Peptide'],
    bloodTypeConcerns: 'Type O may benefit from protein-focused meals; Type A from complex carbs and vegetables for blood sugar stability',
    criticalValues: { high: 9, low: 4, unit: '%' },
  },

  // ========== LIVER FUNCTION ==========
  'ALT': {
    testName: 'ALT (Alanine Aminotransferase)',
    category: 'liver',
    description: 'Measures liver enzyme. ALT is released when liver cells are damaged.',
    purpose: 'Screens for liver damage and disease',
    normalRange: {
      male: '7-55 U/L',
      female: '7-45 U/L',
    },
    highMeans: {
      description: 'Elevated ALT indicates liver cell damage',
      causes: ['Hepatitis (A, B, C)', 'Fatty liver disease', 'Alcohol abuse', 'Medications', 'Cirrhosis', 'Hemochromatosis'],
      symptoms: ['Jaundice', 'Fatigue', 'Abdominal pain', 'Nausea', 'Dark urine'],
    },
    lowMeans: {
      description: 'Low ALT is generally not concerning',
      causes: ['Normal variation', 'Deficiency in vitamin B6'],
    },
    lifestyleFactors: ['Limit alcohol', 'Maintain healthy weight', 'Avoid hepatotoxic drugs', 'Healthy diet', 'Exercise'],
    relatedTests: ['AST', 'Alkaline Phosphatase', 'Bilirubin', 'GGT'],
    criticalValues: { high: 1000, low: 0, unit: 'U/L' },
  },

  'AST': {
    testName: 'AST (Aspartate Aminotransferase)',
    category: 'liver',
    description: 'Measures enzyme found in liver and other organs. Released when tissues are damaged.',
    purpose: 'Evaluates liver and heart damage',
    normalRange: {
      general: '10-40 U/L',
    },
    highMeans: {
      description: 'Elevated AST may indicate liver or heart damage',
      causes: ['Hepatitis', 'Cirrhosis', 'Fatty liver', 'Heart attack', 'Muscle damage', 'Alcohol abuse'],
    },
    lowMeans: {
      description: 'Low AST is generally not concerning',
      causes: ['Normal variation', 'Vitamin B6 deficiency'],
    },
    lifestyleFactors: ['Limit alcohol', 'Liver-healthy diet', 'Maintain healthy weight', 'Avoid unnecessary medications'],
    relatedTests: ['ALT', 'AST/ALT Ratio', 'Alkaline Phosphatase', 'Bilirubin'],
  },

  // ========== VITAMINS ==========
  'Vitamin D 25-Hydroxy': {
    testName: 'Vitamin D 25-Hydroxy',
    category: 'vitamins',
    description: 'Measures vitamin D levels. Vitamin D is essential for bone health, immune function, and mood.',
    purpose: 'Assesses vitamin D status and deficiency risk',
    normalRange: {
      general: '30-100 ng/mL (Optimal: 40-60 ng/mL)',
    },
    highMeans: {
      description: 'Very high vitamin D can cause toxicity',
      causes: ['Excessive supplementation', 'Rare genetic disorders'],
      symptoms: ['Nausea', 'Vomiting', 'Weakness', 'Kidney problems'],
    },
    lowMeans: {
      description: 'Low vitamin D affects bone health and immune function',
      causes: ['Limited sun exposure', 'Dark skin', 'Obesity', 'Malabsorption', 'Kidney disease', 'Age'],
      symptoms: ['Bone pain', 'Muscle weakness', 'Fatigue', 'Mood changes', 'Frequent infections'],
    },
    lifestyleFactors: ['Sun exposure (10-30 min daily)', 'Vitamin D-rich foods (fatty fish, fortified milk)', 'Supplementation if deficient', 'Maintain healthy weight'],
    relatedTests: ['Calcium', 'PTH', 'Alkaline Phosphatase', 'Phosphorus'],
    criticalValues: { high: 150, low: 10, unit: 'ng/mL' },
  },

  'Vitamin B12': {
    testName: 'Vitamin B12 (Cobalamin)',
    category: 'vitamins',
    description: 'Measures vitamin B12 levels. Essential for nerve function, red blood cell formation, and DNA synthesis.',
    purpose: 'Diagnoses B12 deficiency and related anemia',
    normalRange: {
      general: '200-900 pg/mL',
    },
    highMeans: {
      description: 'High B12 is usually from supplementation',
      causes: ['B12 supplementation', 'Liver disease', 'Certain cancers'],
    },
    lowMeans: {
      description: 'Low B12 causes anemia and neurological problems',
      causes: ['Pernicious anemia', 'Vegan diet', 'Malabsorption', 'Gastric surgery', 'Medications (metformin, PPIs)', 'Age'],
      symptoms: ['Fatigue', 'Weakness', 'Numbness/tingling', 'Memory problems', 'Depression', 'Balance issues'],
    },
    lifestyleFactors: ['B12-rich foods (meat, fish, dairy, eggs)', 'Supplements for vegans', 'Address malabsorption issues'],
    relatedTests: ['Folate', 'Homocysteine', 'MMA', 'CBC'],
    bloodTypeConcerns: 'Type A individuals may have lower stomach acid affecting B12 absorption; consider sublingual supplements',
  },

  'Folate': {
    testName: 'Folate (Folic Acid/Vitamin B9)',
    category: 'vitamins',
    description: 'Measures folate levels. Essential for DNA synthesis, cell division, and red blood cell formation.',
    purpose: 'Diagnoses folate deficiency and related anemia',
    normalRange: {
      general: '>3.0 ng/mL',
    },
    highMeans: {
      description: 'High folate usually from supplementation',
      causes: ['Folic acid supplementation', 'Fortified foods', 'Pernicious anemia (paradoxically)'],
    },
    lowMeans: {
      description: 'Low folate causes megaloblastic anemia',
      causes: ['Poor diet', 'Alcohol abuse', 'Malabsorption', 'Pregnancy', 'Certain medications', 'Dialysis'],
      symptoms: ['Fatigue', 'Weakness', 'Shortness of breath', 'Irritability', 'Forgetfulness'],
    },
    lifestyleFactors: ['Leafy greens', 'Legumes', 'Fortified grains', 'Citrus fruits', 'Limit alcohol'],
    relatedTests: ['Vitamin B12', 'Homocysteine', 'CBC', 'MCV'],
  },

  // ========== IRON STUDIES ==========
  'Ferritin': {
    testName: 'Ferritin',
    category: 'iron',
    description: 'Measures stored iron in the body. Best indicator of total iron stores.',
    purpose: 'Assesses iron deficiency or iron overload',
    normalRange: {
      male: '24-336 ng/mL',
      female: '11-307 ng/mL',
    },
    highMeans: {
      description: 'High ferritin may indicate iron overload or inflammation',
      causes: ['Hemochromatosis', 'Chronic inflammation', 'Liver disease', 'Alcohol abuse', 'Frequent transfusions'],
    },
    lowMeans: {
      description: 'Low ferritin indicates iron deficiency',
      causes: ['Inadequate dietary iron', 'Blood loss', 'Pregnancy', 'Growth spurts', 'Malabsorption'],
      symptoms: ['Fatigue', 'Weakness', 'Pale skin', 'Shortness of breath', 'Cold extremities', 'Brittle nails'],
    },
    lifestyleFactors: ['Iron-rich foods (red meat, spinach, beans)', 'Vitamin C enhances absorption', 'Avoid tea/coffee with meals', 'Cast iron cookware'],
    relatedTests: ['Iron Serum', 'TIBC', 'Transferrin Saturation', 'Hemoglobin'],
    bloodTypeConcerns: 'Type O may absorb iron more efficiently from meat; Type A from plant sources with vitamin C',
  },

  'Iron Serum': {
    testName: 'Iron Serum',
    category: 'iron',
    description: 'Measures the amount of iron circulating in blood.',
    purpose: 'Evaluates iron status and anemia',
    normalRange: {
      male: '65-175 mcg/dL',
      female: '50-170 mcg/dL',
    },
    highMeans: {
      description: 'High iron may indicate iron overload',
      causes: ['Hemochromatosis', 'Iron supplementation', 'Liver disease', 'Hemolytic anemia'],
    },
    lowMeans: {
      description: 'Low iron indicates iron deficiency',
      causes: ['Iron deficiency anemia', 'Chronic blood loss', 'Poor diet', 'Malabsorption', 'Pregnancy'],
    },
    lifestyleFactors: ['Iron-rich diet', 'Vitamin C for absorption', 'Avoid calcium supplements with iron-rich meals'],
    relatedTests: ['Ferritin', 'TIBC', 'Transferrin Saturation', 'Hemoglobin', 'Hematocrit'],
  },
};

// Helper function to get education content by test name
export function getLabEducation(testName: string): LabEducationContent | undefined {
  return labEducationDatabase[testName];
}

// Helper function to get all tests in a category
export function getLabsByCategory(category: LabCategory): LabEducationContent[] {
  return Object.values(labEducationDatabase).filter(lab => lab.category === category);
}

// Helper function to search labs by keyword
export function searchLabEducation(keyword: string): LabEducationContent[] {
  const lowerKeyword = keyword.toLowerCase();
  return Object.values(labEducationDatabase).filter(lab => 
    lab.testName.toLowerCase().includes(lowerKeyword) ||
    lab.description.toLowerCase().includes(lowerKeyword) ||
    lab.purpose.toLowerCase().includes(lowerKeyword)
  );
}

