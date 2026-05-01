import React, { useState } from 'react';
import { Heart, Search, Filter } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';

export default function DemoFoodGuide() {
  const { selectedBloodType, setSelectedBloodType } = useDemo();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const categories = ['all', 'proteins', 'vegetables', 'fruits', 'grains', 'dairy', 'nuts-seeds'];

  // Sample food data
  const foods = [
    // Proteins
    { name: 'Salmon', category: 'proteins', beneficial: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], neutral: [], avoid: [] },
    { name: 'Chicken', category: 'proteins', beneficial: ['O+', 'O-', 'B+', 'B-'], neutral: ['A+', 'A-', 'AB+', 'AB-'], avoid: [] },
    { name: 'Tofu', category: 'proteins', beneficial: ['A+', 'A-', 'AB+', 'AB-'], neutral: ['B+', 'B-'], avoid: ['O+', 'O-'] },
    { name: 'Red Meat', category: 'proteins', beneficial: ['O+', 'O-'], neutral: ['B+', 'B-'], avoid: ['A+', 'A-', 'AB+', 'AB-'] },
    
    // Vegetables
    { name: 'Broccoli', category: 'vegetables', beneficial: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], neutral: [], avoid: [] },
    { name: 'Spinach', category: 'vegetables', beneficial: ['A+', 'A-', 'AB+', 'AB-'], neutral: ['B+', 'B-'], avoid: ['O+', 'O-'] },
    { name: 'Kale', category: 'vegetables', beneficial: ['O+', 'O-', 'B+', 'B-'], neutral: ['A+', 'A-', 'AB+', 'AB-'], avoid: [] },
    { name: 'Tomatoes', category: 'vegetables', beneficial: ['B+', 'B-', 'AB+', 'AB-'], neutral: ['O+', 'O-'], avoid: ['A+', 'A-'] },
    
    // Fruits
    { name: 'Blueberries', category: 'fruits', beneficial: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], neutral: [], avoid: [] },
    { name: 'Pineapple', category: 'fruits', beneficial: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], neutral: [], avoid: ['O+', 'O-'] },
    { name: 'Bananas', category: 'fruits', beneficial: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], neutral: [], avoid: ['O+', 'O-'] },
    { name: 'Cherries', category: 'fruits', beneficial: ['O+', 'O-', 'A+', 'A-'], neutral: ['B+', 'B-', 'AB+', 'AB-'], avoid: [] },
    
    // Grains
    { name: 'Quinoa', category: 'grains', beneficial: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], neutral: ['O+', 'O-'], avoid: [] },
    { name: 'Rice (Brown)', category: 'grains', beneficial: ['B+', 'B-', 'AB+', 'AB-'], neutral: ['A+', 'A-'], avoid: ['O+', 'O-'] },
    { name: 'Oats', category: 'grains', beneficial: ['A+', 'A-', 'AB+', 'AB-'], neutral: ['B+', 'B-'], avoid: ['O+', 'O-'] },
    { name: 'Wheat', category: 'grains', beneficial: [], neutral: ['A+', 'A-', 'AB+', 'AB-'], avoid: ['O+', 'O-', 'B+', 'B-'] },
    
    // Dairy
    { name: 'Greek Yogurt', category: 'dairy', beneficial: ['B+', 'B-', 'AB+', 'AB-'], neutral: ['A+', 'A-'], avoid: ['O+', 'O-'] },
    { name: 'Cheese (Mozzarella)', category: 'dairy', beneficial: ['B+', 'B-', 'AB+', 'AB-'], neutral: [], avoid: ['O+', 'O-', 'A+', 'A-'] },
    { name: 'Almond Milk', category: 'dairy', beneficial: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], neutral: ['O+', 'O-'], avoid: [] },
    
    // Nuts & Seeds
    { name: 'Almonds', category: 'nuts-seeds', beneficial: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], neutral: ['O+', 'O-'], avoid: [] },
    { name: 'Walnuts', category: 'nuts-seeds', beneficial: ['A+', 'A-', 'AB+', 'AB-'], neutral: ['O+', 'O-', 'B+', 'B-'], avoid: [] },
    { name: 'Chia Seeds', category: 'nuts-seeds', beneficial: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], neutral: [], avoid: [] },
  ];

  const filteredFoods = foods
    .filter(food => selectedCategory === 'all' || food.category === selectedCategory)
    .filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusForBloodType = (food: typeof foods[0]) => {
    if (food.beneficial.includes(selectedBloodType)) return 'beneficial';
    if (food.avoid.includes(selectedBloodType)) return 'avoid';
    return 'neutral';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'beneficial': return 'border-emerald-300 bg-emerald-50';
      case 'neutral': return 'border-amber-300 bg-amber-50';
      case 'avoid': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'beneficial': return 'badge-beneficial';
      case 'neutral': return 'badge-neutral';
      case 'avoid': return 'badge-avoid';
      default: return '';
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <Heart className="w-4 h-4" />
            Blood Type Food Guide
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Food <span className="gradient-text-purple">Compatibility Guide</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover which foods are beneficial, neutral, or should be avoided for your blood type
          </p>
        </div>

        {/* Blood Type Selector */}
        <div className="glass-card-light rounded-2xl p-6 mb-8 fade-in-section">
          <h3 className="font-bold text-gray-900 mb-4 text-center">Select Your Blood Type</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {bloodTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedBloodType(type)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  selectedBloodType === type
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-110'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card-light rounded-2xl p-6 mb-8 fade-in-section">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-semibold text-gray-700"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat.replace('-', ' ').charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 fade-in-section">
          <div className="flex items-center gap-2">
            <div className="badge-beneficial">Beneficial</div>
            <span className="text-sm text-gray-600">Best for your blood type</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="badge-neutral">Neutral</div>
            <span className="text-sm text-gray-600">Can be consumed in moderation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="badge-avoid">Avoid</div>
            <span className="text-sm text-gray-600">Not recommended</span>
          </div>
        </div>

        {/* Foods Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 fade-in-section">
          {filteredFoods.map((food, index) => {
            const status = getStatusForBloodType(food);
            
            return (
              <div
                key={`${food.name}-${index}`}
                className={`border-2 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg ${getStatusColor(status)}`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{food.name}</h4>
                  <div className="text-xs text-gray-600 capitalize mb-3">{food.category.replace('-', ' ')}</div>
                  <div className={`inline-block ${getStatusBadge(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFoods.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No foods found matching your search.</p>
          </div>
        )}

        {/* Info Box */}
        <div className="glass-card-light rounded-2xl p-8 mt-12 fade-in-section text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Personalized Nutrition Based on Science
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            Our food compatibility guide is based on blood type nutrition research. The app automatically 
            checks every ingredient in your meal plans against your family's blood types to ensure optimal 
            nutrition and health benefits.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
              1000+ Foods Analyzed
            </div>
            <div className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full font-semibold">
              All Blood Types Supported
            </div>
            <div className="px-6 py-3 bg-pink-100 text-pink-700 rounded-full font-semibold">
              Science-Backed Data
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

