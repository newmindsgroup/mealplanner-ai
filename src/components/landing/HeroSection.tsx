import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Heart, Brain, Users, Zap, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';

interface HeroSectionProps {
  isAuthenticated: boolean;
  onGetStarted: () => void;
  onEnterApp: () => void;
  onLogout?: () => void;
}

export default function HeroSection({ isAuthenticated, onGetStarted, onEnterApp, onLogout }: HeroSectionProps) {
  const features = [
    { icon: Calendar, text: 'AI-Powered Meal Planning', color: 'text-emerald-300' },
    { icon: Heart, text: 'Blood Type Compatible', color: 'text-pink-300' },
    { icon: Brain, text: 'Smart Nutrition Guidance', color: 'text-purple-300' },
    { icon: Users, text: 'Family-Friendly Plans', color: 'text-cyan-300' },
  ];

  return (
    <section className="relative min-h-screen landing-hero-bg overflow-hidden flex items-center justify-center">
      {/* Animated Blob Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 blob-shape opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 blob-shape opacity-20" style={{ animationDelay: '4s' }}></div>

      {/* ── Sticky Top Navigation ──────────────────────────────── */}
      <nav className="absolute top-0 inset-x-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">🍽️</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">Meal Plan Assistant</span>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={onEnterApp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full mb-8 fade-in-down">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-white font-semibold">Personalized Nutrition Planning</span>
        </div>

        {/* Main Headline */}
        <h1 className="landing-title text-white mb-6 fade-in-up">
          Transform Your <span className="gradient-text">Health Journey</span>
          <br />
          With Intelligent Meal Planning
        </h1>

        {/* Subtitle */}
        <p className="landing-subtitle text-white/90 max-w-3xl mx-auto mb-8 fade-in-up delay-100">
          Discover meals perfectly matched to your blood type, dietary preferences, and health goals. 
          Plan smarter, eat better, and thrive with AI-powered nutrition guidance.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 fade-in-up delay-200">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card px-5 py-3 rounded-full flex items-center gap-2"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <feature.icon className={`w-5 h-5 ${feature.color}`} />
              <span className="text-white font-medium text-sm">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 fade-in-up delay-300">
          {isAuthenticated ? (
            <>
              <button
                onClick={onEnterApp}
                className="landing-btn-primary flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                <span>Open Dashboard</span>
              </button>
              <a href="#demo" className="landing-btn-secondary">
                Explore Features
              </a>
            </>
          ) : (
            <>
              <button
                onClick={onGetStarted}
                className="landing-btn-primary flex items-center gap-2 pulse-glow"
              >
                <Sparkles className="w-5 h-5" />
                <span>Get Started Free</span>
              </button>
              <a href="#demo" className="landing-btn-secondary">
                See It In Action
              </a>
            </>
          )}
        </div>

        {/* Login prompt for unauthenticated users */}
        {!isAuthenticated && (
          <p className="text-white/60 text-sm mb-16 fade-in-up delay-300">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold underline underline-offset-4 decoration-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in here
            </Link>
          </p>
        )}

        {/* Floating Demo Cards */}
        <div className="relative max-w-5xl mx-auto fade-in-up delay-400">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Meal Card Preview */}
            <div className="glass-card-light rounded-2xl p-6 hover-lift float-animation">
              <div className="w-full h-32 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl mb-4 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Weekly Plans</h3>
              <p className="text-sm text-gray-600">7-day personalized meal schedules</p>
            </div>

            {/* Blood Type Card Preview */}
            <div className="glass-card-light rounded-2xl p-6 hover-lift float-animation-slow" style={{ animationDelay: '0.5s' }}>
              <div className="w-full h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl mb-4 flex items-center justify-center">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Blood Type Match</h3>
              <p className="text-sm text-gray-600">Compatible nutrition science</p>
            </div>

            {/* AI Assistant Card Preview */}
            <div className="glass-card-light rounded-2xl p-6 hover-lift float-animation" style={{ animationDelay: '1s' }}>
              <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl mb-4 flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">AI Assistant</h3>
              <p className="text-sm text-gray-600">Chat with your nutrition coach</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 fade-in delay-500">
          <div className="flex flex-col items-center gap-2 text-white/70">
            <span className="text-sm font-medium">Explore Features</span>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

