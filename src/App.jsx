import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ISSSection from './components/ISSSection';
import NewsSection from './components/NewsSection';
import AIChatbot from './components/AIChatbot';

function App() {
  const [issData, setIssData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [issHistory, setIssHistory] = useState([]);

  // Track ISS history for charts
  useEffect(() => {
    if (issData) {
      setTimeout(() => {
        setIssHistory(prev => {
          const newHistory = [...prev, issData].slice(-50);
          return newHistory;
        });
      }, 0);
    }
  }, [issData]);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />
      
      <Header />
      
      <main className="dashboard-container" style={{ flex: 1, width: '100%' }}>
        <ISSSection 
          onDataUpdate={setIssData} 
          issHistory={issHistory} 
          newsArticles={newsData} 
        />
        
        <NewsSection onDataUpdate={setNewsData} />
      </main>

      <AIChatbot issData={issData} newsData={newsData} />

      <footer style={{ 
        textAlign: 'center', 
        padding: '30px 24px', 
        color: 'var(--text-muted)', 
        fontSize: '11px',
        borderTop: '1px solid var(--border-color)',
        marginTop: '60px',
        background: 'var(--bg-secondary)',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.5px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }}></span>
            Telemetry: Nominal
          </span>
          <span>Status: Mission Active</span>
          <span>Orbit: Low Earth Orbit (LEO)</span>
        </div>
        <p style={{ opacity: 0.6 }}>&copy; 2026 SpaceWatch Dashboard. Built for FOAI End-Sem Project.</p>
      </footer>
    </div>
  );
}

export default App;
