import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { getBodyAnalyses, analyzeBodyPhoto, deleteBodyAnalysis } from '../../services/fitnessService';
import type { BodyAnalysis as BodyAnalysisType } from '../../services/fitnessService';

interface Props { onAnalysisComplete?: () => void; }

export default function BodyAnalysis({ onAnalysisComplete }: Props) {
  const [analyses, setAnalyses] = useState<BodyAnalysisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<BodyAnalysisType | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadAnalyses(); }, []);

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const res = await getBodyAnalyses();
      setAnalyses(res.data || []);
      if (res.data?.length) setSelected(res.data[0]);
    } finally { setLoading(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeBodyPhoto(file);
      if (res.success) {
        await loadAnalyses();
        onAnalysisComplete?.();
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch {
      setError('Upload failed. Check your connection and try again.');
    } finally {
      setAnalyzing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    await deleteBodyAnalysis(id);
    setSelected(null);
    loadAnalyses();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-gray-400">
      <Loader className="w-5 h-5 animate-spin mr-2" /> Loading analyses…
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Body Analysis</h2>
          <p className="text-sm text-gray-500">AI-powered body composition assessment from a photo</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={analyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-60"
        >
          {analyzing ? <><Loader className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Camera className="w-4 h-4" /> Analyze Photo</>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Privacy notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
        <Eye className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>Your photo is sent to the AI for analysis only. You can control retention in your Fitness Profile settings.</span>
      </div>

      {analyses.length === 0 && !analyzing && (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No body analyses yet</p>
          <p className="text-gray-400 text-sm mb-4">Upload a front-facing photo to get your AI body composition assessment</p>
          <button onClick={() => fileRef.current?.click()}
            className="bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-600 transition-colors">
            Upload Photo
          </button>
        </div>
      )}

      {selected && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Left: Key results */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Latest Analysis</h3>
              <button onClick={() => handleDelete(selected.id)}
                className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(selected.analyzed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Body Type', value: selected.bodyType || selected.body_type || '—' },
                { label: 'Est. Body Fat', value: selected.estimatedBodyFat ? `${selected.estimatedBodyFat}%` : (selected.estimated_bf ? `${selected.estimated_bf}%` : '—') },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-gray-900 dark:text-white capitalize">{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            {(selected.priorityAreas || []).length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Priority Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.priorityAreas!.map(a => (
                    <span key={a} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {(selected.strengths || []).length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.strengths!.map(s => (
                    <span key={s} className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />{s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Recommendations */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-2xl border border-violet-100 dark:border-violet-900/30 p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">AI Recommendations</h3>

            {selected.recommendedApproach && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs font-bold text-violet-600 mb-1">Recommended Approach</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selected.recommendedApproach}</p>
              </div>
            )}

            {(selected.cautions || []).length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-600 mb-2">⚠️ Cautions</p>
                <ul className="space-y-1">
                  {selected.cautions!.map(c => (
                    <li key={c} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.motivationalNote && (
              <div className="border-t border-violet-100 dark:border-violet-900/30 pt-3">
                <p className="text-sm text-violet-700 dark:text-violet-300 italic">"{selected.motivationalNote}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis history */}
      {analyses.length > 1 && (
        <div>
          <p className="text-sm font-bold text-gray-500 mb-3">Analysis History</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {analyses.map(a => (
              <button key={a.id} onClick={() => setSelected(a)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${selected?.id === a.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {new Date(a.analyzed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
