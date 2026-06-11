/**
 * ApiKeyVault — System API key management and consumption
 */
import React, { useEffect, useState } from 'react';
import { getApiKeys, getApiKeyConsumption } from '../../services/adminService';

const card = { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' };

export default function ApiKeyVault() {
  const [data, setData] = useState<any>(null);
  const [consumption, setConsumption] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [keys, cons] = await Promise.all([getApiKeys(), getApiKeyConsumption(30)]);
      setData(keys.data);
      setConsumption(cons.data);
    } catch {}
    setLoading(false);
  }

  if (loading) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!data) return null;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>API Key Vault</h1>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>System-level API keys and consumption metrics</p>

      {/* System Keys */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>System API Keys</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {(data.systemKeys || []).map((k: any) => (
            <div key={k.provider} style={{
              padding: '14px 18px', borderRadius: 8,
              background: k.configured ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
              border: `1px solid ${k.configured ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', textTransform: 'uppercase' }}>{k.provider}</span>
                  <span style={{ fontSize: 10, marginLeft: 8, padding: '2px 8px', borderRadius: 4, background: k.configured ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: k.configured ? '#10b981' : '#ef4444' }}>
                    {k.configured ? 'Active' : 'Not Set'}
                  </span>
                </div>
              </div>
              {k.maskedKey && <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, fontFamily: 'monospace' }}>{k.maskedKey}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Cost by Provider */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Cost by Provider (30d)</h3>
          {(data.costByProvider || []).map((p: any) => (
            <div key={p.provider} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
              <span style={{ color: '#06b6d4', textTransform: 'uppercase' }}>{p.provider}</span>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ color: '#94a3b8' }}>{p.calls} calls</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>${p.total_cost}</span>
              </div>
            </div>
          ))}
          {(data.costByProvider || []).length === 0 && <div style={{ color: '#64748b', fontSize: 12 }}>No data yet</div>}
        </div>
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>User-Level Keys</h3>
          {(data.userKeyStats || []).length > 0 ? data.userKeyStats.map((s: any) => (
            <div key={s.provider} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
              <span style={{ color: '#cbd5e1', textTransform: 'uppercase' }}>{s.provider}</span>
              <span style={{ color: '#94a3b8' }}>{s.count} total ({s.active} active)</span>
            </div>
          )) : <div style={{ color: '#64748b', fontSize: 12 }}>No user keys registered</div>}
        </div>
      </div>

      {/* Daily Consumption */}
      <div style={card}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Daily Consumption (30d)</h3>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Date','Provider','Calls','Tokens In','Tokens Out','Cost'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {consumption.slice(0, 60).map((r: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '6px 12px', color: '#cbd5e1' }}>{r.date}</td>
                  <td style={{ padding: '6px 12px', color: '#06b6d4', textTransform: 'uppercase' }}>{r.provider}</td>
                  <td style={{ padding: '6px 12px', color: '#94a3b8' }}>{r.calls}</td>
                  <td style={{ padding: '6px 12px', color: '#94a3b8' }}>{Number(r.tokens_in).toLocaleString()}</td>
                  <td style={{ padding: '6px 12px', color: '#94a3b8' }}>{Number(r.tokens_out).toLocaleString()}</td>
                  <td style={{ padding: '6px 12px', color: '#f59e0b', fontWeight: 600 }}>${r.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
