# NourishAI — Complete Feature Reference

> Every feature in the platform, broken down by module with file locations, data dependencies, and integration points.

---

## Table of Contents

1. [Dashboard & Home](#1-dashboard--home)
2. [Weekly Meal Planning](#2-weekly-meal-planning)
3. [Recipe Library](#3-recipe-library)
4. [Blood Type Food Guide](#4-blood-type-food-guide)
5. [AI Chat Assistant](#5-ai-chat-assistant)
6. [Brain Assessment (Braverman)](#6-brain-assessment-braverman)
7. [Fitness & Training](#7-fitness--training)
8. [Labs Analysis](#8-labs-analysis)
9. [Supplement Schedule](#9-supplement-schedule)
10. [Pantry Management](#10-pantry-management)
11. [Label Analyzer](#11-label-analyzer)
12. [Grocery List](#12-grocery-list)
13. [Household Management](#13-household-management)
14. [Health Intelligence Report](#14-health-intelligence-report)
15. [Proactive Insights Engine](#15-proactive-insights-engine)
16. [Interactive Guided Tours](#16-interactive-guided-tours)
17. [Weekly Email Digest](#17-weekly-email-digest)
18. [Settings & Configuration](#18-settings--configuration)
19. [PWA & Offline Support](#19-pwa--offline-support)
20. [PubMed Live Research](#20-pubmed-live-research-integration)
21. [Test Suite (Vitest)](#21-test-suite-vitest)
22. [Lighthouse Audit Results](#lighthouse-audit-results)

---

## 1. Dashboard & Home

**Purpose**: Personalized health snapshot showing proactive AI insights, quick stats, and actionable recommendations.

### Files
| File | Role |
|---|---|
| `src/components/WelcomeWidget.tsx` | Main dashboard UI with health cards |
| `src/components/DashboardHeader.tsx` | Top navigation bar |
| `src/components/shared/ProactiveInsightCards.tsx` | AI-generated health alerts |
| `src/services/proactiveInsights.ts` | Cross-domain insight engine |

### Key Capabilities
- **Proactive Health Alerts** — AI scans labs, neuro profile, fitness, and meals to surface urgent + informational insights
- **Quick Stats Grid** — Meal adherence, workout streak, supplement tracking at a glance
- **Person Switcher** — Toggle between household members to see per-person dashboards
- **Tour IDs**: `tour-welcome-widget`, `tour-proactive-insights`

### Data Dependencies
- `useStore` → `people`, `currentPlan`, lab reports
- `assessmentStore` → neuro profile results
- `proactiveInsights.ts` → cross-references all data domains

---

## 2. Weekly Meal Planning

**Purpose**: AI-generated 7-day meal plans personalized to blood type, allergies, and health goals.

### Files
| File | Role |
|---|---|
| `src/components/WeeklyPlanView.tsx` | 7-day grid UI with PDF export |
| `src/services/aiMealPlanning.ts` | AI meal generation logic |
| `src/services/mealPlanning.ts` | Meal plan data management |
| `src/services/mealPlanExport.ts` | PDF export (jsPDF) |
| `src/services/mealPlanApiService.ts` | Backend API integration |

### Key Capabilities
- **AI Plan Generation** — Creates breakfast, lunch, dinner, snack for 7 days
- **Blood Type Optimization** — Every meal scored for blood type compatibility
- **Meal Swapping** — Click any meal slot to regenerate or pick from library
- **PDF Export** — Download formatted 7-day plan with grocery list
- **Grocery Auto-Generation** — Plan creation triggers grocery list consolidation
- **Tour IDs**: `tour-meal-plan-header`, `tour-meal-plan-generate`, `tour-meal-plan-day`, `tour-meal-plan-grocery`

### Data Flow
```
User clicks "Generate" → aiMealPlanning.ts → OpenAI/Claude API
  → WeeklyPlan stored in useStore → groceryList.ts auto-generates list
  → mealPlanExport.ts creates PDF on demand
```

---

## 3. Recipe Library

**Purpose**: 101+ curated recipes searchable by category, blood type, cuisine, and health benefit.

### Files
| File | Role |
|---|---|
| `src/components/recipes/RecipeDiscovery.tsx` | Search/filter/grid UI |
| `src/data/recipeDatabase.ts` | Core recipe collection |
| `src/data/bloodTypeRecipes.ts` | Blood-type-specific recipes |
| `src/data/internationalRecipes.ts` | Multi-cuisine recipes |
| `src/data/specialtyRecipes.ts` | Specialty/dietary recipes |
| `src/data/dinnerDessertRecipes.ts` | Dinner & dessert collection |
| `src/data/extendedRecipes.ts` | Extended recipe set |
| `src/services/recipeGeneration.ts` | AI recipe creation |

### Key Capabilities
- **Smart Search** — Search by name, ingredient, health concern, or cuisine
- **Category Tabs** — Meals, Smoothies, Juices, Snacks with counts
- **Advanced Filters** — Blood type, health focus, prep time, cuisine type
- **Recipe Cards** — Name, category, prep time, blood type compatibility badge
- **AI Recipe Generation** — Generate new recipes from natural language prompts
- **Tour IDs**: `tour-recipe-search`, `tour-recipe-categories`, `tour-recipe-filters`, `tour-recipe-grid`

---

## 4. Blood Type Food Guide

**Purpose**: Complete D'Adamo blood type food compatibility database with 218KB of food data.

### Files
| File | Role |
|---|---|
| `src/components/BloodTypeFoodGuide.tsx` | Main guide UI |
| `src/components/food-guide/EducationalHeader.tsx` | Educational context |
| `src/components/food-guide/QuickTipsPanel.tsx` | Per-blood-type tips |
| `src/components/food-guide/EnhancedFoodCard.tsx` | Individual food cards |
| `src/components/food-guide/AddFoodModal.tsx` | Custom food addition |
| `src/components/food-guide/MyCustomFoods.tsx` | User-added foods |
| `src/components/food-guide/FoodsToAvoidGuide.tsx` | Avoidance guide |
| `src/data/bloodTypeFoods.ts` | 218KB food database |
| `src/services/foodExportService.ts` | PDF/CSV export |
| `src/services/foodInquiryService.ts` | AI food inquiries |

### Key Capabilities
- **Food Database** — Every food classified as Beneficial/Neutral/Avoid per blood type
- **Search** — Instant lookup with blood type compatibility
- **Category Browse** — Meats, seafood, dairy, grains, vegetables, fruits, nuts, etc.
- **Custom Foods** — Users can add their own foods with AI classification
- **PDF/CSV Export** — Download complete food guides
- **NourishAI Intelligence** — Swarm analysis for deep food research
- **Tour IDs**: `tour-food-guide`, `tour-food-guide-search`, `tour-food-guide-categories`

---

## 5. AI Chat Assistant

**Purpose**: Context-aware conversational AI that understands the user's full health profile.

### Files
| File | Role |
|---|---|
| `src/components/ChatPanel.tsx` | Floating chat UI |
| `src/components/chat/SwarmAgentPanel.tsx` | Multi-agent analysis panel |
| `src/services/chatService.ts` | Chat orchestration |
| `src/services/chatDataRouter.ts` | Intent detection & data routing |
| `src/services/aiService.ts` | OpenAI/Anthropic API client |
| `src/services/aiToolCallService.ts` | Function calling support |
| `src/services/smartAutofill.ts` | Cross-form intelligence |
| `src/store/useChatSessionStore.ts` | Chat session state |

### Key Capabilities
- **Natural Language Interface** — Ask anything about nutrition, labs, fitness, etc.
- **Data Router** — Automatically detects intent (meal planning, lab question, food inquiry) and routes to the correct service
- **Full Context** — Considers blood type, allergies, goals, lab results, neuro profile
- **Tool Calling** — AI can generate meal plans, look up foods, analyze labs via function calls
- **Smart Autofill** — Chat responses can pre-fill forms across the platform
- **Swarm Analysis** — Multi-agent deep research panel for complex queries
- **Voice I/O** — Speech-to-text input + text-to-speech output
- **Tour ID**: `tour-chat-toggle`

### Data Router Intelligence
The `chatDataRouter.ts` detects 12+ intent categories:
- Meal planning requests → `aiMealPlanning.ts`
- Food compatibility questions → `foodInquiryService.ts`
- Lab result questions → lab store data
- Recipe requests → `recipeGeneration.ts`
- Supplement questions → `supplementTimingDatabase.ts`
- General health → `aiService.ts`

---

## 6. Brain Assessment (Braverman)

**Purpose**: Neurotransmitter profiling via the Braverman Nature Assessment with AI-generated nutritional protocols.

### Files
| File | Role |
|---|---|
| `src/components/assessment/NeuroAssessment.tsx` | Assessment flow controller |
| `src/components/assessment/ConversationalAssessment.tsx` | AI chat-based assessment |
| `src/components/assessment/NeuroReport.tsx` | Results visualization |
| `src/components/assessment/DailyNeuroCheckIn.tsx` | Daily mood/energy tracking |
| `src/components/assessment/HouseholdAssessmentDashboard.tsx` | Family assessment hub |
| `src/store/assessmentStore.ts` | Assessment state (multi-person) |
| `src/services/aiNeuroAnalysis.ts` | AI protocol generation |
| `src/lib/data/bravermanQuestions.json` | 120 assessment questions |

### Key Capabilities
- **Two Assessment Modes**:
  - **Standard Questionnaire** — 120 True/False questions (~15-20 min)
  - **Conversational AI (Dr. Neura)** — Natural dialogue until 90% confidence (~10-30 min)
- **Neurotransmitter Profiling** — Scores Dopamine, Acetylcholine, GABA, Serotonin
- **Dominant Nature** — Identifies your primary neurotransmitter type
- **Deficiency Detection** — Flags neurotransmitter deficiencies with severity levels
- **AI Protocol Generation** — Personalized dietary, supplement, and lifestyle recommendations
- **Daily Check-In** — Track mood, energy, sleep to detect neurotransmitter drift over time
- **Multi-Person** — Each family member gets independent assessment and tracking
- **Radar + Bar Charts** — Recharts visualization of nature scores and deficiencies
- **NourishAI Deep Intelligence** — PubMed research, drug interactions, clinical protocols via swarm
- **Tour IDs**: `tour-neuro-assessment`, `tour-neuro-questionnaire`, `tour-neuro-results`

---

## 7. Fitness & Training

**Purpose**: Full workout tracking, training nutrition, and body composition analysis.

### Files (33 components)
| File | Role |
|---|---|
| `src/components/fitness/FitnessDashboard.tsx` | Main fitness hub |
| `src/components/fitness/WorkoutPlanView.tsx` | Weekly training plan |
| `src/components/fitness/WorkoutSessionTracker.tsx` | Live session tracking |
| `src/components/fitness/WorkoutLibrary.tsx` | Exercise database (978KB) |
| `src/components/fitness/MuscleHeatmap.tsx` | Visual muscle group activation |
| `src/components/fitness/NutritionFitnessBridge.tsx` | Pre/post-workout nutrition |
| `src/components/fitness/ProgressCharts.tsx` | Performance trend charts |
| `src/components/fitness/BodyAnalysis.tsx` | Body composition tracking |
| `src/components/fitness/AiCoachChat.tsx` | AI fitness coach |
| `src/components/fitness/CustomPlanBuilder.tsx` | Custom workout plan creation |
| `src/components/fitness/FamilyChallenges.tsx` | Family fitness challenges |
| `src/components/fitness/FamilyLeaderboard.tsx` | Family competition board |
| `src/components/fitness/SleepStressTracker.tsx` | Sleep & stress monitoring |
| `src/components/fitness/WaterTracker.tsx` | Hydration tracking |
| `src/components/fitness/GuidedBreathing.tsx` | Breathing exercises |
| `src/components/fitness/CircadianMealTimer.tsx` | Circadian meal timing |
| `src/components/fitness/EnergyBalance.tsx` | Calorie in/out balance |
| `src/components/fitness/AdaptivePeriodization.tsx` | Training periodization |
| `src/components/fitness/InjuryPreventionEngine.tsx` | Injury risk analysis |
| `src/components/fitness/WeeklyInsightsAI.tsx` | AI weekly analysis |
| `src/data/exerciseDatabase.ts` | 978KB exercise library |
| `src/data/exerciseNutritionDatabase.ts` | Exercise-nutrition mappings |
| `src/services/fitnessService.ts` | Fitness API client |

### Sub-Tabs
The fitness dashboard has 5 internal tabs:
1. **Workouts** — Plan view, session tracking, exercise library
2. **Progress** — Charts, streaks, body composition
3. **Nutrition** — Training nutrition bridge, circadian timer
4. **Body** — Muscle heatmap, body analysis, injury prevention
5. **Challenges** — Family challenges and leaderboard

- **Tour IDs**: `tour-fitness-dashboard`, `tour-fitness-workout-log`, `tour-fitness-nutrition-bridge`

---

## 8. Labs Analysis

**Purpose**: Upload, track, and analyze blood work results with AI interpretation.

### Files
| File | Role |
|---|---|
| `src/components/labs/LabsDashboard.tsx` | Labs overview with stats |
| `src/components/labs/LabScanner.tsx` | OCR lab report scanning |
| `src/components/labs/LabReportView.tsx` | Individual report viewer |
| `src/components/labs/LabHistory.tsx` | Historical report browser |
| `src/components/labs/LabEducation.tsx` | Biomarker education |
| `src/components/labs/LabsRouter.tsx` | Internal routing |
| `src/services/labScanning.ts` | OCR + AI extraction |
| `src/services/labExtractionAI.ts` | AI biomarker parsing |
| `src/services/labAlerts.ts` | Out-of-range alerting |
| `src/services/labExport.ts` | PDF/CSV export |
| `src/data/biomarkerDatabase.ts` | 22KB biomarker reference |
| `src/data/labEducation.ts` | 29KB educational content |
| `src/types/labs.ts` | Lab type definitions |

### Key Capabilities
- **OCR Scanning** — Camera/upload → Tesseract.js → AI extraction of biomarker values
- **Manual Entry** — Add results manually with reference ranges
- **Biomarker Tracking** — Track 50+ biomarkers over time with trend charts
- **Alert System** — Flags critical, high, low values with severity levels
- **Trend Analysis** — Visual trend lines with reference range bands
- **Educational Content** — Explains what each biomarker measures and why it matters
- **Cross-Domain Correlation** — Links lab values to neurotransmitter and nutrition data
- **PDF Export** — Professional lab report export
- **Tour IDs**: `tour-labs-dashboard`, `tour-labs-scan`, `tour-labs-trends`

---

## 9. Supplement Schedule

**Purpose**: Personalized daily supplement timing organized by time-of-day with interaction warnings.

### Files
| File | Role |
|---|---|
| `src/components/shared/SupplementScheduleView.tsx` | Schedule UI |
| `src/data/supplementTimingDatabase.ts` | 17KB supplement database |
| `src/data/interactionDatabase.ts` | 17KB interaction rules |

### Key Capabilities
- **Time Slots** — Morning, Afternoon, Evening, Bedtime, Any Time
- **Per-Supplement Details** — Dosage range, meal timing, absorption notes
- **Blood Type Notes** — Type-specific dosage adjustments
- **Interaction Warnings** — Flags supplement-supplement and supplement-medication conflicts
- **Take With / Avoid With** — Synergy and conflict guidance
- **Tour IDs**: `tour-supplement-schedule`, `tour-supplement-timing`, `tour-supplement-interactions`

---

## 10. Pantry Management

**Purpose**: Full kitchen inventory tracking with expiration alerts and barcode scanning.

### Files
| File | Role |
|---|---|
| `src/components/pantry/` | Pantry UI components |
| `src/services/pantryService.ts` | Pantry CRUD logic |
| `src/services/pantryInventory.ts` | Inventory management |
| `src/services/pantryScanning.ts` | Camera scanning |
| `src/services/pantryNotifications.ts` | Expiration/low-stock alerts |
| `src/services/barcodeScanning.ts` | ZXing barcode reader |
| `src/services/productEnrichment.ts` | Product data enrichment |
| `src/services/csvImport.ts` | Bulk CSV import |
| `src/types/pantry.ts` | Pantry type definitions |

### Key Capabilities
- **Item Tracking** — Name, category, quantity, location, expiration date
- **Barcode Scanning** — ZXing library for quick item identification
- **Expiration Alerts** — Configurable notifications for approaching expiry
- **Low Stock Alerts** — Automatic alerts when items run low
- **CSV Import** — Bulk import from spreadsheets
- **Usage History** — Track consumption patterns over time
- **Smart Grocery Integration** — Low-stock items auto-added to grocery list
- **Product Enrichment** — AI-powered product data lookup

---

## 11. Label Analyzer

**Purpose**: OCR-powered food label scanning with blood type conflict detection.

### Files
| File | Role |
|---|---|
| `src/components/LabelAnalyzer.tsx` | Scanner UI (32KB) |
| `src/services/labelAnalysis.ts` | AI analysis logic |
| `src/services/groceryScanning.ts` | Grocery item scanning |

### Key Capabilities
- **Camera Capture** — Take photo of any food label
- **OCR Extraction** — Tesseract.js reads ingredient text
- **AI Analysis** — Identifies harmful additives, allergens, blood type conflicts
- **Health Score** — 0-100 score based on ingredient quality
- **Safety Flags** — Safe/Caution/Warning/Danger ratings
- **Blood Type Compatibility** — Per-ingredient compatibility check
- **Three Scan Modes** — Supplement labels, pantry items, grocery products

---

## 12. Grocery List

**Purpose**: Auto-generated categorized shopping lists from meal plans.

### Files
| File | Role |
|---|---|
| `src/components/GroceryListView.tsx` | Shopping list UI |
| `src/services/groceryList.ts` | List generation logic |
| `src/services/groceryApiService.ts` | Backend API client |

### Key Capabilities
- **Auto-Generation** — Created automatically from weekly meal plans
- **Category Grouping** — Items grouped by store section
- **Pantry Deduction** — Removes items already in pantry
- **Check-Off** — Mark items as purchased
- **Quantity Consolidation** — Merges duplicate ingredients with summed quantities

---

## 13. Household Management

**Purpose**: Multi-family management with role-based access and food comparison.

### Files
| File | Role |
|---|---|
| `src/components/household/HouseholdDashboard.tsx` | Household overview |
| `src/components/household/HouseholdFoodComparison.tsx` | Family food matrix |
| `src/components/household/HouseholdSettings.tsx` | Household config |
| `src/components/household/MemberCard.tsx` | Member profile card |
| `src/components/household/MemberList.tsx` | Member list view |
| `src/components/household/CreateHouseholdModal.tsx` | Create household flow |
| `src/services/householdService.ts` | Household CRUD |
| `src/services/householdFoodComparison.ts` | Food compatibility engine |
| `src/services/invitationService.ts` | Email invitation system |
| `src/contexts/HouseholdContext.tsx` | Household React context |

### Key Capabilities
- **Role System** — Owner, Admin, Member, Viewer with granular permissions
- **Food Comparison Matrix** — Side-by-side blood type compatibility for all family members
- **Universal Safe Foods** — Identifies foods safe for everyone in the household
- **Conflict Detection** — Flags foods that are beneficial for some but harmful for others
- **Email Invitations** — Token-based invitation system
- **Tour IDs**: `tour-household-dashboard`, `tour-household-food-comparison`, `tour-household-members`

---

## 14. Health Intelligence Report

**Purpose**: Cross-domain health analysis combining labs, neuro, fitness, and nutrition.

### Files
| File | Role |
|---|---|
| `src/components/reports/CrossDomainHealthReport.tsx` | Report UI |
| `src/services/healthReportPDF.ts` | PDF generation (22KB) |
| `src/services/crossReferenceEngine.ts` | Cross-domain analysis (24KB) |
| `src/services/weeklyDigest.ts` | Email digest generator |

### Key Capabilities
- **Data Source Tracking** — Shows which domains have data (labs, neuro, fitness, meals)
- **Cross-Domain Insights** — AI correlates biomarkers with neurotransmitter levels and diet
- **PDF Export** — Professional health report with all data domains
- **Email Digest Preview** — Branded weekly health summary email
- **NourishAI Swarm** — Deep multi-agent analysis for clinical-grade insights
- **Tour IDs**: `tour-health-report-hero`, `tour-health-report-data-sources`, `tour-health-report-download`

---

## 15. Proactive Insights Engine

**Purpose**: AI that continuously scans all health data and surfaces actionable alerts.

### Files
| File | Role |
|---|---|
| `src/services/proactiveInsights.ts` | Insight generation engine (21KB) |
| `src/components/shared/ProactiveInsightCards.tsx` | Card display component |

### Key Capabilities
- **Cross-Domain Scanning** — Monitors labs, neuro profile, fitness, supplements, meals
- **Priority Levels** — Urgent (red), Warning (amber), Info (blue), Positive (green)
- **Actionable Recommendations** — Each insight includes specific next steps
- **Auto-Refresh** — Re-evaluates when any data source changes
- **Examples**:
  - "Your Vitamin D is low and you're GABA-deficient — both affect sleep quality"
  - "Your workout volume increased 30% but protein intake hasn't matched"

---

## 16. Interactive Guided Tours

**Purpose**: Driver.js-powered interactive walkthroughs for every platform feature.

### Files
| File | Role |
|---|---|
| `src/services/guidedTours.ts` | Tour registry (20KB, 10 tours) |
| `src/components/shared/HelpCenter.tsx` | Floating help panel + keyboard listener |
| `src/index.css` (lines 556-663) | Custom NourishAI popover theme |

### Tours Available
| Tour ID | Module | Steps |
|---|---|---|
| `dashboard` | Home | 5 |
| `meal-plan` | Weekly Plan | 4 |
| `recipe-library` | Recipes | 4 |
| `health-report` | Health Report | 3 |
| `fitness` | Fitness | 3 |
| `supplements` | Supplements | 3 |
| `brain-assessment` | Brain Assessment | 3 |
| `labs` | Labs | 3 |
| `household` | Household | 3 |
| `food-guide` | Food Guide | 3 |

### Key Capabilities
- **Contextual Suggestions** — HelpCenter shows the tour relevant to the current tab
- **Progress Tracking** — localStorage tracks which tours have been completed
- **Auto-Trigger** — Dashboard tour auto-launches 2s after first profile setup
- **Keyboard Shortcut** — Press `?` anywhere to toggle the Help Center
- **Reset** — Individual or bulk tour reset
- **Custom Theme** — Emerald gradient popovers with smooth animations

---

## 17. Weekly Email Digest

**Purpose**: HTML email template generator summarizing weekly health data.

### Files
| File | Role |
|---|---|
| `src/services/weeklyDigest.ts` | Template generator |

### Key Capabilities
- **Inline CSS** — Email-client-safe with table-based layout
- **Sections**: Greeting, stats grid, health benefits, lab alerts, action items, CTA
- **Functions**: `collectDigestData()`, `generateDigestHTML()`, `downloadDigestHTML()`, `openDigestPreview()`
- **Integration** — Accessible via "Email Digest" button in Health Report

---

## 18. Settings & Configuration

### Files
| File | Role |
|---|---|
| `src/components/SettingsPanel.tsx` | Settings UI |
| `src/components/APIKeySettings.tsx` | API key management |
| `src/components/SMTPSettings.tsx` | Email server config |
| `src/components/NotificationPreferences.tsx` | Alert preferences |
| `src/components/ProfileSetup.tsx` | Initial profile wizard |
| `src/components/OnboardingWizard.tsx` | First-time setup flow |

### Configurable Settings
- Dark mode, voice, language, emoji preferences
- OpenAI / Anthropic API key management
- SMTP email server configuration
- Notification preferences (frequency, channels, types)
- Chef mode, cultural adaptation, seasonal adaptation

---

## 19. PWA & Offline Support

### Files
| File | Role |
|---|---|
| `src/components/PWAInstallPrompt.tsx` | Install prompt |
| `src/components/OfflineIndicator.tsx` | Offline status bar |
| `vite.config.ts` | PWA plugin config |

### Key Capabilities
- **Installable** — Add to home screen on mobile/desktop
- **Service Worker** — Workbox-powered with 72 precached entries
- **Offline Indicator** — Visual banner when network is unavailable
- **Local-First** — All data stored in localStorage, works without backend

---

## Architecture Overview

```
src/
├── components/          # 34 files + 15 subdirectories
│   ├── assessment/      # 5 files — Brain Assessment
│   ├── auth/            # Auth components
│   ├── chat/            # Chat sub-components
│   ├── fitness/         # 33 files — Fitness module
│   ├── food-guide/      # 6 files — Food guide components
│   ├── household/       # 6 files — Household management
│   ├── labs/            # 6 files — Lab analysis
│   ├── pantry/          # Pantry management
│   ├── recipes/         # Recipe discovery
│   ├── reports/         # Health reports
│   ├── shared/          # 6 files — HelpCenter, Supplements, etc.
│   └── ...              # 34 root-level components
├── services/            # 52 service files (+pubmedService.ts)
│   └── __tests__/       # 5 test suites (62 tests)
├── store/               # 3 Zustand stores
├── data/                # 15 static data files (1.5MB total)
├── types/               # Type definitions
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── test/                # Vitest global setup
└── utils/               # Utility functions
```

### State Management
| Store | File | Size | Purpose |
|---|---|---|---|
| Main Store | `useStore.ts` | 32KB | People, plans, pantry, labs, settings, everything |
| Assessment Store | `assessmentStore.ts` | 16KB | Multi-person neuro assessment state |
| Chat Session Store | `useChatSessionStore.ts` | 8KB | Chat history and sessions |

### AI Service Architecture
```
User Request
  → chatDataRouter.ts (intent detection)
    → aiService.ts (OpenAI/Anthropic client)
      → aiMealPlanning.ts (meal generation)
      → aiNeuroAnalysis.ts (neuro protocols)
      → aiToolCallService.ts (function calling)
        → pubmedService.ts (direct NCBI E-utilities)
      → recipeGeneration.ts (recipe creation)
      → foodInquiryService.ts (food queries)
      → labelAnalysis.ts (label scanning)
      → labExtractionAI.ts (lab OCR)
```

---

## 20. PubMed Live Research Integration

**Purpose**: Direct NCBI PubMed API integration providing verified biomedical citations for supplement protocols, neurotransmitter research, and cross-domain health correlations.

### Files
| File | Role |
|---|---|
| `src/services/pubmedService.ts` | Direct NCBI E-utilities client |
| `src/services/aiToolCallService.ts` | PubMed as a tool call fallback (line 243+) |
| `src/services/__tests__/pubmedService.test.ts` | Citation formatting tests |

### API Details
- **Base URL**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils`
- **Endpoints Used**: `esearch.fcgi` (search), `efetch.fcgi` (article details)
- **Rate Limit**: 3 req/sec (free), 10 req/sec (with API key)
- **XML Parsing**: Browser-native `DOMParser` — no dependencies

### Key Functions
| Function | Purpose |
|---|---|
| `searchPubMed(query, max)` | General article search |
| `fetchArticleByPMID(pmid)` | Fetch specific article |
| `searchSupplementEvidence(name)` | Clinical trials + meta-analyses for a supplement |
| `searchNeuroNutrition(neurotransmitter)` | Neurotransmitter-diet correlation studies |
| `searchBloodTypeDiet(bloodType)` | ABO blood group dietary evidence |
| `searchBiomarkerNutrient(biomarker, nutrient)` | Biomarker-nutrient interaction studies |
| `formatCitation(article)` | Standard citation string |
| `formatReferenceList(articles)` | Numbered reference list with URLs |

### Integration Pattern
The `aiToolCallService.ts` now uses a **cascade pattern**:
1. Try backend `/api/research/search` (for swarm-orchestrated searches)
2. Fall back to **direct PubMed E-utilities** via `pubmedService.ts`
3. Return empty result with source attribution on failure

This ensures PubMed citations work even without the backend server running.

---

## 21. Test Suite (Vitest)

**Purpose**: Regression safety net covering critical business logic across 5 test suites.

### Files
| File | Tests | Coverage |
|---|---|---|
| `src/services/__tests__/groceryList.test.ts` | 8 | Category classification, deduplication, sorting |
| `src/services/__tests__/guidedTours.test.ts` | 21 | Tour registry integrity, tab mapping, completion tracking |
| `src/services/__tests__/householdFoodComparison.test.ts` | 10 | Report generation, universal safe foods, conflicts |
| `src/services/__tests__/weeklyDigest.test.ts` | 10 | HTML structure, data injection, inline styles |
| `src/services/__tests__/pubmedService.test.ts` | 13 | Citation formatting, reference lists, module exports |
| `src/test/setup.ts` | — | Global test setup (jest-dom, localStorage mock) |

### Configuration
- **Runner**: Vitest v4 (configured in `vite.config.ts`)
- **Environment**: jsdom
- **Commands**:
  - `npm test` — Run all tests once
  - `npm run test:watch` — Watch mode for development

### What's Tested
- ✅ Grocery list consolidation and category mapping
- ✅ Tour registry completeness (all 10 tours)
- ✅ Tab-to-tour mapping (all 10 navigable tabs)
- ✅ localStorage-based tour completion tracking
- ✅ Household food comparison matrix logic
- ✅ Email digest HTML structure and data injection
- ✅ PubMed citation formatting and reference lists
- ✅ Module export verification for all public APIs

### Adding New Tests
New test files should follow the pattern:
```
src/services/__tests__/<serviceName>.test.ts
```
All tests inherit the global setup from `src/test/setup.ts`.

---

## Lighthouse Audit Results

Last audit run: May 2026

| Category | Score | Status |
|---|---|---|
| Performance | 66/100 | 🟡 |
| Accessibility | 72/100 | 🟡 |
| Best Practices | 96/100 | 🟢 |
| SEO | 92/100 | 🟢 |

### Performance Metrics
| Metric | Value |
|---|---|
| First Contentful Paint | 0.6s |
| Largest Contentful Paint | 36.3s* |
| Total Blocking Time | 350ms |
| Cumulative Layout Shift | 0 |

*Note: LCP is elevated due to the landing page's large hero with animated background. The authenticated dashboard loads significantly faster.

### Accessibility Items to Address
- 2 buttons missing accessible names
- 1 heading order violation
- 3 links missing discernible names
- Missing `<main>` landmark
- Select elements missing labels

