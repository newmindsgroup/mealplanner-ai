/**
 * AuditLogViewer — Real-time filterable audit trail
 */
import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../services/adminService';

const card = { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' };

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [pg, setPg] = useState({ page: 1, total: 0, pages: 0 });
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [pg.page, actionFilter]);

  async function load() {
    setLoading(true);
    try {
      const r = await getAuditLogs({ page: pg.page, limit: 50, action: actionFilter });
      setLogs(r.data.logs); setPg(p => ({ ...p, ...r.data.pagination }));
    } catch {}
    setLoading(false);
  }

  const actionColor = (a: string) => {
    if (a.includes('denied') || a.includes('delete')) return '#ef4444';
    if (a.includes('created') || a.includes('promote')) return '#10b981';
    if (a.includes('updated') || a.includes('changed')) return '#f59e0b';
    return '#06b6d4';
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>Audit Logs</h1>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>Complete trail of admin actions and system events</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input placeholder="Filter by action (e.g. admin.login, service_created)..." value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPg(p => ({ ...p, page: 1 })); }} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
        <button onClick={load} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.1)', color: '#10b981', cursor: 'pointer', fontSize: 12 }}>Refresh</button>
      </div>

      <div style={{ ...card, padding: 0 }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div> : (
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {logs.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No audit logs yet</div> : logs.map((log: any, i: number) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: actionColor(log.action), marginTop: 6, boxShadow: `0 0 6px ${actionColor(log.action)}40` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <code style={{ fontSize: 12, color: actionColor(log.action), fontWeight: 600 }}>{log.action}</code>
                    <span style={{ fontSize: 10, color: '#475569' }}>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {log.actor_email && <span>By <strong style={{ color: '#cbd5e1' }}>{log.actor_email}</strong></span>}
                    {log.target_type && <span> → {log.target_type} {log.target_id && `(${log.target_id.substring(0, 8)}...)`}</span>}
                    {log.ip_address && <span style={{ marginLeft: 8, color: '#475569' }}>IP: {log.ip_address}</span>}
                  </div>
                  {log.details && (
                    <pre style={{ fontSize: 10, color: '#64748b', margin: '6px 0 0', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {pg.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button disabled={pg.page <= 1} onClick={() => setPg(p => ({ ...p, page: p.page - 1 }))} style={pgBtn}>← Prev</button>
            <span style={{ color: '#64748b', fontSize: 12, lineHeight: '32px' }}>Page {pg.page}/{pg.pages} ({pg.total} total)</span>
            <button disabled={pg.page >= pg.pages} onClick={() => setPg(p => ({ ...p, page: p.page + 1 }))} style={pgBtn}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

const pgBtn: React.CSSProperties = { padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.6)', color: '#94a3b8', cursor: 'pointer', fontSize: 12 };
