import React from 'react';
import { ShoppingCart, Check, Download, Share2, Printer } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';

export default function DemoGroceryList() {
  const { groceryList, toggleGroceryItem } = useDemo();

  const categories = [
    { id: 'proteins', label: 'Proteins', color: 'from-red-400 to-pink-500' },
    { id: 'vegetables', label: 'Vegetables', color: 'from-emerald-400 to-green-500' },
    { id: 'fruits', label: 'Fruits', color: 'from-orange-400 to-amber-500' },
    { id: 'grains', label: 'Grains', color: 'from-amber-400 to-yellow-500' },
    { id: 'dairy', label: 'Dairy', color: 'from-blue-400 to-cyan-500' },
    { id: 'nuts-seeds', label: 'Nuts & Seeds', color: 'from-purple-400 to-pink-500' },
    { id: 'oils', label: 'Oils & Condiments', color: 'from-yellow-400 to-amber-500' },
    { id: 'spices', label: 'Herbs & Spices', color: 'from-green-400 to-emerald-500' },
    { id: 'sweeteners', label: 'Sweeteners', color: 'from-pink-400 to-rose-500' },
  ];

  const groupedItems = categories.map(category => ({
    ...category,
    items: groceryList.items.filter(item => item.category === category.id)
  })).filter(group => group.items.length > 0);

  const checkedCount = groceryList.items.filter(item => item.checked).length;
  const totalCount = groceryList.items.length;
  const progress = (checkedCount / totalCount) * 100;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <ShoppingCart className="w-4 h-4" />
            Smart Shopping
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="gradient-text-green">Smart Grocery Lists</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Auto-generated shopping lists organized by category and aisle for efficient shopping
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* List Header */}
          <div className="glass-card-light rounded-2xl p-6 mb-8 fade-in-section">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{groceryList.name}</h3>
                <div className="text-sm text-gray-600">
                  {checkedCount} of {totalCount} items checked
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="progress-bar absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Grouped Items */}
          <div className="space-y-6 fade-in-section">
            {groupedItems.map((group, groupIndex) => (
              <div key={group.id} className="glass-card-light rounded-2xl p-6 hover-lift" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${group.color} rounded-lg flex items-center justify-center`}>
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{group.label}</h4>
                    <div className="text-xs text-gray-600">
                      {group.items.filter(i => i.checked).length} / {group.items.length} items
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleGroceryItem(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-white/50 ${
                        item.checked ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        item.checked
                          ? 'bg-gradient-to-br from-emerald-500 to-green-500 border-emerald-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 text-left">
                        <div className={`font-semibold ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.name}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">{item.quantity}</span>
                          {item.aisle && (
                            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                              {item.aisle}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 fade-in-section">
            <div className="glass-card-light rounded-xl p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Auto-Generated</h4>
              <p className="text-sm text-gray-600">Lists created automatically from your meal plans</p>
            </div>
            <div className="glass-card-light rounded-xl p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Easy Sharing</h4>
              <p className="text-sm text-gray-600">Share lists with family or shopping partners</p>
            </div>
            <div className="glass-card-light rounded-xl p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Multiple Formats</h4>
              <p className="text-sm text-gray-600">Export as PDF, print, or sync to mobile</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

