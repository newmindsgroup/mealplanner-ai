import React from 'react';
import { ShoppingCart, Check, MapPin, Package, Leaf, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Static preview items — hand-picked to tell the best story ──
const PREVIEW_ITEMS = [
  { name: 'Wild Salmon Fillets',  qty: '12 oz',      aisle: 'Seafood',  tag: { label: '✓ A+', ok: true  }, checked: false },
  { name: 'Fresh Asparagus',      qty: '2 bunches',  aisle: 'Produce',  tag: { label: '✓ A+', ok: true  }, checked: false },
  { name: 'Quinoa',               qty: '1 lb',       aisle: 'Grains',   tag: null,                          checked: true  },
  { name: 'Olive Oil',            qty: '1 bottle',   aisle: null,       tag: null,                          pantry: true   },
  { name: 'Broccoli Florets',     qty: '4 cups',     aisle: 'Produce',  tag: { label: '✓ A+', ok: true  }, checked: false },
];

const BENEFITS = [
  {
    icon: ShoppingCart,
    color: 'text-emerald-600',
    title: 'Auto-generated from your meal plan',
    desc: 'Every ingredient, de-duped and quantified — ready in seconds.',
  },
  {
    icon: Package,
    color: 'text-blue-500',
    title: 'Pantry-aware — skip what you have',
    desc: 'Items already at home are removed automatically. No duplicate buying.',
  },
  {
    icon: MapPin,
    color: 'text-violet-500',
    title: 'Sorted by store aisle',
    desc: 'Shop in one efficient pass — produce, proteins, dairy, done.',
  },
  {
    icon: Leaf,
    color: 'text-pink-500',
    title: 'Blood type tagged',
    desc: 'Every item flagged for compatibility with your blood type.',
  },
];

export default function DemoGroceryList() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* ── Two-column: UI mockup left, benefits right ── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — Minimal app UI snapshot */}
          <div className="fade-in-section">
            {/* Label */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold mb-5">
              <ShoppingCart className="w-3.5 h-3.5" />
              Smart Shopping
            </div>

            {/* App window chrome */}
            <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-white">

              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-400 font-medium">Weekly Shopping List · 32 items</span>
                <div className="ml-auto text-xs text-emerald-600 font-semibold">3 saved from pantry ✓</div>
              </div>

              {/* Section header row */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥦</span>
                  <span className="text-sm font-bold text-gray-800">Produce</span>
                  <span className="text-xs text-gray-400 ml-1">Aisle 1</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-semibold">5 items</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {PREVIEW_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                      item.pantry ? 'bg-blue-50/40' : item.checked ? 'bg-gray-50/60' : 'bg-white'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`flex-shrink-0 w-4.5 h-4.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.pantry
                        ? 'border-blue-300 bg-blue-100'
                        : item.checked
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-300'
                    }`}>
                      {(item.checked || item.pantry) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${
                        item.pantry || item.checked ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">{item.qty}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.pantry && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-medium">📦 pantry</span>
                      )}
                      {item.aisle && !item.pantry && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{item.aisle}</span>
                      )}
                      {item.tag && !item.pantry && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                          item.tag.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {item.tag.label}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom summary bar */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-xs text-gray-500">+ 27 more items across 8 sections</span>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-medium text-emerald-600">~$14 saved</span>
                  <span>·</span>
                  <span>Share</span>
                  <span>·</span>
                  <span>Export PDF</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Headline + benefits + CTA */}
          <div className="fade-in-section">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Your grocery list,{' '}
              <span className="gradient-text-green">done before you leave the house</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Generated instantly from your weekly meal plan — with your pantry and blood type already factored in.
            </p>

            {/* Benefit bullets */}
            <ul className="space-y-5 mb-10">
              {BENEFITS.map(({ icon: Icon, color, title, desc }) => (
                <li key={title} className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-100 group"
            >
              Generate my first list
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-xs text-gray-400 mt-3">Free to start · no credit card required</p>
          </div>
        </div>
      </div>
    </section>
  );
}
