import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { apiClient } from './api/client';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import PostTradeInjection from './pages/PostTradeInjection';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  
  // Check auth state on load
  useEffect(() => {
    setIsAuthenticated(apiClient.isAuthenticated());
  }, []);

  const handleAnalyze = async (payload, fields) => {
    setIsAnalyzing(true);
    try {
      const result = await apiClient.analyze(payload, fields);
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
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <Sidebar />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '24px 24px 0 24px', flexShrink: 0 }}>
            <Header onLogout={() => setIsAuthenticated(false)} />
          </div>
          
          <div style={{ flex: 1, padding: '0 24px 24px 24px', overflowY: 'auto' }}>
            <Routes>
              <Route 
                path="/" 
                element={
                  <Home 
                    currentResult={currentResult} 
                    isAnalyzing={isAnalyzing} 
                    handleAnalyze={handleAnalyze} 
                  />
                } 
              />
              <Route path="/post-trade" element={<PostTradeInjection />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
