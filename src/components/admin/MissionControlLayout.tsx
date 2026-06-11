/**
 * MissionControlLayout — Admin shell with dark sidebar navigation
 */
import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import TenantManager from './TenantManager';
import ApiKeyVault from './ApiKeyVault';
import TokenEconomics from './TokenEconomics';
import SystemHealth from './SystemHealth';
import AuditLogViewer from './AuditLogViewer';
import ServiceRegistry from './ServiceRegistry';
import AdminConfig from './AdminConfig';

const NAV_ITEMS = [
  { path: '', label: 'Dashboard', icon: '📊', end: true },
  { path: 'tenants', label: 'Tenants', icon: '👥' },
  { path: 'api-keys', label: 'API Keys', icon: '🔑' },
  { path: 'tokenomics', label: 'Tokenomics', icon: '💰' },
  { path: 'health', label: 'System Health', icon: '💚' },
  { path: 'audit', label: 'Audit Logs', icon: '📋' },
  { path: 'services', label: 'Services & MCPs', icon: '🔌' },
  { path: 'config', label: 'Configuration', icon: '⚙️' },
];

export default function MissionControlLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#06060b', color: '#e2e8f0',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 260 : 64,
        background: 'linear-gradient(180deg, #0d1117 0%, #0a0e16 100%)',
        borderRight: '1px solid rgba(16,185,129,0.1)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>🛡️</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Mission Control</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>NourishAI Admin</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={`/admin/mc/${item.path}`}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8,
                color: isActive ? '#10b981' : '#94a3b8',
                background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
                marginBottom: 2, transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              })}
            >
              <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: 'center' }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {sidebarOpen && (
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
              {user?.email}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                flex: 1, padding: '8px', borderRadius: 6,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8', cursor: 'pointer', fontSize: 12,
              }}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              title="Back to app"
              style={{
                padding: '8px', borderRadius: 6,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8', cursor: 'pointer', fontSize: 12,
              }}
            >
              🏠
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                padding: '8px', borderRadius: 6,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', cursor: 'pointer', fontSize: 12,
              }}
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{
        flex: 1, marginLeft: sidebarOpen ? 260 : 64,
        padding: '24px 32px', minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
        background: '#06060b',
      }}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="tenants" element={<TenantManager />} />
          <Route path="api-keys" element={<ApiKeyVault />} />
          <Route path="tokenomics" element={<TokenEconomics />} />
          <Route path="health" element={<SystemHealth />} />
          <Route path="audit" element={<AuditLogViewer />} />
          <Route path="services" element={<ServiceRegistry />} />
          <Route path="config" element={<AdminConfig />} />
          <Route path="*" element={<Navigate to="/admin/mc" replace />} />
        </Routes>
      </main>
    </div>
  );
}
