// Auth Layout Component - Shared layout for all authentication pages
import React from 'react';
import { ChefHat, Users, Sparkles, Shield, Clock, Heart } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const features = [
    {
      icon: ChefHat,
      title: 'AI-Powered Planning',
      description: 'Smart meal suggestions based on your preferences',
    },
    {
      icon: Users,
      title: 'Family Collaboration',
      description: 'Share and plan meals with your household',
    },
    {
      icon: Sparkles,
      title: 'Blood Type Compatibility',
      description: 'Personalized nutrition recommendations',
    },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-emerald-950 dark:to-gray-900">
        {/* Animated mesh gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row">
        {/* Left Side - Branding (Hidden on mobile, visible on desktop) */}
        <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative">
          <div className="flex flex-col justify-center px-8 xl:px-16 py-12 w-full">
            {/* Logo and Brand */}
            <div className="mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-primary-500 to-emerald-600 p-4 rounded-2xl">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 dark:from-primary-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    Meal Plan Assistant
                  </h1>
                </div>
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 font-medium mb-2">
                Your AI-Powered Nutrition Partner
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Plan healthy meals, collaborate with family, and achieve your nutrition goals with intelligent recommendations.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6 mb-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 animate-fade-in"
                  style={{ animationDelay: `${(index + 1) * 150}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-primary-400 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <feature.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>1000+ Families</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo (visible only on mobile) */}
            <div className="lg:hidden text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-2xl blur-md opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-primary-500 to-emerald-600 p-3 rounded-2xl">
                    <ChefHat className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                  Meal Plan Assistant
                </h1>
              </div>
            </div>

            {/* Form Card with Glassmorphism */}
            <div className="relative animate-scale-in">
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-emerald-500 rounded-3xl blur opacity-20"></div>
              
              {/* Card */}
              <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8 sm:p-12">
                {title && (
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
                
                {children}
              </div>
            </div>

            {/* Footer - Mobile Only */}
            <div className="lg:hidden mt-8 text-center">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>1000+ Users</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

