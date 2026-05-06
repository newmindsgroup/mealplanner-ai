/**
 * SessionExpiryNotice — Phase 16
 * Listens for the auth:session-expired custom event dispatched by apiClient.
 * Shows a modal overlay prompting the user to re-login.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, LogIn } from 'lucide-react';

export default function SessionExpiryNotice() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener('auth:session-expired', handler);
    return () => window.removeEventListener('auth:session-expired', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full text-center border border-gray-200 dark:border-gray-700">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Session Expired
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Your session has expired for security reasons. Please sign in again to continue.
        </p>
        <button
          onClick={() => {
            setShow(false);
            navigate('/login');
          }}
          className="btn-primary w-full"
        >
          <LogIn className="w-4 h-4" />
          Sign In Again
        </button>
      </div>
    </div>
  );
}
