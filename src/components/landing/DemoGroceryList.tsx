import React, { useState } from 'react';
import {
  ShoppingCart, Check, Download, Share2, Zap,
  MapPin, Clock, Sparkles, ChevronRight, RefreshCw
} from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';

// Show only top categories and a capped number of items — homepage preview, not full list
const PREVIEW_CATEGORIES = ['proteins', 'vegetables', 'grains'];
const ITEMS_PER_CATEGORY = 3;

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string; aisle: string }> = {
  proteins:   { label: 'Proteins',   emoji: '🥩', color: 'from-red-400 to-pink-500',     aisle: 'Aisle 4 · Meat & Seafood' },
  vegetables: { label: 'Vegetables', emoji: '🥦', color: 'from-emerald-400 to-green-500', aisle: 'Aisle 1 · Produce' },
  grains:     { label: 'Grains',     emoji: '🌾', color: 'from-amber-400 to-yellow-500',  aisle: 'Aisle 7 · Bread & Pasta' },
};

const SMART_STATS = [
  { icon: Zap,         value: '2 min',  label: 'to generate',    color: 'text-amber-500'   },
  { icon: MapPin,      value: '9',      label: 'store sections',  color: 'text-blue-500'    },
  { icon: Clock,       value: '~45%',   label: 'less prep time',  color: 'text-emerald-500' },
  { icon: RefreshCw,   value: 'Auto',   label: 'from meal plan',  color: 'text-purple-500'  },
];

export default function DemoGroceryList() {
  const { groceryList, toggleGroceryItem } = useDemo();
  const [activeCategory, setActiveCategory] = useState('proteins');

  // Build preview groups
  const previewGroups = PREVIEW_CATEGORIES.map(id => ({
    id,
    ...CATEGORY_META[id],
    items: groceryList.items
      .filter(item => item.category === id)
      .slice(0, ITEMS_PER_CATEGORY),
  }));

  const activeGroup = previewGroups.find(g => g.id === activeCategory) ?? previewGroups[0];
  const checkedCount = groceryList.items.filter(i => i.checked).length;
  const totalCount   = groceryList.items.length;
  const progress     = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">

        {/* ── Section Header ────────────────────────────────── */}
        <div className="text-center mb-14 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <ShoppingCart className="w-4 h-4" />
            Smart Shopping
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="gradient-text-green">Grocery Lists That Think</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Instantly generated from your weekly meal plan — sorted by store aisle, synced with your pantry, ready to share.
          </p>
        </div>

        {/* ── Two-Column Layout ─────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-10 items-start max-w-5xl mx-auto fade-in-section">

          {/* LEFT — Interactive Preview */}
          <div className="glass-card-light rounded-2xl overflow-hidden shadow-sm">

            {/* List Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{groceryList.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {checkedCount}/{totalCount} items · {totalCount - checkedCount} remaining
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Export">
                    <Download className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Share">
                    <Share2 className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{progress}% complete</p>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 px-6 pt-4">
              {previewGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => setActiveCategory(group.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeCategory === group.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{group.emoji}</span>
                  <span>{group.label}</span>
                </button>
              ))}
            </div>

            {/* Aisle Badge */}
            <div className="px-6 pt-3 pb-2">
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                <MapPin className="w-3 h-3" />
                {activeGroup.aisle}
              </div>
            </div>

            {/* Item List */}
            <div className="px-6 pb-4 space-y-1">
              {activeGroup.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleGroceryItem(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-emerald-50 group ${
                    item.checked ? 'opacity-50' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    item.checked
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-gray-300 bg-white group-hover:border-emerald-400'
                  }`}>
                    {item.checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 text-left">
                    <span className={`text-sm font-semibold ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">{item.quantity}</span>
                  </div>
                  {item.aisle && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex-shrink-0">
                      {item.aisle}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* "View All" nudge */}
            <div className="px-6 pb-5">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <span className="text-xs text-emerald-700 font-medium">
                  + {totalCount - PREVIEW_CATEGORIES.length * ITEMS_PER_CATEGORY} more items across 6 sections
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* RIGHT — Feature Callouts */}
          <div className="space-y-5">

            {/* Smart Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              {SMART_STATS.map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="glass-card-light rounded-xl p-4 flex items-center gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
                  <div>
                    <div className="font-bold text-gray-900 text-sm leading-tight">{value}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature List */}
            {[
              {
                icon: Sparkles,
                color: 'from-emerald-400 to-green-500',
                title: 'Auto-Generated from Your Plan',
                desc: 'Tap "Generate" after planning your week — every ingredient is automatically pulled, de-duped, and quantified.',
              },
              {
                icon: MapPin,
                color: 'from-blue-400 to-cyan-500',
                title: 'Sorted by Store Aisle',
                desc: 'Items are organized by produce, proteins, dairy, and more — so you move through the store once without backtracking.',
              },
              {
                icon: RefreshCw,
                color: 'from-purple-400 to-pink-500',
                title: 'Pantry-Aware Quantities',
                desc: 'Already have chicken at home? The list subtracts what\'s in your pantry so you only buy what you actually need.',
              },
              {
                icon: Share2,
                color: 'from-amber-400 to-orange-500',
                title: 'Share, Export, or Print',
                desc: 'Send to a family member, export as PDF, or print before you head to the store — works on any device.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex gap-4 group">
                <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-0.5">{title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
