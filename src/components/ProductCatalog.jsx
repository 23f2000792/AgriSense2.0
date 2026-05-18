import React, { useState } from 'react';

export default function ProductCatalog({ products }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [recommendedProd, setRecommendedProd] = useState(null);
  
  const displayProducts = products && products.length > 0 ? products : [];
  const types = ['All', ...Array.from(new Set(displayProducts.map(p => p.type)))];

  const filtered = displayProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'All' || p.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="flex-col gap-4" style={{ paddingBottom: '2rem' }}>
      <div className="mb-2">
        <h2 className="font-extrabold" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Product Catalog</h2>
        <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Browse Syngenta's portfolio • Availability & Margins</p>
      </div>

      <input 
        type="text" 
        placeholder="Search by product or crop..." 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
          color: '#fff', outline: 'none', fontSize: '1rem'
        }}
      />

      {/* Type filter chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{
            padding: '4px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap',
            background: filterType === t ? 'rgba(0,166,90,0.3)' : 'rgba(255,255,255,0.06)',
            color: filterType === t ? '#6ee7b7' : '#94a3b8',
            transition: 'all 0.2s'
          }}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No products match your search.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map((prod, idx) => (
          <div key={prod.id} className="card" style={{ marginBottom: 0, animationDelay: `${idx * 0.05}s`, padding: '1.25rem' }}>
            <div className="flex-row justify-between" style={{ alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>{prod.name}</div>
                <div className="text-sm" style={{ color: '#94a3b8', marginTop: '2px' }}>{prod.type}</div>
              </div>
              <span className={`chip`} style={{ margin: 0, background: prod.stock === 'High' ? 'rgba(0,166,90,0.2)' : prod.stock === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)', color: prod.stock === 'High' ? '#6ee7b7' : prod.stock === 'Medium' ? '#fcd34d' : '#fca5a5', border: 'none', fontSize: '0.72rem', fontWeight: 800 }}>
                {prod.stock} Stock
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crops</div>
                <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600, marginTop: '2px' }}>{prod.crop}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margin</div>
                <div style={{ fontSize: '0.82rem', color: '#6ee7b7', fontWeight: 800, marginTop: '2px' }}>{prod.margin || '—'}</div>
              </div>
              {prod.price && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.5rem 0.75rem', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</div>
                  <div style={{ fontSize: '0.85rem', color: '#fcd34d', fontWeight: 800, marginTop: '2px' }}>{prod.price}</div>
                </div>
              )}
            </div>

            <div className="text-sm mb-3" style={{ color: '#cbd5e1', fontStyle: 'italic' }}>{prod.feature}</div>
            
            <button 
              className="btn" 
              style={{ 
                width: '100%', 
                background: recommendedProd === prod.id ? 'rgba(0, 166, 90, 0.2)' : 'rgba(255,255,255,0.05)', 
                border: recommendedProd === prod.id ? '1px solid rgba(0, 166, 90, 0.4)' : '1px solid rgba(255,255,255,0.1)', 
                color: recommendedProd === prod.id ? '#6ee7b7' : '#fff',
                transition: 'all 0.3s ease',
                fontWeight: 700
              }}
              onClick={() => {
                setRecommendedProd(prod.id);
                setTimeout(() => setRecommendedProd(null), 2500);
              }}
            >
              {recommendedProd === prod.id ? '✓ Added to NBA Pipeline' : 'Recommend in Next Visit'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


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
            
            <button 
              className="btn" 
              style={{ 
                width: '100%', 
                background: recommendedProd === prod.id ? 'rgba(0, 166, 90, 0.2)' : 'rgba(255,255,255,0.05)', 
                border: recommendedProd === prod.id ? '1px solid rgba(0, 166, 90, 0.4)' : '1px solid rgba(255,255,255,0.1)', 
                color: recommendedProd === prod.id ? '#6ee7b7' : '#fff',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setRecommendedProd(prod.id);
                setTimeout(() => setRecommendedProd(null), 2000);
              }}
            >
              {recommendedProd === prod.id ? 'Added to NBA Pipeline ✓' : 'Recommend in Next Visit'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
