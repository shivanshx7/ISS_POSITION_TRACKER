/* AI Service – Hugging Face Qwen3-1.7B via router */

const HF_URL = 'https://router.huggingface.co/v1/chat/completions';
const MODEL = 'Qwen/Qwen3-1.7B:featherless-ai';

export async function askAI({ issData, newsData, messages, userMessage }) {
  const token = import.meta.env.VITE_AI_TOKEN;
  if (!token || token === 'your_huggingface_token_here') {
    throw new Error('Hugging Face token not configured. Please add VITE_AI_TOKEN to your .env file.');
  }

  // Build system prompt from current dashboard data
  const issContext = issData
    ? `
=== ISS LIVE DATA ===
- Current Latitude: ${issData.lat?.toFixed(4)}°
- Current Longitude: ${issData.lng?.toFixed(4)}°
- Current Location: ${issData.location || 'Unknown'}
- Speed: ${issData.speed ? issData.speed.toFixed(0) + ' km/h' : 'Calculating...'}
- Positions Tracked: ${issData.positionCount || 0}
- People in Space: ${issData.peopleCount || 0}
- Astronauts: ${issData.people?.map((p) => p.name).join(', ') || 'Unknown'}
- Last Updated: ${issData.lastUpdated || 'Unknown'}
`
    : '';

  const newsContext =
    newsData && newsData.length > 0
      ? `
=== LATEST NEWS ARTICLES ===
${newsData
  .slice(0, 10)
  .map(
    (a, i) => `
[Article ${i + 1}]
Title: ${a.title}
Source: ${a.source}
Date: ${new Date(a.publishedAt).toLocaleDateString()}
Description: ${a.description || 'No description available'}
`
  )
  .join('')}
Total Articles Available: ${newsData.length}
`
      : '';

  const systemPrompt = `You are SpaceWatch AI, a helpful assistant that ONLY answers questions based on the dashboard data provided below. 

STRICT RULES:
1. ONLY use the data provided in the context below to answer questions.
2. Do NOT use any outside knowledge, general internet knowledge, or guesses.
3. If the answer is not in the provided data, say: "I don't have that information in the current dashboard data. Please check the live ISS tracker or news section."
4. Keep answers concise, friendly, and informative.
5. You can answer about: ISS position, speed, location, astronauts in space, and news articles shown in the dashboard.

CURRENT DASHBOARD DATA:
${issContext}
${newsContext}

Remember: Only answer based on the above data. Never fabricate or guess.`;

  const response = await fetch(HF_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10), // keep last 10 messages for context
        { role: 'user', content: userMessage },
      ],
      max_tokens: 512,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}

const CHAT_KEY = 'spacewatch_chat_history';
const MAX_STORED = 30;

export function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages) {
  try {
    const trimmed = messages.slice(-MAX_STORED);
    localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function clearChatHistory() {
  localStorage.removeItem(CHAT_KEY);
}
