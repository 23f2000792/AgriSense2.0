import React, { useState, useEffect } from 'react';
import RepApp from './components/RepApp';
import ManagerDashboard from './components/ManagerDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('rep');
  const [appData, setAppData] = useState(null);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => setAppData(data))
      .catch(err => console.error("Failed to load data.json:", err));
  }, []);

  if (!appData) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading AI Intelligence...</div>;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">🌱 AgriSense Co-Pilot</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`chip ${activeTab === 'rep' ? 'chip-info' : ''}`}
            onClick={() => setActiveTab('rep')}
            style={{ border: 'none', cursor: 'pointer', margin: 0 }}
          >
            Rep App
          </button>
          <button 
            className={`chip ${activeTab === 'manager' ? 'chip-info' : ''}`}
            onClick={() => setActiveTab('manager')}
            style={{ border: 'none', cursor: 'pointer', margin: 0 }}
          >
            Dashboard
          </button>
        </div>
      </header>
      
      <main className="container animate-slide-up" style={{ flex: 1, paddingBottom: '2rem' }}>
        {activeTab === 'rep' ? <RepApp visits={appData.visits} /> : <ManagerDashboard dashboard={appData.dashboard} alerts={appData.alerts} />}
      </main>
    </div>
  );
}

export default App;
