import { Bell, Calendar, ShoppingCart, Heart, TrendingUp, Users, Lightbulb, Settings as SettingsIcon } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function NotificationPreferences() {
  const { settings, updateSettings } = useStore();
  const notif = settings.notifications;

  const updateNotification = (updates: Partial<typeof notif>) => {
    updateSettings({
      notifications: { ...notif, ...updates },
    });
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: () => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 flex-shrink-0 ${
          enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Choose which notifications you want to receive</p>
        </div>
      </div>

      {/* Meal Planning Notifications */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Meal Planning</h3>
        </div>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
          <ToggleSwitch
            enabled={notif.weeklyPlanReady}
            onChange={() => updateNotification({ weeklyPlanReady: !notif.weeklyPlanReady })}
            label="Weekly Meal Plan Ready"
            description="Get notified when your AI-generated weekly plan is ready"
          />
          <ToggleSwitch
            enabled={notif.mealPlanExpiring}
            onChange={() => updateNotification({ mealPlanExpiring: !notif.mealPlanExpiring })}
            label="Meal Plan Expiring Soon"
            description="Reminder 2 days before your plan ends"
          />
          <ToggleSwitch
            enabled={notif.dailyMealSummary}
            onChange={() => updateNotification({ dailyMealSummary: !notif.dailyMealSummary })}
            label="Daily Meal Summary"
            description="Morning email with today's meals"
          />
          {notif.dailyMealSummary && (
            <div className="pl-4 py-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Summary Time
              </label>
              <input
                type="time"
                value={notif.dailySummaryTime}
                onChange={(e) => updateNotification({ dailySummaryTime: e.target.value })}
                className="input w-40"
              />
            </div>
          )}
          <ToggleSwitch
            enabled={notif.mealPrepReminder}
            onChange={() => updateNotification({ mealPrepReminder: !notif.mealPrepReminder })}
            label="Meal Prep Reminder"
            description="Reminder the night before for meals needing prep"
          />
          <ToggleSwitch
            enabled={notif.nextMealReminder}
            onChange={() => updateNotification({ nextMealReminder: !notif.nextMealReminder })}
            label="Next Meal Reminder"
            description="Reminder before meal time with recipe"
          />
          {notif.nextMealReminder && (
            <div className="pl-4 py-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Reminder Time (minutes before)
              </label>
              <select
                value={notif.nextMealReminderMinutes}
                onChange={(e) => updateNotification({ nextMealReminderMinutes: parseInt(e.target.value) })}
                className="input w-40"
              >
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grocery & Shopping */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Grocery & Shopping</h3>
        </div>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
          <ToggleSwitch
            enabled={notif.groceryListGenerated}
            onChange={() => updateNotification({ groceryListGenerated: !notif.groceryListGenerated })}
            label="Grocery List Generated"
            description="Notification when your shopping list is ready"
          />
          <ToggleSwitch
            enabled={notif.shoppingDayReminder}
            onChange={() => updateNotification({ shoppingDayReminder: !notif.shoppingDayReminder })}
            label="Shopping Day Reminder"
            description="Reminder on your preferred shopping day"
          />
          {notif.shoppingDayReminder && (
            <div className="pl-4 py-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Shopping Day
              </label>
              <select
                value={notif.shoppingDay}
                onChange={(e) => updateNotification({ shoppingDay: e.target.value })}
                className="input w-40"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
              </select>
            </div>
          )}
          <ToggleSwitch
            enabled={notif.lowStockAlert}
            onChange={() => updateNotification({ lowStockAlert: !notif.lowStockAlert })}
            label="Low Stock Alert"
            description="Alert when frequently used ingredients are low"
          />
          <ToggleSwitch
            enabled={notif.groceryListUpdates}
            onChange={() => updateNotification({ groceryListUpdates: !notif.groceryListUpdates })}
            label="Grocery List Updates"
            description="Notification when list items are added/modified"
          />
        </div>
      </div>

      {/* Health & Nutrition */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Health & Nutrition</h3>
        </div>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
          <ToggleSwitch
            enabled={notif.bloodTypeTips}
            onChange={() => updateNotification({ bloodTypeTips: !notif.bloodTypeTips })}
            label="Blood Type Food Tips"
            description="Recommendations based on family blood types"
          />
          {notif.bloodTypeTips && (
            <div className="pl-4 py-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Frequency
              </label>
              <select
                value={notif.bloodTypeTipsFrequency}
                onChange={(e) => updateNotification({ bloodTypeTipsFrequency: e.target.value as 'daily' | 'weekly' })}
                className="input w-40"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          )}
          <ToggleSwitch
            enabled={notif.nutritionalGoalProgress}
            onChange={() => updateNotification({ nutritionalGoalProgress: !notif.nutritionalGoalProgress })}
            label="Nutritional Goal Progress"
            description="Weekly summary of nutritional achievements"
          />
          <ToggleSwitch
            enabled={notif.supplementReminders}
            onChange={() => updateNotification({ supplementReminders: !notif.supplementReminders })}
            label="Supplement Reminders"
            description="Based on analyzed supplement labels"
          />
          <ToggleSwitch
            enabled={notif.hydrationReminders}
            onChange={() => updateNotification({ hydrationReminders: !notif.hydrationReminders })}
            label="Hydration Reminders"
            description="Water intake reminders"
          />
          {notif.hydrationReminders && (
            <div className="pl-4 py-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Frequency
              </label>
              <select
                value={notif.hydrationFrequency}
                onChange={(e) => updateNotification({ hydrationFrequency: e.target.value as 'hourly' | 'daily' })}
                className="input w-40"
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Once Daily</option>
              </select>
            </div>
          )}
          <ToggleSwitch
            enabled={notif.mealBalanceAlert}
            onChange={() => updateNotification({ mealBalanceAlert: !notif.mealBalanceAlert })}
            label="Meal Balance Alert"
            description="Alert if meals lack certain nutrients"
          />
        </div>
      </div>

      {/* Progress & Gamification */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Progress & Achievements</h3>
        </div>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
          <ToggleSwitch
            enabled={notif.levelUpAchievement}
            onChange={() => updateNotification({ levelUpAchievement: !notif.levelUpAchievement })}
            label="Level Up Achievement"
            description="Celebrate when you reach a new level"
          />
          <ToggleSwitch
            enabled={notif.badgeEarned}
            onChange={() => updateNotification({ badgeEarned: !notif.badgeEarned })}
            label="Badge Earned"
            description="Notification for new badges earned"
          />
          <ToggleSwitch
            enabled={notif.streakMilestone}
            onChange={() => updateNotification({ streakMilestone: !notif.streakMilestone })}
            label="Streak Milestone"
            description="Celebrate 7, 14, 30-day streaks"
          />
          <ToggleSwitch
            enabled={notif.weeklyProgressReport}
            onChange={() => updateNotification({ weeklyProgressReport: !notif.weeklyProgressReport })}
            label="Weekly Progress Report"
            description="Summary of your week's progress"
          />
        </div>
      </div>

      {/* Family & Collaboration */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Family & Collaboration</h3>
        </div>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
          <ToggleSwitch
            enabled={notif.familyProfileUpdates}
            onChange={() => updateNotification({ familyProfileUpdates: !notif.familyProfileUpdates })}
            label="Family Profile Updates"
            description="Notifications when profiles are added/updated"
          />
          <ToggleSwitch
            enabled={notif.sharedRecipeSuggestions}
            onChange={() => updateNotification({ sharedRecipeSuggestions: !notif.sharedRecipeSuggestions })}
            label="Shared Recipe Suggestions"
            description="AI suggestions based on family preferences"
          />
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Smart Recommendations</h3>
        </div>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
          <ToggleSwitch
            enabled={notif.seasonalRecipes}
            onChange={() => updateNotification({ seasonalRecipes: !notif.seasonalRecipes })}
            label="Seasonal Recipe Suggestions"
            description="Recipes based on current season"
          />
          <ToggleSwitch
            enabled={notif.leftoverIdeas}
            onChange={() => updateNotification({ leftoverIdeas: !notif.leftoverIdeas })}
            label="Leftover Recipe Ideas"
            description="Creative ways to use ingredients"
          />
          <ToggleSwitch
            enabled={notif.favoriteMealReminder}
            onChange={() => updateNotification({ favoriteMealReminder: !notif.favoriteMealReminder })}
            label="Favorite Meal Reminder"
            description="Haven't had a favorite in a while?"
          />
          <ToggleSwitch
            enabled={notif.newRecipeMatch}
            onChange={() => updateNotification({ newRecipeMatch: !notif.newRecipeMatch })}
            label="New Recipe Match"
            description="New recipes matching your preferences"
          />
        </div>
      </div>

      {/* System & Maintenance */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">System & Maintenance</h3>
        </div>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
          <ToggleSwitch
            enabled={notif.knowledgeBaseComplete}
            onChange={() => updateNotification({ knowledgeBaseComplete: !notif.knowledgeBaseComplete })}
            label="Knowledge Base Upload Complete"
            description="When documents finish processing"
          />
          <ToggleSwitch
            enabled={notif.labelAnalysisComplete}
            onChange={() => updateNotification({ labelAnalysisComplete: !notif.labelAnalysisComplete })}
            label="Label Analysis Complete"
            description="When supplement analysis is done"
          />
          <ToggleSwitch
            enabled={notif.dataBackupReminder}
            onChange={() => updateNotification({ dataBackupReminder: !notif.dataBackupReminder })}
            label="Data Backup Reminder"
            description="Weekly reminder to backup your data"
          />
          <ToggleSwitch
            enabled={notif.appUpdates}
            onChange={() => updateNotification({ appUpdates: !notif.appUpdates })}
            label="App Updates"
            description="New features or important updates"
          />
        </div>
      </div>

      {/* Scheduling & Calendar */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Scheduling & Calendar</h3>
        </div>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
          <ToggleSwitch
            enabled={notif.weeklySchedule}
            onChange={() => updateNotification({ weeklySchedule: !notif.weeklySchedule })}
            label="Weekly Meal Plan Schedule"
            description="Full week's plan with PDF attachment"
          />
          {notif.weeklySchedule && (
            <div className="pl-4 py-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Delivery Day
              </label>
              <select
                value={notif.weeklyScheduleDay}
                onChange={(e) => updateNotification({ weeklyScheduleDay: e.target.value })}
                className="input w-40"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
              </select>
            </div>
          )}
          <ToggleSwitch
            enabled={notif.prepSchedule}
            onChange={() => updateNotification({ prepSchedule: !notif.prepSchedule })}
            label="Prep Schedule"
            description="Organized prep timeline for the week"
          />
          <ToggleSwitch
            enabled={notif.shoppingOptimization}
            onChange={() => updateNotification({ shoppingOptimization: !notif.shoppingOptimization })}
            label="Shopping Schedule Optimization"
            description="Best times to shop based on patterns"
          />
        </div>
      </div>
    </div>
  );
}

