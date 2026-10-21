/**
 * KAYDO AI - Module Centralisé de Date & Heure Dynamique
 * 
 * Source unique et fiable de temps pour l'ensemble de l'application (client et serveur).
 * Ne contient AUCUNE date codée en dur.
 * Gère le fuseau horaire "America/Port-au-Prince" pour Haïti et le temps local/UTC.
 */

export interface DateTimeDetails {
  iso: string;
  timestamp: number;
  year: number;
  month: number; // 1-12
  monthNameFr: string;
  day: number; // 1-31
  dayOfWeekFr: string;
  hours: number;
  minutes: number;
  seconds: number;
  formattedDateFr: string;
  formattedTimeFr: string;
  formattedFullFr: string;
  timezone: string;
}

export const HAITI_TIMEZONE = 'America/Port-au-Prince';

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

const DAYS_FR = [
  'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'
];

/**
 * Récupère les détails dynamiques complets de date et d'heure pour un fuseau donné.
 */
export function getDynamicDateTime(
  referenceDate: Date = new Date(),
  timeZone: string = HAITI_TIMEZONE
): DateTimeDetails {
  const d = referenceDate instanceof Date && !isNaN(referenceDate.getTime()) ? referenceDate : new Date();

  // Utilisation de Intl.DateTimeFormat pour extraire les composants exacts dans le fuseau horaire cible
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'long',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const year = parseInt(partMap.year, 10) || d.getFullYear();
  const month = parseInt(partMap.month, 10) || (d.getMonth() + 1);
  const day = parseInt(partMap.day, 10) || d.getDate();
  const hours = parseInt(partMap.hour, 10) || 0;
  const minutes = parseInt(partMap.minute, 10) || 0;
  const seconds = parseInt(partMap.second, 10) || 0;

  const monthNameFr = MONTHS_FR[month - 1] || 'inconnu';
  const dayOfWeekFr = partMap.weekday ? partMap.weekday.toLowerCase() : DAYS_FR[d.getDay()];

  const formattedDateFr = `${dayOfWeekFr} ${day} ${monthNameFr} ${year}`;
  const formattedTimeFr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const formattedFullFr = `${formattedDateFr} à ${formattedTimeFr}`;

  return {
    iso: d.toISOString(),
    timestamp: d.getTime(),
    year,
    month,
    monthNameFr,
    day,
    dayOfWeekFr,
    hours,
    minutes,
    seconds,
    formattedDateFr,
    formattedTimeFr,
    formattedFullFr,
    timezone: timeZone,
  };
}

/**
 * Récupère les détails pour Haïti (America/Port-au-Prince)
 */
export function getHaitiDateTime(referenceDate: Date = new Date()): DateTimeDetails {
  return getDynamicDateTime(referenceDate, HAITI_TIMEZONE);
}

/**
 * Calcule une date relative (hier = -1, demain = +1, etc.)
 */
export function getRelativeDateTime(
  offsetDays: number,
  timeZone: string = HAITI_TIMEZONE
): DateTimeDetails {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return getDynamicDateTime(d, timeZone);
}

export interface InternationalZone {
  key: string;
  names: string[];
  displayName: string;
  timeZone: string;
  flag: string;
}

export const INTERNATIONAL_ZONES: InternationalZone[] = [
  { key: 'haiti', names: ['haiti', 'ayiti', 'port au prince', 'port-au-prince', 'cap-haitien', 'delmas', 'petion-ville'], displayName: 'Haïti (Port-au-Prince)', timeZone: 'America/Port-au-Prince', flag: '🇭🇹' },
  { key: 'france', names: ['france', 'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes'], displayName: 'France (Paris)', timeZone: 'Europe/Paris', flag: '🇫🇷' },
  { key: 'senegal', names: ['senegal', 'dakar', 'thies', 'saint-louis du senegal'], displayName: 'Sénégal (Dakar)', timeZone: 'Africa/Dakar', flag: '🇸🇳' },
  { key: 'usa_ny', names: ['etats-unis', 'etats unis', 'usa', 'new york', 'new-york', 'washington', 'miami', 'floride'], displayName: 'États-Unis (New York / Washington)', timeZone: 'America/New_York', flag: '🇺🇸' },
  { key: 'usa_ca', names: ['californie', 'los angeles', 'san francisco'], displayName: 'États-Unis (Los Angeles / Californie)', timeZone: 'America/Los_Angeles', flag: '🇺🇸' },
  { key: 'canada', names: ['canada', 'montreal', 'quebec', 'toronto', 'ottawa'], displayName: 'Canada (Montréal / Toronto)', timeZone: 'America/Toronto', flag: '🇨🇦' },
  { key: 'cote_ivoire', names: ['cote d\'ivoire', 'cote d ivoire', 'abidjan', 'yamoussoukro'], displayName: 'Côte d\'Ivoire (Abidjan)', timeZone: 'Africa/Abidjan', flag: '🇨🇮' },
  { key: 'rep_dom', names: ['republique dominicaine', 'saint-domingue', 'santo domingo'], displayName: 'Rép. Dominicaine (Saint-Domingue)', timeZone: 'America/Santo_Domingo', flag: '🇩🇴' },
  { key: 'cameroun', names: ['cameroun', 'douala', 'yaounde'], displayName: 'Cameroun (Douala / Yaoundé)', timeZone: 'Africa/Douala', flag: '🇨🇲' },
  { key: 'benin', names: ['benin', 'cotonou', 'porto-novo'], displayName: 'Bénin (Cotonou)', timeZone: 'Africa/Porto-Novo', flag: '🇧🇯' },
  { key: 'togo', names: ['togo', 'lome'], displayName: 'Togo (Lomé)', timeZone: 'Africa/Lome', flag: '🇹🇬' },
  { key: 'mali', names: ['mali', 'bamako'], displayName: 'Mali (Bamako)', timeZone: 'Africa/Bamako', flag: '🇲🇱' },
  { key: 'guinee', names: ['guinee', 'conakry'], displayName: 'Guinée (Conakry)', timeZone: 'Africa/Conakry', flag: '🇬🇳' },
  { key: 'rdc', names: ['congo', 'rdc', 'kinshasa'], displayName: 'RDC (Kinshasa)', timeZone: 'Africa/Kinshasa', flag: '🇨🇩' },
  { key: 'maroc', names: ['maroc', 'casablanca', 'rabat', 'marrakech'], displayName: 'Maroc (Casablanca / Rabat)', timeZone: 'Africa/Casablanca', flag: '🇲🇦' },
  { key: 'algerie', names: ['algerie', 'alger', 'oran'], displayName: 'Algérie (Alger)', timeZone: 'Africa/Algiers', flag: '🇩🇿' },
  { key: 'tunisie', names: ['tunisie', 'tunis'], displayName: 'Tunisie (Tunis)', timeZone: 'Africa/Tunis', flag: '🇹🇳' },
  { key: 'uk', names: ['royaume-uni', 'angleterre', 'londres', 'uk', 'london'], displayName: 'Royaume-Uni (Londres)', timeZone: 'Europe/London', flag: '🇬🇧' },
  { key: 'espagne', names: ['espagne', 'madrid', 'barcelone'], displayName: 'Espagne (Madrid)', timeZone: 'Europe/Madrid', flag: '🇪🇸' },
  { key: 'allemagne', names: ['allemagne', 'berlin', 'munich'], displayName: 'Allemagne (Berlin)', timeZone: 'Europe/Berlin', flag: '🇩🇪' },
  { key: 'italie', names: ['italie', 'rome', 'milan'], displayName: 'Italie (Rome)', timeZone: 'Europe/Rome', flag: '🇮🇹' },
  { key: 'belgique', names: ['belgique', 'bruxelles'], displayName: 'Belgique (Bruxelles)', timeZone: 'Europe/Brussels', flag: '🇧🇪' },
  { key: 'suisse', names: ['suisse', 'geneve', 'zurich'], displayName: 'Suisse (Genève / Zurich)', timeZone: 'Europe/Zurich', flag: '🇨🇭' },
  { key: 'japon', names: ['japon', 'tokyo', 'osaka'], displayName: 'Japon (Tokyo)', timeZone: 'Asia/Tokyo', flag: '🇯🇵' },
  { key: 'chine', names: ['chine', 'pekin', 'beijing', 'shanghai'], displayName: 'Chine (Pékin / Shanghai)', timeZone: 'Asia/Shanghai', flag: '🇨🇳' },
  { key: 'uae', names: ['dubai', 'emirats', 'abu dhabi'], displayName: 'Émirats Arabes Unis (Dubaï)', timeZone: 'Asia/Dubai', flag: '🇦🇪' },
  { key: 'bresil', names: ['bresil', 'brasilia', 'rio', 'sao paulo'], displayName: 'Brésil (São Paulo / Brasília)', timeZone: 'America/Sao_Paulo', flag: '🇧🇷' },
];

/**
 * Détecte si la requête de l'utilisateur porte sur la date, l'heure, le jour, le mois ou l'année.
 */
export function isDateTimeQuery(query: string): boolean {
  if (!query || typeof query !== 'string') return false;

  const normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Mots-clés directs d'heure
  if (
    normalized.includes('heure') ||
    normalized.includes('l\'heure') ||
    normalized.includes('l heure') ||
    normalized.includes('heures')
  ) {
    return true;
  }

  // Motifs explicites de date, jour, mois, année
  const patterns = [
    'date aujourd',
    'date du jour',
    'date actuelle',
    'quelle date',
    'quelle est la date',
    'quel date',
    'on est quel jour',
    'quel jour sommes',
    'quel jour on est',
    'quel jour est-on',
    'quel jour est on',
    'quel jour',
    'quel mois',
    'quel mois sommes',
    'en quel mois',
    'quelle annee',
    'en quelle annee',
    'quel annee',
    'annee actuelle',
    'annee en cours',
    'dans quelle annee',
    'aujourd\'hui on est',
    'aujourdhui on est',
    'demain on sera',
    'hier c\'etait',
    'hier etait',
    'fuseau horaire',
    'decalage horaire',
    'time zone',
  ];

  for (const pattern of patterns) {
    if (normalized.includes(pattern)) return true;
  }

  return false;
}

/**
 * Extrait l'heure et la date formatée pour un fuseau horaire IANA donné
 */
export function formatTimeForZone(timeZone: string, refDate: Date = new Date()): { time: string; fullDate: string; weekday: string } {
  try {
    const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return {
      time: timeFormatter.format(refDate),
      fullDate: dateFormatter.format(refDate),
      weekday: new Intl.DateTimeFormat('fr-FR', { timeZone, weekday: 'long' }).format(refDate),
    };
  } catch {
    const fallback = getDynamicDateTime(refDate, HAITI_TIMEZONE);
    return {
      time: fallback.formattedTimeFr,
      fullDate: fallback.formattedDateFr,
      weekday: fallback.dayOfWeekFr,
    };
  }
}

/**
 * Génère une réponse directe, dynamique et exacte pour une question portant sur la date/heure.
 */
export function generateDirectDateTimeAnswer(query: string): string | null {
  if (!isDateTimeQuery(query)) return null;

  const normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const now = new Date();
  const haiti = getHaitiDateTime(now);
  const yesterday = getRelativeDateTime(-1, HAITI_TIMEZONE);
  const tomorrow = getRelativeDateTime(1, HAITI_TIMEZONE);

  // 1. Année
  if (
    normalized.includes('quelle annee') ||
    normalized.includes('en quelle annee') ||
    normalized.includes('quel annee') ||
    normalized.includes('annee actuelle') ||
    normalized.includes('dans quelle annee')
  ) {
    return `Nous sommes en **${haiti.year}**.`;
  }

  // 2. Mois
  if (
    normalized.includes('quel mois') ||
    normalized.includes('en quel mois')
  ) {
    const capitalizedMonth = haiti.monthNameFr.charAt(0).toUpperCase() + haiti.monthNameFr.slice(1);
    return `Nous sommes au mois de **${capitalizedMonth} ${haiti.year}**.`;
  }

  // 3. Demain
  if (normalized.includes('demain') && !normalized.includes('heure')) {
    return `Demain, nous serons le **${tomorrow.formattedDateFr}**.`;
  }

  // 4. Hier
  if (normalized.includes('hier') && !normalized.includes('heure')) {
    return `Hier, c'était le **${yesterday.formattedDateFr}**.`;
  }

  // 5. Questions d'Heure (avec détection multi-pays / multi-villes)
  const isAskingTime =
    normalized.includes('heure') ||
    normalized.includes('quel heure') ||
    normalized.includes('quelle heure') ||
    normalized.includes('fuseau') ||
    normalized.includes('decalage');

  if (isAskingTime) {
    // Détecter toutes les zones mentionnées dans la question
    const matchedZones: InternationalZone[] = [];
    const seenKeys = new Set<string>();

    for (const zone of INTERNATIONAL_ZONES) {
      for (const name of zone.names) {
        // Matching avec bordure de mot pour éviter les faux positifs
        const regex = new RegExp(`(?:^|[^a-z0-9])${name}(?:$|[^a-z0-9])`, 'i');
        if (regex.test(normalized) && !seenKeys.has(zone.key)) {
          matchedZones.push(zone);
          seenKeys.add(zone.key);
          break;
        }
      }
    }

    // Si des pays ou villes spécifiques sont mentionnés (ex: France, Haïti, Sénégal)
    if (matchedZones.length > 0) {
      const items = matchedZones.map((z) => {
        const info = formatTimeForZone(z.timeZone, now);
        return `- ${z.flag} **${z.displayName}** : **${info.time}** *(${info.fullDate})*`;
      });

      return `### 🕒 Heure actuelle en temps réel :\n\n${items.join('\n')}\n\n*Heure calculée avec exactitude par le moteur temporel de Kaydo GPT.*`;
    }

    // Heure par défaut si aucun pays n'est précisé
    const haitiInfo = formatTimeForZone('America/Port-au-Prince', now);
    const franceInfo = formatTimeForZone('Europe/Paris', now);
    const senegalInfo = formatTimeForZone('Africa/Dakar', now);

    return `### 🕒 Heure actuelle en temps réel :\n\n- 🇭🇹 **Haïti (Port-au-Prince)** : **${haitiInfo.time}** *(${haitiInfo.fullDate})*\n- 🇫🇷 **France (Paris)** : **${franceInfo.time}** *(${franceInfo.fullDate})*\n- 🇸🇳 **Sénégal (Dakar)** : **${senegalInfo.time}** *(${senegalInfo.fullDate})*\n\n*(Heure locale de votre appareil : **${now.toLocaleTimeString('fr-FR')}**)*`;
  }

  // 6. Date du jour / Quel jour sommes-nous
  if (
    normalized.includes('date') ||
    normalized.includes('jour') ||
    normalized.includes('aujourd')
  ) {
    const capitalizedDay = haiti.formattedDateFr.charAt(0).toUpperCase() + haiti.formattedDateFr.slice(1);
    return `Aujourd'hui, nous sommes le **${capitalizedDay}** (année **${haiti.year}**).`;
  }

  return `Aujourd'hui, nous sommes le **${haiti.formattedDateFr}** et il est **${String(haiti.hours).padStart(2, '0')}:${String(haiti.minutes).padStart(2, '0')}** (heure d'Haïti).`;
}

/**
 * Contexte textuel dynamique à injecter impérativement dans les instructions système du modèle IA.
 * Garantit que le modèle connaît la date et l'heure exactes au moment de la requête.
 */
export function getTemporalPromptContext(): string {
  const haiti = getHaitiDateTime();
  const utc = getDynamicDateTime(new Date(), 'UTC');
  const yesterday = getRelativeDateTime(-1);
  const tomorrow = getRelativeDateTime(1);

  return `### CONTEXTE TEMPOREL DYNAMIQUE EN TEMPS RÉEL (OBLIGATOIRE ET STRICT) :
- Date et Heure locales en Haïti (America/Port-au-Prince) : ${haiti.formattedFullFr}
- Date et Heure UTC : ${utc.formattedFullFr}
- Année actuelle : ${haiti.year} (Nous sommes en ${haiti.year})
- Mois actuel : ${haiti.monthNameFr} (Mois numéro ${haiti.month} sur 12 de l'année ${haiti.year})
- Jour actuel : ${haiti.formattedDateFr}
- Hier : ${yesterday.formattedDateFr}
- Demain : ${tomorrow.formattedDateFr}

CONSIGNES TEMPORELLES ABSOLUES :
1. Tu dois TOUJOURS utiliser ces données dynamiques pour toute question portant sur la date actuelle, le jour, le mois, l'année ou l'heure.
2. Ne jamais affirmer une ancienne date codée en dur (par exemple ne jamais dire que nous sommes en mai si nous sommes en un autre mois).
3. Si une recherche Web ou un document externe mentionne une date passée ou future, cette date NE REMPLACE JAMAIS la date actuelle ci-dessus.
4. Pour l'heure en Haïti, base-toi toujours sur le fuseau horaire America/Port-au-Prince (${String(haiti.hours).padStart(2, '0')}:${String(haiti.minutes).padStart(2, '0')}).`;
}
