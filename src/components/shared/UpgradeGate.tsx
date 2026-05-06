/**
 * UpgradeGate — Visual blocker for gated features
 * Shows when a user tries to access a feature above their tier.
 * Displays the required tier, feature description, and upgrade CTA.
 */
import React from 'react';
import { Lock, Crown, Sparkles, ArrowRight, Zap, Users, Shield } from 'lucide-react';
import { useSubscription, type GatedFeature, type SubscriptionTier } from '../../contexts/SubscriptionContext';

interface UpgradeGateProps {
  feature: GatedFeature;
  title?: string;
  description?: string;
  compact?: boolean;
}

const TIER_DISPLAY: Record<SubscriptionTier, { label: string; icon: typeof Crown; color: string; gradient: string }> = {
  free: { label: 'Free', icon: Sparkles, color: 'text-gray-500', gradient: 'from-gray-500 to-gray-600' },
  pro: { label: 'Pro', icon: Zap, color: 'text-purple-500', gradient: 'from-purple-500 to-indigo-600' },
  family: { label: 'Family', icon: Users, color: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
  clinical: { label: 'Clinical', icon: Shield, color: 'text-indigo-500', gradient: 'from-indigo-600 to-blue-700' },
};

const FEATURE_LABELS: Partial<Record<GatedFeature, { title: string; description: string }>> = {
  swarm_intelligence: {
    title: 'NourishAI Intelligence',
    description: 'Access 8 specialized AI agents for deep health analysis, research, and report generation.',
  },
  lab_analysis: {
    title: 'Lab Report Analysis',
    description: 'Upload lab reports for AI-powered biomarker evaluation with PubMed citations.',
  },
  brain_assessment: {
    title: 'Brain Assessment',
    description: 'Complete Braverman neurotransmitter profiling with recovery protocols.',
  },
  fitness_intelligence: {
    title: 'Fitness Intelligence',
    description: 'AI workout plans with plateau detection and exercise form guides.',
  },
  health_reports: {
    title: 'Cross-Domain Reports',
    description: 'Comprehensive health intelligence correlating labs, neuro, fitness, and nutrition.',
  },
  doctor_visit_prep: {
    title: 'Doctor Visit Prep',
    description: 'Generate organized health data packages for your physician visits.',
  },
  family_comparison: {
    title: 'Family Health Comparison',
    description: 'Compare health data across household members side-by-side.',
  },
  slide_decks: {
    title: 'Health Slide Decks',
    description: 'Professional presentation decks for sharing with healthcare providers.',
  },
  pdf_reports: {
    title: 'PDF Report Generation',
    description: 'Generate professional PDF reports for labs, neuro protocols, and fitness.',
  },
};

export default function UpgradeGate({ feature, title, description, compact }: UpgradeGateProps) {
  const { requiredTierFor, tier: currentTier } = useSubscription();
  const requiredTier = requiredTierFor(feature);
  const tierInfo = TIER_DISPLAY[requiredTier];
  const featureInfo = FEATURE_LABELS[feature];
  const TierIcon = tierInfo.icon;

  const displayTitle = title || featureInfo?.title || 'Premium Feature';
  const displayDesc = description || featureInfo?.description || 'Upgrade to access this feature.';

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className={`p-2 bg-gradient-to-br ${tierInfo.gradient} rounded-lg`}>
          <Lock className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">{displayTitle}</p>
          <p className="text-[11px] text-gray-400">
            Requires <span className={`font-bold ${tierInfo.color}`}>{tierInfo.label}</span> plan
          </p>
        </div>
        <button className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${tierInfo.gradient} text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0`}>
          Upgrade
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800/40 dark:via-gray-900/40 dark:to-gray-800/40 p-8 text-center">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/30 to-indigo-100/30 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Lock icon */}
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${tierInfo.gradient} rounded-2xl shadow-lg mb-4`}>
          <Lock className="w-7 h-7 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{displayTitle}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
          {displayDesc}
        </p>

        {/* Tier badge */}
        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mb-6">
          <TierIcon className={`w-4 h-4 ${tierInfo.color}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Available on <span className={`font-bold ${tierInfo.color}`}>{tierInfo.label}</span> plan
          </span>
          {currentTier !== 'free' && (
            <span className="text-xs text-gray-400 ml-1">(You're on {currentTier})</span>
          )}
        </div>

        {/* CTA */}
        <div>
          <button className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${tierInfo.gradient} text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all hover:shadow-xl`}>
            <Crown className="w-5 h-5" />
            Upgrade to {tierInfo.label}
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-gray-400 mt-3">Cancel anytime · No long-term commitment</p>
        </div>
      </div>
    </div>
  );
}

/**
 * FeatureGuard — Wrapper that conditionally renders children or UpgradeGate
 */
export function FeatureGuard({ 
  feature, 
  children, 
  fallback,
  compact 
}: { 
  feature: GatedFeature; 
  children: ReactNode; 
  fallback?: ReactNode;
  compact?: boolean;
}) {
  const { canAccess } = useSubscription();
  
  if (canAccess(feature)) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : <UpgradeGate feature={feature} compact={compact} />;
}

type ReactNode = React.ReactNode;
