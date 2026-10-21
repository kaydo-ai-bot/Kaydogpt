import { fetchLiveWeather } from './weather';
import { fetchLiveNews } from './news';
import { fetchLiveCryptoPrice } from './crypto';
import { fetchLiveFootball } from './football';
import { performWebSearch } from './webSearch';
import { WebSource, formatSourcesMarkdown } from './sourceManager';
import { isDateTimeQuery } from '../../src/utils/dateTime';

export type RouteIntent = 'weather' | 'news' | 'crypto' | 'football' | 'web_search' | 'direct_model';

export interface GroundingResult {
  intent: RouteIntent;
  groundingText?: string;
  sources: WebSource[];
  isWebSearch: boolean;
}

export function detectUserIntent(query: string, explicitWebSearch?: boolean): RouteIntent {
  if (!query || typeof query !== 'string') return 'direct_model';

  // Pure Date, Time, Month, Year queries must NEVER be hijacked by web search or Wikipedia
  if (isDateTimeQuery(query)) {
    return 'direct_model';
  }

  if (explicitWebSearch) return 'web_search';

  const normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // 1. Weather
  if (
    normalized.includes('meteo') ||
    normalized.includes('quel temps fait') ||
    normalized.includes('temperature a') ||
    normalized.includes('previsions meteo') ||
    (normalized.includes('temps') && (normalized.includes('port-au-prince') || normalized.includes('haiti') || normalized.includes('paris')))
  ) {
    return 'weather';
  }

  // 2. Crypto / Financial prices
  if (
    normalized.includes('prix du bitcoin') ||
    normalized.includes('prix de bitcoin') ||
    normalized.includes('cours du bitcoin') ||
    normalized.includes('cours de btc') ||
    normalized.includes('prix de l\'ethereum') ||
    normalized.includes('cours crypto') ||
    (normalized.includes('bitcoin') && (normalized.includes('combien') || normalized.includes('valeur') || normalized.includes('prix')))
  ) {
    return 'crypto';
  }

  // 3. News & Current events
  if (
    normalized.includes('derniere nouvelle') ||
    normalized.includes('dernieres nouvelles') ||
    normalized.includes('actualite') ||
    normalized.includes('actualites') ||
    normalized.includes('breaking news') ||
    normalized.includes('titres de l\'actualite')
  ) {
    return 'news';
  }

  // Football
  if (
    normalized.includes('football') ||
    normalized.includes('match') ||
    normalized.includes('score') ||
    normalized.includes('resultat') ||
    normalized.includes('calendrier') ||
    normalized.includes('classement') ||
    normalized.includes('joueur') ||
    normalized.includes('but') ||
    normalized.includes('concacaf')
  ) {
    return 'football';
  }

  // 4. Conceptual / Explanation queries -> Direct model answer (no forced web search)
  if (
    normalized.startsWith('explique') ||
    normalized.startsWith('c\'est quoi') ||
    normalized.startsWith('qu\'est-ce que') ||
    normalized.startsWith('ecris') ||
    normalized.startsWith('redige') ||
    normalized.startsWith('traduis') ||
    normalized.includes('relativite') ||
    normalized.includes('theoreme') ||
    normalized.includes('equation') ||
    normalized.includes('code en') ||
    normalized.includes('fonction')
  ) {
    // Only if it doesn't mention "aujourd'hui" or "2026"
    if (!normalized.includes('aujourd') && !normalized.includes('2026') && !normalized.includes('actuel')) {
      return 'direct_model';
    }
  }

  // 5. Recent facts, specific persons today, tech updates
  if (
    normalized.includes('aujourd') ||
    normalized.includes('actuel') ||
    normalized.includes('2026') ||
    normalized.includes('qui est') ||
    normalized.includes('derniere version') ||
    normalized.includes('nouveau') ||
    normalized.includes('cherche')
  ) {
    return 'web_search';
  }

  return 'direct_model';
}

export async function resolveGrounding(
  query: string,
  explicitWebSearch?: boolean,
  footballApiKey?: string,
  footballApiUrl?: string
): Promise<GroundingResult> {
  const intent = detectUserIntent(query, explicitWebSearch);

  switch (intent) {
    case 'weather': {
      const weatherData = await fetchLiveWeather(query);
      if (weatherData) {
        return {
          intent: 'weather',
          groundingText: `### DONNÉES MÉTÉO EN DIRECT (Source externe officielle) :\n${weatherData.rawText}\n\nConsigne : Utilise ces données pour répondre précisément à l'utilisateur.`,
          sources: [weatherData.source],
          isWebSearch: true,
        };
      }
      break;
    }

    case 'crypto': {
      const cryptoData = await fetchLiveCryptoPrice(query);
      if (cryptoData) {
        return {
          intent: 'crypto',
          groundingText: `### COURS CRYPTO EN TEMPS RÉEL (Source CoinGecko) :\n${cryptoData.rawText}\n\nConsigne : Indique ce prix actuel avec précision.`,
          sources: [cryptoData.source],
          isWebSearch: true,
        };
      }
      break;
    }

    case 'news': {
      const newsData = await fetchLiveNews(query);
      if (newsData && newsData.sources.length > 0) {
        return {
          intent: 'news',
          groundingText: `### ACTUALITÉS EN DIRECT (Sources vérifiées) :\n${newsData.rawText}\n\nConsigne : Résume clairement ces faits récents.`,
          sources: newsData.sources,
          isWebSearch: true,
        };
      }
      break;
    }

    case 'football': {
      const footballData = await fetchLiveFootball(query, footballApiKey, footballApiUrl);
      if (footballData) {
        return {
          intent: 'football',
          groundingText: `### DONNÉES FOOTBALL EN DIRECT :\n${footballData.rawText}\n\nConsigne : Utilise ces données pour répondre précisément.`,
          sources: [footballData.source],
          isWebSearch: true,
        };
      }
      break;
    }

    case 'web_search': {
      const searchData = await performWebSearch(query);
      if (searchData && searchData.sources.length > 0) {
        return {
          intent: 'web_search',
          groundingText: `### RÉSULTATS DE RECHERCHE WEB EN DIRECT :\n${searchData.summaryContext}\n\nConsigne : Utilise ces informations fiables pour formuler ta réponse. Ne cite aucune source inventée.`,
          sources: searchData.sources,
          isWebSearch: true,
        };
      }
      break;
    }

    case 'direct_model':
    default:
      return {
        intent: 'direct_model',
        sources: [],
        isWebSearch: false,
      };
  }

  // Fallback if specialized service failed: try general web search
  const fallbackSearch = await performWebSearch(query);
  if (fallbackSearch && fallbackSearch.sources.length > 0) {
    return {
      intent: 'web_search',
      groundingText: `### RÉSULTATS DE RECHERCHE WEB :\n${fallbackSearch.summaryContext}`,
      sources: fallbackSearch.sources,
      isWebSearch: true,
    };
  }

  return {
    intent: 'direct_model',
    sources: [],
    isWebSearch: false,
  };
}
