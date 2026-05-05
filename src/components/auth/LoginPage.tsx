// Modern Login Page with Enhanced UX
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from './AuthLayout';
import FloatingInput from './FloatingInput';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

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

  const getFieldError = (field: 'email' | 'password') => {
    if (!touched[field]) return undefined;
    
    if (field === 'email') {
      if (!formData.email) return 'Email is required';
      if (!validateEmail(formData.email)) return 'Invalid email format';
    }
    
    if (field === 'password') {
      if (!formData.password) return 'Password is required';
      if (formData.password.length < 6) return 'Password must be at least 6 characters';
    }
    
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const loginSuccess = await login(formData);
      
      if (loginSuccess) {
        setSuccess(true);
        // Wait for animation before navigating
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue your nutrition journey"
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Error Message with animation */}
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
            <span>Login successful! Redirecting...</span>
          </div>
        )}

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

        {/* Password Field */}
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
            autoComplete="current-password"
            required
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Remember me
            </span>
          </label>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button with enhanced loading state */}
        <button
          type="submit"
          disabled={isLoading || success}
          className="relative w-full btn-primary group overflow-hidden !py-[0.875rem] text-base font-semibold"
        >
          {/* Animated background on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Button content */}
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Success!</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </span>
        </button>

      </form>

      {/* Sign Up Link */}
      <div className="mt-7 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            Create one now
          </Link>
        </p>
      </div>

      {/* Terms & Privacy */}
      <p className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
        By signing in, you agree to our{' '}
        <a href="#" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 underline">
          Terms
        </a>
        {' '}and{' '}
        <a href="#" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 underline">
          Privacy Policy
        </a>
      </p>
    </AuthLayout>
  );
}
