/**
 * PricingSection — Phase 13
 * Premium pricing display for the NourishAI platform.
 * 4 tiers: Free, Pro, Family, Clinical with feature comparison.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, Sparkles, Zap, Users, Shield,
  Crown, ArrowRight, Star,
} from 'lucide-react';

type BillingCycle = 'monthly' | 'annual';

interface PricingTier {
  name: string;
  icon: typeof Sparkles;
  monthlyPrice: number;
  annualPrice: number;
  tagline: string;
  popular?: boolean;
  gradient: string;
  badgeColor: string;
  features: string[];
  limitations?: string[];
  cta: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    icon: Sparkles,
    monthlyPrice: 0,
    annualPrice: 0,
    tagline: 'Core nutrition planning',
    gradient: 'from-gray-600 to-gray-700',
    badgeColor: 'bg-gray-100 text-gray-700',
    features: [
      '1 meal plan per week',
      'Blood type food guide',
      'Grocery list generation',
      'Basic pantry tracking',
      '10 AI chat messages/day',
      '3 label scans/day',
      '1 family member',
    ],
    limitations: [
      'No NourishAI swarm intelligence',
      'No lab analysis',
      'No brain assessment',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    icon: Zap,
    monthlyPrice: 12.99,
    annualPrice: 99,
    tagline: 'Full health intelligence',
    popular: true,
    gradient: 'from-purple-500 to-indigo-600',
    badgeColor: 'bg-purple-100 text-purple-700',
    features: [
      'Unlimited meal plans',
      'NourishAI swarm intelligence',
      'Lab report analysis',
      'Braverman brain assessment',
      'Fitness intelligence & AI review',
      'USDA nutrition verification',
      '5 PDF reports/month',
      'Exercise form demonstrations',
      'Unlimited AI chat',
      'Unlimited label scans',
    ],
    cta: 'Start Pro Trial',
  },
  {
    name: 'Family',
    icon: Users,
    monthlyPrice: 24.99,
    annualPrice: 199,
    tagline: 'Household health platform',
    gradient: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    features: [
      'Everything in Pro',
      'Up to 6 family members',
      'Family health comparison',
      'Independent assessments per member',
      'Household meal planning',
      'Doctor visit prep packages',
      'Cross-domain health reports',
      '20 PDF reports/month',
      'Priority AI processing',
    ],
    cta: 'Start Family Trial',
  },
  {
    name: 'Clinical',
    icon: Shield,
    monthlyPrice: 79.99,
    annualPrice: 699,
    tagline: 'Healthcare providers',
    gradient: 'from-indigo-600 to-blue-700',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    features: [
      'Everything in Family',
      'Up to 50 patient profiles',
      'Unlimited PDF reports',
      'Health protocol slide decks',
      'White-label reports',
      'HIPAA-compliant handling',
      'API access (1000 calls/mo)',
      'Priority support (24hr)',
    ],
    cta: 'Contact Sales',
  },
];

export default function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>('annual');

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200 text-purple-700 px-5 py-2 rounded-full mb-6 font-semibold text-sm">
            <Crown className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Choose Your <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Health Intelligence</span> Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. Upgrade when you're ready for deeper insights.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === 'annual'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Annual
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                Save 30%+
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in-section">
          {tiers.map((tier, idx) => {
            const price = billing === 'annual' ? tier.annualPrice : tier.monthlyPrice;
            const monthlyEquiv = billing === 'annual' && tier.annualPrice > 0
              ? (tier.annualPrice / 12).toFixed(2)
              : null;

            return (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col transition-all duration-300 hover:shadow-xl ${
                  tier.popular
                    ? 'border-purple-400 shadow-lg shadow-purple-100 scale-[1.02] lg:scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Tier header */}
                <div className="mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${tier.gradient} rounded-xl flex items-center justify-center mb-3`}>
                    <tier.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-sm text-gray-500">{tier.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">
                      ${billing === 'annual' && price > 0 ? monthlyEquiv : price === 0 ? '0' : price}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-400 text-sm font-medium">/month</span>
                    )}
                  </div>
                  {billing === 'annual' && price > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Billed ${price}/year
                    </p>
                  )}
                  {price === 0 && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">
                      Free forever
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to="/register"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all mb-6 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:opacity-90'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Features */}
                <div className="flex-1 space-y-2.5">
                  {tier.features.map(feature => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {tier.limitations?.map(limitation => (
                    <div key={limitation} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-400">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Health Disclaimer */}
        <div className="mt-16 max-w-4xl mx-auto text-center fade-in-section">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Health Disclaimer:</strong> NourishAI provides health information and nutritional guidance
              based on published scientific research and USDA data. This platform is not a substitute for
              professional medical advice. Always consult your healthcare provider before making changes
              to your diet, supplements, or exercise program. Lab analysis and assessments are for
              informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
