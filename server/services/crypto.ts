import { WebSource } from './sourceManager';

export interface CryptoResult {
  coin: string;
  priceUsd: number;
  change24h?: number;
  source: WebSource;
  rawText: string;
}

export async function fetchLiveCryptoPrice(query: string): Promise<CryptoResult | null> {
  try {
    const normalized = query.toLowerCase();
    let coinId = 'bitcoin';
    let coinName = 'Bitcoin (BTC)';

    if (normalized.includes('ethereum') || normalized.includes('eth')) {
      coinId = 'ethereum';
      coinName = 'Ethereum (ETH)';
    } else if (normalized.includes('solana') || normalized.includes('sol')) {
      coinId = 'solana';
      coinName = 'Solana (SOL)';
    }

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,eur&include_24hr_change=true`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const coinData = data[coinId];
    if (!coinData || coinData.usd === undefined) return null;

    const priceUsd = coinData.usd;
    const priceEur = coinData.eur;
    const change24h = coinData.usd_24h_change;

    const source: WebSource = {
      siteName: 'CoinGecko',
      title: `Cours en direct ${coinName}`,
      url: `https://www.coingecko.com/en/coins/${coinId}`,
      domain: 'coingecko.com',
      snippet: `Prix actuel : $${priceUsd.toLocaleString()} USD (€${priceEur?.toLocaleString()} EUR), variation 24h : ${change24h ? change24h.toFixed(2) + '%' : '0%'}.`,
    };

    const rawText = `Données Financières Crypto en Direct pour ${coinName} :
- Cours USD : $${priceUsd.toLocaleString('en-US')}
- Cours EUR : €${priceEur ? priceEur.toLocaleString('fr-FR') : 'N/A'}
- Variation 24h : ${change24h ? (change24h >= 0 ? '+' : '') + change24h.toFixed(2) + '%' : 'N/A'}
- Source de cotation : CoinGecko Markets API`;

    return {
      coin: coinName,
      priceUsd,
      change24h,
      source,
      rawText,
    };
  } catch (err) {
    console.warn('[Crypto price fetch error]', err);
    return null;
  }
}
