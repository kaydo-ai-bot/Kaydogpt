import { WebSource, extractDomain } from './sourceManager';

export interface SearchItem {
  title: string;
  url: string;
  domain: string;
  siteName: string;
  snippet: string;
}

export interface WebSearchResult {
  query: string;
  items: SearchItem[];
  sources: WebSource[];
  summaryContext: string;
}

export async function performWebSearch(
  query: string,
  customApiKey?: string,
  customApiUrl?: string
): Promise<WebSearchResult | null> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  const apiKey = customApiKey || process.env.WEB_SEARCH_API_KEY || '';
  const apiUrl = customApiUrl || process.env.WEB_SEARCH_API_URL || 'https://www.googleapis.com/customsearch/v1';

  // 1. Google Custom Search (if API key and engine ID are set)
  if (apiKey && apiKey !== 'YOUR_KEY_HERE') {
    try {
      const cx = process.env.WEB_SEARCH_CX || 'partner-pub-0000000000000000:0000000000';
      const endpoint = `${apiUrl}?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(cleanQuery)}&num=4`;
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const items: SearchItem[] = data.items.map((it: any) => {
            const { domain, siteName } = extractDomain(it.link);
            return {
              title: it.title || domain,
              url: it.link,
              domain,
              siteName,
              snippet: it.snippet || '',
            };
          });

          const sources: WebSource[] = items.map((it) => ({
            siteName: it.siteName,
            title: it.title,
            url: it.url,
            domain: it.domain,
            snippet: it.snippet,
          }));

          const summaryContext = items.map((it, idx) => `[Source ${idx + 1}: ${it.siteName} (${it.url})]\n${it.title}\n${it.snippet}`).join('\n\n');
          return { query: cleanQuery, items, sources, summaryContext };
        }
      }
    } catch (e) {
      console.warn('[Custom Search API error, falling back to public web search]', e);
    }
  }

  // 2. Wikipedia Search API (Free, high reliability, no quota issues)
  try {
    const wikiEndpoint = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&utf8=1&srlimit=4`;
    const res = await fetch(wikiEndpoint, {
      headers: { 'User-Agent': 'KaydoAI/2.0 (contact@kaydogpt.com)' },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const hits = data.query?.search || [];
      if (hits.length > 0) {
        const items: SearchItem[] = hits.map((h: any) => {
          const cleanSnippet = (h.snippet || '').replace(/<\/?[^>]+(>|$)/g, '');
          const url = `https://fr.wikipedia.org/wiki/${encodeURIComponent(h.title)}`;
          return {
            title: h.title,
            url,
            domain: 'fr.wikipedia.org',
            siteName: 'Wikipédia',
            snippet: cleanSnippet,
          };
        });

        const sources: WebSource[] = items.map((it) => ({
          siteName: it.siteName,
          title: it.title,
          url: it.url,
          domain: it.domain,
          snippet: it.snippet,
        }));

        const summaryContext = items.map((it, idx) => `[Source ${idx + 1}: ${it.siteName} (${it.url})]\n${it.title}\n${it.snippet}`).join('\n\n');
        return { query: cleanQuery, items, sources, summaryContext };
      }
    }
  } catch (err) {
    console.warn('[Wikipedia search fallback error]', err);
  }

  return null;
}
