import React, { useState, useEffect } from 'react';
import {
  Dumbbell, Zap, Target, Camera, TrendingUp, ChevronRight,
  Calendar, Flame, Trophy, Plus, CheckCircle, Clock, BarChart2,
  MessageSquare, Droplets, Users,
} from 'lucide-react';
import { getFitnessProfile, getCurrentWorkoutPlan, getMeasurements, getPersonalRecords, getSessions } from '../../services/fitnessService';
import type { FitnessProfile, WorkoutPlan, BodyMeasurement, PersonalRecord } from '../../services/fitnessService';
import { useStore } from '../../store/useStore';
import type { Person } from '../../types';
import FitnessOnboarding from './FitnessOnboarding';
import BodyAnalysis from './BodyAnalysis';
import WorkoutPlanView from './WorkoutPlanView';
import ProgressView from './ProgressView';
import AiCoachChat from './AiCoachChat';
import WaterTracker from './WaterTracker';
import StreakCalendar from './StreakCalendar';
import FamilyMemberPicker from './FamilyMemberPicker';
import FamilyLeaderboard from './FamilyLeaderboard';
import EnergyBalance from './EnergyBalance';
import SessionCompleteModal from './SessionCompleteModal';
import ProgressCharts from './ProgressCharts';
import WorkoutLibrary from './WorkoutLibrary';
import WeeklyCheckIn from './WeeklyCheckIn';
import CustomPlanBuilder from './CustomPlanBuilder';
import NutritionFitnessBridge from './NutritionFitnessBridge';

type FitnessTab = 'dashboard' | 'plan' | 'body-analysis' | 'progress' | 'coach' | 'hydration' | 'leaderboard' | 'library' | 'checkin' | 'builder' | 'nutrition';

export default function FitnessDashboard() {
  const { people } = useStore();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [activeTab, setActiveTab] = useState<FitnessTab>('dashboard');
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [sessions, setSessions] = useState<{ completed_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-select first person when people load
  useEffect(() => {
    if (people.length > 0 && !selectedPerson) {
      setSelectedPerson(people[0]);
    }
  }, [people]);

  // Reload data whenever selected person changes
  useEffect(() => {
    loadData();
  }, [selectedPerson?.id]);

  const personId = selectedPerson?.id;

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, planRes, measRes, recRes, sessRes] = await Promise.all([
        getFitnessProfile(personId).catch(() => ({ data: null })),
        getCurrentWorkoutPlan(personId).catch(() => ({ data: null })),
        getMeasurements().catch(() => ({ data: [] })),
        getPersonalRecords().catch(() => ({ data: [] })),
        getSessions(personId).catch(() => ({ data: [] })),
      ]);
      setProfile(profileRes.data);
      setPlan(planRes.data);
      setMeasurements(measRes.data || []);
      setRecords(recRes.data || []);
      setSessions(((sessRes.data as any[]) || []).filter((s) => s.completed_at));
      if (!profileRes.data) setShowOnboarding(true);
      else setShowOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  // Today's workout from plan
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayWorkout = plan?.days?.find(d => d.dayOfWeek === todayName);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <Dumbbell className="w-5 h-5 animate-pulse" />
          <span>Loading your fitness data…</span>
        </div>
      </div>
    );
  }

  if (showOnboarding && !profile) {
    return (
      <FitnessOnboarding
        onComplete={(savedProfile) => {
          setProfile(savedProfile);
          setShowOnboarding(false);
        }}
        personId={personId}
        personName={selectedPerson?.name}
        onCancel={people.length > 0 ? () => setShowOnboarding(false) : undefined}
      />
    );
  }

  const goalLabel: Record<string, string> = {
    weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain',
    endurance: 'Endurance', flexibility: 'Flexibility', general_health: 'General Health',
  };

  const navTabs = [
    { id: 'dashboard' as FitnessTab, label: 'Home', icon: BarChart2 },
    { id: 'plan' as FitnessTab, label: 'My Plan', icon: Calendar },
    { id: 'builder' as FitnessTab, label: 'Build', icon: Plus },
    { id: 'library' as FitnessTab, label: 'Library', icon: Dumbbell },
    { id: 'coach' as FitnessTab, label: 'Coach', icon: MessageSquare },
    { id: 'body-analysis' as FitnessTab, label: 'Body', icon: Camera },
    { id: 'nutrition' as FitnessTab, label: 'Nutrition', icon: Target },
    { id: 'hydration' as FitnessTab, label: 'Water', icon: Droplets },
    { id: 'progress' as FitnessTab, label: 'Progress', icon: TrendingUp },
    { id: 'leaderboard' as FitnessTab, label: 'Rank', icon: Trophy },
    { id: 'checkin' as FitnessTab, label: 'Check-In', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header card — member switcher + title */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {selectedPerson ? `${selectedPerson.name.split(' ')[0]}'s Fitness` : 'Fitness'}
              </h1>
              <p className="text-xs text-gray-500">
                {profile?.primary_goal ? goalLabel[profile.primary_goal] : 'Set up a fitness profile to get started'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {people.length > 1 && (
              <FamilyMemberPicker
                selectedPersonId={selectedPerson?.id || null}
                onSelect={(p) => { setSelectedPerson(p); setActiveTab('dashboard'); }}
                compact
              />
            )}
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-xs text-gray-400 hover:text-orange-600 flex items-center gap-1 transition-colors ml-1"
            >
              {profile ? 'Edit' : 'Setup'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        {people.length > 1 && (
          <FamilyMemberPicker
            selectedPersonId={selectedPerson?.id || null}
            onSelect={(p) => { setSelectedPerson(p); setActiveTab('dashboard'); }}
          />
        )}
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {navTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <DashboardOverview
          profile={profile}
          todayWorkout={todayWorkout}
          measurements={measurements}
          records={records}
          plan={plan}
          sessions={sessions}
          personId={personId}
          onSetupProfile={() => setShowOnboarding(true)}
          onGoToPlan={() => setActiveTab('plan')}
          onGoToAnalysis={() => setActiveTab('body-analysis')}
          onGoToCoach={() => setActiveTab('coach')}
          onGoToLeaderboard={() => setActiveTab('leaderboard')}
          onPlanGenerated={(p) => setPlan(p)}
        />
      )}
      {activeTab === 'plan' && (
        <WorkoutPlanView plan={plan} onPlanGenerated={(p) => setPlan(p)} profile={profile} />
      )}
      {activeTab === 'coach' && <AiCoachChat />}
      {activeTab === 'body-analysis' && (
        <BodyAnalysis onAnalysisComplete={() => loadData()} />
      )}
      {activeTab === 'hydration' && (
        <div className="max-w-md mx-auto pt-2">
          <WaterTracker />
        </div>
      )}
      {activeTab === 'progress' && (
        <ProgressCharts
          measurements={measurements}
          records={records}
          personId={personId}
          personName={selectedPerson?.name}
        />
      )}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <FamilyLeaderboard />
        </div>
      )}
      {activeTab === 'library' && (
        <WorkoutLibrary />
      )}
      {activeTab === 'checkin' && (
        <WeeklyCheckIn
          personId={personId}
          personName={selectedPerson?.name}
          inline
          onComplete={() => loadData()}
        />
      )}
      {activeTab === 'builder' && (
        <CustomPlanBuilder
          personId={personId}
          personName={selectedPerson?.name}
          onPlanSaved={(p) => { setPlan(p?.plan_data ?? p); setActiveTab('plan'); }}
        />
      )}
      {activeTab === 'nutrition' && (
        <NutritionFitnessBridge
          profile={profile}
          todayIsWorkoutDay={!!todayWorkout && todayWorkout.type !== 'Rest'}
          personName={selectedPerson?.name}
        />
      )}

      {/* Onboarding overlay */}
      {showOnboarding && profile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <FitnessOnboarding
              initialProfile={profile}
              onComplete={(saved) => { setProfile(saved); setShowOnboarding(false); }}
              onCancel={() => setShowOnboarding(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard Overview ─────────────────────────────────────────────────────────
function DashboardOverview({
  profile, todayWorkout, measurements, records, plan, sessions,
  personId,
  onSetupProfile, onGoToPlan, onGoToAnalysis, onGoToCoach, onGoToLeaderboard, onPlanGenerated,
}: {
  profile: FitnessProfile | null;
  todayWorkout?: import('../../services/fitnessService').WorkoutDay;
  measurements: BodyMeasurement[];
  records: PersonalRecord[];
  plan: WorkoutPlan | null;
  sessions: { completed_at: string }[];
  personId?: string;
  onSetupProfile: () => void;
  onGoToPlan: () => void;
  onGoToAnalysis: () => void;
  onGoToCoach: () => void;
  onGoToLeaderboard: () => void;
  onPlanGenerated: (p: WorkoutPlan) => void;
}) {
  const [generating, setGenerating] = useState(false);

  const latestWeight = measurements[0]?.weight_kg;
  const prevWeight = measurements[1]?.weight_kg;
  const weightDelta = latestWeight && prevWeight ? (latestWeight - prevWeight).toFixed(1) : null;

  // Streak from completed sessions
  const { calculateStreak } = require('../../services/fitnessUtils');
  const completedDates = sessions.map((s: any) => (s.completed_at || '').slice(0, 10)).filter(Boolean);
  const streak = calculateStreak(completedDates);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const { generateWorkoutPlan } = await import('../../services/fitnessService');
      const res = await generateWorkoutPlan();
      if (res.data) onPlanGenerated(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: Flame, color: 'text-orange-500 bg-orange-50',
            label: 'Streak', value: `${streak}`, sub: 'days',
          },
          {
            icon: Trophy, color: 'text-yellow-500 bg-yellow-50',
            label: 'PRs Set', value: String(records.length), sub: 'all time',
          },
          {
            icon: Target, color: 'text-violet-500 bg-violet-50',
            label: 'Goal', value: profile?.primary_goal?.replace('_', ' ') || '—', sub: '',
          },
          {
            icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50',
            label: 'Weight', value: latestWeight ? `${latestWeight} kg` : '—',
            sub: weightDelta ? `${Number(weightDelta) > 0 ? '+' : ''}${weightDelta} kg` : 'not tracked',
          },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white leading-none capitalize">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label} {sub && `· ${sub}`}</div>
          </div>
        ))}
      </div>

      {/* Today's workout card */}
      <div className={`rounded-2xl p-6 ${
        todayWorkout
          ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
      }`}>
        {todayWorkout ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-5 h-5 text-white/80" />
              <span className="text-sm font-semibold text-white/80">Today's Session</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-1">{todayWorkout.name}</h3>
            <p className="text-white/70 text-sm mb-4">
              {todayWorkout.type} · {todayWorkout.duration_min} min · {todayWorkout.exercises?.length || 0} exercises
            </p>
            <div className="flex gap-3">
              <button
                onClick={onGoToPlan}
                className="flex-1 bg-white text-orange-600 font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-orange-50 transition-colors"
              >
                Start Session →
              </button>
              {todayWorkout.recoveryMeal && (
                <div className="text-xs text-white/70 flex items-center gap-1">
                  <span>🍽</span> {todayWorkout.recoveryMeal.split(',')[0]}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">No workout plan yet</p>
            <p className="text-gray-400 text-sm mb-4">Generate your personalized AI workout plan to get started</p>
            {profile ? (
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="bg-orange-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center gap-2 mx-auto"
              >
                {generating ? (
                  <><Zap className="w-4 h-4 animate-spin" /> Generating…</>
                ) : (
                  <><Zap className="w-4 h-4" /> Generate My Plan</>
                )}
              </button>
            ) : (
              <button onClick={onSetupProfile} className="bg-orange-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-orange-600 transition-colors">
                Set Up Fitness Profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick action cards */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          {
            icon: Camera, color: 'bg-violet-50 text-violet-600',
            title: 'Body Analysis',
            desc: 'Upload a photo for AI body composition analysis',
            action: onGoToAnalysis,
          },
          {
            icon: MessageSquare, color: 'bg-orange-50 text-orange-600',
            title: 'Ask AI Coach',
            desc: 'Get personalized advice from your AI fitness coach',
            action: onGoToCoach,
          },
          {
            icon: Trophy, color: 'bg-yellow-50 text-yellow-600',
            title: 'Leaderboard',
            desc: 'See how your family ranks in fitness this week',
            action: onGoToLeaderboard,
          },
        ].map(({ icon: Icon, color, title, desc, action }) => (
          <button
            key={title}
            onClick={action}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-left hover:shadow-md transition-all group"
          >
            <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-orange-600 transition-colors">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {/* Streak Calendar */}
      <StreakCalendar
        completedSessionDates={completedDates}
        totalXP={completedDates.length * 50}
      />

      {/* Energy Balance */}
      <EnergyBalance personId={personId} />
    </div>
  );
}
