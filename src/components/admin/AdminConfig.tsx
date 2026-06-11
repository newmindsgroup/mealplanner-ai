/**
 * AdminConfig — Read-only system configuration view
 */
import React, { useEffect, useState } from 'react';
import { getConfig } from '../../services/adminService';

const card = { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' };

export default function AdminConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const r = await getConfig(); setConfig(r.data); } catch {}
    setLoading(false);
  }

  if (loading) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!config) return null;

  const sections = [
    { title: 'Server', icon: '🖥️', data: config.server },
    { title: 'Database', icon: '🗄️', data: config.database },
    { title: 'AI Providers', icon: '🤖', data: config.ai },
    { title: 'Rate Limiting', icon: '🚦', data: config.rateLimit },
    { title: 'File Upload', icon: '📎', data: config.upload },
    { title: 'Email (SMTP)', icon: '📧', data: config.smtp },
    { title: 'Stripe Billing', icon: '💳', data: config.stripe },
    { title: 'NourishAI Swarm', icon: '🐝', data: config.swarm },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>Configuration</h1>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px' }}>Read-only system configuration • Environment: <strong style={{ color: '#10b981' }}>{config.environment}</strong></p>
      <div style={{ fontSize: 11, color: '#475569', marginBottom: 24, padding: '8px 14px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
        ⚠️ Secrets are masked. To change configuration, update environment variables and restart the server.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {sections.map(section => (
          <div key={section.title} style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{section.icon}</span> {section.title}
            </h3>
            {section.data && typeof section.data === 'object' ? (
              Object.entries(section.data).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 12 }}>
                  <span style={{ color: '#64748b' }}>{formatKey(key)}</span>
                  <span style={{ color: typeof value === 'boolean' ? (value ? '#10b981' : '#ef4444') : '#e2e8f0', fontFamily: typeof value === 'string' ? 'monospace' : 'inherit', fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatValue(value)}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: 12 }}>Not available</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace('_', ' ');
}

function formatValue(value: any): string {
  if (typeof value === 'boolean') return value ? '✅ Yes' : '❌ No';
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined) return '—';
  return String(value);
}
