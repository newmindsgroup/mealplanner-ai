import React, { useEffect, useState, Component, ErrorInfo, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import OnboardingWizard from './components/OnboardingWizard';
import Toast from './components/Toast';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import AcceptInvitationPage from './components/invitations/AcceptInvitationPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import SessionExpiryNotice from './components/SessionExpiryNotice';
import OfflineIndicator from './components/OfflineIndicator';

// Error Boundary Component
class AppErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' }}>
          <div style={{ maxWidth: '800px', margin: '50px auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h1 style={{ color: '#ef4444', marginTop: 0 }}>⚠️ App Error</h1>
            <p>Something went wrong loading the app.</p>
            <details style={{ marginTop: '20px', background: '#f9fafb', padding: '15px', borderRadius: '6px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
              <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', marginTop: '10px', fontSize: '12px' }}>
                {this.state.error?.toString()}
                {this.state.error?.stack && (
                  <>
                    {'\n\nStack Trace:\n'}
                    {this.state.error.stack}
                  </>
                )}
              </pre>
            </details>
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                  window.location.reload();
                } catch (e) {
                  console.error('Failed to clear storage:', e);
                  window.location.reload();
                }
              }}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
function LoadingScreen() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      background: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #22c55e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading Meal Plan Assistant...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [initError, setInitError] = useState<Error | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storeReady, setStoreReady] = useState(false);
  
  // Store state
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [settings, setSettings] = useState({ 
    darkMode: false, 
    voiceEnabled: true, 
    voiceSpeed: 1.0, 
    voiceSelection: 'default', 
    autoReadResponses: true, 
    emojisEnabled: true, 
    chefMode: false, 
    culturalAdaptation: true, 
    seasonalAdaptation: true, 
    language: 'en' 
  });

  // Load store asynchronously
  useEffect(() => {
    console.log('App component mounted, loading store...');
    
    const loadStore = async () => {
      try {
        // Small delay to ensure React is fully mounted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Dynamically import store to avoid blocking
        const storeModule = await import('./store/useStore');
        const store = storeModule.useStore.getState();
        
        setOnboardingComplete(store.onboardingComplete ?? false);
        setSettings(store.settings ?? settings);
        setStoreReady(true);
        setIsLoading(false);
        
        console.log('✅ Store loaded successfully, onboardingComplete:', store.onboardingComplete);
      } catch (error) {
        console.error('❌ Store initialization error:', error);
        const err = error instanceof Error ? error : new Error(String(error));
        setInitError(err);
        setIsLoading(false);
        setStoreReady(true); // Still allow app to render
      }
    };

    loadStore();
  }, []);

  useEffect(() => {
    // Apply dark mode
    try {
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Failed to apply dark mode:', e);
    }
  }, [settings.darkMode]);

  // Show error if store failed to initialize
  if (initError && !storeReady) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '800px', margin: '50px auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#ef4444', marginTop: 0 }}>⚠️ Initialization Error</h1>
          <p>Failed to initialize the app store.</p>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', borderRadius: '6px', fontSize: '12px' }}>
            {initError.toString()}
            {initError.stack && (
              <>
                {'\n\nStack Trace:\n'}
                {initError.stack}
              </>
            )}
          </pre>
          <button
            onClick={() => {
              try {
                localStorage.clear();
                window.location.reload();
              } catch (e) {
                console.error('Failed to clear storage:', e);
                window.location.reload();
              }
            }}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Clear Storage & Reload
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading || !storeReady || authLoading) {
    return <LoadingScreen />;
  }

  // Render main app with routing
  try {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              {!onboardingComplete ? (
                <OnboardingWizard onComplete={async () => {
                  try {
                    const { useStore } = await import('./store/useStore');
                    useStore.getState().setOnboardingComplete(true);
                    setOnboardingComplete(true);
                  } catch (e) {
                    console.error('Failed to complete onboarding:', e);
                    setOnboardingComplete(true);
                  }
                }} />
              ) : (
                <Layout />
              )}
            </ProtectedRoute>
          } />
        </Routes>
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Global overlays */}
        <OfflineIndicator />
        <SessionExpiryNotice />
        <PWAInstallPrompt />
      </Suspense>
    );
  } catch (error) {
    console.error('Render error:', error);
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', minHeight: '100vh', background: '#fee2e2' }}>
        <div style={{ maxWidth: '600px', margin: '50px auto', background: 'white', padding: '30px', borderRadius: '8px' }}>
          <h1 style={{ color: '#ef4444', marginTop: 0 }}>⚠️ Render Error</h1>
          <p>An error occurred while rendering the app.</p>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '12px' }}>
            {error instanceof Error ? error.toString() : String(error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

// Wrap App in Error Boundary
function AppWithErrorBoundary() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}

export default AppWithErrorBoundary;
