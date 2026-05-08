/* News Service – uses NewsData.io API */

const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest';
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const CATEGORIES = [
  { id: 'top', label: 'Top', topic: 'top' },
  { id: 'technology', label: 'Technology', topic: 'technology' },
  { id: 'science', label: 'Science', topic: 'science' },
  { id: 'health', label: 'Health', topic: 'health' },
  { id: 'sports', label: 'Sports', topic: 'sports' },
];

export { CATEGORIES };

function getCacheKey(topic) {
  return `news_cache_${topic}`;
}

function getCache(topic) {
  try {
    const raw = localStorage.getItem(getCacheKey(topic));
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      localStorage.removeItem(getCacheKey(topic));
      return null;
    }
    return cached.articles;
  } catch {
    return null;
  }
}

function setCache(topic, articles) {
  try {
    localStorage.setItem(
      getCacheKey(topic),
      JSON.stringify({ timestamp: Date.now(), articles })
    );
  } catch {
    // storage full
  }
}

export async function fetchNewsByCategory(topic, max = 10, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCache(topic);
    if (cached) return cached;
  }

  // NewsData.io uses 'category' parameter. For 'top', we can omit or use specific categories.
  const categoryParam = topic === 'top' ? '' : `&category=${topic}`;
  const url = `${NEWSDATA_BASE}?apikey=${API_KEY}&language=en${categoryParam}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `NewsData error: ${response.status}`);
  }

  const data = await response.json();
  const articles = (data.results || []).slice(0, max).map((a) => ({
    title: a.title || 'Untitled',
    description: a.description || 'No description available.',
    content: a.content || '',
    url: a.link || '#',
    image: a.image_url || null,
    publishedAt: a.pubDate || new Date().toISOString(),
    source: a.source_id || 'Global News',
    author: (a.creator && a.creator[0]) || 'Staff Reporter',
  }));

  setCache(topic, articles);
  return articles;
}

export async function searchNews(query, max = 10) {
  const url = `${NEWSDATA_BASE}?apikey=${API_KEY}&q=${encodeURIComponent(query)}&language=en`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Search failed: ${response.status}`);
  const data = await response.json();
  return (data.results || []).slice(0, max).map((a) => ({
    title: a.title || 'Untitled',
    description: a.description || 'No description available.',
    content: a.content || '',
    url: a.link || '#',
    image: a.image_url || null,
    publishedAt: a.pubDate || new Date().toISOString(),
    source: a.source_id || 'Search Result',
    author: (a.creator && a.creator[0]) || 'NewsDesk',
  }));
}

export function clearNewsCache() {
  CATEGORIES.forEach((c) => localStorage.removeItem(getCacheKey(c.topic)));
}
