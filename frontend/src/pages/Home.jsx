import React from 'react';
import PayloadUploader from '../components/PayloadUploader';
import AnalysisResult from '../components/AnalysisResult';
import ContinuousLearningPanel from '../components/ContinuousLearningPanel';
import HistoryPanel from '../components/HistoryPanel';

export default function Home({ currentResult, isAnalyzing, handleAnalyze }) {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        <div style={{ minHeight: '500px' }}>
          <PayloadUploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '500px' }}>
          <AnalysisResult result={currentResult} isLoading={isAnalyzing} />
          <ContinuousLearningPanel />
        </div>
      </div>

      <HistoryPanel />
    </div>
  );
}
