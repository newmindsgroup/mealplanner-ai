import React, { useState } from 'react';
import { Plus, Trophy, TrendingUp, Scale } from 'lucide-react';
import { logMeasurement, logPersonalRecord } from '../../services/fitnessService';
import type { BodyMeasurement, PersonalRecord } from '../../services/fitnessService';

interface Props {
  measurements: BodyMeasurement[];
  records: PersonalRecord[];
  onMeasurementAdded: () => void;
}

export default function ProgressView({ measurements, records, onMeasurementAdded }: Props) {
  const [activeSection, setActiveSection] = useState<'measurements' | 'records'>('measurements');
  const [showLogForm, setShowLogForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BodyMeasurement>({});
  const [prForm, setPrForm] = useState<PersonalRecord>({ exercise: '', record_type: 'max_weight', value: 0 });

  const handleLogMeasurement = async () => {
    setSaving(true);
    try {
      await logMeasurement(form);
      setForm({});
      setShowLogForm(false);
      onMeasurementAdded();
    } finally { setSaving(false); }
  };

  const handleLogPR = async () => {
    setSaving(true);
    try {
      await logPersonalRecord(prForm);
      setPrForm({ exercise: '', record_type: 'max_weight', value: 0 });
      setShowLogForm(false);
      onMeasurementAdded();
    } finally { setSaving(false); }
  };

  const latestWeight = measurements[0]?.weight_kg;
  const oldestWeight = measurements[measurements.length - 1]?.weight_kg;
  const totalChange = latestWeight && oldestWeight ? (latestWeight - oldestWeight) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Progress Tracking</h2>
        <button onClick={() => setShowLogForm(s => !s)}
          className="flex items-center gap-1.5 bg-orange-500 text-white font-semibold px-3 py-2 rounded-xl text-sm hover:bg-orange-600 transition-colors">
          <Plus className="w-4 h-4" /> Log Entry
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Current Weight', value: latestWeight ? `${latestWeight} kg` : '—', icon: Scale, color: 'text-blue-500 bg-blue-50' },
          { label: 'Total Change', value: totalChange !== null ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg` : '—', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'PRs Achieved', value: String(records.length), icon: Trophy, color: 'text-yellow-500 bg-yellow-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {[['measurements', '📏 Measurements'], ['records', '🏆 Personal Records']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveSection(id as 'measurements' | 'records')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeSection === id ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Log form */}
      {showLogForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            {activeSection === 'measurements' ? 'Log Measurements' : 'Log Personal Record'}
          </h3>
          {activeSection === 'measurements' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Weight (kg)', 'weight_kg'], ['Body Fat %', 'body_fat_pct'],
                  ['Chest (cm)', 'chest_cm'], ['Waist (cm)', 'waist_cm'],
                  ['Bicep (cm)', 'bicep_cm'], ['Thigh (cm)', 'thigh_cm'],
                ].map(([label, field]) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                    <input type="number" placeholder="—"
                      value={(form as Record<string, unknown>)[field] as number || ''}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                ))}
              </div>
              <button onClick={handleLogMeasurement} disabled={saving}
                className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Measurements'}
              </button>
            </>
          ) : (
            <>
              <input placeholder="Exercise name (e.g. Bench Press)"
                value={prForm.exercise}
                onChange={e => setPrForm(f => ({ ...f, exercise: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <div className="flex gap-2">
                <select value={prForm.record_type}
                  onChange={e => setPrForm(f => ({ ...f, record_type: e.target.value as PersonalRecord['record_type'] }))}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="max_weight">Max Weight</option>
                  <option value="max_reps">Max Reps</option>
                  <option value="fastest_time">Fastest Time</option>
                  <option value="longest_distance">Longest Distance</option>
                </select>
                <input type="number" placeholder="Value"
                  value={prForm.value || ''}
                  onChange={e => setPrForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                  className="w-24 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <input placeholder="Unit (kg, lbs…)"
                  value={prForm.unit || ''}
                  onChange={e => setPrForm(f => ({ ...f, unit: e.target.value }))}
                  className="w-24 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <button onClick={handleLogPR} disabled={saving || !prForm.exercise || !prForm.value}
                className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Personal Record 🏆'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Measurements list */}
      {activeSection === 'measurements' && (
        <div className="space-y-2">
          {measurements.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No measurements logged yet</p>
            </div>
          ) : measurements.map((m, i) => (
            <div key={m.id || i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400">
                  {m.measured_at ? new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                </p>
                {m.weight_kg && <span className="text-sm font-black text-gray-900 dark:text-white">{m.weight_kg} kg</span>}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {m.body_fat_pct && <span>BF: {m.body_fat_pct}%</span>}
                {m.chest_cm && <span>Chest: {m.chest_cm}cm</span>}
                {m.waist_cm && <span>Waist: {m.waist_cm}cm</span>}
                {m.bicep_cm && <span>Bicep: {m.bicep_cm}cm</span>}
                {m.thigh_cm && <span>Thigh: {m.thigh_cm}cm</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRs list */}
      {activeSection === 'records' && (
        <div className="space-y-2">
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No personal records yet — keep training!</p>
            </div>
          ) : records.map((r, i) => (
            <div key={r.id || i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900 dark:text-white">{r.exercise}</p>
                <p className="text-xs text-gray-400">{r.record_type?.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-gray-900 dark:text-white">{r.value} <span className="text-xs text-gray-400 font-normal">{r.unit || ''}</span></p>
                <p className="text-xs text-gray-400">
                  {r.achieved_at ? new Date(r.achieved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
