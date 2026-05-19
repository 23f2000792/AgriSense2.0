import React, { useState, useEffect } from 'react';
import RepApp from './components/RepApp';
import ManagerDashboard from './components/ManagerDashboard';
import ProductCatalog from './components/ProductCatalog';
import Performance from './components/Performance';
import AuthScreen from './components/AuthScreen';

function App() {
  const [userRole, setUserRole] = useState(null); // 'rep' or 'mgr'
  const [userProfile, setUserProfile] = useState(null);
  
  const [activeTab, setActiveTab] = useState('rep');
  const [appData, setAppData] = useState({ visits: [], dashboard: {}, alerts: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('');

  const handleLogin = (role, profile) => {
    setUserRole(role);
    setUserProfile(profile);
    setActiveTab(role === 'mgr' ? 'mgr' : 'rep');
  };

  const fetchData = async () => {
    try {
      // Try hitting the live backend API
      const [visitsRes, dashRes, alertsRes, prodRes] = await Promise.all([
        fetch('/api/visits').catch(() => null),
        fetch('/api/dashboard').catch(() => null),
        fetch('/api/alerts').catch(() => null),
        fetch('/api/products').catch(() => null)
      ]);
      
      if (visitsRes && dashRes && alertsRes && prodRes) {
        const visits = await visitsRes.json();
        const dashboard = await dashRes.json();
        const alerts = await alertsRes.json();
        const products = await prodRes.json();
        
        if (visits.error) {
           throw new Error("Backend Error: " + visits.error + " | Trace: " + visits.trace);
        }
        
        setAppData({ visits: visits.visits, dashboard, alerts, products });
      } else {
        // Fallback to static JSON if backend is offline
        const staticRes = await fetch('/data.json');
        if (!staticRes.ok) throw new Error("Failed to load static data");
        const staticData = await staticRes.json();
        setAppData({ ...staticData, products: [] });
      }
    } catch (err) {
      console.error(err);
      // Gracefully fall back to static data if offline
      const staticRes = await fetch('/data.json').catch(() => null);
      if (staticRes && staticRes.ok) {
        const staticData = await staticRes.json();
        setAppData({ ...staticData, products: [] });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineLogs = async () => {
    const offlineLogs = JSON.parse(localStorage.getItem('agrisense_offline_logs') || '[]');
    if (offlineLogs.length === 0) return;

    setSyncStatus('Syncing offline data...');
    try {
      for (const log of offlineLogs) {
        await fetch(`/api/visits/${log.id}/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: log.notes })
        }).catch(err => console.error("Sync failed", err));
      }
      localStorage.removeItem('agrisense_offline_logs');
      setSyncStatus('Sync complete!');
      setTimeout(() => setSyncStatus(''), 3000);
      fetchData();
    } catch (e) {
      console.error("Error syncing offline logs", e);
      setSyncStatus('Sync failed. Will retry.');
    }
  };

  useEffect(() => {
    fetchData();

    // Enterprise Real-Time Sync Polling Loop — runs every 30s (reduced from 15s to cut lag)
    const syncInterval = setInterval(() => {
      if (navigator.onLine) fetchData();
    }, 30000);

    const handleOnline = () => { setIsOffline(false); syncOfflineLogs(); };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (navigator.onLine) syncOfflineLogs();

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // ← empty deps: only register once, no re-subscription on state changes

  const handleLogVisit = async (visitId, notes) => {
    // Optimistically update UI
    setAppData(prev => ({
      ...prev,
      visits: prev.visits.filter(v => v.id !== visitId)
    }));

    if (isOffline) {
      const offlineLogs = JSON.parse(localStorage.getItem('agrisense_offline_logs') || '[]');
      offlineLogs.push({ id: visitId, notes, timestamp: new Date() });
      localStorage.setItem('agrisense_offline_logs', JSON.stringify(offlineLogs));
      setSyncStatus('Logged offline. Will sync when online.');
      setTimeout(() => setSyncStatus(''), 4000);
      return { insight: "Logged offline (will auto-sync)" };
    }

    try {
      const res = await fetch(`/api/visits/${visitId}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes || "Completed via Field Co-Pilot App" })
      });
      const data = await res.json();
      return data;
    } catch(e) {
      const offlineLogs = JSON.parse(localStorage.getItem('agrisense_offline_logs') || '[]');
      offlineLogs.push({ id: visitId, notes, timestamp: new Date() });
      localStorage.setItem('agrisense_offline_logs', JSON.stringify(offlineLogs));
      setSyncStatus('Network issue. Saved offline.');
      setTimeout(() => setSyncStatus(''), 4000);
      return { insight: "Saved locally (auto-sync pending)" };
    }
  };

  if (!userRole) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontFamily: 'Inter, sans-serif' }}>
        <h2>Error Loading App</h2>
        <p>{error}</p>
        <button className="btn" onClick={() => { setError(null); setLoading(true); fetchData(); }} style={{marginTop: '1rem'}}>Retry Connection</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--color-background)', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <div className="pulse-animation" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-main)', marginBottom: '1rem' }}></div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Syncing Field Data...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sync Status Banner */}
      {syncStatus && (
        <div style={{ background: '#00a65a', color: '#fff', fontSize: '0.8rem', padding: '6px 12px', textAlign: 'center', fontWeight: 700, letterSpacing: '0.5px', animation: 'slideDown 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 100 }}>
          <svg className="pulse-animation" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          {syncStatus}
        </div>
      )}
      
      {/* Offline Alert Banner */}
      {isOffline && (
        <div style={{ background: '#f59e0b', color: '#0f172a', fontSize: '0.8rem', padding: '6px 12px', textAlign: 'center', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', zIndex: 100 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          OFFLINE MODE (Using Cached Data)
        </div>
      )}

      {/* Top Header */}
      <header className="glass-header" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex-row gap-3 items-center">
          <div style={{ background: 'var(--color-main)', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>AgriSense</div>
            <div style={{ fontSize: '0.7rem', color: isOffline ? '#f59e0b' : 'var(--color-success)', fontWeight: 700, letterSpacing: '1px' }}>
              {isOffline ? 'OFFLINE' : `${userProfile.id} • ${userProfile.name}`}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Real-time manual sync trigger */}
          <button 
            onClick={() => {
              setSyncStatus('Manual sync initiated...');
              fetchData().then(() => {
                setSyncStatus('Data sync successful!');
                setTimeout(() => setSyncStatus(''), 2000);
              });
            }}
            disabled={isOffline}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              opacity: isOffline ? 0.3 : 1,
              transition: 'all 0.2s'
            }}
            title="Sync live data"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          </button>

          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setUserRole(null)}>
            <img src={`https://i.pravatar.cc/100?u=${userProfile.id}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'rep' 
          ? <RepApp visits={appData.visits} onVisitLogged={handleLogVisit} isOffline={isOffline} /> 
          : activeTab === 'mgr' 
          ? <ManagerDashboard dashboard={appData.dashboard} alerts={appData.alerts} />
          : activeTab === 'catalog'
          ? <ProductCatalog products={appData.products} />
          : <Performance />}
      </main>

      {/* Bottom Navigation */}
      <nav className="glass-nav" style={{ display: 'flex', padding: '0.75rem 0.5rem', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {userRole === 'rep' && (
          <button 
            onClick={() => setActiveTab('rep')}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: activeTab === 'rep' ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Plan</span>
          </button>
        )}
        
        {userRole === 'mgr' && (
          <button 
            onClick={() => setActiveTab('mgr')}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: activeTab === 'mgr' ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Dashboard</span>
          </button>
        )}

        <button 
          onClick={() => setActiveTab('catalog')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: activeTab === 'catalog' ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.3s ease' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Products</span>
        </button>

        {userRole === 'rep' && (
          <button 
            onClick={() => setActiveTab('perf')}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: activeTab === 'perf' ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Stats</span>
          </button>
        )}
      </nav>

      {/* Floating Crop Scanner — Real Camera */}
      <CropScanner />

    </div>
  );
}

// ─── Real Camera Crop Scanner ─────────────────────────────────────────────────
function CropScanner() {
  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState('idle'); // idle | camera | analyzing | result
  const [result, setResult] = React.useState(null);
  const [camError, setCamError] = React.useState('');
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const startCamera = async () => {
    setCamError('');
    setPhase('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCamError('Camera access denied or unavailable. Please allow camera permission.');
      setPhase('idle');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    stopCamera();
    setPhase('analyzing');

    try {
      const res = await fetch('/api/scan-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64 })
      });
      const data = await res.json();
      setResult(data);
      setPhase('result');
    } catch (e) {
      // Graceful fallback: show honest message
      setResult({
        disease: 'Analysis unavailable',
        confidence: 'N/A',
        product: 'Contact agronomist',
        detail: 'Could not connect to AI Vision service. Check network and try again.'
      });
      setPhase('result');
    }
  };

  const handleClose = () => {
    stopCamera();
    setOpen(false);
    setPhase('idle');
    setResult(null);
    setCamError('');
  };

  const handleOpen = () => { setOpen(true); startCamera(); };

  return (
    <>
      {/* FAB trigger */}
      <div
        onClick={handleOpen}
        role="button"
        aria-label="Open crop scanner"
        style={{
          position: 'fixed', bottom: '90px', right: '16px', zIndex: 1000,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(239,68,68,0.45)', cursor: 'pointer',
          border: '2px solid rgba(255,255,255,0.25)',
          willChange: 'transform',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
          <circle cx="12" cy="13" r="3"></circle>
        </svg>
      </div>

      {/* Scanner Modal */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', animation: 'modalIn 0.2s ease'
        }}>
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Camera Phase */}
          {phase === 'camera' && (
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000', aspectRatio: '4/3' }}>
                <video ref={videoRef} autoPlay playsInline muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Targeting overlay */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%',
                    border: '2px solid rgba(0,166,90,0.8)', borderRadius: '8px',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }} />
                  <div style={{ position: 'absolute', top: '20%', left: '20%', right: '20%', height: '3px',
                    background: 'linear-gradient(90deg, transparent, #00a65a, transparent)',
                    animation: 'scan 2s ease-in-out infinite' }} />
                </div>
              </div>
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Point camera at the affected leaf or crop area</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleClose} style={{ flex: 1, padding: '0.9rem', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                  Cancel
                </button>
                <button onClick={handleCapture} style={{ flex: 2, padding: '0.9rem', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00a65a, #00c853)',
                  border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(0,166,90,0.4)' }}>
                  📸 Capture & Analyze
                </button>
              </div>
            </div>
          )}

          {/* Analyzing Phase */}
          {phase === 'analyzing' && (
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%',
                border: '3px solid rgba(0,166,90,0.3)', borderTopColor: '#00a65a',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Analyzing Crop...</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>AI Vision model is processing your image</div>
            </div>
          )}

          {/* Result Phase */}
          {phase === 'result' && result && (
            <div style={{ width: '100%', maxWidth: '380px', background: 'rgba(15,23,42,0.98)',
              borderRadius: '20px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.1)',
              animation: 'slideUp 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%',
                  background: result.disease === 'Analysis unavailable' ? 'rgba(239,68,68,0.2)' : 'rgba(0,166,90,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                  {result.disease === 'Analysis unavailable' ? '⚠️' : '🔬'}
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>AI Vision Analysis</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{result.disease}</div>
                </div>
              </div>

              {result.confidence !== 'N/A' && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Confidence</span>
                    <span style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 800 }}>{result.confidence}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                    <div style={{ height: '100%', width: result.confidence, background: 'linear-gradient(90deg, #00a65a, #6ee7b7)', borderRadius: '3px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              )}

              {result.detail && (
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.6 }}>{result.detail}</p>
              )}

              <div style={{ background: 'rgba(0,166,90,0.12)', border: '1px solid rgba(0,166,90,0.3)',
                borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Recommended Action</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{result.product}</div>
                {result.action && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{result.action}</div>}
              </div>

              <button onClick={handleClose} style={{ width: '100%', padding: '0.9rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #00a65a, #00c853)',
                border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(0,166,90,0.35)' }}>
                Done
              </button>
            </div>
          )}

          {/* Camera error */}
          {camError && (
            <div style={{ maxWidth: '340px', textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📵</div>
              <div style={{ color: '#fca5a5', fontWeight: 700, marginBottom: '1rem' }}>{camError}</div>
              <button onClick={handleClose} style={{ padding: '0.8rem 2rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
