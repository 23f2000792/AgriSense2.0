import React from 'react';

export default function ManagerDashboard({ dashboard, alerts }) {
  if (!dashboard) return <div className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>Loading Analytics...</div>;

  return (
    <div className="flex-col gap-4">
      <div className="mb-4 flex-row justify-between" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h2 className="font-extrabold" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Territory Overview</h2>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>IND-MH-01 (Pune District)</p>
        </div>
        <select 
          className="card" 
          style={{ 
            padding: '0.6rem 1rem', marginBottom: 0, marginTop: '0.5rem',
            background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)', borderRadius: '12px', outline: 'none', cursor: 'pointer', fontWeight: 600
          }}
        >
          <option style={{ background: '#0f172a' }}>Last 7 Days</option>
          <option style={{ background: '#0f172a' }}>Last 30 Days</option>
          <option style={{ background: '#0f172a' }}>This Quarter</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
          <div className="text-muted text-sm font-bold mb-1 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Sales vs Target</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0' }}>{dashboard.sales_vs_target}</div>
          <div className="text-sm font-bold" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            +5% WoW
          </div>
        </div>
        
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
          <div className="text-muted text-sm font-bold mb-1 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Avg Rev / Day</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0', color: '#6ee7b7' }}>{dashboard.avg_rev}</div>
          <div className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>+₹4,500</div>
        </div>
        
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
          <div className="text-muted text-sm font-bold mb-1 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>High Pri Coverage</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0' }}>{dashboard.coverage}</div>
          <div className="text-sm font-bold" style={{ color: '#fcd34d' }}>Target: 95%</div>
        </div>
        
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(0, 166, 90, 0.15), rgba(0, 90, 140, 0.1))', border: '1px solid rgba(0, 166, 90, 0.2)' }}>
          <div className="text-muted text-sm font-bold mb-1 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem', color: '#6ee7b7' }}>NBA Acceptance</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0', color: '#fff' }}>{dashboard.nba_acc}</div>
          <div className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>+8% WoW</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        <div className="pulse-animation" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
        <h3 className="font-extrabold" style={{ fontSize: '1.25rem', margin: 0 }}>Active Anomalies & Alerts</h3>
      </div>
      
      {alerts && alerts.map((alert, idx) => {
        let borderCol = 'rgba(0, 166, 90, 0.6)';
        let chipClass = 'chip-info';
        let bgGrad = 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))';
        let titleColor = '#f8fafc';
        
        if (alert.severity === 'High') {
          borderCol = '#ef4444';
          chipClass = 'chip-high';
          bgGrad = 'linear-gradient(145deg, rgba(239, 68, 68, 0.08), rgba(15, 23, 42, 0.8))';
          titleColor = '#fca5a5';
        } else if (alert.severity === 'Medium') {
          borderCol = '#f59e0b';
          chipClass = 'chip-med';
          bgGrad = 'linear-gradient(145deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.8))';
          titleColor = '#fcd34d';
        }

        return (
          <div 
            key={idx} 
            className="card" 
            style={{ 
              borderLeft: `4px solid ${borderCol}`,
              background: bgGrad,
              animationDelay: `${idx * 0.15}s`
            }}
          >
            <div className="flex-row justify-between mb-2" style={{ alignItems: 'flex-start' }}>
              <div className="font-bold" style={{ fontSize: '1.1rem', color: titleColor, paddingRight: '1rem' }}>{alert.title}</div>
              <span className={`chip ${chipClass}`} style={{ margin: 0, flexShrink: 0 }}>{alert.severity}</span>
            </div>
            <p className="text-sm mb-3" style={{ color: '#cbd5e1', lineHeight: 1.6 }}>{alert.desc}</p>
            <div className="text-sm font-bold" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Affected: <span style={{ color: '#f8fafc' }}>{alert.affected}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
