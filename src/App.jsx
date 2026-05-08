import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ISSSection from './components/ISSSection';
import NewsSection from './components/NewsSection';
import ChartsSection from './components/ChartsSection';
import AIChatbot from './components/AIChatbot';

function App() {
  const [issData, setIssData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [issHistory, setIssHistory] = useState([]);

  // Track ISS history for charts
  useEffect(() => {
    if (issData) {
      setIssHistory(prev => {
        const newHistory = [...prev, issData].slice(-50);
        return newHistory;
      });
    }
  }, [issData]);

  return (
    <div className="app-container" style={{ paddingBottom: '100px' }}>
      <Toaster position="top-right" />
      
      <Header />
      
      <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Statistics and Real-time data summary could go here if needed */}
        
        <ISSSection onDataUpdate={setIssData} />
        
        <ChartsSection issHistory={issHistory} newsArticles={newsData} />
        
        <NewsSection onDataUpdate={setNewsData} />
      </main>

      <AIChatbot issData={issData} newsData={newsData} />

      <footer style={{ 
        textAlign: 'center', 
        padding: '40px 20px', 
        color: 'var(--text-muted)', 
        fontSize: '12px',
        borderTop: '1px solid var(--border-color)',
        margin: '40px 20px 0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
          <span>Telemetry: Nominal</span>
          <span>Status: Mission Active</span>
          <span>Orbit: Low Earth Orbit</span>
        </div>
        <p>&copy; 2026 SpaceWatch Dashboard. Built for FOAI End-Sem Project.</p>
      </footer>
    </div>
  );
}

export default App;
