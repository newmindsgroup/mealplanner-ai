import { useEffect } from 'react';
import { Trophy, Flame, Award, TrendingUp, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import confetti from 'canvas-confetti';

export default function ProgressDashboard() {
  const { progress, addXP } = useStore();

  useEffect(() => {
    // Check for level up (simplified - would need to track previous level)
    if (progress.level > 1) {
      // Could trigger confetti on level up
    }
  }, [progress.level]);

  const handleTestLevelUp = () => {
    addXP(progress.xpToNextLevel - progress.xp);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const progressPercentage = (progress.xp / progress.xpToNextLevel) * 100;

  const stats = [
    {
      icon: Trophy,
      value: progress.level,
      label: 'Current Level',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20',
    },
    {
      icon: Flame,
      value: progress.streak,
      label: 'Day Streak',
      color: 'from-orange-400 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20',
    },
    {
      icon: Award,
      value: progress.badges.length,
      label: 'Badges Earned',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20',
    },
    {
      icon: TrendingUp,
      value: progress.mealsCompleted,
      label: 'Meals Completed',
      color: 'from-green-400 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6 bg-gradient-to-r from-primary-50 via-white to-primary-50 dark:from-primary-950/20 dark:via-gray-900 dark:to-primary-950/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Progress Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your meal planning journey and achievements
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`card p-6 bg-gradient-to-br ${stat.bgColor} hover-lift animate-fade-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>
              {stat.label === 'Current Level' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">XP Progress</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                      {progress.xp} / {progress.xpToNextLevel}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {progress.badges.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Badges</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {progress.badges.map((badge, idx) => (
              <div
                key={idx}
                className="badge badge-primary px-4 py-2 text-sm font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}

      {progress.weeklyActivity.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Activity</h2>
          </div>
          <div className="space-y-3">
            {progress.weeklyActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {new Date(activity.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span className="badge badge-primary font-semibold">
                  {activity.meals} meal{activity.meals !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
