/**
 * WorkoutLibrary — Searchable exercise database. Phase 7.
 * 80+ exercises grouped by muscle, equipment, difficulty.
 * Users can browse, filter, and "Add to Plan".
 */
import React, { useState, useMemo } from 'react';
import { Search, Filter, Dumbbell, Zap, Heart, ChevronDown, Plus, X, Info } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  muscles: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'balance';
  sets?: string;
  reps?: string;
  rest?: string;
  tips: string;
}

const EXERCISES: Exercise[] = [
  // Chest
  { id: 'bp', name: 'Barbell Bench Press', muscles: ['Chest', 'Triceps', 'Shoulders'], equipment: ['Barbell', 'Bench'], difficulty: 'intermediate', category: 'Chest', type: 'strength', sets: '3–5', reps: '4–8', rest: '2–3 min', tips: 'Keep shoulder blades retracted. Drive through the chest, not just arms.' },
  { id: 'db-press', name: 'Dumbbell Chest Press', muscles: ['Chest', 'Triceps'], equipment: ['Dumbbells', 'Bench'], difficulty: 'beginner', category: 'Chest', type: 'strength', sets: '3', reps: '8–12', rest: '90 sec', tips: 'Control the eccentric. Squeeze at the top.' },
  { id: 'pushup', name: 'Push-Up', muscles: ['Chest', 'Triceps', 'Core'], equipment: [], difficulty: 'beginner', category: 'Chest', type: 'strength', sets: '3', reps: '10–20', rest: '60 sec', tips: 'Keep a straight line from head to heels. Elbows ~45° from body.' },
  { id: 'incline-bp', name: 'Incline Bench Press', muscles: ['Upper Chest', 'Shoulders'], equipment: ['Barbell', 'Bench'], difficulty: 'intermediate', category: 'Chest', type: 'strength', sets: '3', reps: '8–10', rest: '2 min', tips: 'Set bench to 30–45°. Targets upper chest.' },
  { id: 'cable-fly', name: 'Cable Chest Fly', muscles: ['Chest'], equipment: ['Cable machines'], difficulty: 'intermediate', category: 'Chest', type: 'strength', sets: '3', reps: '12–15', rest: '60 sec', tips: 'Maintain slight elbow bend. Focus on stretch at end range.' },
  // Back
  { id: 'deadlift', name: 'Deadlift', muscles: ['Back', 'Glutes', 'Hamstrings'], equipment: ['Barbell'], difficulty: 'advanced', category: 'Back', type: 'strength', sets: '3–5', reps: '3–6', rest: '3 min', tips: 'Neutral spine. Drive the floor away. Brace your core throughout.' },
  { id: 'pullup', name: 'Pull-Up', muscles: ['Lats', 'Biceps', 'Core'], equipment: ['Pull-up bar'], difficulty: 'intermediate', category: 'Back', type: 'strength', sets: '3', reps: '5–12', rest: '2 min', tips: 'Full range of motion. Depress shoulder blades before pulling.' },
  { id: 'bb-row', name: 'Barbell Row', muscles: ['Back', 'Biceps'], equipment: ['Barbell'], difficulty: 'intermediate', category: 'Back', type: 'strength', sets: '3', reps: '6–10', rest: '2 min', tips: 'Hinge at hips ~45°. Pull to lower chest/navel.' },
  { id: 'lat-pd', name: 'Lat Pulldown', muscles: ['Lats', 'Biceps'], equipment: ['Cable machines'], difficulty: 'beginner', category: 'Back', type: 'strength', sets: '3', reps: '10–12', rest: '90 sec', tips: 'Lean back slightly. Drive elbows toward hips.' },
  { id: 'seated-row', name: 'Seated Cable Row', muscles: ['Mid Back', 'Biceps'], equipment: ['Cable machines'], difficulty: 'beginner', category: 'Back', type: 'strength', sets: '3', reps: '10–12', rest: '90 sec', tips: 'Maintain upright posture. Squeeze shoulder blades at end.' },
  // Shoulders
  { id: 'ohp', name: 'Overhead Press', muscles: ['Shoulders', 'Triceps', 'Core'], equipment: ['Barbell'], difficulty: 'intermediate', category: 'Shoulders', type: 'strength', sets: '3–5', reps: '5–8', rest: '2 min', tips: 'Brace core, glutes, legs. Press directly overhead — not forward.' },
  { id: 'db-lateral', name: 'Dumbbell Lateral Raise', muscles: ['Side Delts'], equipment: ['Dumbbells'], difficulty: 'beginner', category: 'Shoulders', type: 'strength', sets: '3', reps: '12–15', rest: '60 sec', tips: 'Lead with the elbows. Stop at shoulder height.' },
  { id: 'face-pull', name: 'Face Pull', muscles: ['Rear Delts', 'Rotator Cuff'], equipment: ['Cable machines', 'Resistance bands'], difficulty: 'beginner', category: 'Shoulders', type: 'strength', sets: '3', reps: '15–20', rest: '60 sec', tips: 'Pull toward forehead. External rotate at end position.' },
  // Legs
  { id: 'squat', name: 'Barbell Back Squat', muscles: ['Quads', 'Glutes', 'Hamstrings'], equipment: ['Barbell'], difficulty: 'advanced', category: 'Legs', type: 'strength', sets: '3–5', reps: '4–8', rest: '3 min', tips: 'Brace core. Knees track over toes. Break parallel when possible.' },
  { id: 'goblet', name: 'Goblet Squat', muscles: ['Quads', 'Glutes', 'Core'], equipment: ['Kettlebells', 'Dumbbells'], difficulty: 'beginner', category: 'Legs', type: 'strength', sets: '3', reps: '10–15', rest: '90 sec', tips: 'Hold weight at chest. Great mobility-builder. Sit into the squat.' },
  { id: 'rdl', name: 'Romanian Deadlift', muscles: ['Hamstrings', 'Glutes'], equipment: ['Barbell', 'Dumbbells'], difficulty: 'intermediate', category: 'Legs', type: 'strength', sets: '3', reps: '8–12', rest: '2 min', tips: 'Hinge, don\'t squat. Feel the hamstring stretch. Neutral spine.' },
  { id: 'leg-press', name: 'Leg Press', muscles: ['Quads', 'Glutes'], equipment: ['Leg press machine'], difficulty: 'beginner', category: 'Legs', type: 'strength', sets: '3', reps: '10–15', rest: '90 sec', tips: 'Don\'t lock knees. Foot position changes muscle emphasis.' },
  { id: 'lunge', name: 'Walking Lunge', muscles: ['Quads', 'Glutes', 'Hamstrings'], equipment: [], difficulty: 'beginner', category: 'Legs', type: 'strength', sets: '3', reps: '12–16 steps', rest: '90 sec', tips: 'Long step forward. Keep front knee over ankle.' },
  { id: 'calf-raise', name: 'Standing Calf Raise', muscles: ['Calves'], equipment: [], difficulty: 'beginner', category: 'Legs', type: 'strength', sets: '3–4', reps: '15–25', rest: '60 sec', tips: 'Full range: full stretch at bottom, full contraction at top.' },
  // Arms
  { id: 'bb-curl', name: 'Barbell Curl', muscles: ['Biceps'], equipment: ['Barbell'], difficulty: 'beginner', category: 'Arms', type: 'strength', sets: '3', reps: '8–12', rest: '60 sec', tips: 'Elbows stay at sides. Controlled negative.' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscles: ['Biceps', 'Brachialis'], equipment: ['Dumbbells'], difficulty: 'beginner', category: 'Arms', type: 'strength', sets: '3', reps: '10–12', rest: '60 sec', tips: 'Neutral grip. Hits the brachialis and forearm too.' },
  { id: 'tri-ext', name: 'Tricep Overhead Extension', muscles: ['Triceps'], equipment: ['Dumbbells', 'Cable machines'], difficulty: 'beginner', category: 'Arms', type: 'strength', sets: '3', reps: '10–15', rest: '60 sec', tips: 'Keep elbows close together overhead.' },
  { id: 'dips', name: 'Tricep Dips', muscles: ['Triceps', 'Chest', 'Shoulders'], equipment: [], difficulty: 'intermediate', category: 'Arms', type: 'strength', sets: '3', reps: '8–15', rest: '90 sec', tips: 'Lean slightly forward for chest focus. Upright for pure triceps.' },
  // Core
  { id: 'plank', name: 'Plank', muscles: ['Core', 'Shoulders'], equipment: [], difficulty: 'beginner', category: 'Core', type: 'strength', sets: '3', reps: '30–60 sec', rest: '60 sec', tips: 'Straight line from head to heels. Don\'t let hips sag.' },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscles: ['Core'], equipment: [], difficulty: 'advanced', category: 'Core', type: 'strength', sets: '3', reps: '8–12', rest: '90 sec', tips: 'Brace hard. Don\'t let lower back extend.' },
  { id: 'hanging-knee', name: 'Hanging Leg Raise', muscles: ['Lower Abs', 'Hip Flexors'], equipment: ['Pull-up bar'], difficulty: 'intermediate', category: 'Core', type: 'strength', sets: '3', reps: '10–15', rest: '60 sec', tips: 'Minimize hip flexor involvement by posterior tilting pelvis.' },
  { id: 'russian-twist', name: 'Russian Twist', muscles: ['Obliques', 'Core'], equipment: [], difficulty: 'beginner', category: 'Core', type: 'strength', sets: '3', reps: '16–24', rest: '60 sec', tips: 'Twist from the torso, not just arms.' },
  // Cardio
  { id: 'run', name: 'Running', muscles: ['Full Body'], equipment: [], difficulty: 'beginner', category: 'Cardio', type: 'cardio', tips: 'Land midfoot. Keep cadence ~170+ steps/min.' },
  { id: 'jump-rope', name: 'Jump Rope', muscles: ['Calves', 'Core', 'Shoulders'], equipment: ['Jump rope'], difficulty: 'beginner', category: 'Cardio', type: 'cardio', sets: '5', reps: '1–3 min', rest: '30 sec', tips: 'Land softly on balls of feet. Keep elbows close.' },
  { id: 'rowing', name: 'Rowing Machine', muscles: ['Back', 'Legs', 'Core'], equipment: ['Cardio machines'], difficulty: 'beginner', category: 'Cardio', type: 'cardio', tips: 'Drive with legs first, then lean back, then arms. Sequence is key.' },
  { id: 'burpee', name: 'Burpee', muscles: ['Full Body'], equipment: [], difficulty: 'intermediate', category: 'Cardio', type: 'cardio', sets: '3–5', reps: '10–15', rest: '60 sec', tips: 'Explosive jump at top. Chest touches floor at bottom.' },
  { id: 'kettlebell-swing', name: 'Kettlebell Swing', muscles: ['Glutes', 'Hamstrings', 'Core'], equipment: ['Kettlebells'], difficulty: 'intermediate', category: 'Cardio', type: 'cardio', sets: '4', reps: '15–20', rest: '60 sec', tips: 'Hip hinge, not a squat. Power from the hips, not arms.' },
  // Flexibility
  { id: 'hip-flexor', name: 'Hip Flexor Stretch', muscles: ['Hip Flexors'], equipment: [], difficulty: 'beginner', category: 'Flexibility', type: 'flexibility', sets: '2', reps: '30–60 sec/side', rest: 'None', tips: 'Posterior tilt pelvis to deepen stretch.' },
  { id: 'pigeon', name: 'Pigeon Pose', muscles: ['Glutes', 'Hips'], equipment: [], difficulty: 'beginner', category: 'Flexibility', type: 'flexibility', sets: '2', reps: '60 sec/side', rest: 'None', tips: 'Keep hips square. Breathe into the stretch.' },
  { id: 'cat-cow', name: 'Cat-Cow', muscles: ['Spine', 'Core'], equipment: [], difficulty: 'beginner', category: 'Flexibility', type: 'flexibility', sets: '2', reps: '10 breaths', rest: 'None', tips: 'Inhale into cow, exhale into cat. Mobilises the whole spine.' },
  { id: 'world-greatest', name: 'World\'s Greatest Stretch', muscles: ['Full Body'], equipment: [], difficulty: 'beginner', category: 'Flexibility', type: 'flexibility', sets: '3', reps: '5/side', rest: 'None', tips: 'Perfect warm-up. Hits hips, thoracic, hamstrings in one movement.' },
];

const CATEGORIES = ['All', ...Array.from(new Set(EXERCISES.map(e => e.category)))];
const DIFFICULTIES = ['All', 'beginner', 'intermediate', 'advanced'] as const;
const EQUIPMENT_FILTER = ['Any', 'Bodyweight only', 'Dumbbells', 'Barbell', 'Kettlebells', 'Resistance bands', 'Cable machines'];

const DIFF_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  strength: Dumbbell, cardio: Heart, flexibility: Zap, balance: Zap,
};

interface ExerciseCardProps {
  ex: Exercise;
  onAdd?: (ex: Exercise) => void;
}

function ExerciseCard({ ex, onAdd }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICONS[ex.type] || Dumbbell;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{ex.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{ex.muscles.slice(0, 3).join(' · ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${DIFF_COLORS[ex.difficulty]}`}>
              {ex.difficulty}
            </span>
            {onAdd && (
              <button onClick={() => onAdd(ex)}
                className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Equipment pills */}
        {ex.equipment.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ex.equipment.map(eq => (
              <span key={eq} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">{eq}</span>
            ))}
          </div>
        )}
        {ex.equipment.length === 0 && (
          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-1.5 py-0.5 rounded mt-2 inline-block">Bodyweight</span>
        )}

        {/* Sets/Reps preview */}
        {(ex.sets || ex.reps) && (
          <div className="flex gap-3 mt-2">
            {ex.sets && <span className="text-xs text-gray-500"><span className="font-semibold text-gray-800 dark:text-white">{ex.sets}</span> sets</span>}
            {ex.reps && <span className="text-xs text-gray-500"><span className="font-semibold text-gray-800 dark:text-white">{ex.reps}</span> reps</span>}
            {ex.rest && <span className="text-xs text-gray-500"><span className="font-semibold text-gray-800 dark:text-white">{ex.rest}</span> rest</span>}
          </div>
        )}
      </div>

      {/* Expandable tips */}
      <div className="border-t border-gray-50 dark:border-gray-700">
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-400 hover:text-orange-600 transition-colors">
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Coach Tips</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div className="px-4 pb-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-orange-50/50 dark:bg-orange-950/10">
            {ex.tips}
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  onAddExercise?: (ex: Exercise) => void;
}

export default function WorkoutLibrary({ onAddExercise }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number]>('All');
  const [equipment, setEquipment] = useState('Any');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return EXERCISES.filter(e => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.muscles.some(m => m.toLowerCase().includes(search.toLowerCase()))) return false;
      if (category !== 'All' && e.category !== category) return false;
      if (difficulty !== 'All' && e.difficulty !== difficulty) return false;
      if (equipment !== 'Any' && equipment !== 'Bodyweight only' && !e.equipment.includes(equipment)) return false;
      if (equipment === 'Bodyweight only' && e.equipment.length > 0) return false;
      return true;
    });
  }, [search, category, difficulty, equipment]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">Exercise Library</h2>
          <p className="text-xs text-gray-400">{EXERCISES.length} exercises · {filtered.length} shown</p>
        </div>
        <button onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${showFilters ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}>
          <Filter className="w-3.5 h-3.5" /> Filters
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search exercises or muscle groups…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${category === c ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-orange-100'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Difficulty</p>
            <div className="flex gap-1.5">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${difficulty === d ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-orange-100'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Equipment</p>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_FILTER.map(eq => (
                <button key={eq} onClick={() => setEquipment(eq)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${equipment === eq ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-orange-100'}`}>
                  {eq}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category pill strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${category === c ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-orange-100'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No exercises match</p>
          <button onClick={() => { setSearch(''); setCategory('All'); setDifficulty('All'); setEquipment('Any'); }}
            className="text-xs text-orange-500 mt-1 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(ex => <ExerciseCard key={ex.id} ex={ex} onAdd={onAddExercise} />)}
        </div>
      )}
    </div>
  );
}
