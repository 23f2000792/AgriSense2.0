import React, { useState } from 'react';

export default function ProductCatalog({ products }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const displayProducts = products && products.length > 0 ? products : [];

  const filtered = displayProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.crop.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-col gap-4" style={{ paddingBottom: '2rem' }}>
      <div className="mb-2">
        <h2 className="font-extrabold" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Product Catalog</h2>
        <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Browse Syngenta's portfolio and availability</p>
      </div>

      <input 
        type="text" 
        placeholder="Search by product or crop..." 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
          color: '#fff', outline: 'none', marginBottom: '1rem', fontSize: '1rem'
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map((prod, idx) => (
          <div key={prod.id} className="card" style={{ marginBottom: 0, animationDelay: `${idx * 0.1}s`, display: 'flex', flexDirection: 'column' }}>
            <div className="flex-row justify-between" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{prod.name}</div>
                <div className="text-sm" style={{ color: '#94a3b8', marginTop: '2px' }}>{prod.type}</div>
              </div>
              <span className={`chip ${prod.stock === 'High' ? 'chip-high' : prod.stock === 'Medium' ? 'chip-med' : 'chip-low'}`} style={{ margin: 0, background: prod.stock === 'High' ? 'rgba(0, 166, 90, 0.2)' : prod.stock === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: prod.stock === 'High' ? '#6ee7b7' : prod.stock === 'Medium' ? '#fcd34d' : '#fca5a5', border: 'none' }}>
                {prod.stock} Stock
              </span>
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="text-sm mb-2"><span className="text-muted">Target Crops:</span> <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{prod.crop}</span></div>
              <div className="text-sm mb-4"><span className="text-muted">Key Feature:</span> <span style={{ color: '#e2e8f0' }}>{prod.feature}</span></div>
            </div>
            
            <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6ee7b7' }}>
              Recommend in Next Visit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
