// Email notification type definitions

export interface SMTPSettings {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean; // TLS/SSL
  username: string;
  password: string; // encrypted
  fromEmail: string;
  fromName: string;
  testEmail?: string;
}

export interface NotificationPreferences {
  // Meal Planning
  weeklyPlanReady: boolean;
  mealPlanExpiring: boolean;
  dailyMealSummary: boolean;
  dailySummaryTime: string; // "07:00"
  mealPrepReminder: boolean;
  nextMealReminder: boolean;
  nextMealReminderMinutes: number; // 60, 90, 120
  
  // Grocery
  groceryListGenerated: boolean;
  shoppingDayReminder: boolean;
  shoppingDay: string; // "saturday", "sunday"
  lowStockAlert: boolean;
  groceryListUpdates: boolean;
  
  // Health & Nutrition
  bloodTypeTips: boolean;
  bloodTypeTipsFrequency: 'daily' | 'weekly';
  nutritionalGoalProgress: boolean;
  supplementReminders: boolean;
  hydrationReminders: boolean;
  hydrationFrequency: 'hourly' | 'daily';
  mealBalanceAlert: boolean;
  
  // Progress
  levelUpAchievement: boolean;
  badgeEarned: boolean;
  streakMilestone: boolean;
  weeklyProgressReport: boolean;
  
  // Family
  familyProfileUpdates: boolean;
  sharedRecipeSuggestions: boolean;
  
  // Smart Recommendations
  seasonalRecipes: boolean;
  leftoverIdeas: boolean;
  favoriteMealReminder: boolean;
  newRecipeMatch: boolean;
  
  // System
  knowledgeBaseComplete: boolean;
  labelAnalysisComplete: boolean;
  dataBackupReminder: boolean;
  appUpdates: boolean;
  
  // Scheduling
  weeklySchedule: boolean;
  weeklyScheduleDay: string; // "sunday"
  prepSchedule: boolean;
  shoppingOptimization: boolean;
}

export interface EmailNotification {
  id: string;
  type: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  scheduledFor?: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
}

export type NotificationType =
  | 'weekly_plan_ready'
  | 'meal_plan_expiring'
  | 'daily_meal_summary'
  | 'meal_prep_reminder'
  | 'next_meal_reminder'
  | 'grocery_list_generated'
  | 'shopping_day_reminder'
  | 'low_stock_alert'
  | 'grocery_list_updates'
  | 'blood_type_tips'
  | 'nutritional_goal_progress'
  | 'supplement_reminders'
  | 'hydration_reminders'
  | 'meal_balance_alert'
  | 'level_up_achievement'
  | 'badge_earned'
  | 'streak_milestone'
  | 'weekly_progress_report'
  | 'family_profile_updates'
  | 'shared_recipe_suggestions'
  | 'seasonal_recipes'
  | 'leftover_ideas'
  | 'favorite_meal_reminder'
  | 'new_recipe_match'
  | 'knowledge_base_complete'
  | 'label_analysis_complete'
  | 'data_backup_reminder'
  | 'app_updates'
  | 'weekly_schedule'
  | 'prep_schedule'
  | 'shopping_optimization';

export const defaultSMTPSettings: SMTPSettings = {
  enabled: false,
  host: '',
  port: 587,
  secure: false,
  username: '',
  password: '',
  fromEmail: '',
  fromName: 'Meal Plan Assistant',
  testEmail: '',
};

export const defaultNotificationPreferences: NotificationPreferences = {
  // Meal Planning
  weeklyPlanReady: true,
  mealPlanExpiring: true,
  dailyMealSummary: false,
  dailySummaryTime: '07:00',
  mealPrepReminder: true,
  nextMealReminder: false,
  nextMealReminderMinutes: 120,
  
  // Grocery
  groceryListGenerated: true,
  shoppingDayReminder: true,
  shoppingDay: 'saturday',
  lowStockAlert: false,
  groceryListUpdates: false,
  
  // Health & Nutrition
  bloodTypeTips: true,
  bloodTypeTipsFrequency: 'weekly',
  nutritionalGoalProgress: true,
  supplementReminders: false,
  hydrationReminders: false,
  hydrationFrequency: 'daily',
  mealBalanceAlert: true,
  
  // Progress
  levelUpAchievement: true,
  badgeEarned: true,
  streakMilestone: true,
  weeklyProgressReport: true,
  
  // Family
  familyProfileUpdates: true,
  sharedRecipeSuggestions: true,
  
  // Smart Recommendations
  seasonalRecipes: true,
  leftoverIdeas: true,
  favoriteMealReminder: true,
  newRecipeMatch: true,
  
  // System
  knowledgeBaseComplete: true,
  labelAnalysisComplete: true,
  dataBackupReminder: true,
  appUpdates: true,
  
  // Scheduling
  weeklySchedule: true,
  weeklyScheduleDay: 'sunday',
  prepSchedule: true,
  shoppingOptimization: false,
};

// SMTP Provider presets for easy configuration
export const smtpProviders = {
  gmail: {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    instructions: 'Use an App Password, not your regular Gmail password. Enable 2-factor authentication first.',
  },
  outlook: {
    name: 'Outlook/Hotmail',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    instructions: 'Use your regular Outlook.com email and password.',
  },
  yahoo: {
    name: 'Yahoo Mail',
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    instructions: 'Generate an App Password from Yahoo Account Security settings.',
  },
  sendgrid: {
    name: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    instructions: 'Use "apikey" as username and your SendGrid API key as password.',
  },
  mailgun: {
    name: 'Mailgun',
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    instructions: 'Use your Mailgun SMTP credentials from the domain settings.',
  },
  custom: {
    name: 'Custom SMTP',
    host: '',
    port: 587,
    secure: false,
    instructions: 'Enter your custom SMTP server details.',
  },
};

