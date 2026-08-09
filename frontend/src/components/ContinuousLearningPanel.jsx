import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function ContinuousLearningPanel() {
  const [pendingTrades, setPendingTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const fetchTrades = async () => {
    try {
      setLoading(true);
      const trades = await apiClient.getPendingTrades();
      setPendingTrades(trades || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const handleResolveNavigate = (trade) => {
    navigate('/post-trade', { state: { trade } });
  };

  if (loading && pendingTrades.length === 0) return <div style={{ color: 'var(--text-tertiary)' }}>Loading pending trades...</div>;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Continuous Learning Loop</h2>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginBottom: '16px' }}>Trades waiting for Post-Trade resolution to feed the AI Brain.</p>
      
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      
      {pendingTrades.length === 0 ? (
        <p style={{ color: 'var(--text-tertiary)' }}>No pending trades. Everything is resolved!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
          {pendingTrades.map(trade => (
            <div key={trade.trade_id} style={{ 
              padding: '12px', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{trade.symbol || "MNQ"} {trade.direction}</strong> @ {trade.entry_price} <br/>
                <small style={{ color: 'var(--text-tertiary)' }}>{trade.date} {trade.time}</small>
              </div>
              <button 
                onClick={() => handleResolveNavigate(trade)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Resolve Trade
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
