import React, { useState } from 'react';

export default function RepApp({ visits, onVisitLogged }) {
  if (!visits || visits.length === 0) return <div className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>No visits planned for today.</div>;
  
  const [expandedId, setExpandedId] = useState(visits.length > 0 ? visits[0].id : null);
  const [viewMode, setViewMode] = useState('list');
  const [loggingId, setLoggingId] = useState(null);
  const [voiceNotes, setVoiceNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insightMsg, setInsightMsg] = useState(null);

  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (currentTranscript) {
          setVoiceNotes(prev => prev + currentTranscript);
        }
      };
      
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) return alert("Speech recognition is not supported in your browser.");
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="flex-col gap-4">
      {/* Date and Summary */}
      <div className="mb-2 flex-row justify-between" style={{ alignItems: 'flex-end' }}>
        <div>
          <h2 className="font-extrabold" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Today's Plan</h2>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>May 14, 2026 • IND-MH-01 (Pune)</p>
        </div>
        <div className="pulse-animation" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-success)' }}></div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.75rem', margin: '0 -1rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div className="card" style={{ minWidth: '150px', flex: 1, marginBottom: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="text-muted text-sm font-bold mb-1 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Total Visits</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{visits.length}</div>
          <div className="text-sm font-bold mt-2" style={{ color: 'var(--color-success)' }}>On track</div>
        </div>
        <div className="card" style={{ minWidth: '150px', flex: 1, marginBottom: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="text-muted text-sm font-bold mb-1 uppercase tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>High Pri.</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{visits.filter(v => v.priority === 'High').length}</div>
          <div className="text-sm font-bold mt-2" style={{ color: '#fca5a5' }}>AI Optimized</div>
        </div>
      </div>

      <div className="flex-row justify-between mb-2 mt-4" style={{ alignItems: 'center' }}>
        <h3 className="font-bold" style={{ fontSize: '1.25rem', margin: 0 }}>Visit Sequence</h3>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? 'rgba(0, 166, 90, 0.3)' : 'transparent', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>List</button>
          <button onClick={() => setViewMode('map')} style={{ background: viewMode === 'map' ? 'rgba(0, 166, 90, 0.3)' : 'transparent', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>Map</button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '400px', position: 'relative', background: '#0f172a' }}>
          {/* Faux Map Background Grid */}
          <div style={{ width: '100%', height: '100%', backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)' }}>
            
            {/* Faux Routing Line */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <polyline points="40,80 120,180 200,100 280,260 320,150" fill="none" stroke="rgba(0, 166, 90, 0.5)" strokeWidth="4" strokeDasharray="8 8" />
            </svg>

            {/* Map Pins */}
            {visits.map((visit, i) => {
              // Procedurally generate positions for the mock map
              const positions = [
                { top: '80px', left: '40px' },
                { top: '180px', left: '120px' },
                { top: '100px', left: '200px' },
                { top: '260px', left: '280px' },
                { top: '150px', left: '320px' },
                { top: '300px', left: '100px' },
              ];
              const pos = positions[i % positions.length];
              const col = visit.priority === 'High' ? '#ef4444' : '#f59e0b';
              
              return (
                <div key={visit.id} style={{ position: 'absolute', top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="pulse-animation" style={{ width: '20px', height: '20px', borderRadius: '50%', background: col, border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}></div>
                  <div style={{ background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#fff', marginTop: '4px', border: `1px solid ${col}`, whiteSpace: 'nowrap' }}>
                    {i + 1}. {visit.name.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            Start Route via Maps
          </div>
        </div>
      ) : (
      <>
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
              borderLeft: visit.priority === 'High' ? '4px solid #ef4444' : '4px solid #f59e0b',
              boxShadow: visit.priority === 'High' ? '0 10px 25px rgba(239, 68, 68, 0.15)' : 'var(--shadow-glass)'
            }}
          >
            {/* Card Header */}
            <div 
              style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => setExpandedId(isExpanded ? null : visit.id)}
            >
              <div style={{ flex: 1 }}>
                <div className="flex-row gap-2 mb-1">
                  <span className="font-bold" style={{ fontSize: '1.15rem', color: 'var(--color-text-main)' }}>{visit.name}</span>
                </div>
                <div className="text-muted text-sm mb-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {visit.tehsil} • {visit.type}
                </div>
                <span className={`chip ${chipClass}`}>{visit.priority} Priority</span>
              </div>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' 
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            {/* Expanded Content */}
            <div style={{
              maxHeight: isExpanded ? '1000px' : '0',
              opacity: isExpanded ? 1 : 0,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="mt-4 mb-4">
                  <div className="text-sm text-muted font-bold mb-1" style={{ letterSpacing: '0.5px' }}>TOP REASON</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '1.05rem' }}>{visit.reason}</div>
                  
                  {visit.type === 'Retailer' && (
                    <div className="flex-row gap-4 mt-3 text-sm text-muted bg-opacity-50" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div>30d Sales: <span className="font-bold text-main" style={{ color: '#fff' }}>{visit.sales30d}</span></div>
                      <div>Coverage: <span className="font-bold text-main" style={{ color: '#fff' }}>{visit.daysCover} days</span></div>
                    </div>
                  )}
                  {visit.type === 'Grower' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                        <div className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '4px' }}>Crop & Stage</div>
                        <div className="font-bold text-white" style={{ fontSize: '0.9rem' }}>{visit.crop || 'Tomato'} (Pod Formation)</div>
                        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', fontWeight: 600 }}>NDVI Anomaly Detected</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                        <div className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '4px' }}>Demographics</div>
                        <div className="font-bold text-white" style={{ fontSize: '0.9rem' }}>8.5 Acres</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: '2px' }}>Language: Marathi</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '4px' }}>Digital Signals</div>
                          <div className="font-bold text-white" style={{ fontSize: '0.85rem' }}>WhatsApp Campaign: <span style={{ color: '#6ee7b7' }}>Opened (3d ago)</span></div>
                          <div className="font-bold text-white" style={{ fontSize: '0.85rem', marginTop: '2px' }}>Last Scan: <span style={{ color: '#fcd34d' }}>Amistar Top (14d ago)</span></div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>85%</div>
                          <div className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700 }}>Conversion Prob.</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Priority Breakdown Model Visualization */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="text-sm font-bold mb-2" style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    AI Priority Breakdown
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                    {[
                      { label: 'Value Potential', w: visit.priority === 'High' ? '40%' : '20%', c: '#60a5fa' },
                      { label: 'Risk (Stock-out/Agronomic)', w: visit.priority === 'High' ? '30%' : '15%', c: '#ef4444' },
                      { label: 'Opportunity (Digital Pull)', w: visit.priority === 'High' ? '20%' : '45%', c: '#f59e0b' },
                      { label: 'Coverage Urgency', w: visit.priority === 'High' ? '10%' : '20%', c: '#6ee7b7' }
                    ].map(score => (
                      <div key={score.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '120px', fontSize: '0.7rem', color: '#cbd5e1' }}>{score.label}</div>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: score.w, height: '100%', background: score.c }}></div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 600, width: '25px', textAlign: 'right' }}>{score.w}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  background: 'linear-gradient(145deg, rgba(0, 166, 90, 0.15) 0%, rgba(0, 90, 140, 0.1) 100%)', 
                  padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem',
                  border: '1px solid rgba(0, 166, 90, 0.2)', position: 'relative'
                }}>
                  <div className="flex-row justify-between mb-2">
                    <div className="font-bold" style={{ color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                      Next Best Action
                    </div>
                    <div className="font-bold text-sm" style={{ color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '10px' }}>{visit.nba.roi}</div>
                  </div>
                  
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>
                    {visit.nba.product}
                  </div>
                  <div className="text-sm mb-4 text-muted">{visit.nba.objective}</div>

                  <div className="text-sm font-bold mb-2" style={{ color: '#e2e8f0' }}>Talking Points:</div>
                  <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', marginBottom: '1.25rem', color: '#cbd5e1' }}>
                    {visit.nba.talkingPoints.map((tp, i) => <li key={i} className="mb-2">{tp}</li>)}
                  </ul>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {visit.nba.tags.map(tag => (
                      <span key={tag} className="chip chip-info" style={{ margin: 0, fontSize: '0.7rem' }}>{tag}</span>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={(e) => {
                  e.stopPropagation();
                  setLoggingId(visit.id);
                  setVoiceNotes("");
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  Log Visit with Voice
                </button>
              </div>
            </div>
          </div>
        );
      })}
      </>
      )}

      {/* Voice Logging Modal */}
      {loggingId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          padding: '1rem'
        }} onClick={() => setLoggingId(null)}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4" style={{fontSize: '1.25rem'}}>Log Visit Outcome</h3>
            
            <textarea 
              className="chat-input"
              style={{ width: '100%', minHeight: '120px', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
              placeholder="Type your notes here or tap the microphone to speak..."
              value={voiceNotes}
              onChange={e => setVoiceNotes(e.target.value)}
            />

            <div className="flex-row gap-2 justify-between">
              <button 
                className="btn" 
                style={{ flex: 1, background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)', color: isRecording ? '#ef4444' : '#fff', borderColor: isRecording ? '#ef4444' : 'transparent' }}
                onClick={toggleRecording}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                {isRecording ? 'Listening...' : 'Dictate'}
              </button>

              <button 
                className="btn btn-primary" 
                style={{ flex: 1, opacity: isSubmitting ? 0.7 : 1 }}
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const res = await fetch(`/api/visits/${loggingId}/log`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ notes: voiceNotes || "Completed via Field Co-Pilot App" })
                    });
                    const data = await res.json();
                    if (data.insight && data.insight !== "Standard visit completed.") {
                      setInsightMsg(data.insight);
                      // Don't close loggingId yet so we show the insight, or show a separate modal
                      setLoggingId(null);
                    } else {
                      onVisitLogged && onVisitLogged(loggingId);
                      setLoggingId(null);
                    }
                  } catch(e) {
                    onVisitLogged && onVisitLogged(loggingId);
                    setLoggingId(null);
                  }
                  setIsSubmitting(false);
                }}
              >
                {isSubmitting ? 'Analyzing AI...' : 'Submit Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Insight Modal */}
      {insightMsg && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          padding: '1rem', animation: 'fadeIn 0.3s ease'
        }} onClick={() => { setInsightMsg(null); onVisitLogged && onVisitLogged(loggingId); }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', background: 'linear-gradient(145deg, rgba(0, 166, 90, 0.2), rgba(0, 90, 140, 0.15))', border: '1px solid rgba(0, 166, 90, 0.4)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#6ee7b7' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path></svg>
              <h3 className="font-extrabold" style={{ fontSize: '1.25rem', margin: 0 }}>AI Action Extracted</h3>
            </div>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#fff', marginBottom: '1.5rem', fontWeight: 600 }}>
              "{insightMsg}"
            </p>
            
            <button className="btn btn-primary" style={{ width: '100%', background: '#00a65a', color: '#fff', border: 'none' }} onClick={() => { setInsightMsg(null); onVisitLogged && onVisitLogged(loggingId); }}>
              Apply to NBA Pipeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
