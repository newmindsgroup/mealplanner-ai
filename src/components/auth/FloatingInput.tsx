// Floating Label Input Component with animations
import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingInputProps {
  id: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: LucideIcon;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function FloatingInput({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  required = false,
  autoComplete,
  disabled = false,
  placeholder = ' ',
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFloating = isFocused || value.length > 0;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="relative group">
      {/* Icon */}
      {Icon && (
        <div className="absolute left-[16px] top-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center justify-center">
          <Icon
            className={`w-5 h-5 transition-colors duration-200 ${
              error
                ? 'text-red-500'
                : isFocused
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
            strokeWidth={2}
          />
        </div>
      )}

      {/* Input */}
      <input
        id={id}
        name={name}
        type={inputType}
        value={value}
        onChange={onChange}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        onFocus={() => setIsFocused(true)}
        autoComplete={autoComplete}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={`
          peer w-full py-[1.125rem] 
          ${Icon ? 'pl-[48px]' : 'pl-4'} 
          ${type === 'password' ? 'pr-[48px]' : 'pr-4'}
          bg-white/50 dark:bg-gray-800/50 
          border-2 rounded-xl
          text-gray-900 dark:text-white text-base
          placeholder-transparent
          transition-all duration-200
          focus:outline-none focus:ring-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? 'border-red-500 focus:border-red-600'
              : isFocused
              ? 'border-primary-500 dark:border-primary-400 shadow-lg shadow-primary-500/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
        `}
      />

      {/* Floating Label */}
      <label
        htmlFor={id}
        className={`
          absolute ${Icon ? 'left-[48px]' : 'left-4'}
          transition-all duration-200 pointer-events-none
          ${
            isFloating
              ? '-top-2.5 text-xs px-2 bg-white dark:bg-gray-900 rounded'
              : 'top-1/2 -translate-y-1/2 text-base'
          }
          ${
            error
              ? 'text-red-500'
              : isFocused
              ? 'text-primary-600 dark:text-primary-400 font-medium'
              : 'text-gray-500 dark:text-gray-400'
          }
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Password Toggle */}
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-[16px] top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      )}

      {/* Error Message with shake animation */}
      {error && (
        <p className="absolute -bottom-6 left-0 text-sm text-red-500 dark:text-red-400 animate-shake flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Focus ring effect */}
      {isFocused && !error && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-emerald-500/10 blur-xl -z-10 animate-pulse"></div>
      )}
    </div>
  );
}

