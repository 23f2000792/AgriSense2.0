import React, { useState, useEffect } from 'react';
import RepApp from './components/RepApp';
import ManagerDashboard from './components/ManagerDashboard';
import Chatbot from './components/Chatbot';
import ProductCatalog from './components/ProductCatalog';

function App() {
  const [activeTab, setActiveTab] = useState('rep');
  const [appData, setAppData] = useState({ visits: [], dashboard: {}, alerts: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(err.message || "Failed to connect to backend and fallback data is missing.");
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

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div className="pulse-animation" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-main)' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <h2>Error Loading App</h2>
        <p>{error}</p>
        <button className="btn btn-primary mt-4" onClick={fetchData}>Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="glass-nav" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--color-main)', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>AgriSense</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700, letterSpacing: '1px' }}>CO-PILOT AI</div>
          </div>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <img src="https://i.pravatar.cc/100?img=33" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'rep' 
          ? <RepApp visits={appData.visits} onVisitLogged={handleVisitLogged} /> 
          : activeTab === 'mgr' 
          ? <ManagerDashboard dashboard={appData.dashboard} alerts={appData.alerts} />
          : <ProductCatalog products={appData.products} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="glass-nav" style={{ display: 'flex', padding: '0.75rem 1.5rem', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          onClick={() => setActiveTab('rep')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: activeTab === 'rep' ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.3s ease' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Field Plan</span>
        </button>
        <button 
          onClick={() => setActiveTab('mgr')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: activeTab === 'mgr' ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.3s ease' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('catalog')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: activeTab === 'catalog' ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.3s ease' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Products</span>
        </button>
      </nav>

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
}

export default App;
