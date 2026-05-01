import { useMemo } from 'react';
import { 
  Package, TrendingUp, AlertCircle, Clock, DollarSign, 
  PieChart, Activity, Award
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { calculatePantryHealthScore, getTopUsedItems } from '../../services/pantryInventory';

export default function PantryStats() {
  const { getPantryStats, pantryItems } = useStore();
  
  const stats = useMemo(() => getPantryStats(), [getPantryStats]);
  
  const healthScore = useMemo(
    () => calculatePantryHealthScore(pantryItems, stats),
    [pantryItems, stats]
  );

  const topUsed = useMemo(
    () => getTopUsedItems(pantryItems, 5),
    [pantryItems]
  );

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {/* Total Items */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <Package className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalItems}
          </span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Total Items
        </h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(stats.itemsByCategory).slice(0, 3).map(([category, count]) => (
            <span key={category} className="text-xs badge badge-secondary">
              {category}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Health Score */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <Activity className={`w-8 h-8 ${getHealthScoreColor(healthScore)}`} />
          <span className={`text-3xl font-bold ${getHealthScoreColor(healthScore)}`}>
            {healthScore}
          </span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Health Score
        </h3>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {getHealthScoreLabel(healthScore)}
        </p>
      </div>

      {/* Alerts */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <AlertCircle className="w-8 h-8 text-orange-500" />
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.lowStockCount + stats.expiringCount + stats.expiredCount}
          </span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Attention Needed
        </h3>
        <div className="mt-2 space-y-1 text-xs">
          {stats.lowStockCount > 0 && (
            <p className="text-orange-600 dark:text-orange-400">
              {stats.lowStockCount} low stock
            </p>
          )}
          {stats.expiringCount > 0 && (
            <p className="text-yellow-600 dark:text-yellow-400">
              {stats.expiringCount} expiring soon
            </p>
          )}
          {stats.expiredCount > 0 && (
            <p className="text-red-600 dark:text-red-400">
              {stats.expiredCount} expired
            </p>
          )}
        </div>
      </div>

      {/* Value */}
      {stats.totalValue && stats.totalValue > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              ${stats.totalValue.toFixed(2)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Value
          </h3>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Estimated inventory value
          </p>
        </div>
      )}

      {/* Top Used Items */}
      {topUsed.length > 0 && (
        <div className="card p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Most Used Items
            </h3>
          </div>
          <div className="space-y-2">
            {topUsed.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-medium text-primary-700 dark:text-primary-300">
                    {index + 1}
                  </span>
                  {item.name}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {item.count} uses
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Distribution */}
      <div className="card p-4 md:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Storage Distribution
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(stats.itemsByLocation).map(([location, count]) => (
            <div key={location} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

