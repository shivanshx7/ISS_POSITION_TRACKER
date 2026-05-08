import React, { useState, useEffect } from 'react';
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
} from 'chart.js';
import { BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartsSection = ({ issHistory, newsArticles }) => {
  const [speedData, setSpeedData] = useState({ labels: [], datasets: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // Process ISS Speed History
    const last30 = issHistory.slice(-30);
    setSpeedData({
      labels: last30.map(item => new Date(item.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
      datasets: [{
        label: 'ISS Speed (km/h)',
        data: last30.map(item => item.speed || 27600),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      }]
    });
  }, [issHistory]);

  useEffect(() => {
    // Process News Distribution
    const sources = newsArticles.reduce((acc, art) => {
      acc[art.source] = (acc[art.source] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(sources).slice(0, 6);
    const data = labels.map(label => sources[label]);

    setCategoryData({
      labels,
      datasets: [{
        label: 'Articles per Source',
        data,
        backgroundColor: [
          '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
        ],
        borderWidth: 0,
        hoverOffset: 10
      }]
    });
  }, [newsArticles]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f0f4ff',
        bodyColor: '#f0f4ff',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { 
        display: false,
        grid: { display: false } 
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#8892a4', font: { size: 10 } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#8892a4', font: { size: 11 }, usePointStyle: true, padding: 15 }
      },
      tooltip: {
        backgroundColor: '#111827',
        padding: 10,
        cornerRadius: 8
      }
    },
    cutout: '70%'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', margin: '20px' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div className="section-title" style={{ fontSize: '18px', marginBottom: '20px' }}>
          <TrendingUp size={18} color="var(--accent-blue)" />
          Velocity Trend (km/h)
        </div>
        <div style={{ flex: 1, minHeight: '200px' }}>
          <Line data={speedData} options={lineOptions} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div className="section-title" style={{ fontSize: '18px', marginBottom: '20px' }}>
          <PieIcon size={18} color="var(--accent-cyan)" />
          News Source Distribution
        </div>
        <div style={{ flex: 1, minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Doughnut data={categoryData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
