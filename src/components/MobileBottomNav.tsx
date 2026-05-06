/**
 * MobileBottomNav — Phase 15
 * Persistent bottom navigation bar for mobile devices.
 * Shows the 5 most-used tabs with icons + labels.
 * Only visible on screens < lg (1024px).
 */
import React from 'react';
import { Calendar, ShoppingCart, Dumbbell, ScanLine, LayoutDashboard } from 'lucide-react';
import type { TabType } from './Layout';

interface MobileBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const QUICK_TABS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'weekly-plan', label: 'Plan', icon: Calendar },
  { id: 'grocery-list', label: 'Grocery', icon: ShoppingCart },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'label-analyzer', label: 'Scanner', icon: ScanLine },
  { id: 'progress', label: 'Progress', icon: LayoutDashboard },
];

export default function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60 safe-area-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto px-1">
        {QUICK_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 rounded-xl mx-0.5 transition-all duration-200 ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500 active:bg-gray-100 dark:active:bg-gray-800'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
