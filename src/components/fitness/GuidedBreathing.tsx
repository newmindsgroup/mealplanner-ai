/**
 * Guided Breathing & Mindfulness — Phase 10
 * Visual breathing pacer with 3 techniques + session logging.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, Moon, Zap, Play, Pause, RotateCcw, CheckCircle, ChevronDown } from 'lucide-react';

interface BreathPhase {
  action: 'inhale' | 'hold' | 'exhale' | 'holdEmpty';
  duration: number; // seconds
  label: string;
}

interface Technique {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bestFor: string;
  color: string;
  bgGradient: string;
  phases: BreathPhase[];
  cycles: number;
}

const TECHNIQUES: Technique[] = [
  {
    id: 'box', name: 'Box Breathing', emoji: '🔲',
    description: 'Used by Navy SEALs for instant calm and focus',
    bestFor: 'Stress relief · Pre-workout focus',
    color: 'text-blue-500', bgGradient: 'from-blue-500 to-indigo-600',
    phases: [
      { action: 'inhale', duration: 4, label: 'Breathe In' },
      { action: 'hold', duration: 4, label: 'Hold' },
      { action: 'exhale', duration: 4, label: 'Breathe Out' },
      { action: 'holdEmpty', duration: 4, label: 'Hold Empty' },
    ],
    cycles: 6,
  },
  {
    id: '478', name: '4-7-8 Relaxation', emoji: '🌙',
    description: 'Dr. Andrew Weil\'s natural tranquilizer technique',
    bestFor: 'Sleep · Deep relaxation · Anxiety',
    color: 'text-violet-500', bgGradient: 'from-violet-500 to-purple-700',
    phases: [
      { action: 'inhale', duration: 4, label: 'Breathe In' },
      { action: 'hold', duration: 7, label: 'Hold' },
      { action: 'exhale', duration: 8, label: 'Breathe Out' },
    ],
    cycles: 4,
  },
  {
    id: 'energize', name: 'Power Breathing', emoji: '⚡',
    description: 'Quick energizer inspired by Wim Hof — modified for safety',
    bestFor: 'Energy boost · Pre-workout activation',
    color: 'text-orange-500', bgGradient: 'from-orange-500 to-rose-600',
    phases: [
      { action: 'inhale', duration: 2, label: 'Deep In' },
      { action: 'exhale', duration: 2, label: 'Quick Out' },
    ],
    cycles: 15,
  },
];

const PHASE_COLORS: Record<string, string> = {
  inhale: 'from-blue-400 to-cyan-400',
  hold: 'from-violet-400 to-purple-500',
  exhale: 'from-emerald-400 to-teal-500',
  holdEmpty: 'from-gray-400 to-gray-500',
};

export default function GuidedBreathing() {
  const [selectedTech, setSelectedTech] = useState<Technique | null>(null);
  const [running, setRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [complete, setComplete] = useState(false);
  const [circleScale, setCircleScale] = useState(0.5);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tech = selectedTech;
  const phase = tech?.phases[currentPhase];
  const totalCycles = tech?.cycles || 1;

  // Timer logic
  useEffect(() => {
    if (!running || !tech || complete) return;

    intervalRef.current = setInterval(() => {
      setPhaseTimer(prev => {
        const maxTime = tech.phases[currentPhase].duration;
        if (prev >= maxTime - 1) {
          // Move to next phase
          const nextPhase = currentPhase + 1;
          if (nextPhase >= tech.phases.length) {
            // Next cycle
            const nextCycle = currentCycle + 1;
            if (nextCycle >= totalCycles) {
              setComplete(true);
              setRunning(false);
              return 0;
            }
            setCurrentCycle(nextCycle);
            setCurrentPhase(0);
          } else {
            setCurrentPhase(nextPhase);
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, currentPhase, currentCycle, tech, complete, totalCycles]);

  // Animate circle based on phase
  useEffect(() => {
    if (!phase) return;
    const pct = phase.duration > 0 ? phaseTimer / phase.duration : 0;

    switch (phase.action) {
      case 'inhale': setCircleScale(0.5 + pct * 0.5); break;
      case 'hold': setCircleScale(1); break;
      case 'exhale': setCircleScale(1 - pct * 0.5); break;
      case 'holdEmpty': setCircleScale(0.5); break;
    }
  }, [phase, phaseTimer]);

  const start = (t: Technique) => {
    setSelectedTech(t);
    setCurrentPhase(0);
    setCurrentCycle(0);
    setPhaseTimer(0);
    setComplete(false);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setSelectedTech(null);
    setCurrentPhase(0);
    setCurrentCycle(0);
    setPhaseTimer(0);
    setComplete(false);
    setCircleScale(0.5);
  };

  if (complete && tech) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="font-black text-xl text-gray-900 dark:text-white">Session Complete</h2>
        <p className="text-sm text-gray-500">
          {tech.name} · {totalCycles} cycles · ~{Math.round(tech.phases.reduce((s, p) => s + p.duration, 0) * totalCycles / 60)} min
        </p>
        <p className="text-xs text-gray-400 max-w-xs">Take a moment to notice how you feel. Your nervous system is now calmer and more regulated.</p>
        <button onClick={reset}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
          <RotateCcw className="w-4 h-4" /> New Session
        </button>
      </div>
    );
  }

  if (tech && (running || phaseTimer > 0)) {
    const phaseDuration = phase?.duration || 4;
    const remaining = phaseDuration - phaseTimer;
    const phaseGradient = PHASE_COLORS[phase?.action || 'inhale'];

    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] space-y-6">
        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{tech.emoji} {tech.name}</span>
            <span>Cycle {currentCycle + 1}/{totalCycles}</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentCycle * tech.phases.length + currentPhase) / (totalCycles * tech.phases.length)) * 100}%` }} />
          </div>
        </div>

        {/* Breathing circle */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Outer ring */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${phaseGradient} opacity-20 transition-transform duration-1000 ease-in-out`}
            style={{ transform: `scale(${circleScale * 1.15})` }} />
          {/* Inner circle */}
          <div className={`w-44 h-44 rounded-full bg-gradient-to-br ${phaseGradient} flex items-center justify-center transition-transform duration-1000 ease-in-out shadow-2xl`}
            style={{ transform: `scale(${circleScale})` }}>
            <div className="text-center text-white">
              <p className="font-black text-4xl">{remaining}</p>
              <p className="text-sm font-bold opacity-80 mt-1">{phase?.label}</p>
            </div>
          </div>
        </div>

        {/* Phase dots */}
        <div className="flex gap-2">
          {tech.phases.map((p, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentPhase ? 'w-6 bg-white' : 'bg-white/30'}`}
              style={{ background: i === currentPhase ? undefined : undefined }} />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button onClick={() => setRunning(r => !r)}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
            {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
          </button>
          <button onClick={reset}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            <RotateCcw className="w-4 h-4" /> Stop
          </button>
        </div>
      </div>
    );
  }

  // Technique selection
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
          <Wind className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Breathwork & Mindfulness</h2>
          <p className="text-[11px] text-gray-400">Guided breathing for recovery, focus & calm</p>
        </div>
      </div>

      <div className="space-y-3">
        {TECHNIQUES.map(t => {
          const totalSec = t.phases.reduce((s, p) => s + p.duration, 0) * t.cycles;
          const mins = Math.round(totalSec / 60);

          return (
            <button key={t.id} onClick={() => start(t)}
              className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-left hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900/40 transition-all group">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${t.bgGradient} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</p>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-lg font-semibold">~{mins} min</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {t.bestFor}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {t.phases.map((p, i) => (
                      <span key={i} className={`text-[9px] bg-gradient-to-r ${PHASE_COLORS[p.action]} text-white px-1.5 py-0.5 rounded font-bold`}>
                        {p.label} {p.duration}s
                      </span>
                    ))}
                    <span className="text-[9px] text-gray-400 ml-1">×{t.cycles}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 mt-1">
                  <Play className={`w-5 h-5 ${t.color} group-hover:scale-125 transition-transform`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3">
        <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">💡 Why breathwork?</p>
        <p className="text-xs text-blue-600/70 dark:text-blue-400/60 leading-relaxed">
          Controlled breathing activates your parasympathetic nervous system, lowering cortisol and heart rate. 
          Just 2–5 minutes improves recovery, sleep quality, and workout performance.
        </p>
      </div>
    </div>
  );
}
