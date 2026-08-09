import React, { useState, useEffect } from 'react';
import { LogOut, Activity, Circle, Server, Cpu } from 'lucide-react';
import { apiClient } from '../api/client';

export default function Header({ onLogout }) {
  const [health, setHealth] = useState({ backend: 'checking', litellm: 'checking' });

  useEffect(() => {
    // Poll health status every 10 seconds
    const checkHealth = async () => {
      try {
        const res = await apiClient.getHealth();
        setHealth(res);
      } catch (err) {
        setHealth({ backend: 'offline', litellm: 'offline' });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    apiClient.logout();
    onLogout();
  };

  const getStatusColor = (status) => {
    if (status === 'online') return 'var(--success)';
    if (status === 'checking') return 'var(--warning)';
    return 'var(--error)';
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
        
        {/* System Health Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="FastAPI Backend">
            <Server size={14} color={getStatusColor(health.backend)} />
            <span style={{ fontSize: '11px', fontWeight: '600', color: getStatusColor(health.backend) }}>
              API: {health.backend.toUpperCase()}
            </span>
          </div>
          <div style={{ width: '1px', height: '12px', background: 'var(--glass-border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="LiteLLM Engine">
            <Cpu size={14} color={getStatusColor(health.litellm)} />
            <span style={{ fontSize: '11px', fontWeight: '600', color: getStatusColor(health.litellm) }}>
              LLM: {health.litellm.toUpperCase()}
            </span>
          </div>
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
