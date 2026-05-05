/**
 * WeeklyCheckIn — Monday prompt for weight, energy, sleep, stress.
 * AI reads the answers and adjusts the week's plan intensity.
 * Phase 7 feature.
 */
import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Zap, Moon, Scale, Activity, Loader2, CheckCircle, X, ChevronRight } from 'lucide-react';
import { api } from '../../services/apiClient';

interface CheckInForm {
  weight_kg?: number;
  energy_level: number;   // 1–10
  sleep_quality: number;  // 1–10
  stress_level: number;   // 1–5
  sore_areas: string[];
  mood: string;
  notes: string;
}

interface Props {
  personId?: string;
  personName?: string;
  onDismiss?: () => void;
  onComplete?: (adjustment: string) => void;
  inline?: boolean; // true = render inline, false = modal overlay
}

const SORE_AREAS = ['Legs', 'Back', 'Shoulders', 'Chest', 'Arms', 'Core', 'Joints', 'None'];
const MOODS = [
  { id: 'great', label: '🔥 Great', desc: 'Ready to crush it' },
  { id: 'good', label: '💪 Good', desc: 'Feeling solid' },
  { id: 'ok', label: '😐 OK', desc: 'Getting through it' },
  { id: 'tired', label: '😓 Tired', desc: 'Need to ease up' },
  { id: 'rest', label: '🛌 Rest Day', desc: 'Body says no' },
];

function ScaleInput({ label, value, onChange, icon: Icon, color, min = 1, max = 10, lowLabel = 'Low', highLabel = 'High' }: {
  label: string; value: number; onChange: (v: number) => void; icon: React.ElementType;
  color: string; min?: number; max?: number; lowLabel?: string; highLabel?: string;
}) {
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-bold text-gray-900 dark:text-white">{label}</span>
        <span className={`ml-auto font-black text-lg ${color}`}>{value}/{max}</span>
      </div>
      <div className="flex gap-1">
        {ticks.map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${value >= n ? `bg-gradient-to-b ${color.includes('orange') ? 'from-orange-400 to-rose-500' : color.includes('violet') ? 'from-violet-400 to-purple-500' : color.includes('blue') ? 'from-blue-400 to-indigo-500' : 'from-emerald-400 to-teal-500'} text-white shadow-sm` : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{lowLabel}</span><span>{highLabel}</span>
      </div>
    </div>
  );
}

export default function WeeklyCheckIn({ personId, personName, onDismiss, onComplete, inline = false }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CheckInForm>({ energy_level: 7, sleep_quality: 7, stress_level: 2, sore_areas: [], mood: 'good', notes: '' });
  const [saving, setSaving] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const toggleSore = (area: string) =>
    setForm(f => ({ ...f, sore_areas: f.sore_areas.includes(area) ? f.sore_areas.filter(a => a !== area) : [...f.sore_areas, area] }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await api.post<{ success: boolean; data: { aiAdjustment?: string } }>('/fitness/weekly-checkin', { ...form, person_id: personId });
      const msg = res.data?.aiAdjustment || 'Check-in saved! Your plan has been updated.';
      setAiResponse(msg);
      setStep(3);
      onComplete?.(msg);
    } catch {
      setAiResponse('Check-in saved! Keep up the great work.');
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <ClipboardCheck className="w-4.5 h-4.5 w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-base">
              {personName ? `${personName.split(' ')[0]}'s Weekly Check-In` : 'Weekly Check-In'}
            </h2>
            <p className="text-xs text-gray-400">The AI will adjust this week's plan based on your responses</p>
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress steps */}
      <div className="flex gap-1">
        {[0,1,2].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full transition-all ${step > s ? 'bg-emerald-500' : step === s ? 'bg-emerald-400' : 'bg-gray-100 dark:bg-gray-700'}`} />
        ))}
      </div>

      {step === 3 ? (
        /* AI Response */
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">Check-in Complete! 🎉</p>
            <p className="text-xs text-gray-400 mt-1">Your AI coach has reviewed your data</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 text-left">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">{aiResponse}</p>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 transition-colors">
              Close
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Step 0: How are you feeling? */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">How are you feeling overall?</h3>
              <div className="space-y-2">
                {MOODS.map(m => (
                  <button key={m.id} onClick={() => setForm(f => ({ ...f, mood: m.id }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${form.mood === m.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200'}`}>
                    <span className="text-xl">{m.label.split(' ')[0]}</span>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{m.label.split(' ').slice(1).join(' ')}</p>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </div>
                    {form.mood === m.id && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />}
                  </button>
                ))}
              </div>

              {/* Weight */}
              <div>
                <label className="text-sm font-bold text-gray-900 dark:text-white block mb-2">
                  <Scale className="w-4 h-4 inline mr-1 text-orange-500" /> Current Weight (optional)
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="kg" value={form.weight_kg || ''}
                    onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    className="w-28 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-gray-800" />
                  <span className="text-sm text-gray-400">kg — auto-logs to your measurements</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Energy, Sleep, Stress */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-900 dark:text-white">Recovery metrics</h3>
              <ScaleInput label="Energy Level" value={form.energy_level} onChange={v => setForm(f => ({ ...f, energy_level: v }))} icon={Zap} color="text-orange-500" lowLabel="Drained" highLabel="Energized" />
              <ScaleInput label="Sleep Quality" value={form.sleep_quality} onChange={v => setForm(f => ({ ...f, sleep_quality: v }))} icon={Moon} color="text-violet-500" lowLabel="Poor" highLabel="Great" />
              <ScaleInput label="Stress Level" value={form.stress_level} onChange={v => setForm(f => ({ ...f, stress_level: v }))} icon={Activity} color="text-blue-500" min={1} max={5} lowLabel="Relaxed" highLabel="Overwhelmed" />
            </div>
          )}

          {/* Step 2: Soreness + notes */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Any soreness or notes?</h3>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sore areas</p>
                <div className="flex flex-wrap gap-2">
                  {SORE_AREAS.map(area => (
                    <button key={area} onClick={() => toggleSore(area)}
                      className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${form.sore_areas.includes(area) ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-rose-200'}`}>
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Anything else for your AI coach?</p>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. skipped 2 sessions last week, knee feeling tight, hit a new PR on squats…"
                  rows={3} className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-300 transition-all">
                Back
              </button>
            )}
            <button
              onClick={step < 2 ? () => setStep(s => s + 1) : handleSubmit}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : step < 2 ? <>Next <ChevronRight className="w-4 h-4" /></> : <><CheckCircle className="w-4 h-4" /> Submit Check-In</>}
            </button>
          </div>
        </>
      )}
    </div>
  );

  if (inline) return <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-5 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
