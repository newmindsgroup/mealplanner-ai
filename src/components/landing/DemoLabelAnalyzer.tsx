import React, { useState } from 'react';
import { Camera, Scan, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';

export default function DemoLabelAnalyzer() {
  const { labelAnalysis, people, scanningLabel, triggerLabelScan } = useDemo();
  const [showResults, setShowResults] = useState(false);

  const handleScan = () => {
    triggerLabelScan();
    setTimeout(() => setShowResults(true), 2500);
  };

  const getSafetyIcon = (rating: string) => {
    switch (rating) {
      case 'safe': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'caution': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'avoid': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSafetyColor = (rating: string) => {
    switch (rating) {
      case 'safe': return 'border-emerald-200 bg-emerald-50';
      case 'caution': return 'border-amber-200 bg-amber-50';
      case 'avoid': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <Camera className="w-4 h-4" />
            Label Scanner
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="gradient-text-purple">Instant Label Analysis</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Snap a photo of any food label and get instant blood type compatibility checks
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Scanner Section */}
          <div className="fade-in-section">
            <div className="glass-card-light rounded-2xl p-8 h-full">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Scan Product Label</h3>
              
              {/* Mock Product Label */}
              <div className="relative bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 overflow-hidden">
                {scanningLabel && (
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent scan-line pointer-events-none"></div>
                )}
                
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-gray-900 mb-2">Whole Grain Crackers</div>
                  <div className="text-sm text-gray-600">Organic & Natural</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <div className="font-bold text-gray-900 mb-2">INGREDIENTS:</div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    Whole Wheat Flour, Canola Oil, Sea Salt, Yeast, Malted Barley Flour, Natural Flavor
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>CONTAINS:</strong> WHEAT
                  </div>
                </div>
              </div>

              {/* Scan Button */}
              <button
                onClick={handleScan}
                disabled={scanningLabel}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-white transition-all ${
                  scanningLabel
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg'
                }`}
              >
                {scanningLabel ? (
                  <>
                    <Scan className="w-5 h-5 animate-pulse" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>{showResults ? 'Scan Again' : 'Scan Label'}</span>
                  </>
                )}
              </button>

              {scanningLabel && (
                <div className="mt-4 text-center text-sm text-gray-600 animate-pulse">
                  Analyzing ingredients and checking blood type compatibility...
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="fade-in-section">
            <div className="glass-card-light rounded-2xl p-8 h-full">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Analysis Results</h3>
              
              {!showResults ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Scan className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center">Scan a label to see blood type compatibility analysis</p>
                </div>
              ) : (
                <div className="space-y-4 scale-in">
                  {/* Overall Safety */}
                  <div className={`border-2 rounded-xl p-4 ${getSafetyColor(labelAnalysis.overallSafety)}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                      <div>
                        <div className="font-bold text-gray-900">Overall Assessment</div>
                        <div className="text-sm text-gray-600 capitalize">{labelAnalysis.overallSafety}</div>
                      </div>
                    </div>
                  </div>

                  {/* Family Member Analysis */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Family Compatibility:</h4>
                    {labelAnalysis.personSpecificAnalysis?.map((analysis) => {
                      const person = people.find(p => p.id === analysis.personId);
                      if (!person) return null;

                      return (
                        <div
                          key={analysis.personId}
                          className={`border-2 rounded-xl p-4 ${getSafetyColor(analysis.overallRating)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {person.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-sm">{analysis.personName}</div>
                                <div className="text-xs text-gray-600">Type {person.bloodType}</div>
                              </div>
                            </div>
                            {getSafetyIcon(analysis.overallRating)}
                          </div>
                          
                          {analysis.conflicts && analysis.conflicts.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="text-xs font-semibold text-gray-700 mb-1">Conflicts:</div>
                              <div className="flex flex-wrap gap-1">
                                {analysis.conflicts.map((conflict, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full"
                                  >
                                    {conflict}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommendations */}
                  {labelAnalysis.recommendations && labelAnalysis.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-blue-900 mb-2 text-sm">Recommendations</div>
                          <ul className="space-y-1">
                            {labelAnalysis.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-blue-800">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detected Ingredients */}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Detected Ingredients:</h4>
                    <div className="flex flex-wrap gap-2">
                      {labelAnalysis.ingredients?.map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                        >
                          {ingredient.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

