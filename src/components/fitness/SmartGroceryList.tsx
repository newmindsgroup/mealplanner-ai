/**
 * SmartGroceryList — Phase 10 Batch B
 * Goal-based grocery list grouped by store aisle.
 */
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Check, ChevronDown, Sparkles, Loader2, Printer, Plus, Minus, Trash2 } from 'lucide-react';

interface GroceryItem { name: string; amount: string; category: string; checked: boolean; }

const CAT_ORDER = ['Produce','Proteins','Dairy & Eggs','Grains & Bread','Canned & Dried','Oils & Condiments','Frozen','Snacks','Other'];
const CAT_EMOJI: Record<string,string> = { Produce:'🥬', Proteins:'🥩', 'Dairy & Eggs':'🥚', 'Grains & Bread':'🍞', 'Canned & Dried':'🥫', 'Oils & Condiments':'🫒', Frozen:'🧊', Snacks:'🥜', Other:'📦' };

const HP_LIST: GroceryItem[] = [
  { name:'Chicken breast', amount:'1.5 lbs', category:'Proteins', checked:false },
  { name:'Salmon fillets', amount:'1 lb', category:'Proteins', checked:false },
  { name:'Ground turkey', amount:'1 lb', category:'Proteins', checked:false },
  { name:'Eggs (dozen)', amount:'1', category:'Dairy & Eggs', checked:false },
  { name:'Greek yogurt', amount:'32 oz', category:'Dairy & Eggs', checked:false },
  { name:'Sweet potatoes', amount:'4', category:'Produce', checked:false },
  { name:'Broccoli', amount:'2 heads', category:'Produce', checked:false },
  { name:'Spinach', amount:'1 bag', category:'Produce', checked:false },
  { name:'Avocados', amount:'3', category:'Produce', checked:false },
  { name:'Bananas', amount:'1 bunch', category:'Produce', checked:false },
  { name:'Brown rice', amount:'2 lbs', category:'Grains & Bread', checked:false },
  { name:'Quinoa', amount:'1 lb', category:'Grains & Bread', checked:false },
  { name:'Oats (rolled)', amount:'42 oz', category:'Grains & Bread', checked:false },
  { name:'Olive oil', amount:'1 bottle', category:'Oils & Condiments', checked:false },
  { name:'Almond butter', amount:'1 jar', category:'Oils & Condiments', checked:false },
  { name:'Black beans (canned)', amount:'3 cans', category:'Canned & Dried', checked:false },
  { name:'Almonds', amount:'1 lb', category:'Snacks', checked:false },
  { name:'Whey protein', amount:'1 bag', category:'Other', checked:false },
];

const BAL_LIST: GroceryItem[] = [
  { name:'Chicken thighs', amount:'2 lbs', category:'Proteins', checked:false },
  { name:'Tofu (firm)', amount:'14 oz', category:'Proteins', checked:false },
  { name:'Eggs (dozen)', amount:'1', category:'Dairy & Eggs', checked:false },
  { name:'Milk', amount:'1 gallon', category:'Dairy & Eggs', checked:false },
  { name:'Cheese', amount:'8 oz', category:'Dairy & Eggs', checked:false },
  { name:'Mixed greens', amount:'1 box', category:'Produce', checked:false },
  { name:'Tomatoes', amount:'4', category:'Produce', checked:false },
  { name:'Onions', amount:'3', category:'Produce', checked:false },
  { name:'Garlic', amount:'1 head', category:'Produce', checked:false },
  { name:'Berries', amount:'1 pint', category:'Produce', checked:false },
  { name:'Pasta (whole grain)', amount:'1 lb', category:'Grains & Bread', checked:false },
  { name:'Jasmine rice', amount:'2 lbs', category:'Grains & Bread', checked:false },
  { name:'Tortillas', amount:'1 pack', category:'Grains & Bread', checked:false },
  { name:'Soy sauce', amount:'1 bottle', category:'Oils & Condiments', checked:false },
  { name:'Diced tomatoes (canned)', amount:'2 cans', category:'Canned & Dried', checked:false },
  { name:'Chickpeas (canned)', amount:'2 cans', category:'Canned & Dried', checked:false },
];

interface Props { fitnessGoal?: string; personName?: string; }

export default function SmartGroceryList({ fitnessGoal, personName }: Props) {
  const tpl = fitnessGoal === 'muscle_gain' ? HP_LIST : BAL_LIST;
  const [items, setItems] = useState<GroceryItem[]>(tpl);
  const [newItem, setNewItem] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCheck = (i: number) => setItems(p => p.map((it, j) => j === i ? { ...it, checked: !it.checked } : it));
  const removeItem = (i: number) => setItems(p => p.filter((_, j) => j !== i));
  const addItem = () => { if (!newItem.trim()) return; setItems(p => [...p, { name: newItem.trim(), amount: '', category: 'Other', checked: false }]); setNewItem(''); };
  const toggleCat = (c: string) => setCollapsed(p => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n; });

  const grouped = useMemo(() => {
    const m = new Map<string, { items: GroceryItem[]; idx: number[] }>();
    items.forEach((it, i) => { const c = it.category || 'Other'; if (!m.has(c)) m.set(c, { items: [], idx: [] }); m.get(c)!.items.push(it); m.get(c)!.idx.push(i); });
    return CAT_ORDER.filter(c => m.has(c)).map(c => ({ cat: c, ...m.get(c)! }));
  }, [items]);

  const checked = items.filter(i => i.checked).length;

  const download = () => {
    const txt = grouped.map(g => `\n${CAT_EMOJI[g.cat]||'📦'} ${g.cat}\n${g.items.map(i => `  ${i.checked?'✅':'⬜'} ${i.amount} ${i.name}`).join('\n')}`).join('\n');
    const b = new Blob([`${personName||'My'} Grocery List\n${'='.repeat(30)}${txt}\n`], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'grocery-list.txt'; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Smart Grocery List</h2>
            <p className="text-[11px] text-gray-400">{checked}/{items.length} items checked</p>
          </div>
        </div>
        <button onClick={download} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-emerald-500 transition-colors">
          <Printer className="w-4 h-4" />
        </button>
      </div>

      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${items.length > 0 ? (checked / items.length) * 100 : 0}%` }} />
      </div>

      <div className="space-y-2">
        {grouped.map(g => (
          <div key={g.cat} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button onClick={() => toggleCat(g.cat)} className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <span className="text-base">{CAT_EMOJI[g.cat]||'📦'}</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white flex-1">{g.cat}</span>
              <span className="text-[10px] text-gray-400 font-semibold">{g.items.filter(i=>i.checked).length}/{g.items.length}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${collapsed.has(g.cat)?'':'rotate-180'}`} />
            </button>
            {!collapsed.has(g.cat) && (
              <div className="px-3 pb-3 space-y-1">
                {g.items.map((item, i) => {
                  const gi = g.idx[i];
                  return (
                    <div key={gi} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${item.checked?'opacity-50':''}`}>
                      <button onClick={() => toggleCheck(gi)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.checked?'bg-emerald-500 border-emerald-500':'border-gray-300 dark:border-gray-600 hover:border-emerald-400'}`}>
                        {item.checked && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold ${item.checked?'line-through text-gray-400':'text-gray-700 dark:text-gray-300'}`}>{item.name}</span>
                        {item.amount && <span className="text-[10px] text-gray-400 ml-1.5">{item.amount}</span>}
                      </div>
                      <button onClick={() => removeItem(gi)} className="text-gray-300 hover:text-rose-500 transition-colors p-0.5"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd ? (
        <div className="flex gap-2">
          <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Add item…" className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          <button onClick={addItem} className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm">Add</button>
          <button onClick={() => { setShowAdd(false); setNewItem(''); }} className="text-gray-400 px-2"><Minus className="w-4 h-4" /></button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 font-semibold py-2.5 rounded-xl text-sm hover:border-emerald-300 hover:text-emerald-500 transition-all">
          <Plus className="w-4 h-4" /> Add Custom Item
        </button>
      )}
    </div>
  );
}
