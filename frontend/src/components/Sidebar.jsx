import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Home, ArrowRightLeft, X } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div style={{
      width: isOpen ? '250px' : '70px',
      transition: 'width 0.3s ease',
      borderRight: '1px solid var(--glass-border)',
      background: 'rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }}>
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center' }}>
        {isOpen && <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>MENU</h3>}
        <button onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px' }}>
        <NavLink 
          to="/" 
          title="Dashboard"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
            borderRadius: '8px', textDecoration: 'none',
            background: isActive ? 'rgba(108, 99, 255, 0.2)' : 'transparent',
            color: isActive ? 'var(--primary-accent)' : 'var(--text-primary)',
            border: isActive ? '1px solid rgba(108, 99, 255, 0.4)' : '1px solid transparent',
            justifyContent: isOpen ? 'flex-start' : 'center'
          })}
        >
          <Home size={20} />
          {isOpen && <span style={{ whiteSpace: 'nowrap' }}>Dashboard</span>}
        </NavLink>

        <NavLink 
          to="/post-trade" 
          title="Post Trade Injection"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
            borderRadius: '8px', textDecoration: 'none',
            background: isActive ? 'rgba(108, 99, 255, 0.2)' : 'transparent',
            color: isActive ? 'var(--primary-accent)' : 'var(--text-primary)',
            border: isActive ? '1px solid rgba(108, 99, 255, 0.4)' : '1px solid transparent',
            justifyContent: isOpen ? 'flex-start' : 'center'
          })}
        >
          <ArrowRightLeft size={20} />
          {isOpen && <span style={{ whiteSpace: 'nowrap' }}>Post Trade Injection</span>}
        </NavLink>
      </div>
    </div>
  );
}
