import { Mail, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export default function NotificationHistory() {
  const { notificationHistory, clearHistory } = useStore();

  const getStatusIcon = (status: 'pending' | 'sent' | 'failed') => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'sent' | 'failed') => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  if (notificationHistory.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary-400/20 blur-3xl rounded-full"></div>
          <Mail className="w-16 h-16 text-primary-500 dark:text-primary-400 relative z-10 mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Notification History
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your sent and scheduled notifications will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification History</h2>
        </div>
        {notificationHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="btn btn-secondary flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notificationHistory.map((notification) => (
          <div
            key={notification.id}
            className={`card p-4 border-2 ${getStatusColor(notification.status)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(notification.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {notification.subject}
                  </h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase font-bold">
                    {notification.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  To: {notification.to}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {notification.sentAt
                    ? `Sent: ${format(new Date(notification.sentAt), 'MMM d, yyyy h:mm a')}`
                    : notification.scheduledFor
                    ? `Scheduled: ${format(new Date(notification.scheduledFor), 'MMM d, yyyy h:mm a')}`
                    : 'Pending'}
                </div>
                {notification.error && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Error: {notification.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

