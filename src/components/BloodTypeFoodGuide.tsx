// Enhanced Blood Type Food Guide - Main Component
import { useState, useMemo, useEffect } from 'react';
import { Search, Download, FileText, Plus, Sparkles, Apple as AppleIcon, Utensils, Coffee, Sun, Moon, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import SwarmAnalysisPanel from './shared/SwarmAnalysisPanel';
import { checkSwarmHealth, type SwarmHealthStatus } from '../services/swarmService';
import { 
  bloodTypeFoodDatabase, 
  getFoodsByBloodType,
  searchFoods,
  getTotalStats,
  foodCategories,
  categoryLabels,
  type FoodItem,
  type FoodMealType,
} from '../data/bloodTypeFoods';
import { exportFoodGuidePDF, exportFoodGuideCSV } from '../services/foodExportService';
import type { Person } from '../types';
import EducationalHeader from './food-guide/EducationalHeader';
import QuickTipsPanel from './food-guide/QuickTipsPanel';
import EnhancedFoodCard from './food-guide/EnhancedFoodCard';
import AddFoodModal from './food-guide/AddFoodModal';
import MyCustomFoods from './food-guide/MyCustomFoods';
import FoodsToAvoidGuide from './food-guide/FoodsToAvoidGuide';

type ViewMode = 'all' | 'database' | 'custom';

const mealTypeIcons: Record<FoodMealType, typeof Utensils> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Utensils,
  anytime: Clock,
};

export default function BloodTypeFoodGuide() {
  const { people, userFoodGuides } = useStore();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(people[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMealType, setSelectedMealType] = useState<FoodMealType | 'all'>('all');
  const [filterClassification, setFilterClassification] = useState<'all' | 'beneficial' | 'neutral' | 'avoid'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [showAvoidGuide, setShowAvoidGuide] = useState(false);
  const [swarmHealth, setSwarmHealth] = useState<SwarmHealthStatus | null>(null);
  const [showSwarmPanel, setShowSwarmPanel] = useState(false);

  useEffect(() => {
    checkSwarmHealth().then(setSwarmHealth).catch(() => {});
  }, []);

  // Get custom foods for selected person
  const userGuide = selectedPerson ? userFoodGuides.find(g => g.userId === selectedPerson.id) : null;
  const customFoods = userGuide?.customFoods || [];

  // Get filtered foods
  const filteredFoods = useMemo(() => {
    if (!selectedPerson) return [];

    let foods: FoodItem[] = [];

    // Determine which foods to include based on view mode
    if (viewMode === 'custom') {
      foods = customFoods;
    } else if (viewMode === 'database') {
      foods = bloodTypeFoodDatabase;
    } else {
      // 'all' - combine database and custom foods
      foods = [...bloodTypeFoodDatabase, ...customFoods];
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      foods = foods.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query) ||
        f.subcategory?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      foods = foods.filter(f => f.category === selectedCategory);
    }

    // Apply meal type filter
    if (selectedMealType !== 'all') {
      foods = foods.filter(f => f.mealTypes?.includes(selectedMealType));
    }

    // Apply classification filter
    if (filterClassification !== 'all') {
      foods = foods.filter(f => f.classification[selectedPerson.bloodType] === filterClassification);
    }

    // Sort by classification (beneficial first, then neutral, then avoid)
    return foods.sort((a, b) => {
      const aClass = a.classification[selectedPerson.bloodType];
      const bClass = b.classification[selectedPerson.bloodType];
      const order = { beneficial: 0, neutral: 1, avoid: 2 };
      return order[aClass] - order[bClass];
    });
  }, [selectedPerson, searchQuery, selectedCategory, selectedMealType, filterClassification, viewMode, customFoods]);

  // Update AI suggestion when search results change
  useEffect(() => {
    if (searchQuery.trim().length > 0 && filteredFoods.length === 0) {
      setShowAISuggestion(true);
    } else {
      setShowAISuggestion(false);
    }
  }, [searchQuery, filteredFoods.length]);

  // Get stats
  const stats = selectedPerson ? getTotalStats(selectedPerson.bloodType) : { beneficial: 0, neutral: 0, avoid: 0 };

  const handleExportPDF = async () => {
    if (!selectedPerson) return;
    setIsExporting(true);
    try {
      await exportFoodGuidePDF(selectedPerson.bloodType, selectedPerson.name);
    } catch (error: any) {
      console.error('PDF export error:', error);
      alert(
        'PDF export requires additional libraries.\n\n' +
        'To enable PDF export, run this command:\n' +
        'npm install jspdf jspdf-autotable\n\n' +
        'CSV export is available and works without installation!'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedPerson) return;
    exportFoodGuideCSV(selectedPerson.bloodType, selectedPerson.name);
  };

  const handleAISuggestionClick = () => {
    setShowAddFoodModal(true);
  };

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center max-w-md">
          <AppleIcon className="w-20 h-20 text-primary-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            No Family Members Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Add family members in Profile Setup to view their personalized food guide based on blood type.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-r from-green-50 via-white to-green-50 dark:from-green-950/20 dark:via-gray-900 dark:to-green-950/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <AppleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Blood Type Food Guide
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover foods that work best with your blood type
            </p>
          </div>
        </div>

        {/* Person Selector */}
        {people.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPerson?.id === person.id
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {person.name} ({person.bloodType})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Educational Header */}
      <EducationalHeader />

      {/* Quick Tips Panel */}
      {selectedPerson && <QuickTipsPanel bloodType={selectedPerson.bloodType} />}

      {/* My Custom Foods */}
      {selectedPerson && <MyCustomFoods selectedPerson={selectedPerson} />}

      {/* Stats Summary */}
      {selectedPerson && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900 border-2 border-green-200 dark:border-green-900/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Beneficial</span>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.beneficial}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Foods that enhance your health</p>
          </div>

          <div className="card p-5 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-900/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Neutral</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">○</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.neutral}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Foods you can enjoy moderately</p>
          </div>

          <div className="card p-5 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-gray-900 border-2 border-red-200 dark:border-red-900/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avoid</span>
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">✗</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.avoid}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Foods to minimize or eliminate</p>
          </div>
        </div>
      )}

      {/* NourishAI Food Intelligence */}
      {swarmHealth?.status === 'healthy' && selectedPerson && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowSwarmPanel(!showSwarmPanel)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-white">NourishAI Food Intelligence</h3>
                <p className="text-xs text-gray-500">Deep research on foods, blood type interactions, and USDA nutrition</p>
              </div>
            </div>
            {showSwarmPanel ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {showSwarmPanel && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              <SwarmAnalysisPanel
                taskType="meal_plan_verified"
                context={{
                  personName: selectedPerson.name,
                  bloodType: selectedPerson.bloodType,
                  allergies: selectedPerson.allergies,
                  stats,
                  searchQuery: searchQuery || undefined,
                }}
                title="Blood Type Food Research"
                description="Cross-reference D'Adamo methodology with PubMed, lectin studies, and USDA FoodData Central."
                buttonLabel="Research Foods"
                accentColor="green"
                gradientClasses="from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
              />
            </div>
          )}
        </div>
      )}

      {/* Search, Filters, and Actions */}
      <div className="card p-4 space-y-4">
        {/* Search and Action Buttons */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAvoidGuide(!showAvoidGuide)}
            className={`btn flex items-center gap-2 whitespace-nowrap ${
              showAvoidGuide 
                ? 'btn-primary' 
                : 'btn-secondary border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
          >
            <AppleIcon className="w-5 h-5" />
            <span className="hidden lg:inline">{showAvoidGuide ? 'Hide' : 'View'} Avoid Guide</span>
          </button>
          <button
            onClick={() => setShowAddFoodModal(true)}
            className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Food</span>
          </button>
        </div>

        {/* AI Suggestion for No Results */}
        {showAISuggestion && (
          <button
            onClick={handleAISuggestionClick}
            className="w-full p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-center gap-3 group"
          >
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-semibold text-indigo-900 dark:text-indigo-300">
                No results found for "{searchQuery}"
              </p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400">
                Click here to ask AI about this food →
              </p>
            </div>
          </button>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* View Mode Toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              All Foods
            </button>
            <button
              onClick={() => setViewMode('database')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'database'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Database
            </button>
            {customFoods.length > 0 && (
              <button
                onClick={() => setViewMode('custom')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'custom'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                My Foods
              </button>
            )}
          </div>

          {/* Meal Type Filter */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setSelectedMealType('all')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                selectedMealType === 'all'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              All Meals
            </button>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as FoodMealType[]).map((mealType) => {
              const Icon = mealTypeIcons[mealType];
              return (
                <button
                  key={mealType}
                  onClick={() => setSelectedMealType(mealType)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    selectedMealType === mealType
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="capitalize hidden sm:inline">{mealType}</span>
                </button>
              );
            })}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="all">All Categories</option>
            {foodCategories.map((cat) => (
              <option key={cat} value={cat}>{categoryLabels[cat]}</option>
            ))}
          </select>

          {/* Classification Filter */}
          <select
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="beneficial">✓ Beneficial</option>
            <option value="neutral">○ Neutral</option>
            <option value="avoid">✗ Avoid</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn btn-secondary flex items-center gap-2 whitespace-nowrap text-sm"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary flex items-center gap-2 whitespace-nowrap text-sm"
          >
            <FileText className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <p>
          Showing <span className="font-bold text-gray-900 dark:text-white">{filteredFoods.length}</span> foods
          {searchQuery && ` for "${searchQuery}"`}
          {selectedCategory !== 'all' && ` in ${categoryLabels[selectedCategory as keyof typeof categoryLabels]}`}
        </p>
      </div>

      {/* Food Grid with Enhanced Cards */}
      {selectedPerson && filteredFoods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFoods.map((food) => {
            const isCustom = customFoods.some(cf => cf.id === food.id);
            return (
              <EnhancedFoodCard
                key={food.id}
                food={food}
                bloodType={selectedPerson.bloodType}
                isCustom={isCustom}
              />
            );
          })}
        </div>
      )}

      {/* No Results */}
      {filteredFoods.length === 0 && !showAISuggestion && !showAvoidGuide && (
        <div className="text-center py-12">
          <AppleIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No foods found matching your filters.</p>
        </div>
      )}

      {/* Comprehensive Foods To Avoid Guide */}
      {showAvoidGuide && selectedPerson && (
        <FoodsToAvoidGuide
          bloodType={selectedPerson.bloodType}
          onClose={() => setShowAvoidGuide(false)}
        />
      )}

      {/* Add Food Modal */}
      {showAddFoodModal && selectedPerson && (
        <AddFoodModal
          bloodType={selectedPerson.bloodType}
          userId={selectedPerson.id}
          onClose={() => setShowAddFoodModal(false)}
          onSuccess={() => {
            // Optionally refresh or update the view
          }}
        />
      )}
    </div>
  );
}
