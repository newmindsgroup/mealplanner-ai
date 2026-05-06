import { 
  Calendar, 
  ShoppingCart, 
  Camera, 
  MessageCircle, 
  Package, 
  Heart, 
  TrendingUp,
  Users,
  Bell,
  Sparkles,
  Mic,
  FileText,
  Activity,
  Brain,
  Dumbbell,
  Shield
} from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      icon: Activity,
      title: 'Lab Analysis',
      description: 'Upload lab reports for AI-powered biomarker analysis with PubMed citations and trend charts',
      color: 'from-rose-500 to-red-600',
      href: '#demo'
    },
    {
      icon: Brain,
      title: 'Brain Assessment',
      description: 'Braverman neurotransmitter profiling with research-backed recovery protocols',
      color: 'from-purple-500 to-violet-600',
      href: '#demo'
    },
    {
      icon: Calendar,
      title: 'AI Meal Planning',
      description: 'USDA-verified 7-day meal plans tailored to your blood type, preferences, and goals',
      color: 'from-emerald-400 to-green-500',
      href: '#demo'
    },
    {
      icon: Dumbbell,
      title: 'Fitness Intelligence',
      description: 'AI workout plans with plateau detection, exercise form guides, and progress reports',
      color: 'from-orange-500 to-amber-600',
      href: '#demo'
    },
    {
      icon: Shield,
      title: 'Health Reports',
      description: 'Cross-domain intelligence reports, doctor visit prep packages, and family comparisons',
      color: 'from-indigo-500 to-blue-600',
      href: '#demo'
    },
    {
      icon: Heart,
      title: 'Blood Type Compatibility',
      description: 'Every meal scored for compatibility with your family\'s blood types',
      color: 'from-pink-400 to-rose-500',
      href: '#demo'
    },
    {
      icon: Camera,
      title: 'Label Scanner',
      description: 'Scan product labels instantly to check blood type conflicts and ingredients',
      color: 'from-purple-400 to-pink-500',
      href: '#demo'
    },
    {
      icon: MessageCircle,
      title: 'AI Nutrition Coach',
      description: 'Chat with 8 specialized AI agents for instant, evidence-based health advice',
      color: 'from-cyan-400 to-blue-500',
      href: '#demo'
    },
    {
      icon: ShoppingCart,
      title: 'Smart Shopping Lists',
      description: 'Auto-generated grocery lists organized by aisle for efficient shopping',
      color: 'from-green-400 to-emerald-500',
      href: '#demo'
    },
    {
      icon: Package,
      title: 'Pantry Tracking',
      description: 'Track inventory, expiration dates, and get low-stock alerts',
      color: 'from-indigo-400 to-purple-500',
      href: '#demo'
    },
    {
      icon: Users,
      title: 'Family Profiles',
      description: 'Independent health tracking for every family member with comparison reports',
      color: 'from-blue-400 to-cyan-500',
      href: '#demo'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your health journey with levels, streaks, and achievements',
      color: 'from-orange-400 to-red-500',
      href: '#demo'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get timely reminders for meal prep, expiring items, and more',
      color: 'from-amber-400 to-orange-500',
      href: '#demo'
    },
    {
      icon: Sparkles,
      title: 'Recipe Suggestions',
      description: 'Discover new recipes based on your preferences and pantry items',
      color: 'from-purple-400 to-pink-500',
      href: '#demo'
    },
    {
      icon: Mic,
      title: 'Voice Control',
      description: 'Hands-free cooking mode with voice commands and audio responses',
      color: 'from-green-400 to-teal-500',
      href: '#demo'
    },
    {
      icon: FileText,
      title: 'Knowledge Base',
      description: 'Upload recipes, PDFs, and notes to personalize your meal planning',
      color: 'from-gray-400 to-slate-500',
      href: '#demo'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            All Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need for <span className="gradient-text">Healthy Living</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A complete suite of tools to plan, track, and optimize your nutrition journey
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-section">
          {features.map((feature, index) => (
            <a
              key={index}
              href={feature.href}
              className="glass-card-light rounded-2xl p-6 hover-lift group cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 feature-icon`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </a>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center fade-in-section">
          <div className="glass-card-light rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Health?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already living healthier with personalized meal planning
            </p>
            <button className="landing-btn-primary inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Get Started Free</span>
            </button>
            <p className="text-sm text-gray-500 mt-4">No credit card required • Start planning in minutes</p>
          </div>
        </div>
      </div>
    </section>
  );
}

