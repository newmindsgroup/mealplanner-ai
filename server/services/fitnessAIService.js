// Fitness AI Service — workout plan generation, body analysis
const { chat, chatWithVision } = require('./aiService');

// Blood type exercise + recovery mapping
const BLOOD_TYPE_FITNESS = {
  'O+': { styles: ['HIIT', 'strength', 'vigorous cardio'], recovery: 'Lean beef, spinach, plums, figs' },
  'O-': { styles: ['HIIT', 'strength', 'vigorous cardio'], recovery: 'Lean beef, spinach, plums, figs' },
  'A+': { styles: ['yoga', 'pilates', 'light weights', 'calming cardio'], recovery: 'Soy, tofu, green vegetables, berries' },
  'A-': { styles: ['yoga', 'pilates', 'light weights', 'calming cardio'], recovery: 'Soy, tofu, green vegetables, berries' },
  'B+': { styles: ['tennis', 'hiking', 'swimming', 'moderate weights'], recovery: 'Eggs, venison, leafy greens, dairy' },
  'B-': { styles: ['tennis', 'hiking', 'swimming', 'moderate weights'], recovery: 'Eggs, venison, leafy greens, dairy' },
  'AB+': { styles: ['calming cardio', 'moderate weights', 'pilates'], recovery: 'Tofu, seafood, dairy, leafy greens' },
  'AB-': { styles: ['calming cardio', 'moderate weights', 'pilates'], recovery: 'Tofu, seafood, dairy, leafy greens' },
};

/**
 * Analyze a body photo using AI vision
 * Returns structured body composition assessment
 */
async function analyzeBodyPhoto(photoBase64, mimeType = 'image/jpeg', userId = null) {
  const systemPrompt = `You are an elite certified personal trainer, posture specialist, and body composition analyst with 20+ years of experience. Your assessments are professional, specific, actionable, and encouraging.

Analyze the body photo and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "bodyType": "ectomorph|mesomorph|endomorph|ecto-meso|meso-endo",
  "bodyTypeDescription": "<2-sentence explanation of what this body type means for training>",
  "estimatedBodyFat": <number, percentage estimate — be conservative and realistic>,
  "muscleDistribution": "<detailed description of muscle development across body regions>",
  "muscleImbalances": [
    { "area": "<muscle group>", "note": "<specific imbalance observed>", "fix": "<corrective action>" }
  ],
  "postureAssessment": {
    "overall": "excellent|good|fair|needs attention",
    "observations": ["<specific postural observation>"],
    "corrections": ["<corrective exercise or cue>"]
  },
  "bodySymmetry": {
    "rating": "excellent|good|fair|asymmetric",
    "notes": "<left/right or upper/lower balance observations>"
  },
  "priorityAreas": ["<muscle groups to focus on for their goals>"],
  "strengths": ["<well-developed areas — be specific>"],
  "cautions": ["<areas to be careful with or approach carefully>"],
  "recommendedApproach": "<detailed training style recommendation based on what you see>",
  "trainingPhase": "foundation|hypertrophy|strength|power|cut|recomp",
  "estimatedRecoveryCapacity": "low|moderate|high",
  "nutritionInsight": "<brief nutrition observation based on visible body composition>",
  "motivationalNote": "<one specific, genuine encouraging sentence tailored to what you see>"
}
Be professional, constructive, specific, and motivational. Never make medical diagnoses. Estimate body fat conservatively (±3-5%). Focus on actionable insights.`;

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Please perform a comprehensive body composition and posture assessment from this photo. Be specific and actionable.' },
        { type: 'image', source: { type: 'base64', media_type: mimeType, data: photoBase64 } },
      ],
    },
  ];

  const response = await chatWithVision(messages, { system: systemPrompt }, userId);
  
  // Parse JSON from response
  const text = response.content?.[0]?.text || response.choices?.[0]?.message?.content || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON for body analysis');
  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate a personalized weekly workout plan
 */
async function generateWorkoutPlan(profile, bodyAnalysis, bloodType, userId = null) {
  const btInfo = BLOOD_TYPE_FITNESS[bloodType] || { styles: ['balanced training'], recovery: 'whole foods' };
  
  const systemPrompt = `You are an elite certified personal trainer with 15+ years of experience.
You have deep expertise in:
- Periodization theory (linear, undulating, block periodization)
- RPE/RIR-based programming
- All training modalities: strength, hypertrophy, HIIT, yoga, calisthenics, endurance, sport-specific
- Blood type exercise science and affinity research
- Injury prevention, corrective exercise, and mobility work
- Progressive overload, deload protocols, and recovery optimization
- Nutrition timing for workout performance and recovery

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "planName": "<descriptive name>",
  "weeklyFocus": "<main training focus this week>",
  "totalWeeklyVolume": "<sets/sessions description>",
  "progressionStrategy": "<how to progress from week to week>",
  "days": [
    {
      "dayOfWeek": "Monday",
      "type": "Push|Pull|Legs|Full Body|Upper|Lower|Cardio|HIIT|Yoga|Mobility|Rest|Active Recovery",
      "name": "<session name e.g. 'Chest & Shoulders Power'>",
      "scheduledTime": "morning|afternoon|evening",
      "duration_min": <number>,
      "intensity": "low|moderate|high|max",
      "warmup": [
        { "exercise": "<name>", "duration": "<e.g. 2 min>", "notes": "<cue>" }
      ],
      "exercises": [
        {
          "name": "<exercise name>",
          "muscleGroups": ["<primary>", "<secondary>"],
          "sets": <number>,
          "reps": "<e.g. '8-10' or '30 sec'>",
          "restSec": <number>,
          "rpe": <1-10>,
          "technique": "<key technique cue>",
          "alternatives": ["<equipment-free alternative>"]
        }
      ],
      "cooldown": [
        { "exercise": "<stretch name>", "duration": "<30 sec>", "notes": "<cue>" }
      ],
      "recoveryMeal": "<blood type optimized post-workout snack/meal>",
      "coachNote": "<motivational or technical note for this session>"
    }
  ],
  "weeklyRecoveryTips": "<sleep, hydration, nutrition timing advice>",
  "deloadWeek": false
}`;

  const userMessage = `Create a personalized ${profile.days_per_week}-day per week workout plan for me.

MY PROFILE:
- Fitness level: ${profile.fitness_level}
- Primary goal: ${profile.primary_goal}
- Secondary goals: ${(profile.secondary_goals || []).join(', ')}
- Available equipment: ${(profile.equipment || []).join(', ')}
- Preferred training styles: ${(profile.training_styles || []).join(', ')}
- Session duration: ${profile.session_duration_min} minutes
- Preferred time: ${profile.preferred_time}
- Injuries/limitations: ${(profile.injuries || []).join(', ') || 'None'}

BODY ANALYSIS:
${bodyAnalysis ? `- Body type: ${bodyAnalysis.bodyType}
- Estimated body fat: ${bodyAnalysis.estimatedBodyFat}%
- Priority areas: ${(bodyAnalysis.priorityAreas || []).join(', ')}
- Recommended approach: ${bodyAnalysis.recommendedApproach}
- Cautions: ${(bodyAnalysis.cautions || []).join(', ')}` : '- No body analysis available'}

BLOOD TYPE: ${bloodType || 'Unknown'}
- Blood type exercise affinity: ${btInfo.styles.join(', ')}
- Blood type recovery foods: ${btInfo.recovery}

Build a plan that respects my blood type, maximizes my results for my primary goal, and fits my available equipment and time.`;

  const messages = [{ role: 'user', content: userMessage }];
  const response = await chat(messages, { system: systemPrompt }, userId);
  
  const text = response.content?.[0]?.text || response.choices?.[0]?.message?.content || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON for workout plan');
  return JSON.parse(jsonMatch[0]);
}

/**
 * Analyze progress and suggest plan adaptations
 */
async function analyzeProgress(sessions, measurements, records, profile, userId = null) {
  const systemPrompt = `You are an expert personal trainer analyzing a client's fitness progress data.
Return ONLY valid JSON:
{
  "overallProgress": "excellent|good|steady|plateau|declining",
  "keyInsights": ["<insight 1>", "<insight 2>"],
  "plateauDetected": false,
  "recommendations": ["<specific actionable recommendation>"],
  "nextWeekAdjustments": "<how to modify next week's plan>",
  "motivationalMessage": "<personalized encouragement>"
}`;

  const userMessage = `Analyze my fitness progress:
Sessions completed (last 4 weeks): ${sessions.length}
Completion rate: ${sessions.filter(s => s.mood !== 'skipped').length}/${sessions.length}
Latest weight: ${measurements[0]?.weight_kg || 'Not tracked'} kg
Weight change: ${measurements.length >= 2 ? (measurements[0].weight_kg - measurements[measurements.length-1].weight_kg).toFixed(1) + ' kg' : 'Insufficient data'}
Personal records set: ${records.length}
Primary goal: ${profile.primary_goal}`;

  const messages = [{ role: 'user', content: userMessage }];
  const response = await chat(messages, { system: systemPrompt }, userId);
  
  const text = response.content?.[0]?.text || response.choices?.[0]?.message?.content || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { overallProgress: 'steady', keyInsights: [], recommendations: [], motivationalMessage: 'Keep going!' };
  return JSON.parse(jsonMatch[0]);
}

module.exports = { analyzeBodyPhoto, generateWorkoutPlan, analyzeProgress, BLOOD_TYPE_FITNESS };
