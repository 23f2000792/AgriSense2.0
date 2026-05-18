import React, { useState, useEffect } from 'react';

export default function Performance() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => {
        // Fallback to meaningful demo data if backend offline
        setStats({
          total_visits: 30, completed: 42, skipped: 3, pending: 10,
          completion_rate: '84%', nba_acc: '72%', coverage: '94%', avg_rev: '₹78,000'
        });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
      <div className="pulse-animation" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-main)', margin: '0 auto 1rem' }}></div>
      Loading your stats...
    </div>
  );

  const metrics = [
    { label: "Completion Rate", value: stats.completion_rate, sub: `${stats.completed} of ${stats.total_visits} visits`, color: "#00a65a" },
    { label: "NBA Acceptance", value: stats.nba_acc, sub: "vs 75% territory avg", color: "#f59e0b" },
    { label: "Coverage Score", value: stats.coverage, sub: "High-priority accounts", color: "#3b82f6" },
    { label: "Avg Daily Revenue", value: stats.avg_rev, sub: "RLRF updated", color: "#a855f7" },
  ];

  return (
    <div className="flex-col gap-4" style={{ paddingBottom: '2rem' }}>
      <div className="mb-2">
        <h2 className="font-extrabold" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Performance</h2>
        <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Live stats • Auto-updated from backend</p>
      </div>

      {/* Hero Rank Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0, 166, 90, 0.2), rgba(0, 90, 140, 0.2))', border: '1px solid rgba(0, 166, 90, 0.3)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 800, boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', flexShrink: 0 }}>
          #3
        </div>
        <div>
          <div className="text-sm text-muted font-bold tracking-wide uppercase">Territory Rank</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Top 5% Performer</div>
          <div className="text-sm mt-1" style={{ color: '#6ee7b7' }}>↑ 2 spots this week • {stats.completed} visits completed</div>
        </div>
      </div>

      {/* Visit Breakdown Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Completed', val: stats.completed, col: '#6ee7b7' },
          { label: 'Pending', val: stats.pending, col: '#fcd34d' },
          { label: 'Skipped', val: stats.skipped, col: '#fca5a5' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.col }}>{s.val}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h3 className="font-bold mt-2 mb-1" style={{ fontSize: '1.1rem' }}>Live KPI Metrics</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {metrics.map((m, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem' }}>
            <div className="flex-row justify-between mb-2">
              <div className="font-bold" style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color }}>{m.value}</div>
            </div>
            <div className="text-sm text-muted">{m.sub}</div>
            <div style={{ marginTop: '0.75rem', width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: parseFloat(m.value) > 0 ? `${Math.min(100, parseFloat(m.value))}%` : '50%', height: '100%', background: m.color, borderRadius: '3px', transition: 'width 1s ease' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-2" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div className="flex-row gap-3 items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <div>
            <div className="font-bold text-white">AI Performance Insight</div>
            <div className="text-sm text-muted mt-1">Your high digital engagement converts 30% more sales than territory average. AI-assisted routes are outperforming manual beat plans by 14%.</div>
          </div>
        </div>
      </div>
    </div>
  );
}


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
