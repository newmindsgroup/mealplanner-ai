import React, { useEffect, useState, useRef } from 'react';
import { Clock, DollarSign, HeartPulse, Users, TrendingUp, Award, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Animated counter hook ─────────────────────────────────────────
function useCounter(target: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!active || ran.current) return;
    ran.current = true;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.floor(ease * target));
      if (step >= steps) { clearInterval(timer); setValue(target); }
    }, interval);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return value;
}

// ── Benefit cards ─────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: Clock,
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    lightText: 'text-emerald-600',
    title: 'Save 10+ hours a week',
    desc: 'Stop bouncing between recipes, apps, and grocery aisles. One plan covers the full week in minutes.',
  },
  {
    icon: DollarSign,
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
    title: 'Cut your food bill by $200+/mo',
    desc: 'Pantry-aware lists eliminate duplicate buying. You shop for exactly what you need — nothing more.',
  },
  {
    icon: HeartPulse,
    color: 'bg-pink-500',
    lightBg: 'bg-pink-50',
    lightText: 'text-pink-600',
    title: 'Eat right for your biology',
    desc: 'Blood type-matched meal plans go beyond generic diets — every recommendation is built for your body.',
  },
  {
    icon: Users,
    color: 'bg-violet-500',
    lightBg: 'bg-violet-50',
    lightText: 'text-violet-600',
    title: 'Works for the whole family',
    desc: 'Different blood types under one roof? The app balances everyone\'s needs in a single household plan.',
  },
  {
    icon: TrendingUp,
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-600',
    title: 'See real progress',
    desc: 'Streaks, XP, and health milestones keep you motivated long after the first week.',
  },
  {
    icon: Award,
    color: 'bg-rose-500',
    lightBg: 'bg-rose-50',
    lightText: 'text-rose-600',
    title: 'AI that actually knows nutrition',
    desc: 'Not generic tips — science-backed suggestions tailored to your blood type, goals, and pantry.',
  },
];

// ── Key stats ─────────────────────────────────────────────────────
const STATS = [
  { target: 10,    suffix: '+',  unit: 'hrs/week',  label: 'saved on meal prep'    },
  { target: 200,   prefix: '$',  unit: '+/mo',      label: 'avg grocery savings'   },
  { target: 98,    suffix: '%',  unit: '',           label: 'satisfaction rate'     },
  { target: 10000, suffix: '+',  unit: '',           label: 'meals planned to date' },
];

export default function BenefitsSection() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const c0 = useCounter(STATS[0].target, visible);
  const c1 = useCounter(STATS[1].target, visible);
  const c2 = useCounter(STATS[2].target, visible);
  const c3 = useCounter(STATS[3].target, visible);
  const counters = [c0, c1, c2, c3];

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-4 py-2 rounded-full mb-5 font-semibold text-sm shadow-sm">
            <Award className="w-4 h-4" />
            Why It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Real results, not just{' '}
            <span className="gradient-text">better intentions</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Personalized meal planning that fits how real families eat, shop, and live.
          </p>
        </div>

        {/* ── Animated Stats Row ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 fade-in-section">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="text-3xl font-black text-gray-900 leading-none mb-1">
                {s.prefix ?? ''}{counters[i].toLocaleString()}{s.suffix ?? ''}{s.unit}
              </div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Benefits Grid ──────────────────────────────────── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {BENEFITS.map(({ icon: Icon, color, lightBg, lightText, title, desc }, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover-lift fade-in-section"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className={`w-10 h-10 ${lightBg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${lightText}`} />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2 leading-tight">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonial ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 max-w-3xl mx-auto text-center mb-12 fade-in-section">
          <div className="flex justify-center gap-0.5 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <blockquote className="text-gray-700 text-lg leading-relaxed mb-5 font-medium">
            "This completely changed how we eat. My husband is type O, I'm type A — before this we were just guessing. Now every meal works for both of us and we spend way less at the store."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              SM
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Sarah M.</p>
              <p className="text-xs text-gray-400">Family of 4 · Member for 6 months</p>
            </div>
          </div>
        </div>

        {/* ── Final CTA ──────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-xl fade-in-section" style={{
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 40%, #8b5cf6 80%, #ec4899 100%)',
        }}>
          <div className="px-8 py-14 md:py-16 text-center">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Start your health journey today
            </h3>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Blood type-compatible meal planning, smart grocery lists, and AI guidance — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl group"
              >
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/25 transition-all"
              >
                Sign in
              </button>
            </div>
            <p className="text-white/60 text-sm mt-6 tracking-wide">
              ✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 5 minutes &nbsp;·&nbsp; ✓ Cancel anytime
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
