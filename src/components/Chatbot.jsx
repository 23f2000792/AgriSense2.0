import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi there! I am Vasudev.ai, your Syngenta Field Co-Pilot. Need insights on products or today\'s visits?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const submitDirectMessage = async (msg) => {
    if (isTyping) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsTyping(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't reach the backend. Ensure FastAPI is running." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    submitDirectMessage(userMsg);
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #00a65a, #005a8c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer',
          border: '2px solid rgba(255,255,255,0.2)'
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '20px', zIndex: 1000,
          width: '350px', height: '500px', borderRadius: '16px',
          background: 'var(--color-bg)', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '15px', background: 'linear-gradient(135deg, #00a65a, #005a8c)', color: '#fff', fontWeight: 'bold' }}>
            Vasudev.ai Co-Pilot
          </div>
          
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0, 166, 90, 0.2)',
                border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0, 166, 90, 0.3)',
                padding: '10px 14px', borderRadius: '12px',
                borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                borderBottomLeftRadius: msg.role === 'ai' ? '2px' : '12px',
                maxWidth: '85%', fontSize: '0.9rem', color: '#f8fafc', lineHeight: 1.4
              }}>
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(0, 166, 90, 0.2)',
                border: '1px solid rgba(0, 166, 90, 0.3)',
                padding: '10px 14px', borderRadius: '12px',
                borderBottomLeftRadius: '2px',
                fontSize: '0.9rem', color: '#f8fafc', fontStyle: 'italic'
              }}>
                Vasudev.ai is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '0 10px 10px 10px', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
            <span onClick={() => { const msg = 'Which visits are highest priority?'; setInput(msg); setTimeout(() => { setInput(''); submitDirectMessage(msg); }, 50); }} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>Highest Priority?</span>
            <span onClick={() => { const msg = 'Any pests reported today?'; setInput(msg); setTimeout(() => { setInput(''); submitDirectMessage(msg); }, 50); }} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>Pest Alerts</span>
            <span onClick={() => { const msg = 'Summarize my pending tasks'; setInput(msg); setTimeout(() => { setInput(''); submitDirectMessage(msg); }, 50); }} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>Summary</span>
          </div>

          <div style={{ padding: '0 10px 10px 10px', borderTop: 'none', display: 'flex', gap: '8px' }}>
            <input 
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              style={{
                flex: 1, padding: '10px 15px', borderRadius: '20px',
                border: 'none', background: 'rgba(255,255,255,0.05)',
                color: '#fff', outline: 'none', fontSize: '0.9rem'
              }}
            />
            <button onClick={handleSend} style={{
              width: '40px', height: '40px', borderRadius: '50%', border: 'none',
              background: '#00a65a', color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
