import React, { useState } from 'react';

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Slight delay for UX polish
    await new Promise(r => setTimeout(r, 400));

    if (isLogin) {
      if (email === 'rep@syngenta.com' && password === 'rep123') {
        onLogin('rep', { name: 'Rahul Mehta', id: 'REP_0001', territory: 'Pune District', tehsil: 'Patna_T001' });
      } else if (email === 'mgr@syngenta.com' && password === 'mgr123') {
        onLogin('mgr', { name: 'Priya Kulkarni', id: 'MGR_0105', territory: 'Maharashtra West' });
      } else {
        setError('Invalid credentials. Use the Quick Login buttons below.');
      }
    } else {
      if (email.includes('@syngenta.com')) {
        onLogin('rep', { name: email.split('@')[0], id: 'NEW-REP', territory: 'Unassigned' });
      } else {
        setError('Must use a valid @syngenta.com corporate email.');
      }
    }
    setLoading(false);
  };

  const quickLogin = (role) => {
    if (role === 'rep') {
      setEmail('rep@syngenta.com'); setPassword('rep123');
      onLogin('rep', { name: 'Rahul Mehta', id: 'REP_0001', territory: 'Pune District' });
    } else {
      setEmail('mgr@syngenta.com'); setPassword('mgr123');
      onLogin('mgr', { name: 'Priya Kulkarni', id: 'MGR_0105', territory: 'Maharashtra West' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--color-background)', padding: '1.5rem' }}>

      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #00a65a, #005A8C)', width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 8px 32px rgba(0,166,90,0.45)' }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '4px' }}>AgriSense</h1>
        <p style={{ color: '#00a65a', fontWeight: 700, letterSpacing: '2.5px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Field Co-Pilot AI · v3.0</p>
        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '6px' }}>Powered by Gemini · XGBoost · Isolation Forest</p>
      </div>

      {/* Quick Login Buttons — for demo/judges */}
      <div style={{ width: '100%', maxWidth: '400px', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', marginBottom: '0.6rem' }}>⚡ Quick Demo Login</div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => quickLogin('rep')}
            style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', background: 'rgba(0,166,90,0.15)', border: '1px solid rgba(0,166,90,0.35)', color: '#6ee7b7', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'var(--font-family)' }}
          >
            🌾 Field Rep
          </button>
          <button
            onClick={() => quickLogin('mgr')}
            style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', background: 'rgba(0,90,140,0.15)', border: '1px solid rgba(0,90,140,0.4)', color: '#93c5fd', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'var(--font-family)' }}
          >
            📊 Manager
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>or sign in manually</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Register Device'}
        </h2>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Corporate Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="rep@syngenta.com"
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '1rem', fontFamily: 'var(--font-family)' }}
              onFocus={e => e.target.style.borderColor = '#00a65a'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '1rem', fontFamily: 'var(--font-family)' }}
              onFocus={e => e.target.style.borderColor = '#00a65a'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.25rem', opacity: loading ? 0.75 : 1 }}>
            {loading ? 'Authenticating...' : (isLogin ? 'Secure Login →' : 'Register Field Device')}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
          {isLogin ? "New device? " : "Already registered? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ color: '#00a65a', fontWeight: 700, cursor: 'pointer' }}>
            {isLogin ? 'Register' : 'Log In'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.72rem', color: '#334155', maxWidth: '340px', lineHeight: 1.6 }}>
        Syngenta AgriSense Co-Pilot · AI-Guided Field Force Intelligence<br/>
        Data encrypted in transit · Offline-capable PWA
      </div>
    </div>
  );
}
