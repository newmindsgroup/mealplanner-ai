import React from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Brain, RefreshCw, Activity, ArrowRight, Zap, Lightbulb, Shield, Heart } from 'lucide-react';

export default function NeuroReport() {
  const { result, resetAssessment } = useAssessmentStore();

  if (!result) return null;

  const natureData = [
    { subject: 'Dopamine', A: result.natureScores.dopamine, fullMark: 15 },
    { subject: 'Acetylcholine', A: result.natureScores.acetylcholine, fullMark: 15 },
    { subject: 'Serotonin', A: result.natureScores.serotonin, fullMark: 15 },
    { subject: 'GABA', A: result.natureScores.gaba, fullMark: 15 },
  ];

  const deficiencyData = [
    { name: 'Dopamine', score: result.deficiencyScores.dopamine, level: result.deficiencyLevels.dopamine },
    { name: 'Acetylcholine', score: result.deficiencyScores.acetylcholine, level: result.deficiencyLevels.acetylcholine },
    { name: 'GABA', score: result.deficiencyScores.gaba, level: result.deficiencyLevels.gaba },
    { name: 'Serotonin', score: result.deficiencyScores.serotonin, level: result.deficiencyLevels.serotonin },
  ];

  const getDeficiencyColor = (score: number) => {
    if (score >= 16) return '#ef4444'; // Severe
    if (score >= 9) return '#f97316'; // Major
    if (score >= 6) return '#eab308'; // Moderate
    if (score >= 1) return '#3b82f6'; // Minor
    return '#10b981'; // None
  };

  const getTraitIcon = (cat: string) => {
    switch (cat) {
      case 'dopamine': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'acetylcholine': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'gaba': return <Shield className="w-5 h-5 text-green-500" />;
      case 'serotonin': return <Heart className="w-5 h-5 text-red-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRecommendations = (cat: string) => {
    switch(cat) {
      case 'dopamine': return "Increase intake of Tyrosine-rich foods: lean chicken, fish, almonds, eggs. Add cardiovascular exercise to your routine.";
      case 'acetylcholine': return "Focus on Choline-rich foods: egg yolks, cruciferous vegetables, beef liver. Engage in mental puzzles and learning.";
      case 'gaba': return "Incorporate complex carbohydrates and fermented foods. Practice deep breathing, meditation, and yoga.";
      case 'serotonin': return "Focus on Tryptophan-rich foods alongside healthy carbs. Ensure morning sunlight exposure and regular sleep cycles.";
      default: return "Maintain a balanced diet and regular exercise.";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Your Neuro-Profile
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Based on the Braverman Nature Assessment
            </p>
          </div>
          <button
            onClick={resetAssessment}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Nature Chart */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Dominant Nature: <span className="text-blue-600 capitalize">{result.dominantNature}</span></h3>
            <p className="text-sm text-gray-500 text-center mb-4">Your core biochemical strengths</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={natureData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Radar name="Nature" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deficiency Chart */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Primary Deficiency: <span className="text-orange-500 capitalize">{result.primaryDeficiency || 'None'}</span></h3>
            <p className="text-sm text-gray-500 text-center mb-4">Areas needing nutritional support</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deficiencyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {deficiencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getDeficiencyColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Neuro-Nutritional Action Plan
        </h3>
        
        <div className="space-y-4">
          {deficiencyData.sort((a, b) => b.score - a.score).map((def) => {
            if (def.level === 'None') return null;
            return (
              <div key={def.name} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                <div className="shrink-0 pt-1">
                  {getTraitIcon(def.name.toLowerCase())}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{def.name} Support Needed</h4>
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: getDeficiencyColor(def.score) + '20', color: getDeficiencyColor(def.score) }}>
                      {def.level} Deficiency
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {getRecommendations(def.name.toLowerCase())}
                  </p>
                  <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                    <span>Apply to Meal Plan</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
