export interface WebSource {
  siteName: string;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

export function extractDomain(url: string): { domain: string; siteName: string } {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, '');
    
    // Friendly site name formatting
    let siteName = domain;
    if (domain.includes('wikipedia.org')) siteName = 'Wikipédia';
    else if (domain.includes('open-meteo.com')) siteName = 'Open-Meteo';
    else if (domain.includes('worldtimeapi.org')) siteName = 'WorldTimeAPI';
    else if (domain.includes('lemonde.fr')) siteName = 'Le Monde';
    else if (domain.includes('lefigaro.fr')) siteName = 'Le Figaro';
    else if (domain.includes('bbc.com')) siteName = 'BBC News';
    else if (domain.includes('reuters.com')) siteName = 'Reuters';
    else if (domain.includes('lenouvelliste.com')) siteName = 'Le Nouvelliste';
    else if (domain.includes('coingecko.com')) siteName = 'CoinGecko';
    else if (domain.includes('coinmarketcap.com')) siteName = 'CoinMarketCap';
    else if (domain.includes('github.com')) siteName = 'GitHub';
    else if (domain.includes('youtube.com')) siteName = 'YouTube';
    else {
      // Capitalize domain prefix
      const parts = domain.split('.');
      if (parts[0]) {
        siteName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    }

    return { domain, siteName };
  } catch {
    return { domain: 'web', siteName: 'Web' };
  }
}

export function deduplicateSources(sources: WebSource[]): WebSource[] {
  const seen = new Set<string>();
  const result: WebSource[] = [];

  for (const s of sources) {
    if (!s.url) continue;
    const cleanUrl = s.url.split('#')[0].replace(/\/$/, '');
    if (!seen.has(cleanUrl)) {
      seen.add(cleanUrl);
      result.push(s);
    }
  }

  return result.slice(0, 5); // Limit to top 5 relevant sources
}

export function formatSourcesMarkdown(sources: WebSource[]): string {
  const unique = deduplicateSources(sources);
  if (unique.length === 0) return '';

  const lines = unique.map((s, idx) => {
    const title = s.title.replace(/[\[\]]/g, '').trim() || s.domain;
    const label = `${s.siteName} — ${title}`;
    return `${idx + 1}. [${label}](${s.url})`;
  });

  return `\n\n---\n**Sources :**\n\n${lines.join('\n')}`;
}
