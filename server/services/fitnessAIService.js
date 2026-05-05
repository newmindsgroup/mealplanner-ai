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
  const systemPrompt = `You are an expert certified personal trainer and body composition analyst.
Analyze this body photo and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "bodyType": "ectomorph|mesomorph|endomorph",
  "estimatedBodyFat": <number, percentage estimate>,
  "muscleDistribution": "<description of where muscle is developed>",
  "postureNotes": "<any notable postural observations>",
  "priorityAreas": ["<muscle groups to focus on>"],
  "strengths": ["<well-developed areas>"],
  "cautions": ["<areas to be careful with or avoid overloading>"],
  "recommendedApproach": "<overall training style recommendation>",
  "motivationalNote": "<one encouraging sentence>"
}
Be professional, constructive, and motivational. Do not make medical diagnoses. Estimate conservatively.`;

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Please analyze my body composition from this photo and provide your assessment.' },
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
