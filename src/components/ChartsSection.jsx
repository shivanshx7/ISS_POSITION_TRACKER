import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const ChartsSection = ({ issHistory, newsArticles }) => {
  const [speedData, setSpeedData] = useState({ labels: [], datasets: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // Process ISS Speed History (last 30 telemetry points)
    const last30 = issHistory.slice(-30);
    setTimeout(() => {
      setSpeedData({
        labels: last30.map(item => new Date(item.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
        datasets: [{
          label: 'ISS Speed (km/h)',
          data: last30.map(item => item.speed || 27600),
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.06)',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#06b6d4',
          pointHoverBorderColor: '#fafafa',
          pointHoverBorderWidth: 2,
          borderWidth: 2,
        }]
      });
    }, 0);
  }, [issHistory]);

  useEffect(() => {
    // Process News Distribution
    const sources = newsArticles.reduce((acc, art) => {
      acc[art.source] = (acc[art.source] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(sources).slice(0, 5); // top 5 sources
    const data = labels.map(label => sources[label]);

    setTimeout(() => {
      setCategoryData({
        labels,
        datasets: [{
          label: 'Articles per Source',
          data,
          backgroundColor: [
            '#06b6d4', // Cyan
            '#6366f1', // Indigo
            '#a855f7', // Purple
            '#10b981', // Emerald
            '#f97316', // Orange
          ],
          borderWidth: 0,
          hoverOffset: 6
        }]
      });
    }, 0);
  }, [newsArticles]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c0c0e',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        titleColor: '#fafafa',
        titleFont: { family: 'var(--font-heading)', size: 12, weight: 'bold' },
        bodyColor: '#a1a1aa',
        bodyFont: { family: 'var(--font-mono)', size: 11 },
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
      }
    },
    scales: {
      x: { 
        display: false,
        grid: { display: false } 
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        border: { dash: [4, 4] },
        ticks: { 
          color: 'var(--text-secondary)', 
          font: { family: 'var(--font-mono)', size: 10 },
          callback: (value) => `${value.toLocaleString()}`
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { 
          color: 'var(--text-secondary)', 
          font: { family: 'var(--font-body)', size: 11, weight: '500' }, 
          usePointStyle: true, 
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#0c0c0e',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        bodyColor: '#fafafa',
        bodyFont: { family: 'var(--font-body)', size: 11 },
        padding: 10,
        cornerRadius: 6
      }
    },
    cutout: '76%',
    radius: '85%'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      {/* Velocity Line Chart */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '270px' }}>
        <div className="section-title" style={{ fontSize: '15px', marginBottom: '16px' }}>
          <TrendingUp size={16} color="var(--accent-cyan)" />
          Velocity Trend (km/h)
        </div>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {speedData.datasets.length > 0 ? (
            <Line data={speedData} options={lineOptions} />
          ) : (
            <div className="skeleton" style={{ width: '100%', height: '100%' }}></div>
          )}
        </div>
      </div>

      {/* News Source Doughnut Chart */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '270px' }}>
        <div className="section-title" style={{ fontSize: '15px', marginBottom: '16px' }}>
          <PieIcon size={16} color="var(--accent-indigo)" />
          Source Distribution
        </div>
        <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {categoryData.labels.length > 0 ? (
            <Doughnut data={categoryData} options={doughnutOptions} />
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Awaiting news telemetry data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
