/**
 * DashboardHeader — Phase 15
 * Top bar for the dashboard with user greeting, current section title,
 * sidebar toggle (mobile), and quick actions (logout).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, LogOut, Home, Bell, Sun, Moon } from 'lucide-react';
import type { TabType } from './Layout';

interface DashboardHeaderProps {
  activeTab: TabType;
  onToggleSidebar: () => void;
}

const TAB_LABELS: Record<TabType, string> = {
  'home': 'Dashboard',
  'profile': 'Family Profiles',
  'weekly-plan': 'Weekly Meal Plan',
  'my-pantry': 'My Pantry',
  'food-guide': 'Blood Type Food Guide',
  'grocery-list': 'Grocery List',
  'knowledge-base': 'Knowledge Base',
  'favorites': 'Favorites',
  'progress': 'Progress Dashboard',
  'label-analyzer': 'Label Analyzer',
  'labs': 'Labs Analysis',
  'settings': 'Settings',
  'household': 'Household',
  'user-profile': 'My Profile',
  'fitness': 'Fitness & Training',
  'neuro-assessment': 'Brain Assessment',
};

export default function DashboardHeader({ activeTab, onToggleSidebar }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = React.useState(
    () => document.documentElement.classList.contains('dark')
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const firstName = user?.name?.split(' ')[0] || 'User';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Left: mobile hamburger + section title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-none">
              {greeting}, {firstName}
            </p>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mt-0.5">
              {TAB_LABELS[activeTab] || 'Dashboard'}
            </h2>
          </div>

          {/* Mobile: show only section title */}
          <h2 className="sm:hidden text-sm font-bold text-gray-900 dark:text-white">
            {TAB_LABELS[activeTab] || 'Dashboard'}
          </h2>
        </div>

        {/* Right: quick actions */}
        <div className="flex items-center gap-1">
          {/* Home shortcut */}
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-all"
            aria-label="Back to home"
            title="Back to home"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-all"
            aria-label="Toggle dark mode"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User avatar / logout */}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {firstName[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
