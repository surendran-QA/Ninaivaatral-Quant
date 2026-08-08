import React from 'react';
import { LogOut, Activity, Circle } from 'lucide-react';
import { apiClient } from '../api/client';

export default function Header({ onLogout }) {
  const handleLogout = () => {
    apiClient.logout();
    onLogout();
  };

  return (
    <header className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      marginBottom: '32px',
      borderRadius: 'var(--radius-card)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'var(--primary-accent)',
          borderRadius: '8px',
          padding: '6px',
          display: 'flex'
        }}>
          <Activity size={20} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px' }}>
            NINAIVAATRAL QUANT
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Circle size={10} fill="var(--success)" color="var(--success)" />
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Online</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="btn-secondary"
          title="Logout"
          style={{ padding: '8px', borderRadius: '8px' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
