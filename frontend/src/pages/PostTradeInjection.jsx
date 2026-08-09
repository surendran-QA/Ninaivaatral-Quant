import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Trash2, CheckCircle, Plus } from 'lucide-react';

export default function PostTradeInjection() {
  const location = useLocation();
  const [pendingTrades, setPendingTrades] = useState([]);
  const [selectedTrades, setSelectedTrades] = useState(new Set());
  const [loading, setLoading] = useState(true);
  
  // Custom Trade Mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTrade, setCustomTrade] = useState({
    trade_id: `CUSTOM_${Math.floor(Math.random()*1000)}`,
    strategy: 'MNQ_ORB_Breakout',
    date: new Date().toISOString().split('T')[0],
    direction: 'LONG',
    entry_price: '',
    time: '09:30',
  });

  // Resolution Form
  const [activeTrade, setActiveTrade] = useState(null);
  const [exitPrice, setExitPrice] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [outcome, setOutcome] = useState('TP (Take Profit Hit) / Profit');

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (location.state?.trade) {
      handleSelectTrade(location.state.trade);
    }
  }, [location.state]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const trades = await apiClient.getPendingTrades();
      setPendingTrades(trades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrade = (trade) => {
    setIsCustomMode(false);
    setActiveTrade(trade);
    setExitPrice('');
    setExitTime('');
  };

  const handleToggleSelect = (tradeId) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId);
    } else {
      newSelected.add(tradeId);
    }
    setSelectedTrades(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedTrades.size === 0) return;
    if (!window.confirm(`Delete ${selectedTrades.size} pending trades?`)) return;

    try {
      await apiClient.deletePendingTrades(Array.from(selectedTrades));
      setSelectedTrades(new Set());
      if (activeTrade && selectedTrades.has(activeTrade.trade_id)) {
        setActiveTrade(null);
      }
      fetchTrades();
    } catch (err) {
      alert("Error deleting trades: " + err.message);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!activeTrade && !isCustomMode) return;
    
    const tradeBase = isCustomMode ? customTrade : activeTrade;
    const entry = parseFloat(tradeBase.entry_price);
    const exit = parseFloat(exitPrice);
    const direction = tradeBase.direction;
    
    let pnl = 0;
    if (direction === "LONG") {
        pnl = (exit - entry) * 20;
    } else {
        pnl = (entry - exit) * 20;
    }

    try {
      if (isCustomMode) {
        // Send a simulated pre-trade payload first, wait for the backend to ingest it
        const payloadText = `[MORNING SETUP: ${tradeBase.trade_id}]\nStrategy: ${tradeBase.strategy}\nDate: ${tradeBase.date}\nSymbol: MNQ\nSystem Bias: ${direction}\nEntry: ${entry} @ ${tradeBase.time} ET\n`;
        await apiClient.analyze(payloadText, { ...tradeBase, entry_price: entry });
      }

      await apiClient.resolveTrade({
        trade_id: tradeBase.trade_id,
        exit_time: exitTime,
        exit_price: exit,
        pnl: pnl,
        outcome: outcome
      });
      
      setActiveTrade(null);
      setIsCustomMode(false);
      setExitPrice('');
      setExitTime('');
      fetchTrades();
      alert("Trade resolved and injected into Brain successfully!");
    } catch (err) {
      alert("Error resolving trade: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', minHeight: '600px' }}>
      
      {/* Left Panel: Pending Trades List */}
      <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px' }}>Pending Trades</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedTrades.size > 0 && (
              <button onClick={handleDeleteSelected} className="btn-secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                <Trash2 size={16} /> Delete ({selectedTrades.size})
              </button>
            )}
            <button onClick={() => { setIsCustomMode(true); setActiveTrade(null); }} className="btn-secondary" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
              <Plus size={16} /> Custom Trade
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
        ) : pendingTrades.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)' }}>No pending trades found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {pendingTrades.map(trade => (
              <div 
                key={trade.trade_id} 
                style={{ 
                  padding: '12px', 
                  background: activeTrade?.trade_id === trade.trade_id ? 'rgba(108, 99, 255, 0.2)' : 'rgba(0,0,0,0.2)', 
                  border: activeTrade?.trade_id === trade.trade_id ? '1px solid var(--primary-accent)' : '1px solid transparent',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectTrade(trade)}
              >
                <input 
                  type="checkbox" 
                  checked={selectedTrades.has(trade.trade_id)}
                  onChange={(e) => { e.stopPropagation(); handleToggleSelect(trade.trade_id); }}
                  style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                />
                <div style={{ flex: 1 }}>
                  <strong>{trade.symbol || "MNQ"} {trade.direction}</strong> @ {trade.entry_price} <br/>
                  <small style={{ color: 'var(--text-tertiary)' }}>{trade.date} {trade.time}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel: Resolution Form */}
      <div className="glass-panel" style={{ flex: 1, padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} color="var(--primary-accent)" />
          {isCustomMode ? "Inject Custom Trade" : activeTrade ? `Resolve: ${activeTrade.trade_id}` : "Select a Trade"}
        </h2>

        {(activeTrade || isCustomMode) ? (
          <form onSubmit={handleResolve} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {isCustomMode && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <h3 style={{ gridColumn: 'span 2', fontSize: '14px', color: 'var(--warning)', margin: 0 }}>Pre-Trade Data</h3>
                <div>
                  <label style={{ fontSize: '12px', color: '#888' }}>Trade ID</label>
                  <input className="glass-input" value={customTrade.trade_id} onChange={e => setCustomTrade({...customTrade, trade_id: e.target.value})} style={{ width: '100%', padding: '8px' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888' }}>Strategy</label>
                  <input className="glass-input" value={customTrade.strategy} onChange={e => setCustomTrade({...customTrade, strategy: e.target.value})} style={{ width: '100%', padding: '8px' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888' }}>Date</label>
                  <input type="date" className="glass-input" value={customTrade.date} onChange={e => setCustomTrade({...customTrade, date: e.target.value})} style={{ width: '100%', padding: '8px' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888' }}>Direction</label>
                  <select className="glass-input" value={customTrade.direction} onChange={e => setCustomTrade({...customTrade, direction: e.target.value})} style={{ width: '100%', padding: '8px', background: '#111' }}>
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888' }}>Entry Price</label>
                  <input type="number" step="0.25" className="glass-input" value={customTrade.entry_price} onChange={e => setCustomTrade({...customTrade, entry_price: e.target.value})} style={{ width: '100%', padding: '8px' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888' }}>Time (ET)</label>
                  <input className="glass-input" value={customTrade.time} onChange={e => setCustomTrade({...customTrade, time: e.target.value})} style={{ width: '100%', padding: '8px' }} required />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888' }}>Exit Time (HH:MM)</label>
                <input 
                  type="text" 
                  value={exitTime} 
                  onChange={(e) => setExitTime(e.target.value)} 
                  required 
                  className="glass-input"
                  style={{ width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#888' }}>Exit Price</label>
                <input 
                  type="number" 
                  step="0.25" 
                  value={exitPrice} 
                  onChange={(e) => setExitPrice(e.target.value)} 
                  required 
                  className="glass-input"
                  style={{ width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#888' }}>Outcome</label>
                <select 
                  value={outcome} 
                  onChange={(e) => setOutcome(e.target.value)}
                  className="glass-input"
                  style={{ width: '100%', background: '#111' }}
                >
                  <option value="TP (Take Profit Hit) / Profit">TP Hit</option>
                  <option value="SL (Stop Loss Hit) / Loss">SL Hit</option>
                  <option value="EOD Flatten / Flat">EOD Flatten</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '16px', background: 'var(--success)' }}>
              Save & Train Brain
            </button>
          </form>
        ) : (
          <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '64px' }}>
            Select a trade from the left or create a custom trade to begin injection.
          </div>
        )}
      </div>

    </div>
  );
}
