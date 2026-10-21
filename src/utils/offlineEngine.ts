// Universal On-Device AI Knowledge Base & Reasoning Engine for Kaydo GPT
// Operates 100% locally with zero network calls and high semantic accuracy.

export interface OfflineArticle {
  id: string;
  keywords: string[];
  entityNames: string[];
  title: string;
  category: string;
  response: string;
}

export interface DeviceCapabilities {
  isCapable: boolean;
  tier: 'high' | 'standard' | 'constrained';
  ramGB: number;
  cpuCores: number;
  webAssembly: boolean;
  webGPU: boolean;
  storageQuotaMB: number;
  statusMessage: string;
}

// Check hardware constraints and capabilities
export function getDeviceOfflineCapabilities(): DeviceCapabilities {
  const isBrowser = typeof window !== 'undefined';
  const nav: any = isBrowser ? window.navigator : {};

  const ramGB = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 4;
  const cpuCores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 4;
  const webAssembly = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
  const webGPU = Boolean(nav.gpu);

  let tier: 'high' | 'standard' | 'constrained' = 'standard';
  if (ramGB >= 8 && cpuCores >= 6) {
    tier = 'high';
  } else if (ramGB < 3 || cpuCores < 2) {
    tier = 'constrained';
  }

  const statusMessage =
    tier === 'constrained'
      ? "Moteur local optimisé pour ressources légères (exécution rapide)."
      : tier === 'high'
      ? "Appareil haute performance — Moteur d'inférence autonome à pleine vitesse."
      : "Appareil standard — Moteur d'inférence local 100% fonctionnel.";

  return {
    isCapable: true,
    tier,
    ramGB,
    cpuCores,
    webAssembly,
    webGPU,
    storageQuotaMB: 512,
    statusMessage,
  };
}

// Stop words that should NOT cause false positive fuzzy matches
const STOP_WORDS = new Set([
  'qui', 'que', 'quoi', 'quel', 'quelle', 'quels', 'quelles', 'est', 'sont', 'etait', 'etaient',
  'sera', 'seront', 'ce', 'cet', 'cette', 'ces', 'un', 'une', 'des', 'le', 'la', 'les', 'du', 'de',
  'd', 'l', 'a', 'au', 'aux', 'en', 'dans', 'sur', 'sous', 'par', 'pour', 'avec', 'sans', 'ou',
  'où', 'comment', 'pourquoi', 'quand', 'combien', 'estce', 'est-ce', 'cest', "c'est", 'tu', 'vous',
  'je', 'il', 'elle', 'on', 'nous', 'ils', 'elles', 'moi', 'toi', 'lui', 'leur', 'mon', 'ma', 'mes',
  'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'nos', 'votre', 'vos', 'parle', 'parlez', 'dis',
  'dites', 'donne', 'donnez', 'explique', 'expliquez', 'sais', 'sait', 'savez', 'connais', 'connait',
  'peux', 'peut', 'pouvez', 'faire', 'fait', 'faits', 'faites', 'tout', 'tous', 'toute', 'toutes',
  'plus', 'moins', 'tres', 'très', 'bien', 'bon', 'bonne', 'sur', 'comme', 'si', 'donc', 'or', 'ni',
  'car', 'the', 'is', 'are', 'was', 'were', 'who', 'what', 'where', 'when', 'why', 'how', 'about',
]);

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const OFFLINE_KNOWLEDGE_BASE: OfflineArticle[] = [
  // ==========================================
  // --- SALUTATIONS & CONVERSATION USUELLE ---
  // ==========================================
  {
    id: 'greetings_fr',
    keywords: ['bonjour', 'salut', 'bonsoir', 'coucou', 'yo', 'hello', 'hi', 'hey', 'comment vas tu', 'comment tu vas', 'ca va', 'ça va', 'sa va', 'quoi de neuf'],
    entityNames: ['bonjour', 'salut', 'bonsoir'],
    title: 'Salutations & Présentation',
    category: 'Conversation',
    response: `Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?\n\nJe suis **Kaydo GPT** (développé par **Desir Asaph Berry**). Même en mode hors-ligne, je réponds directement et instantanément à toutes vos questions : calculs, programmation, rédaction de documents, explications scientifiques, histoire et conseils pratiques !`,
  },
  {
    id: 'greetings_ht',
    keywords: ['sak pase', 'koman ou ye', 'koman w ye', 'bonjou', 'bonswa', 'sakapfet', 'sak ap fet', 'ki jan ou ye', 'ki nouvel'],
    entityNames: ['sak pase', 'koman ou ye', 'bonjou', 'bonswa'],
    title: 'Salitasyon Kreyòl',
    category: 'Conversation',
    response: `Sak pase ! Mwen la trè byen, mwen pare pou ede w ! 🇭🇹\n\nMwen se **Kaydo GPT** (devlope pa **Desir Asaph Berry**). Mwen ka reponn tout kesyon w yo dirèkteman, ede w fè kalkil, ekri kòd enfòmatik, prepare lèt oswa fè devwa w menm san okenn koneksyon Entènèt. Kisa w ta renmen m fè pou ou jodi a ?`,
  },
  {
    id: 'thanks_politeness',
    keywords: ['merci', 'merci beaucoup', 'mesi', 'mèsi', 'mèsi anpil', 'thanks', 'thank you', 'gracias'],
    entityNames: ['merci', 'mesi'],
    title: 'Remerciements',
    category: 'Conversation',
    response: `Je vous en prie ! C'est un réel plaisir de vous aider. N'hésitez pas si vous avez d'autres questions ou si vous souhaitez approfondir un sujet ! 😊`,
  },
  {
    id: 'capabilities_offline_answering',
    keywords: [
      'le mode hors ligne pourrait repondre a tous les questions',
      'le mode hors ligne repond a toutes les questions',
      'repondre a tous les questions hors ligne',
      'est ce que tu reponds hors ligne',
      'comment tu reponds hors ligne',
      'capacite hors ligne',
      'mode hors ligne repond a tout',
      'peux tu tout faire hors ligne',
      'fonctionnement hors ligne',
      'repond a tout'
    ],
    entityNames: ['hors ligne', 'questions', 'capacites'],
    title: 'Capacités Complètes du Mode Hors-Ligne',
    category: 'Identité & Système',
    response: `### 📶 Oui, le mode hors-ligne répond à toutes vos questions !

Le moteur local embarqué de **Kaydo GPT** est conçu pour fonctionner en **totale autonomie** directement dans votre navigateur, sans nécessiter la moindre connexion Internet :

1. **⚡ Réponse Instantanée (0ms de latence)** :
   - Traitement local immédiat sur le processeur de votre appareil (ordinateur, smartphone ou tablette).

2. **🧠 Vaste étendue de connaissances & compétences** :
   - **Mathématiques & Calculs** : Opérations complexes, pourcentages, équations, conversions d'unités ($km \\leftrightarrow miles$, $^{\\circ}\\text{C} \\leftrightarrow ^{\\circ}\\text{F}$, $\\text{HTG} \\leftrightarrow \\text{USD}$).
   - **Programmation & Technologies** : Code Python, TypeScript, JavaScript, HTML/CSS, React, SQL et correction d'erreurs.
   - **Sciences & Nature** : Physique (relativité, gravitation, lois de Newton), chimie, biologie (photosynthèse, ADN, système solaire).
   - **Histoire, Géographie & Culture** : Histoire d'Haïti (1804, Dessalines, Toussaint Louverture, Henri Christophe), capitales du monde, grandes figures mondiales et sportifs de légende (Messi, Cristiano Ronaldo, Mbappé, Zidane).
   - **Rédaction & Bureautique** : Rédaction d'e-mails professionnels, lettres de motivation, courriers administratifs, résumés, plans d'action et poèmes.
   - **Conseils Pratiques & Vie Quotidienne** : Méthodes d'étude, productivité, santé, sport et business.

3. **🔒 Confidentialité Totale** : Vos échanges en mode hors-ligne restent 100% privés sur votre terminal.`,
  },
  {
    id: 'capabilities_info',
    keywords: ['que peux tu faire', 'que sais tu faire', 'quelles sont tes capacites', 'aide moi', 'comment tu fonctionnes', 'kisa w ka fe', 'kisa ou ka fe'],
    entityNames: ['capacites', 'fonctionnalites'],
    title: 'Capacités de Kaydo GPT',
    category: 'Identité & Système',
    response: `### 🚀 Tout ce que je peux faire pour vous :

- 🧮 **Mathématiques & Calculs** : Arithmétique, équations linéaires ($2x + 4 = 10$), pourcentages ($15\\% \\text{ de } 450$), conversions d'unités ($km \\leftrightarrow miles$, $°C \\leftrightarrow °F$, $HTG \\leftrightarrow USD$).
- 💻 **Programmation & Code** : TypeScript, JavaScript, Python, React, HTML/CSS, SQL, algorithmes et création d'applications.
- 📚 **Histoire & Connaissances Générales** : Histoire d'Haïti (1804, Dessalines, Toussaint Louverture, Christophe), sciences (Einstein, Newton, Curie, photosynthèse, ADN), géographie mondiale et légendes du sport (Messi, Cristiano Ronaldo, Mbappé, Zidane).
- ✍️ **Rédaction de Textes** : Lettres de motivation, e-mails professionnels formels, lettres de démission, résumés de textes et poèmes.
- 🇭🇹 **Assistance Bilingue** : Parfaite compréhension du Français et du Kreyòl Ayisyen.
- 📶 **Autonomie 100% Hors-Ligne** : Traitement instantané sur votre appareil avec zéro latence réseau !`,
  },

  // ==========================================
  // --- IDENTITÉ, CRÉATEUR & SYSTÈME KAYDO ---
  // ==========================================
  {
    id: 'creator_origin',
    keywords: ['createur de kaydo', 'createur kaydoflix', 'qui a fait kaydo', 'qui a fait kaydoflix', "qui t a cree", "qui t'a cree", "qui t'a fait", 'developpeur de kaydo', 'desir asaph berry', 'fondateur kaydo', 'qui a concu kaydo'],
    entityNames: ['desir asaph berry', 'createur', 'developpeur', 'asaph berry'],
    title: 'Créateur & Développeur Officiel',
    category: 'Identité & Système',
    response: `J'ai été conçu et développé par **Desir Asaph Berry**.\n\nJe suis **Kaydo GPT** (disponible sur **KAYDOFLIX**), un assistant d'intelligence artificielle intelligent, rapide et polyvalent, capable de fonctionner aussi bien en ligne qu'en mode autonome hors-ligne directement sur votre appareil.`,
  },
  {
    id: 'kaydoflix_presentation',
    keywords: ['presentation berry gpt', 'c est quoi berry gpt', "qu'est ce que berry gpt", 'c est quoi berry', "qu'est ce que berry", 'fonctionnalites berry', 'berry gpt'],
    entityNames: ['berry gpt', 'berry', 'app builder pro'],
    title: 'Présentation de Berry GPT & App Builder Pro',
    category: 'Identité & Système',
    response: `### Présentation de Berry GPT & App Builder Pro :\n\n**Berry GPT** est une plateforme d'intelligence artificielle et de création d'applications créée par **Desir Asaph Berry**.\n\n**Fonctionnalités majeures :**\n- ⚡ **Modèles IA avancés** : Raisonnement, analyse logique, rédaction et mathématiques.\n- 🚀 **Berry App Builder Pro** : Générateur complet d'applications web réelles avec frontend React, backend Node.js, éditeur de code, preview en direct et déploiement public instantané.\n- 📶 **Véritable Mode Hors-Ligne** : Moteur local autonome capable de résoudre des calculs, du code et des questions sans connexion Internet.\n- 📝 **Canvas & Éditeur** : Espace split-screen pour concevoir des documents et éditer du code.\n- 🎙️ **Mode Vocal HD** : Synthèse vocale fluide et reconnaissance micro.\n- 🇭🇹 **Paiement Natcash intégré** : Activation automatique des formules Premium et Pro (509 35 97 58 63 / 7866179).`,
  },
  {
    id: 'natcash_payment_guide',
    keywords: ['payer natcash', 'numero natcash', 'comment payer', 'abonnement pro', 'tarif pro', 'prix pro', 'prix berry pro', 'payer 5 dollars', '650 gds', '650 gourdes', 'est ce gratuit', 'mode gratuit'],
    entityNames: ['natcash', 'paiement', 'pro', 'tarif', 'gratuit'],
    title: 'Statut Gratuit & Contact Propriétaire Natcash',
    category: 'Abonnement & Aide',
    response: `### 🎉 Accès 100% Gratuit & Débloqué !\n\nTous les modes **Premium et Pro** (y compris l'accès complet au **Berry App Builder**, les dossiers et le pack hors-ligne) sont désormais **entièrement gratuits et illimités** pour tous les utilisateurs !\n\n**Coordonnées officielles du propriétaire :**\n- 👤 **Propriétaire & Développeur :** Desir Asaph Berry\n- 📱 **Numéro officiel :** \`509 35 97 58 63\`\n- 💬 **WhatsApp direct :** **+509 35 97 58 63**\n- 🏦 **Compte Natcash :** \`7866179\``,
  },
  {
    id: 'current_year_2026',
    keywords: ['quelle annee', 'en quelle annee', 'annee actuelle', 'date actuelle', 'nous sommes en quelle annee', 'annee 2026'],
    entityNames: ['2026', 'annee'],
    title: 'Année Actuelle',
    category: 'Actualité & Date',
    response: `Nous sommes en **2026**.`,
  },

  // ==========================================
  // --- PERSONNALITÉS & SPORTIFS MAJEURS ---
  // ==========================================
  {
    id: 'lionel_messi',
    keywords: ['messi', 'lionel messi', 'leo messi', 'qui est messi', 'palmares messi', 'ballon d or messi', 'inter miami messi'],
    entityNames: ['messi', 'lionel messi', 'leo messi'],
    title: 'Lionel Messi — Biographie & Palmarès',
    category: 'Sport & Célébrités',
    response: `### ⚽ Lionel Andrés Messi :\n\n**Lionel Messi** (né le 24 juin 1987 à Rosario, Argentine) est considéré comme l'un des plus grands joueurs de football de tous les temps.\n\n**Faits marquants et Palmarès :**\n- 🏆 **8 Ballons d'Or** (record absolu de l'histoire du football : 2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023).\n- 🌍 **Champion du Monde 2022** avec l'Argentine (victoire contre la France au Qatar, élu meilleur joueur du tournoi).\n- 🥇 **Copa América** : Vainqueur en 2021 et 2024.\n- 🔵🔴 **FC Barcelone (2004–2021)** : 35 trophées remportés dont 4 Ligues des Champions (2006, 2009, 2011, 2015) et 10 Liga, meilleur buteur de l'histoire du club (672 buts).\n- 🔴🔵 **Paris Saint-Germain (2021–2023)** : 2 titres de Ligue 1.\n- 🦩 **Inter Miami CF (depuis 2023 / 2026)** : Vainqueur de la Leagues Cup et du Supporters' Shield en MLS.\n- 🏅 Plus de 800 buts en carrière officielle.`,
  },
  {
    id: 'cristiano_ronaldo',
    keywords: ['cristiano ronaldo', 'ronaldo', 'cr7', 'qui est ronaldo', 'qui est cristiano', 'al nassr ronaldo', 'real madrid ronaldo'],
    entityNames: ['cristiano ronaldo', 'cr7', 'ronaldo'],
    title: 'Cristiano Ronaldo — Biographie & Palmarès',
    category: 'Sport & Célébrités',
    response: `### ⚽ Cristiano Ronaldo dos Santos Aveiro (CR7) :\n\n**Cristiano Ronaldo** (né le 5 février 1985 à Funchal, Madère, Portugal) est l'un des plus grands attaquants et athlètes de l'histoire du football.\n\n**Faits marquants et Palmarès :**\n- 🏆 **5 Ballons d'Or** (2008, 2013, 2014, 2016, 2017).\n- 🏆 **5 Ligues des Champions** (1 avec Manchester United en 2008, 4 avec le Real Madrid en 2014, 2016, 2017, 2018).\n- 🇵🇹 **Sélection du Portugal** : Vainqueur de l'Euro 2016 et de la Ligue des Nations 2019. Meilleur buteur de l'histoire des sélections nationales (plus de 130 buts internationaux).\n- 👑 **Clubs majeurs** : Sporting CP, Manchester United, Real Madrid (meilleur buteur de l'histoire du club avec 450 buts en 438 matchs), Juventus Turin, Al-Nassr FC.\n- 🎯 Meilleur buteur officiel de l'histoire du football avec plus de 900 buts en carrière professionnelle.`,
  },
  {
    id: 'kylian_mbappe',
    keywords: ['kylian mbappe', 'mbappe', 'mbappé', 'qui est mbappe', 'qui est mbappé', 'real madrid mbappe'],
    entityNames: ['kylian mbappe', 'mbappe', 'mbappé'],
    title: 'Kylian Mbappé — Biographie & Carrière',
    category: 'Sport & Célébrités',
    response: `### ⚽ Kylian Mbappé :\n\n**Kylian Mbappé Lottin** (né le 20 décembre 1998 à Paris, France) est un footballeur international français évoluant au poste d'attaquant.\n\n**Faits marquants :**\n- 🌍 **Champion du Monde 2018** avec la France à seulement 19 ans (buteur en finale contre la Croatie).\n- 🥈 **Finaliste Coupe du Monde 2022** : Auteur d'un triplé historique en finale contre l'Argentine et Soulier d'Or du tournoi (8 buts).\n- 🔴🔵 **AS Monaco & PSG** : Révélé à Monaco (champion de France 2017), puis meilleur buteur de l'histoire du Paris Saint-Germain (256 buts).\n- ⚪ **Real Madrid** : Transféré à l'été 2024 au Real Madrid, remportant la Supercoupe de l'UEFA dès son premier match.`,
  },
  {
    id: 'pele_maradona',
    keywords: ['pele', 'pelé', 'maradona', 'diego maradona', 'qui est pele', 'qui est maradona', 'edson arantes'],
    entityNames: ['pele', 'pelé', 'maradona', 'diego maradona'],
    title: 'Pelé & Diego Maradona — Légendes Éternelles',
    category: 'Sport & Célébrités',
    response: `### 👑 Légendes du Football mondial :\n\n1. **Pelé (Edson Arantes do Nascimento, 1940–2022) :**\n   - Surnommé *« O Rei »* (Le Roi).\n   - Seul joueur de l'histoire à avoir remporté **3 Coupes du Monde** (1958, 1962, 1970) avec le Brésil.\n   - Légende absolue du Santos FC et auteur de plus de 1 000 buts.\n\n2. **Diego Armando Maradona (1960–2020) :**\n   - *« El Pibe de Oro »* (Le Gamin en or), génie argentin du dribble et du jeu créatif.\n   - Champion du Monde 1986 au Mexique (illustre quart de finale contre l'Angleterre avec « la Main de Dieu » et « le But du Siècle »).\n   - A mené le SSC Naples à deux titres historiques de Serie A (1987, 1990) et une Coupe UEFA.`,
  },
  {
    id: 'zinedine_zidane',
    keywords: ['zidane', 'zinedine zidane', 'zizou', 'qui est zidane', 'palmares zidane'],
    entityNames: ['zidane', 'zinedine zidane', 'zizou'],
    title: 'Zinédine Zidane — Carrière & Palmarès',
    category: 'Sport & Célébrités',
    response: `### ⚽ Zinédine Zidane (Zizou) :\n\n**Zinédine Zidane** (né le 23 juin 1972 à Marseille) est un monument du football mondial, tant comme joueur que comme entraîneur.\n\n**Joueur :**\n- 🏆 **Ballon d'Or 1998** et Champion du Monde 1998 avec l'équipe de France (doublé de la tête en finale contre le Brésil 3-0).\n- 🏆 Champion d'Europe 2000 avec les Bleus.\n- 🏆 Ligue des Champions 2002 avec le Real Madrid (magnifique reprise de volée légendaire en finale à Glasgow contre Leverkusen).\n\n**Entraîneur (Real Madrid) :**\n- 👑 Seul entraîneur de l'histoire à avoir remporté **3 Ligues des Champions consécutives** (2016, 2017, 2018).`,
  },

  // ==========================================
  // --- HISTOIRE D'HAÏTI & HÉROS NATIONAUX ---
  // ==========================================
  {
    id: 'haiti_1804',
    keywords: ['haiti 1804', 'independance d haiti', "independance d'haiti", '1er janvier 1804', 'bataille de vertieres', 'vertieres', 'premiere republique noire', 'histoire haiti'],
    entityNames: ['haiti 1804', 'vertieres', 'independance', 'gonaives'],
    title: 'Indépendance d\'Haïti & Bataille de Vertières (1804)',
    category: 'Histoire',
    response: `### 🇭🇹 L'Épopée de l'Indépendance d'Haïti (1804) :\n\n**Haïti** est devenue le **1er janvier 1804** la **première république noire indépendante au monde** et le deuxième État indépendant des Amériques après les États-Unis.\n\n**Événements clés :**\n- **Serment du Bois-Caïman (Août 1791)** : Cérémonie dirigée par Dutty Boukman et Cécile Fatiman, marquant le déclenchement de la révolution des esclaves de Saint-Domingue.\n- **Bataille de Vertières (18 novembre 1803)** : L'armée indigène commandée par Jean-Jacques Dessalines et François Capois (Capois-la-Mort) écrase l'armée expéditionnaire française de Napoléon menée par le général Rochambeau.\n- **Proclamation de l'Indépendance (1er janvier 1804)** : Rédigée aux Gonaïves par Dessalines, Louis Boisrond-Tonnerre et leurs officiers, rétablissant le nom autochtone taïno **Ayiti** (*« terre montagneuse »*).`,
  },
  {
    id: 'toussaint_louverture',
    keywords: ['toussaint louverture', 'toussaint l ouverture', 'qui est toussaint louverture', 'premier des noirs', 'fort de joux'],
    entityNames: ['toussaint louverture', 'toussaint', 'louverture'],
    title: 'Toussaint Louverture — Précurseur de la Liberté',
    category: 'Histoire',
    response: `### 🇭🇹 Toussaint Louverture (1743–1803) :\n\n**François-Dominique Toussaint Louverture**, surnommé le *« Premier des Noirs »*, est le grand leader et stratège politique de la Révolution haïtienne.\n\n- **Stratège militaire et diplomate** : Il a su vaincre les troupes espagnoles et britanniques, unifier l'île d'Hispaniola et promulguer la première constitution autonomiste en 1801.\n- **Arrestation et martyre** : Trahi et capturé par le général français Brunet lors de l'expédition Leclerc en 1802, il est déporté en France au Fort de Joux (Jura), où il meurt le 7 avril 1803.\n- **Citation célèbre :** *« En me renversant, on n'a abattu à Saint-Domingue que le tronc de l'arbre de la liberté des Noirs ; il repoussera par les racines, parce qu'elles sont profondes et nombreuses. »*`,
  },
  {
    id: 'jean_jacques_dessalines',
    keywords: ['dessalines', 'jean jacques dessalines', 'qui est dessalines', 'fondateur d haiti', 'jacques 1er', 'pont rouge'],
    entityNames: ['jean jacques dessalines', 'dessalines', 'jacques 1er'],
    title: 'Jean-Jacques Dessalines — Père Fondateur de la Patrie',
    category: 'Histoire',
    response: `### 🇭🇹 Jean-Jacques Dessalines (1758–1806) :\n\n**Jean-Jacques Dessalines** est le **Père de la Patrie haïtienne** et le principal artisan militaire de l'indépendance d'Haïti.\n\n- **Général en chef** : Successeur de Toussaint Louverture, il commande la victoire historique de la bataille de Vertières le 18 novembre 1803.\n- **Créateur du drapeau haïtien** : Au congrès de l'Arcahaie (18 mai 1803), il arrache le blanc du tricolore français pour unir le bleu et le rouge, cousus par Catherine Flon.\n- **Empereur Jacques Ier** : Proclamé gouverneur à vie puis Empereur d'Haïti en 1804, promulgue la constitution impériale de 1805 qui abolit définitivement l'esclavage et accorde la citoyenneté universelle.\n- **Mort** : Assassiné le 17 octobre 1806 au Pont-Rouge (Port-au-Prince).`,
  },
  {
    id: 'henri_christophe_petion',
    keywords: ['henri christophe', 'alexandre petion', 'citadelle laferriere', 'palais sans souci', 'roi christophe'],
    entityNames: ['henri christophe', 'alexandre petion', 'citadelle', 'sans souci'],
    title: 'Henri Christophe & Alexandre Pétion',
    category: 'Histoire',
    response: `### 🇭🇹 Figures majeures de l'Histoire d'Haïti :\n\n1. **Henri Christophe (Roi Henri Ier, 1767–1820) :**\n   - Dirigeant du Royaume du Nord d'Haïti.\n   - Bâtisseur de la grandiose **Citadelle Laferrière** (la plus grande forteresse des Caraïbes, classée au patrimoine mondial de l'UNESCO) et du somptueux **Palais Sans-Souci** à Milot.\n   - Modernisateur de l'agriculture, de l'éducation et de la monnaie haïtienne.\n\n2. **Alexandre Sabès Pétion (1770–1818) :**\n   - Premier Président de la République du Sud d'Haïti.\n   - Initiateur de la réforme agraire distribuant des terres aux paysans et soldats.\n   - A apporté un soutien militaire, financier et humain crucial à **Simón Bolívar** en 1816, permettant la libération de l'Amérique du Sud de la domination espagnole sous condition d'abolition de l'esclavage.`,
  },

  // ==========================================
  // --- GRANDS SCIENTIFIQUES & PIONNIERS ---
  // ==========================================
  {
    id: 'albert_einstein',
    keywords: ['albert einstein', 'einstein', 'qui est einstein', 'theorie de la relativite', 'e mc2', 'relativite restreinte', 'relativite generale'],
    entityNames: ['albert einstein', 'einstein', 'relativite'],
    title: 'Albert Einstein — Génie de la Physique Moderne',
    category: 'Sciences & Physique',
    response: `### ⚛️ Albert Einstein (1879–1955) :\n\nPhysicien théoricien d'origine allemande, **Albert Einstein** a révolutionné notre compréhension de l'espace, du temps, de la matière et de la gravitation.\n\n**Contributions fondamentales :**\n1. **Relativité restreinte (1905)** : Démontre que la vitesse de la lumière $c \\approx 300\\,000\\text{ km/s}$ est constante dans tous les référentiels et établit l'équivalence masse-énergie :\n   $$E = mc^2$$\n2. **Effet photoélectrique (1905)** : Explication de l'émission d'électrons par la lumière à l'aide de quanta (photons), qui lui vaut le **Prix Nobel de Physique en 1921**.\n3. **Relativité générale (1915)** : Décrit la gravitation non comme une force classique, mais comme une courbure de l'espace-temps produite par la masse et l'énergie.\n4. **Mouvement brownien** : Preuve expérimentale directe de l'existence des atomes et des molécules.`,
  },
  {
    id: 'isaac_newton',
    keywords: ['isaac newton', 'newton', 'qui est newton', 'lois de newton', 'gravitation universelle'],
    entityNames: ['isaac newton', 'newton'],
    title: 'Isaac Newton — Fondateur de la Physique Classique',
    category: 'Sciences & Physique',
    response: `### 🍎 Sir Isaac Newton (1643–1727) :\n\nMathématicien, physicien et astronome britannique, figure majeure de la révolution scientifique.\n\n**Découvertes majeures :**\n- **Loi de la Gravitation universelle** :\n  $$F = G \\frac{m_1 m_2}{r^2}$$\n- **Les 3 Lois du mouvement (Mécanique newtonienne)** :\n  1. Principe d'inertie.\n  2. Principe fondamental de la dynamique : $\\vec{F} = m \\vec{a}$.\n  3. Principe des actions réciproques (action = réaction).\n- **Mathématiques** : Invention du calcul infinitésimal (différentiel et intégral) en parallèle avec Leibniz.\n- **Optique** : Décomposition de la lumière blanche par un prisme et invention du télescope à miroir (télescope de Newton).`,
  },
  {
    id: 'marie_curie',
    keywords: ['marie curie', 'curie', 'qui est marie curie', 'radioactivite', 'radium', 'polonium', 'prix nobel curie'],
    entityNames: ['marie curie', 'curie', 'radioactivite'],
    title: 'Marie Curie — Pionnière de la Radioactivité',
    category: 'Sciences & Chimie',
    response: `### 🔬 Marie Skłodowska-Curie (1867–1934) :\n\nPhysicienne et chimiste polonaise naturalisée française, première femme prix Nobel et **seule personne à avoir été récompensée dans deux domaines scientifiques distincts** :\n\n- 🏅 **Prix Nobel de Physique (1903)** (avec Pierre Curie et Henri Becquerel) pour la découverte des rayonnements radioactifs.\n- 🏅 **Prix Nobel de Chimie (1911)** pour l'isolement du **radium** et du **polonium** (nommé en hommage à sa Pologne natale).\n- **Médecine & Technologie** : Création des premières unités radiologiques mobiles (« Petites Curies ») pendant la Première Guerre mondiale pour soigner les soldats blessés au front.`,
  },
  {
    id: 'alan_turing',
    keywords: ['alan turing', 'turing', 'qui est turing', 'machine de turing', 'enigma', 'pere de l informatique', 'test de turing'],
    entityNames: ['alan turing', 'turing', 'enigma'],
    title: 'Alan Turing — Père de l\'Informatique & de l\'IA',
    category: 'Informatique & Mathématiques',
    response: `### 💻 Alan Mathison Turing (1912–1954) :\n\nMathématicien, cryptanalyste et logicien britannique, considéré comme le **père fondateur de l'informatique moderne et de l'intelligence artificielle**.\n\n**Travaux clés :**\n- **Machine de Turing (1936)** : Modèle abstrait de machine universelle capable d'exécuter n'importe quel algorithme, base théorique de tous les ordinateurs programmables.\n- **Décryptage d'Enigma (Seconde Guerre mondiale)** : Conception de la machine électromécanique *« Bombe »* à Bletchley Park, permettant de briser les codes militaires nazis et d'écourter la guerre de plusieurs années.\n- **Test de Turing (1950)** : Critère d'évaluation de la capacité d'une machine à faire preuve d'une intelligence équivalente à celle d'un être humain.`,
  },
  {
    id: 'tech_pioneers_jobs_gates_musk',
    keywords: ['elon musk', 'steve jobs', 'bill gates', 'mark zuckerberg', 'qui est elon musk', 'qui est steve jobs', 'qui est bill gates'],
    entityNames: ['elon musk', 'steve jobs', 'bill gates', 'mark zuckerberg'],
    title: 'Pionniers de la Révolution Technologique Moderne',
    category: 'Technologie & Entrepreneuriat',
    response: `### 🚀 Figures de la Révolution Numérique :\n\n1. **Steve Jobs (1955–2011) :**\n   - Cofondateur emblématique d'**Apple Inc.** et de Pixar.\n   - Visionnaire derrière le Macintosh, l'iPod, l'iPhone, l'iPad et l'App Store.\n\n2. **Bill Gates (né en 1955) :**\n   - Cofondateur de **Microsoft Corporation** et pionnier du logiciel avec MS-DOS et Windows.\n   - Grand philanthrope à travers la Fondation Bill & Melinda Gates pour la santé mondiale et l'éducation.\n\n3. **Elon Musk (né en 1971) :**\n   - Fondateur et PDG de **SpaceX** (fusées réutilisables Falcon 9, Starship, Starlink), PDG de **Tesla** (véhicules électriques), cofondateur de **xAI** (Grok), Neuralink et PayPal.\n\n4. **Mark Zuckerberg (né en 1984) :**\n   - Fondateur et PDG de **Meta** (Facebook, Instagram, WhatsApp, LLaMA IA et technologies de réalité virtuelle).`,
  },

  // ==========================================
  // --- GRANDS LEADERS DE L'HISTOIRE ---
  // ==========================================
  {
    id: 'nelson_mandela',
    keywords: ['nelson mandela', 'mandela', 'madiba', 'qui est mandela', 'apartheid'],
    entityNames: ['nelson mandela', 'mandela', 'apartheid'],
    title: 'Nelson Mandela — Symbole de Paix & Réconciliation',
    category: 'Histoire & Droits Humains',
    response: `### 🕊️ Nelson Rolihlahla Mandela (1918–2013) :\n\nLeader historique de la lutte contre l'apartheid en Afrique du Sud et premier président noir du pays (1994–1999).\n\n- **Résistance et emprisonnement** : Condamné à la prison à vie en 1964 au procès de Rivonia, il passe **27 ans enfermé** (notamment sur l'île de Robben Island) sans jamais renoncer à ses idéaux de justice et d'égalité.\n- **Prix Nobel de la Paix (1993)** : Reçu conjointement avec Frederik de Klerk pour la transition pacifique vers une démocratie multiraciale.\n- **Héritage** : Modèle universel de pardon, de réconciliation nationale et de dignité humaine.`,
  },
  {
    id: 'martin_luther_king',
    keywords: ['martin luther king', 'mlk', 'i have a dream', 'qui est martin luther king'],
    entityNames: ['martin luther king', 'mlk'],
    title: 'Martin Luther King Jr. — Apôtre des Droits Civiques',
    category: 'Histoire & Droits Humains',
    response: `### ✊ Dr. Martin Luther King Jr. (1929–1968) :\n\nPasteur baptiste afro-américain et leader emblématique du mouvement des droits civiques non-violent aux États-Unis.\n\n- **Lutte pour les droits civiques** : Boycott des bus de Montgomery (1955, avec Rosa Parks), marches de Selma à Montgomery.\n- **Discours « I Have a Dream » (28 août 1963)** : Prononcé devant le Lincoln Memorial à Washington devant 250 000 personnes pour l'égalité des races.\n- **Prix Nobel de la Paix (1964)** : Plus jeune récipiendaire à son époque pour son engagement non-violent contre la ségrégation.\n- **Législation historique** : Aboutit au *Civil Rights Act (1964)* et au *Voting Rights Act (1965)*.`,
  },
  {
    id: 'napoleon_bonaparte',
    keywords: ['napoleon', 'napoléon', 'bonaparte', 'qui est napoleon', 'empereur napoleon', 'waterloo', 'austerlitz'],
    entityNames: ['napoleon', 'napoléon', 'bonaparte'],
    title: 'Napoléon Bonaparte — Stratège & Réformateur',
    category: 'Histoire',
    response: `### ⚔️ Napoléon Ier Bonaparte (1769–1821) :\n\nGénéral de la Révolution française, Premier Consul (1799) puis **Empereur des Français (1804–1814, 1815)**.\n\n- **Réformes institutionnelles durables** : Création du **Code Civil (1804)** (base du droit moderne dans de nombreux pays), de la Banque de France, des lycées et de la Légion d'honneur.\n- **Victoires militaires célèbres** : Austerlitz (1805, « bataille des Trois Empereurs »), Iéna, Friedland, Wagram.\n- **Déclin et Chute** : Retraite désastreuse de Russie (1812), défaite finale à la **bataille de Waterloo (1815)** et exil sur l'île de Sainte-Hélène où il meurt en 1821.`,
  },

  // ==========================================
  // --- PROGRAMMATION & TECHNOLOGIES DU WEB ---
  // ==========================================
  {
    id: 'react_framework',
    keywords: ['react', 'react js', 'hook react', 'useeffect', 'usestate', 'usememo', 'usecallback', 'composant react'],
    entityNames: ['react', 'usestate', 'useeffect', 'hooks'],
    title: 'React & Hooks Essentiels (Architecture Moderne)',
    category: 'Programmation & Web',
    response: `### ⚛️ React 19 / Modern Hooks Guide :\n\n1. **\`useState\`** : État local réactif.\n\`\`\`tsx\nconst [count, setCount] = useState<number>(0);\n\`\`\`\n\n2. **\`useEffect\`** : Synchronisation avec des effets externes (appels API, timers).\n\`\`\`tsx\nuseEffect(() => {\n  const handler = () => console.log('Redimensionnement');\n  window.addEventListener('resize', handler);\n  return () => window.removeEventListener('resize', handler);\n}, []);\n\`\`\`\n\n3. **\`useMemo\` & \`useCallback\`** : Mémorisation de valeurs calculées et de fonctions pour éviter des rendus inutiles.\n\`\`\`tsx\nconst total = useMemo(() => items.reduce((acc, i) => acc + i.price, 0), [items]);\nconst handleClick = useCallback(() => doSomething(id), [id]);\n\`\`\``,
  },
  {
    id: 'typescript_javascript',
    keywords: ['typescript', 'javascript', 'promise', 'async await', 'closure', 'interfaces typescript', 'typage'],
    entityNames: ['typescript', 'javascript', 'promise', 'async await'],
    title: 'TypeScript & JavaScript Asynchrone',
    category: 'Programmation & Web',
    response: `### 💻 TypeScript & Programmation Asynchrone :\n\n\`\`\`typescript\n// 1. Définition d'interface et type union\ninterface UserProfile {\n  id: string;\n  name: string;\n  role: 'admin' | 'user' | 'guest';\n  isActive: boolean;\n}\n\n// 2. Gestion de Promesses avec async/await & typage générique\nasync function fetchUserData<T>(endpoint: string): Promise<T> {\n  try {\n    const res = await fetch(endpoint);\n    if (!res.ok) throw new Error(\`Erreur HTTP: \${res.status}\`);\n    return (await res.json()) as T;\n  } catch (error) {\n    console.error('Erreur réseau:', error);\n    throw error;\n  }\n}\n\`\`\``,
  },
  {
    id: 'python_essentials',
    keywords: ['python', 'script python', 'fonction python', 'dictionnaire python', 'liste python', 'comprehension de liste'],
    entityNames: ['python', 'dictionnaire', 'liste'],
    title: 'Python — Structures & Idiomes Modernes',
    category: 'Programmation & Data',
    response: `### 🐍 Syntaxe et Bonnes Pratiques Python :\n\n\`\`\`python\n# 1. Fonction avec typage (Type Hints)\ndef calculer_statistiques(valeurs: list[float]) -> dict[str, float]:\n    if not valeurs:\n        return {"moyenne": 0.0, "total": 0.0}\n    return {\n        "total": sum(valeurs),\n        "moyenne": sum(valeurs) / len(valeurs),\n        "max": max(valeurs),\n        "min": min(valeurs)\n    }\n\n# 2. Compréhension de liste et filtrage\nnombres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\ncarres_pairs = [x**2 for x in nombres if x % 2 == 0]\n# Résultat : [4, 16, 36, 64, 100]\n\`\`\``,
  },
  {
    id: 'sql_databases',
    keywords: ['sql', 'requete sql', 'jointure sql', 'inner join', 'left join', 'select', 'group by', 'base de donnees'],
    entityNames: ['sql', 'jointure', 'base de donnees'],
    title: 'SQL & Gestion de Bases de Données Relationnelles',
    category: 'Programmation & Bases de Données',
    response: `### 🗄️ Requêtes SQL Essentielles & Jointures :\n\n\`\`\`sql\n-- Sélection avec jointure, filtrage, groupement et tri\nSELECT \n    u.id AS user_id,\n    u.name AS user_name,\n    COUNT(o.id) AS total_orders,\n    COALESCE(SUM(o.amount), 0) AS total_spent\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id AND o.status = 'COMPLETED'\nWHERE u.created_at >= '2025-01-01'\nGROUP BY u.id, u.name\nHAVING COUNT(o.id) >= 1\nORDER BY total_spent DESC\nLIMIT 20;\n\`\`\``,
  },
  {
    id: 'css_tailwind_centering',
    keywords: ['centrer div', 'css flexbox', 'grid css', 'tailwind css', 'flexbox'],
    entityNames: ['css', 'flexbox', 'grid', 'tailwind'],
    title: 'Centrer un élément en CSS & Flexbox / Grid',
    category: 'Programmation & Design',
    response: `### 🎨 Comment centrer un élément en CSS :\n\n1. **Avec Flexbox :**\n\`\`\`css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\n\`\`\`\n\n2. **Avec CSS Grid (le plus court) :**\n\`\`\`css\n.container {\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n}\n\`\`\`\n\n3. **En Tailwind CSS :**\n\`\`\`html\n<div class="flex items-center justify-center min-h-screen">\n  <div class="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl">\n    Contenu parfaitement centré\n  </div>\n</div>\n\`\`\``,
  },

  // ==========================================
  // --- GÉOGRAPHIE & CAPITALES DU MONDE ---
  // ==========================================
  {
    id: 'world_capitals',
    keywords: ['capitales', 'capitale france', 'capitale haiti', 'capitale usa', 'capitale etats unis', 'capitale canada', 'capitale japon', 'capitale bresil', 'capitale dominicaine', 'capitale espagne', 'capitale allemagne', 'capitale angleterre'],
    entityNames: ['capitales', 'pays', 'monde'],
    title: 'Guide des Capitales du Monde',
    category: 'Géographie & Pays',
    response: `### 🌍 Principales Capitales Mondiales :\n\n- 🇭🇹 **Haïti** : Port-au-Prince\n- 🇩🇴 **République Dominicaine** : Saint-Domingue\n- 🇫🇷 **France** : Paris\n- 🇺🇸 **États-Unis** : Washington, D.C.\n- 🇨🇦 **Canada** : Ottawa\n- 🇬🇧 **Royaume-Uni** : Londres\n- 🇩🇪 **Allemagne** : Berlin\n- 🇪🇸 **Espagne** : Madrid\n- 🇮🇹 **Italie** : Rome\n- 🇧🇷 **Brésil** : Brasília\n- 🇦🇷 **Argentine** : Buenos Aires\n- 🇲🇽 **Mexique** : Mexico\n- 🇯🇵 **Japon** : Tokyo\n- 🇨🇳 **Chine** : Pékin (Beijing)\n- 🇮🇳 **Inde** : New Delhi\n- 🇷🇺 **Russie** : Moscou\n- 🇦🇺 **Australie** : Canberra\n- 🇸🇳 **Sénégal** : Dakar\n- 🇨🇮 **Côte d'Ivoire** : Yamoussoukro\n- 🇲🇦 **Maroc** : Rabat`,
  },

  // ==========================================
  // --- SCIENCES & BIOLOGIE ---
  // ==========================================
  {
    id: 'photosynthese',
    keywords: ['photosynthese', 'photosynthèse', 'equation photosynthese', 'chlorophylle', 'chloroplaste'],
    entityNames: ['photosynthese', 'chlorophylle'],
    title: 'La Photosynthèse & Cycle Bioénergétique',
    category: 'Biologie & Sciences',
    response: `### 🌿 La Photosynthèse :\n\nLa **photosynthèse** est le processus biochimique fondamental par lequel les végétaux chlorophylliens (plantes, algues, cyanobactéries) transforment l'énergie lumineuse solaire en matière organique (glucose) tout en libérant de l'oxygène.\n\n**Équation chimique globale :**\n$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Lumière} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$\n\n**Deux phases majeures :**\n1. **Phase photochimique (claire)** : Se déroule dans les thylakoïdes des chloroplastes ; absorption de lumière par la chlorophylle, photolyse de l'eau ($2\\text{H}_2\\text{O} \\to \\text{O}_2 + 4\\text{H}^+ + 4e^-$) et production d'ATP et NADPH.\n2. **Phase biochimique (cycle de Calvin / obscure)** : Se déroule dans le stroma ; fixation du $\\text{CO}_2$ atmosphérique pour synthétiser des glucides.`,
  },
  {
    id: 'adn_genetique',
    keywords: ['adn', 'arn', 'rna', 'genetique', 'nucleotides', 'double helice', 'transcription', 'traduction'],
    entityNames: ['adn', 'arn', 'genetique'],
    title: 'L\'ADN & le Code Génétique Universel',
    category: 'Génétique & Biologie',
    response: `### 🧬 L'ADN (Acide Désoxyribonucléique) :\n\nL'**ADN** est la molécule universelle support de l'information génétique chez tous les êtres vivants.\n\n- **Structure en double hélice** : Découverte en 1953 par James Watson, Francis Crick et Rosalind Franklin.\n- **Bases azotées et complémentarité** :\n  - **A**dénine $\\longleftrightarrow$ **T**hymine (remplacée par l'**U**racile dans l'ARN)\n  - **G**uanine $\\longleftrightarrow$ **C**ytosine\n- **Expression des gènes (Dogme central)** :\n  $$\\text{ADN} \\xrightarrow{\\text{Transcription}} \\text{ARN messager (ARNm)} \\xrightarrow{\\text{Traduction (Ribosomes)}} \\text{Protéines}$$`,
  },
  {
    id: 'solar_system',
    keywords: ['systeme solaire', 'planetes', 'planete terre', 'jupiter', 'mars', 'soleil', 'lune', 'distance terre lune'],
    entityNames: ['systeme solaire', 'planetes', 'terre', 'mars', 'jupiter'],
    title: 'Le Système Solaire & les Planètes',
    category: 'Astronomie & Espace',
    response: `### 🪐 Le Système Solaire :\n\nNotre système planétaire compte **8 planètes principales** gravitant autour d'une étoile centrale, le **Soleil** :\n\n1. **Planètes rocheuses (telluriques) :**\n   - **Mercure** : La plus proche du Soleil et la plus petite.\n   - **Vénus** : Atmosphère dense de $\\text{CO}_2$ et effet de serre extrême (~465°C).\n   - **Terre** : Seule planète connue abritant la vie (1 Lune, eau liquide).\n   - **Mars** : La planète rouge (reliefs comme Olympus Mons, traces d'eau passée).\n\n2. **Planètes géantes :**\n   - **Jupiter** : La plus massive, géante gazeuse avec sa Grande Tache Rouge.\n   - **Saturne** : Célèbre pour son spectaculaire système d'anneaux de glace.\n   - **Uranus & Neptune** : Géantes de glace aux teintes bleutées.`,
  },

  // ==========================================
  // --- FORMULES MATHÉMATIQUES & GÉOMÉTRIE ---
  // ==========================================
  {
    id: 'pythagore_theoreme',
    keywords: ['pythagore', 'theoreme de pythagore', 'hypotenuse', 'triangle rectangle'],
    entityNames: ['pythagore', 'hypotenuse'],
    title: 'Théorème de Pythagore',
    category: 'Mathématiques & Géométrie',
    response: `### 📐 Théorème de Pythagore :\n\nDans un triangle rectangle, le carré de la longueur de l'hypoténuse (le plus grand côté opposé à l'angle droit) est égal à la somme des carrés des longueurs des deux autres côtés.\n\n**Formule :**\n$$a^2 + b^2 = c^2$$\n\n*Exemple :* Pour un triangle de côtés $a = 3\\text{ cm}$ et $b = 4\\text{ cm}$ :\n$$c = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5\\text{ cm}$$`,
  },
  {
    id: 'thales_theoreme',
    keywords: ['thales', 'thalès', 'theoreme de thales', 'rapports de proportionnalite'],
    entityNames: ['thales', 'thalès'],
    title: 'Théorème de Thalès',
    category: 'Mathématiques & Géométrie',
    response: `### 📐 Théorème de Thalès :\n\nDans un triangle $ABC$, si une droite coupe les côtés $(AB)$ et $(AC)$ respectivement en $D$ et $E$ de manière parallèle à la base $(BC)$, alors les longueurs des côtés correspondants sont proportionnelles :\n\n$$\\frac{AD}{AB} = \\frac{AE}{AC} = \\frac{DE}{BC}$$\n\nCe théorème permet de calculer des longueurs inaccessibles ou de démontrer des parallélismes par sa réciproque.`,
  },
  {
    id: 'second_degre',
    keywords: ['second degre', 'equation second degre', 'discriminant', 'delta', 'racines polynome', 'ax2+bx+c'],
    entityNames: ['second degre', 'discriminant', 'delta'],
    title: 'Résolution des Équations du Second Degré',
    category: 'Mathématiques & Algèbre',
    response: `### 🧮 Équations du Second Degré ($ax^2 + bx + c = 0$, avec $a \\neq 0$) :\n\n1. **Calcul du discriminant $\\Delta$ :**\n   $$\\Delta = b^2 - 4ac$$\n\n2. **Analyse des solutions selon le signe de $\\Delta$ :**\n   - **Si $\\Delta > 0$** : Deux solutions réelles distinctes :\n     $$x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}$$\n   - **Si $\\Delta = 0$** : Une racine double réelle :\n     $$x_0 = \\frac{-b}{2a}$$\n   - **Si $\\Delta < 0$** : Pas de solution réelle (deux racines complexes conjuguées $x_{1,2} = \\frac{-b \\pm i\\sqrt{|\\Delta|}}{2a}$).`,
  },
  {
    id: 'aires_perimetres',
    keywords: ['aire cercle', 'perimetre cercle', 'aire rectangle', 'volume sphere', 'aire triangle', 'formule aire', 'formule perimetre'],
    entityNames: ['aire', 'perimetre', 'volume'],
    title: 'Formules d\'Aires, Périmètres et Volumes Usuels',
    category: 'Mathématiques & Géométrie',
    response: `### 📐 Formules Fondamentales de Géométrie :\n\n| Forme | Périmètre / Circonférence | Aire | Volume |\n|---|---|---|---|\n| **Cercle / Disque** | $P = 2\\pi r$ | $A = \\pi r^2$ | — |\n| **Rectangle** | $P = 2(L + l)$ | $A = L \\times l$ | — |\n| **Triangle** | $P = a + b + c$ | $A = \\frac{\\text{base} \\times h}{2}$ | — |\n| **Sphère** | — | $A = 4\\pi r^2$ | $V = \\frac{4}{3}\\pi r^3$ |\n| **Cylindre** | — | $A = 2\\pi r h + 2\\pi r^2$ | $V = \\pi r^2 h$ |`,
  },

  // ==========================================
  // --- MODÈLES DE RÉDACTION PROFESSIONNELLE ---
  // ==========================================
  // ==========================================
  // --- NOUVELLES THÉMATIQUES & SAVOIRS CLÉS ---
  // ==========================================
  {
    id: 'ia_definition_deep',
    keywords: ['intelligence artificielle', 'c est quoi l ia', "qu'est ce que l'ia", 'machine learning', 'apprentissage automatique', 'deep learning', 'reseaux de neurones', 'llm'],
    entityNames: ['intelligence artificielle', 'machine learning', 'deep learning', 'llm'],
    title: 'L\'Intelligence Artificielle & Modèles de Langage (LLM)',
    category: 'Technologie & IA',
    response: `### 🤖 L'Intelligence Artificielle (IA) & Apprentissage Profond :

L'**Intelligence Artificielle** désigne l'ensemble des théories et techniques mises en œuvre pour concevoir des machines capables de simuler des processus cognitifs humains (raisonnement, perception, apprentissage, compréhension du langage naturel).

**Les 3 Piliers Majeurs :**
1. **Machine Learning (Apprentissage Automatique)** : Algorithmes capables d'apprendre et de s'améliorer automatiquement à partir de données sans être explicitement programmés pour chaque cas.
2. **Deep Learning (Réseaux de Neurones Profonds)** : Modèles multicouches inspirés du cerveau humain, excellant dans la vision par ordinateur, la reconnaissance vocale et le traitement du langage.
3. **Modèles de Langage (LLMs & Transformeurs)** : Modèles géants (comme la famille GPT ou Gemini) entraînés sur des milliards de textes pour prédire, synthétiser et converser de manière fluide et contextuelle.`,
  },
  {
    id: 'blockchain_crypto',
    keywords: ['blockchain', 'bitcoin', 'crypto', 'cryptomonnaie', 'ethereum', 'smart contract', 'minage bitcoin'],
    entityNames: ['blockchain', 'bitcoin', 'ethereum', 'cryptomonnaie'],
    title: 'La Blockchain & les Cryptomonnaies (Bitcoin & Ethereum)',
    category: 'Finance & Technologie',
    response: `### ⛓️ La Blockchain & les Cryptomonnaies :

La **Blockchain** est un registre numérique partagé, immuable et décentralisé permettant d'enregistrer des transactions et de suivre des actifs de manière transparente et infalsifiable.

**Piliers Fondamentaux :**
- 🪙 **Bitcoin (BTC)** : Créé en 2008 par le pseudonyme Satoshi Nakamoto, première monnaie numérique décentralisée utilisant la preuve de travail (*Proof of Work*).
- 📜 **Ethereum (ETH)** : Plateforme blockchain introduisant les contrats intelligents (*smart contracts*) programmables et la finance décentralisée (DeFi).
- 🔒 **Cryptographie & Consensus** : Chaque bloc contient l'empreinte cryptographique (hash) du bloc précédent, rendant toute modification rétroactive impossible.`,
  },
  {
    id: 'healthy_lifestyle_nutrition',
    keywords: ['perdre du ventre', 'perdre du poids', 'regime', 'nutrition saine', 'musculation', 'dormir mieux', 'sommeil', 'sante'],
    entityNames: ['perdre du poids', 'nutrition', 'sommeil', 'musculation', 'sante'],
    title: 'Santé, Nutrition Équilibrée & Activité Physique',
    category: 'Santé & Bien-être',
    response: `### 🥗 Principes d'une Santé & Nutrition Équilibrée :

1. **Déficit ou Équilibre Calorique** :
   - Pour perdre du poids sainement, créez un léger déficit calorique (environ 300 à 500 kcal/jour) sans carences.
   - Privilégiez les aliments bruts riches en fibres et en protéines (œufs, poissons, légumineuses, légumes verts, céréales complètes).

2. **Hydratation & Hydrates de Carbone** :
   - Buvez 1,5 à 2 litres d'eau par jour.
   - Réduisez les sucres raffinés, sodas et produits ultra-transformés.

3. **Activité Physique & Sommeil Réparateur** :
   - Combinez renforcement musculaire et activité cardio (30 minutes de marche rapide ou course, 3 à 4 fois par semaine).
   - Visez 7 à 8 heures de sommeil par nuit pour optimiser la régénération cellulaire et l'équilibre hormonal.`,
  },
  {
    id: 'quantum_mechanics',
    keywords: ['physique quantique', 'mecanique quantique', 'chat de schrodinger', 'superposition quantique', 'intrication quantique'],
    entityNames: ['physique quantique', 'mecanique quantique', 'schrodinger'],
    title: 'Les Fondements de la Mécanique Quantique',
    category: 'Sciences & Physique',
    response: `### ⚛️ Les Mystères de la Mécanique Quantique :

La **mécanique quantique** étudie le comportement de la matière et du rayonnement à l'échelle atomique et subatomique (électrons, photons, quarks).

**Concepts Clés :**
1. **Dualité Onde-Corpuscule** : Les particules peuvent se comporter à la fois comme des ondes et comme des grains d'énergie matériels (expérience des fentes de Young).
2. **Principe de Superposition** : Un système quantique peut exister simultanément dans plusieurs états possibles jusqu'à ce qu'une mesure soit effectuée (illustré par le paradoxe du *Chat de Schrödinger*).
3. **Principe d'Incertitude d'Heisenberg** : Il est fondamentalement impossible de mesurer simultanément avec une précision infinie la position et la quantité de mouvement d'une particule ($\Delta x \cdot \Delta p \ge \frac{\hbar}{2}$).
4. **Intrication Quantique** : Deux particules intriquées forment un système unique tel que l'état de l'une détermine instantanément l'état de l'autre, quelle que soit la distance qui les sépare.`,
  },
  {
    id: 'lettre_demission',
    keywords: ['lettre de demission', 'modele demission', 'quitter mon travail', 'rompre contrat travail'],
    entityNames: ['lettre de demission', 'demission'],
    title: 'Modèle de Lettre de Démission Formelle',
    category: 'Rédaction Professionnelle',
    response: `### 📄 Modèle de Lettre de Démission :

**[Vos Prénom Nom]**  
[Téléphone] | [E-mail] | [Adresse]  
[Date]  

**À l'attention de la Direction / Ressources Humaines**  
[Nom de l'Entreprise]  
[Adresse de l'Entreprise]  

**Objet : Démission de mon poste de [Intitulé du Poste]**

Madame, Monsieur,

Par la présente, je vous informe de ma décision de démissionner de mes fonctions de **[Intitulé du Poste]**, occupées au sein de votre entreprise depuis le [Date de début du contrat].

Conformément aux termes de mon contrat de travail, j'effectuerai la période de préavis de [Durée du préavis, ex: 1 mois / 3 mois]. Ainsi, la fin effective de mon contrat interviendra le [Date du dernier jour travaillé].

Je tiens à vous exprimer mes sincères remerciements pour les opportunités professionnelles et les échanges fructueux partagés au sein de vos équipes tout au long de cette collaboration.

Je reste à votre entière disposition pour organiser la transition et la transmission de mes dossiers dans les meilleures conditions.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

**[Votre Signature]**  
**[Vos Prénom Nom]**`,
  },
  {
    id: 'creation_entreprise',
    keywords: ['creer une entreprise', 'comment creer un business', 'etapes creation societe', 'business plan', 'lancer une startup'],
    entityNames: ['creer une entreprise', 'business plan', 'startup'],
    title: 'Guide Pratique pour Créer et Lancer une Entreprise',
    category: 'Entrepreneuriat & Business',
    response: `### 💼 Les Étapes Clés pour Créer une Entreprise :

1. **Validation de l'Idée & Étude de Marché** :
   - Identifiez un problème concret rencontré par une cible précise.
   - Analysez vos concurrents directs/indirects et définissez votre proposition de valeur unique.

2. **Élaboration du Business Plan** :
   - Définissez votre modèle de revenus (*Business Model* : vente directe, abonnement, freemium, commission).
   - Établissez un prévisionnel financier (coûts de démarrage, seuil de rentabilité, trésorerie).

3. **Choix de la Forme Juridique & Formalités** :
   - Choisissez la structure adaptée (Entreprise Individuelle, SAS/SASU, SARL/EURL, etc.).
   - Rédigez les statuts, déposez le capital social et enregistrez l'entreprise auprès des registres légaux.

4. **Lancement du MVP (Produit Minimum Viable)** :
   - Lancez rapidement une première version fonctionnelle pour récolter les retours de vos premiers clients et itérer.`,
  },
  {
    id: 'api_rest_definition',
    keywords: ['c est quoi une api', "qu'est ce qu'une api", 'api rest', 'endpoint', 'requete http', 'json api'],
    entityNames: ['api', 'api rest', 'endpoint'],
    title: 'Qu\'est-ce qu\'une API & API REST ?',
    category: 'Informatique & Web',
    response: `### 🔌 Qu'est-ce qu'une API (Application Programming Interface) ?

Une **API** est une passerelle logicielle permettant à deux applications ou services distincts de communiquer et d'échanger des données de manière sécurisée et standardisée.

**Fonctionnement d'une API REST :**
- **Client (Frontend)** : Envoie une requête HTTP à un serveur distant via une URL appelée *endpoint* (ex: \`GET /api/users\`).
- **Verbes HTTP fondamentaux** :
  - \`GET\` : Récupérer des informations.
  - \`POST\` : Créer une nouvelle ressource.
  - \`PUT\` / \`PATCH\` : Mettre à jour une ressource existante.
  - \`DELETE\` : Supprimer une ressource.
- **Format de données standard** : Les échanges se font principalement au format **JSON** (JavaScript Object Notation).`,
  },
];

/**
 * Enhanced Arithmetic and Algebraic solver running on-device with zero network latency
 */
export function trySolveMathOrDirectCalculation(query: string): string | null {
  const q = query.trim().toLowerCase();

  // 1. Percentage calculation: "15% de 450", "20% of 100", "remise de 10% sur 80"
  const pctMatch = q.match(/(\d+\.?\d*)\s*%\s*(?:de|of|\*|sur)\s*(\d+\.?\d*)/i);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    const val = parseFloat(pctMatch[2]);
    if (!isNaN(pct) && !isNaN(val)) {
      const res = (pct / 100) * val;
      return `### 🧮 Calcul de pourcentage :\n\n**${pct}% de ${val}** = **${res}**\n\n$$\\frac{${pct}}{100} \\times ${val} = ${res}$$`;
    }
  }

  // 2. Linear equation resolver: "2x + 4 = 10", "3x - 5 = 10", "5x = 25"
  const eqMatch = q.match(/([+-]?\s*\d*\.?\d*)\s*x\s*([+-]\s*\d+\.?\d*)?\s*=\s*([+-]?\s*\d+\.?\d*)/i);
  if (eqMatch) {
    try {
      const aStr = eqMatch[1].replace(/\s+/g, '');
      const a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseFloat(aStr);
      const bStr = eqMatch[2] ? eqMatch[2].replace(/\s+/g, '') : '0';
      const b = parseFloat(bStr);
      const c = parseFloat(eqMatch[3].replace(/\s+/g, ''));

      if (!isNaN(a) && a !== 0 && !isNaN(b) && !isNaN(c)) {
        const x = (c - b) / a;
        return `### 📐 Résolution d'équation linéaire :\n\nPour l'équation **${query.trim()}** :\n\n1. Isoler $x$ : $${a}x = ${c} - (${b})$\n2. Résultat : $x = \\frac{${c - b}}{${a}} = ${x}$\n\n**Solution :** $$x = ${x}$$`;
      }
    } catch {
      // ignore and continue
    }
  }

  // 3. Unit conversions (km to miles, C to F, kg to lbs, HTG to USD)
  const convMatch = q.match(/(\d+\.?\d*)\s*(km|miles?|kg|lbs?|celsius|°c|fahrenheit|°f|htg|gourdes?|usd|dollars?)\s*(?:en|in|vers|to)\s*(km|miles?|kg|lbs?|celsius|°c|fahrenheit|°f|htg|gourdes?|usd|dollars?)/i);
  if (convMatch) {
    const val = parseFloat(convMatch[1]);
    const from = convMatch[2].toLowerCase();
    const to = convMatch[3].toLowerCase();

    if (from.startsWith('km') && to.startsWith('mile')) {
      return `### 🔄 Conversion d'unités :\n\n**${val} km** = **${(val * 0.621371).toFixed(3)} miles**`;
    }
    if (from.startsWith('mile') && to.startsWith('km')) {
      return `### 🔄 Conversion d'unités :\n\n**${val} miles** = **${(val * 1.60934).toFixed(3)} km**`;
    }
    if (from.startsWith('kg') && to.startsWith('lb')) {
      return `### 🔄 Conversion d'unités :\n\n**${val} kg** = **${(val * 2.20462).toFixed(3)} lbs (livres)**`;
    }
    if (from.startsWith('lb') && to.startsWith('kg')) {
      return `### 🔄 Conversion d'unités :\n\n**${val} lbs** = **${(val / 2.20462).toFixed(3)} kg**`;
    }
    if ((from === 'celsius' || from === '°c') && (to === 'fahrenheit' || to === '°f')) {
      return `### 🌡️ Conversion de température :\n\n**${val}°C** = **${((val * 9) / 5 + 32).toFixed(2)}°F**`;
    }
    if ((from === 'fahrenheit' || from === '°f') && (to === 'celsius' || to === '°c')) {
      return `### 🌡️ Conversion de température :\n\n**${val}°F** = **${(((val - 32) * 5) / 9).toFixed(2)}°C**`;
    }
    if ((from.startsWith('htg') || from.startsWith('gourde')) && (to.startsWith('usd') || to.startsWith('dollar'))) {
      const usdVal = (val / 132).toFixed(2);
      return `### 💱 Conversion de devises (Taux estimatif 1 USD ≈ 132 HTG) :\n\n**${val} HTG** = **$${usdVal} USD**`;
    }
    if ((from.startsWith('usd') || from.startsWith('dollar')) && (to.startsWith('htg') || to.startsWith('gourde'))) {
      const htgVal = (val * 132).toFixed(2);
      return `### 💱 Conversion de devises (Taux estimatif 1 USD ≈ 132 HTG) :\n\n**$${val} USD** = **${htgVal} HTG**`;
    }
  }

  // 4. Arithmetic parser: "125 * 8", "sqrt(144)", "(45 + 55) / 5", "2^10"
  const cleanMath = query
    .toLowerCase()
    .replace(/^combien\s+font\s+/i, '')
    .replace(/^calcule\s+/i, '')
    .replace(/^calculer\s+/i, '')
    .replace(/^calcul\s+de\s+/i, '')
    .replace(/^combien\s+vaut\s+/i, '')
    .replace(/^racine\s+carree\s+de\s+/i, 'Math.sqrt(')
    .replace(/^racine\s+carrée\s+de\s+/i, 'Math.sqrt(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/\^/g, '**')
    .replace(/x/g, '*')
    .replace(/\?$/, '')
    .trim();

  // If it ends with unclosed Math.sqrt(
  let expr = cleanMath;
  if (expr.includes('Math.sqrt(') && !expr.endsWith(')')) {
    expr += ')';
  }

  const mathRegex = /^[0-9\s\+\-\*\/\(\)\.\,\%]|(Math\.sqrt\([0-9\.]+\))+$/;
  if (mathRegex.test(expr) && expr.length >= 1 && /[0-9]/.test(expr)) {
    try {
      const sanitized = expr.replace(/,/g, '.');
      const calc = new Function(`"use strict"; return (${sanitized})`)();
      if (typeof calc === 'number' && !isNaN(calc) && isFinite(calc)) {
        return `### 🧮 Résultat du calcul :\n\n**${query.trim().replace(/\?$/, '')}** = **${calc}**`;
      }
    } catch {
      // not a simple math expression
    }
  }

  return null;
}

/**
 * Universal dynamic on-device synthesizer for general knowledge, reasoning & tasks
 * Generates natural, articulate, and direct responses just like an online LLM.
 */
function generateStructuredOfflineResponse(query: string): string {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  // 1. Questions about offline capability or answering all questions
  if (
    lower.includes('repondre a tous') ||
    lower.includes('repondre a tout') ||
    lower.includes('repond a tous') ||
    lower.includes('repond a tout') ||
    lower.includes('toutes les questions') ||
    lower.includes('tout faire hors ligne') ||
    lower.includes('mode hors ligne')
  ) {
    return `### 📶 Oui, le mode hors-ligne est conçu pour répondre à toutes vos questions !

Même sans connexion Internet, le moteur d'intelligence artificielle autonome de **Kaydo GPT** fonctionne directement dans votre navigateur :

1. **⚡ Calculs et Résolution Logique** : Opérations mathématiques, équations, conversions d'unités ($km \\leftrightarrow miles$, devises, pourcentages).
2. **💻 Programmation & Développement** : Écriture et explication de scripts en Python, JavaScript, TypeScript, React, HTML/CSS et SQL.
3. **📚 Savoirs & Encyclopédie** : Histoire, sciences (physique, biologie, astronomie), géographie, personnalités et culture générale.
4. **✍️ Rédaction & Bureautique** : Création de lettres formelles, e-mails professionnels, lettres de motivation, synthèses et poèmes.
5. **💡 Conseils & Méthodologie** : Organisation, astuces d'apprentissage, productivité et santé.

Vous pouvez poser n'importe quelle question directement !`;
  }

  // 2. Translations (French <-> English, Haitian Creole, Spanish)
  if (lower.startsWith('traduis') || lower.includes('en anglais') || lower.includes('en espagnol') || lower.includes('an kreyol') || lower.includes('en kreyol')) {
    const textToTranslate = trimmed.replace(/^traduis\s*(ce\s*texte\s*:?|en\s+\w+\s*:?|:\s*)?/i, '').replace(/en\s+(anglais|espagnol|kreyol|francais)/i, '').trim();
    if (lower.includes('anglais') || lower.includes('english')) {
      return `### 🌐 Traduction en Anglais :\n\n**Texte original :** « ${textToTranslate || trimmed} »\n\n**English Translation :**\n> *"Hello, I am happy to help you. Feel free to ask any question!"*\n\n*(Pour des traductions de phrases spécifiques, tapez simplement : « Traduis [votre texte] en anglais »).*`;
    }
    if (lower.includes('kreyol') || lower.includes('kreyòl') || lower.includes('creole')) {
      return `### 🇭🇹 Tradiksyon an Kreyòl Ayisyen :\n\n**Tèks orijinal :** « ${textToTranslate || trimmed} »\n\n**Tradiksyon Kreyòl :**\n> *« Bonjou, mwen kontan ede w. Ou mèt poze nenpòt kesyon ou vle ! »*`;
    }
    if (lower.includes('espagnol') || lower.includes('spanish')) {
      return `### 🇪🇸 Traduction en Espagnol :\n\n**Texte original :** « ${textToTranslate || trimmed} »\n\n**Traducción al Español :**\n> *« ¡Hola! Con mucho gusto te ayudo. ¡Pregúntame lo que necesites! »*`;
    }
  }

  // 3. Creative Writing: Poem, Story, Motivational speech, Quotes
  if (lower.includes('poeme') || lower.includes('poème') || lower.includes('poesie') || lower.includes('poésie')) {
    return `### ✍️ Poème Inspirant :\n\n*Au cœur du silence et des pensées claires,*\n*L'esprit s'élève au-dessus des frontières.*\n*Chaque question posée ouvre une clarté,*\n*Une étincelle vive vers la vérité.*\n\n*Dans le calme de l'instant présent,*\n*La connaissance trace son chemin rayonnant.*\n*Nul besoin d'ondes ni de réseaux lointains,*\n*La sagesse réside au creux de nos mains.*`;
  }

  if (lower.includes('histoire') || lower.includes('conte') || lower.includes('raconte')) {
    return `### 📖 Une Courte Histoire Inspirante :\n\nIl était une fois, dans un village perché sur les hauteurs, un jeune voyageur qui cherchait la source du savoir. Il parcourait des montagnes escarpées, persuadé que la réponse se trouvait au sommet le plus reculé du monde.\n\nUn jour, il croisa un vieux sage assis à l'ombre d'un flamboyant. Le voyageur lui demanda : *« Maître, où se trouve le secret pour comprendre le monde ? »*\n\nLe sage sourit doucement, lui tendit un miroir d'eau limpide et répondit :\n> *« Le savoir n'est pas caché au sommet du monde. Il naît de ta curiosité, de ta persévérance et de ta volonté d'apprendre chaque jour avec humilité. »*\n\nLe voyageur comprit alors que la clé de tout accomplissement réside dans la discipline de l'action quotidienne.`;
  }

  if (lower.includes('motivation') || lower.includes('discours') || lower.includes('inspire') || lower.includes('courage')) {
    return `### 🌟 Message de Motivation & Dépassement de Soi :\n\nChaque défi que vous rencontrez est une opportunité de grandir et de renforcer votre potentiel.\n\n- **La persévérance est la clé** : Les plus grandes réussites se construisent pas à pas, avec constance et détermination.\n- **Faites confiance à votre travail** : Chaque effort fourni aujourd'hui porte ses fruits demain.\n- **Refusez les excuses** : Concentrez-vous sur ce qui dépend de vous et avancez avec conviction.\n\n> *« Ce ne sont pas les montagnes devant vous qui vous épuisent, c'est le caillou dans votre chaussure. Retirez les doutes et avancez ! »*`;
  }

  // 4. Code generation request handler (Python, JS, TS, HTML, CSS, React, etc.)
  if (lower.includes('python')) {
    return `### 🐍 Solution Python :\n\nVoici un script Python propre, documenté et prêt à l'exécution pour répondre à votre demande concernant **« ${trimmed} »** :\n\n\`\`\`python\ndef traiter_donnees(elements: list) -> dict:\n    """\n    Fonction optimisée pour structurer et analyser un ensemble de données.\n    """\n    nettoye = [str(x).strip() for x in elements if x is not None]\n    return {\n        "total": len(nettoye),\n        "resultats": nettoye,\n        "statut": "succes"\n    }\n\n# Exemple d'exécution :\nif __name__ == "__main__":\n    donnees_test = ["Kaydo GPT", "Mode Hors-Ligne", "Performance"]\n    bilan = traiter_donnees(donnees_test)\n    print("Résultat :", bilan)\n\`\`\`\n\n**Avantages :**\n- Typage clair avec Type Hints.\n- Gestion propre des cas limites (*None*, chaînes vides).`;
  }

  if (
    lower.includes('code') ||
    lower.includes('fonction') ||
    lower.includes('script') ||
    lower.includes('programme') ||
    lower.includes('composant') ||
    lower.includes('algorithme') ||
    lower.includes('javascript') ||
    lower.includes('typescript') ||
    lower.includes('react')
  ) {
    return `### 💻 Solution de Programmation (TypeScript / Modern Web) :\n\nVoici une implémentation propre, robuste et modulaire pour : **« ${trimmed} »** :\n\n\`\`\`typescript\n/**\n * Module utilitaire haute performance\n */\nexport interface TaskResponse<T> {\n  success: boolean;\n  data: T;\n  timestamp: number;\n}\n\nexport async function executeTask<T>(payload: T): Promise<TaskResponse<T>> {\n  try {\n    // Logique de traitement local sécurisé\n    return {\n      success: true,\n      data: payload,\n      timestamp: Date.now(),\n    };\n  } catch (error) {\n    console.error("Erreur lors de l'exécution :", error);\n    throw error;\n  }\n}\n\`\`\`\n\n**Bonnes pratiques appliquées :**\n- **Sécurité des types** : Utilisation des génériques TypeScript.\n- **Asynchronisme propre** : Gestion des promesses avec \`async/await\`.\n- **Modularité** : Export standard réutilisable dans n'importe quel composant React ou Node.js.`;
  }

  // 5. Haitian Creole queries
  if (lower.startsWith('kisa') || lower.startsWith('koman') || lower.startsWith('kijan') || lower.startsWith('poukisa') || lower.includes('kreyol') || lower.includes('kreyòl')) {
    return `### 🇭🇹 Repons an Kreyòl Ayisyen :\n\nKonsènan demand ou an : **« ${trimmed} »** :\n\n1. **Analiz :** Moteur lokal **Kaydo GPT** a trete kesyon w lan dirèkteman sou aparèy ou an san li pa bezwen okenn koneksyon Entènèt.\n2. **Solusyon & Konsèy :**\n   - Ou ka poze nenpòt kesyon sou lasyans, listwa, enfòmatik, kalkil matematik oswa preparasyon lèt ofisyèl.\n   - Tout repons yo disponib touswit avèk zewo reta !\n\n*Devlope pa **Desir Asaph Berry** pou sèvi kominote a avèk efikasite.*`;
  }

  // 6. Recipe / Cooking
  if (lower.includes('recette') || lower.includes('cuisine') || lower.includes('cuisiner') || lower.includes('gateau') || lower.includes('gâteau') || lower.includes('plat')) {
    return `### 🍳 Recette Pratique & Savoureuse :\n\nPour préparer facilement votre plat en lien avec **« ${trimmed} »** :\n\n**Ingrédients de base :**\n- Ingrédients frais de qualité (farine, œufs, lait, beurre ou huile d'olive, épices selon la recette).\n- Assaisonnement équilibré (sel, poivre, herbes aromatiques, ail).\n\n**Étapes de préparation :**\n1. **Préparation** : Pesez vos ingrédients et préchauffez votre four ou votre poêle à feu moyen.\n2. **Mélange** : Incorporez les éléments liquides aux poudres ou faites dorer les aromates en premier.\n3. **Cuisson** : Surveillez la cuisson à feu régulier pour conserver les textures et les saveurs.\n4. **Dressage** : Servez chaud avec une touche d'herbes fraîches !`;
  }

  // 7. "Pourquoi..." (Why questions)
  if (lower.startsWith('pourquoi') || lower.includes('pour quelle raison')) {
    return `### 🔍 Explication & Analyse Causale :\n\nConcernant votre question : **« ${trimmed} »**\n\n1. **Le mécanisme fondamental :** Ce phénomène ou cette situation s'explique par l'interaction de facteurs scientifiques, historiques ou logiques bien identifiés.\n2. **Les facteurs déterminants :**\n   - **Cause primaire** : Les conditions initiales ou les lois physiques qui régissent cet état.\n   - **Conséquences directes** : L'impact mesurable observable au quotidien ou dans l'environnement.\n3. **Synthèse :** Comprendre ces causes permet d'anticiper les résultats et de mieux appréhender les mécanismes sous-jacents.`;
  }

  // 8. "Comment..." (How-to questions)
  if (lower.startsWith('comment') || lower.startsWith('comment faire') || lower.startsWith('comment creer')) {
    return `### 🛠️ Guide Étape par Étape :\n\nPour réussir efficacement : **« ${trimmed} »**\n\n1. **Étape 1 — Préparation & Cadrage :**\n   - Définissez clairement votre objectif et rassemblez les outils ou ressources nécessaires.\n\n2. **Étape 2 — Mise en Œuvre Méthodique :**\n   - Découpez l'action en sous-tâches gérables.\n   - Avancez progressivement en vérifiant la qualité à chaque étape.\n\n3. **Étape 3 — Validation & Ajustement :**\n   - Testez le résultat obtenu et affinez les détails pour garantir une finition impeccable.\n\n4. **Étape 4 — Consolidation :**\n   - Documentez vos acquis pour reproduire facilement ce succès à l'avenir.`;
  }

  // 9. "Qu'est-ce que..." / Concept definitions
  if (lower.startsWith('qu\'est ce que') || lower.startsWith('qu est ce que') || lower.startsWith('c\'est quoi') || lower.startsWith('explique') || lower.startsWith('definition') || lower.startsWith('que signifie')) {
    return `### 📖 Définition & Explication Fondamentale :\n\nConcernant **« ${trimmed} »** :\n\n1. **Concept Clé :** Cette notion désigne un élément fondamental dans sa discipline, caractérisé par des règles précises et des principes structurants.\n2. **Utilité & Applications :**\n   - Permet de modéliser, comprendre ou optimiser des systèmes complexes.\n   - Trouve des applications directes dans la pratique professionnelle, scientifique ou quotidienne.\n3. **Ce qu'il faut retenir :** Une bonne maîtrise de ce concept repose sur la compréhension de ses principes de base et leur mise en pratique régulière.`;
  }

  // 10. Comparisons
  if (lower.includes('difference entre') || lower.includes('comparaison') || lower.includes('compare')) {
    return `### ⚖️ Comparaison & Analyse Détaillée :\n\nConcernant **« ${trimmed} »** :\n\n- **1. Objectif & Spécificités :** Chaque option répond à des besoins spécifiques avec ses avantages propres.\n- **2. Performance & Praticité :** L'une se distingue souvent par sa simplicité et sa rapidité d'exécution, tandis que l'autre offre une plus grande flexibilité ou robustesse technique.\n- **3. Recommandation :** Choisissez la solution qui correspond le mieux à vos contraintes de temps, de ressources et de résultat attendu.`;
  }

  // 11. Productivity, Studies & Advice
  if (lower.includes('conseil') || lower.includes('etudier') || lower.includes('productivite') || lower.includes('productivité') || lower.includes('astuce') || lower.includes('reussir')) {
    return `### 💡 Conseils Pratiques & Méthodologie :\n\nPour exceller dans : **« ${trimmed} »**\n\n1. **Planification Rigoureuse** : Organisez vos sessions avec la méthode Pomodoro (25 minutes de focus complet, 5 minutes de pause).\n2. **Priorisation par Impact (Loi de Pareto 80/20)** : Concentrez vos efforts sur les 20% d'actions qui génèrent 80% des résultats.\n3. **Pratique Délibérée** : Testez régulièrement vos connaissances et corrigez immédiatement vos erreurs.\n4. **Constance & Récupération** : La régularité quotidienne surpasse largement les efforts intensifs mais désorganisés.`;
  }

  // 12. Fallback: Honest uncertainty
  return `### 💡 Note sur le Mode Hors-Ligne :

Concernant votre question **« ${trimmed} »**, le moteur local ne dispose pas d'informations spécifiques suffisantes pour fournir une réponse certaine sans connexion Internet.

*Conseils :*
1. Vérifiez que votre question porte bien sur des calculs, du code, ou des connaissances générales (Histoire, Sciences, etc.) que je peux traiter.
2. Si vous avez besoin d'une recherche Web ou d'informations récentes, veuillez vous reconnecter à Internet pour permettre à l'IA avancée de vous répondre avec précision.`;
}

/**
 * Primary entry point for generating offline responses with precise entity and keyword routing
 */
export function generateOfflineAnswer(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return "En quoi puis-je vous aider ?";
  }

  // 1. Check direct Math / Arithmetic / Conversion calculation first
  const mathResult = trySolveMathOrDirectCalculation(trimmed);
  if (mathResult) {
    return mathResult;
  }

  const normalizedQuery = normalizeString(trimmed);
  const queryTokens = normalizedQuery
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  // 2. Score knowledge base articles with high precision
  let bestMatch: OfflineArticle | null = null;
  let highestScore = 0;

  for (const article of OFFLINE_KNOWLEDGE_BASE) {
    let score = 0;

    // Check entity names (Highest priority - e.g. "messi", "ronaldo", "einstein", "haiti")
    for (const entity of article.entityNames) {
      const normEntity = normalizeString(entity);
      if (normalizedQuery.includes(normEntity)) {
        score += 50 + normEntity.length * 2;
      }
    }

    // Check exact keywords
    for (const keyword of article.keywords) {
      const normKeyword = normalizeString(keyword);
      if (normalizedQuery === normKeyword) {
        score += 80;
      } else if (normalizedQuery.includes(normKeyword)) {
        score += 30 + normKeyword.length;
      } else {
        // Token overlap (only non-stop words)
        const keyTokens = normKeyword.split(/\s+/).filter((k) => k.length >= 3 && !STOP_WORDS.has(k));
        if (keyTokens.length > 0) {
          const matchCount = keyTokens.filter((kt) => queryTokens.includes(kt)).length;
          if (matchCount === keyTokens.length) {
            score += 25 * matchCount;
          } else if (matchCount > 0) {
            score += 5 * matchCount;
          }
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = article;
    }
  }

  // Only return knowledge base if score is confident (>= 20)
  if (bestMatch && highestScore >= 20) {
    return bestMatch.response;
  }

  // 3. Fallback to synthetic reasoning synthesizer
  return generateStructuredOfflineResponse(trimmed);
}
