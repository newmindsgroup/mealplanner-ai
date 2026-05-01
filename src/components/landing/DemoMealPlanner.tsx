import React, { useState } from 'react';
import { Calendar, Clock, Users, TrendingUp, X, ChevronRight } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';
import type { Meal } from '../../types';

export default function DemoMealPlanner() {
  const { weeklyPlan, people, selectedMealId, setSelectedMealId } = useDemo();
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const selectedMeal = selectedMealId
    ? Object.values(weeklyPlan.meals).flatMap(day => 
        [day.breakfast, day.lunch, day.dinner, day.snack].filter(Boolean)
      ).find(meal => meal?.id === selectedMealId)
    : null;

  const getBloodTypeColor = (status: 'beneficial' | 'neutral' | 'avoid') => {
    switch (status) {
      case 'beneficial': return 'text-emerald-600 bg-emerald-50';
      case 'neutral': return 'text-amber-600 bg-amber-50';
      case 'avoid': return 'text-red-600 bg-red-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <Calendar className="w-4 h-4" />
            Interactive Demo
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your <span className="gradient-text-green">Weekly Meal Plan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Click any meal to see detailed nutrition info, blood type compatibility, and cooking instructions
          </p>
        </div>

        {/* Family Members */}
        <div className="glass-card-light rounded-2xl p-6 mb-8 fade-in-section">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">Planning for:</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {people.map(person => (
              <div key={person.id} className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{person.name}</div>
                  <div className="text-xs text-gray-600">Type {person.bloodType}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="glass-card-light rounded-2xl p-6 md:p-8 fade-in-section">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {days.map((day, index) => {
              const dayMeals = weeklyPlan.meals[day as keyof typeof weeklyPlan.meals];
              const isHovered = hoveredDay === day;
              
              return (
                <div
                  key={day}
                  className={`glass-card rounded-xl p-4 transition-all duration-300 ${
                    isHovered ? 'scale-105 shadow-lg' : ''
                  }`}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className="text-center mb-3">
                    <div className="font-bold text-gray-900 text-lg">{dayLabels[index]}</div>
                    <div className="text-xs text-gray-500 capitalize">{day}</div>
                  </div>

                  <div className="space-y-2">
                    {/* Breakfast */}
                    {dayMeals?.breakfast && (
                      <button
                        onClick={() => setSelectedMealId(dayMeals.breakfast!.id)}
                        className="w-full text-left p-3 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 transition-all hover:scale-105"
                      >
                        <div className="text-xs text-amber-700 font-semibold mb-1">Breakfast</div>
                        <div className="text-sm font-bold text-amber-900 line-clamp-2">
                          {dayMeals.breakfast.name}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                          <Clock className="w-3 h-3" />
                          {(dayMeals.breakfast.prepTime || 0) + (dayMeals.breakfast.cookTime || 0)}m
                        </div>
                      </button>
                    )}

                    {/* Lunch */}
                    {dayMeals?.lunch && (
                      <button
                        onClick={() => setSelectedMealId(dayMeals.lunch!.id)}
                        className="w-full text-left p-3 rounded-lg bg-gradient-to-br from-emerald-100 to-cyan-100 hover:from-emerald-200 hover:to-cyan-200 transition-all hover:scale-105"
                      >
                        <div className="text-xs text-emerald-700 font-semibold mb-1">Lunch</div>
                        <div className="text-sm font-bold text-emerald-900 line-clamp-2">
                          {dayMeals.lunch.name}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                          <Clock className="w-3 h-3" />
                          {(dayMeals.lunch.prepTime || 0) + (dayMeals.lunch.cookTime || 0)}m
                        </div>
                      </button>
                    )}

                    {/* Dinner */}
                    {dayMeals?.dinner && (
                      <button
                        onClick={() => setSelectedMealId(dayMeals.dinner!.id)}
                        className="w-full text-left p-3 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-all hover:scale-105"
                      >
                        <div className="text-xs text-purple-700 font-semibold mb-1">Dinner</div>
                        <div className="text-sm font-bold text-purple-900 line-clamp-2">
                          {dayMeals.dinner.name}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-purple-600">
                          <Clock className="w-3 h-3" />
                          {(dayMeals.dinner.prepTime || 0) + (dayMeals.dinner.cookTime || 0)}m
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meal Detail Modal */}
        {selectedMeal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card-light rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto scale-in">
              {/* Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-6 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedMeal.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {(selectedMeal.prepTime || 0) + (selectedMeal.cookTime || 0)} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedMeal.servings} servings
                    </div>
                    <div className="capitalize px-3 py-1 bg-gray-100 rounded-full">
                      {selectedMeal.cuisine}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMealId(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Rationale */}
                {selectedMeal.rationale && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-emerald-900 mb-1">Why this meal?</div>
                        <p className="text-emerald-800 text-sm">{selectedMeal.rationale}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blood Type Compatibility */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Blood Type Compatibility
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {people.map(person => {
                      const compat = selectedMeal.bloodTypeCompatibility?.[person.bloodType];
                      if (!compat) return null;
                      
                      return (
                        <div key={person.id} className={`p-4 rounded-xl ${getBloodTypeColor(compat.status)}`}>
                          <div className="font-semibold mb-1">{person.name}</div>
                          <div className="text-sm opacity-75 mb-2">Type {person.bloodType}</div>
                          <div className={`text-2xl font-bold ${getScoreColor(compat.score)}`}>
                            {compat.score}/100
                          </div>
                          <div className="text-xs capitalize mt-1 font-semibold">{compat.status}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nutrition */}
                {selectedMeal.nutrition && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Nutrition Facts</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="glass-card p-3 text-center rounded-xl">
                        <div className="text-2xl font-bold gradient-text-green">{selectedMeal.nutrition.calories}</div>
                        <div className="text-xs text-gray-600 mt-1">Calories</div>
                      </div>
                      <div className="glass-card p-3 text-center rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{selectedMeal.nutrition.protein}g</div>
                        <div className="text-xs text-gray-600 mt-1">Protein</div>
                      </div>
                      <div className="glass-card p-3 text-center rounded-xl">
                        <div className="text-2xl font-bold text-amber-600">{selectedMeal.nutrition.carbs}g</div>
                        <div className="text-xs text-gray-600 mt-1">Carbs</div>
                      </div>
                      <div className="glass-card p-3 text-center rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">{selectedMeal.nutrition.fat}g</div>
                        <div className="text-xs text-gray-600 mt-1">Fat</div>
                      </div>
                      <div className="glass-card p-3 text-center rounded-xl">
                        <div className="text-2xl font-bold text-emerald-600">{selectedMeal.nutrition.fiber}g</div>
                        <div className="text-xs text-gray-600 mt-1">Fiber</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Ingredients</h4>
                  <ul className="space-y-2">
                    {selectedMeal.ingredients?.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <ChevronRight className="w-4 h-4 text-emerald-500" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                {selectedMeal.instructions && selectedMeal.instructions.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Instructions</h4>
                    <ol className="space-y-3">
                      {selectedMeal.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="text-gray-700 pt-0.5">{instruction}</div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

