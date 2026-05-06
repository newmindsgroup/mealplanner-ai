/**
 * CrossDomainHealthReport — Phase 10
 * Comprehensive health intelligence that ties together all data domains:
 *  • Lab biomarkers
 *  • Neurotransmitter profiles
 *  • Fitness progress
 *  • Nutrition/meal plan data
 * Routes to NourishAI swarm for deep cross-domain analysis.
 */
import { useState, useEffect } from 'react';
import {
  Activity, Brain, Dumbbell, Apple, FileText, Sparkles, Download,
  ChevronDown, ChevronUp, Loader2, Heart, Zap, Shield, TrendingUp,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAssessmentStore } from '../../store/assessmentStore';
import SwarmAnalysisPanel from '../shared/SwarmAnalysisPanel';
import { FeatureGuard } from '../shared/UpgradeGate';
import { checkSwarmHealth, type SwarmHealthStatus } from '../../services/swarmService';
import { generateHealthReportPDF } from '../../services/healthReportPDF';

interface CrossDomainSummary {
  hasLabs: boolean;
  hasNeuro: boolean;
  hasFitness: boolean;
  hasMeals: boolean;
  labBiomarkers: Record<string, unknown>[] | null;
  neuroProfile: Record<string, unknown> | null;
  fitnessGoal: string | null;
  mealPlanSummary: Record<string, unknown> | null;
}

export default function CrossDomainHealthReport() {
  const { people, currentPlan, getLatestLabReport } = useStore();
  const { result: neuroResult, aiProtocol, activePersonId, getAdjustedResult } = useAssessmentStore();

  const [swarmHealth, setSwarmHealth] = useState<SwarmHealthStatus | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string>(people[0]?.id || '');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    reports: true,
  });
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    checkSwarmHealth().then(setSwarmHealth).catch(() => {});
  }, []);

  const selectedPerson = people.find(p => p.id === selectedPersonId) || people[0];
  const displayResult = getAdjustedResult() || neuroResult;

  // Build cross-domain summary
  const summary: CrossDomainSummary = {
    hasLabs: !!getLatestLabReport(selectedPersonId),
    hasNeuro: !!displayResult,
    hasFitness: !!selectedPerson,
    hasMeals: !!currentPlan,
    labBiomarkers: (() => {
      const report = getLatestLabReport(selectedPersonId);
      if (!report) return null;
      return report.results?.map((r: any) => ({
        name: r.testName,
        value: r.value,
        unit: r.unit,
        status: r.status,
        referenceRange: r.referenceRange,
      })) || null;
    })(),
    neuroProfile: displayResult ? {
      dominantNature: displayResult.dominantNature,
      primaryDeficiency: displayResult.primaryDeficiency,
      natureScores: displayResult.natureScores,
      deficiencyScores: displayResult.deficiencyScores,
    } : null,
    fitnessGoal: selectedPerson?.goals?.[0] || null,
    mealPlanSummary: currentPlan ? {
      weekStart: currentPlan.weekStart,
      totalDays: currentPlan.days.length,
      sampleMeals: currentPlan.days.slice(0, 2).map(d => ({
        breakfast: d.breakfast.name,
        lunch: d.lunch.name,
        dinner: d.dinner.name,
      })),
    } : null,
  };

  const dataModules = [
    {
      key: 'labs',
      label: 'Lab Biomarkers',
      icon: Activity,
      available: summary.hasLabs,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      description: summary.hasLabs
        ? `${summary.labBiomarkers?.length || 0} biomarkers tracked`
        : 'No lab reports — scan one to unlock',
    },
    {
      key: 'neuro',
      label: 'Neuro Profile',
      icon: Brain,
      available: summary.hasNeuro,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      description: summary.hasNeuro
        ? `${displayResult?.dominantNature} dominant · ${displayResult?.primaryDeficiency || 'No'} deficiency`
        : 'Take the Braverman assessment to unlock',
    },
    {
      key: 'fitness',
      label: 'Fitness Data',
      icon: Dumbbell,
      available: summary.hasFitness,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      description: summary.hasFitness
        ? `Goal: ${summary.fitnessGoal || 'General health'}`
        : 'Set up a fitness profile to unlock',
    },
    {
      key: 'meals',
      label: 'Meal Plan',
      icon: Apple,
      available: summary.hasMeals,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      description: summary.hasMeals
        ? `${summary.mealPlanSummary?.totalDays}-day plan active`
        : 'Generate a meal plan to unlock',
    },
  ];

  const availableCount = dataModules.filter(m => m.available).length;
  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const swarmAvailable = swarmHealth?.status === 'healthy';

  return (
    <FeatureGuard feature="health_reports">
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">
                {selectedPerson?.name ? `${selectedPerson.name.split(' ')[0]}'s` : 'Your'} Health Intelligence
              </h1>
              <p className="text-white/70 text-sm">
                Cross-domain analysis powered by NourishAI
              </p>
            </div>
            <button
              onClick={async () => {
                setPdfGenerating(true);
                setPdfError(null);
                try {
                  await generateHealthReportPDF({ personId: selectedPersonId });
                } catch (err: any) {
                  setPdfError(err.message || 'Failed to generate PDF');
                }
                setPdfGenerating(false);
              }}
              disabled={pdfGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              {pdfGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Download className="w-4 h-4" /> Download PDF</>
              )}
            </button>
          </div>

          {/* Person selector */}
          {people.length > 1 && (
            <div className="flex gap-2 mt-4">
              {people.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersonId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedPersonId === p.id
                      ? 'bg-white text-purple-700 shadow-md'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* PDF Error */}
      {pdfError && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-3 border border-red-200 dark:border-red-800 flex items-center gap-2">
          <span className="text-red-500 text-sm font-medium">{pdfError}</span>
          <button onClick={() => setPdfError(null)} className="ml-auto text-red-400 hover:text-red-600 text-xs font-bold">Dismiss</button>
        </div>
      )}

      {/* Data Availability Cards */}
      <div>
        <button
          onClick={() => toggleSection('overview')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Data Sources ({availableCount}/{dataModules.length} connected)
          </h2>
          {expandedSections.overview
            ? <ChevronUp className="w-5 h-5 text-gray-400" />
            : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dataModules.map(({ key, label, icon: Icon, available, color, bgColor, description }) => (
              <div
                key={key}
                className={`rounded-xl p-4 border-2 transition-all ${
                  available
                    ? `${bgColor} border-current/20 ${color}`
                    : 'bg-gray-50 dark:bg-gray-800 border-dashed border-gray-200 dark:border-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${available ? color : 'text-gray-300 dark:text-gray-600'}`} />
                <p className={`font-bold text-sm ${available ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {label}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{description}</p>
                {available && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Connected
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NourishAI Intelligence Reports */}
      {swarmAvailable && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('reports')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  NourishAI Intelligence Reports
                </h3>
                <p className="text-xs text-gray-500">
                  Multi-agent analysis across all your health data
                </p>
              </div>
            </div>
            {expandedSections.reports
              ? <ChevronUp className="w-5 h-5 text-gray-400" />
              : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.reports && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              {/* Comprehensive Health Report */}
              <SwarmAnalysisPanel
                taskType="health_report_comprehensive"
                context={{
                  personName: selectedPerson?.name,
                  bloodType: selectedPerson?.bloodType,
                  age: selectedPerson?.age,
                  ...summary,
                }}
                title="Comprehensive Health Report"
                description={`Correlates ${availableCount} data sources into a unified health intelligence brief with recommendations.`}
                buttonLabel="Generate Health Report"
                accentColor="indigo"
                gradientClasses="from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20"
              />

              {/* Doctor Visit Prep */}
              <SwarmAnalysisPanel
                taskType="health_report_comprehensive"
                context={{
                  reportType: 'doctor_visit_prep',
                  personName: selectedPerson?.name,
                  bloodType: selectedPerson?.bloodType,
                  ...summary,
                }}
                title="Doctor Visit Preparation Package"
                description="Organized summary of all biomarkers, trends, supplements, and questions to discuss with your physician."
                buttonLabel="Prepare Visit Package"
                accentColor="rose"
                gradientClasses="from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20"
              />

              {/* Cross-Domain Correlation */}
              {availableCount >= 2 && (
                <SwarmAnalysisPanel
                  taskType="health_report_comprehensive"
                  context={{
                    reportType: 'statistical_correlation',
                    personName: selectedPerson?.name,
                    ...summary,
                  }}
                  title="Cross-Domain Statistical Correlation"
                  description="Discover hidden patterns between your neurotransmitter profile, lab biomarkers, fitness data, and nutrition."
                  buttonLabel="Run Correlation Engine"
                  accentColor="amber"
                  gradientClasses="from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20"
                />
              )}

              {/* Family Health Comparison (only if >1 person) */}
              {people.length > 1 && (
                <SwarmAnalysisPanel
                  taskType="health_report_comprehensive"
                  context={{
                    reportType: 'family_comparison',
                    familyMembers: people.map(p => ({
                      name: p.name,
                      bloodType: p.bloodType,
                      age: p.age,
                      hasLabs: !!getLatestLabReport(p.id),
                    })),
                  }}
                  title="Family Health Comparison"
                  description="Side-by-side analysis of all family members' health data with shared risk factors and recommendations."
                  buttonLabel="Compare Family Health"
                  accentColor="cyan"
                  gradientClasses="from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* No swarm available — explain what's needed */}
      {!swarmAvailable && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-dashed border-gray-200 dark:border-gray-700 text-center">
          <Shield className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">NourishAI Not Connected</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Deploy the NourishAI swarm sidecar to unlock comprehensive health intelligence reports, doctor visit packages, and cross-domain correlations.
          </p>
        </div>
      )}
    </div>
    </FeatureGuard>
  );
}
