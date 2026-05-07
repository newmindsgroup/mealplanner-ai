/**
 * guidedTours — Driver.js powered interactive product tours.
 * Provides guided walkthroughs for every major feature.
 * Each tour is independently triggerable and tracks completion in localStorage.
 */
import { driver, type DriveStep, type Config } from 'driver.js';
import 'driver.js/dist/driver.css';

// ─── Tour Completion Tracking ───────────────────────────────────────────────

const STORAGE_KEY = 'nourishAI_completedTours';

function getCompletedTours(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch { return new Set(); }
}

function markTourComplete(tourId: string) {
  const completed = getCompletedTours();
  completed.add(tourId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

export function isTourCompleted(tourId: string): boolean {
  return getCompletedTours().has(tourId);
}

export function resetAllTours() {
  localStorage.removeItem(STORAGE_KEY);
}

export function resetTour(tourId: string) {
  const completed = getCompletedTours();
  completed.delete(tourId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

// ─── Base Driver Config ─────────────────────────────────────────────────────

const baseConfig: Partial<Config> = {
  showProgress: true,
  showButtons: ['next', 'previous', 'close'],
  animate: true,
  smoothScroll: true,
  stagePadding: 8,
  stageRadius: 12,
  overlayColor: 'rgba(0, 0, 0, 0.65)',
  popoverClass: 'nourishAI-tour-popover',
};

// ─── Tour Definitions ───────────────────────────────────────────────────────

/**
 * DASHBOARD TOUR — runs on first visit to the home page.
 * Covers sidebar, welcome widget, chat panel, and quick actions.
 */
export function startDashboardTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-sidebar',
      popover: {
        title: '📋 Navigation Sidebar',
        description: 'Your command center. Browse 19 specialized tabs — from meal planning to lab analysis to brain assessments. Everything is one click away.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#tour-welcome-widget',
      popover: {
        title: '🏠 Dashboard Home',
        description: 'Your personalized health snapshot. See proactive AI insights, quick stats, and actionable recommendations tailored to your blood type and health goals.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#tour-chat-toggle',
      popover: {
        title: '💬 AI Health Assistant',
        description: 'Ask NourishAI anything — "What should I eat for Type O?", "Analyze my labs", "Build me a workout plan". It understands your full health context.',
        side: 'left',
        align: 'end',
      },
    },
    {
      element: '#tour-proactive-insights',
      popover: {
        title: '🧠 Proactive Insights',
        description: 'AI-generated health alerts based on your data. Urgent warnings appear in red, suggestions in blue. These update automatically as you add more health data.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: '🚀 You\'re Ready!',
        description: 'Start by exploring the sidebar tabs, or chat with the AI assistant. The more data you add (labs, assessments, meal plans), the smarter your recommendations become.\n\nTip: Click the "?" button anytime to replay this tour.',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps,
    onDestroyed: () => {
      markTourComplete('dashboard');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

/**
 * MEAL PLANNING TOUR — covers the weekly planner workflow.
 */
export function startMealPlanTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-meal-plan-header',
      popover: {
        title: '📅 Weekly Meal Plan',
        description: 'Your AI-generated 7-day meal plan, personalized to your blood type. Each meal is chosen from 101+ recipes in our database.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-meal-plan-generate',
      popover: {
        title: '✨ Generate Plan',
        description: 'Click to create a new AI-optimized meal plan. It considers your blood type, allergies, health goals, and pantry inventory.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-meal-plan-day',
      popover: {
        title: '🍽️ Daily Meals',
        description: 'Each day shows breakfast, lunch, dinner, and snacks. Click any meal to see the full recipe, swap it, or mark it as a favorite.',
        side: 'right',
      },
    },
    {
      element: '#tour-meal-plan-grocery',
      popover: {
        title: '🛒 Auto-Grocery List',
        description: 'After generating a plan, your grocery list is automatically created. It consolidates ingredients and removes pantry items you already have.',
        side: 'left',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps: steps.filter(s => !s.element || document.querySelector(s.element)),
    onDestroyed: () => {
      markTourComplete('meal-plan');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

/**
 * RECIPE LIBRARY TOUR — covers search, filters, and detail modals.
 */
export function startRecipeLibraryTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-recipe-search',
      popover: {
        title: '🔍 Smart Recipe Search',
        description: 'Search by name, ingredient, health concern, or cuisine. Try "anti-inflammatory", "salmon", or "5-minute" to see matching recipes.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-recipe-categories',
      popover: {
        title: '📂 Category Tabs',
        description: 'Filter by meal type — Meals, Smoothies, Juices, or Snacks. The number in parentheses shows how many recipes are in each category.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-recipe-filters',
      popover: {
        title: '🎛️ Advanced Filters',
        description: 'Open the filter panel to narrow by blood type compatibility, health focus (brain food, gut health, hormones), prep time, and cuisine type.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-recipe-grid',
      popover: {
        title: '🍲 Recipe Cards',
        description: 'Each card shows the recipe name, category, prep time, and a "Your Type" badge if it\'s compatible with your blood type. Click any card for the full recipe.',
        side: 'top',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps: steps.filter(s => !s.element || document.querySelector(s.element)),
    onDestroyed: () => {
      markTourComplete('recipe-library');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

/**
 * HEALTH REPORT TOUR — covers cross-domain analysis and PDF download.
 */
export function startHealthReportTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-health-report-hero',
      popover: {
        title: '🛡️ Health Intelligence Report',
        description: 'This page brings together ALL your health data — labs, neurotransmitter profile, fitness goals, and meal plans — into one unified view.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-health-report-data-sources',
      popover: {
        title: '📊 Data Sources',
        description: 'Each card represents a data domain. Green "Connected" badges mean that data source has been populated. The more you connect, the smarter your reports become.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-health-report-download',
      popover: {
        title: '📥 Download PDF',
        description: 'Generate a comprehensive PDF health report with all your data — lab biomarkers, neuro profile, supplement schedule, and AI insights. Perfect for sharing with your doctor.',
        side: 'left',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps: steps.filter(s => !s.element || document.querySelector(s.element)),
    onDestroyed: () => {
      markTourComplete('health-report');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

/**
 * FITNESS TOUR — covers training, muscle heatmap, and nutrition bridge.
 */
export function startFitnessTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-fitness-dashboard',
      popover: {
        title: '💪 Fitness Dashboard',
        description: 'Track workouts, view muscle group heatmaps, and get AI-powered training nutrition advice — all tailored to your blood type.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-fitness-workout-log',
      popover: {
        title: '📝 Workout Log',
        description: 'Log your training sessions with exercises, sets, reps, and weights. The app tracks your volume and progress over time.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-fitness-nutrition-bridge',
      popover: {
        title: '🔬 Training Nutrition',
        description: 'The Nutrition-Fitness Bridge shows exactly what to eat before and after your specific workout type — customized for your blood type.',
        side: 'top',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps: steps.filter(s => !s.element || document.querySelector(s.element)),
    onDestroyed: () => {
      markTourComplete('fitness');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

/**
 * SUPPLEMENT TOUR — covers timing, dosage, and blood type notes.
 */
export function startSupplementTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-supplement-schedule',
      popover: {
        title: '💊 Supplement Schedule',
        description: 'Your personalized daily supplement routine organized by time-of-day — morning, afternoon, evening, and bedtime.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-supplement-timing',
      popover: {
        title: '⏰ Timing Matters',
        description: 'Each supplement shows whether to take it with food or on an empty stomach, plus blood-type-specific notes about dosage and absorption.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-supplement-interactions',
      popover: {
        title: '⚠️ Interaction Alerts',
        description: 'Expand any supplement to see potential interactions with other supplements and medications. Some combinations reduce absorption.',
        side: 'top',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps: steps.filter(s => !s.element || document.querySelector(s.element)),
    onDestroyed: () => {
      markTourComplete('supplements');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

/**
 * BRAIN ASSESSMENT TOUR — covers the Braverman test and results.
 */
export function startBrainAssessmentTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-neuro-assessment',
      popover: {
        title: '🧠 Brain Assessment',
        description: 'The Braverman Neurotransmitter Assessment evaluates your dopamine, acetylcholine, GABA, and serotonin levels to identify your dominant nature and any deficiencies.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-neuro-questionnaire',
      popover: {
        title: '📋 Questionnaire',
        description: 'Answer questions about your personality, energy, sleep, and cravings. The AI analyzes your responses to create a neurotransmitter profile.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-neuro-results',
      popover: {
        title: '📊 Your Profile',
        description: 'After completion, see your dominant neurotransmitter nature, deficiency scores, and a personalized nutritional protocol with food and supplement recommendations.',
        side: 'top',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps: steps.filter(s => !s.element || document.querySelector(s.element)),
    onDestroyed: () => {
      markTourComplete('brain-assessment');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

/**
 * LABS TOUR — covers lab scanning, biomarker tracking, and trends.
 */
export function startLabsTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-labs-dashboard',
      popover: {
        title: '🔬 Labs Analysis',
        description: 'Upload or manually enter blood work results. The AI analyzes your biomarkers, flags out-of-range values, and tracks trends over time.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-labs-scan',
      popover: {
        title: '📸 Scan Lab Reports',
        description: 'Take a photo of your lab report and the AI will extract biomarker values automatically using OCR + medical interpretation.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-labs-trends',
      popover: {
        title: '📈 Biomarker Trends',
        description: 'Track how your biomarkers change over time. See visual trend lines with reference ranges to monitor improvements.',
        side: 'top',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps: steps.filter(s => !s.element || document.querySelector(s.element)),
    onDestroyed: () => {
      markTourComplete('labs');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

/**
 * HOUSEHOLD TOUR — covers family management and food comparison.
 */
export function startHouseholdTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-household-dashboard',
      popover: {
        title: '👨‍👩‍👧‍👦 Household Dashboard',
        description: 'Manage your entire family\'s nutrition. Each member gets their own blood type profile, meal plans, and health tracking.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-household-food-comparison',
      popover: {
        title: '🔄 Food Comparison Matrix',
        description: 'See which foods work for everyone in the family and which cause conflicts. Find "universal safe" foods that all blood types can enjoy.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-household-members',
      popover: {
        title: '👤 Family Members',
        description: 'Add family members with their own blood types, allergies, and health goals. Each person gets independent tracking and personalized plans.',
        side: 'top',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps: steps.filter(s => !s.element || document.querySelector(s.element)),
    onDestroyed: () => {
      markTourComplete('household');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

/**
 * FOOD GUIDE TOUR — covers the blood type food compatibility database.
 */
export function startFoodGuideTour(onComplete?: () => void) {
  const steps: DriveStep[] = [
    {
      element: '#tour-food-guide',
      popover: {
        title: '🍎 Blood Type Food Guide',
        description: 'The complete D\'Adamo blood type food compatibility database. See which foods are Beneficial, Neutral, or Avoid for your specific blood type.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-food-guide-search',
      popover: {
        title: '🔍 Food Search',
        description: 'Search for any food to instantly see its compatibility with your blood type. Each result includes health notes and scientific context.',
        side: 'bottom',
      },
    },
    {
      element: '#tour-food-guide-categories',
      popover: {
        title: '📂 Food Categories',
        description: 'Browse by category — meats, seafood, dairy, grains, vegetables, fruits, nuts, and more. Each item is color-coded: green (beneficial), yellow (neutral), red (avoid).',
        side: 'top',
      },
    },
  ];

  const driverObj = driver({
    ...baseConfig,
    steps: steps.filter(s => !s.element || document.querySelector(s.element)),
    onDestroyed: () => {
      markTourComplete('food-guide');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
}

// ─── Tour Registry ──────────────────────────────────────────────────────────

export type TourId =
  | 'dashboard'
  | 'meal-plan'
  | 'recipe-library'
  | 'health-report'
  | 'fitness'
  | 'supplements'
  | 'brain-assessment'
  | 'labs'
  | 'household'
  | 'food-guide';

export const TOUR_REGISTRY: Record<TourId, {
  label: string;
  description: string;
  emoji: string;
  startFn: (onComplete?: () => void) => ReturnType<typeof driver>;
}> = {
  'dashboard': {
    label: 'Dashboard Tour',
    description: 'Learn the basics — sidebar, home, AI chat, and insights',
    emoji: '🏠',
    startFn: startDashboardTour,
  },
  'meal-plan': {
    label: 'Meal Planning',
    description: 'Generate AI meal plans, swap meals, and auto-build grocery lists',
    emoji: '📅',
    startFn: startMealPlanTour,
  },
  'recipe-library': {
    label: 'Recipe Library',
    description: 'Search, filter, and discover 101+ blood-type-aligned recipes',
    emoji: '🍲',
    startFn: startRecipeLibraryTour,
  },
  'health-report': {
    label: 'Health Reports',
    description: 'Cross-domain health intelligence and PDF export',
    emoji: '🛡️',
    startFn: startHealthReportTour,
  },
  'fitness': {
    label: 'Fitness & Training',
    description: 'Workout logging, muscle heatmaps, and training nutrition',
    emoji: '💪',
    startFn: startFitnessTour,
  },
  'supplements': {
    label: 'Supplement Schedule',
    description: 'Daily timing, dosage, interactions, and blood type notes',
    emoji: '💊',
    startFn: startSupplementTour,
  },
  'brain-assessment': {
    label: 'Brain Assessment',
    description: 'Braverman neurotransmitter test and nutritional protocol',
    emoji: '🧠',
    startFn: startBrainAssessmentTour,
  },
  'labs': {
    label: 'Labs Analysis',
    description: 'Blood work scanning, biomarker tracking, and trends',
    emoji: '🔬',
    startFn: startLabsTour,
  },
  'household': {
    label: 'Household',
    description: 'Family management, food comparison, and member profiles',
    emoji: '👨‍👩‍👧‍👦',
    startFn: startHouseholdTour,
  },
  'food-guide': {
    label: 'Food Guide',
    description: 'Blood type food compatibility database',
    emoji: '🍎',
    startFn: startFoodGuideTour,
  },
};

/**
 * Get the tour for a given tab/page.
 */
export function getTourForTab(tab: string): TourId | null {
  const mapping: Record<string, TourId> = {
    'home': 'dashboard',
    'weekly-plan': 'meal-plan',
    'recipes': 'recipe-library',
    'health-report': 'health-report',
    'fitness': 'fitness',
    'supplements': 'supplements',
    'neuro-assessment': 'brain-assessment',
    'labs': 'labs',
    'household': 'household',
    'food-guide': 'food-guide',
  };
  return mapping[tab] || null;
}
