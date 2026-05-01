import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    error: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} shadow-large rounded-2xl p-4 z-50 flex items-center gap-3 min-w-[300px] max-w-md animate-fade-in backdrop-blur-sm border border-white/20`}
      style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
        {icons[type]}
      </div>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
