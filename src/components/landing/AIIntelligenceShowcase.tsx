/**
 * AIIntelligenceShowcase — Phase 12
 * Premium section highlighting the NourishAI multi-agent intelligence layer.
 * Showcases the 6 intelligence domains with animated cards and visual hierarchy.
 */
import React from 'react';
import {
  Activity, Brain, Dumbbell, Apple, Shield, Sparkles,
  FlaskConical, Zap, FileText, Users, TrendingUp, Heart,
} from 'lucide-react';

const intelligenceModules = [
  {
    icon: FlaskConical,
    title: 'Lab Intelligence',
    subtitle: 'Deep Biomarker Analysis',
    description: 'Upload lab reports and receive AI-powered analysis with PubMed citations, trend charts, and optimized nutrition recommendations.',
    capabilities: ['USDA-verified nutrition', 'Trend analysis charts', 'PDF lab reports'],
    gradient: 'from-rose-500 to-red-600',
    bgGlow: 'bg-rose-500/10',
    delay: 0,
  },
  {
    icon: Brain,
    title: 'Neuro Intelligence',
    subtitle: 'Braverman Assessment',
    description: 'Complete neurotransmitter profiling with research-backed recovery protocols, supplement stacking, and drug interaction safety checks.',
    capabilities: ['Neurotransmitter mapping', 'Recovery protocols', 'Interaction safety'],
    gradient: 'from-purple-500 to-violet-600',
    bgGlow: 'bg-purple-500/10',
    delay: 0.1,
  },
  {
    icon: Apple,
    title: 'Meal Intelligence',
    subtitle: 'USDA-Verified Nutrition',
    description: 'AI-generated weekly meal plans cross-referenced with FoodData Central and optimized for your blood type compatibility.',
    capabilities: ['Blood type matching', 'Grocery list PDF', 'Recipe generation'],
    gradient: 'from-emerald-500 to-green-600',
    bgGlow: 'bg-emerald-500/10',
    delay: 0.2,
  },
  {
    icon: Dumbbell,
    title: 'Fitness Intelligence',
    subtitle: 'Progressive Training',
    description: 'AI-designed workout plans with plateau detection, strength curve analysis, exercise form guides, and monthly progress reports.',
    capabilities: ['Plateau detection', 'Form demonstrations', 'Monthly PDF reports'],
    gradient: 'from-orange-500 to-amber-600',
    bgGlow: 'bg-orange-500/10',
    delay: 0.3,
  },
  {
    icon: Shield,
    title: 'Health Reports',
    subtitle: 'Cross-Domain Analysis',
    description: 'Comprehensive health intelligence that correlates data across labs, neuro, fitness, and nutrition for unified recommendations.',
    capabilities: ['Doctor visit prep', 'Family comparison', 'Statistical correlation'],
    gradient: 'from-indigo-500 to-blue-600',
    bgGlow: 'bg-indigo-500/10',
    delay: 0.4,
  },
  {
    icon: Users,
    title: 'Family Intelligence',
    subtitle: 'Household Health',
    description: 'Manage every family member\'s health data independently. Compare profiles, track shared goals, and optimize household nutrition.',
    capabilities: ['Multi-person tracking', 'Comparison reports', 'Shared meal plans'],
    gradient: 'from-cyan-500 to-teal-600',
    bgGlow: 'bg-cyan-500/10',
    delay: 0.5,
  },
];

const agentCards = [
  { name: 'Nourish Orchestrator', role: 'Routes complex queries to the right specialist agent', icon: '🎯' },
  { name: 'Health Research Agent', role: 'Searches PubMed and clinical databases', icon: '🔬' },
  { name: 'Health Analytics Agent', role: 'Statistical analysis with matplotlib/pandas', icon: '📊' },
  { name: 'Health Report Generator', role: 'Professional PDFs and documents', icon: '📄' },
  { name: 'Health Visual Agent', role: 'Food photography and health visuals', icon: '🎨' },
  { name: 'Exercise Demo Agent', role: 'Proper form and movement tutorials', icon: '🏋️' },
  { name: 'Health Presentation Agent', role: 'Slide decks for providers', icon: '📽️' },
  { name: 'Health Assistant', role: 'Natural language health Q&A', icon: '💬' },
];

export default function AIIntelligenceShowcase() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 via-gray-950 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 px-5 py-2 rounded-full mb-6 font-semibold text-sm backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Powered by 8 Specialized AI Agents
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            NourishAI <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">Intelligence</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            A multi-agent AI swarm that analyzes your health data across every domain —
            labs, neurotransmitters, fitness, and nutrition — to deliver evidence-based,
            personalized recommendations you can actually trust.
          </p>
        </div>

        {/* Intelligence Module Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {intelligenceModules.map((module, idx) => (
            <div
              key={module.title}
              className="fade-in-section group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/80 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5"
              style={{ animationDelay: `${module.delay}s` }}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 ${module.bgGlow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-1">{module.title}</h3>
                <p className={`text-sm font-medium bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent mb-3`}>
                  {module.subtitle}
                </p>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {module.description}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-2">
                  {module.capabilities.map(cap => (
                    <span
                      key={cap}
                      className="text-[11px] px-2.5 py-1 bg-gray-700/50 text-gray-300 rounded-full border border-gray-600/30 font-medium"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Swarm Architecture */}
        <div className="fade-in-section">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              8 Specialized Health Agents Working Together
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Every complex query is routed to the right specialist. Each agent has access to medical databases,
              USDA nutrition data, and drug interaction checkers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {agentCards.map((agent, idx) => (
              <div
                key={agent.name}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/40 rounded-xl p-4 text-center hover:bg-gray-800/60 transition-all group"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">{agent.icon}</div>
                <p className="text-sm font-bold text-white mb-1 leading-tight">{agent.name}</p>
                <p className="text-[10px] text-gray-500 leading-snug">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 fade-in-section">
          {[
            { value: '8', label: 'AI Agents', icon: Zap },
            { value: '15+', label: 'Task Types', icon: FileText },
            { value: '18', label: 'Biomarkers', icon: Activity },
            { value: '100%', label: 'Evidence-Based', icon: TrendingUp },
          ].map(stat => (
            <div key={stat.label} className="text-center bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
              <stat.icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
