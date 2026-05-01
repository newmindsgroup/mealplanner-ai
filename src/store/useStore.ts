import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Person,
  WeeklyPlan,
  GroceryList,
  LabelAnalysis,
  KnowledgeBaseFile,
  Settings,
  Progress,
  ChatMessage,
  Meal,
  PantryItem,
  PantrySettings,
  LowStockAlert,
  ExpirationAlert,
  UsageRecord,
  PantryStats,
  CustomFieldTemplate,
  FoodCategory,
} from '../types';
import type { 
  LabReport, 
  LabResult, 
  LabAlert, 
  LabTrend, 
  LabAnalyticsSummary,
  TrendDirection,
  LabInsight,
} from '../types/labs';
import type { EmailNotification } from '../types/notifications';
import { defaultSMTPSettings, defaultNotificationPreferences } from '../types/notifications';
import { migratePeople, migratePerson } from '../utils/migrateBloodTypes';

interface AppState {
  // People/Profiles
  people: Person[];
  addPerson: (person: Person) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;
  removePerson: (id: string) => void;
  
  // Plans
  currentPlan: WeeklyPlan | null;
  plans: WeeklyPlan[];
  setCurrentPlan: (plan: WeeklyPlan | null) => void;
  addPlan: (plan: WeeklyPlan) => void;
  
  // Grocery Lists
  groceryLists: GroceryList[];
  currentGroceryList: GroceryList | null;
  setCurrentGroceryList: (list: GroceryList | null) => void;
  addGroceryList: (list: GroceryList) => void;
  updateGroceryItem: (listId: string, itemId: string, checked: boolean) => void;
  
  // Label Analysis
  labelAnalyses: LabelAnalysis[];
  addLabelAnalysis: (analysis: LabelAnalysis) => void;
  
  // Pantry Scans
  pantryScans: import('../types').PantryScanResult[];
  addPantryScan: (scan: import('../types').PantryScanResult) => void;
  
  // Grocery Scans
  groceryScans: import('../types').GroceryScanResult[];
  addGroceryScan: (scan: import('../types').GroceryScanResult) => void;
  
  // Knowledge Base
  knowledgeBase: KnowledgeBaseFile[];
  addKnowledgeFile: (file: KnowledgeBaseFile) => void;
  removeKnowledgeFile: (id: string) => void;
  
  // Favorites
  favoriteMeals: Meal[];
  toggleFavorite: (meal: Meal) => void;
  
  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Progress
  progress: Progress;
  updateProgress: (progress: Partial<Progress>) => void;
  addXP: (amount: number) => void;
  completeMeal: () => void;
  
  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  
  // Email notifications
  emailNotifications: EmailNotification[];
  addEmailNotification: (notification: EmailNotification) => void;
  updateEmailNotification: (id: string, updates: Partial<EmailNotification>) => void;
  removeEmailNotification: (id: string) => void;
  
  // Notification history
  notificationHistory: EmailNotification[];
  addToHistory: (notification: EmailNotification) => void;
  clearHistory: () => void;
  
  // Food Guide
  userFoodGuides: import('../types').UserFoodGuide[];
  addCustomFood: (userId: string, food: import('../data/bloodTypeFoods').FoodItem) => void;
  removeCustomFood: (userId: string, foodId: string) => void;
  toggleFoodVisibility: (userId: string, foodId: string) => void;
  
  // Food Inquiries
  foodInquiries: import('../types').FoodInquiry[];
  addFoodInquiry: (inquiry: import('../types').FoodInquiry) => void;
  
  // Pantry Management
  pantryItems: PantryItem[];
  pantrySettings: PantrySettings;
  lowStockAlerts: LowStockAlert[];
  expirationAlerts: ExpirationAlert[];
  customFieldTemplates: CustomFieldTemplate[];
  
  // Pantry Actions
  addPantryItem: (item: PantryItem) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  removePantryItem: (id: string) => void;
  adjustPantryQuantity: (id: string, quantityChange: number) => void;
  recordUsage: (itemId: string, quantityUsed: number, usedInMeal?: string) => void;
  
  // Pantry Settings
  updatePantrySettings: (settings: Partial<PantrySettings>) => void;
  
  // Custom Field Templates
  addCustomFieldTemplate: (template: CustomFieldTemplate) => void;
  updateCustomFieldTemplate: (id: string, updates: Partial<CustomFieldTemplate>) => void;
  deleteCustomFieldTemplate: (id: string) => void;
  getTemplatesForCategory: (category: FoodCategory) => CustomFieldTemplate[];
  
  // Alerts
  addLowStockAlert: (alert: LowStockAlert) => void;
  acknowledgeLowStockAlert: (alertId: string) => void;
  removeLowStockAlert: (alertId: string) => void;
  addExpirationAlert: (alert: ExpirationAlert) => void;
  acknowledgeExpirationAlert: (alertId: string) => void;
  removeExpirationAlert: (alertId: string) => void;
  
  // Pantry Analytics
  getPantryStats: () => PantryStats;
  getLowStockItems: () => PantryItem[];
  getExpiringItems: (days?: number) => PantryItem[];
  getExpiredItems: () => PantryItem[];
  
  // Lab Management
  labReports: LabReport[];
  labAlerts: LabAlert[];
  labInsights: LabInsight[];
  
  // Lab Actions
  addLabReport: (report: LabReport) => void;
  updateLabReport: (id: string, updates: Partial<LabReport>) => void;
  deleteLabReport: (id: string) => void;
  updateLabResult: (reportId: string, resultId: string, updates: Partial<LabResult>) => void;
  
  // Lab Alerts
  addLabAlert: (alert: LabAlert) => void;
  acknowledgeLabAlert: (alertId: string) => void;
  removeLabAlert: (alertId: string) => void;
  getActiveLabAlerts: (memberId?: string) => LabAlert[];
  
  // Lab Insights
  addLabInsight: (insight: LabInsight) => void;
  dismissLabInsight: (insightId: string) => void;
  getLabInsights: (memberId: string) => LabInsight[];
  
  // Lab Analytics and Getters
  getLabsForMember: (memberId: string) => LabReport[];
  getLabTrends: (memberId: string, testName: string) => LabTrend | null;
  getAbnormalLabs: (memberId: string) => LabResult[];
  getLatestLabReport: (memberId: string) => LabReport | null;
  getLabAnalyticsSummary: (memberId: string) => LabAnalyticsSummary;
  getAllLabResults: (memberId: string) => LabResult[];
}

const defaultSettings: Settings = {
  darkMode: false,
  voiceEnabled: true,
  voiceSpeed: 1.0,
  voiceSelection: 'default',
  autoReadResponses: true,
  emojisEnabled: true,
  chefMode: false,
  culturalAdaptation: true,
  seasonalAdaptation: true,
  language: 'en',
  smtp: defaultSMTPSettings,
  notifications: defaultNotificationPreferences,
};

const defaultPantrySettings: PantrySettings = {
  enableLowStockAlerts: true,
  enableExpirationAlerts: true,
  expirationAlertDays: 3,
  enableEmailNotifications: false,
  enableInAppNotifications: true,
  defaultLocation: 'pantry',
  defaultLowStockThreshold: 1,
  defaultView: 'grid',
  sortBy: 'name',
  sortOrder: 'asc',
  showEmptyCategories: false,
  enableUsageTracking: true,
  enableAISuggestions: true,
  enableBarcodeScanning: true,
  autoAddToGroceryList: true,
  enablePriceTracking: false,
};

const defaultProgress: Progress = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  streak: 0,
  badges: [],
  mealsCompleted: 0,
  weeklyActivity: [],
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // People
      people: [],
      addPerson: (person) => set((state) => ({ people: [...state.people, person] })),
      updatePerson: (id, updates) =>
        set((state) => ({
          people: state.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      removePerson: (id) =>
        set((state) => ({ people: state.people.filter((p) => p.id !== id) })),
      
      // Plans
      currentPlan: null,
      plans: [],
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      addPlan: (plan) =>
        set((state) => ({
          plans: [...state.plans, plan],
          currentPlan: plan,
        })),
      
      // Grocery Lists
      groceryLists: [],
      currentGroceryList: null,
      setCurrentGroceryList: (list) => set({ currentGroceryList: list }),
      addGroceryList: (list) =>
        set((state) => ({
          groceryLists: [...state.groceryLists, list],
          currentGroceryList: list,
        })),
      updateGroceryItem: (listId, itemId, checked) =>
        set((state) => ({
          groceryLists: state.groceryLists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.id === itemId ? { ...item, checked } : item
                  ),
                }
              : list
          ),
          currentGroceryList:
            state.currentGroceryList?.id === listId
              ? {
                  ...state.currentGroceryList,
                  items: state.currentGroceryList.items.map((item) =>
                    item.id === itemId ? { ...item, checked } : item
                  ),
                }
              : state.currentGroceryList,
        })),
      
      // Label Analysis
      labelAnalyses: [],
      addLabelAnalysis: (analysis) =>
        set((state) => ({ labelAnalyses: [...state.labelAnalyses, analysis] })),
      
      // Pantry Scans
      pantryScans: [],
      addPantryScan: (scan) =>
        set((state) => ({ pantryScans: [...state.pantryScans, scan] })),
      
      // Grocery Scans
      groceryScans: [],
      addGroceryScan: (scan) =>
        set((state) => ({ groceryScans: [...state.groceryScans, scan] })),
      
      // Knowledge Base
      knowledgeBase: [],
      addKnowledgeFile: (file) =>
        set((state) => ({ knowledgeBase: [...state.knowledgeBase, file] })),
      removeKnowledgeFile: (id) =>
        set((state) => ({ knowledgeBase: state.knowledgeBase.filter((f) => f.id !== id) })),
      
      // Favorites
      favoriteMeals: [],
      toggleFavorite: (meal) =>
        set((state) => {
          const exists = state.favoriteMeals.some((m) => m.id === meal.id);
          return {
            favoriteMeals: exists
              ? state.favoriteMeals.filter((m) => m.id !== meal.id)
              : [...state.favoriteMeals, meal],
          };
        }),
      
      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      
      // Progress
      progress: defaultProgress,
      updateProgress: (updates) =>
        set((state) => ({
          progress: { ...state.progress, ...updates },
        })),
      addXP: (amount) =>
        set((state) => {
          const newXP = state.progress.xp + amount;
          const xpToNext = state.progress.xpToNextLevel;
          if (newXP >= xpToNext) {
            return {
              progress: {
                ...state.progress,
                xp: newXP - xpToNext,
                level: state.progress.level + 1,
                xpToNextLevel: xpToNext + 50,
              },
            };
          }
          return {
            progress: { ...state.progress, xp: newXP },
          };
        }),
      completeMeal: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            mealsCompleted: state.progress.mealsCompleted + 1,
          },
        })),
      
      // Chat
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      clearChat: () => set({ chatMessages: [] }),
      
      // Onboarding
      onboardingComplete: false,
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      
      // Email notifications
      emailNotifications: [],
      addEmailNotification: (notification) =>
        set((state) => ({ emailNotifications: [...state.emailNotifications, notification] })),
      updateEmailNotification: (id, updates) =>
        set((state) => ({
          emailNotifications: state.emailNotifications.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
        })),
      removeEmailNotification: (id) =>
        set((state) => ({
          emailNotifications: state.emailNotifications.filter((n) => n.id !== id),
        })),
      
      // Notification history
      notificationHistory: [],
      addToHistory: (notification) =>
        set((state) => ({ notificationHistory: [...state.notificationHistory, notification] })),
      clearHistory: () => set({ notificationHistory: [] }),
      
      // Food Guide
      userFoodGuides: [],
      addCustomFood: (userId, food) =>
        set((state) => {
          const existingGuide = state.userFoodGuides.find((g) => g.userId === userId);
          if (existingGuide) {
            return {
              userFoodGuides: state.userFoodGuides.map((g) =>
                g.userId === userId
                  ? {
                      ...g,
                      customFoods: [...g.customFoods, food],
                      lastUpdated: new Date().toISOString(),
                    }
                  : g
              ),
            };
          }
          return state;
        }),
      removeCustomFood: (userId, foodId) =>
        set((state) => ({
          userFoodGuides: state.userFoodGuides.map((g) =>
            g.userId === userId
              ? {
                  ...g,
                  customFoods: g.customFoods.filter((f) => f.id !== foodId),
                  lastUpdated: new Date().toISOString(),
                }
              : g
          ),
        })),
      toggleFoodVisibility: (userId, foodId) =>
        set((state) => ({
          userFoodGuides: state.userFoodGuides.map((g) =>
            g.userId === userId
              ? {
                  ...g,
                  hiddenFoods: g.hiddenFoods.includes(foodId)
                    ? g.hiddenFoods.filter((id) => id !== foodId)
                    : [...g.hiddenFoods, foodId],
                  lastUpdated: new Date().toISOString(),
                }
              : g
          ),
        })),
      
      // Food Inquiries
      foodInquiries: [],
      addFoodInquiry: (inquiry) =>
        set((state) => ({ foodInquiries: [...state.foodInquiries, inquiry] })),
      
      // Pantry Management
      pantryItems: [],
      pantrySettings: defaultPantrySettings,
      lowStockAlerts: [],
      expirationAlerts: [],
      customFieldTemplates: [],
      
      addPantryItem: (item) =>
        set((state) => ({ 
          pantryItems: [...state.pantryItems, item] 
        })),
      
      updatePantryItem: (id, updates) =>
        set((state) => ({
          pantryItems: state.pantryItems.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
          ),
        })),
      
      removePantryItem: (id) =>
        set((state) => ({
          pantryItems: state.pantryItems.filter((item) => item.id !== id),
          lowStockAlerts: state.lowStockAlerts.filter((alert) => alert.itemId !== id),
          expirationAlerts: state.expirationAlerts.filter((alert) => alert.itemId !== id),
        })),
      
      adjustPantryQuantity: (id, quantityChange) =>
        set((state) => ({
          pantryItems: state.pantryItems.map((item) => {
            if (item.id === id) {
              const newQuantity = Math.max(0, item.quantity + quantityChange);
              const isLowStock = newQuantity <= item.lowStockThreshold;
              return {
                ...item,
                quantity: newQuantity,
                isLowStock,
                updatedAt: new Date().toISOString(),
              };
            }
            return item;
          }),
        })),
      
      recordUsage: (itemId, quantityUsed, usedInMeal) =>
        set((state) => {
          const item = state.pantryItems.find((i) => i.id === itemId);
          if (!item) return state;
          
          const usageRecord: UsageRecord = {
            id: crypto.randomUUID(),
            itemId,
            quantityUsed,
            date: new Date().toISOString(),
            usedInMeal,
          };
          
          const updatedItem = {
            ...item,
            quantity: Math.max(0, item.quantity - quantityUsed),
            usageHistory: [...(item.usageHistory || []), usageRecord],
            updatedAt: new Date().toISOString(),
          };
          
          updatedItem.isLowStock = updatedItem.quantity <= updatedItem.lowStockThreshold;
          
          return {
            pantryItems: state.pantryItems.map((i) =>
              i.id === itemId ? updatedItem : i
            ),
          };
        }),
      
      updatePantrySettings: (settings) =>
        set((state) => ({
          pantrySettings: { ...state.pantrySettings, ...settings },
        })),
      
      // Custom Field Templates
      addCustomFieldTemplate: (template) =>
        set((state) => ({
          customFieldTemplates: [...state.customFieldTemplates, template],
        })),
      
      updateCustomFieldTemplate: (id, updates) =>
        set((state) => ({
          customFieldTemplates: state.customFieldTemplates.map((template) =>
            template.id === id ? { ...template, ...updates } : template
          ),
        })),
      
      deleteCustomFieldTemplate: (id) =>
        set((state) => ({
          customFieldTemplates: state.customFieldTemplates.filter((template) => template.id !== id),
        })),
      
      getTemplatesForCategory: (category) => {
        const state = useStore.getState();
        return state.customFieldTemplates
          .filter((template) => template.category === category)
          .sort((a, b) => a.order - b.order);
      },
      
      // Alert Management
      addLowStockAlert: (alert) =>
        set((state) => {
          const exists = state.lowStockAlerts.some((a) => a.itemId === alert.itemId);
          if (exists) return state;
          return { lowStockAlerts: [...state.lowStockAlerts, alert] };
        }),
      
      acknowledgeLowStockAlert: (alertId) =>
        set((state) => ({
          lowStockAlerts: state.lowStockAlerts.map((alert) =>
            alert.id === alertId
              ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() }
              : alert
          ),
        })),
      
      removeLowStockAlert: (alertId) =>
        set((state) => ({
          lowStockAlerts: state.lowStockAlerts.filter((alert) => alert.id !== alertId),
        })),
      
      addExpirationAlert: (alert) =>
        set((state) => {
          const exists = state.expirationAlerts.some((a) => a.itemId === alert.itemId);
          if (exists) return state;
          return { expirationAlerts: [...state.expirationAlerts, alert] };
        }),
      
      acknowledgeExpirationAlert: (alertId) =>
        set((state) => ({
          expirationAlerts: state.expirationAlerts.map((alert) =>
            alert.id === alertId
              ? { ...alert, acknowledged: true }
              : alert
          ),
        })),
      
      removeExpirationAlert: (alertId) =>
        set((state) => ({
          expirationAlerts: state.expirationAlerts.filter((alert) => alert.id !== alertId),
        })),
      
      // Analytics
      getPantryStats: () => {
        const state = useStore.getState();
        const items = state.pantryItems;
        
        const stats: PantryStats = {
          totalItems: items.length,
          totalValue: items.reduce((sum, item) => sum + (item.price || 0), 0),
          itemsByCategory: items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
          }, {} as Record<import('../types').FoodCategory, number>),
          itemsByLocation: items.reduce((acc, item) => {
            acc[item.location] = (acc[item.location] || 0) + 1;
            return acc;
          }, {} as Record<import('../types').StorageLocation, number>),
          lowStockCount: items.filter((item) => item.isLowStock).length,
          expiringCount: state.getExpiringItems().length,
          expiredCount: state.getExpiredItems().length,
          lastUpdated: new Date().toISOString(),
        };
        
        return stats;
      },
      
      getLowStockItems: () => {
        const state = useStore.getState();
        return state.pantryItems.filter((item) => item.isLowStock);
      },
      
      getExpiringItems: (days = 7) => {
        const state = useStore.getState();
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        return state.pantryItems.filter((item) => {
          if (!item.expirationDate) return false;
          const expDate = new Date(item.expirationDate);
          return expDate > now && expDate <= futureDate;
        });
      },
      
      getExpiredItems: () => {
        const state = useStore.getState();
        const now = new Date();
        
        return state.pantryItems.filter((item) => {
          if (!item.expirationDate) return false;
          return new Date(item.expirationDate) < now;
        });
      },
      
      // Lab Management
      labReports: [],
      labAlerts: [],
      labInsights: [],
      
      addLabReport: (report) =>
        set((state) => ({ 
          labReports: [...state.labReports, report],
        })),
      
      updateLabReport: (id, updates) =>
        set((state) => ({
          labReports: state.labReports.map((report) =>
            report.id === id ? { ...report, ...updates } : report
          ),
        })),
      
      deleteLabReport: (id) =>
        set((state) => ({
          labReports: state.labReports.filter((report) => report.id !== id),
          labAlerts: state.labAlerts.filter((alert) => alert.reportId !== id),
        })),
      
      updateLabResult: (reportId, resultId, updates) =>
        set((state) => ({
          labReports: state.labReports.map((report) => {
            if (report.id === reportId) {
              return {
                ...report,
                results: report.results.map((result) =>
                  result.id === resultId ? { ...result, ...updates } : result
                ),
              };
            }
            return report;
          }),
        })),
      
      // Lab Alerts
      addLabAlert: (alert) =>
        set((state) => {
          const exists = state.labAlerts.some((a) => a.resultId === alert.resultId);
          if (exists) return state;
          return { labAlerts: [...state.labAlerts, alert] };
        }),
      
      acknowledgeLabAlert: (alertId) =>
        set((state) => ({
          labAlerts: state.labAlerts.map((alert) =>
            alert.id === alertId
              ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() }
              : alert
          ),
        })),
      
      removeLabAlert: (alertId) =>
        set((state) => ({
          labAlerts: state.labAlerts.filter((alert) => alert.id !== alertId),
        })),
      
      getActiveLabAlerts: (memberId) => {
        const state = useStore.getState();
        return state.labAlerts.filter(
          (alert) => 
            !alert.acknowledged && 
            (!memberId || alert.memberId === memberId)
        );
      },
      
      // Lab Insights
      addLabInsight: (insight) =>
        set((state) => ({ labInsights: [...state.labInsights, insight] })),
      
      dismissLabInsight: (insightId) =>
        set((state) => ({
          labInsights: state.labInsights.map((insight) =>
            insight.id === insightId ? { ...insight, dismissed: true } : insight
          ),
        })),
      
      getLabInsights: (memberId) => {
        const state = useStore.getState();
        return state.labInsights.filter(
          (insight) => insight.memberId === memberId && !insight.dismissed
        );
      },
      
      // Lab Analytics
      getLabsForMember: (memberId) => {
        const state = useStore.getState();
        return state.labReports
          .filter((report) => report.memberId === memberId)
          .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
      },
      
      getLabTrends: (memberId, testName) => {
        const state = useStore.getState();
        const memberReports = state.labReports
          .filter((report) => report.memberId === memberId)
          .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());
        
        const values: LabTrend['values'] = [];
        
        memberReports.forEach((report) => {
          const result = report.results.find((r) => r.testName === testName);
          if (result && typeof result.value === 'number') {
            values.push({
              date: report.testDate,
              value: result.value,
              reportId: report.id,
              status: result.status,
            });
          }
        });
        
        if (values.length < 2) return null;
        
        // Calculate trend statistics
        const numericValues = values.map((v) => v.value);
        const firstValue = numericValues[0];
        const lastValue = numericValues[numericValues.length - 1];
        const percentChange = ((lastValue - firstValue) / firstValue) * 100;
        
        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        const averageValue = sum / numericValues.length;
        const minValue = Math.min(...numericValues);
        const maxValue = Math.max(...numericValues);
        
        // Calculate standard deviation
        const squareDiffs = numericValues.map((value) => Math.pow(value - averageValue, 2));
        const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / numericValues.length;
        const standardDeviation = Math.sqrt(avgSquareDiff);
        
        // Determine trend direction
        let direction: TrendDirection;
        const recentValues = numericValues.slice(-3);
        const olderValues = numericValues.slice(0, -3);
        
        if (recentValues.length >= 2 && olderValues.length >= 2) {
          const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
          const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;
          const change = recentAvg - olderAvg;
          
          // Check if improvement based on test type (lower is better for some tests)
          const lowerIsBetter = ['Glucose', 'LDL Cholesterol', 'Total Cholesterol', 'Triglycerides', 'ALT', 'AST'].includes(testName);
          
          if (Math.abs(change / olderAvg) < 0.05) {
            direction = 'stable';
          } else if (lowerIsBetter) {
            direction = change < 0 ? 'improving' : 'worsening';
          } else {
            direction = change > 0 ? 'improving' : 'worsening';
          }
        } else {
          direction = 'stable';
        }
        
        // Check if within normal range
        const lastResult = memberReports[memberReports.length - 1].results.find(
          (r) => r.testName === testName
        );
        const withinNormalRange = lastResult?.status === 'normal';
        
        return {
          testName,
          memberId,
          values,
          direction,
          percentChange,
          averageValue,
          minValue,
          maxValue,
          standardDeviation,
          withinNormalRange,
        };
      },
      
      getAbnormalLabs: (memberId) => {
        const state = useStore.getState();
        const latestReport = state.getLatestLabReport(memberId);
        if (!latestReport) return [];
        
        return latestReport.results.filter((result) => 
          result.status === 'high' || result.status === 'low' || result.status === 'critical'
        );
      },
      
      getLatestLabReport: (memberId) => {
        const state = useStore.getState();
        const memberReports = state.labReports
          .filter((report) => report.memberId === memberId)
          .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
        
        return memberReports[0] || null;
      },
      
      getLabAnalyticsSummary: (memberId) => {
        const state = useStore.getState();
        const memberReports = state.getLabsForMember(memberId);
        const latestReport = memberReports[0];
        const activeAlerts = state.getActiveLabAlerts(memberId);
        
        const member = state.people.find((p) => p.id === memberId);
        const memberName = member?.name || 'Unknown';
        
        if (!latestReport) {
          return {
            memberId,
            memberName,
            totalReports: 0,
            activeAlerts: 0,
            criticalAlerts: 0,
            keyMarkers: [],
            improvementCount: 0,
            concernCount: 0,
          };
        }
        
        // Get key markers from latest report
        const keyMarkers = latestReport.results
          .filter((result) => result.isPriority)
          .slice(0, 6)
          .map((result) => {
            const trend = state.getLabTrends(memberId, result.testName);
            return {
              testName: result.testName,
              value: result.value,
              unit: result.unit,
              status: result.status,
              trend: trend?.direction,
              date: latestReport.testDate,
            };
          });
        
        // Count improvements and concerns
        let improvementCount = 0;
        let concernCount = 0;
        
        latestReport.results.forEach((result) => {
          const trend = state.getLabTrends(memberId, result.testName);
          if (trend) {
            if (trend.direction === 'improving') improvementCount++;
            if (trend.direction === 'worsening') concernCount++;
          }
        });
        
        const criticalAlerts = activeAlerts.filter((alert) => alert.severity === 'critical').length;
        
        return {
          memberId,
          memberName,
          totalReports: memberReports.length,
          latestReportDate: latestReport.testDate,
          activeAlerts: activeAlerts.length,
          criticalAlerts,
          keyMarkers,
          improvementCount,
          concernCount,
        };
      },
      
      getAllLabResults: (memberId) => {
        const state = useStore.getState();
        const memberReports = state.getLabsForMember(memberId);
        const allResults: LabResult[] = [];
        
        memberReports.forEach((report) => {
          allResults.push(...report.results);
        });
        
        return allResults;
      },
    }),
    {
      name: 'meal-plan-assistant-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating store:', error);
            // Clear corrupted data
            try {
              localStorage.removeItem('meal-plan-assistant-storage');
            } catch (e) {
              console.error('Failed to clear storage:', e);
            }
            return;
          }
          // Migrate old blood type data on rehydration
          if (state?.people && Array.isArray(state.people) && state.people.length > 0) {
            try {
              const migratedPeople = migratePeople(state.people);
              // Update state with migrated data
              if (migratedPeople.length > 0) {
                state.people = migratedPeople;
              }
            } catch (err) {
              console.error('Error migrating blood types:', err);
              // Clear corrupted people data
              state.people = [];
            }
          }
          // Also migrate any plans that might have old blood types
          if (state?.plans && Array.isArray(state.plans)) {
            try {
              state.plans = state.plans.map((plan: any) => {
                if (plan.people && Array.isArray(plan.people)) {
                  return {
                    ...plan,
                    people: migratePeople(plan.people),
                  };
                }
                return plan;
              });
            } catch (err) {
              console.error('Error migrating plan blood types:', err);
            }
          }
        };
      },
    }
  )
);

