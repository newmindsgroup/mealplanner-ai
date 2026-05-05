# Fitness Feature Design Spec
*Date: 2026-05-05*

## Goal
Add a fully AI-powered fitness coaching module to MealPlan Assistant. The feature captures user equipment, training style, goals, and an optional body photo, then generates personalized weekly workout plans. Workouts appear in the dedicated Fitness tab AND as embedded cards on the existing WeeklyPlanView. Progress is tracked and the AI continuously adapts the plan.

## Architecture

### Backend (Node.js/Express)
- 6 new MySQL tables in `schema.sql`
- 1 new route file: `server/routes/fitness.js` (13 endpoints)
- 1 new AI service: `server/services/fitnessAIService.js`
- Extend `server/index.js` to mount `/api/fitness`

### Frontend (React/TypeScript)
- 1 new service: `src/services/fitnessService.ts`
- 1 new Zustand slice in `src/store/useStore.ts`
- 7 new components under `src/components/fitness/`
- Extend `src/components/Sidebar.tsx` to add Fitness nav item
- Extend `src/components/Layout.tsx` to add `/dashboard/fitness/*` route
- Extend `src/components/WeeklyPlanView.tsx` to show workout cards per day

## Privacy Model
- Default: photos stored encrypted at `uploads/body-analyses/{userId}/{uuid}.enc`, auto-deleted after 30 days
- User can change to "delete immediately after analysis" in Settings
- Server reads `users.photo_retention_policy` ENUM('30_days','immediate')

## Database Schema (6 new tables)

### fitness_profiles
```sql
CREATE TABLE IF NOT EXISTS fitness_profiles (
  id                  VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id             VARCHAR(36) NOT NULL UNIQUE,
  height_cm           DECIMAL(5,2),
  weight_kg           DECIMAL(5,2),
  body_fat_pct        DECIMAL(4,2),
  fitness_level       ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  primary_goal        ENUM('weight_loss','muscle_gain','endurance','flexibility','general_health'),
  secondary_goals     JSON,
  equipment           JSON,
  training_styles     JSON,
  days_per_week       INT DEFAULT 3,
  session_duration_min INT DEFAULT 45,
  preferred_time      ENUM('morning','afternoon','evening'),
  injuries            JSON,
  photo_retention     ENUM('30_days','immediate') DEFAULT '30_days',
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### body_analyses
```sql
CREATE TABLE IF NOT EXISTS body_analyses (
  id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         VARCHAR(36) NOT NULL,
  photo_path      VARCHAR(500),
  analyzed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delete_at       TIMESTAMP NULL,
  body_type       ENUM('ectomorph','mesomorph','endomorph'),
  estimated_bf    DECIMAL(4,2),
  muscle_mass     ENUM('low','moderate','high'),
  ai_notes        TEXT,
  recommendations JSON,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### workout_plans
```sql
CREATE TABLE IF NOT EXISTS workout_plans (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     VARCHAR(36) NOT NULL,
  name        VARCHAR(255),
  week_start  DATE NOT NULL,
  goal        VARCHAR(100),
  plan_data   JSON NOT NULL,
  ai_provider VARCHAR(50),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### workout_sessions
```sql
CREATE TABLE IF NOT EXISTS workout_sessions (
  id             VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  plan_id        VARCHAR(36) NOT NULL,
  user_id        VARCHAR(36) NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_at   TIMESTAMP NULL,
  duration_min   INT,
  exercises      JSON,
  notes          TEXT,
  mood           ENUM('great','good','ok','tired','skipped'),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id)  REFERENCES workout_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE
);
```

### body_measurements
```sql
CREATE TABLE IF NOT EXISTS body_measurements (
  id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id      VARCHAR(36) NOT NULL,
  measured_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  weight_kg    DECIMAL(5,2),
  body_fat_pct DECIMAL(4,2),
  chest_cm     DECIMAL(5,2),
  waist_cm     DECIMAL(5,2),
  hips_cm      DECIMAL(5,2),
  bicep_cm     DECIMAL(5,2),
  thigh_cm     DECIMAL(5,2),
  notes        TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### personal_records
```sql
CREATE TABLE IF NOT EXISTS personal_records (
  id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id      VARCHAR(36) NOT NULL,
  exercise     VARCHAR(255) NOT NULL,
  record_type  ENUM('max_weight','max_reps','fastest_time','longest_distance'),
  value        DECIMAL(10,2) NOT NULL,
  unit         VARCHAR(20),
  achieved_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Routes (server/routes/fitness.js)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/fitness/profile | Create or update fitness profile |
| GET | /api/fitness/profile | Get current user's fitness profile |
| POST | /api/fitness/body-analysis | Upload photo and trigger AI analysis |
| GET | /api/fitness/body-analysis | Get analysis history |
| DELETE | /api/fitness/body-analysis/:id | Delete a specific analysis + photo |
| POST | /api/fitness/workout-plan | Generate AI workout plan for current week |
| GET | /api/fitness/workout-plan | Get current active workout plan |
| POST | /api/fitness/session/:id/complete | Log a completed session |
| GET | /api/fitness/sessions | Get session history |
| POST | /api/fitness/measurements | Log body measurements |
| GET | /api/fitness/measurements | Get measurement history |
| GET | /api/fitness/records | Get personal records |
| POST | /api/fitness/records | Log a new personal record |

## AI Prompts

### Body Analysis (Vision)
```
You are an expert personal trainer and body composition analyst.
Analyze this body photo and return JSON with:
{
  "bodyType": "ectomorph|mesomorph|endomorph",
  "estimatedBodyFat": number (percentage),
  "muscleDistribution": "string describing distribution",
  "postureNotes": "string",
  "priorityAreas": ["muscle groups to focus on"],
  "strengths": ["well-developed areas"],
  "cautions": ["areas to be careful with"],
  "recommendedApproach": "string describing training style"
}
Be constructive and motivational. Do not make medical diagnoses.
```

### Workout Plan Generator
```
You are an elite personal trainer with expertise in:
- Periodization (linear, undulating, block)
- RPE/RIR programming
- All training modalities (strength, hypertrophy, HIIT, yoga, calisthenics, endurance)
- Blood type exercise affinity research
- Injury prevention and corrective exercise
- Progressive overload and deload protocols

Generate a 7-day workout plan as JSON with this structure:
{
  "planName": "string",
  "weeklyVolume": "description",
  "days": [
    {
      "dayOfWeek": "Monday",
      "type": "Push|Pull|Legs|Full Body|Cardio|Rest|Active Recovery",
      "duration_min": number,
      "warmup": [{"exercise": "name", "duration": "2 min", "notes": "..."}],
      "exercises": [
        {
          "name": "Exercise Name",
          "muscleGroups": ["chest","shoulders"],
          "sets": 4,
          "reps": "8-10",
          "restSec": 90,
          "rpe": 7,
          "notes": "technique cue",
          "alternatives": ["bodyweight version if no equipment"]
        }
      ],
      "cooldown": [...],
      "recoveryMeal": "blood-type specific post-workout food suggestion"
    }
  ],
  "progressionNotes": "how to progress next week",
  "deloadWeek": false
}
```

## Frontend Components (src/components/fitness/)

| File | Purpose |
|------|---------|
| FitnessDashboard.tsx | Overview: streak, today's session card, quick stats |
| FitnessOnboarding.tsx | Multi-step wizard: equipment, style, goals, schedule, level |
| BodyAnalysis.tsx | Upload photo, show analysis results card |
| WorkoutPlanView.tsx | 7-day calendar with session cards |
| SessionLogger.tsx | Exercise-by-exercise check-off with sets/reps/weight input |
| ProgressView.tsx | Charts: weight, BF%, measurements over time, PRs |
| WorkoutDayCard.tsx | Compact card embedded in WeeklyPlanView per day |

## Blood Type Workout Integration

| Blood Type | Recommended Styles | Recovery Foods |
|------------|-------------------|----------------|
| O+ / O- | HIIT, strength, vigorous cardio | Lean beef, plums, figs, spinach |
| A+ / A- | Yoga, pilates, calming cardio, light weights | Soy, tofu, green veg, berries |
| B+ / B- | Tennis, hiking, swimming, moderate weights | Eggs, venison, leafy greens, dairy |
| AB+ / AB- | Mix: calming + moderate intensity | Tofu, seafood, dairy, leafy greens |

## Implementation Phases

- **Phase 1**: DB migration + API skeleton + fitness profile CRUD + FitnessOnboarding + sidebar nav
- **Phase 2**: Body analysis upload + AI vision analysis + WorkoutPlanView + AI plan generator
- **Phase 3**: SessionLogger + WorkoutDayCard in WeeklyPlanView + ProgressView + PRs
- **Phase 4**: AI adaptation engine + measurement tracking charts + nutrition/calorie sync
