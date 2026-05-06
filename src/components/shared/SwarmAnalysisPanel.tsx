// SwarmAnalysisPanel — Reusable component for displaying NourishAI agent responses
// Used across labs, neuro, fitness, and meal planning sections

import { useState } from 'react';
import {
  Brain, Loader2, Sparkles, Download, RefreshCw, ChevronDown, ChevronUp,
  FileText, BarChart3, AlertTriangle, CheckCircle2, ExternalLink,
} from 'lucide-react';
import {
  startSwarmTask, sendSwarmMessage, saveSwarmFile,
  type SwarmTaskType, type SwarmThreadResponse, type SwarmFile,
} from '../../services/swarmService';

interface SwarmAnalysisPanelProps {
  /** Which swarm task to execute */
  taskType: SwarmTaskType;
  /** Context data to send with the request (lab results, neuro scores, etc.) */
  context: Record<string, unknown>;
  /** Custom prompt to append to the default task prompt */
  customPrompt?: string;
  /** Panel title */
  title?: string;
  /** Panel description shown before analysis starts */
  description?: string;
  /** Button label */
  buttonLabel?: string;
  /** Icon color class */
  accentColor?: string;
  /** Gradient classes for the panel background */
  gradientClasses?: string;
  /** Auto-start analysis on mount? */
  autoStart?: boolean;
}

export default function SwarmAnalysisPanel({
  taskType,
  context,
  customPrompt,
  title = 'AI Deep Analysis',
  description = 'Powered by NourishAI — our 8-agent health intelligence system.',
  buttonLabel = 'Run Deep Analysis',
  accentColor = 'purple',
  gradientClasses = 'from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20',
  autoStart = false,
}: SwarmAnalysisPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<SwarmThreadResponse | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  const colorMap: Record<string, { bg: string; text: string; border: string; button: string; hover: string }> = {
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', button: 'bg-purple-600', hover: 'hover:bg-purple-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', button: 'bg-blue-600', hover: 'hover:bg-blue-700' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', button: 'bg-green-600', hover: 'hover:bg-green-700' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', button: 'bg-amber-600', hover: 'hover:bg-amber-700' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', button: 'bg-rose-600', hover: 'hover:bg-rose-700' },
  };
  const colors = colorMap[accentColor] || colorMap.purple;

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await startSwarmTask(taskType, context, customPrompt);
      setResponse(result);
      setThreadId(result.threadId);
    } catch (err: any) {
      console.error('[SwarmPanel] Analysis error:', err);
      setError(err?.message || 'Failed to connect to NourishAI intelligence system.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendFollowUp = async () => {
    if (!threadId || !followUpMessage.trim()) return;
    setIsSendingFollowUp(true);

    try {
      const result = await sendSwarmMessage(threadId, followUpMessage, context);
      setResponse(result);
      setFollowUpMessage('');
    } catch (err: any) {
      console.error('[SwarmPanel] Follow-up error:', err);
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const handleFileDownload = async (file: SwarmFile) => {
    try {
      await saveSwarmFile(file.name);
    } catch (err) {
      console.error('[SwarmPanel] Download error:', err);
    }
  };

  // Auto-start if requested
  if (autoStart && !isLoading && !response && !error) {
    runAnalysis();
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'image': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'pptx': return <FileText className="w-4 h-4 text-orange-500" />;
      default: return <Download className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div
      className={`bg-gradient-to-br ${gradientClasses} rounded-xl p-6 border ${colors.border} transition-all duration-300`}
      id={`swarm-panel-${taskType}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Sparkles className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {description}
            </p>
          </div>
        </div>

        {response && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            {isExpanded
              ? <ChevronUp className="w-5 h-5 text-gray-600" />
              : <ChevronDown className="w-5 h-5 text-gray-600" />
            }
          </button>
        )}
      </div>

      {/* Pre-analysis state */}
      {!isLoading && !response && !error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
            Activate the multi-agent intelligence system to get research-backed, cross-referenced analysis with citations.
          </p>
          <button
            onClick={runAnalysis}
            className={`flex items-center gap-2 px-5 py-2.5 ${colors.button} ${colors.hover} text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg`}
          >
            <Sparkles className="w-4 h-4" />
            {buttonLabel}
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full border-4 border-t-transparent ${colors.border} animate-spin`} />
            <Brain className={`w-6 h-6 ${colors.text} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-800 dark:text-white">NourishAI agents working...</p>
            <p className="text-xs text-gray-500 mt-1">
              {taskType.includes('research') && 'Searching PubMed, USDA, and clinical databases...'}
              {taskType.includes('lab') && 'Analyzing biomarkers against optimal functional ranges...'}
              {taskType.includes('neuro') && 'Cross-referencing neurotransmitter profiles with lab data...'}
              {taskType.includes('fitness') && 'Running statistical analysis on workout data...'}
              {taskType.includes('meal') && 'Validating nutrition against USDA and blood type compatibility...'}
              {!taskType.includes('research') && !taskType.includes('lab') && !taskType.includes('neuro') && !taskType.includes('fitness') && !taskType.includes('meal') && 'Coordinating specialist agents for your request...'}
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">Analysis failed</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
            <button
              onClick={runAnalysis}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Response */}
      {response && isExpanded && (
        <div className="space-y-4 animate-fadeIn">
          {/* Agent attribution */}
          {response.agentName && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>Completed by <span className="font-medium text-gray-700">{response.agentName}</span></span>
            </div>
          )}

          {/* Main response */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
              {response.message}
            </div>
          </div>

          {/* Generated files */}
          {response.files && response.files.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Generated Files
              </h4>
              <div className="space-y-2">
                {response.files.map((file, i) => (
                  <button
                    key={i}
                    onClick={() => handleFileDownload(file)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    {getFileIcon(file.type)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">{file.name}</span>
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={followUpMessage}
              onChange={(e) => setFollowUpMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isSendingFollowUp && sendFollowUp()}
              placeholder="Ask a follow-up question..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700"
              disabled={isSendingFollowUp}
            />
            <button
              onClick={sendFollowUp}
              disabled={isSendingFollowUp || !followUpMessage.trim()}
              className={`px-4 py-2.5 ${colors.button} ${colors.hover} text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSendingFollowUp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={runAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
