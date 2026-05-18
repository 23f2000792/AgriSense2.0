import React from 'react';

export default function Performance() {
  const stats = [
    { label: "Visits Completed", value: "42", target: "50", unit: "", color: "#00a65a" },
    { label: "NBA Acceptance", value: "84", target: "75", unit: "%", color: "#f59e0b" },
    { label: "Revenue Impact", value: "1.2", target: "1.0", unit: "L", color: "#3b82f6" },
  ];

  return (
    <div className="flex-col gap-4" style={{ paddingBottom: '2rem' }}>
      <div className="mb-2">
        <h2 className="font-extrabold" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Performance</h2>
        <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Your weekly impact and gamification</p>
      </div>

      {/* Hero Rank Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0, 166, 90, 0.2), rgba(0, 90, 140, 0.2))', border: '1px solid rgba(0, 166, 90, 0.3)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 800, boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}>
          #3
        </div>
        <div>
          <div className="text-sm text-muted font-bold tracking-wide uppercase">Territory Rank</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Top 5% Performer</div>
          <div className="text-sm mt-1" style={{ color: '#6ee7b7' }}>↑ 2 spots this week</div>
        </div>
      </div>

      <h3 className="font-bold mt-4 mb-2" style={{ fontSize: '1.25rem' }}>Weekly Metrics</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem' }}>
            <div className="flex-row justify-between mb-3">
              <div className="font-bold text-muted">{stat.label}</div>
              <div className="font-bold" style={{ color: stat.color }}>Target: {stat.target}{stat.unit}</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#fff' }}>{stat.value}</span>
              <span className="font-bold text-muted">{stat.unit}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (parseFloat(stat.value) / parseFloat(stat.target)) * 100)}%`, 
                height: '100%', 
                background: stat.color,
                borderRadius: '4px',
                transition: 'width 1s ease-in-out'
              }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div className="flex-row gap-3 items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <div>
            <div className="font-bold text-white">Insight</div>
            <div className="text-sm text-muted mt-1">Your high digital engagement converts to 30% more sales. Keep using the AI Scanner!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
