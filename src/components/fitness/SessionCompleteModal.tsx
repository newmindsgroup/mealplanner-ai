/**
 * SessionCompleteModal — Post-workout logging with mood, effort, duration, notes.
 * Feeds perceived exertion back so the AI can adjust future intensity.
 * Phase 6 feature.
 */
import React, { useState } from 'react';
import { CheckCircle, Zap, X, Loader2, Flame } from 'lucide-react';
import { completeSession } from '../../services/fitnessService';

interface Props {
  sessionId: string;
  sessionName: string;
  estimatedDuration: number;
  onComplete: () => void;
  onDismiss: () => void;
}

const MOODS = [
  { id: 'great', emoji: '🔥', label: 'On Fire' },
  { id: 'good', emoji: '💪', label: 'Solid' },
  { id: 'ok', emoji: '😐', label: 'Okay' },
  { id: 'tired', emoji: '😓', label: 'Tired' },
  { id: 'skipped', emoji: '⏭️', label: 'Skipped' },
];

const EFFORT = [1,2,3,4,5,6,7,8,9,10];

export default function SessionCompleteModal({ sessionId, sessionName, estimatedDuration, onComplete, onDismiss }: Props) {
  const [mood, setMood] = useState<string>('good');
  const [effort, setEffort] = useState(7);
  const [duration, setDuration] = useState(estimatedDuration);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await completeSession(sessionId, {
        duration_min: duration,
        mood,
        notes: notes || undefined,
        exercises: [{ perceived_exertion: effort }],
      });
      onComplete();
    } catch { /* non-fatal */ }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-5 text-white relative">
          <button onClick={onDismiss} className="absolute top-4 right-4 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Workout Complete! 🎉</h2>
              <p className="text-sm text-white/80">{sessionName}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* How did it feel? */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-2.5">How did it feel?</p>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${mood === m.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-200'}`}
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Effort 1-10 */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Effort level: <span className="text-orange-500">{effort}/10</span>
            </p>
            <p className="text-xs text-gray-400 mb-2.5">Helps the AI calibrate your next session's intensity</p>
            <div className="flex gap-1">
              {EFFORT.map(n => (
                <button
                  key={n}
                  onClick={() => setEffort(n)}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${effort >= n ? 'bg-gradient-to-b from-orange-400 to-rose-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-orange-100'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Easy</span><span>Moderate</span><span>Max effort</span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Actual duration</p>
            <div className="flex gap-2">
              {[15,20,30,45,60,75,90].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${duration === d ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-orange-200'}`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Notes (optional)</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any PRs? Injuries? How was energy?"
              rows={2}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
            />
          </div>

          {/* XP preview */}
          <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/20 rounded-xl px-4 py-2.5 border border-violet-100 dark:border-violet-900/30">
            <Zap className="w-4 h-4 text-violet-500" />
            <span className="text-sm text-violet-700 dark:text-violet-400 font-semibold">+50 XP for completing this session!</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Flame className="w-4 h-4" /> Log Workout</>}
          </button>
        </div>
      </div>
    </div>
  );
}
