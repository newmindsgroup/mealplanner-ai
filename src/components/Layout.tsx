import { useState } from 'react';
import Sidebar from './Sidebar';
import ChatPanel from './ChatPanel';
import APIStatusIndicator from './APIStatusIndicator';
import ProfileSetup from './ProfileSetup';
import WeeklyPlanView from './WeeklyPlanView';
import BloodTypeFoodGuide from './BloodTypeFoodGuide';
import GroceryListView from './GroceryListView';
import KnowledgeBaseView from './KnowledgeBaseView';
import FavoritesView from './FavoritesView';
import ProgressDashboard from './ProgressDashboard';
import LabelAnalyzer from './LabelAnalyzer';
import SettingsPanel from './SettingsPanel';
import HouseholdDashboard from './household/HouseholdDashboard';
import ProfilePage from './profile/ProfilePage';
import MyPantryView from './pantry/MyPantryView';
import LabsRouter from './labs/LabsRouter';
import FitnessDashboard from './fitness/FitnessDashboard';

export type TabType =
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
  | 'fitness';

export default function Layout() {
  const [activeTab, setActiveTab] = useState<TabType>('weekly-plan');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
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
        {/* API Status Indicator - Fixed in top-right */}
        <div className="absolute top-4 right-4 z-30 hidden sm:block">
          <APIStatusIndicator />
        </div>
        
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in">
            {renderContent()}
          </div>
        </main>
        <ChatPanel />
      </div>
    </div>
  );
}
