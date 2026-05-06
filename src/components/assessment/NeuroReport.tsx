import { useEffect, useState } from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useStore } from '../../store/useStore';
import { generateNeuroProtocol } from '../../services/aiNeuroAnalysis';
import DailyNeuroCheckIn from './DailyNeuroCheckIn';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import {
  Brain, RefreshCw, Activity, Zap, Lightbulb, Shield, Heart,
  Loader2, Pill, Utensils, Dumbbell, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Sparkles, Clock, ArrowRight,
} from 'lucide-react';
import SwarmAnalysisPanel from '../shared/SwarmAnalysisPanel';
import { checkSwarmHealth, type SwarmHealthStatus } from '../../services/swarmService';

export default function NeuroReport() {
  const {
    result, resetAssessment, aiProtocol, setAiProtocol,
    isGeneratingProtocol, setIsGeneratingProtocol,
    disclaimerAccepted, setDisclaimerAccepted,
    driftModifiers, getAdjustedResult, activePersonId,
  } = useAssessmentStore();
  const { people } = useStore();
  const activePerson = activePersonId ? people.find((p) => p.id === activePersonId) : people[0];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dietary: true,
    supplements: false,
    lifestyle: false,
  });
  const [swarmHealth, setSwarmHealth] = useState<SwarmHealthStatus | null>(null);
  const [showSwarmAnalysis, setShowSwarmAnalysis] = useState(false);

  useEffect(() => {
    checkSwarmHealth().then(setSwarmHealth).catch(() => {});
  }, []);

  const displayResult = getAdjustedResult() || result;

  // Auto-generate protocol when report loads and result exists
  useEffect(() => {
    if (result && !aiProtocol && !isGeneratingProtocol) {
      generateProtocol();
    }
  }, [result]);

  const generateProtocol = async () => {
    if (!result) return;
    setIsGeneratingProtocol(true);

    const person = activePerson;
    const userContext = person
      ? {
          bloodType: person.bloodType,
          age: person.age,
          allergies: person.allergies,
          goals: person.goals,
          dietaryCodes: person.dietaryCodes,
        }
      : undefined;

    try {
      const protocol = await generateNeuroProtocol(result, userContext);
      setAiProtocol(protocol);
    } catch (err) {
      console.error('Protocol generation failed:', err);
      setIsGeneratingProtocol(false);
    }
  };

  if (!displayResult) return null;

  const natureData = [
    { subject: 'Dopamine', A: displayResult.natureScores.dopamine, fullMark: 15 },
    { subject: 'Acetylcholine', A: displayResult.natureScores.acetylcholine, fullMark: 15 },
    { subject: 'Serotonin', A: displayResult.natureScores.serotonin, fullMark: 15 },
    { subject: 'GABA', A: displayResult.natureScores.gaba, fullMark: 15 },
  ];

  const deficiencyData = [
    { name: 'Dopamine', score: displayResult.deficiencyScores.dopamine, level: displayResult.deficiencyLevels.dopamine },
    { name: 'Acetylcholine', score: displayResult.deficiencyScores.acetylcholine, level: displayResult.deficiencyLevels.acetylcholine },
    { name: 'GABA', score: displayResult.deficiencyScores.gaba, level: displayResult.deficiencyLevels.gaba },
    { name: 'Serotonin', score: displayResult.deficiencyScores.serotonin, level: displayResult.deficiencyLevels.serotonin },
  ];

  const getDeficiencyColor = (score: number) => {
    if (score >= 16) return '#ef4444';
    if (score >= 9) return '#f97316';
    if (score >= 6) return '#eab308';
    if (score >= 1) return '#3b82f6';
    return '#10b981';
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

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasDrift = Object.values(driftModifiers).some((v) => v !== 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {activePerson ? `${activePerson.name}'s Neuro-Profile` : 'Your Neuro-Profile'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Based on the Braverman Nature Assessment
              {hasDrift && <span className="text-amber-500 ml-2">(Adjusted with daily data)</span>}
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
          {/* Nature Radar */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Dominant Nature: <span className="text-blue-600 capitalize">{displayResult.dominantNature}</span>
            </h3>
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

          {/* Deficiency Bar */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Primary Deficiency: <span className="text-orange-500 capitalize">{displayResult.primaryDeficiency || 'None'}</span>
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">Areas needing nutritional support</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deficiencyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
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

      {/* AI-Generated Protocol */}
      {isGeneratingProtocol && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-gray-700 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Generating Your Personalized Protocol...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Our AI is analyzing your neurotransmitter profile and building a customized recovery plan
          </p>
        </div>
      )}

      {aiProtocol && (
        <>
          {/* Narrative */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl shadow-sm p-6 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Analysis</h3>
            </div>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed">
              {aiProtocol.narrative}
            </div>
          </div>

          {/* Dietary Protocol */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('dietary')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dietary Protocol</h3>
              </div>
              {expandedSections.dietary ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expandedSections.dietary && (
              <div className="px-6 pb-6 space-y-4">
                {aiProtocol.dietaryProtocol.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.category}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        item.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        item.priority === 'moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400 mb-1">✅ Eat More</p>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                          {item.foods.map((f, j) => <li key={j}>• {f}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-red-500 dark:text-red-400 mb-1">❌ Avoid</p>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                          {item.avoidFoods.map((f, j) => <li key={j}>• {f}</li>)}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{item.mealTimingAdvice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supplement Stack — Behind Disclaimer */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('supplements')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Supplement & Nootropic Stack</h3>
              </div>
              {expandedSections.supplements ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expandedSections.supplements && (
              <div className="px-6 pb-6">
                {!disclaimerAccepted ? (
                  <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Medical Disclaimer — Please Read</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                          The following supplement recommendations are generated by an AI system for <strong>educational purposes only</strong>. 
                          They are NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified 
                          healthcare provider before starting any new supplement regimen, especially if you are pregnant, nursing, taking medications, 
                          or have any pre-existing medical condition. Some supplements may interact with medications or have contraindications for 
                          certain health conditions.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDisclaimerAccepted(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      I Understand — Show Supplement Recommendations
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiProtocol.supplementStack.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No specific supplements recommended — your protocol focuses on dietary improvements.</p>
                    ) : (
                      aiProtocol.supplementStack.map((supp, i) => (
                        <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{supp.name}</h4>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              supp.priority === 'essential' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              supp.priority === 'recommended' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {supp.priority}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                            <div><span className="text-gray-500">Dosage:</span> <span className="font-medium text-gray-900 dark:text-white">{supp.dosage}</span></div>
                            <div><span className="text-gray-500">Timing:</span> <span className="font-medium text-gray-900 dark:text-white">{supp.timing}</span></div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{supp.rationale}</p>
                          {supp.warnings && (
                            <div className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span>{supp.warnings}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lifestyle Protocol */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('lifestyle')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lifestyle Protocol</h3>
              </div>
              {expandedSections.lifestyle ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expandedSections.lifestyle && (
              <div className="px-6 pb-6 space-y-4">
                {aiProtocol.lifestyleProtocol.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.category}</h4>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      {item.recommendations.map((rec, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <ArrowRight className="w-3.5 h-3.5 mt-1 text-emerald-500 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Focus */}
          {aiProtocol.weeklyFocusAreas.length > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                This Week's Focus Areas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiProtocol.weeklyFocusAreas.map((area, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <span className="text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Fallback static insights when no AI available */}
      {!aiProtocol && !isGeneratingProtocol && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Neuro-Nutritional Action Plan
          </h3>
          <div className="space-y-4">
            {deficiencyData
              .sort((a, b) => b.score - a.score)
              .map((def) => {
                if (def.level === 'None') return null;
                return (
                  <div key={def.name} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div className="shrink-0 pt-1">{getTraitIcon(def.name.toLowerCase())}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{def.name} Support Needed</h4>
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: getDeficiencyColor(def.score) + '20', color: getDeficiencyColor(def.score) }}>
                          {def.level} Deficiency
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Add an API key in Settings to unlock your personalized AI protocol with dietary, supplement, and lifestyle recommendations.
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
          <button
            onClick={generateProtocol}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI Protocol
          </button>
        </div>
      )}

      {/* NourishAI Deep Neuro Intelligence */}
      {swarmHealth?.status === 'healthy' && displayResult && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setShowSwarmAnalysis(!showSwarmAnalysis)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">NourishAI Deep Intelligence</h3>
                <p className="text-xs text-gray-500">PubMed research, drug interactions, clinical protocols</p>
              </div>
            </div>
            {showSwarmAnalysis ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {showSwarmAnalysis && (
            <div className="px-6 pb-6 space-y-4">
              <SwarmAnalysisPanel
                taskType="neuro_research_protocol"
                context={{
                  memberName: activePerson?.name,
                  dominantNature: displayResult.dominantNature,
                  primaryDeficiency: displayResult.primaryDeficiency,
                  natureScores: displayResult.natureScores,
                  deficiencyScores: displayResult.deficiencyScores,
                  deficiencyLevels: displayResult.deficiencyLevels,
                  bloodType: activePerson?.bloodType,
                  age: activePerson?.age,
                  allergies: activePerson?.allergies,
                }}
                title="Research-Backed Neuro Protocol"
                description="PubMed studies for each deficiency, supplement validation, drug interaction checks."
                buttonLabel="Research My Profile"
                accentColor="purple"
                gradientClasses="from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20"
              />

              <SwarmAnalysisPanel
                taskType="neuro_lab_correlation"
                context={{
                  memberName: activePerson?.name,
                  dominantNature: displayResult.dominantNature,
                  primaryDeficiency: displayResult.primaryDeficiency,
                  deficiencyScores: displayResult.deficiencyScores,
                }}
                title="Neuro-Lab Statistical Correlation"
                description="Statistical analysis correlating your neurotransmitter profile with blood biomarkers."
                buttonLabel="Run Correlation Analysis"
                accentColor="blue"
                gradientClasses="from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
              />

              <SwarmAnalysisPanel
                taskType="neuro_protocol_pdf"
                context={{
                  memberName: activePerson?.name,
                  dominantNature: displayResult.dominantNature,
                  primaryDeficiency: displayResult.primaryDeficiency,
                  natureScores: displayResult.natureScores,
                  deficiencyScores: displayResult.deficiencyScores,
                  deficiencyLevels: displayResult.deficiencyLevels,
                  bloodType: activePerson?.bloodType,
                }}
                title="Export Protocol PDF"
                description="Professional recovery protocol document with dosing, timing, dietary plan, and references."
                buttonLabel="Generate PDF Protocol"
                accentColor="rose"
                gradientClasses="from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20"
              />

              <SwarmAnalysisPanel
                taskType="health_presentation"
                context={{
                  memberName: activePerson?.name,
                  dominantNature: displayResult.dominantNature,
                  primaryDeficiency: displayResult.primaryDeficiency,
                  natureScores: displayResult.natureScores,
                  deficiencyScores: displayResult.deficiencyScores,
                  bloodType: activePerson?.bloodType,
                  protocol: aiProtocol ? {
                    dietary: aiProtocol.dietaryProtocol?.length,
                    supplements: aiProtocol.supplementStack?.length,
                    lifestyle: aiProtocol.lifestyleProtocol?.length,
                  } : undefined,
                }}
                title="Health Protocol Slide Deck"
                description="Visual presentation of your neuro-nutritional protocol — share with your doctor or healthcare team."
                buttonLabel="Create Slide Deck"
                accentColor="indigo"
                gradientClasses="from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20"
              />
            </div>
          )}
        </div>
      )}

      {/* Daily Check-In Widget */}
      <DailyNeuroCheckIn />
    </div>
  );
}
