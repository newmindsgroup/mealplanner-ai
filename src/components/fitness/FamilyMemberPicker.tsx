/**
 * FamilyMemberPicker — Switcher component for selecting which family member's
 * fitness data to view/edit. Renders as a horizontal scroll row of avatar pills.
 * 
 * Phase 5: Multi-member fitness tracking.
 * Each member has their own independent fitness profile, workout plan,
 * body analysis, measurements, PRs, and AI coach conversation history.
 */
import React from 'react';
import { Plus, UserCircle2, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Person } from '../../types';

// Deterministic color from person ID for consistent avatar color
function avatarColor(id: string): string {
  const COLORS = [
    'from-orange-400 to-rose-500',
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-amber-400 to-orange-500',
    'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500',
    'from-lime-400 to-green-500',
  ];
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ageLabel(person: Person): string {
  if (!person.age) return '';
  return `${person.age}y`;
}

interface Props {
  selectedPersonId: string | null;
  onSelect: (person: Person) => void;
  onAddMember?: () => void;
  compact?: boolean; // true = show just avatars (sidebar mode)
}

export default function FamilyMemberPicker({
  selectedPersonId,
  onSelect,
  onAddMember,
  compact = false,
}: Props) {
  const { people } = useStore();

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-800 text-center">
        <UserCircle2 className="w-10 h-10 text-orange-300 mb-2" />
        <p className="font-bold text-gray-900 dark:text-white text-sm">No family members yet</p>
        <p className="text-xs text-gray-500 mt-1 mb-3">Add people in Profile Setup to track their fitness separately</p>
        {onAddMember && (
          <button
            onClick={onAddMember}
            className="flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Family Member
          </button>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        {people.map((person) => {
          const isSelected = person.id === selectedPersonId;
          return (
            <button
              key={person.id}
              onClick={() => onSelect(person)}
              title={person.name}
              className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(person.id)} flex items-center justify-center text-white text-xs font-black shadow-sm transition-all hover:scale-105 ${isSelected ? 'ring-2 ring-offset-2 ring-orange-500 scale-105' : 'opacity-70 hover:opacity-100'}`}
            >
              {initials(person.name)}
              {isSelected && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Check className="w-2 h-2 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Family Members</p>
        {onAddMember && (
          <button
            onClick={onAddMember}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {people.map((person) => {
          const isSelected = person.id === selectedPersonId;
          const goal = person.goals?.[0] || null;

          return (
            <button
              key={person.id}
              onClick={() => onSelect(person)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all min-w-[76px] group ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-md scale-105'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-200 hover:shadow-sm'
              }`}
            >
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor(person.id)} flex items-center justify-center text-white font-black text-sm shadow-sm relative`}>
                {initials(person.name)}
                {isSelected && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>

              {/* Name */}
              <span className={`text-xs font-bold truncate max-w-[64px] ${isSelected ? 'text-orange-700 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                {person.name.split(' ')[0]}
              </span>

              {/* Meta (age + blood type) */}
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {person.bloodType && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded font-bold">
                    {person.bloodType}
                  </span>
                )}
                {person.age && (
                  <span className="text-[10px] text-gray-400">{ageLabel(person)}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
