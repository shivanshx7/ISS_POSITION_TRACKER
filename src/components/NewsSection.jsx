import { useState, useEffect } from 'react';
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
      if (force) toast.success(`Refreshed ${category} news feed`);
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
      toast.success(`Search completed for "${searchQuery}"`);
    } catch (error) {
      console.error(error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNews();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.publishedAt) - new Date(a.publishedAt);
    if (sortBy === 'source') return a.source.localeCompare(b.source);
    return 0;
  });

  return (
    <div className="glass-card" style={{ margin: '24px 0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header controls */}
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div className="section-title">
          <div className="icon-circle" style={{ background: 'var(--gradient-primary)' }}>
            <Newspaper size={16} color="white" />
          </div>
          Global News Feed
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search form */}
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search news..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px 8px 38px',
                color: 'var(--text-primary)',
                width: '220px',
                fontSize: '13px',
                outline: 'none',
                height: '38px',
                transition: 'var(--transition)'
              }}
              className="hover-glow"
            />
            <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </form>

          {/* Sort selection */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0 16px',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              height: '38px',
              transition: 'var(--transition)'
            }}
            className="hover-glow"
          >
            <option value="date" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Sort by Date</option>
            <option value="source" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Sort by Source</option>
          </select>

          {/* Reload feed */}
          <button className="btn-icon" onClick={() => loadNews(activeCategory, true)} title="Refresh Feed">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        overflowX: 'auto', 
        paddingBottom: '6px',
        borderBottom: '1px solid var(--border-color)' 
      }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button 
              key={cat.id} 
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                padding: '6px 16px', 
                fontSize: '12px',
                minHeight: '32px',
                borderRadius: '8px'
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid List */}
      <div className="news-cards-grid">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: '170px', borderRadius: '0' }}></div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                <div className="skeleton" style={{ height: '12px', width: '40%' }}></div>
                <div className="skeleton" style={{ height: '18px', width: '90%' }}></div>
                <div className="skeleton" style={{ height: '18px', width: '70%' }}></div>
                <div style={{ marginTop: 'auto' }}>
                  <div className="skeleton" style={{ height: '32px', width: '100%' }}></div>
                </div>
              </div>
            </div>
          ))
        ) : sortedArticles.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            No articles found for the selected category.
          </div>
        ) : (
          sortedArticles.map((article, i) => (
            <div key={i} className="card news-card-wrapper" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              overflow: 'hidden',
              background: 'rgba(15, 15, 20, 0.35)',
              borderColor: 'var(--border-color)'
            }}>
              {/* Card Image Area */}
              <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                <img 
                  src={article.image || `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&h=300&auto=format&fit=crop`} 
                  alt={article.title}
                  className="news-image"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                  }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&h=300&auto=format&fit=crop'; }}
                />
                {/* Source Pill */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                  <span className="badge badge-cyan" style={{ textTransform: 'lowercase', fontSize: '9px' }}>
                    {article.source}
                  </span>
                </div>
              </div>

              {/* Excerpt Context Area */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Author & Timestamp */}
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={11} /> {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <User size={11} /> {article.author}
                  </span>
                </div>

                {/* Title */}
                <h3 className="news-card-title" style={{ 
                  fontSize: '14.5px', 
                  fontWeight: 700, 
                  lineHeight: '1.4',
                  color: 'var(--text-primary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p style={{ 
                  fontSize: '12.5px', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '10px'
                }}>
                  {article.description}
                </p>

                {/* Open Full Link */}
                <div style={{ marginTop: 'auto' }}>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary" 
                    style={{ 
                      width: '100%', 
                      fontSize: '12px',
                      height: '34px',
                      minHeight: '34px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    Read Article <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .news-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .news-card-wrapper {
          transition: var(--transition);
        }

        .news-card-wrapper:hover {
          transform: translateY(-4px) !important;
          border-color: rgba(6, 182, 212, 0.35) !important;
          box-shadow: 0 10px 25px rgba(6, 182, 212, 0.08) !important;
        }

        .news-card-wrapper:hover .news-image {
          transform: scale(1.05);
        }

        .news-card-wrapper:hover .news-card-title {
          color: var(--accent-cyan);
        }
      `}</style>
    </div>
  );
};

export default NewsSection;
