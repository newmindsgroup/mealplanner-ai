/**
 * SwarmAgentPanel — P2 Component
 * Shows which AI agent is currently processing a swarm task,
 * with progress steps and a visual agent identity.
 */
import React from 'react';
import {
  FlaskConical, Brain, Dumbbell, ChefHat, FileText,
  Loader2, CheckCircle2, Circle, Sparkles, Bot
} from 'lucide-react';

export interface SwarmStep {
  agent: string;
  status: 'pending' | 'running' | 'done' | 'error';
  label: string;
}

interface SwarmAgentPanelProps {
  taskType: string;
  steps: SwarmStep[];
  currentAgent?: string;
  isComplete?: boolean;
}

const AGENT_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  'Dr. Analysis': { icon: FlaskConical, color: 'from-emerald-400 to-teal-500', label: 'Lab Analysis' },
  'NeuroGuide': { icon: Brain, color: 'from-violet-400 to-purple-500', label: 'Neuro Intelligence' },
  'FitCoach': { icon: Dumbbell, color: 'from-orange-400 to-amber-500', label: 'Fitness Coaching' },
  'NutriChef': { icon: ChefHat, color: 'from-rose-400 to-pink-500', label: 'Nutrition Planning' },
  'ReportGen': { icon: FileText, color: 'from-sky-400 to-blue-500', label: 'Report Generation' },
};

export default function SwarmAgentPanel({ taskType, steps, currentAgent, isComplete }: SwarmAgentPanelProps) {
  const meta = currentAgent ? AGENT_META[currentAgent] : null;
  const AgentIcon = meta?.icon || Bot;

  const doneCount = steps.filter(s => s.status === 'done').length;
  const progress = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/80 dark:to-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with agent identity */}
      <div className="px-3.5 py-3 flex items-center gap-3">
        <div className={`w-9 h-9 bg-gradient-to-br ${meta?.color || 'from-gray-400 to-gray-500'} rounded-xl flex items-center justify-center flex-shrink-0 ${!isComplete ? 'animate-pulse' : ''}`}>
          <AgentIcon className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {currentAgent || 'NourishAI Swarm'}
            </span>
            {!isComplete && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-primary-500 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Working
              </span>
            )}
            {isComplete && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <CheckCircle2 className="w-3 h-3" /> Complete
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 truncate">{meta?.label || taskType}</p>
        </div>
        <span className="text-xs font-bold text-gray-400">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full transition-all duration-700 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-400 to-primary-600'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="px-3.5 py-2.5 space-y-1.5">
          {steps.map((step, i) => {
            const StepIcon =
              step.status === 'done' ? CheckCircle2 :
              step.status === 'running' ? Loader2 :
              Circle;
            const stepColor =
              step.status === 'done' ? 'text-emerald-500' :
              step.status === 'running' ? 'text-primary-500' :
              step.status === 'error' ? 'text-red-500' :
              'text-gray-300 dark:text-gray-600';

            return (
              <div key={i} className="flex items-center gap-2">
                <StepIcon className={`w-3.5 h-3.5 flex-shrink-0 ${stepColor} ${step.status === 'running' ? 'animate-spin' : ''}`} />
                <span className={`text-[11px] font-medium ${step.status === 'done' ? 'text-gray-500 line-through' : step.status === 'running' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {step.agent !== currentAgent && step.status !== 'pending' && (
                  <span className="text-[9px] text-gray-400 ml-auto">{step.agent}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
