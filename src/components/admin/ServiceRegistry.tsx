/**
 * ServiceRegistry — MCPs, CLIs, webhooks, external tools management
 */
import React, { useEffect, useState } from 'react';
import { getServices, createService, updateService, deleteService, healthCheckService } from '../../services/adminService';

const card = { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' };

export default function ServiceRegistry() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'mcp', url: '' });
  const [checking, setChecking] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const r = await getServices(); setServices(r.data); } catch {}
    setLoading(false);
  }

  async function handleAdd() {
    if (!form.name) return;
    try { await createService(form); setShowAdd(false); setForm({ name: '', type: 'mcp', url: '' }); load(); } catch (e: any) { alert(e.message); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete service "${name}"?`)) return;
    try { await deleteService(id); load(); } catch (e: any) { alert(e.message); }
  }

  async function handleHealthCheck(id: string) {
    setChecking(id);
    try { await healthCheckService(id); await load(); } catch {}
    setChecking(null);
  }

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    try { await updateService(id, { status: newStatus }); load(); } catch {}
  }

  const statusColor = (s: string) => ({ healthy: '#10b981', active: '#10b981', degraded: '#f59e0b', error: '#ef4444', offline: '#ef4444', unknown: '#64748b', inactive: '#475569' }[s] || '#64748b');
  const typeIcon = (t: string) => ({ mcp: '🔧', api: '🌐', cli: '💻', webhook: '🪝', swarm: '🐝' }[t] || '📦');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Service Registry</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>MCPs, APIs, CLIs, webhooks, and external tools</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ Add Service</button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ ...card, marginBottom: 20, border: '1px solid rgba(16,185,129,0.2)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>Register New Service</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 2fr', gap: 12, marginBottom: 12 }}>
            <input placeholder="Service name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              <option value="mcp">MCP</option><option value="api">API</option><option value="cli">CLI</option><option value="webhook">Webhook</option><option value="swarm">Swarm</option>
            </select>
            <input placeholder="URL (optional)" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Save</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Service Grid */}
      {loading ? <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading...</div> : services.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 40 }}><div style={{ fontSize: 32, marginBottom: 8 }}>📦</div><p style={{ color: '#64748b', fontSize: 13 }}>No services registered. Add one above.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {services.map((svc: any) => (
            <div key={svc.id} style={{ ...card, borderLeft: `3px solid ${statusColor(svc.health_status || svc.status)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{typeIcon(svc.type)}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>{svc.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(6,182,212,0.15)', color: '#06b6d4', textTransform: 'uppercase' }}>{svc.type}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${statusColor(svc.status)}15`, color: statusColor(svc.status), textTransform: 'uppercase' }}>{svc.status}</span>
                  </div>
                </div>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(svc.health_status || 'unknown'), boxShadow: `0 0 8px ${statusColor(svc.health_status || 'unknown')}` }} />
              </div>
              {svc.url && <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginBottom: 8, wordBreak: 'break-all' }}>{svc.url}</div>}
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 12 }}>
                Health: {svc.health_status || 'unknown'} {svc.last_health ? `• ${new Date(svc.last_health).toLocaleString()}` : ''}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleHealthCheck(svc.id)} disabled={checking === svc.id} style={{ ...btnSm, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>{checking === svc.id ? '...' : '🏥 Check'}</button>
                <button onClick={() => toggleStatus(svc.id, svc.status)} style={{ ...btnSm, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>{svc.status === 'active' ? '⏸ Disable' : '▶ Enable'}</button>
                <button onClick={() => handleDelete(svc.id, svc.name)} style={{ ...btnSm, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 13, outline: 'none' };
const btnSm: React.CSSProperties = { padding: '5px 10px', borderRadius: 6, border: 'none', fontSize: 11, cursor: 'pointer' };
