import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Check, Download, Share2, Zap,
  MapPin, Clock, Sparkles, ChevronRight, RefreshCw,
  ArrowRight, Leaf, Package, AlertTriangle, CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';

// ─── Config ──────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'proteins',   label: 'Proteins',   emoji: '🥩', color: 'from-red-400 to-pink-500',     aisleLabel: 'Meat & Seafood',  aisle: 4 },
  { id: 'vegetables', label: 'Vegetables', emoji: '🥦', color: 'from-emerald-400 to-green-500', aisleLabel: 'Produce',         aisle: 1 },
  { id: 'grains',     label: 'Grains',     emoji: '🌾', color: 'from-amber-400 to-yellow-500',  aisleLabel: 'Bread & Cereals', aisle: 7 },
  { id: 'fruits',     label: 'Fruits',     emoji: '🍇', color: 'from-purple-400 to-pink-500',   aisleLabel: 'Produce',         aisle: 1 },
];

// Items that pantry already covers (demo: olive oil + quinoa partial)
const PANTRY_COVERED: Record<string, string> = {
  'g24': 'In pantry',
  'g15': 'Partial stock',
};

// Blood type tags for demo items
const BLOOD_TYPE_TAGS: Record<string, { label: string; compatible: boolean }> = {
  'g1':  { label: 'A+', compatible: true  },
  'g4':  { label: 'A+', compatible: true  },
  'g5':  { label: 'A+', compatible: true  },
  'g15': { label: 'A+', compatible: true  },
  'g16': { label: 'A+', compatible: false },
};

// ─── Animated Counter ─────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCurrent(Math.round(ease * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{current}{suffix}</span>;
}

// ─── How It Works Flow ────────────────────────────────────────────
const FLOW_STEPS = [
  { icon: '🗓️', label: 'Meal Plan',     sub: 'Your weekly menu'  },
  { icon: '🤖', label: 'AI Processing', sub: 'Extracts every item' },
  { icon: '🏪', label: 'Pantry Check',  sub: 'Removes what you have' },
  { icon: '✅', label: 'Smart List',    sub: 'Ready in seconds' },
];

// ─── Main Component ───────────────────────────────────────────────
export default function DemoGroceryList() {
  const { groceryList, toggleGroceryItem } = useDemo();
  const [activeCategory, setActiveCategory] = useState('proteins');
  const [generating, setGenerating] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);

  const activeGroup = CATEGORIES.find(c => c.id === activeCategory) ?? CATEGORIES[0];
  const activeItems = groceryList.items
    .filter(item => item.category === activeCategory)
    .slice(0, 4);

  const checkedCount = groceryList.items.filter(i => i.checked).length;
  const totalCount   = groceryList.items.length;
  const progress     = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Pantry savings: items covered by pantry
  const pantrySkipped = Object.keys(PANTRY_COVERED).length;
  const estimatedSaved = pantrySkipped * 6; // ~$6 avg per item

  const handleGenerate = () => {
    setGenerating(true);
    setJustGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setJustGenerated(true);
      setTimeout(() => setJustGenerated(false), 3000);
    }, 1800);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="text-center mb-14 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <ShoppingCart className="w-4 h-4" />
            Smart Shopping
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="gradient-text-green">Grocery Lists That Think</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Generated in seconds from your meal plan — pantry-aware, aisle-sorted, and blood-type compatible.
          </p>
        </div>

        {/* ── How It Works Pipeline ─────────────────────────── */}
        <div className="flex items-center justify-center gap-0 mb-12 fade-in-section overflow-x-auto pb-2">
          {FLOW_STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center text-center min-w-[100px]">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-2xl mb-2 hover-lift">
                  {step.icon}
                </div>
                <p className="text-xs font-bold text-gray-800">{step.label}</p>
                <p className="text-xs text-gray-400">{step.sub}</p>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className="flex items-center px-1 mb-6">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-gray-200 to-emerald-300" />
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 -ml-1 flex-shrink-0" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Main Two-Column ───────────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-8 items-start max-w-6xl mx-auto fade-in-section">

          {/* LEFT: Interactive List Preview (3/5) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{groceryList.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{checkedCount}/{totalCount} items · auto-generated</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Regenerate button with animation */}
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      generating
                        ? 'bg-emerald-100 text-emerald-600 cursor-wait'
                        : justGenerated
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {generating ? (
                      <><RefreshCw className="w-3 h-3 animate-spin" /> Generating…</>
                    ) : justGenerated ? (
                      <><CheckCircle2 className="w-3 h-3" /> Done!</>
                    ) : (
                      <><Zap className="w-3 h-3" /> Regenerate</>
                    )}
                  </button>
                  <button className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Share">
                    <Share2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Export PDF">
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-5 pt-3 pb-1">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Shopping progress</span>
                  <span className="font-semibold text-emerald-600">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Pantry Deduction Banner */}
              <div className="mx-5 mt-3 mb-1 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  <span className="font-bold">{pantrySkipped} items removed</span> — already in your pantry · saving ~<span className="font-bold">${estimatedSaved}</span>
                </p>
                <TrendingDown className="w-3.5 h-3.5 text-blue-400 ml-auto flex-shrink-0" />
              </div>

              {/* Category Tabs */}
              <div className="flex gap-1.5 px-5 pt-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm scale-105'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span className="hidden sm:inline">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Aisle Indicator */}
              <div className="flex items-center gap-2 px-5 pt-2.5 pb-1">
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  <MapPin className="w-3 h-3" />
                  Aisle {activeGroup.aisle} · {activeGroup.aisleLabel}
                </div>
              </div>

              {/* Item List */}
              <div className="px-5 pb-3 pt-1 space-y-0.5">
                {activeItems.map(item => {
                  const pantryTag = PANTRY_COVERED[item.id];
                  const bloodTag  = BLOOD_TYPE_TAGS[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => !pantryTag && toggleGroceryItem(item.id)}
                      disabled={!!pantryTag}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-left ${
                        pantryTag
                          ? 'opacity-40 cursor-default'
                          : item.checked
                          ? 'opacity-50 hover:bg-gray-50'
                          : 'hover:bg-emerald-50 cursor-pointer'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        pantryTag
                          ? 'bg-gray-200 border-gray-300'
                          : item.checked
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-300 bg-white group-hover:border-emerald-400'
                      }`}>
                        {(item.checked || pantryTag) && (
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        )}
                      </div>

                      {/* Name + qty */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold truncate ${item.checked || pantryTag ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-gray-400">{item.quantity}</span>
                          {pantryTag && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">
                              📦 {pantryTag}
                            </span>
                          )}
                          {bloodTag && !pantryTag && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              bloodTag.compatible
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {bloodTag.compatible ? '✓' : '⚠'} {bloodTag.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Aisle chip */}
                      {item.aisle && !pantryTag && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex-shrink-0 hidden sm:block">
                          {item.aisle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* More items nudge */}
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-xs text-emerald-700">
                    <Leaf className="w-3.5 h-3.5" />
                    <span><strong>{totalCount - CATEGORIES.length * 4}+ more items</strong> across 5 additional sections</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Stats + Features (2/5) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Animated Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap,        color: 'text-amber-500',   bg: 'bg-amber-50',   target: 2,  suffix: 'min', label: 'to generate'     },
                { icon: MapPin,     color: 'text-blue-500',    bg: 'bg-blue-50',    target: 9,  suffix: '',    label: 'store sections'  },
                { icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-emerald-50', target: 45, suffix: '%',   label: 'pantry savings'  },
                { icon: RefreshCw,  color: 'text-purple-500',  bg: 'bg-purple-50',  target: 32, suffix: '',    label: 'items managed'   },
              ].map(({ icon: Icon, color, bg, target, suffix, label }) => (
                <div key={label} className={`${bg} rounded-xl p-3.5 border border-white shadow-sm`}>
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <div className={`text-xl font-black ${color}`}>
                    <AnimatedNumber target={target} suffix={suffix} />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{label}</div>
                </div>
              ))}
            </div>

            {/* Feature List */}
            {[
              {
                icon: Sparkles,
                color: 'from-emerald-400 to-green-500',
                title: 'Generated from your plan',
                desc: 'Every ingredient from every meal — de-duped, consolidated, and ready in under 2 minutes.',
              },
              {
                icon: Package,
                color: 'from-blue-400 to-cyan-500',
                title: 'Subtracts your pantry',
                desc: 'Items you already have at home are automatically removed. No duplicate buying.',
              },
              {
                icon: MapPin,
                color: 'from-violet-400 to-purple-500',
                title: 'Sorted by aisle',
                desc: 'Produce → proteins → grains → dairy — you shop the store in a single efficient pass.',
              },
              {
                icon: Leaf,
                color: 'from-pink-400 to-rose-500',
                title: 'Blood type aware',
                desc: 'Items incompatible with your blood type are flagged so you shop with confidence.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex gap-3.5 items-start">
                <div className={`flex-shrink-0 w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-tight mb-0.5">{title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            {/* Compatibility Legend */}
            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
              <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                Blood Type A+ Compatibility
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">✓ Beneficial</span>
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">○ Neutral</span>
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">⚠ Avoid</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Items are tagged as you add them to your list.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
