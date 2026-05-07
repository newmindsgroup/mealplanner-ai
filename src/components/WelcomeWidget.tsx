/**
 * WelcomeWidget — Phase 16
 * Shows a quick-stats overview when the user first lands on the dashboard.
 * Provides actionable cards to guide users to key features.
 */
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProactiveInsightCards from './shared/ProactiveInsightCards';
import { 
  Calendar, Dumbbell, Apple, ScanLine, 
  TrendingUp, ShoppingCart, Sparkles, ArrowRight,
  Heart, Users
} from 'lucide-react';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface WelcomeWidgetProps {
  onNavigate: (tab: string) => void;
}

export default function WelcomeWidget({ onNavigate }: WelcomeWidgetProps) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const mealSuggestion = hour < 10 ? '🌅 Time for a nutritious breakfast' 
    : hour < 14 ? '☀️ Fuel up with a balanced lunch'
    : hour < 18 ? '🍵 Perfect time for a healthy snack'
    : '🌙 Wind down with a light dinner';

  const quickActions: QuickAction[] = [
    {
      icon: Calendar,
      title: 'Generate Meal Plan',
      description: 'AI creates a week of meals matched to your profile',
      color: 'text-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20',
      onClick: () => onNavigate('weekly-plan'),
    },
    {
      icon: Dumbbell,
      title: 'Fitness Dashboard',
      description: 'Track workouts, view muscle heatmap, set goals',
      color: 'text-violet-600',
      bgColor: 'from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20',
      onClick: () => onNavigate('fitness'),
    },
    {
      icon: ScanLine,
      title: 'Scan a Label',
      description: 'AI analyzes food labels for your blood type',
      color: 'text-amber-600',
      bgColor: 'from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20',
      onClick: () => onNavigate('label-analyzer'),
    },
    {
      icon: Apple,
      title: 'Blood Type Guide',
      description: 'See foods that work best for your body',
      color: 'text-rose-600',
      bgColor: 'from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20',
      onClick: () => onNavigate('food-guide'),
    },
    {
      icon: ShoppingCart,
      title: 'Grocery List',
      description: 'Smart shopping lists from your meal plans',
      color: 'text-sky-600',
      bgColor: 'from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20',
      onClick: () => onNavigate('grocery-list'),
    },
    {
      icon: Users,
      title: 'Household',
      description: 'Manage family members and preferences',
      color: 'text-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20',
      onClick: () => onNavigate('household'),
    },
  ];

  return (
    <div id="tour-welcome-widget" className="space-y-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-200" />
            <span className="text-primary-200 text-sm font-medium">AI-Powered Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {greeting}, {firstName}! 👋
          </h1>
          <p className="text-primary-100 text-sm sm:text-base max-w-lg">
            {mealSuggestion}. Your AI nutrition assistant is ready to help you make healthy choices today.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-lg" />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'AI Features', value: '24+', icon: Sparkles, color: 'text-emerald-500' },
          { label: 'Meal Types', value: '100+', icon: Heart, color: 'text-rose-500' },
          { label: 'Exercises', value: '200+', icon: Dumbbell, color: 'text-violet-500' },
          { label: 'Food Items', value: '1000+', icon: Apple, color: 'text-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1.5 ${stat.color}`} />
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-[11px] text-gray-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Proactive Health Intelligence Cards */}
      <div id="tour-proactive-insights">
        <ProactiveInsightCards
          onNavigate={onNavigate}
          maxCards={4}
        />
      </div>

      {/* Quick action cards */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={action.onClick}
              className={`group text-left bg-gradient-to-br ${action.bgColor} rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between mb-2">
                <action.icon className={`w-6 h-6 ${action.color}`} />
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{action.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* AI tip of the day */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">💡 AI Nutrition Tip</p>
            <p className="text-xs text-amber-600 dark:text-amber-300/80 leading-relaxed">
              Studies show that eating according to your blood type can reduce inflammation by up to 30%. 
              Start by checking your Blood Type Food Guide to find the most beneficial foods for your body.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
