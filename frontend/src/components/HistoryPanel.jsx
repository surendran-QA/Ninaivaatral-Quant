import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { apiClient } from '../api/client';

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient.getHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <History size={20} color="var(--primary-accent)" />
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>ANALYSIS HISTORY</h3>
      </div>
      
      {isLoading ? (
        <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Loading history...</div>
      ) : history.length === 0 ? (
        <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No past analyses found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: '500' }}>Timestamp</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '500' }}>Confidence</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '500' }}>Win Rate</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>{formatDate(item.timestamp)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: item.confidence_score >= 70 ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 215, 64, 0.1)',
                      color: item.confidence_score >= 70 ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {item.confidence_score}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>{item.historical_win_rate}%</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--success)' }}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
