import { Flame, Dumbbell, Heart, Leaf, Shield, Brain, Zap, Sparkles } from 'lucide-react';
import type { HealthBenefit } from '../../data/bloodTypeFoods';

interface FoodBenefitBadgeProps {
  benefit: HealthBenefit;
  size?: 'sm' | 'md' | 'lg';
}

const benefitConfig: Record<HealthBenefit, {
  icon: typeof Flame;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  'anti-inflammatory': {
    icon: Flame,
    label: 'Anti-Inflammatory',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  'high-protein': {
    icon: Dumbbell,
    label: 'High Protein',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  'heart-health': {
    icon: Heart,
    label: 'Heart Health',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  'digestive-support': {
    icon: Leaf,
    label: 'Digestive Support',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  'immunity-boost': {
    icon: Shield,
    label: 'Immunity Boost',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  'brain-health': {
    icon: Brain,
    label: 'Brain Health',
    color: 'text-pink-700 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-200 dark:border-pink-800',
  },
  'energy': {
    icon: Zap,
    label: 'Energy',
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  'antioxidant': {
    icon: Sparkles,
    label: 'Antioxidant',
    color: 'text-teal-700 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    borderColor: 'border-teal-200 dark:border-teal-800',
  },
};

const sizeConfig = {
  sm: {
    iconSize: 'w-3 h-3',
    padding: 'px-1.5 py-0.5',
    text: 'text-[10px]',
    gap: 'gap-0.5',
  },
  md: {
    iconSize: 'w-3.5 h-3.5',
    padding: 'px-2 py-1',
    text: 'text-xs',
    gap: 'gap-1',
  },
  lg: {
    iconSize: 'w-4 h-4',
    padding: 'px-2.5 py-1.5',
    text: 'text-sm',
    gap: 'gap-1.5',
  },
};

export default function FoodBenefitBadge({ benefit, size = 'md' }: FoodBenefitBadgeProps) {
  const config = benefitConfig[benefit];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center ${sizes.gap} ${sizes.padding} ${config.bgColor} ${config.color} ${config.borderColor} border rounded-full font-medium ${sizes.text} whitespace-nowrap transition-all hover:scale-105`}
      title={config.label}
    >
      <Icon className={sizes.iconSize} />
      <span>{config.label}</span>
    </span>
  );
}

export function FoodBenefitIcon({ benefit, size = 'md' }: FoodBenefitBadgeProps) {
  const config = benefitConfig[benefit];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center justify-center ${sizes.padding} ${config.bgColor} ${config.color} ${config.borderColor} border rounded-full transition-all hover:scale-110`}
      title={config.label}
    >
      <Icon className={sizes.iconSize} />
    </div>
  );
}

