/**
 * Family Challenges — Create and track shared fitness challenges.
 * Phase 9 feature.
 */
import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Target, Flame, Users, CheckCircle, Loader2, X, ChevronRight, Calendar } from 'lucide-react';
import { api } from '../../services/apiClient';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal_type: 'sessions' | 'reps' | 'minutes' | 'steps' | 'custom';
  goal_value: number;
  goal_unit: string;
  ends_at: string;
  created_by_name: string;
  progress: ChallengeProgress[];
}

interface ChallengeProgress {
  person_id: string;
  person_name: string;
  current_value: number;
  completed: boolean;
}

const GOAL_TYPES = [
  { id: 'sessions', label: 'Workouts', unit: 'sessions', placeholder: '10' },
  { id: 'reps', label: 'Total Reps', unit: 'reps', placeholder: '1000' },
  { id: 'minutes', label: 'Active Minutes', unit: 'minutes', placeholder: '300' },
  { id: 'steps', label: 'Steps', unit: 'steps', placeholder: '70000' },
  { id: 'custom', label: 'Custom', unit: '', placeholder: '5' },
];

const DURATION_OPTIONS = [
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
];

const PRESET_CHALLENGES = [
  { title: '7-Day Streak', description: 'Complete a workout every day for 7 days', goal_type: 'sessions', goal_value: 7, goal_unit: 'sessions', duration: 7 },
  { title: '1000 Rep Challenge', description: 'Hit 1,000 total reps across any exercises', goal_type: 'reps', goal_value: 1000, goal_unit: 'reps', duration: 7 },
  { title: 'Move 300 Minutes', description: 'Log 300 minutes of exercise this month', goal_type: 'minutes', goal_value: 300, goal_unit: 'minutes', duration: 30 },
  { title: 'Family Fitness Week', description: 'Every family member completes 3 workouts', goal_type: 'sessions', goal_value: 3, goal_unit: 'sessions', duration: 7 },
];

function avatarColor(name: string): string {
  const COLORS = ['from-orange-400 to-rose-500', 'from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-violet-400 to-purple-500', 'from-amber-400 to-orange-500'];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function ChallengeCard({ challenge, onLog }: { challenge: Challenge; onLog: (id: string) => void }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.ends_at).getTime() - Date.now()) / 86400000));
  const maxProgress = Math.max(...challenge.progress.map(p => p.current_value), 1);
  const isExpired = daysLeft === 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden ${isExpired ? 'border-gray-200 dark:border-gray-700 opacity-70' : 'border-orange-100 dark:border-orange-900/30'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-rose-50 dark:from-gray-800 dark:to-gray-800 px-4 py-3 border-b border-orange-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{challenge.title}</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{challenge.description}</p>
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-lg ${isExpired ? 'bg-gray-100 text-gray-400' : 'bg-orange-100 dark:bg-orange-950/30 text-orange-600'}`}>
            {isExpired ? 'Ended' : `${daysLeft}d left`}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400">Goal: <span className="font-bold text-gray-700 dark:text-gray-300">{challenge.goal_value} {challenge.goal_unit}</span></span>
          <span className="text-xs text-gray-400">By: {challenge.created_by_name}</span>
        </div>
      </div>

      {/* Progress per member */}
      <div className="p-4 space-y-2.5">
        {challenge.progress.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No progress logged yet — be first!</p>
        ) : (
          challenge.progress.map(p => {
            const pct = Math.min(100, Math.round((p.current_value / challenge.goal_value) * 100));
            return (
              <div key={p.person_id} className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColor(p.person_name)} flex items-center justify-center text-white font-black text-xs flex-shrink-0`}>
                  {initials(p.person_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{p.person_name}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white ml-2 flex-shrink-0">
                      {p.current_value}/{challenge.goal_value}
                      {p.completed && <CheckCircle className="w-3 h-3 text-emerald-500 inline ml-1" />}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${p.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-400 to-rose-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })
        )}
        {!isExpired && (
          <button onClick={() => onLog(challenge.id)}
            className="w-full flex items-center justify-center gap-1.5 border border-orange-200 dark:border-orange-900/40 text-orange-600 font-bold py-2 rounded-xl text-xs hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all mt-1">
            <Plus className="w-3.5 h-3.5" /> Log Progress
          </button>
        )}
      </div>
    </div>
  );
}

export default function FamilyChallenges({ personId, personName }: { personId?: string; personName?: string }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [logModal, setLogModal] = useState<{ id: string } | null>(null);
  const [logValue, setLogValue] = useState('1');

  const [form, setForm] = useState({
    title: '', description: '', goal_type: 'sessions', goal_value: 10, goal_unit: 'sessions', duration: 7,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Challenge[] }>('/fitness/challenges');
      setChallenges(res.data || []);
    } catch { setChallenges([]); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.post('/fitness/challenges', {
        ...form,
        person_id: personId,
        person_name: personName,
      });
      setShowCreate(false);
      setForm({ title: '', description: '', goal_type: 'sessions', goal_value: 10, goal_unit: 'sessions', duration: 7 });
      load();
    } catch { /* non-fatal */ }
    finally { setCreating(false); }
  };

  const handleLog = async () => {
    if (!logModal) return;
    try {
      await api.post(`/fitness/challenges/${logModal.id}/log`, {
        person_id: personId,
        person_name: personName,
        value: Number(logValue),
      });
      setLogModal(null);
      setLogValue('1');
      load();
    } catch { /* non-fatal */ }
  };

  const applyPreset = (p: typeof PRESET_CHALLENGES[0]) => {
    setForm({ title: p.title, description: p.description, goal_type: p.goal_type, goal_value: p.goal_value, goal_unit: p.goal_unit, duration: p.duration });
    setShowCreate(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Family Challenges</h2>
            <p className="text-[11px] text-gray-400">Compete together, grow together</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Challenge
        </button>
      </div>

      {/* Quick presets */}
      {!showCreate && (
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Start</p>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_CHALLENGES.map(p => (
              <button key={p.title} onClick={() => applyPreset(p)}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-left hover:border-orange-200 hover:shadow-sm transition-all">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{p.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{p.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-orange-200 dark:border-orange-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Create Challenge</h3>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Challenge name" className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-900" />
          <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)" className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-900" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1">Goal Type</p>
              <select value={form.goal_type} onChange={e => {
                const gt = GOAL_TYPES.find(t => t.id === e.target.value)!;
                setForm(f => ({ ...f, goal_type: e.target.value, goal_unit: gt.unit }));
              }} className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-900">
                {GOAL_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1">Goal Amount</p>
              <input type="number" value={form.goal_value}
                onChange={e => setForm(f => ({ ...f, goal_value: Number(e.target.value) }))}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-900" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">Duration</p>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(d => (
                <button key={d.days} onClick={() => setForm(f => ({ ...f, duration: d.days }))}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${form.duration === d.days ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating || !form.title}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {creating ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : <><Trophy className="w-4 h-4" />Create Challenge</>}
          </button>
        </div>
      )}

      {/* Log progress modal */}
      {logModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Log Progress</h3>
            <input type="number" value={logValue} onChange={e => setLogValue(e.target.value)} min="1"
              className="w-full text-center text-2xl font-black border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setLogModal(null)} className="flex-1 border border-gray-200 text-gray-500 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleLog} className="flex-1 bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-orange-600">Log</button>
            </div>
          </div>
        </div>
      )}

      {/* Active challenges */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Trophy className="w-10 h-10 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
          <p className="text-sm font-bold text-gray-500">No challenges yet</p>
          <p className="text-xs text-gray-400 mt-1">Create one above to get the family competing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map(c => <ChallengeCard key={c.id} challenge={c} onLog={id => setLogModal({ id })} />)}
        </div>
      )}
    </div>
  );
}
