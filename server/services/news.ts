import { WebSource, extractDomain } from './sourceManager';

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  snippet: string;
  publishedAt?: string;
}

export interface NewsResult {
  articles: NewsArticle[];
  sources: WebSource[];
  rawText: string;
}

export async function fetchLiveNews(
  query: string,
  customApiKey?: string,
  customApiUrl?: string
): Promise<NewsResult | null> {
  const apiKey = customApiKey || process.env.NEWS_API_KEY || '';
  const apiUrl = customApiUrl || process.env.NEWS_API_URL || 'https://newsapi.org/v2/top-headlines';

  // 1. If user has NewsAPI key configured
  if (apiKey && apiKey !== 'YOUR_KEY_HERE') {
    try {
      const url = `${apiUrl}?country=fr&pageSize=5&apiKey=${apiKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          const articles: NewsArticle[] = data.articles.slice(0, 4).map((a: any) => ({
            title: a.title,
            url: a.url,
            source: a.source?.name || 'News',
            snippet: a.description || a.content || '',
            publishedAt: a.publishedAt,
          }));

          const sources: WebSource[] = articles.map((a) => {
            const { domain, siteName } = extractDomain(a.url);
            return {
              siteName: a.source || siteName,
              title: a.title,
              url: a.url,
              domain,
              snippet: a.snippet,
            };
          });

          const rawText = `Dernières actualités reçues :\n` +
            articles.map((a, i) => `${i + 1}. [${a.source}] ${a.title} : ${a.snippet}`).join('\n');

          return { articles, sources, rawText };
        }
      }
    } catch (e) {
      console.warn('[NewsAPI query failed, falling back to public sources]', e);
    }
  }

  // 2. Fallback: Query French Wikipedia Current Events / Portal
  try {
    const currentYear = new Date().getFullYear();
    const wikiUrl = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=actualite+monde+${currentYear}&format=json&utf8=1&srlimit=4`;
    const res = await fetch(wikiUrl, {
      headers: { 'User-Agent': 'KaydoAI/2.0 (contact@kaydogpt.com)' },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const items = data.query?.search || [];
      if (items.length > 0) {
        const articles: NewsArticle[] = items.map((item: any) => ({
          title: item.title,
          url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
          source: 'Wikipédia Actualités',
          snippet: item.snippet?.replace(/<\/?[^>]+(>|$)/g, '') || '',
        }));

        const sources: WebSource[] = articles.map((a) => ({
          siteName: 'Wikipédia',
          title: a.title,
          url: a.url,
          domain: 'fr.wikipedia.org',
          snippet: a.snippet,
        }));

        const rawText = `Actualités et événements vérifiés :\n` +
          articles.map((a, i) => `${i + 1}. ${a.title} : ${a.snippet}`).join('\n');

        return { articles, sources, rawText };
      }
    }
  } catch (err) {
    console.warn('[News fallback error]', err);
  }

  return null;
}
