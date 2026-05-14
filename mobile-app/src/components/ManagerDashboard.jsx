import React from 'react';

export default function ManagerDashboard({ dashboard, alerts }) {
  if (!dashboard) return <div>Loading...</div>;

  return (
    <div className="flex-col gap-4">
      <div className="mb-2 flex-row justify-between" style={{ flexWrap: 'wrap' }}>
        <div>
          <h2 className="font-bold" style={{ fontSize: '1.5rem' }}>Territory Overview</h2>
          <p className="text-muted text-sm">IND-MH-01 (Pune District)</p>
        </div>
        <select className="card" style={{ padding: '0.5rem', marginBottom: 0, marginTop: '0.5rem' }}>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Quarter</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="text-muted text-sm font-bold mb-1">Sales vs Target</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{dashboard.sales_vs_target}</div>
          <div className="text-sm" style={{ color: 'var(--color-success)' }}>+5% WoW</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="text-muted text-sm font-bold mb-1">Avg Rev / Day</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{dashboard.avg_rev}</div>
          <div className="text-sm" style={{ color: 'var(--color-success)' }}>+₹4,500</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="text-muted text-sm font-bold mb-1">Coverage (High Pri)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{dashboard.coverage}</div>
          <div className="text-sm" style={{ color: 'var(--color-warning)' }}>Target: 95%</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="text-muted text-sm font-bold mb-1">NBA Acceptance</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{dashboard.nba_acc}</div>
          <div className="text-sm" style={{ color: 'var(--color-success)' }}>+8% WoW</div>
        </div>
      </div>

      <h3 className="font-bold mt-4 mb-2">🚨 Active Anomalies & Alerts</h3>
      
      {alerts && alerts.map((alert, idx) => {
        let borderCol = 'var(--color-primary)';
        let chipClass = 'chip-info';
        
        if (alert.severity === 'High') {
          borderCol = 'var(--color-danger)';
          chipClass = 'chip-high';
        } else if (alert.severity === 'Medium') {
          borderCol = 'var(--color-warning)';
          chipClass = 'chip-med';
        }

        return (
          <div key={idx} className="card" style={{ borderLeft: `4px solid ${borderCol}` }}>
            <div className="flex-row justify-between mb-2">
              <div className="font-bold">{alert.title}</div>
              <span className={`chip ${chipClass}`} style={{ margin: 0 }}>{alert.severity}</span>
            </div>
            <p className="text-sm mb-2">{alert.desc}</p>
            <div className="text-xs text-muted">Affected: {alert.affected}</div>
          </div>
        );
      })}
    </div>
  );
}
