import React, { useState } from 'react';
import { Upload, Play, FileText } from 'lucide-react';

const EXAMPLES = [
  {
    name: "Volume Profile",
    payload: "[SESSION ID: DEMO_001]\nStrategy: FVP_IB_Strategy\nProfile Shape: bShape\nValue Area: VAH 29800 | POC 29500 | VAL 29200\nSystem Bias: LONG\nIB Range: High 30000 | Low 29000"
  },
  {
    name: "Mean Reversion",
    payload: "Strategy: Mean Reversion on SPY\nEntry: 445.20 | Stop: 443.80 | Target: 447.50\nRSI: 28 (oversold) | VWAP: Below\nTimeframe: 15min"
  },
  {
    name: "Freeform",
    payload: "Today I noticed a double bottom forming on AAPL at the $182 support level. Volume was 2x average. My strategy says to enter long with a tight stop at $180."
  },
  {
    name: "Trade Result",
    payload: "[SESSION ID: DEMO_001]\nStrategy: FVP_IB_Strategy\nResult: TP Hit\nExit Reason: Target Reached\nNet PnL: +50.0\nNotes: Clean breakout above POC with high volume."
  }
];

export default function PayloadUploader({ onAnalyze, isAnalyzing }) {
  const [payload, setPayload] = useState('');

  const handleSubmit = () => {
    if (payload.trim() && !isAnalyzing) {
      onAnalyze(payload);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Upload size={20} color="var(--primary-accent)" />
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>UPLOAD PAYLOAD</h3>
      </div>
      
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '8px' }}>Try an Example:</span>
        {EXAMPLES.map(ex => (
          <button 
            key={ex.name}
            onClick={() => setPayload(ex.payload)}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            <FileText size={12} />
            {ex.name}
          </button>
        ))}
      </div>

      <textarea
        className="glass-input"
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        placeholder="Paste your strategy analysis, trade setup, or any trading payload here..."
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
        onClick={handleSubmit}
        disabled={isAnalyzing || !payload.trim()}
        style={{ width: '100%' }}
      >
        <Play size={18} />
        {isAnalyzing ? 'Analyzing Strategy...' : 'Analyze Strategy'}
      </button>
    </div>
  );
}
