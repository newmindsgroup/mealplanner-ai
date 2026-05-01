// CRITICAL: This file MUST render something visible
console.log('🚀 main.tsx is executing...');

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Register service worker for PWA (non-blocking)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, continue without it
    });
  });
}

console.log('🚀 Starting app initialization...');

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: white; min-height: 100vh;">
      <h1 style="color: #ef4444;">❌ Critical Error</h1>
      <p>Root element (#root) not found in HTML.</p>
      <p>Please check that index.html contains: <code>&lt;div id="root"&gt;&lt;/div&gt;</code></p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
        Reload Page
      </button>
    </div>
  `;
} else {
  console.log('✅ Root element found');

  // Remove loading fallback immediately
  const loadingFallback = document.getElementById('loading-fallback');
  if (loadingFallback) {
    loadingFallback.remove();
    console.log('✅ Removed loading fallback');
  }

  // Clear any corrupted localStorage on startup if needed
  try {
    const stored = localStorage.getItem('meal-plan-assistant-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if data looks corrupted
        if (parsed.state?.people) {
          const hasOldBloodTypes = parsed.state.people.some((p: any) => 
            p.bloodType && !p.bloodType.includes('+') && !p.bloodType.includes('-')
          );
          if (hasOldBloodTypes) {
            console.log('🔄 Detected old blood type format, will migrate on load...');
          }
        }
      } catch (e) {
        console.warn('⚠️ Corrupted localStorage detected, clearing...');
        localStorage.removeItem('meal-plan-assistant-storage');
      }
    }
  } catch (e) {
    console.warn('Could not check localStorage:', e);
  }

  // Render immediately with loading screen, then load App
  try {
    console.log('✅ Creating React root...');

    const root = ReactDOM.createRoot(rootElement);
    
    // Show loading screen immediately
    root.render(
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

    console.log('✅ Initial render successful, loading App component...');

    // Load App component asynchronously
    Promise.all([
      import('./App.tsx'),
      import('react-router-dom'),
      import('./contexts/AuthContext'),
      import('./contexts/HouseholdContext')
    ]).then(([
      { default: App },
      { BrowserRouter },
      { AuthProvider },
      { HouseholdProvider }
    ]) => {
      console.log('✅ App component loaded, rendering...');
      
      root.render(
        <React.StrictMode>
          <BrowserRouter>
            <AuthProvider>
              <HouseholdProvider>
                <App />
              </HouseholdProvider>
            </AuthProvider>
          </BrowserRouter>
        </React.StrictMode>
      );

      console.log('✅ App rendered successfully');
    }).catch((error) => {
      console.error('❌ Failed to load App component:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      
      root.render(
        <div style={{
          padding: '50px',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          background: '#fee2e2',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '600px'
          }}>
            <h1 style={{ color: '#ef4444', marginTop: 0 }}>❌ Failed to Load App</h1>
            <p><strong>Error:</strong> {err.message}</p>
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Stack Trace</summary>
              <pre style={{
                background: '#f5f5f5',
                padding: '15px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                {err.stack || err.toString()}
              </pre>
            </details>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                padding: '12px 24px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '20px'
              }}
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      );
    });

  } catch (error) {
    console.error('❌ Failed to create root:', error);
    const err = error instanceof Error ? error : new Error(String(error));
    
    rootElement.innerHTML = `
      <div style="padding: 50px; font-family: sans-serif; text-align: center; background: #fee2e2; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px;">
          <h1 style="color: #ef4444; margin-top: 0;">❌ Critical Error</h1>
          <p>Failed to initialize React.</p>
          <p><strong>Error:</strong> ${err.message}</p>
          <button
            onclick="localStorage.clear(); location.reload();"
            style="
              margin-top: 20px;
              padding: 12px 24px;
              background: #ef4444;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
            "
          >
            Clear Storage & Reload
          </button>
        </div>
      </div>
    `;
  }
}
