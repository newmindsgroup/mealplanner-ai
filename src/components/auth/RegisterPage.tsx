// Modern Register Page with Enhanced UX
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader, CheckCircle2, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from './AuthLayout';
import FloatingInput from './FloatingInput';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Password strength validation with enhanced visual feedback
  const passwordRequirements = [
    { test: (p: string) => p.length >= 8, label: 'At least 8 characters', weight: 1 },
    { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter', weight: 1 },
    { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter', weight: 1 },
    { test: (p: string) => /[0-9]/.test(p), label: 'One number', weight: 1 },
    { test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p), label: 'One special character', weight: 1 },
  ];

  const getPasswordStrength = () => {
    if (!formData.password) return { score: 0, label: '', color: '' };
    
    const metRequirements = passwordRequirements.filter(req => req.test(formData.password)).length;
    const totalRequirements = passwordRequirements.length;
    const score = (metRequirements / totalRequirements) * 100;

    if (score <= 40) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 60) return { score, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 80) return { score, label: 'Good', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  // Form completion progress
  const getFormProgress = () => {
    const fields = [
      formData.name !== '',
      formData.email !== '',
      formData.password !== '' && passwordRequirements.every(req => req.test(formData.password)),
      formData.confirmPassword !== '' && formData.password === formData.confirmPassword,
      formData.acceptTerms,
    ];
    const completed = fields.filter(Boolean).length;
    return (completed / fields.length) * 100;
  };

  const formProgress = getFormProgress();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getFieldError = (field: keyof typeof touched) => {
    if (!touched[field]) return undefined;
    
    switch (field) {
      case 'name':
        if (!formData.name) return 'Name is required';
        if (formData.name.length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!formData.email) return 'Email is required';
        if (!validateEmail(formData.email)) return 'Invalid email format';
        break;
      case 'password':
        if (!formData.password) return 'Password is required';
        break;
      case 'confirmPassword':
        if (!formData.confirmPassword) return 'Please confirm your password';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        break;
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.name.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const failedReqs = passwordRequirements.filter(req => !req.test(formData.password));
    if (failedReqs.length > 1) { // Allow with 4/5 requirements met
      setError('Password is too weak. Please meet more requirements.');
      return false;
    }

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerSuccess = await register(formData);
      
      if (registerSuccess) {
        setSuccess(true);
        // Wait for animation before navigating
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setError('Registration failed. This email may already be in use.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthLayout 
      title="Join Us Today" 
      subtitle="Start your personalized nutrition journey"
    >
      {/* Form Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span>Complete your profile</span>
          <span className="font-semibold">{Math.round(formProgress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${formProgress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-shake flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 animate-scale-in" />
            <span>Account created! Redirecting to your dashboard...</span>
          </div>
        )}

        {/* Name Field */}
        <div>
          <FloatingInput
            id="name"
            name="name"
            type="text"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('name')}
            icon={User}
            autoComplete="name"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <FloatingInput
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('email')}
            icon={Mail}
            autoComplete="email"
            required
          />
        </div>

        {/* Password Field with Strength Indicator */}
        <div>
          <FloatingInput
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('password')}
            icon={Lock}
            autoComplete="new-password"
            required
          />
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {/* Strength Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-600 dark:text-gray-400">Password strength</span>
                  <span className={`font-semibold ${
                    passwordStrength.score <= 40 ? 'text-red-600 dark:text-red-400' :
                    passwordStrength.score <= 60 ? 'text-orange-600 dark:text-orange-400' :
                    passwordStrength.score <= 80 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>

              {/* Requirements List */}
              <div className="grid grid-cols-1 gap-2">
                {passwordRequirements.map((req, index) => {
                  const met = req.test(formData.password);
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center gap-2 text-xs transition-all duration-200 ${
                        met ? 'opacity-100' : 'opacity-60'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                        met ? 'bg-green-500 scale-100' : 'bg-gray-300 dark:bg-gray-600 scale-90'
                      }`}>
                        {met && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={met ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <FloatingInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('confirmPassword')}
            icon={Shield}
            autoComplete="new-password"
            required
          />
          {/* Password match indicator */}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3 h-3" />
              Passwords match
            </p>
          )}
        </div>

        {/* Terms & Conditions Checkbox */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-primary-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all cursor-pointer"
              required
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || success || !formData.acceptTerms}
          className="relative w-full btn-primary group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed !py-[0.875rem] text-base font-semibold"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Button content */}
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Success!</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Create Account</span>
              </>
            )}
          </span>
        </button>

      </form>

      {/* Sign In Link */}
      <div className="mt-7 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
