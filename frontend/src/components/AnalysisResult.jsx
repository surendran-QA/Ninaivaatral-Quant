import React from 'react';
import { Brain, AlertCircle, Clock, Zap } from 'lucide-react';

// A simple SVG radial gauge
const RadialGauge = ({ value, color }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="50" cy="50" r={radius}
          stroke="var(--glass-border)" strokeWidth="8" fill="none"
        />
        <circle
          cx="50" cy="50" r={radius}
          stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', fontSize: '24px', fontWeight: '700' }}>
        {value}
      </div>
    </div>
  );
};

export default function AnalysisResult({ result, isLoading }) {
  
  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          border: '4px solid var(--glass-border)',
          borderTopColor: 'var(--primary-accent)',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Cognee Engine Analyzing...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', opacity: 0.5 }}>
        <Brain size={48} color="var(--text-tertiary)" style={{ marginBottom: '16px' }} />
        <p>Awaiting payload to analyze...</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--success)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--error)';
  };

  const scoreColor = getScoreColor(result.confidence_score);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Metrics Row */}
      <div style={{ display: 'flex', padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '1px' }}>CONFIDENCE SCORE</h4>
          <RadialGauge value={result.confidence_score} color={scoreColor} />
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '1px' }}>HISTORICAL WIN RATE</h4>
          <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '700', color: getScoreColor(result.historical_win_rate) }}>
            {result.historical_win_rate}%
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
        <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} color="var(--warning)" /> AI INSIGHTS (Decision Support)
        </h4>
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '8px', 
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Suggested Bias</div>
            <div style={{ fontWeight: '600', color: result.suggested_bias === 'LONG' ? 'var(--success)' : result.suggested_bias === 'SHORT' ? 'var(--error)' : 'white' }}>
              {result.suggested_bias}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Similar Sessions</div>
            <div style={{ fontWeight: '600' }}>{result.similar_sessions_count} found</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Key Risk</div>
            <div style={{ fontWeight: '500', color: 'var(--warning)' }}>{result.key_risk}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Pattern Notes</div>
            <div style={{ fontSize: '14px' }}>{result.pattern_notes}</div>
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div style={{ padding: '24px', flex: 1 }}>
        <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>AI NARRATIVE</h4>
        <div style={{ 
          borderLeft: '3px solid var(--primary-accent)', 
          paddingLeft: '16px',
          fontSize: '15px',
          lineHeight: '1.6',
          fontStyle: 'italic',
          color: 'var(--text-secondary)'
        }}>
          "{result.narrative}"
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        padding: '16px 24px', 
        background: 'rgba(0,0,0,0.2)', 
        borderTop: '1px solid var(--glass-border)',
        borderRadius: '0 0 var(--radius-card) var(--radius-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          <AlertCircle size={12} />
          <span>AI suggestions are for reference only. Final decisions are yours.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} color="var(--text-tertiary)" />
            <span style={{ color: 'var(--text-secondary)' }}>{result.execution_time}s</span>
          </div>
          <span style={{ color: 'var(--success)' }}>● Success</span>
        </div>
      </div>
    </div>
  );
}
