import { 
  User, 
  Calendar, 
  ShoppingCart, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  ScanLine, 
  Settings,
  ChefHat,
  Sparkles,
  X,
  Users,
  UserCircle,
  Apple,
  Package,
  Activity,
  Dumbbell,
  LayoutDashboard,
  Brain,
  Shield,
  Pill
} from 'lucide-react';
import type { TabType } from './Layout';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

interface TabGroup {
  label: string;
  tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; description?: string }[];
}

const tabGroups: TabGroup[] = [
  {
    label: 'Planning',
    tabs: [
      { id: 'home', label: 'Home', icon: LayoutDashboard, description: 'Dashboard overview' },
      { id: 'weekly-plan', label: 'Weekly Plan', icon: Calendar, description: 'Meal planning' },
      { id: 'grocery-list', label: 'Grocery List', icon: ShoppingCart, description: 'Shopping' },
      { id: 'my-pantry', label: 'My Pantry', icon: Package, description: 'Inventory' },
      { id: 'favorites', label: 'Favorites', icon: Heart, description: 'Saved meals' },
      { id: 'recipes', label: 'Recipe Library', icon: BookOpen, description: 'Browse 101+' },
    ],
  },
  {
    label: 'Health & Fitness',
    tabs: [
      { id: 'fitness', label: 'Fitness', icon: Dumbbell, description: 'Training & body' },
      { id: 'neuro-assessment', label: 'Brain Assessment', icon: Brain, description: 'Neuro profile' },
      { id: 'food-guide', label: 'Food Guide', icon: Apple, description: 'Blood type foods' },
      { id: 'label-analyzer', label: 'Label Analyzer', icon: ScanLine, description: 'Scan labels' },
      { id: 'labs', label: 'Labs Analysis', icon: Activity, description: 'Blood work' },
      { id: 'supplements', label: 'Supplements', icon: Pill, description: 'Timing & schedule' },
      { id: 'health-report', label: 'Health Report', icon: Shield, description: 'Cross-domain' },
      { id: 'progress', label: 'Progress', icon: TrendingUp, description: 'Tracking' },
    ],
  },
  {
    label: 'Family & Knowledge',
    tabs: [
      { id: 'household', label: 'Household', icon: Users, description: 'Collaboration' },
      { id: 'profile', label: 'Family Profiles', icon: User, description: 'Members' },
      { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, description: 'Documents' },
    ],
  },
  {
    label: 'Account',
    tabs: [
      { id: 'user-profile', label: 'My Profile', icon: UserCircle, description: 'Account' },
      { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
    ],
  },
];

export default function Sidebar({ activeTab, onTabChange, isOpen = true, onClose }: SidebarProps) {
  return (
    <aside
      id="tour-sidebar"
      className={`fixed lg:relative w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col h-full z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{ boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)' }}
    >
      {/* Header with gradient */}
      <div className="p-5 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-br from-primary-50 to-white dark:from-primary-950/20 dark:to-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-400/20 blur-xl rounded-full"></div>
              <ChefHat className="w-7 h-7 text-primary-600 dark:text-primary-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent leading-tight">
                Meal Plan Assistant
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                AI-Powered Nutrition
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Navigation with grouped sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
        {tabGroups.map((group, groupIdx) => (
          <div key={group.label} className={groupIdx > 0 ? 'mt-4' : ''}>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 px-3 mb-1.5">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => onTabChange(tab.id)}
                      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/25'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }`}
                      aria-label={tab.label}
                    >
                      <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      <div className="flex-1 text-left min-w-0">
                        <div className={`font-semibold text-[13px] leading-tight truncate ${isActive ? 'text-white' : ''}`}>
                          {tab.label}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <Sparkles className="w-3 h-3" />
          <span>Powered by AI</span>
        </div>
      </div>
    </aside>
  );
}
