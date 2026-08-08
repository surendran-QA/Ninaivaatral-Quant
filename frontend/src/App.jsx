import { useState, useEffect } from 'react';
import { apiClient } from './api/client';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import PayloadUploader from './components/PayloadUploader';
import AnalysisResult from './components/AnalysisResult';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  
  // Check auth state on load
  useEffect(() => {
    setIsAuthenticated(apiClient.isAuthenticated());
  }, []);

  const handleAnalyze = async (payload) => {
    setIsAnalyzing(true);
    try {
      const result = await apiClient.analyze(payload);
      setCurrentResult(result);
    } catch (err) {
      console.error(err);
      // Fallback simple error state if needed
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Header onLogout={() => setIsAuthenticated(false)} />
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Left Column: Upload */}
        <div style={{ minHeight: '500px' }}>
          <PayloadUploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </div>
        
        {/* Right Column: Results */}
        <div style={{ minHeight: '500px' }}>
          <AnalysisResult result={currentResult} isLoading={isAnalyzing} />
        </div>
      </div>

      <HistoryPanel />
    </div>
  );
}

export default App;
