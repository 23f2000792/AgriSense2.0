import React, { useState, useEffect } from 'react';
import RepApp from './components/RepApp';
import ManagerDashboard from './components/ManagerDashboard';
import Chatbot from './components/Chatbot';
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVisitLogged = (visitId) => {
    setAppData(prev => ({
      ...prev,
      visits: prev.visits.filter(v => v.id !== visitId)
    }));
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--color-bg)', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <div className="pulse-animation" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-main)', marginBottom: '1rem' }}></div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Syncing Field Data...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="glass-header" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex-row gap-3 items-center">
          <div style={{ background: 'var(--color-main)', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>AgriSense</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700, letterSpacing: '1px' }}>{userProfile.id} • {userProfile.name}</div>
          </div>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setUserRole(null)}>
          <img src={`https://i.pravatar.cc/100?u=${userProfile.id}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'rep' 
          ? <RepApp visits={appData.visits} onVisitLogged={handleVisitLogged} /> 
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

      {/* Floating Crop Scanner */}
      <div 
        onClick={() => {
          setIsScanning(true);
          setTimeout(() => {
            setScanResult({ disease: "Early Blight Detected", confidence: "94%", product: "Amistar Top" });
            setIsScanning(false);
          }, 3000);
        }}
        style={{
          position: 'fixed', bottom: '20px', left: '20px', zIndex: 1000,
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(239,68,68,0.4)', cursor: 'pointer',
          border: '2px solid rgba(255,255,255,0.2)'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
      </div>

      {/* Crop Scanner Modal */}
      {(isScanning || scanResult) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', zIndex: 2000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem'
        }} onClick={() => { if(scanResult) setScanResult(null); }}>
          
          {isScanning ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '250px', height: '250px', border: '2px solid #ef4444', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#ef4444', animation: 'scan 1.5s infinite linear', boxShadow: '0 0 10px #ef4444' }}></div>
              </div>
              <h3 className="mt-4 font-bold pulse-animation" style={{ color: '#fff', fontSize: '1.25rem' }}>Analyzing Crop Image...</h3>
              <p className="text-muted">Connecting to Vision AI Model</p>
            </div>
          ) : (
            <div className="card" style={{ width: '100%', maxWidth: '350px', background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#fca5a5' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h3 className="font-extrabold" style={{ fontSize: '1.25rem', margin: 0 }}>Analysis Complete</h3>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-muted mb-1">Detected Issue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{scanResult.disease}</div>
                <div className="text-sm font-bold mt-1" style={{ color: '#fca5a5' }}>Confidence: {scanResult.confidence}</div>
              </div>
              
              <div style={{ background: 'rgba(0, 166, 90, 0.15)', border: '1px solid rgba(0, 166, 90, 0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div className="text-sm font-bold text-success mb-1">Next Best Action</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Apply {scanResult.product}</div>
              </div>
              
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setScanResult(null)}>
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
}

export default App;
