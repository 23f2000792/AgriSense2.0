import React, { useState } from 'react';

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (email === 'rep@syngenta.com' && password === 'rep123') {
        onLogin('rep', { name: 'Rahul M.', id: 'REP-742', territory: 'Pune District' });
      } else if (email === 'mgr@syngenta.com' && password === 'mgr123') {
        onLogin('mgr', { name: 'Priya K.', id: 'MGR-105', territory: 'Maharashtra West' });
      } else {
        setError('Invalid credentials. Try rep@syngenta.com / rep123');
      }
    } else {
      // Mock Sign Up
      if (email.includes('@syngenta.com')) {
        onLogin('rep', { name: email.split('@')[0], id: 'NEW-REP', territory: 'Unassigned' });
      } else {
        setError('Must use a valid @syngenta.com corporate email.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--color-background)', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--color-main)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 8px 30px rgba(0, 166, 90, 0.4)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '4px' }}>AgriSense</h1>
        <p style={{ color: 'var(--color-success)', fontWeight: 700, letterSpacing: '2px', fontSize: '0.85rem' }}>FIELD CO-PILOT AI</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Corporate Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g., rep@syngenta.com"
              style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none', transition: 'border 0.3s' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-main)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none', transition: 'border 0.3s' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-main)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem', boxShadow: '0 4px 15px rgba(0, 166, 90, 0.3)' }}>
            {isLogin ? 'Secure Login' : 'Register Field Device'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            style={{ color: 'var(--color-success)', fontWeight: 700, cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </div>
      </div>

      {/* Demo Credentials Hint */}
      {isLogin && (
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Demo Credentials:</div>
          <div>Rep: rep@syngenta.com / rep123</div>
          <div>Manager: mgr@syngenta.com / mgr123</div>
        </div>
      )}
    </div>
  );
}
