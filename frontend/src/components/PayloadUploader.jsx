import React, { useState } from 'react';
import { Upload, Play, FileText, Activity } from 'lucide-react';

export default function PayloadUploader({ onAnalyze, isAnalyzing }) {
  const [mode, setMode] = useState('simulator'); // 'simulator' or 'raw'
  
  // Simulator Fields
  const [tradeId, setTradeId] = useState('TEST_' + Math.floor(Math.random() * 1000));
  const [strategy, setStrategy] = useState('MNQ_ORB_Breakout');
  const [date, setDate] = useState('2026-08-09');
  const [direction, setDirection] = useState('LONG');
  const [entryPrice, setEntryPrice] = useState('29500.50');
  const [time, setTime] = useState('09:35:00');
  
  const [payload, setPayload] = useState('');

  const handleSimulatorSubmit = () => {
    if (isAnalyzing) return;
    const generatedPayload = `[MORNING SETUP: ${tradeId}]\nStrategy: ${strategy}\nDate: ${date}\nSymbol: MNQ\nSystem Bias: ${direction}\nEntry: ${entryPrice} @ ${time} ET\n`;
    
    const fields = {
      trade_id: tradeId,
      strategy: strategy,
      date: date,
      direction: direction,
      entry_price: parseFloat(entryPrice),
      time: time
    };
    
    onAnalyze(generatedPayload, fields);
  };

  const handleRawSubmit = () => {
    if (payload.trim() && !isAnalyzing) {
      onAnalyze(payload);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Activity size={20} color="var(--primary-accent)" />
        <h3 style={{ fontSize: '16px', fontWeight: '600', flex: 1 }}>TEST UI: PRE-TRADE SETUP</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn-secondary ${mode === 'simulator' ? 'active' : ''}`}
            onClick={() => setMode('simulator')}
            style={{ padding: '4px 8px', fontSize: '12px', background: mode === 'simulator' ? '#222' : 'transparent' }}
          >
            Simulator
          </button>
          <button 
            className={`btn-secondary ${mode === 'raw' ? 'active' : ''}`}
            onClick={() => setMode('raw')}
            style={{ padding: '4px 8px', fontSize: '12px', background: mode === 'raw' ? '#222' : 'transparent' }}
          >
            Raw Payload
          </button>
        </div>
      </div>
      
      {mode === 'simulator' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
            Simulate a live pre-trade payload from Quantower. This will query the AI for a suggestion and queue the trade for continuous learning.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#888' }}>Trade ID</label>
              <input className="glass-input" value={tradeId} onChange={e => setTradeId(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#888' }}>Strategy</label>
              <input className="glass-input" value={strategy} onChange={e => setStrategy(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#888' }}>Date</label>
              <input className="glass-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#888' }}>Time (ET)</label>
              <input className="glass-input" value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#888' }}>Direction</label>
              <select className="glass-input" value={direction} onChange={e => setDirection(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111' }}>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#888' }}>Entry Price</label>
              <input type="number" className="glass-input" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}></div>
          <button 
            className="btn-primary" 
            onClick={handleSimulatorSubmit}
            disabled={isAnalyzing}
            style={{ width: '100%', marginTop: '16px' }}
          >
            <Play size={18} />
            {isAnalyzing ? 'Analyzing...' : 'Simulate Pre-Trade Analysis'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
          <textarea
            className="glass-input"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Paste your raw JSON or text payload here..."
            style={{
              flex: 1,
              minHeight: '200px',
              resize: 'none',
              marginBottom: '24px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}
          />
          <button 
            className="btn-primary" 
            onClick={handleRawSubmit}
            disabled={isAnalyzing || !payload.trim()}
            style={{ width: '100%' }}
          >
            <Play size={18} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Raw Payload'}
          </button>
        </div>
      )}
    </div>
  );
}
