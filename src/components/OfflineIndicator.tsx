/**
 * OfflineIndicator — Phase 16
 * Shows a subtle banner when the user loses internet connection.
 * Auto-hides when connection is restored.
 */
import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      // Auto-hide reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div 
      className={`fixed top-0 inset-x-0 z-[60] flex items-center justify-center py-2 px-4 text-sm font-medium animate-slide-down transition-all duration-300 ${
        isOffline 
          ? 'bg-amber-500 text-white' 
          : 'bg-emerald-500 text-white'
      }`}
    >
      {isOffline ? (
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>You're offline — some features may be limited</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          <span>Back online!</span>
        </div>
      )}
    </div>
  );
}
