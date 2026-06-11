/**
 * TokenEconomics — Token usage visualization, cost tracking, and forecasting
 */
import React, { useEffect, useState } from 'react';
import { getTokenomics, getTokenomicsByUser, getTokenomicsByModel, getTokenomicsForecast } from '../../services/adminService';

const card = { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' };

export default function TokenEconomics() {
  const [range, setRange] = useState('30d');
  const [timeline, setTimeline] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({});
  const [byUser, setByUser] = useState<any[]>([]);
  const [byModel, setByModel] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [range]);

  async function load() {
    setLoading(true);
    try {
      const [tok, users, models, fc] = await Promise.all([
        getTokenomics(range), getTokenomicsByUser(), getTokenomicsByModel(), getTokenomicsForecast()
      ]);
      setTimeline(tok.data.timeline); setTotals(tok.data.totals || {});
      setByUser(users.data); setByModel(models.data); setForecast(fc.data);
    } catch {}
    setLoading(false);
  }

  const fmt = (n: number) => { if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`; return String(n || 0); };
  const maxCost = Math.max(...timeline.map(t => Number(t.cost) || 0), 0.01);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Token Economics</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Cost analysis, consumption, and forecasting</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['24h','7d','30d','90d'].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, cursor: 'pointer',
              background: range === r ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.6)',
              color: range === r ? '#10b981' : '#94a3b8',
            }}>{r}</button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading...</div> : <>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <SumCard label="Total Calls" value={fmt(totals.total_calls)} icon="📡" />
          <SumCard label="Total Tokens" value={fmt(totals.total_tokens)} icon="🪙" />
          <SumCard label="Total Cost" value={`$${totals.total_cost || 0}`} icon="💵" />
          <SumCard label="Projected (30d)" value={forecast ? `$${forecast.projectedMonthly.cost}` : '—'} icon="📈" />
        </div>

        {/* Cost Timeline (bar chart) */}
        <div style={{ ...card, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Cost Over Time</h3>
          {timeline.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 140, paddingTop: 8 }}>
              {timeline.map((t, i) => {
                const h = Math.max(4, (Number(t.cost) / maxCost) * 120);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${t.period}: $${t.cost} | ${fmt(t.tokens_in + t.tokens_out)} tokens`}>
                    <div style={{ width: '100%', height: h, background: 'linear-gradient(180deg, #10b981, #06b6d4)', borderRadius: '4px 4px 0 0', minWidth: 4, transition: 'height 0.3s' }} />
                  </div>
                );
              })}
            </div>
          ) : <div style={{ color: '#64748b', fontSize: 12 }}>No data for this period</div>}
          {timeline.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#475569' }}>
              <span>{timeline[0]?.period}</span><span>{timeline[timeline.length - 1]?.period}</span>
            </div>
          )}
        </div>

        {/* By Model + By User */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Cost by Model (30d)</h3>
            {byModel.map((m: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                <div><code style={{ color: '#06b6d4', fontSize: 11 }}>{m.model}</code> <span style={{ color: '#475569', fontSize: 10 }}>({m.provider})</span></div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ color: '#94a3b8' }}>{m.calls} calls</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>${m.total_cost}</span>
                </div>
              </div>
            ))}
            {byModel.length === 0 && <div style={{ color: '#64748b', fontSize: 12 }}>No data</div>}
          </div>
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Top Users by Cost (30d)</h3>
            {byUser.slice(0, 10).map((u: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                <span style={{ color: '#cbd5e1' }}>{u.email}</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: '#94a3b8' }}>{fmt(u.total_tokens)} tok</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>${u.total_cost}</span>
                </div>
              </div>
            ))}
            {byUser.length === 0 && <div style={{ color: '#64748b', fontSize: 12 }}>No data</div>}
          </div>
        </div>
      </>}
    </div>
  );
}

function SumCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={{ ...{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' } }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginTop: 4 }}>{value}</div>
    </div>
  );
}
