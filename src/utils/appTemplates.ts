import { AppBuilderTemplate, ProjectFile } from '../types';

export const APP_TEMPLATES: AppBuilderTemplate[] = [
  {
    id: 'saas_dashboard',
    name: 'SaaS Analytics & Billing Dashboard',
    category: 'SaaS',
    description: 'Tableau de bord SaaS complet avec métriques MRR, graphiques de ventes, gestion des abonnements et thème sombre/clair.',
    icon: 'LayoutDashboard',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Charts'],
    recommendedPrompt: "Crée une application SaaS Analytics avec tableau de bord des ventes, gestion des clients, graphiques de revenus interactifs et gestion de facturation.",
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaS Analytics Pro</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="root"></div>
</body>
</html>`
      },
      {
        path: 'src/App.tsx',
        content: `import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [revenue, setRevenue] = useState(14850);
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Acme Global Corp', plan: 'Enterprise', amount: '$499/mo', status: 'Actif', date: '2026-08-12' },
    { id: 2, name: 'Nova Tech Studio', plan: 'Pro Team', amount: '$149/mo', status: 'Actif', date: '2026-08-15' },
    { id: 3, name: 'Horizon Cloud Services', plan: 'Starter', amount: '$49/mo', status: 'En attente', date: '2026-08-20' },
    { id: 4, name: 'Zenith Design Agency', plan: 'Pro Team', amount: '$149/mo', status: 'Actif', date: '2026-08-22' },
  ]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-lg">
              S
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">SaaS Core</h1>
              <p className="text-xs text-emerald-400 font-medium">Berry Pro Cloud</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Vue Globale', icon: '📊' },
              { id: 'customers', label: 'Clients & Abonnés', icon: '👥' },
              { id: 'billing', label: 'Facturation & Plans', icon: '💳' },
              { id: 'settings', label: 'Paramètres API', icon: '⚙️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all \${
                  activeTab === tab.id
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }\`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs space-y-1">
          <div className="flex justify-between font-semibold">
            <span className="text-slate-400">Statut Système</span>
            <span className="text-emerald-400">100% Opérationnel</span>
          </div>
          <p className="text-slate-500">API Latence : 28ms</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white">Tableau de bord Métriques</h2>
            <p className="text-sm text-slate-400">Données en temps réel synchronisées</p>
          </div>
          <button 
            onClick={() => setRevenue(prev => prev + 499)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            + Simuler Vente Enterprise
          </button>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Revenu Mensuel (MRR)</p>
            <p className="text-2xl font-black text-white mt-1">\${revenue.toLocaleString()} <span className="text-xs text-emerald-400 font-bold">+18.4%</span></p>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Clients Actifs</p>
            <p className="text-2xl font-black text-white mt-1">{customers.length} <span className="text-xs text-teal-400 font-bold">+4 ce mois</span></p>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Taux de Rétention</p>
            <p className="text-2xl font-black text-white mt-1">98.2% <span className="text-xs text-emerald-400 font-bold">Stable</span></p>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Transactions</p>
            <p className="text-2xl font-black text-white mt-1">1,420 <span className="text-xs text-blue-400 font-bold">Validées</span></p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
          <h3 className="font-bold text-base text-white">Derniers Abonnements Souscrits</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Formule</th>
                  <th className="pb-3 font-semibold">Montant</th>
                  <th className="pb-3 font-semibold">Statut</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-medium text-white">{c.name}</td>
                    <td className="py-3.5 text-slate-300">{c.plan}</td>
                    <td className="py-3.5 font-semibold text-emerald-400">{c.amount}</td>
                    <td className="py-3.5">
                      <span className={\`px-2.5 py-0.5 rounded-full text-xs font-semibold \${
                        c.status === 'Actif' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }\`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-xs">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}`
      },
      {
        path: 'package.json',
        content: `{
  "name": "saas-analytics-pro",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^1.16.0"
  }
}`
      },
      {
        path: 'README.md',
        content: `# SaaS Analytics Pro

Application générée par **Berry GPT App Builder Pro**.

## Fonctionnalités
- Tableau de bord avec suivi en temps réel du MRR et de la rétention.
- Liste interactive des clients et abonnements.
- Simulation dynamique de transactions.
- Thème sombre ultra-moderne taillé pour les SaaS.

## Commandes
- \`npm run dev\` : Lancer le serveur local
- \`npm run build\` : Compiler pour la production
`
      }
    ]
  },
  {
    id: 'ecommerce_store',
    name: 'E-Commerce Store & Panier Interactif',
    category: 'E-commerce',
    description: 'Boutique en ligne moderne avec catalogue de produits, filtres par catégorie, panier dynamique et checkout intégré.',
    icon: 'ShoppingBag',
    tags: ['React', 'Panier', 'Checkout', 'E-commerce'],
    recommendedPrompt: "Crée une boutique e-commerce avec catalogue de produits, filtres de prix et de catégories, panier d'achat persistant et formulaire de commande.",
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Berry Store Pro</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style> body { font-family: 'Plus Jakarta Sans', sans-serif; } </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen">
  <div id="root"></div>
</body>
</html>`
      },
      {
        path: 'src/App.tsx',
        content: `import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Casque Audio Sans-Fil Pro X', category: 'Audio', price: 149.99, image: '🎧', rating: 4.8 },
  { id: 2, name: 'Montre Connectée Sport Horizon', category: 'Wearables', price: 199.50, image: '⌚', rating: 4.9 },
  { id: 3, name: 'Clavier Mécanique RGB Custom', category: 'Accessoires', price: 89.00, image: '⌨️', rating: 4.7 },
  { id: 4, name: 'Enceinte Bluetooth Waterproof 360', category: 'Audio', price: 59.90, image: '🔊', rating: 4.6 },
  { id: 5, name: 'Souris Ergonomique Sans-Fil Precision', category: 'Accessoires', price: 45.00, image: '🖱️', rating: 4.5 },
  { id: 6, name: 'Hub USB-C 10-en-1 Aluminium', category: 'Accessoires', price: 39.99, image: '🔌', rating: 4.8 },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredProducts = selectedCategory === 'Tous'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <h1 className="font-extrabold text-lg text-white">Berry Store</h1>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border border-zinc-700"
        >
          <span>🛒 Panier</span>
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600/30 via-teal-600/20 to-blue-600/20 border border-emerald-500/30">
          <span className="px-3 py-1 bg-emerald-500 text-zinc-950 rounded-full text-xs font-black uppercase">Nouveautés 2026</span>
          <h2 className="text-3xl font-black text-white mt-3">Technologie & Confort Premium</h2>
          <p className="text-zinc-300 text-sm mt-1">Découvrez notre sélection d'accessoires haute performance.</p>
        </div>

        {/* Categories Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['Tous', 'Audio', 'Wearables', 'Accessoires'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all \${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition-all">
              <div>
                <div className="h-36 bg-zinc-800/60 rounded-xl flex items-center justify-center text-6xl">
                  {product.image}
                </div>
                <div className="mt-4 flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">{product.category}</span>
                    <h3 className="font-bold text-base text-white mt-0.5">{product.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-400">★ {product.rating}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <span className="text-lg font-black text-white">\${product.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Modal / Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-zinc-900 h-full border-l border-zinc-800 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <h3 className="font-black text-lg text-white">Mon Panier ({cart.length})</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-white text-xl">✕</button>
              </div>

              <div className="divide-y divide-zinc-800 mt-4 max-h-[60vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-zinc-500 py-12">Votre panier est vide.</p>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.product.image}</span>
                        <div>
                          <p className="font-semibold text-sm text-white">{item.product.name}</p>
                          <p className="text-xs text-zinc-400">\${item.product.price} × {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-400 text-sm">\${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-emerald-400 font-black">\${totalAmount.toFixed(2)} USD</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => alert("Commande validée avec succès dans l'environnement Berry Store !")}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-black rounded-xl text-sm transition-all"
              >
                Passer à la caisse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`
      }
    ]
  },
  {
    id: 'tasks_crm',
    name: 'Gestion de Tâches & Projets (Kanban)',
    category: 'Tasks',
    description: 'Tableau Kanban interactif avec colonnes À faire, En cours, Terminé, priorité des tâches, filtres et ajout rapide.',
    icon: 'Kanban',
    tags: ['Kanban', 'Productivité', 'CRM', 'Tâches'],
    recommendedPrompt: "Crée un gestionnaire de projet Kanban complet avec drag/déplacement des cartes, étiquettes de priorité, dates d'échéance et compteurs.",
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Berry Kanban Flow</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen">
  <div id="root"></div>
</body>
</html>`
      },
      {
        path: 'src/App.tsx',
        content: `import React, { useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'Haute' | 'Moyenne' | 'Basse';
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Concevoir l’architecture API REST', status: 'todo', priority: 'Haute' },
    { id: '2', title: 'Intégrer le paiement sécurisé', status: 'in_progress', priority: 'Haute' },
    { id: '3', title: 'Configurer le déploiement Cloud', status: 'done', priority: 'Moyenne' },
    { id: '4', title: 'Tester les performances sur mobile', status: 'todo', priority: 'Basse' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [
      ...prev,
      { id: Date.now().toString(), title: newTaskTitle.trim(), status: 'todo', priority: 'Moyenne' }
    ]);
    setNewTaskTitle('');
  };

  const moveTask = (id: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-black text-white">Tableau de Tâches Agile</h1>
          <p className="text-xs text-gray-400">Gérez vos sprints et l'avancement de vos projets</p>
        </div>

        <form onSubmit={addTask} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Nouvelle tâche..."
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" className="px-4 py-2 bg-emerald-500 text-gray-950 font-bold rounded-xl text-sm hover:bg-emerald-400">
            + Ajouter
          </button>
        </form>
      </header>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: 'todo', label: 'À Faire', color: 'border-amber-500/40 text-amber-400' },
          { key: 'in_progress', label: 'En Cours', color: 'border-blue-500/40 text-blue-400' },
          { key: 'done', label: 'Terminé', color: 'border-emerald-500/40 text-emerald-400' },
        ].map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col">
              <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                <span className={\`font-bold text-sm \${col.color}\`}>{col.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 font-semibold">{colTasks.length}</span>
              </div>

              <div className="space-y-3 mt-4 flex-1">
                {colTasks.map(task => (
                  <div key={task.id} className="p-3.5 bg-gray-800/80 border border-gray-700/60 rounded-xl space-y-2">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-700 text-gray-300 font-bold">{task.priority}</span>
                      <div className="flex gap-1">
                        {col.key !== 'todo' && (
                          <button onClick={() => moveTask(task.id, 'todo')} className="text-xs p-1 hover:text-amber-400">◀</button>
                        )}
                        {col.key !== 'in_progress' && (
                          <button onClick={() => moveTask(task.id, 'in_progress')} className="text-xs p-1 hover:text-blue-400">●</button>
                        )}
                        {col.key !== 'done' && (
                          <button onClick={() => moveTask(task.id, 'done')} className="text-xs p-1 hover:text-emerald-400">▶</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`
      }
    ]
  },
  {
    id: 'ai_smart_app',
    name: 'Générateur de Contenu & Assistant IA',
    category: 'AI App',
    description: 'Interface de rédaction et analyse assistée par IA avec choix du ton, streaming simulé, copier-coller et historique des prompts.',
    icon: 'Sparkles',
    tags: ['IA', 'Assistant', 'Prompt', 'Productivité'],
    recommendedPrompt: "Crée une application de génération de contenu IA avec sélection du style rédactionnel, boîte d'outils, historique et export markdown.",
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Berry AI Writer Pro</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="root"></div>
</body>
</html>`
      },
      {
        path: 'src/App.tsx',
        content: `import React, { useState } from 'react';

export default function App() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professionnel');
  const [generatedResult, setGeneratedResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGeneratedResult('');
    
    setTimeout(() => {
      setGeneratedResult(\`### Plan d'action stratégique : \${topic}\\n\\n**Ton appliqué :** \${tone}\\n\\n1. **Synthèse exécutive :** Mise en œuvre immédiate des leviers de croissance.\\n2. **Architecture fonctionnelle :** Déploiement des solutions scalables.\\n3. **Prochaines étapes :** Suivi des indicateurs clés (KPIs) et optimisation continue.\\n\\n*Généré via Berry GPT Engine v2*\`);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <header className="text-center space-y-2">
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black uppercase">
          AI Intelligence Studio
        </span>
        <h1 className="text-3xl font-black text-white">Berry Content Studio</h1>
        <p className="text-sm text-slate-400">Rédigez des propositions et des plans d'action en quelques secondes</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Sujet ou Projet</label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Ex: Lancement d'un service de livraison express en Haïti"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Ton</label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            >
              <option>Professionnel</option>
              <option>Créatif & Dynamique</option>
              <option>Synthétique & Direct</option>
              <option>Académique</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition-all"
        >
          {isGenerating ? 'Analyse & Génération en cours...' : '⚡ Générer le document'}
        </button>
      </div>

      {generatedResult && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-3 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400">Document généré</span>
            <button
              onClick={() => navigator.clipboard.writeText(generatedResult)}
              className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
            >
              Copier le texte
            </button>
          </div>
          <pre className="text-sm font-sans text-slate-200 whitespace-pre-wrap leading-relaxed">
            {generatedResult}
          </pre>
        </div>
      )}
    </div>
  );
}`
      }
    ]
  }
];
