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
  Menu,
  X,
  Users,
  UserCircle,
  Apple,
  Package,
  Activity,
  Dumbbell
} from 'lucide-react';
import type { TabType } from './Layout';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; description?: string }[] = [
  { id: 'household', label: 'Household', icon: Users, description: 'Collaboration' },
  { id: 'profile', label: 'Family Profiles', icon: User, description: 'Family members' },
  { id: 'weekly-plan', label: 'Weekly Plan', icon: Calendar, description: 'Meal planning' },
  { id: 'my-pantry', label: 'My Pantry', icon: Package, description: 'Inventory' },
  { id: 'food-guide', label: 'Food Guide', icon: Apple, description: 'Blood type foods' },
  { id: 'grocery-list', label: 'Grocery List', icon: ShoppingCart, description: 'Shopping' },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, description: 'Documents' },
  { id: 'favorites', label: 'Favorites', icon: Heart, description: 'Saved meals' },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell, description: 'Training & body' },
  { id: 'progress', label: 'Progress', icon: TrendingUp, description: 'Tracking' },
  { id: 'label-analyzer', label: 'Label Analyzer', icon: ScanLine, description: 'Scan labels' },
  { id: 'labs', label: 'Labs Analysis', icon: Activity, description: 'Blood work tracking' },
  { id: 'user-profile', label: 'My Profile', icon: UserCircle, description: 'Account settings' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
];

export default function Sidebar({ activeTab, onTabChange, isOpen = true, onClose, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      <aside 
        className={`fixed lg:relative w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col h-full z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)' }}
      >
      {/* Header with gradient */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-br from-primary-50 to-white dark:from-primary-950/20 dark:to-gray-900">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-400/20 blur-xl rounded-full"></div>
              <ChefHat className="w-8 h-8 text-primary-600 dark:text-primary-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Meal Plan Assistant
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <ul className="space-y-1.5">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                  aria-label={tab.label}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <div className="flex-1 text-left">
                    <div className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>
                      {tab.label}
                    </div>
                    {tab.description && (
                      <div className={`text-xs mt-0.5 ${
                        isActive 
                          ? 'text-primary-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {tab.description}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3 h-3" />
          <span>Powered by AI</span>
        </div>
      </div>
    </aside>
    </>
  );
}
