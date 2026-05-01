import { useState, useEffect } from 'react';
import { Check, Download, Printer, ShoppingCart, Package, CheckCircle2, Circle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateGroceryList } from '../services/groceryList';
import type { GroceryItem } from '../types';

export default function GroceryListView() {
  const { currentGroceryList, setCurrentGroceryList, currentPlan, addGroceryList, updateGroceryItem } = useStore();
  const [categories, setCategories] = useState<Record<string, GroceryItem[]>>({});

  useEffect(() => {
    if (currentPlan && !currentGroceryList) {
      const list = generateGroceryList(currentPlan);
      addGroceryList(list);
    }
  }, [currentPlan, currentGroceryList, addGroceryList]);

  useEffect(() => {
    if (currentGroceryList) {
      const grouped = currentGroceryList.items.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, GroceryItem[]>);
      setCategories(grouped);
    }
  }, [currentGroceryList]);

  const handleToggle = (itemId: string) => {
    if (currentGroceryList) {
      const item = currentGroceryList.items.find((i) => i.id === itemId);
      if (item) {
        updateGroceryItem(currentGroceryList.id, itemId, !item.checked);
      }
    }
  };

  const handleExport = () => {
    if (!currentGroceryList) return;

    const content = currentGroceryList.items
      .filter((item) => !item.checked)
      .map((item) => `${item.name} - ${item.quantity}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentGroceryList) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary-400/20 blur-3xl rounded-full"></div>
            <ShoppingCart className="w-20 h-20 text-primary-500 dark:text-primary-400 relative z-10 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            No Grocery List Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Generate a weekly plan first to create a grocery list. The list will be automatically created based on your meal plan.
          </p>
        </div>
      </div>
    );
  }

  const uncheckedCount = currentGroceryList.items.filter((item) => !item.checked).length;
  const checkedCount = currentGroceryList.items.filter((item) => item.checked).length;
  const totalCount = currentGroceryList.items.length;
  const progressPercentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6 bg-gradient-to-r from-primary-50 via-white to-primary-50 dark:from-primary-950/20 dark:via-gray-900 dark:to-primary-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Grocery List
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {uncheckedCount} items remaining • {checkedCount} completed
                </p>
              </div>
            </div>
            {totalCount > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExport}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(categories).map(([category, items], catIndex) => (
          <div key={category} className="card p-5 animate-fade-in" style={{ animationDelay: `${catIndex * 0.05}s` }}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{category}</h2>
              <span className="badge badge-primary ml-auto">
                {items.filter(i => !i.checked).length} remaining
              </span>
            </div>
            <div className="space-y-2">
              {items.map((item, itemIndex) => (
                <button
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    item.checked ? 'opacity-60' : ''
                  }`}
                >
                  {item.checked ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {item.name}
                    </div>
                    {item.quantity && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
