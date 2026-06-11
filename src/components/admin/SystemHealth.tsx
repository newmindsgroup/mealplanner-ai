/**
 * SystemHealth — Live service checks, DB stats, historical snapshots
 */
import React, { useEffect, useState } from 'react';
import { getHealth, getHealthHistory, getDatabaseHealth } from '../../services/adminService';

const card = { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' };

export default function SystemHealth() {
  const [health, setHealth] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [dbTables, setDbTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [h, hist, db] = await Promise.all([getHealth(), getHealthHistory(24), getDatabaseHealth()]);
      setHealth(h.data); setHistory(hist.data); setDbTables(db.data);
    } catch {}
    setLoading(false);
  }

  if (loading) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!health) return null;

  const statusColor = (s: string) => {
    const m: Record<string, string> = { healthy: '#10b981', active: '#10b981', configured: '#3b82f6', degraded: '#f59e0b', error: '#ef4444', offline: '#ef4444', not_configured: '#64748b', unknown: '#64748b' };
    return m[s] || '#64748b';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>System Health</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Live checks • Uptime: {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</p>
        </div>
        <button onClick={load} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.1)', color: '#10b981', cursor: 'pointer', fontSize: 12 }}>🔄 Refresh</button>
      </div>

      {/* Service Checks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        {Object.entries(health.checks || {}).map(([name, info]: any) => (
          <div key={name} style={{ ...card, borderLeft: `3px solid ${statusColor(info.status)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', textTransform: 'uppercase' }}>{name}</span>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(info.status), boxShadow: `0 0 8px ${statusColor(info.status)}` }} />
            </div>
            <div style={{ fontSize: 12, color: statusColor(info.status), marginTop: 6, textTransform: 'capitalize' }}>{info.status}</div>
            {info.latencyMs !== undefined && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{info.latencyMs}ms</div>}
            {info.url && <div style={{ fontSize: 10, color: '#475569', marginTop: 2, fontFamily: 'monospace' }}>{info.url}</div>}
            {info.error && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{info.error}</div>}
          </div>
        ))}
      </div>

      {/* DB + Environment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Database</h3>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            <div style={{ marginBottom: 6 }}>Tables: <strong style={{ color: '#e2e8f0' }}>{health.database.tables}</strong></div>
            <div>Size: <strong style={{ color: '#e2e8f0' }}>{health.database.sizeMb} MB</strong></div>
          </div>
          {dbTables.length > 0 && (
            <div style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}>
              {dbTables.map((t: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 11 }}>
                  <code style={{ color: '#06b6d4' }}>{t.name}</code>
                  <span style={{ color: '#64748b' }}>{t.rows} rows • {t.size_mb}MB</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Environment</h3>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            <Row label="Environment" value={health.environment} />
            <Row label="Server Time" value={new Date(health.serverTime).toLocaleString()} />
            <Row label="Node Uptime" value={`${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m`} />
          </div>
        </div>
      </div>

      {/* History */}
      <div style={card}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Health History (last 24 snapshots)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Time','Users','Active 24h','API Calls','Tokens','Cost','Errors','Latency'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {history.slice(0, 24).map((s: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '6px 10px', color: '#cbd5e1' }}>{new Date(s.snapshot_at).toLocaleString()}</td>
                  <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{s.total_users}</td>
                  <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{s.active_users_24h}</td>
                  <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{s.api_calls_24h}</td>
                  <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{Number(s.tokens_used_24h).toLocaleString()}</td>
                  <td style={{ padding: '6px 10px', color: '#f59e0b' }}>${s.cost_24h}</td>
                  <td style={{ padding: '6px 10px', color: Number(s.error_rate_pct) > 5 ? '#ef4444' : '#94a3b8' }}>{s.error_rate_pct}%</td>
                  <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{s.avg_latency_ms}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><span style={{ color: '#64748b' }}>{label}</span><span style={{ color: '#e2e8f0' }}>{value}</span></div>;
}
