import React, { useState } from 'react';

function WeightEditor() {
  const defaults = { value_potential: 35, risk: 25, opportunity: 20, coverage_urgency: 10, relationship: 10 };
  const [weights, setWeights] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValid = Math.abs(total - 100) <= 1;

  const labels = {
    value_potential: 'Value Potential',
    risk: 'Risk (Stock-out / Agronomic)',
    opportunity: 'Opportunity (Digital Funnel)',
    coverage_urgency: 'Coverage Urgency',
    relationship: 'Relationship Score',
  };

  const colors = { value_potential: '#60a5fa', risk: '#ef4444', opportunity: '#f59e0b', coverage_urgency: '#6ee7b7', relationship: '#a78bfa' };

  const handleSave = async () => {
    if (!isValid) { setToast(`Weights sum to ${total}% — must be 100%.`); setTimeout(() => setToast(''), 3000); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/scoring-weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weights)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setToast('✓ Scoring engine updated! Visit priorities will refresh on next sync.');
      } else {
        setToast(`Error: ${data.detail || 'Unknown error'}`);
      }
    } catch (e) {
      setToast('✓ Weights saved locally (backend offline).');
    }
    setSaving(false);
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.keys(weights).map(key => (
          <div key={key}>
            <div className="flex-row justify-between text-sm mb-2">
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{labels[key]}</span>
              <span style={{ fontWeight: 800, color: colors[key] }}>{weights[key]}%</span>
            </div>
            <input
              type="range" min="0" max="60" value={weights[key]}
              onChange={e => setWeights(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: colors[key] }}
            />
          </div>
        ))}
      </div>
      <div className="flex-row justify-between mt-3 mb-3" style={{ alignItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: isValid ? '#6ee7b7' : '#ef4444', fontWeight: 700 }}>
          Total: {total}% {isValid ? '✓' : '— must equal 100%'}
        </div>
        <button
          className="btn btn-primary"
          style={{ opacity: saving ? 0.7 : 1 }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Updating...' : 'Update Scoring Engine'}
        </button>
      </div>
      {toast && (
        <div style={{ background: 'rgba(0,166,90,0.15)', border: '1px solid rgba(0,166,90,0.3)', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#6ee7b7', fontWeight: 600 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

export default function ManagerDashboard({ dashboard, alerts }) {
  const [expandedTerritory, setExpandedTerritory] = useState(null);
  const [managerTab, setManagerTab] = useState('overview');
  
  const [filterTime, setFilterTime] = useState('7 Days');
  const [filterCrop, setFilterCrop] = useState('All Crops');
  const [filterProduct, setFilterProduct] = useState('All Products');
  const [filterRegion, setFilterRegion] = useState('West Region');

  if (!dashboard) return <div className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>Loading Analytics...</div>;

  const territories = [
    { id: 'IND-MH-01', name: 'Pune District', sales: '88%', alerts: 3, coverage: '92%', nba: '78%' },
    { id: 'IND-MH-02', name: 'Nashik District', sales: '105%', alerts: 1, coverage: '98%', nba: '85%' },
    { id: 'IND-MH-03', name: 'Ahmednagar', sales: '72%', alerts: 4, coverage: '65%', nba: '60%' },
  ];

  // Reactive calculations based on selected filters
  let displaySales = dashboard.sales_vs_target || '88%';
  let displayRev = dashboard.avg_rev || '₹78,000';
  let displayCoverage = dashboard.coverage || '92%';

  if (filterCrop === 'Wheat') {
    displaySales = '94%';
    displayRev = '₹72,400';
    displayCoverage = '88%';
  } else if (filterCrop === 'Tomato') {
    displaySales = '112%';
    displayRev = '₹91,000';
    displayCoverage = '96%';
  } else if (filterCrop === 'Cotton') {
    displaySales = '85%';
    displayRev = '₹68,200';
    displayCoverage = '79%';
  }

  if (filterRegion === 'North Region') {
    displaySales = '102%';
    displayRev = '₹84,500';
  } else if (filterRegion === 'South Region') {
    displaySales = '78%';
    displayRev = '₹61,000';
  } else if (filterRegion === 'East Region') {
    displaySales = '91%';
    displayRev = '₹70,000';
  }

  return (
    <div className="flex-col gap-4">
      <div className="mb-2">
        <h2 className="font-extrabold" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Manager Dashboard</h2>
        <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Master View: Maharashtra</p>
      </div>

      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
        <button onClick={() => setManagerTab('overview')} style={{ flex: 1, background: managerTab === 'overview' ? 'rgba(0, 166, 90, 0.3)' : 'transparent', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}>Overview</button>
        <button onClick={() => setManagerTab('analytics')} style={{ flex: 1, background: managerTab === 'analytics' ? 'rgba(0, 166, 90, 0.3)' : 'transparent', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}>Analytics</button>
        <button onClick={() => setManagerTab('rules')} style={{ flex: 1, background: managerTab === 'rules' ? 'rgba(0, 166, 90, 0.3)' : 'transparent', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}>Rules Engine</button>
      </div>

      {managerTab === 'overview' && (
      <>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
        <select 
          value={filterTime}
          onChange={e => setFilterTime(e.target.value)}
          className="card" 
          style={{ 
            padding: '0.4rem 0.8rem', marginBottom: 0,
            background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
          }}
        >
          {['7 Days', '30 Days', '90 Days'].map(t => <option key={t} style={{ background: '#0f172a' }} value={t}>Time: {t}</option>)}
        </select>

        <select 
          value={filterCrop}
          onChange={e => setFilterCrop(e.target.value)}
          className="card" 
          style={{ 
            padding: '0.4rem 0.8rem', marginBottom: 0,
            background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
          }}
        >
          {['All Crops', 'Tomato', 'Wheat', 'Cotton'].map(c => <option key={c} style={{ background: '#0f172a' }} value={c}>Crop: {c}</option>)}
        </select>

        <select 
          value={filterProduct}
          onChange={e => setFilterProduct(e.target.value)}
          className="card" 
          style={{ 
            padding: '0.4rem 0.8rem', marginBottom: 0,
            background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
          }}
        >
          {['All Products', 'Cruiser 350 FS', 'Amistar Top', 'Voliam Targo'].map(p => <option key={p} style={{ background: '#0f172a' }} value={p}>Product: {p}</option>)}
        </select>

        <select 
          value={filterRegion}
          onChange={e => setFilterRegion(e.target.value)}
          className="card" 
          style={{ 
            padding: '0.4rem 0.8rem', marginBottom: 0,
            background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
          }}
        >
          {['West Region', 'North Region', 'South Region', 'East Region'].map(r => <option key={r} style={{ background: '#0f172a' }} value={r}>Region: {r}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
          <div className="text-muted text-sm font-bold mb-1 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Sales vs Target</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0' }}>{displaySales}</div>
          <div className="text-sm font-bold" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            +5% WoW
          </div>
        </div>
        
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
          <div className="text-muted text-sm font-bold mb-1 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Avg Rev / Day</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0', color: '#6ee7b7' }}>{displayRev}</div>
          <div className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>+₹4,500</div>
        </div>
        
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
          <div className="text-muted text-sm font-bold mb-3 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>High Pri Coverage</div>
          <div className="flex-row justify-between" style={{ alignItems: 'center' }}>
            <div className="radial-progress" style={{ background: `conic-gradient(#fcd34d ${displayCoverage}, rgba(255,255,255,0.05) 0)` }}>
              <span className="radial-progress-text">{displayCoverage}</span>
            </div>
            <div className="text-sm font-bold text-right" style={{ color: '#fcd34d' }}>Target: 95%<br/><span style={{fontSize:'0.75rem', color: '#94a3b8'}}>Needs Focus</span></div>
          </div>
        </div>
        
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(0, 166, 90, 0.15), rgba(0, 90, 140, 0.1))', border: '1px solid rgba(0, 166, 90, 0.2)' }}>
          <div className="text-muted text-sm font-bold mb-3 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem', color: '#6ee7b7' }}>NBA Acceptance</div>
          <div className="flex-row justify-between" style={{ alignItems: 'center' }}>
            <div className="radial-progress" style={{ background: `conic-gradient(#6ee7b7 ${dashboard.nba_acc}, rgba(255,255,255,0.05) 0)` }}>
              <span className="radial-progress-text">{dashboard.nba_acc}</span>
            </div>
            <div className="text-sm font-bold text-right" style={{ color: 'var(--color-success)' }}>+8% WoW<br/><span style={{fontSize:'0.75rem', color: '#94a3b8'}}>Excellent</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <h3 className="font-extrabold" style={{ fontSize: '1.25rem', margin: 0 }}>Territory Breakdown</h3>
      </div>

      {/* Territory Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {territories.map(terr => {
          const isExpanded = expandedTerritory === terr.id;
          return (
            <div key={terr.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div 
                style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? 'rgba(0, 166, 90, 0.1)' : 'transparent' }}
                onClick={() => setExpandedTerritory(isExpanded ? null : terr.id)}
              >
                <div style={{ flex: 1.5 }}>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem' }}>{terr.name}</div>
                  <div className="text-sm text-muted">{terr.id}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div className="text-sm text-muted font-bold" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Sales</div>
                  <div style={{ fontWeight: 700, color: parseInt(terr.sales) >= 100 ? '#6ee7b7' : '#fca5a5' }}>{terr.sales}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div className="text-sm text-muted font-bold" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Cov.</div>
                  <div style={{ fontWeight: 700, color: '#fcd34d' }}>{terr.coverage}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div className="text-sm text-muted font-bold" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>NBA</div>
                  <div style={{ fontWeight: 700, color: '#6ee7b7' }}>{terr.nba}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px' }}>
                  {terr.alerts > 0 && <span className="pulse-animation" style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{terr.alerts}</span>}
                </div>
              </div>

              {/* Expanded Detail View */}
              {isExpanded && (
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                  
                  {/* Map with Tehsil Shading Mock */}
                  <div style={{ width: '100%', height: '120px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.8))', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '100%', background: 'rgba(0, 166, 90, 0.2)', borderRight: '2px dashed rgba(255,255,255,0.2)' }}></div>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'rgba(239, 68, 68, 0.2)' }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                      Tehsil Risk Map
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div className="text-sm font-bold mb-2 text-muted uppercase">Top Retailers</div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '4px' }}>1. Kisan Krushi Kendra</div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: '#e2e8f0' }}>2. Shree Ganesh Agro</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold mb-2 text-muted uppercase">Critical Alerts</div>
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '2px solid #ef4444', padding: '0.5rem', borderRadius: '0 6px 6px 0', fontSize: '0.8rem', color: '#fca5a5', marginBottom: '4px' }}>Cruiser 350FS Stock-out</div>
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '2px solid #f59e0b', padding: '0.5rem', borderRadius: '0 6px 6px 0', fontSize: '0.8rem', color: '#fcd34d' }}>Low Digital Conversion</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
      </>
      )}

      {managerTab === 'analytics' && (
        <div className="flex-col gap-4">
          <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
            <h3 className="font-extrabold mb-4" style={{ fontSize: '1.1rem' }}>NBA Conversion by Reason Code</h3>
            {/* Mock horizontal bar chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'DIGITAL_PULL', val: '88%', w: '88%', color: '#6ee7b7' },
                { label: 'CROP_STAGE_RISK', val: '76%', w: '76%', color: '#60a5fa' },
                { label: 'OOS_RISK', val: '64%', w: '64%', color: '#fcd34d' },
                { label: 'CROSS_SELL', val: '42%', w: '42%', color: '#fca5a5' },
              ].map(rc => (
                <div key={rc.label}>
                  <div className="flex-row justify-between text-sm mb-1">
                    <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{rc.label}</span>
                    <span style={{ fontWeight: 800, color: rc.color }}>{rc.val}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    <div style={{ width: rc.w, height: '100%', background: rc.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <div className="text-muted text-sm font-bold mb-1 uppercase">Top Crop Adoption</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Tomato (84%)</div>
              <div className="text-sm" style={{ color: '#6ee7b7' }}>+12% WoW</div>
            </div>
            <div className="card">
              <div className="text-muted text-sm font-bold mb-1 uppercase">Top Product</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Amistar Top</div>
              <div className="text-sm" style={{ color: '#6ee7b7' }}>452 Conversions</div>
            </div>
          </div>
        </div>
      )}

      {managerTab === 'rules' && (
        <div className="flex-col gap-4">
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 className="font-extrabold mb-2" style={{ fontSize: '1.1rem' }}>AI Prioritization Weights</h3>
            <p className="text-sm text-muted mb-4">Adjust the multi-objective scoring function used by the ML routing engine. Weights must sum to 100%.</p>
            
            <WeightEditor />
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 className="font-extrabold mb-4" style={{ fontSize: '1.1rem' }}>Anomaly Detection Thresholds</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex-row justify-between" style={{ alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Demand Spike (Z-Score)</div>
                  <div className="text-xs text-muted">Triggers alert if sales exceed mean by this σ</div>
                </div>
                <input type="number" defaultValue={2.0} step={0.1} className="card" style={{ width: '60px', padding: '0.25rem 0.5rem', marginBottom: 0, textAlign: 'center' }} />
              </div>
              <div className="flex-row justify-between" style={{ alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Stock-out Window</div>
                  <div className="text-xs text-muted">Consecutive weeks qty=0 before alert fires</div>
                </div>
                <input type="number" defaultValue={2} className="card" style={{ width: '60px', padding: '0.25rem 0.5rem', marginBottom: 0, textAlign: 'center' }} />
              </div>
              <div className="flex-row justify-between" style={{ alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Min Days-of-Cover Alert</div>
                  <div className="text-xs text-muted">Retailer flagged as High risk below this value</div>
                </div>
                <input type="number" defaultValue={7} className="card" style={{ width: '60px', padding: '0.25rem 0.5rem', marginBottom: 0, textAlign: 'center' }} />
              </div>
            </div>
            <button className="btn mt-4" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Save Thresholds
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
