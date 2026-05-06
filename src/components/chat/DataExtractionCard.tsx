/**
 * DataExtractionCard — In-chat interactive card for confirming AI-extracted data
 * Shows what was found, where it'll be saved, and lets user confirm/edit/dismiss.
 */
import { useState } from 'react';
import {
  CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2,
  FlaskConical, ShoppingCart, User, Heart, BookOpen, ScanLine,
  Dumbbell, ArrowRight, Sparkles,
} from 'lucide-react';
import type { ExtractedDataPayload, DataDestination } from '../../types/chat';

interface DataExtractionCardProps {
  data: ExtractedDataPayload;
  onConfirm: () => void;
  onDismiss: () => void;
  isCommitting?: boolean;
}

const DESTINATION_CONFIG: Record<DataDestination, { icon: typeof FlaskConical; color: string; bg: string }> = {
  labReports:     { icon: FlaskConical,  color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  labelAnalyses:  { icon: ScanLine,      color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  pantryItems:    { icon: ShoppingCart,   color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-950/20' },
  favoriteMeals:  { icon: Heart,         color: 'text-pink-600 dark:text-pink-400',     bg: 'bg-pink-50 dark:bg-pink-950/20' },
  people:         { icon: User,          color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/20' },
  knowledgeBase:  { icon: BookOpen,      color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/20' },
  groceryLists:   { icon: ShoppingCart,   color: 'text-teal-600 dark:text-teal-400',     bg: 'bg-teal-50 dark:bg-teal-950/20' },
  fitness:        { icon: Dumbbell,      color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
};

export default function DataExtractionCard({ data, onConfirm, onDismiss, isCommitting }: DataExtractionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = DESTINATION_CONFIG[data.destination] || DESTINATION_CONFIG.knowledgeBase;
  const Icon = config.icon;

  // ─── Confirmed state ──────────────────────────────────────────────────
  if (data.status === 'confirmed') {
    return (
      <div className={`flex items-center gap-3 ${config.bg} border border-green-200 dark:border-green-800/50 rounded-2xl px-4 py-3 animate-fade-in`}>
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
            Saved to {data.destinationLabel}
          </p>
          <p className="text-xs text-green-600/70 dark:text-green-400/70 truncate">{data.summary}</p>
        </div>
        <Sparkles className="w-4 h-4 text-green-400 animate-pulse" />
      </div>
    );
  }

  // ─── Dismissed state ──────────────────────────────────────────────────
  if (data.status === 'dismissed') return null;

  // ─── Pending confirmation ─────────────────────────────────────────────
  return (
    <div className={`${config.bg} border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden animate-fade-in shadow-sm`}>
      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${config.bg} border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">AI Detected</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
            {data.summary}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{data.destinationLabel}</span>
            <span className="text-[10px] text-gray-400">•</span>
            <span className={`text-[10px] font-medium ${
              data.confidence >= 80 ? 'text-green-600 dark:text-green-400' :
              data.confidence >= 60 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-500'
            }`}>
              {data.confidence}% confidence
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-400 transition-colors flex-shrink-0"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable data preview */}
      {expanded && (
        <div className="px-4 pb-3">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3">
            <DataPreview data={data.data} type={data.type} />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 flex gap-2">
        <button
          onClick={onConfirm}
          disabled={isCommitting}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50"
        >
          {isCommitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Save to {data.destinationLabel}</>
          )}
        </button>
        <button
          onClick={onDismiss}
          disabled={isCommitting}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 px-3 py-2.5 rounded-xl transition-colors"
        >
          <XCircle className="w-4 h-4" /> Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Data Preview Renderer ──────────────────────────────────────────────────

function DataPreview({ data, type }: { data: Record<string, unknown>; type: string }) {
  // Profile data
  if (type === 'profile_info' || type === 'allergy' || type === 'body_measurement') {
    return (
      <div className="space-y-1.5">
        {Object.entries(data).filter(([, v]) => v != null && v !== '').map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {Array.isArray(value) ? (value as string[]).join(', ') : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Lab results
  if (type === 'lab_result' || type === 'blood_work') {
    const results = (data as any).results || [];
    return (
      <div className="space-y-1">
        {(data as any).labName && <p className="text-xs text-gray-500 mb-1">Lab: {(data as any).labName}</p>}
        {results.slice(0, 8).map((r: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-xs py-0.5">
            <span className="text-gray-700 dark:text-gray-300">{r.testName}</span>
            <span className={`font-mono font-semibold ${
              r.status === 'high' ? 'text-red-600' : r.status === 'low' ? 'text-blue-600' : 'text-green-600'
            }`}>
              {r.value} {r.unit}
            </span>
          </div>
        ))}
        {results.length > 8 && <p className="text-[10px] text-gray-400 mt-1">...and {results.length - 8} more</p>}
      </div>
    );
  }

  // Pantry items
  if (type === 'pantry_item' || type === 'grocery_receipt') {
    const items = (data as any).items || [];
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item: any, i: number) => (
          <span key={i} className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-lg">
            {item.name} {item.quantity ? `×${item.quantity}` : ''}
          </span>
        ))}
      </div>
    );
  }

  // Fallback: JSON preview
  return (
    <pre className="text-[10px] text-gray-600 dark:text-gray-400 overflow-x-auto max-h-24 whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
