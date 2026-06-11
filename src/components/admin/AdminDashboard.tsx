/**
 * AdminDashboard — Platform overview with KPI cards and charts
 */
import React, { useEffect, useState } from 'react';
import { getDashboard } from '../../services/adminService';

// ── Shared card styles ───────────────────────────────────────────────────────
const card = {
  background: 'rgba(15,23,42,0.6)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12,
  padding: '20px 24px',
};

const kpiCard = (accent: string) => ({
  ...card,
  borderLeft: `3px solid ${accent}`,
});

interface DashboardData {
  users: { total: number; active24h: number; active7d: number; new24h: number; new7d: number; tierDistribution: any[] };
  api: { calls24h: number; tokens24h: number; cost24h: number; avgLatency: number; errorRate: number; topEndpoints: any[] };
  health: any;
  services: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    try {
      const res = await getDashboard();
      setData(res.data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState msg={error} onRetry={loadDashboard} />;
  if (!data) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.03em' }}>
          Mission Control
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Platform overview • Last updated {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KPICard accent="#10b981" label="Total Users" value={data.users.total} sub={`+${data.users.new24h} today`} />
        <KPICard accent="#06b6d4" label="Active (24h)" value={data.users.active24h} sub={`${data.users.active7d} this week`} />
        <KPICard accent="#8b5cf6" label="API Calls (24h)" value={data.api.calls24h} sub={`${data.api.avgLatency}ms avg`} />
        <KPICard accent="#f59e0b" label="Token Usage (24h)" value={formatTokens(data.api.tokens24h)} sub={`$${data.api.cost24h} est. cost`} />
        <KPICard accent={data.api.errorRate > 5 ? '#ef4444' : '#10b981'} label="Error Rate" value={`${data.api.errorRate}%`} sub="500+ responses" />
      </div>

      {/* ── Service Health Grid ── */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Service Health</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {data.services.map((svc: any, i: number) => (
            <ServiceBadge key={i} name={svc.name} status={svc.health_status} type={svc.type} />
          ))}
          {/* Core services from health snapshot */}
          {data.health?.services_status && (() => {
            const s = typeof data.health.services_status === 'string'
              ? JSON.parse(data.health.services_status)
              : data.health.services_status;
            return Object.entries(s).map(([name, status]: any) => (
              <ServiceBadge key={name} name={name.toUpperCase()} status={status} type="core" />
            ));
          })()}
        </div>
      </div>

      {/* ── Two Column: Tier Distribution + Top Endpoints ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Tier Distribution */}
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Subscription Tiers</h3>
          {(data.users.tierDistribution || []).map((t: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: tierColor(t.tier),
                }} />
                <span style={{ fontSize: 13, color: '#cbd5e1', textTransform: 'capitalize' }}>{t.tier}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 120, height: 6, borderRadius: 3,
                  background: 'rgba(255,255,255,0.06)',
                }}>
                  <div style={{
                    width: `${Math.min(100, (t.count / data.users.total) * 100)}%`,
                    height: '100%', borderRadius: 3,
                    background: tierColor(t.tier),
                  }} />
                </div>
                <span style={{ fontSize: 13, color: '#94a3b8', minWidth: 30, textAlign: 'right' }}>{t.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Endpoints */}
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Top Endpoints (24h)</h3>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {(data.api.topEndpoints || []).map((ep: any, i: number) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: 12,
              }}>
                <code style={{ color: '#06b6d4', fontFamily: 'monospace', fontSize: 11 }}>{ep.endpoint}</code>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ color: '#94a3b8' }}>{ep.calls} calls</span>
                  <span style={{ color: '#64748b' }}>{ep.avg_ms}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({ accent, label, value, sub }: { accent: string; label: string; value: string | number; sub: string }) {
  return (
    <div style={kpiCard(accent)}>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.03em' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ServiceBadge({ name, status }: { name: string; status: string }) {
  const colors: Record<string, string> = {
    healthy: '#10b981', active: '#10b981', configured: '#3b82f6',
    degraded: '#f59e0b', error: '#ef4444', offline: '#ef4444',
    not_configured: '#64748b', unknown: '#64748b',
  };
  const color = colors[status] || '#64748b';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 20,
      background: `${color}15`, border: `1px solid ${color}30`,
      fontSize: 12,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
      <span style={{ color: '#e2e8f0' }}>{name}</span>
      <span style={{ color, fontSize: 10, textTransform: 'uppercase' }}>{status}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: '#64748b' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #1e293b', borderTopColor: '#10b981',
          borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ fontSize: 13 }}>Loading dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div style={{
      ...card, textAlign: 'center', padding: 40, maxWidth: 400, margin: '60px auto',
      borderColor: 'rgba(239,68,68,0.2)',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <h3 style={{ color: '#ef4444', margin: '0 0 8px' }}>Failed to load dashboard</h3>
      <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 16px' }}>{msg}</p>
      <button onClick={onRetry} style={{
        padding: '8px 20px', borderRadius: 6, border: 'none',
        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
        color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
      }}>Retry</button>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function tierColor(tier: string): string {
  const map: Record<string, string> = {
    free: '#64748b', pro: '#10b981', family: '#8b5cf6', clinical: '#f59e0b',
  };
  return map[tier] || '#64748b';
}
