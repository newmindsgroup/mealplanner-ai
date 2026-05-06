import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, FileText, AlertCircle, CheckCircle, Image as ImageIcon,
  TrendingUp, Info, Brain, Loader2, Zap, Lightbulb, Shield, Heart, Sparkles,
} from 'lucide-react';
import SwarmAnalysisPanel from '../shared/SwarmAnalysisPanel';
import { checkSwarmHealth, type SwarmHealthStatus } from '../../services/swarmService';
import { useStore } from '../../store/useStore';
import { useAssessmentStore } from '../../store/assessmentStore';
import { generateLabNeuroCorrelation, type NeuroLabCorrelation } from '../../services/aiNeuroAnalysis';
import { format } from 'date-fns';
import { exportLabReportToPDF } from '../../services/labExport';
import { getLabEducation } from '../../data/labEducation';
import type { LabResult } from '../../types/labs';
import { LAB_PANELS } from '../../types/labs';

export default function LabReportView() {
  const { labReports, people } = useStore();
  const { assessments } = useAssessmentStore();

  // Find neuro result: match lab report member to a person with a completed assessment
  const findNeuroResult = (memberName: string) => {
    const matchedPerson = people.find((p) => p.name === memberName);
    if (matchedPerson && assessments[matchedPerson.id]?.isCompleted) {
      return assessments[matchedPerson.id].result;
    }
    // Fallback: return the first completed assessment
    const first = Object.values(assessments).find((a) => a.isCompleted);
    return first?.result || null;
  };
  const [showImage, setShowImage] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabResult | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [neuroCorrelation, setNeuroCorrelation] = useState<NeuroLabCorrelation | null>(null);
  const [isLoadingCorrelation, setIsLoadingCorrelation] = useState(false);
  const [swarmHealth, setSwarmHealth] = useState<SwarmHealthStatus | null>(null);
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);

  useEffect(() => {
    // Extract report ID from hash
    const hash = window.location.hash;
    if (hash.startsWith('#/labs/report/')) {
      const id = hash.replace('#/labs/report/', '');
      setReportId(id);
    }
    // Check swarm availability
    checkSwarmHealth().then(setSwarmHealth).catch(() => {});
  }, []);
  
  const report = reportId ? labReports.find(r => r.id === reportId) : null;
  const neuroResult = report ? findNeuroResult(report.memberName) : null;

  if (!report) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-6">The lab report you're looking for doesn't exist.</p>
          <a
            href="#/labs/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Organize results by category
  const resultsByCategory = report.results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, LabResult[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'high':
      case 'low':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'high':
      case 'low':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryName = (category: string) => {
    const panel = LAB_PANELS.find(p => p.category === category);
    return panel?.name || category;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <a
            href="#/labs/history"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </a>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lab Report</h1>
            <p className="text-gray-600 mt-1">
              {report.memberName} • {format(new Date(report.testDate), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {report.imageUrl && (
            <button
              onClick={() => setShowImage(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              View Original
            </button>
          )}
          {swarmHealth?.status === 'healthy' && (
            <button
              onClick={() => setShowDeepAnalysis(!showDeepAnalysis)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg ${
                showDeepAnalysis
                  ? 'bg-purple-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {showDeepAnalysis ? 'Hide Deep Analysis' : 'Deep Analysis'}
            </button>
          )}
          <button
            onClick={() => exportLabReportToPDF(report)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Patient</p>
            <p className="font-semibold text-gray-800">{report.memberName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Test Date</p>
            <p className="font-semibold text-gray-800">
              {format(new Date(report.testDate), 'MMM dd, yyyy')}
            </p>
          </div>
          {report.labName && (
            <div>
              <p className="text-sm text-gray-600">Lab</p>
              <p className="font-semibold text-gray-800">{report.labName}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Total Tests</p>
            <p className="font-semibold text-gray-800">{report.results.length}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {report.results.filter(r => r.status === 'normal').length}
          </div>
          <div className="text-sm text-gray-600">Normal</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {report.results.filter(r => r.status === 'high' || r.status === 'low').length}
          </div>
          <div className="text-sm text-gray-600">Abnormal</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-600">
            {report.results.filter(r => r.status === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
      </div>

      {/* AI Insights */}
      {report.aiInsights && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            AI Insights
          </h2>
          <p className="text-gray-700">{report.aiInsights}</p>
        </div>
      )}

      {/* NourishAI Deep Analysis */}
      {showDeepAnalysis && (
        <div className="mb-6 space-y-4">
          <SwarmAnalysisPanel
            taskType="lab_deep_analysis"
            context={{
              memberName: report.memberName,
              testDate: report.testDate,
              labName: report.labName,
              results: report.results.map(r => ({
                testName: r.testName,
                value: r.value,
                unit: r.unit,
                status: r.status,
                category: r.category,
                referenceRangeLow: r.referenceRangeLow,
                referenceRangeHigh: r.referenceRangeHigh,
              })),
              neuroProfile: neuroResult ? {
                primaryDeficiency: neuroResult.primaryDeficiency,
                scores: neuroResult.scores,
              } : undefined,
            }}
            title="Deep Lab Analysis"
            description="Multi-agent analysis — biomarkers evaluated against optimal functional ranges with PubMed citations."
            buttonLabel="Analyze My Labs"
            accentColor="purple"
            gradientClasses="from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20"
          />

          <SwarmAnalysisPanel
            taskType="lab_report_pdf"
            context={{
              memberName: report.memberName,
              testDate: report.testDate,
              results: report.results.map(r => ({
                testName: r.testName,
                value: r.value,
                unit: r.unit,
                status: r.status,
                category: r.category,
                referenceRangeLow: r.referenceRangeLow,
                referenceRangeHigh: r.referenceRangeHigh,
              })),
            }}
            title="Generate Deep Report PDF"
            description="Professional clinical-grade lab report with charts, trends, and food-based interventions."
            buttonLabel="Generate PDF Report"
            accentColor="blue"
            gradientClasses="from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
          />

          <SwarmAnalysisPanel
            taskType="lab_trend_charts"
            context={{
              memberName: report.memberName,
              currentReport: {
                testDate: report.testDate,
                results: report.results.map(r => ({
                  testName: r.testName,
                  value: r.value,
                  unit: r.unit,
                  status: r.status,
                })),
              },
            }}
            title="Trend Analysis Charts"
            description="Statistical trend analysis with radar charts, heatmaps, and delta tracking."
            buttonLabel="Generate Charts"
            accentColor="green"
            gradientClasses="from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
          />
        </div>
      )}

      {/* Neuro-Correlations Section */}
      {neuroResult && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg p-6 mb-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Neuro-Correlations
            </h2>
            {!neuroCorrelation && !isLoadingCorrelation && (
              <button
                onClick={async () => {
                  setIsLoadingCorrelation(true);
                  try {
                    const labData = report.results.map(r => ({
                      testName: r.testName,
                      value: r.value,
                      unit: r.unit,
                      referenceRangeLow: r.referenceRangeLow,
                      referenceRangeHigh: r.referenceRangeHigh,
                    }));
                    const correlation = await generateLabNeuroCorrelation(labData, neuroResult);
                    setNeuroCorrelation(correlation);
                  } catch (err) {
                    console.error('Correlation error:', err);
                  } finally {
                    setIsLoadingCorrelation(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Brain className="w-4 h-4" />
                Analyze Correlations
              </button>
            )}
          </div>

          {isLoadingCorrelation && (
            <div className="flex items-center gap-3 py-8 justify-center">
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Cross-referencing your blood work with your neurotransmitter profile...</span>
            </div>
          )}

          {neuroCorrelation && (
            <div className="space-y-4">
              {/* Synthesis narrative */}
              <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {neuroCorrelation.synthesis}
              </div>

              {/* Individual correlations */}
              {neuroCorrelation.correlations.length > 0 && (
                <div className="space-y-2 mt-4">
                  {neuroCorrelation.correlations.map((corr, i) => {
                    const getImpactColor = () => {
                      if (corr.impact === 'contributing_to_deficiency') return 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800';
                      if (corr.impact === 'supporting') return 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800';
                      return 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
                    };
                    const getCatIcon = () => {
                      switch (corr.neurotransmitter) {
                        case 'dopamine': return <Zap className="w-4 h-4 text-yellow-500" />;
                        case 'acetylcholine': return <Lightbulb className="w-4 h-4 text-blue-500" />;
                        case 'gaba': return <Shield className="w-4 h-4 text-green-500" />;
                        case 'serotonin': return <Heart className="w-4 h-4 text-red-500" />;
                        default: return <Brain className="w-4 h-4 text-gray-500" />;
                      }
                    };
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${getImpactColor()}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {getCatIcon()}
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">{corr.biomarker}: {corr.value}</span>
                          <span className="text-xs capitalize font-medium text-gray-500">→ {corr.neurotransmitter}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{corr.relationship}</p>
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-400">💡 {corr.actionItem}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recovery Protocol */}
              {neuroCorrelation.recoveryProtocol && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">📋 Recovery Protocol</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{neuroCorrelation.recoveryProtocol}</p>
                </div>
              )}
            </div>
          )}

          {!neuroCorrelation && !isLoadingCorrelation && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your Braverman assessment shows a <span className="font-medium capitalize text-purple-600">{neuroResult.primaryDeficiency || 'balanced'}</span> profile. 
              Click "Analyze Correlations" to discover how your blood work connects to your brain chemistry.
            </p>
          )}
        </div>
      )}

      {/* Results by Category */}
      <div className="space-y-6">
        {Object.entries(resultsByCategory).map(([category, results]) => (
          <div key={category} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {getCategoryName(category)}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Test</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Result</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference Range</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Info</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr 
                      key={result.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        result.status !== 'normal' ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">{result.testName}</span>
                        {result.isPriority && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            Key Marker
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800">
                          {result.value} {result.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {result.referenceRangeText || 
                          (result.referenceRangeLow && result.referenceRangeHigh 
                            ? `${result.referenceRangeLow}-${result.referenceRangeHigh} ${result.unit}`
                            : 'N/A')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className="capitalize text-sm">{result.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTest(result)}
                          className="p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Info className="w-5 h-5 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {showImage && report.imageUrl && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-gray-800">Original Lab Report</h3>
              <button
                onClick={() => setShowImage(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img src={report.imageUrl} alt="Lab report" className="w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Test Details Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">{selectedTest.testName}</h3>
              <button
                onClick={() => setSelectedTest(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const education = getLabEducation(selectedTest.testName);
                if (!education) {
                  return <p className="text-gray-600">No educational content available for this test.</p>;
                }
                
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                      <p className="text-gray-700">{education.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Purpose</h4>
                      <p className="text-gray-700">{education.purpose}</p>
                    </div>
                    
                    {selectedTest.status !== 'normal' && (
                      <div className={`p-4 rounded-lg ${getStatusColor(selectedTest.status)}`}>
                        <h4 className="font-semibold mb-2">
                          What {selectedTest.status === 'high' ? 'High' : 'Low'} Levels Mean
                        </h4>
                        <p className="text-sm mb-2">
                          {selectedTest.status === 'high' || selectedTest.status === 'critical'
                            ? education.highMeans.description
                            : education.lowMeans.description}
                        </p>
                        <div className="text-sm">
                          <strong>Common Causes:</strong>
                          <ul className="list-disc ml-5 mt-1">
                            {(selectedTest.status === 'high' || selectedTest.status === 'critical'
                              ? education.highMeans.causes
                              : education.lowMeans.causes
                            ).slice(0, 3).map((cause, i) => (
                              <li key={i}>{cause}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Lifestyle Factors</h4>
                      <ul className="list-disc ml-5 text-gray-700">
                        {education.lifestyleFactors.map((factor, i) => (
                          <li key={i}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

