import { useState, useMemo } from 'react';
import { 
  Package, Plus, Search, Filter, Grid3x3, List, SortAsc, 
  Download, Upload, BarChart3, AlertCircle, Clock, Settings
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import PantryItemCard from './PantryItemCard';
import AddPantryItemModal from './AddPantryItemModal';
import PantryStats from './PantryStats';
import PantryFilters from './PantryFilters';
import CustomFieldTemplateManager from './CustomFieldTemplateManager';
import type { FoodCategory, StorageLocation } from '../../types';

export default function MyPantryView() {
  const { 
    pantryItems, 
    pantrySettings,
    updatePantrySettings,
    getLowStockItems,
    getExpiringItems,
    getExpiredItems 
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low-stock' | 'expiring' | 'expired'>('all');

  // Get filtered and sorted items
  const filteredItems = useMemo(() => {
    let items = [...pantryItems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      items = items.filter(item => item.location === selectedLocation);
    }

    // Status filter
    if (filterStatus === 'low-stock') {
      const lowStockItems = getLowStockItems();
      const lowStockIds = new Set(lowStockItems.map(i => i.id));
      items = items.filter(item => lowStockIds.has(item.id));
    } else if (filterStatus === 'expiring') {
      const expiringItems = getExpiringItems(7);
      const expiringIds = new Set(expiringItems.map(i => i.id));
      items = items.filter(item => expiringIds.has(item.id));
    } else if (filterStatus === 'expired') {
      const expiredItems = getExpiredItems();
      const expiredIds = new Set(expiredItems.map(i => i.id));
      items = items.filter(item => expiredIds.has(item.id));
    }

    // Sort items
    items.sort((a, b) => {
      switch (pantrySettings.sortBy) {
        case 'name':
          return pantrySettings.sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'quantity':
          return pantrySettings.sortOrder === 'asc'
            ? a.quantity - b.quantity
            : b.quantity - a.quantity;
        case 'expiration':
          if (!a.expirationDate && !b.expirationDate) return 0;
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return pantrySettings.sortOrder === 'asc'
            ? new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
            : new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime();
        case 'category':
          return pantrySettings.sortOrder === 'asc'
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        case 'added':
          return pantrySettings.sortOrder === 'asc'
            ? new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
            : new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        default:
          return 0;
      }
    });

    return items;
  }, [
    pantryItems, 
    searchQuery, 
    selectedCategory, 
    selectedLocation, 
    filterStatus,
    pantrySettings.sortBy,
    pantrySettings.sortOrder,
    getLowStockItems,
    getExpiringItems,
    getExpiredItems
  ]);

  const lowStockCount = getLowStockItems().length;
  const expiringCount = getExpiringItems(7).length;
  const expiredCount = getExpiredItems().length;

  const toggleView = () => {
    updatePantrySettings({
      defaultView: pantrySettings.defaultView === 'grid' ? 'list' : 'grid',
    });
  };

  const toggleSortOrder = () => {
    updatePantrySettings({
      sortOrder: pantrySettings.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-elevated p-6 bg-gradient-to-r from-primary-50 via-white to-primary-50 dark:from-primary-950/20 dark:via-gray-900 dark:to-primary-950/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              My Pantry
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} in stock
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || expiringCount > 0 || expiredCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lowStockCount > 0 && (
            <button
              onClick={() => setFilterStatus('low-stock')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                filterStatus === 'low-stock'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-100">
                    {lowStockCount} Low Stock
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Items need restocking
                  </p>
                </div>
              </div>
            </button>
          )}

          {expiringCount > 0 && (
            <button
              onClick={() => setFilterStatus('expiring')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                filterStatus === 'expiring'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                    {expiringCount} Expiring Soon
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Use within 7 days
                  </p>
                </div>
              </div>
            </button>
          )}

          {expiredCount > 0 && (
            <button
              onClick={() => setFilterStatus('expired')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                filterStatus === 'expired'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    {expiredCount} Expired
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    Remove from pantry
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search pantry items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full h-10"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} h-10 px-3`}
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </button>

            <button
              onClick={toggleView}
              className="btn btn-secondary h-10 px-3"
              title={`Switch to ${pantrySettings.defaultView === 'grid' ? 'list' : 'grid'} view`}
            >
              {pantrySettings.defaultView === 'grid' ? (
                <List className="w-4 h-4" />
              ) : (
                <Grid3x3 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={toggleSortOrder}
              className="btn btn-secondary h-10 px-3"
              title={`Sort ${pantrySettings.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              <SortAsc className={`w-4 h-4 transition-transform ${pantrySettings.sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className={`btn ${showStats ? 'btn-primary' : 'btn-secondary'} h-10 px-3`}
              title="Statistics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowTemplateManager(true)}
              className="btn btn-secondary h-10 px-3"
              title="Manage Custom Field Templates"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary h-10 px-4 gap-2 min-w-[120px] flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap">Add Item</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <PantryFilters
            selectedCategory={selectedCategory}
            selectedLocation={selectedLocation}
            filterStatus={filterStatus}
            onCategoryChange={setSelectedCategory}
            onLocationChange={setSelectedLocation}
            onStatusChange={setFilterStatus}
            onReset={() => {
              setSelectedCategory('all');
              setSelectedLocation('all');
              setFilterStatus('all');
              setSearchQuery('');
            }}
          />
        )}
      </div>

      {/* Statistics */}
      {showStats && <PantryStats />}

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {pantryItems.length === 0 ? 'Your pantry is empty' : 'No items found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {pantryItems.length === 0 
              ? 'Start adding items to track your inventory' 
              : 'Try adjusting your filters or search query'}
          </p>
          {pantryItems.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary mx-auto px-6 py-3 gap-2 min-w-[180px] flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
              <span className="whitespace-nowrap">Add First Item</span>
            </button>
          )}
        </div>
      ) : (
        <div className={
          pantrySettings.defaultView === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        }>
          {filteredItems.map((item, index) => (
            <PantryItemCard
              key={item.id}
              item={item}
              viewMode={pantrySettings.defaultView}
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <AddPantryItemModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Custom Field Template Manager */}
      {showTemplateManager && (
        <CustomFieldTemplateManager onClose={() => setShowTemplateManager(false)} />
      )}
    </div>
  );
}

