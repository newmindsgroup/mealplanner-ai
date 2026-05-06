import { useState, lazy, Suspense } from 'react';
import Sidebar from './Sidebar';
import WelcomeWidget from './WelcomeWidget';
import DashboardHeader from './DashboardHeader';
import MobileBottomNav from './MobileBottomNav';
import ChatPanel from './ChatPanel';
import APIStatusIndicator from './APIStatusIndicator';

// ─── Lazy-loaded Dashboard Tabs ──────────────────────────────────────────────
// Each tab is dynamically imported — only loads when the user navigates to it.
// This reduces the initial JS payload from ~800KB to ~200KB.
const ProfileSetup = lazy(() => import('./ProfileSetup'));
const WeeklyPlanView = lazy(() => import('./WeeklyPlanView'));
const BloodTypeFoodGuide = lazy(() => import('./BloodTypeFoodGuide'));
const GroceryListView = lazy(() => import('./GroceryListView'));
const KnowledgeBaseView = lazy(() => import('./KnowledgeBaseView'));
const FavoritesView = lazy(() => import('./FavoritesView'));
const ProgressDashboard = lazy(() => import('./ProgressDashboard'));
const LabelAnalyzer = lazy(() => import('./LabelAnalyzer'));
const SettingsPanel = lazy(() => import('./SettingsPanel'));
const HouseholdDashboard = lazy(() => import('./household/HouseholdDashboard'));
const ProfilePage = lazy(() => import('./profile/ProfilePage'));
const MyPantryView = lazy(() => import('./pantry/MyPantryView'));
const LabsRouter = lazy(() => import('./labs/LabsRouter'));
const FitnessDashboard = lazy(() => import('./fitness/FitnessDashboard'));
const NeuroAssessment = lazy(() => import('./assessment/NeuroAssessment'));

export type TabType =
  | 'home'
  | 'profile'
  | 'weekly-plan'
  | 'my-pantry'
  | 'food-guide'
  | 'grocery-list'
  | 'knowledge-base'
  | 'favorites'
  | 'progress'
  | 'label-analyzer'
  | 'labs'
  | 'settings'
  | 'household'
  | 'user-profile'
  | 'fitness'
  | 'neuro-assessment';

// Tab loading spinner
function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-3 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Loading…</p>
      </div>
    </div>
  );
}

export default function Layout() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <WelcomeWidget onNavigate={(tab) => setActiveTab(tab as TabType)} />;
      case 'profile':
        return <ProfileSetup />;
      case 'weekly-plan':
        return <WeeklyPlanView />;
      case 'my-pantry':
        return <MyPantryView />;
      case 'food-guide':
        return <BloodTypeFoodGuide />;
      case 'grocery-list':
        return <GroceryListView />;
      case 'knowledge-base':
        return <KnowledgeBaseView />;
      case 'favorites':
        return <FavoritesView />;
      case 'progress':
        return <ProgressDashboard />;
      case 'label-analyzer':
        return <LabelAnalyzer />;
      case 'labs':
        return <LabsRouter />;
      case 'settings':
        return <SettingsPanel />;
      case 'household':
        return <HouseholdDashboard />;
      case 'user-profile':
        return <ProfilePage />;
      case 'fitness':
        return <FitnessDashboard />;
      case 'neuro-assessment':
        return <NeuroAssessment />;
      default:
        return <WeeklyPlanView />;
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <DashboardHeader
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* API Status Indicator */}
        <div className="absolute top-16 right-4 z-30 hidden sm:block">
          <APIStatusIndicator />
        </div>
        
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 animate-fade-in">
            <Suspense fallback={<TabLoadingFallback />}>
              {renderContent()}
            </Suspense>
          </div>
        </main>
        <ChatPanel />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
