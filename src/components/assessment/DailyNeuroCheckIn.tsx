import { useState } from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { analyzeDailySentiment } from '../../services/aiNeuroAnalysis';
import {
  Brain, Send, Loader2, Smile, Frown, Meh, AlertTriangle,
  CheckCircle, TrendingDown, TrendingUp, Utensils, Zap,
  Lightbulb, Shield, Heart, ChevronDown, ChevronUp,
} from 'lucide-react';

export default function DailyNeuroCheckIn() {
  const {
    result,
    dailyLogs,
    addDailyLog,
    applyDriftAdjustment,
    getAdjustedResult,
  } = useAssessmentStore();

  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [quickMood, setQuickMood] = useState<string | null>(null);

  if (!result) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find((l) => l.date === todayStr);

  const handleSubmit = async () => {
    if (!input.trim() && !quickMood) return;

    const fullText = quickMood
      ? `${quickMood}: ${input.trim()}`
      : input.trim();

    setIsAnalyzing(true);
    setLastResult(null);

    try {
      const currentResult = getAdjustedResult() || result;
      const adjustment = await analyzeDailySentiment(fullText, currentResult);

      const log = {
        id: crypto.randomUUID(),
        date: todayStr,
        text: fullText,
        adjustment,
        timestamp: new Date().toISOString(),
      };

      addDailyLog(log);
      applyDriftAdjustment(adjustment);
      setLastResult(adjustment);
      setInput('');
      setQuickMood(null);
    } catch (err) {
      console.error('Daily check-in error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCatIcon = (cat: string) => {
    switch (cat) {
      case 'dopamine': return <Zap className="w-3.5 h-3.5 text-yellow-500" />;
      case 'acetylcholine': return <Lightbulb className="w-3.5 h-3.5 text-blue-500" />;
      case 'gaba': return <Shield className="w-3.5 h-3.5 text-green-500" />;
      case 'serotonin': return <Heart className="w-3.5 h-3.5 text-red-500" />;
      default: return null;
    }
  };

  const getAdjIcon = (val: number) => {
    if (val > 0) return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
    if (val < 0) return <TrendingDown className="w-3.5 h-3.5 text-green-500" />;
    return <Meh className="w-3.5 h-3.5 text-gray-400" />;
  };

  const moods = [
    { emoji: '😊', label: 'Great', value: 'Feeling great and energized', icon: Smile, color: 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
    { emoji: '😐', label: 'Okay', value: 'Feeling neutral/okay', icon: Meh, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
    { emoji: '😔', label: 'Low', value: 'Feeling low or tired', icon: Frown, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
    { emoji: '😰', label: 'Stressed', value: 'Feeling anxious or stressed', icon: AlertTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Daily Neuro Check-In</h3>
          </div>
          {todayLog && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Today completed
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tell me how you're feeling today — I'll fine-tune your neuro profile
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Quick Mood Selector */}
        <div className="grid grid-cols-4 gap-2">
          {moods.map((mood) => (
            <button
              key={mood.label}
              onClick={() => setQuickMood(quickMood === mood.value ? null : mood.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-center ${
                quickMood === mood.value
                  ? mood.color + ' border-2 scale-105'
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{mood.label}</span>
            </button>
          ))}
        </div>

        {/* Text Input */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe how you're feeling in more detail... (energy, mood, sleep, focus, cravings, stress)"
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={(!input.trim() && !quickMood) || isAnalyzing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing your state...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Check-In
            </>
          )}
        </button>

        {/* Last Result */}
        {lastResult && (
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3 animate-fade-in">
            <p className="text-sm text-gray-700 dark:text-gray-300">{lastResult.reasoning}</p>

            <div className="grid grid-cols-2 gap-2">
              {(['dopamine', 'acetylcholine', 'gaba', 'serotonin'] as const).map((cat) => {
                const adj = lastResult[`${cat}_adjustment`];
                if (adj === 0) return null;
                return (
                  <div key={cat} className="flex items-center gap-2 text-xs">
                    {getCatIcon(cat)}
                    <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                    {getAdjIcon(adj)}
                    <span className={adj > 0 ? 'text-red-500' : 'text-green-500'}>
                      {adj > 0 ? '+' : ''}{adj}
                    </span>
                  </div>
                );
              })}
            </div>

            {lastResult.mealPlanSuggestion && (
              <div className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg text-sm">
                <Utensils className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-xs mb-0.5">Today's Suggestion</p>
                  <p className="text-gray-600 dark:text-gray-300">{lastResult.mealPlanSuggestion}</p>
                </div>
              </div>
            )}

            {lastResult.alerts?.length > 0 && (
              <div className="space-y-1">
                {lastResult.alerts.map((alert: string, i: number) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Toggle */}
        {dailyLogs.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showHistory ? 'Hide' : 'Show'} recent check-ins ({dailyLogs.length})
            </button>

            {showHistory && (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {dailyLogs.slice().reverse().slice(0, 7).map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{log.date}</span>
                      <span className="text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-500 truncate">{log.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
