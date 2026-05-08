/* News Service – uses GNews API */

const GNEWS_BASE = 'https://gnews.io/api/v4';
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const CATEGORIES = [
  { id: 'general', label: 'General', topic: 'general' },
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
    // storage full – ignore
  }
}

export async function fetchNewsByCategory(topic, max = 10, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCache(topic);
    if (cached) return cached;
  }

  const url = `${GNEWS_BASE}/top-headlines?topic=${topic}&lang=en&max=${max}&apikey=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.errors?.[0] || `News API error: ${response.status}`);
  }

  const data = await response.json();
  const articles = (data.articles || []).map((a) => ({
    title: a.title || 'Untitled',
    description: a.description || '',
    content: a.content || '',
    url: a.url || '#',
    image: a.image || null,
    publishedAt: a.publishedAt || new Date().toISOString(),
    source: a.source?.name || 'Unknown',
    author: a.source?.name || 'Staff Reporter',
  }));

  setCache(topic, articles);
  return articles;
}

export async function searchNews(query, max = 10) {
  const url = `${GNEWS_BASE}/search?q=${encodeURIComponent(query)}&lang=en&max=${max}&apikey=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Search failed: ${response.status}`);
  const data = await response.json();
  return (data.articles || []).map((a) => ({
    title: a.title || 'Untitled',
    description: a.description || '',
    content: a.content || '',
    url: a.url || '#',
    image: a.image || null,
    publishedAt: a.publishedAt || new Date().toISOString(),
    source: a.source?.name || 'Unknown',
    author: a.source?.name || 'Staff Reporter',
  }));
}

export function clearNewsCache() {
  CATEGORIES.forEach((c) => localStorage.removeItem(getCacheKey(c.topic)));
}
