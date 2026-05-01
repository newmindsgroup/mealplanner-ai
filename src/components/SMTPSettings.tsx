import { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { smtpProviders } from '../types/notifications';
import { encryptPassword, decryptPassword, validateEmail, SECURITY_WARNING } from '../utils/emailEncryption';
import LoadingSpinner from './LoadingSpinner';

export default function SMTPSettings() {
  const { settings, updateSettings } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('custom');
  const [showSecurityWarning, setShowSecurityWarning] = useState(true);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    if (provider !== 'custom') {
      const config = smtpProviders[provider as keyof typeof smtpProviders];
      updateSettings({
        smtp: {
          ...settings.smtp,
          host: config.host,
          port: config.port,
          secure: config.secure,
        },
      });
    }
  };

  const handlePasswordChange = (password: string) => {
    const encrypted = encryptPassword(password);
    updateSettings({
      smtp: {
        ...settings.smtp,
        password: encrypted,
      },
    });
  };

  const getDecryptedPassword = () => {
    return decryptPassword(settings.smtp.password);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');

    // Validation
    if (!settings.smtp.host || !settings.smtp.fromEmail) {
      setTestStatus('error');
      setTestMessage('Please fill in SMTP host and from email address.');
      return;
    }

    if (!validateEmail(settings.smtp.fromEmail)) {
      setTestStatus('error');
      setTestMessage('Invalid from email address.');
      return;
    }

    if (!settings.smtp.testEmail) {
      setTestStatus('error');
      setTestMessage('Please provide a test email address.');
      return;
    }

    if (!validateEmail(settings.smtp.testEmail)) {
      setTestStatus('error');
      setTestMessage('Invalid test email address.');
      return;
    }

    // Simulate test (in real app, this would call email service)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Note: Browser cannot directly send SMTP emails
      // In production, this needs a backend service
      setTestStatus('success');
      setTestMessage(
        `✓ Settings validated! Note: Actual email sending requires a backend service. ` +
        `Your settings are saved and will be used when the backend is configured.`
      );
    } catch (error) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const providerConfig = selectedProvider !== 'custom' 
    ? smtpProviders[selectedProvider as keyof typeof smtpProviders]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">SMTP Configuration</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure your email server settings</p>
        </div>
      </div>

      {/* Security Warning */}
      {showSecurityWarning && (
        <div className="card p-4 border-2 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Security Best Practices</h4>
              <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line leading-relaxed">
                {SECURITY_WARNING}
              </p>
              <button
                onClick={() => setShowSecurityWarning(false)}
                className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enable Toggle */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">Enable Email Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Turn on to receive email notifications based on your preferences
            </p>
          </div>
          <button
            onClick={() => updateSettings({ smtp: { ...settings.smtp, enabled: !settings.smtp.enabled } })}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
              settings.smtp.enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            role="switch"
            aria-checked={settings.smtp.enabled}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                settings.smtp.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SMTP Provider Selection */}
      <div className="card p-6">
        <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Email Provider
        </label>
        <select
          value={selectedProvider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="input mb-3"
        >
          <option value="gmail">Gmail</option>
          <option value="outlook">Outlook/Hotmail</option>
          <option value="yahoo">Yahoo Mail</option>
          <option value="sendgrid">SendGrid</option>
          <option value="mailgun">Mailgun</option>
          <option value="custom">Custom SMTP</option>
        </select>

        {providerConfig && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Setup Instructions:</strong> {providerConfig.instructions}
            </p>
          </div>
        )}
      </div>

      {/* SMTP Settings Form */}
      <div className="card p-6 space-y-4">
        {/* SMTP Host */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            SMTP Host <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.smtp.host}
            onChange={(e) => updateSettings({ smtp: { ...settings.smtp, host: e.target.value } })}
            placeholder="smtp.gmail.com"
            className="input"
          />
        </div>

        {/* SMTP Port and Secure */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Port <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={settings.smtp.port}
              onChange={(e) => updateSettings({ smtp: { ...settings.smtp, port: parseInt(e.target.value) || 587 } })}
              placeholder="587"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Security
            </label>
            <select
              value={settings.smtp.secure ? 'tls' : 'none'}
              onChange={(e) => updateSettings({ smtp: { ...settings.smtp, secure: e.target.value === 'tls' } })}
              className="input"
            >
              <option value="none">STARTTLS (587)</option>
              <option value="tls">TLS/SSL (465)</option>
            </select>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.smtp.username}
            onChange={(e) => updateSettings({ smtp: { ...settings.smtp, username: e.target.value } })}
            placeholder="your-email@gmail.com"
            className="input"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password (encrypted) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={showPassword ? getDecryptedPassword() : '••••••••'}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="App password or SMTP password"
              className="input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your password is encrypted before being stored locally
          </p>
        </div>

        {/* From Email */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            From Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={settings.smtp.fromEmail}
            onChange={(e) => updateSettings({ smtp: { ...settings.smtp, fromEmail: e.target.value } })}
            placeholder="noreply@yourdomain.com"
            className="input"
          />
        </div>

        {/* From Name */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            From Name
          </label>
          <input
            type="text"
            value={settings.smtp.fromName}
            onChange={(e) => updateSettings({ smtp: { ...settings.smtp, fromName: e.target.value } })}
            placeholder="Meal Plan Assistant"
            className="input"
          />
        </div>

        {/* Test Email */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Test Email Address
          </label>
          <input
            type="email"
            value={settings.smtp.testEmail || ''}
            onChange={(e) => updateSettings({ smtp: { ...settings.smtp, testEmail: e.target.value } })}
            placeholder="test@example.com"
            className="input"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            A test email will be sent here to verify your settings
          </p>
        </div>
      </div>

      {/* Test Connection Button */}
      <div className="card p-6">
        <button
          onClick={handleTestConnection}
          disabled={testStatus === 'testing'}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {testStatus === 'testing' ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Testing Connection...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Test Connection</span>
            </>
          )}
        </button>

        {/* Test Status */}
        {testStatus !== 'idle' && testStatus !== 'testing' && (
          <div
            className={`mt-4 p-4 rounded-xl border ${
              testStatus === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex gap-3">
              {testStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <p
                className={`text-sm ${
                  testStatus === 'success'
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }`}
              >
                {testMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Note about backend requirement */}
      <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> Email sending from the browser requires a backend service for security reasons.
          Your SMTP settings are saved locally and will be used when you deploy the app with a backend.
          Consider using services like SendGrid, Mailgun, or AWS SES for production use.
        </p>
      </div>
    </div>
  );
}

