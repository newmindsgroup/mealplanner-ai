/**
 * SubscriptionContext — Subscription Tier Gating
 * Manages the user's current plan and gates features accordingly.
 * 
 * Tiers: free | pro | family | clinical
 * 
 * Usage:
 *   const { tier, canAccess, showUpgradePrompt } = useSubscription();
 *   if (!canAccess('swarm_intelligence')) return <UpgradeGate feature="swarm_intelligence" />;
 */
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type SubscriptionTier = 'free' | 'pro' | 'family' | 'clinical';

export type GatedFeature =
  | 'swarm_intelligence'    // NourishAI multi-agent chat
  | 'lab_analysis'          // Upload & analyze lab reports
  | 'brain_assessment'      // Braverman neurotransmitter test
  | 'fitness_intelligence'  // AI workout plans + review
  | 'usda_verification'     // USDA FoodData cross-reference
  | 'pdf_reports'           // PDF report generation
  | 'exercise_demos'        // Exercise form demonstrations
  | 'health_reports'        // Cross-domain health reports
  | 'doctor_visit_prep'     // Doctor visit preparation
  | 'family_comparison'     // Family health comparison
  | 'slide_decks'           // Health protocol presentations
  | 'api_access'            // API access for clinical
  | 'white_label'           // White-label reports
  | 'unlimited_meals'       // Unlimited meal plans
  | 'unlimited_chat'        // Unlimited AI chat
  | 'unlimited_scans';      // Unlimited label scans

export interface SubscriptionLimits {
  mealsPerWeek: number;
  chatMessagesPerDay: number;
  labelScansPerDay: number;
  pdfReportsPerMonth: number;
  familyMembers: number;
  knowledgeBaseDocs: number;
}

interface SubscriptionContextType {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  canAccess: (feature: GatedFeature) => boolean;
  isUpgradeAvailable: boolean;
  requiredTierFor: (feature: GatedFeature) => SubscriptionTier;
  upgradePromptVisible: boolean;
  showUpgradePrompt: (feature: GatedFeature) => void;
  hideUpgradePrompt: () => void;
  promptedFeature: GatedFeature | null;
  setTier: (tier: SubscriptionTier) => void;
}

// ============================================================================
// FEATURE ACCESS MATRIX
// ============================================================================

const FEATURE_ACCESS: Record<GatedFeature, SubscriptionTier[]> = {
  swarm_intelligence:   ['pro', 'family', 'clinical'],
  lab_analysis:         ['pro', 'family', 'clinical'],
  brain_assessment:     ['pro', 'family', 'clinical'],
  fitness_intelligence: ['pro', 'family', 'clinical'],
  usda_verification:    ['pro', 'family', 'clinical'],
  pdf_reports:          ['pro', 'family', 'clinical'],
  exercise_demos:       ['pro', 'family', 'clinical'],
  health_reports:       ['family', 'clinical'],
  doctor_visit_prep:    ['family', 'clinical'],
  family_comparison:    ['family', 'clinical'],
  slide_decks:          ['clinical'],
  api_access:           ['clinical'],
  white_label:          ['clinical'],
  unlimited_meals:      ['pro', 'family', 'clinical'],
  unlimited_chat:       ['pro', 'family', 'clinical'],
  unlimited_scans:      ['pro', 'family', 'clinical'],
};

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    mealsPerWeek: 1,
    chatMessagesPerDay: 10,
    labelScansPerDay: 3,
    pdfReportsPerMonth: 0,
    familyMembers: 1,
    knowledgeBaseDocs: 5,
  },
  pro: {
    mealsPerWeek: Infinity,
    chatMessagesPerDay: Infinity,
    labelScansPerDay: Infinity,
    pdfReportsPerMonth: 5,
    familyMembers: 1,
    knowledgeBaseDocs: 50,
  },
  family: {
    mealsPerWeek: Infinity,
    chatMessagesPerDay: Infinity,
    labelScansPerDay: Infinity,
    pdfReportsPerMonth: 20,
    familyMembers: 6,
    knowledgeBaseDocs: 100,
  },
  clinical: {
    mealsPerWeek: Infinity,
    chatMessagesPerDay: Infinity,
    labelScansPerDay: Infinity,
    pdfReportsPerMonth: Infinity,
    familyMembers: 50,
    knowledgeBaseDocs: Infinity,
  },
};

const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'family', 'clinical'];

const MINIMUM_TIER_FOR: Record<GatedFeature, SubscriptionTier> = Object.fromEntries(
  Object.entries(FEATURE_ACCESS).map(([feature, tiers]) => [
    feature,
    TIER_ORDER.find(t => tiers.includes(t)) || 'clinical',
  ])
) as Record<GatedFeature, SubscriptionTier>;

// ============================================================================
// CONTEXT
// ============================================================================

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  // In production, this would come from the backend/Stripe
  const [tier, setTier] = useState<SubscriptionTier>(() => {
    const stored = localStorage.getItem('nourishai_tier');
    return (stored as SubscriptionTier) || 'free';
  });
  const [upgradePromptVisible, setUpgradePromptVisible] = useState(false);
  const [promptedFeature, setPromptedFeature] = useState<GatedFeature | null>(null);

  const handleSetTier = useCallback((newTier: SubscriptionTier) => {
    setTier(newTier);
    localStorage.setItem('nourishai_tier', newTier);
  }, []);

  const canAccess = useCallback(
    (feature: GatedFeature) => FEATURE_ACCESS[feature]?.includes(tier) ?? false,
    [tier]
  );

  const requiredTierFor = useCallback(
    (feature: GatedFeature) => MINIMUM_TIER_FOR[feature],
    []
  );

  const showUpgradePrompt = useCallback((feature: GatedFeature) => {
    setPromptedFeature(feature);
    setUpgradePromptVisible(true);
  }, []);

  const hideUpgradePrompt = useCallback(() => {
    setUpgradePromptVisible(false);
    setPromptedFeature(null);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        limits: TIER_LIMITS[tier],
        canAccess,
        isUpgradeAvailable: tier !== 'clinical',
        requiredTierFor,
        upgradePromptVisible,
        showUpgradePrompt,
        hideUpgradePrompt,
        promptedFeature,
        setTier: handleSetTier,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
