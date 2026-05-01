// Modern Forgot Password Page with Enhanced UX
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader, CheckCircle, Send } from 'lucide-react';
import { authService } from '../../services/authService';
import AuthLayout from './AuthLayout';
import FloatingInput from './FloatingInput';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getFieldError = () => {
    if (!touched) return undefined;
    if (!email) return 'Email is required';
    if (!validateEmail(email)) return 'Invalid email format';
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTouched(true);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword({ email });
      
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6 py-8 animate-fade-in">
          {/* Success Icon with animation */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Check Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a password reset link to
            </p>
            <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
          </div>

          {/* Help Text */}
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>Didn't receive the email?</p>
            <ul className="space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure {email} is correct</li>
              <li>• Wait a few minutes and try again</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
                setTouched(false);
              }}
              className="btn-secondary w-full"
            >
              Send Again
            </button>
            <Link to="/login" className="btn-ghost w-full flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Form State
  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-shake flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Password Reset Instructions</p>
              <p>Enter the email address associated with your account and we'll send you a secure link to reset your password.</p>
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <FloatingInput
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            onBlur={() => setTouched(true)}
            error={getFieldError()}
            icon={Mail}
            autoComplete="email"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full btn-primary group overflow-hidden !py-[0.875rem] text-base font-semibold"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Button content */}
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Reset Link</span>
              </>
            )}
          </span>
        </button>

        {/* Back to Login */}
        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </form>

      {/* Additional Help */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Need help?{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
            Contact Support
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
