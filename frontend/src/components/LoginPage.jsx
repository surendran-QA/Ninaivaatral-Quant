import React, { useState } from 'react';
import { Lock, LogIn, Activity } from 'lucide-react';
import { apiClient } from '../api/client';
import heroConsole from '../assets/hero_console.png';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await apiClient.login(username, password);
      onLogin(); // Tell parent component we are logged in
    } catch (err) {
      setError('Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh',
      background: 'var(--bg-gradient-start)',
      color: 'var(--text-primary)'
    }}>
      {/* LEFT SIDE: Typography & CTA */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 10%',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Brand/Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px' }}>
          <div style={{
            background: 'var(--primary-accent)',
            borderRadius: '12px',
            padding: '10px',
            display: 'flex'
          }}>
            <Activity size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '1px' }}>
            NINAIVAATRAL QUANT
          </h2>
        </div>

        {/* Hero Headline */}
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '800', 
          lineHeight: '1.1', 
          marginBottom: '24px',
          letterSpacing: '-1px'
        }}>
          Memory-Powered <br />
          <span style={{ color: 'var(--primary-accent)' }}>Trading Intelligence.</span>
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          color: 'var(--text-secondary)', 
          lineHeight: '1.6',
          marginBottom: '48px',
          maxWidth: '450px'
        }}>
          Upload your strategy payloads. Leverage our proprietary Cognee knowledge graph to analyze structural patterns and execute with absolute quantitative precision.
        </p>

        {/* Login Form (CTA) */}
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '400px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>System Access</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ 
                color: 'var(--error)', 
                background: 'rgba(255, 82, 82, 0.1)', 
                padding: '12px', 
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
              <input 
                type="text" 
                className="glass-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username"
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
              <input 
                type="password" 
                className="glass-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }} disabled={isLoading}>
              {isLoading ? 'Authenticating...' : (
                <>
                  <LogIn size={18} />
                  Initialize Engine
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
            <Lock size={12} color="var(--text-secondary)" />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Secure Admin Interface</span>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: Skeuomorphic Hero Visual */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '-20px 0 50px rgba(0,0,0,0.5)'
      }}>
        <img 
          src={heroConsole} 
          alt="Premium Trading Hardware Console" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'left center'
          }}
        />
        {/* Subtle gradient overlay to blend edges */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, var(--bg-gradient-start) 0%, rgba(10,10,26,0) 20%, rgba(10,10,26,0) 100%)',
          pointerEvents: 'none'
        }} />
      </div>
    </div>
  );
}
