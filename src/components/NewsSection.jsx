import React, { useState, useEffect } from 'react';
import { Newspaper, Search, RefreshCw, ExternalLink, Calendar, User } from 'lucide-react';
import { fetchNewsByCategory, searchNews, CATEGORIES } from '../services/newsService';
import toast from 'react-hot-toast';

const NewsSection = ({ onDataUpdate }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'source'

  const loadNews = async (category = activeCategory, force = false) => {
    setLoading(true);
    try {
      const data = await fetchNewsByCategory(category, 10, force);
      setArticles(data);
      onDataUpdate(data);
      if (force) toast.success(`Refreshed ${category} news`);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await searchNews(searchQuery);
      setArticles(data);
      onDataUpdate(data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [activeCategory]);

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.publishedAt) - new Date(a.publishedAt);
    if (sortBy === 'source') return a.source.localeCompare(b.source);
    return 0;
  });

  return (
    <div className="glass-card" style={{ margin: '20px', padding: '24px' }}>
      <div className="section-header">
        <div className="section-title">
          <div className="icon-circle" style={{ background: 'var(--gradient-warm)' }}>
            <Newspaper size={18} color="white" />
          </div>
          Global News Feed
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search news..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px 8px 36px',
                color: 'var(--text-primary)',
                width: '200px',
                outline: 'none'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </form>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="source">Sort by Source</option>
          </select>

          <button className="btn-icon" onClick={() => loadNews(activeCategory, true)}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '5px' }}>
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id} 
            className={`btn ${activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 16px', fontSize: '13px' }}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
              <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}></div>
              <div style={{ padding: '15px' }}>
                <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '10px' }}></div>
                <div className="skeleton" style={{ height: '15px', width: '100%', marginBottom: '5px' }}></div>
                <div className="skeleton" style={{ height: '15px', width: '60%' }}></div>
              </div>
            </div>
          ))
        ) : sortedArticles.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No articles found for this topic.
          </div>
        ) : (
          sortedArticles.map((article, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <img 
                  src={article.image || `https://source.unsplash.com/random/400x300?space,news&sig=${i}`} 
                  alt={article.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&h=300&auto=format&fit=crop'; }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className="badge badge-blue">{article.source}</span>
                </div>
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '15px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} /> {article.author}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.description}
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}>
                    Read Full Article <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsSection;
