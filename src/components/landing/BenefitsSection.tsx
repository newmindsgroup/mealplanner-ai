import React, { useEffect, useState, useRef } from 'react';
import { Clock, DollarSign, HeartPulse, Users, TrendingUp, Award } from 'lucide-react';

export default function BenefitsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Animated counters
  const [stats, setStats] = useState({
    timesSaved: 0,
    moneySaved: 0,
    mealsPlanned: 0,
    satisfaction: 0
  });

  const finalStats = {
    timesSaved: 10,
    moneySaved: 200,
    mealsPlanned: 10000,
    satisfaction: 98
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setStats({
        timesSaved: Math.floor(finalStats.timesSaved * progress),
        moneySaved: Math.floor(finalStats.moneySaved * progress),
        mealsPlanned: Math.floor(finalStats.mealsPlanned * progress),
        satisfaction: Math.floor(finalStats.satisfaction * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setStats(finalStats);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  const benefits = [
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Stop spending hours researching recipes and meal ideas. Get a complete week planned in minutes.',
      color: 'from-emerald-400 to-green-500',
      stat: `${stats.timesSaved}+ hours`,
      statLabel: 'saved per week'
    },
    {
      icon: DollarSign,
      title: 'Save Money',
      description: 'Reduce food waste and impulse purchases with smart grocery lists and pantry tracking.',
      color: 'from-green-400 to-teal-500',
      stat: `$${stats.moneySaved}+`,
      statLabel: 'saved monthly'
    },
    {
      icon: HeartPulse,
      title: 'Improve Health',
      description: 'Eat foods optimized for your blood type and dietary needs, backed by nutritional science.',
      color: 'from-pink-400 to-rose-500',
      stat: '100%',
      statLabel: 'personalized nutrition'
    },
    {
      icon: Users,
      title: 'Family-Friendly',
      description: 'Create meal plans that satisfy everyone\'s tastes while respecting individual blood types.',
      color: 'from-blue-400 to-cyan-500',
      stat: '5+',
      statLabel: 'family members'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your health journey with gamified progress tracking, streaks, and achievements.',
      color: 'from-purple-400 to-pink-500',
      stat: `${stats.mealsPlanned.toLocaleString()}+`,
      statLabel: 'meals planned'
    },
    {
      icon: Award,
      title: 'Expert Guidance',
      description: 'AI-powered recommendations based on blood type nutrition research and dietary science.',
      color: 'from-orange-400 to-red-500',
      stat: `${stats.satisfaction}%`,
      statLabel: 'satisfaction rate'
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <Award className="w-4 h-4" />
            Why Choose Us
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            The <span className="gradient-text">Benefits</span> Are Clear
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of families who have transformed their health and simplified their lives
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`glass-card-light rounded-2xl p-8 text-center hover-lift fade-in-section ${
                isVisible ? 'is-visible' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6 feature-icon`}>
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {benefit.description}
              </p>
              <div className="pt-6 border-t border-gray-200">
                <div className={`text-4xl font-bold mb-1 ${isVisible ? 'gradient-text' : 'text-gray-400'}`}>
                  {benefit.stat}
                </div>
                <div className="text-sm text-gray-600">{benefit.statLabel}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="glass-card-light rounded-2xl p-8 md:p-12 max-w-4xl mx-auto text-center fade-in-section">
          <div className="flex justify-center mb-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 border-4 border-white flex items-center justify-center text-white font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Trusted by Thousands of Families
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            "This app has completely changed how we approach meal planning. My family eats healthier, 
            we waste less food, and I save hours every week. The blood type compatibility feature is a game-changer!"
          </p>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-6 h-6 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              <strong>Sarah M.</strong> • Family of 4 • Using for 6 months
            </p>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-16 text-center fade-in-section">
          <div className="glass-card rounded-2xl p-12 landing-gradient-bg">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Your Health Journey Today
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Experience the difference personalized, blood-type-compatible meal planning can make
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="landing-btn-primary bg-white text-emerald-600 hover:bg-gray-100">
                Get Started Free
              </button>
              <button className="landing-btn-secondary">
                Watch Demo Video
              </button>
            </div>
            <p className="text-sm text-white/70 mt-6">
              ✓ No credit card required  ✓ Setup in 5 minutes  ✓ Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

