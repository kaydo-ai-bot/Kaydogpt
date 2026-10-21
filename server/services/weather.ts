import { WebSource, extractDomain } from './sourceManager';

export interface WeatherResult {
  location: string;
  temperature: number;
  apparentTemperature?: number;
  humidity?: number;
  condition: string;
  windSpeed?: number;
  source: WebSource;
  rawText: string;
}

// City coordinates mapping for fast, reliable resolution
const CITY_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  'port-au-prince': { lat: 18.5392, lon: -72.3350, name: 'Port-au-Prince, Haïti' },
  'haiti': { lat: 18.5392, lon: -72.3350, name: 'Port-au-Prince, Haïti' },
  'cap-haitien': { lat: 19.7578, lon: -72.2042, name: 'Cap-Haïtien, Haïti' },
  'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
  'montreal': { lat: 45.5017, lon: -73.5673, name: 'Montréal, Canada' },
  'new york': { lat: 40.7128, lon: -74.0060, name: 'New York, USA' },
  'miami': { lat: 25.7617, lon: -80.1918, name: 'Miami, USA' },
  'santo domingo': { lat: 18.4861, lon: -69.9312, name: 'Saint-Domingue, Rép. Dominicaine' },
};

function decodeWeatherCode(code: number): string {
  switch (code) {
    case 0: return 'Ciel dégagé, ensoleillé';
    case 1: case 2: return 'Partiellement nuageux';
    case 3: return 'Couvert';
    case 45: case 48: return 'Brouillard';
    case 51: case 53: case 55: return 'Bruine légère';
    case 61: case 63: case 65: return 'Pluie modérée';
    case 71: case 73: case 75: return 'Chute de neige';
    case 80: case 81: case 82: return 'Averses de pluie';
    case 95: return 'Orage';
    case 96: case 99: return 'Orage avec grêle';
    default: return 'Conditions normales';
  }
}

export async function fetchLiveWeather(
  query: string,
  customApiKey?: string,
  customApiUrl?: string
): Promise<WeatherResult | null> {
  try {
    const normalized = query.toLowerCase();
    let selectedCity = CITY_COORDINATES['port-au-prince'];

    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (normalized.includes(key)) {
        selectedCity = coords;
        break;
      }
    }

    const apiUrl = customApiUrl || process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast';
    const finalUrl = `${apiUrl}?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;

    const res = await fetch(finalUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`[Weather API returned HTTP ${res.status}]`);
      return null;
    }

    const data = await res.json();
    const current = data.current;
    if (!current) return null;

    const condition = decodeWeatherCode(current.weather_code ?? 0);
    const source: WebSource = {
      siteName: 'Open-Meteo',
      title: `Prévisions météo en direct pour ${selectedCity.name}`,
      url: `https://open-meteo.com/en/docs?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}`,
      domain: 'open-meteo.com',
      snippet: `Relevé en direct : ${current.temperature_2m}°C, ${condition}, humidité ${current.relative_humidity_2m}%.`,
    };

    const rawText = `Données Météorologiques en Temps Réel pour ${selectedCity.name} :
- Température actuelle : ${current.temperature_2m}°C (ressenti : ${current.apparent_temperature ?? current.temperature_2m}°C)
- Conditions du ciel : ${condition}
- Humidité relative : ${current.relative_humidity_2m}%
- Vitesse du vent : ${current.wind_speed_10m} km/h
- Source : Open-Meteo Weather Service`;

    return {
      location: selectedCity.name,
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      condition,
      windSpeed: current.wind_speed_10m,
      source,
      rawText,
    };
  } catch (err) {
    console.warn('[Weather Service error, fallback gracefully]', err);
    return null;
  }
}
