# NourishAI — Use Cases Reference

> Every user scenario the platform supports, with step-by-step flows, data involved, and services triggered.

---

## Table of Contents

1. [First-Time User Onboarding](#1-first-time-user-onboarding)
2. [Generating a Weekly Meal Plan](#2-generating-a-weekly-meal-plan)
3. [Looking Up Food Compatibility](#3-looking-up-food-compatibility)
4. [Scanning a Food Label](#4-scanning-a-food-label)
5. [Uploading Lab Results](#5-uploading-lab-results)
6. [Taking the Brain Assessment](#6-taking-the-brain-assessment)
7. [Logging a Workout](#7-logging-a-workout)
8. [Managing a Multi-Person Household](#8-managing-a-multi-person-household)
9. [Comparing Family Food Compatibility](#9-comparing-family-food-compatibility)
10. [Chatting with the AI Assistant](#10-chatting-with-the-ai-assistant)
11. [Reviewing Supplement Schedule](#11-reviewing-supplement-schedule)
12. [Generating a Health Report](#12-generating-a-health-report)
13. [Managing Pantry Inventory](#13-managing-pantry-inventory)
14. [Previewing the Weekly Email Digest](#14-previewing-the-weekly-email-digest)
15. [Using Guided Tours for Help](#15-using-guided-tours-for-help)
16. [Exporting Data (PDF/CSV)](#16-exporting-data-pdfcsv)
17. [Tracking Progress & Gamification](#17-tracking-progress--gamification)
18. [Configuring AI API Keys](#18-configuring-ai-api-keys)
19. [Inviting Household Members](#19-inviting-household-members)
20. [Daily Neuro Check-In](#20-daily-neuro-check-in)
21. [Training Nutrition Optimization](#21-training-nutrition-optimization)
22. [Monitoring Proactive Health Alerts](#22-monitoring-proactive-health-alerts)
23. [Cross-Domain Health Correlation](#23-cross-domain-health-correlation)
24. [Searching the Knowledge Base](#24-searching-the-knowledge-base)
25. [Voice Interaction](#25-voice-interaction)

---

## 1. First-Time User Onboarding

**Actor**: New user visiting the app for the first time.

### Trigger
User loads the app with no data in localStorage.

### Flow
1. **Landing Page** → User sees marketing page (`LandingPage.tsx`)
2. **Sign Up / Demo** → Creates account or enters demo mode
3. **Profile Setup** → `ProfileSetup.tsx` collects:
   - Name, age, blood type (8 variants)
   - Allergies, dietary restrictions
   - Health goals (weight loss, muscle gain, etc.)
   - Body composition (optional)
4. **Onboarding Wizard** → `OnboardingWizard.tsx` walks through key features
5. **Dashboard Redirect** → Lands on Home tab
6. **Auto-Tour Trigger** → After 2 seconds, `HelpCenter.tsx` auto-launches the Dashboard Tour via Driver.js (one-shot, guarded by localStorage flag `nourishAI_autoTourTriggered`)

### Services Triggered
- `useStore.addPerson()` → stores person data
- `guidedTours.startDashboardTour()` → auto-triggered
- `proactiveInsights.ts` → generates initial insights

### Exit Condition
User has a profile, sees the dashboard, and the Dashboard Tour has played.

---

## 2. Generating a Weekly Meal Plan

**Actor**: User with a completed profile.

### Trigger
User navigates to Weekly Plan tab and clicks "Generate Plan".

### Flow
1. User selects which family members to plan for
2. `aiMealPlanning.ts` builds an AI prompt including:
   - Each person's blood type, allergies, dietary codes
   - Health goals and eating preferences
   - Pantry inventory (if populated)
3. AI (OpenAI GPT-4 or Claude) generates 7 days × 4 meals
4. Results stored in `useStore.currentPlan`
5. `groceryList.ts` auto-generates a consolidated shopping list
6. User can click any meal card to:
   - View full recipe
   - Swap for a different meal
   - Mark as favorite
7. User can export plan as PDF via `mealPlanExport.ts`

### Services Triggered
- `aiMealPlanning.ts` → AI generation
- `mealPlanning.ts` → data management
- `groceryList.ts` → auto-generation
- `mealPlanExport.ts` → PDF download (on demand)

---

## 3. Looking Up Food Compatibility

**Actor**: User wondering if a specific food is good for their blood type.

### Flow — Via Food Guide
1. Navigate to Food Guide tab
2. Type food name in search bar
3. `BloodTypeFoodGuide.tsx` filters the 218KB database
4. Food card shows Beneficial (green), Neutral (yellow), or Avoid (red)
5. Expanding the card shows health notes and scientific context

### Flow — Via AI Chat
1. Open chat panel
2. Ask: "Is salmon good for Type O?"
3. `chatDataRouter.ts` detects food inquiry intent
4. `foodInquiryService.ts` generates detailed response
5. AI response includes compatibility, nutritional info, and recommendations

### Flow — Via Custom Food
1. In Food Guide, click "Add Custom Food"
2. Enter food name → AI classifies it for the user's blood type
3. Food saved to user's custom food list

---

## 4. Scanning a Food Label

**Actor**: User shopping or checking a product at home.

### Trigger
User navigates to Label Analyzer tab and activates camera.

### Flow
1. User captures photo of food label (or uploads image)
2. `LabelAnalyzer.tsx` sends image to Tesseract.js for OCR
3. Extracted text sent to `labelAnalysis.ts` for AI interpretation
4. AI identifies:
   - Harmful additives and preservatives
   - Allergen warnings
   - Blood type conflicts (per-ingredient)
   - Overall health score (0-100)
5. Results displayed with Safety Flags (Safe/Caution/Warning/Danger)
6. User sees actionable recommendations

### Three Scan Modes
| Mode | Use Case |
|---|---|
| `supplement` | Scan supplement label for ingredient analysis |
| `pantry` | Scan pantry item to add to inventory |
| `grocery` | Scan grocery product for purchase decision |

---

## 5. Uploading Lab Results

**Actor**: User with blood work results from a lab.

### Flow — Via Camera/OCR
1. Navigate to Labs → Scan Lab Report
2. Capture photo of lab report
3. `labScanning.ts` → Tesseract.js extracts text
4. `labExtractionAI.ts` → AI parses biomarker names, values, units, reference ranges
5. Results stored in lab store with automatic status assignment (normal/high/low/critical)

### Flow — Via Manual Entry
1. Navigate to Labs → Add Results Manually
2. Enter biomarker name, value, unit, and reference range
3. System auto-classifies status

### Post-Upload
- `labAlerts.ts` generates alerts for out-of-range values
- Lab history tracks trends over time via Recharts charts
- `crossReferenceEngine.ts` correlates with neuro profile and nutrition
- `proactiveInsights.ts` generates new insights based on lab data

---

## 6. Taking the Brain Assessment

**Actor**: User wanting to understand their neurotransmitter profile.

### Flow — Standard Questionnaire
1. Navigate to Brain Assessment tab
2. Select family member (multi-person support)
3. Choose "Standard Assessment" mode
4. Answer 120 True/False questions across 4 neurotransmitter categories
5. `assessmentStore.ts` calculates nature scores and deficiency scores
6. `NeuroReport.tsx` displays:
   - Radar chart of 4 neurotransmitter levels
   - Dominant nature identification
   - Deficiency severity ratings
   - Percentile comparisons
7. `aiNeuroAnalysis.ts` generates personalized nutritional protocol

### Flow — Conversational AI (Dr. Neura)
1. Choose "Conversational" mode
2. AI conducts a natural dialogue, asking adaptive questions
3. System tracks confidence level per neurotransmitter
4. Assessment completes when all 4 reach 90%+ confidence
5. Results identical to standard mode

### Post-Assessment
- Results stored per-person in `assessmentStore`
- AI protocol includes food recommendations, supplements, lifestyle changes
- Protocol cross-references with blood type for combined recommendations
- `HouseholdAssessmentDashboard.tsx` shows family-wide comparison

---

## 7. Logging a Workout

**Actor**: User tracking their training.

### Flow
1. Navigate to Fitness tab
2. Choose from:
   - **Library Workout** — Pick from 978KB exercise database
   - **Custom Plan** — Build with `CustomPlanBuilder.tsx`
   - **Quick Log** — Manual exercise entry
3. During session, `WorkoutSessionTracker.tsx` tracks:
   - Exercise name, sets, reps, weight
   - Rest periods, RPE (effort rating)
   - Total volume and duration
4. Post-session, `SessionCompleteModal.tsx` shows:
   - Volume summary
   - Muscle groups worked (reflected in `MuscleHeatmap.tsx`)
   - `NutritionFitnessBridge.tsx` suggests post-workout meals by blood type

### Related Features
- `ProgressCharts.tsx` — Track volume/strength trends over time
- `StreakCalendar.tsx` — Visual workout consistency tracker
- `WeeklyInsightsAI.tsx` — AI-generated training analysis
- `AdaptivePeriodization.tsx` — Progressive training adjustments
- `FamilyChallenges.tsx` — Family fitness competitions

---

## 8. Managing a Multi-Person Household

**Actor**: Parent or head of household.

### Flow
1. Navigate to Family Profiles tab
2. Click "Add Family Member"
3. Enter member details: name, blood type, age, allergies, goals
4. `useStore.addPerson()` creates new person record
5. All features now support per-person context:
   - Meal plans can include multiple family members
   - Brain assessments are independent per person
   - Lab results tracked per person
   - Supplement schedules personalized per person

### Role-Based Access
| Role | Can Do |
|---|---|
| Owner | Full control, delete household, manage billing |
| Admin | Add/remove members, manage settings |
| Member | View and edit own data, participate in plans |
| Viewer | Read-only access to shared data |

---

## 9. Comparing Family Food Compatibility

**Actor**: Parent planning meals for a mixed-blood-type family.

### Trigger
Navigate to Household → Food Comparison.

### Flow
1. `HouseholdFoodComparison.tsx` loads all family members
2. `householdFoodComparison.ts` generates a compatibility matrix
3. Matrix shows every food with color-coded status per family member
4. **Universal Safe Foods** — Green for all members (ideal for family meals)
5. **Conflict Foods** — Beneficial for some, Avoid for others (flagged)
6. User can filter by category and search for specific foods

### Output
A visual grid where each row is a food and each column is a family member, with green/yellow/red badges showing compatibility.

---

## 10. Chatting with the AI Assistant

**Actor**: Any user with a question.

### Trigger
Click the floating chat bubble (`tour-chat-toggle`).

### Flow
1. User types or speaks (voice input via Web Speech API)
2. `chatDataRouter.ts` classifies intent:
   - **Meal request** → `aiMealPlanning.ts`
   - **Food question** → `foodInquiryService.ts`
   - **Lab question** → Lab store data + `crossReferenceEngine.ts`
   - **Recipe request** → `recipeGeneration.ts`
   - **Supplement question** → `supplementTimingDatabase.ts`
   - **General health** → `aiService.ts` with full context
3. Response includes the user's full health context:
   - Blood type, allergies, goals
   - Recent lab results
   - Neuro profile
   - Current meal plan
4. Response displayed with optional text-to-speech playback

### Smart Autofill
When the AI suggests specific values (e.g., blood type, goals), `smartAutofill.ts` can pre-fill forms across the platform.

---

## 11. Reviewing Supplement Schedule

**Actor**: User checking their daily supplement routine.

### Trigger
Navigate to Supplements tab.

### Flow
1. `SupplementScheduleView.tsx` displays supplements organized by time slot:
   - Morning, Afternoon, Evening, Bedtime, Any Time
2. Each supplement shows:
   - Name and recommended dosage range
   - Whether to take with food or empty stomach
   - Blood-type-specific notes
3. Expanding a supplement reveals:
   - Interaction warnings with other supplements
   - Medication conflicts
   - Synergistic combinations ("Take with" recommendations)
4. Data sourced from `supplementTimingDatabase.ts` (17KB) and `interactionDatabase.ts` (17KB)

---

## 12. Generating a Health Report

**Actor**: User wanting a comprehensive health overview or sharing data with a doctor.

### Flow
1. Navigate to Health Report tab
2. `CrossDomainHealthReport.tsx` shows data source status:
   - Labs (connected/missing)
   - Neuro Profile (connected/missing)
   - Fitness (connected/missing)
   - Meal Plans (connected/missing)
3. **Download PDF** → `healthReportPDF.ts` generates a professional report including all connected data domains
4. **Email Digest** → `weeklyDigest.ts` opens a preview of the branded weekly health email
5. **NourishAI Swarm Analysis** → `SwarmAnalysisPanel.tsx` triggers multi-agent deep analysis via `swarmService.ts`

### PDF Contents
- Personal info and blood type
- Lab biomarker summary with trends
- Neurotransmitter profile with protocols
- Fitness progress and body composition
- Meal plan adherence
- Supplement schedule
- AI-generated cross-domain insights

---

## 13. Managing Pantry Inventory

**Actor**: User tracking kitchen inventory.

### Flow — Adding Items
1. Navigate to My Pantry tab
2. Add item via:
   - **Manual entry** — Name, category, quantity, location, expiration
   - **Barcode scan** — `barcodeScanning.ts` identifies product
   - **Camera scan** — `pantryScanning.ts` for visual identification
   - **CSV import** — Bulk import via `csvImport.ts`
3. `productEnrichment.ts` looks up additional product data

### Flow — Receiving Alerts
1. `pantryNotifications.ts` runs checks:
   - Items approaching expiration date
   - Items below configured low-stock threshold
2. Alerts appear in Notification History
3. Low-stock items can auto-add to grocery list

### Integration Points
- Meal plan generation considers pantry contents
- Grocery list deducts pantry items
- Usage tracking feeds into consumption analytics

---

## 14. Previewing the Weekly Email Digest

**Actor**: User checking their weekly health summary.

### Flow
1. Navigate to Health Report tab
2. Click "Email Digest" button in the hero section
3. `weeklyDigest.ts` calls `collectDigestData()`:
   - Pulls person name, blood type, meal adherence
   - Pulls lab alerts, fitness streak, workouts completed
   - Generates action items for the next week
4. `generateDigestHTML()` creates inline-styled HTML email
5. `openDigestPreview()` opens the email preview in a new browser tab

### Alternative: Download
Call `downloadDigestHTML()` to save the email as an `.html` file.

---

## 15. Using Guided Tours for Help

**Actor**: Any user needing guidance on a feature.

### Flow — Manual Trigger
1. Click the floating `?` help button (bottom-right corner)
2. `HelpCenter.tsx` opens the tour panel
3. **Contextual Suggestion** — Shows the tour relevant to the current tab
4. **All Tours List** — Browse all 10 available tours with completion checkmarks
5. Click any tour → Panel closes → Driver.js steps begin
6. Completion is tracked in localStorage

### Flow — Keyboard Shortcut
1. Press `?` on any page (ignored when focus is in an input field)
2. Help Center panel toggles open/closed

### Flow — Auto-Trigger (First-Time)
1. New user completes profile setup
2. Navigates to Home tab
3. After 2 seconds, Dashboard Tour auto-launches
4. One-shot guard prevents repeat triggering

### Tour Reset
- Individual tour reset via the replay icon in the Help Center
- "Reset all tours" button in the Help Center footer

---

## 16. Exporting Data (PDF/CSV)

### Available Exports
| Data | Format | Service |
|---|---|---|
| Weekly Meal Plan | PDF | `mealPlanExport.ts` |
| Grocery List | PDF | `mealPlanExport.ts` |
| Food Guide | PDF, CSV | `foodExportService.ts` |
| Lab Reports | PDF, CSV | `labExport.ts` |
| Health Report | PDF | `healthReportPDF.ts` |
| Weekly Digest | HTML | `weeklyDigest.ts` |

All PDF exports use **jsPDF** with custom formatting, headers, and branding.

---

## 17. Tracking Progress & Gamification

**Actor**: User engaged with the platform regularly.

### Flow
1. Navigate to Progress tab
2. `ProgressDashboard.tsx` shows:
   - Current level and XP bar
   - Streak counter (consecutive days of activity)
   - Badges earned (achievements)
   - Weekly activity heatmap
3. XP is earned by:
   - Completing meal plans
   - Logging workouts
   - Taking assessments
   - Using the chat assistant
4. Level-ups trigger confetti animations

---

## 18. Configuring AI API Keys

**Actor**: User providing their own OpenAI/Anthropic API key.

### Flow
1. Navigate to Settings tab
2. Open API Key Settings section
3. Enter OpenAI key, Anthropic key, or both
4. Toggle "Use custom API key" on
5. `APIKeySettings.tsx` validates key format
6. Key stored securely (encrypted in backend, or in localStorage for frontend-only mode)
7. `aiService.ts` uses custom key for all subsequent AI calls

### Provider Priority
1. Anthropic Claude (if key provided and valid)
2. OpenAI GPT-4 (fallback)
3. Demo mode (if no keys)

---

## 19. Inviting Household Members

**Actor**: Household owner inviting a family member.

### Flow
1. Navigate to Household tab
2. Click "Invite Member"
3. Enter email address and choose role (Admin/Member/Viewer)
4. `invitationService.ts` generates a unique token
5. `emailService.ts` sends invitation email (requires SMTP configuration)
6. Recipient clicks link → `InvitationAccept` component validates token
7. New member joins household with assigned role

---

## 20. Daily Neuro Check-In

**Actor**: User tracking daily brain health.

### Trigger
Available after completing the Brain Assessment.

### Flow
1. Navigate to Brain Assessment tab
2. Click "Daily Check-In"
3. `DailyNeuroCheckIn.tsx` presents quick questions:
   - Energy level (1-10)
   - Mood (1-10)
   - Sleep quality (1-10)
   - Focus clarity (1-10)
   - Stress level (1-10)
4. AI maps responses to neurotransmitter levels
5. Trends tracked over time to detect neurotransmitter drift
6. If drift detected, protocol recommendations update automatically

---

## 21. Training Nutrition Optimization

**Actor**: User who just completed a workout.

### Flow
1. Complete a workout in the Fitness tab
2. `NutritionFitnessBridge.tsx` activates showing:
   - **Pre-workout nutrition** — What to eat before this workout type
   - **Post-workout nutrition** — Recovery meals optimized for blood type
   - **Timing guidance** — When to eat relative to training
3. `exerciseNutritionDatabase.ts` provides exercise-specific recommendations
4. Recommendations filtered by the user's blood type
5. Can add recommended meals directly to the weekly plan

---

## 22. Monitoring Proactive Health Alerts

**Actor**: Any user with data in the system.

### Flow
1. Visit the Dashboard (Home tab)
2. `ProactiveInsightCards.tsx` displays AI-generated health alerts
3. `proactiveInsights.ts` cross-references:
   - Lab biomarkers → identifies out-of-range values
   - Neuro profile → flags neurotransmitter deficiencies
   - Fitness → detects training overload or inactivity
   - Nutrition → checks meal plan adherence
   - Supplements → flags missed or conflicting supplements
4. Each insight card includes:
   - Priority level (urgent/warning/info/positive)
   - Clear description of the finding
   - Actionable next steps
   - Link to the relevant feature tab

---

## 23. Cross-Domain Health Correlation

**Actor**: User or healthcare provider wanting deeper analysis.

### Flow
1. Navigate to Health Report tab
2. Click "NourishAI Intelligence" or the Swarm Analysis panel
3. `swarmService.ts` orchestrates multi-agent analysis:
   - Agent 1: Lab biomarker specialist
   - Agent 2: Neurotransmitter analyst
   - Agent 3: Nutrition optimizer
   - Agent 4: Fitness correlator
4. Agents cross-reference findings and produce:
   - Correlations (e.g., low B12 + GABA deficiency → sleep issues)
   - Recommendations that address multiple domains simultaneously
   - Clinical references and PubMed citations
5. Results displayed in `SwarmAnalysisPanel.tsx`

---

## 24. Searching the Knowledge Base

**Actor**: User who uploaded personal health documents.

### Flow
1. Navigate to Knowledge Base tab
2. Upload files: PDF, TXT, MD, CSV, or recipe notes
3. `knowledgeBaseService.ts` processes and indexes content
4. Search across all uploaded documents
5. AI chat assistant can reference knowledge base documents for context
6. Supports doctor's notes, nutritional research, personal recipes

---

## 25. Voice Interaction

**Actor**: User who prefers hands-free interaction.

### Flow
1. Enable voice in Settings
2. **Voice Input** — Click microphone icon in chat or use `VoiceInput.tsx`
   - Web Speech API converts speech to text
   - Text processed as normal chat input
3. **Voice Output** — `VoiceReaderButton.tsx` reads AI responses aloud
   - Configurable voice speed and voice selection
   - Auto-read mode available (reads every response automatically)

---

## Development Notes for AI Agents

### How to Add a New Feature Module

1. **Create component** in `src/components/[module-name]/`
2. **Add state** to `useStore.ts` or create a new store in `src/store/`
3. **Add service** in `src/services/` for business logic
4. **Add tab** to `TabType` union in `Layout.tsx` and sidebar in `Sidebar.tsx`
5. **Add tour IDs** — Use `id="tour-[module]-[element]"` naming convention
6. **Register tour** — Add tour definition in `guidedTours.ts` and register in `TOUR_REGISTRY`
7. **Add to tab mapping** — Update `getTourForTab()` in `guidedTours.ts`
8. **Update proactive insights** — If the module generates health data, add rules to `proactiveInsights.ts`

### Naming Conventions
| Pattern | Example |
|---|---|
| Tour IDs | `tour-fitness-dashboard`, `tour-labs-scan` |
| Store actions | `addPerson()`, `updateSettings()` |
| Service files | `camelCaseService.ts` |
| Component files | `PascalCase.tsx` |
| Types | `PascalCase` in `src/types/` |

### Data Flow Pattern
```
User Action → Component → Service → AI/Store → Component Re-render
                                      ↓
                              proactiveInsights.ts (cross-domain alerting)
                              crossReferenceEngine.ts (correlation analysis)
```
