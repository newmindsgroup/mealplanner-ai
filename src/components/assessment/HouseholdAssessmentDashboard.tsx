import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useAssessmentStore, type PersonAssessmentData } from '../../store/assessmentStore';
import type { Category } from '../../lib/assessment/gradeAssessment';
import type { Person } from '../../types';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import {
  Brain, Users, CheckCircle2, Clock, CircleDashed, Filter,
  ArrowRight, Zap, Lightbulb, Shield, Heart,
  ChevronDown, BarChart3, Eye, RotateCcw, Sparkles,
} from 'lucide-react';

type StatusFilter = 'all' | 'completed' | 'in-progress' | 'not-started';
type SortOption = 'newest' | 'oldest' | 'highest-deficiency' | 'name';

const NATURE_COLORS: Record<Category, string> = {
  dopamine: '#eab308',
  acetylcholine: '#3b82f6',
  gaba: '#22c55e',
  serotonin: '#ef4444',
};

const NATURE_LABELS: Record<Category, string> = {
  dopamine: 'The Powerhouse',
  acetylcholine: 'The Creative',
  gaba: 'The Stabilizer',
  serotonin: 'The Harmonizer',
};

const RADAR_COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];

interface Props {
  onSelectPerson: (personId: string) => void;
  onViewReport: (personId: string) => void;
}

interface EnrichedPerson {
  person: Person;
  data: PersonAssessmentData | undefined;
  status: 'completed' | 'in-progress' | 'not-started';
  answerCount: number;
  progress: number;
}

export default function HouseholdAssessmentDashboard({ onSelectPerson, onViewReport }: Props) {
  const { people } = useStore();
  const { assessments } = useAssessmentStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);

  // Build enriched person list
  const enrichedPeople: EnrichedPerson[] = useMemo(() => {
    return people.map((person: Person): EnrichedPerson => {
      const data = assessments[person.id] as PersonAssessmentData | undefined;
      const answerCount = data ? Object.keys(data.answers).length : 0;
      let status: 'completed' | 'in-progress' | 'not-started' = 'not-started';
      if (data?.isCompleted) status = 'completed';
      else if (answerCount > 0) status = 'in-progress';

      return { person, data, status, answerCount, progress: Math.round((answerCount / 120) * 100) };
    });
  }, [people, assessments]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = enrichedPeople;
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.data?.completedAt || '').localeCompare(a.data?.completedAt || '');
        case 'oldest':
          return (a.data?.completedAt || '').localeCompare(b.data?.completedAt || '');
        case 'highest-deficiency': {
          const aScores = a.data?.result ? Object.values(a.data.result.deficiencyScores) as number[] : [-1];
          const bScores = b.data?.result ? Object.values(b.data.result.deficiencyScores) as number[] : [-1];
          const aMax = Math.max(...aScores);
          const bMax = Math.max(...bScores);
          return bMax - aMax;
        }
        default:
          return a.person.name.localeCompare(b.person.name);
      }
    });
    return list;
  }, [enrichedPeople, statusFilter, sortBy]);

  const completedPeople = enrichedPeople.filter((p) => p.status === 'completed');
  const stats = {
    total: people.length,
    completed: completedPeople.length,
    inProgress: enrichedPeople.filter((p) => p.status === 'in-progress').length,
    notStarted: enrichedPeople.filter((p) => p.status === 'not-started').length,
  };

  // Combined radar data for family overlay
  const radarData = useMemo(() => {
    if (completedPeople.length < 1) return null;
    const categories: Category[] = ['dopamine', 'acetylcholine', 'gaba', 'serotonin'];
    return categories.map((cat) => {
      const entry: Record<string, any> = { subject: cat.charAt(0).toUpperCase() + cat.slice(1), fullMark: 15 };
      completedPeople.forEach((p) => {
        if (p.data?.result) entry[p.person.name] = p.data.result.natureScores[cat];
      });
      return entry;
    });
  }, [completedPeople]);

  // Combined deficiency comparison
  const defBarData = useMemo(() => {
    if (completedPeople.length < 1) return null;
    const categories: Category[] = ['dopamine', 'acetylcholine', 'gaba', 'serotonin'];
    return categories.map((cat) => {
      const entry: Record<string, any> = { name: cat.charAt(0).toUpperCase() + cat.slice(1) };
      completedPeople.forEach((p) => {
        if (p.data?.result) entry[p.person.name] = p.data.result.deficiencyScores[cat];
      });
      return entry;
    });
  }, [completedPeople]);

  const getNatureIcon = (cat: Category) => {
    switch (cat) {
      case 'dopamine': return <Zap className="w-4 h-4" />;
      case 'acetylcholine': return <Lightbulb className="w-4 h-4" />;
      case 'gaba': return <Shield className="w-4 h-4" />;
      case 'serotonin': return <Heart className="w-4 h-4" />;
    }
  };

  const getDefColor = (score: number) => {
    if (score >= 16) return 'text-red-600 bg-red-50 dark:bg-red-950/30';
    if (score >= 9) return 'text-orange-600 bg-orange-50 dark:bg-orange-950/30';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
    if (score >= 1) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
    return 'text-green-600 bg-green-50 dark:bg-green-950/30';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Family Brain Assessment</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Neurotransmitter profiles for your household</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{stats.total} members</span>
          </div>
        </div>

        {/* Status summary pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">{stats.completed}</p>
              <p className="text-[11px] text-green-600 dark:text-green-500 font-medium">Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{stats.inProgress}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-500 font-medium">In Progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <CircleDashed className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{stats.notStarted}</p>
              <p className="text-[11px] text-gray-500 font-medium">Not Started</p>
            </div>
          </div>
        </div>
      </div>

      {/* Family Neuro Map — Combined Charts */}
      {completedPeople.length >= 2 && radarData && defBarData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Family Neuro Map
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Compare neurotransmitter profiles across your household</p>
          </div>
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Combined Radar */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">Nature Strengths</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    {completedPeople.map((p, i) => (
                      <Radar
                        key={p.person.id}
                        name={p.person.name}
                        dataKey={p.person.name}
                        stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
                        fill={RADAR_COLORS[i % RADAR_COLORS.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Combined Deficiency Bars */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">Deficiency Comparison</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={defBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    {completedPeople.map((p, i) => (
                      <Bar key={p.person.id} dataKey={p.person.name} fill={RADAR_COLORS[i % RADAR_COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))}
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter & Sort
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        <p className="text-sm text-gray-400">{filtered.length} of {people.length} members</p>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 animate-fade-in">
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5"
            >
              <option value="name">Name</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest-deficiency">Highest Deficiency</option>
            </select>
          </div>
        </div>
      )}

      {/* Person Cards */}
      <div className="space-y-4">
        {filtered.map(({ person, data, status, progress }) => {
          const result = data?.result;
          const dominant = result?.dominantNature;
          const primary = result?.primaryDeficiency;
          const maxDef = primary ? result?.deficiencyScores[primary] || 0 : 0;

          return (
            <div
              key={person.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
                    style={{
                      background: status === 'completed' && dominant
                        ? `linear-gradient(135deg, ${NATURE_COLORS[dominant]}, ${NATURE_COLORS[dominant]}99)`
                        : 'linear-gradient(135deg, #94a3b8, #64748b)',
                    }}
                  >
                    {person.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">{person.name}</h4>
                      {person.age && <span className="text-xs text-gray-400">Age {person.age}</span>}
                    </div>

                    {status === 'completed' && dominant && (
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                          style={{ backgroundColor: NATURE_COLORS[dominant] + '20', color: NATURE_COLORS[dominant] }}
                        >
                          {getNatureIcon(dominant)}
                          {NATURE_LABELS[dominant]}
                        </span>
                        {primary && (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getDefColor(maxDef)}`}>
                            {primary.charAt(0).toUpperCase() + primary.slice(1)} Deficiency — {result?.deficiencyLevels[primary]}
                          </span>
                        )}
                        {data?.completedAt && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(data.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}

                    {status === 'in-progress' && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Progress — {progress}% complete</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-48">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}

                    {status === 'not-started' && (
                      <p className="text-xs text-gray-400 mt-1">Has not started the assessment yet</p>
                    )}

                    {/* Mini nature scores for completed */}
                    {status === 'completed' && result && (
                      <div className="flex gap-3 mt-3">
                        {(['dopamine', 'acetylcholine', 'gaba', 'serotonin'] as Category[]).map((cat) => (
                          <div key={cat} className="text-center">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-0.5"
                              style={{ backgroundColor: NATURE_COLORS[cat] + '15', color: NATURE_COLORS[cat] }}
                            >
                              {result.natureScores[cat]}
                            </div>
                            <span className="text-[9px] text-gray-400 uppercase">{cat.slice(0, 4)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {status === 'completed' && (
                      <>
                        <button
                          onClick={() => onViewReport(person.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Report
                        </button>
                        <button
                          onClick={() => onSelectPerson(person.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Retake Assessment"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {status === 'in-progress' && (
                      <button
                        onClick={() => onSelectPerson(person.id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Continue
                      </button>
                    )}
                    {status === 'not-started' && (
                      <button
                        onClick={() => onSelectPerson(person.id)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
                      >
                        <Sparkles className="w-4 h-4" />
                        Start Test
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status bar */}
              {status === 'completed' && (
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${dominant ? NATURE_COLORS[dominant] : '#94a3b8'}, transparent)` }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {people.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Family Members</h3>
          <p className="text-sm text-gray-500">Add family members in the Profile tab to start assessments.</p>
        </div>
      )}
    </div>
  );
}
