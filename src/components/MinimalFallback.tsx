/**
 * Minimal fallback component that always renders
 * Used as last resort if main app fails
 */

export default function MinimalFallback({ error }: { error?: Error }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#22c55e', marginTop: 0, fontSize: '32px' }}>
          🍽️ Meal Plan Assistant
        </h1>
        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '30px' }}>
          {error ? 'An error occurred while loading the app.' : 'Loading...'}
        </p>
        
        {error && (
          <div style={{
            background: '#fee2e2',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <strong style={{ color: '#991b1b' }}>Error:</strong>
            <pre style={{
              marginTop: '10px',
              fontSize: '12px',
              overflow: 'auto',
              color: '#991b1b'
            }}>
              {error.toString()}
            </pre>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              try {
                localStorage.clear();
                window.location.reload();
              } catch (e) {
                window.location.reload();
              }
            }}
            style={{
              padding: '12px 24px',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Clear Storage & Reload
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#eff6ff',
          borderRadius: '6px',
          textAlign: 'left'
        }}>
          <h3 style={{ marginTop: 0, color: '#1e40af' }}>Troubleshooting:</h3>
          <ol style={{ color: '#1e40af', paddingLeft: '20px' }}>
            <li>Open Browser Console (F12) to see detailed errors</li>
            <li>Check Network tab for failed resource loads</li>
            <li>Try clearing browser cache</li>
            <li>Ensure dev server is running on port 5173</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

