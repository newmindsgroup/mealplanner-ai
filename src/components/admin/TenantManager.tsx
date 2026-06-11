/**
 * TenantManager — User/tenant management (no private data)
 */
import React, { useEffect, useState } from 'react';
import { getUsers, updateUserRole, getUserUsage } from '../../services/adminService';

const card = { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' };
const td: React.CSSProperties = { padding: '10px 16px', color: '#cbd5e1' };
const selectStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 13, outline: 'none', cursor: 'pointer' };
const pgBtn: React.CSSProperties = { padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.6)', color: '#94a3b8', cursor: 'pointer', fontSize: 12 };

function formatNum(n: number): string {
  if (!n) return '0';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

export default function TenantManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [pg, setPg] = useState({ page: 1, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [roleF, setRoleF] = useState('');
  const [tierF, setTierF] = useState('');
  const [loading, setLoading] = useState(true);
  const [selUser, setSelUser] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => { load(); }, [pg.page, search, roleF, tierF]);

  async function load() {
    setLoading(true);
    try {
      const r = await getUsers({ page: pg.page, limit: 25, search, role: roleF, tier: tierF });
      setUsers(r.data.users); setPg(p => ({ ...p, ...r.data.pagination }));
    } catch {}
    setLoading(false);
  }

  async function changeRole(id: string, email: string, role: 'user' | 'super_admin') {
    if (!confirm(`${role === 'super_admin' ? 'Promote' : 'Demote'} ${email}?`)) return;
    try { await updateUserRole(id, role); load(); } catch (e: any) { alert(e.message); }
  }

  async function viewUsage(id: string) {
    if (selUser === id) { setSelUser(null); return; }
    setSelUser(id);
    try { const r = await getUserUsage(id); setUsage(r.data); } catch { setUsage(null); }
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>Tenant Management</h1>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>All registered accounts — no private data</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Search email or name..." value={search} onChange={e => { setSearch(e.target.value); setPg(p => ({ ...p, page: 1 })); }} style={{ flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
        <select value={roleF} onChange={e => setRoleF(e.target.value)} style={selectStyle}><option value="">All Roles</option><option value="user">User</option><option value="super_admin">Admin</option></select>
        <select value={tierF} onChange={e => setTierF(e.target.value)} style={selectStyle}><option value="">All Tiers</option><option value="free">Free</option><option value="pro">Pro</option><option value="family">Family</option><option value="clinical">Clinical</option></select>
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Email','Name','Role','Tier','API Calls','Tokens','Cost','Last Login','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
              : users.length === 0 ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No users found</td></tr>
              : users.map(u => (
                <React.Fragment key={u.id}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }} onClick={() => viewUsage(u.id)}>
                    <td style={td}><span style={{ color: '#06b6d4' }}>{u.email}</span></td>
                    <td style={td}>{u.name}</td>
                    <td style={td}><span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: u.role === 'super_admin' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)', color: u.role === 'super_admin' ? '#f59e0b' : '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{u.role === 'super_admin' ? 'Admin' : 'User'}</span></td>
                    <td style={td}><span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10b981', textTransform: 'capitalize', fontWeight: 600 }}>{u.tier}</span></td>
                    <td style={td}>{u.api_calls?.toLocaleString()}</td>
                    <td style={td}>{formatNum(u.total_tokens)}</td>
                    <td style={td}>${u.total_cost}</td>
                    <td style={td}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                    <td style={td}><button onClick={e => { e.stopPropagation(); changeRole(u.id, u.email, u.role === 'super_admin' ? 'user' : 'super_admin'); }} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', fontSize: 10, cursor: 'pointer', background: u.role === 'super_admin' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: u.role === 'super_admin' ? '#ef4444' : '#10b981' }}>{u.role === 'super_admin' ? 'Demote' : 'Promote'}</button></td>
                  </tr>
                  {selUser === u.id && usage && (
                    <tr><td colSpan={9} style={{ padding: 16, background: 'rgba(0,0,0,0.3)' }}>
                      <strong style={{ color: '#e2e8f0', fontSize: 12 }}>Usage (last 30 days)</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginTop: 10 }}>
                        {(usage.daily || []).slice(0, 7).map((d: any, i: number) => (
                          <div key={i} style={{ padding: '8px 12px', background: 'rgba(15,23,42,0.5)', borderRadius: 6, fontSize: 11, color: '#94a3b8' }}>
                            <div style={{ color: '#64748b' }}>{d.date}</div>
                            <div>{d.calls} calls • {formatNum(d.tokens_in + d.tokens_out)} tok • ${d.cost}</div>
                          </div>
                        ))}
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {pg.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button disabled={pg.page <= 1} onClick={() => setPg(p => ({ ...p, page: p.page - 1 }))} style={pgBtn}>← Prev</button>
            <span style={{ color: '#64748b', fontSize: 12, lineHeight: '32px' }}>Page {pg.page}/{pg.pages}</span>
            <button disabled={pg.page >= pg.pages} onClick={() => setPg(p => ({ ...p, page: p.page + 1 }))} style={pgBtn}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
