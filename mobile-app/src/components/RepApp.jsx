import React, { useState } from 'react';

export default function RepApp({ visits }) {
  if (!visits || visits.length === 0) return <div>No visits planned for today.</div>;
  
  const [expandedId, setExpandedId] = useState(visits[0].id);

  return (
    <div className="flex-col gap-4">
      {/* Date and Summary */}
      <div className="mb-2">
        <h2 className="font-bold" style={{ fontSize: '1.5rem' }}>Today's Plan</h2>
        <p className="text-muted text-sm">May 14, 2026 • IND-MH-01 (Pune)</p>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div className="card" style={{ minWidth: '140px', flex: 1, marginBottom: 0, padding: '1rem' }}>
          <div className="text-muted text-sm font-bold mb-1">Visits</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{visits.length}</div>
          <div className="text-sm" style={{ color: 'var(--color-success)' }}>On track</div>
        </div>
        <div className="card" style={{ minWidth: '140px', flex: 1, marginBottom: 0, padding: '1rem' }}>
          <div className="text-muted text-sm font-bold mb-1">High Pri.</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{visits.filter(v => v.priority === 'High').length}</div>
          <div className="text-sm" style={{ color: 'var(--color-danger)' }}>Optimized</div>
        </div>
      </div>

      <h3 className="font-bold mt-4 mb-2">Visit Sequence</h3>

      {/* List of Visits */}
      {visits.map((visit, index) => {
        const isExpanded = expandedId === visit.id;
        const chipClass = visit.priority === 'High' ? 'chip-high' : visit.priority === 'Medium' ? 'chip-med' : 'chip-low';
        
        return (
          <div 
            key={visit.id} 
            className="card" 
            style={{ 
              padding: '0', 
              overflow: 'hidden', 
              animationDelay: `${index * 0.1}s`,
              borderLeft: visit.priority === 'High' ? '4px solid var(--color-danger)' : '4px solid var(--color-warning)'
            }}
          >
            {/* Card Header */}
            <div 
              style={{ padding: '1.25rem', cursor: 'pointer' }}
              onClick={() => setExpandedId(isExpanded ? null : visit.id)}
            >
              <div className="flex-row justify-between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div className="flex-row gap-2 mb-1">
                    <span className="font-bold" style={{ fontSize: '1.1rem' }}>{visit.name}</span>
                  </div>
                  <div className="text-muted text-sm mb-2">📍 {visit.tehsil} • {visit.type}</div>
                  <span className={`chip ${chipClass}`}>{visit.priority} Priority</span>
                </div>
                <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
                  ▼
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="mt-4 mb-4">
                  <div className="text-sm text-muted font-bold mb-1">TOP REASON</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{visit.reason}</div>
                  
                  {visit.type === 'Retailer' && (
                    <div className="flex-row gap-4 mt-2 text-sm text-muted">
                      <div>30d Sales: <span className="font-bold">{visit.sales30d}</span></div>
                      <div>Coverage: <span className="font-bold">{visit.daysCover} days</span></div>
                    </div>
                  )}
                  {visit.type === 'Grower' && (
                    <div className="flex-row gap-4 mt-2 text-sm text-muted">
                      <div>Crop: <span className="font-bold">{visit.crop}</span></div>
                    </div>
                  )}
                </div>

                <div style={{ background: 'var(--color-primary-light)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                  <div className="flex-row justify-between mb-2">
                    <div className="font-bold" style={{ color: 'var(--color-primary-dark)' }}>🎯 Next Best Action</div>
                    <div className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>{visit.nba.roi}</div>
                  </div>
                  
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {visit.nba.product}
                  </div>
                  <div className="text-sm mb-3">{visit.nba.objective}</div>

                  <div className="text-sm font-bold mb-1">Talking Points:</div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {visit.nba.talkingPoints.map((tp, i) => <li key={i} className="mb-1">{tp}</li>)}
                  </ul>

                  <div>
                    {visit.nba.tags.map(tag => (
                      <span key={tag} className="chip chip-info" style={{ fontSize: '0.65rem' }}>{tag}</span>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); alert('Visit Logged!'); }}>
                  Log Visit Outcome
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
