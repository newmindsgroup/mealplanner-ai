import type { EmailNotification, NotificationType, NotificationPreferences } from '../types/notifications';
import type { WeeklyPlan, Meal } from '../types';
import { createEmailService } from './emailService';
import {
  weeklyPlanReadyTemplate,
  dailyMealSummaryTemplate,
  groceryListGeneratedTemplate,
  levelUpTemplate,
  weeklyProgressTemplate,
} from '../utils/emailTemplates';

/**
 * Notification Service
 * Orchestrates when and how to send notifications based on user preferences
 */

export class NotificationService {
  private preferences: NotificationPreferences;
  private emailService: ReturnType<typeof createEmailService>;

  constructor(preferences: NotificationPreferences, smtpSettings: any) {
    this.preferences = preferences;
    this.emailService = createEmailService(smtpSettings);
  }

  /**
   * Check if a notification type is enabled
   */
  isEnabled(type: NotificationType): boolean {
    const mapping: Record<NotificationType, boolean> = {
      weekly_plan_ready: this.preferences.weeklyPlanReady,
      meal_plan_expiring: this.preferences.mealPlanExpiring,
      daily_meal_summary: this.preferences.dailyMealSummary,
      meal_prep_reminder: this.preferences.mealPrepReminder,
      next_meal_reminder: this.preferences.nextMealReminder,
      grocery_list_generated: this.preferences.groceryListGenerated,
      shopping_day_reminder: this.preferences.shoppingDayReminder,
      low_stock_alert: this.preferences.lowStockAlert,
      grocery_list_updates: this.preferences.groceryListUpdates,
      blood_type_tips: this.preferences.bloodTypeTips,
      nutritional_goal_progress: this.preferences.nutritionalGoalProgress,
      supplement_reminders: this.preferences.supplementReminders,
      hydration_reminders: this.preferences.hydrationReminders,
      meal_balance_alert: this.preferences.mealBalanceAlert,
      level_up_achievement: this.preferences.levelUpAchievement,
      badge_earned: this.preferences.badgeEarned,
      streak_milestone: this.preferences.streakMilestone,
      weekly_progress_report: this.preferences.weeklyProgressReport,
      family_profile_updates: this.preferences.familyProfileUpdates,
      shared_recipe_suggestions: this.preferences.sharedRecipeSuggestions,
      seasonal_recipes: this.preferences.seasonalRecipes,
      leftover_ideas: this.preferences.leftoverIdeas,
      favorite_meal_reminder: this.preferences.favoriteMealReminder,
      new_recipe_match: this.preferences.newRecipeMatch,
      knowledge_base_complete: this.preferences.knowledgeBaseComplete,
      label_analysis_complete: this.preferences.labelAnalysisComplete,
      data_backup_reminder: this.preferences.dataBackupReminder,
      app_updates: this.preferences.appUpdates,
      weekly_schedule: this.preferences.weeklySchedule,
      prep_schedule: this.preferences.prepSchedule,
      shopping_optimization: this.preferences.shoppingOptimization,
    };

    return mapping[type] ?? false;
  }

  /**
   * Trigger: Weekly Plan Ready
   */
  async notifyWeeklyPlanReady(plan: WeeklyPlan, recipientEmail: string): Promise<void> {
    if (!this.isEnabled('weekly_plan_ready')) return;

    const template = weeklyPlanReadyTemplate(plan);
    const notification = this.emailService.prepareEmail(
      recipientEmail,
      template.subject,
      template.text,
      template.html
    );

    await this.emailService.queueEmail(notification);
  }

  /**
   * Trigger: Daily Meal Summary
   */
  async notifyDailyMealSummary(
    date: Date,
    meals: { breakfast: Meal; lunch: Meal; dinner: Meal; snack: Meal },
    recipientEmail: string
  ): Promise<void> {
    if (!this.isEnabled('daily_meal_summary')) return;

    const template = dailyMealSummaryTemplate(date, meals);
    const notification = this.emailService.prepareEmail(
      recipientEmail,
      template.subject,
      template.text,
      template.html,
      date // Schedule for delivery time
    );

    await this.emailService.queueEmail(notification);
  }

  /**
   * Trigger: Grocery List Generated
   */
  async notifyGroceryListGenerated(
    itemCount: number,
    categories: string[],
    recipientEmail: string
  ): Promise<void> {
    if (!this.isEnabled('grocery_list_generated')) return;

    const template = groceryListGeneratedTemplate(itemCount, categories);
    const notification = this.emailService.prepareEmail(
      recipientEmail,
      template.subject,
      template.text,
      template.html
    );

    await this.emailService.queueEmail(notification);
  }

  /**
   * Trigger: Level Up Achievement
   */
  async notifyLevelUp(
    level: number,
    xp: number,
    newBadges: string[],
    recipientEmail: string
  ): Promise<void> {
    if (!this.isEnabled('level_up_achievement')) return;

    const template = levelUpTemplate(level, xp, newBadges);
    const notification = this.emailService.prepareEmail(
      recipientEmail,
      template.subject,
      template.text,
      template.html
    );

    await this.emailService.queueEmail(notification);
  }

  /**
   * Trigger: Weekly Progress Report
   */
  async notifyWeeklyProgress(
    mealsCompleted: number,
    xpEarned: number,
    streak: number,
    highlights: string[],
    recipientEmail: string
  ): Promise<void> {
    if (!this.isEnabled('weekly_progress_report')) return;

    const template = weeklyProgressTemplate(mealsCompleted, xpEarned, streak, highlights);
    const notification = this.emailService.prepareEmail(
      recipientEmail,
      template.subject,
      template.text,
      template.html
    );

    await this.emailService.queueEmail(notification);
  }

  /**
   * Trigger: Meal Plan Expiring
   */
  async notifyMealPlanExpiring(daysLeft: number, recipientEmail: string): Promise<void> {
    if (!this.isEnabled('meal_plan_expiring')) return;

    const subject = `⏰ Your Meal Plan Expires in ${daysLeft} Days`;
    const text = `
Your current meal plan is expiring in ${daysLeft} days!

Generate a new meal plan to keep your healthy eating on track.

View your app to create your next week's plan.
    `.trim();

    const html = `
      <div style="text-align: center; padding: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
        <h2 style="color: #111827; font-size: 24px; margin-bottom: 16px;">
          Your Meal Plan Expires in ${daysLeft} Days
        </h2>
        <p style="color: #6b7280; font-size: 16px; margin-bottom: 24px;">
          Generate a new meal plan to keep your healthy eating on track.
        </p>
        <a href="#" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Generate New Plan
        </a>
      </div>
    `;

    const notification = this.emailService.prepareEmail(recipientEmail, subject, text, html);
    await this.emailService.queueEmail(notification);
  }

  /**
   * Trigger: Shopping Day Reminder
   */
  async notifyShoppingDay(itemCount: number, recipientEmail: string): Promise<void> {
    if (!this.isEnabled('shopping_day_reminder')) return;

    const subject = `🛒 Shopping Day! ${itemCount} Items on Your List`;
    const text = `
Today is your scheduled shopping day!

You have ${itemCount} items on your grocery list.

View your list in the app and happy shopping!
    `.trim();

    const html = `
      <div style="text-align: center; padding: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
        <h2 style="color: #111827; font-size: 24px; margin-bottom: 16px;">
          Shopping Day!
        </h2>
        <p style="color: #6b7280; font-size: 16px; margin-bottom: 24px;">
          You have <strong>${itemCount} items</strong> on your grocery list.
        </p>
        <a href="#" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          View Grocery List
        </a>
      </div>
    `;

    const notification = this.emailService.prepareEmail(recipientEmail, subject, text, html);
    await this.emailService.queueEmail(notification);
  }
}

/**
 * Create notification service instance
 */
export function createNotificationService(
  preferences: NotificationPreferences,
  smtpSettings: any
): NotificationService {
  return new NotificationService(preferences, smtpSettings);
}

