import React, { useState, useEffect, useRef } from 'react';
import {
  Code,
  Globe,
  Play,
  Terminal,
  FolderTree,
  FileCode,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  Save,
  CheckCircle,
  AlertTriangle,
  Send,
  HelpCircle,
  Copy,
  Check,
  Zap,
  Wrench,
  RotateCcw,
  Search,
  Eye,
  Shield,
  FileText,
  FilePlus,
  Trash,
  ArrowLeft,
  MessageSquare,
  Folder,
  X,
} from 'lucide-react';
import {
  AppBuilderProject,
  ProjectFile,
  ProjectVersion,
  UserProfile,
  ProjectDeployment,
} from '../types';
import { AppBuilderService } from '../utils/appBuilderService';
import { APP_TEMPLATES } from '../utils/appTemplates';

interface AppBuilderInterfaceProps {
  currentUser: UserProfile;
  initialProject?: AppBuilderProject | null;
  onOpenUpgradeModal: () => void;
  onClose?: () => void;
}

export const AppBuilderInterface: React.FC<AppBuilderInterfaceProps> = ({
  currentUser,
  initialProject,
  onOpenUpgradeModal,
  onClose,
}) => {
  // Sidebar Navigation & Project List
  const [projects, setProjects] = useState<AppBuilderProject[]>([]);
  const [currentProject, setCurrentProject] = useState<AppBuilderProject | null>(initialProject || null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'templates' | 'deployments' | 'history'>('editor');
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview' | 'code' | 'projects'>('chat');
  const [loadingProjects, setLoadingProjects] = useState(false);

  // File Manager & Code Editor State
  const [activeFilePath, setActiveFilePath] = useState<string>('src/App.tsx');
  const [editorContent, setEditorContent] = useState<string>('');
  const [searchFileQuery, setSearchFileQuery] = useState('');
  const [openTabs, setOpenTabs] = useState<string[]>(['src/App.tsx', 'index.html', 'package.json']);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);

  // Preview & Viewport State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(Date.now());
  const [previewHtml, setPreviewHtml] = useState<string>('');

  // AI Developer Agent State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiAgentMessages, setAiAgentMessages] = useState<{
    id: string;
    role: 'user' | 'agent' | 'system';
    text: string;
    timestamp: number;
    actionTaken?: string;
  }[]>([
    {
      id: 'init',
      role: 'agent',
      text: "Bonjour ! Je suis l'agent développeur Berry GPT. Décrivez ce que vous souhaitez ajouter, corriger ou modifier dans cette application.",
      timestamp: Date.now(),
    },
  ]);

  // Terminal & Logs
  const [terminalLogs, setTerminalLogs] = useState<{ type: 'info' | 'warn' | 'error' | 'success'; text: string; time: string }[]>([
    { type: 'info', text: 'Berry GPT Development Environment initialisé.', time: new Date().toLocaleTimeString() },
    { type: 'success', text: 'Moteur de rendu React & TypeScript prêt.', time: new Date().toLocaleTimeString() },
  ]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // Deployment State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<ProjectDeployment | null>(null);

  // New Project Modal State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState<any>('SaaS');

  // Load Projects on mount
  useEffect(() => {
    loadUserProjects();
  }, [currentUser.uid]);

  const loadUserProjects = async () => {
    setLoadingProjects(true);
    try {
      const list = await AppBuilderService.getUserProjects(currentUser.uid);
      setProjects(list);
      if (!currentProject && list.length > 0) {
        selectProject(list[0]);
      } else if (!currentProject && list.length === 0) {
        // Create initial default project from SaaS template
        createProjectFromTemplate(APP_TEMPLATES[0]);
      }
    } catch (e) {
      console.error('Error loading projects:', e);
    } finally {
      setLoadingProjects(false);
    }
  };

  const selectProject = (p: AppBuilderProject) => {
    setCurrentProject(p);
    const targetFile = p.files.find(f => f.path === p.activeFilePath) || p.files.find(f => f.path === 'src/App.tsx') || p.files[0];
    if (targetFile) {
      setActiveFilePath(targetFile.path);
      setEditorContent(targetFile.content);
    }
    setOpenTabs(p.files.slice(0, 4).map(f => f.path));
    compileAndBuildPreview(p);
  };

  // Compile project files into executable Preview iframe bundle
  const compileAndBuildPreview = (project: AppBuilderProject) => {
    const htmlFile = project.files.find(f => f.path === 'index.html' || f.path.endsWith('.html'));
    const appTsxFile = project.files.find(f => f.path === 'src/App.tsx' || f.path.endsWith('.tsx') || f.path.endsWith('.jsx'));
    const cssFile = project.files.find(f => f.path.endsWith('.css'));

    let finalHtml = htmlFile ? htmlFile.content : `<!DOCTYPE html><html><head><title>${project.name}</title></head><body><div id="root"></div></body></html>`;

    // Process React JSX / TSX through Babel standalone for live interactive execution inside sandboxed iframe
    let reactCode = appTsxFile ? appTsxFile.content : 'export default function App() { return <div>Application</div>; }';

    // Build self-contained runtime preview
    const previewDoc = `
      <!DOCTYPE html>
      <html lang="fr" class="dark">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.name} - Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
          ${cssFile ? cssFile.content : ''}
        </style>
      </head>
      <body class="bg-[#0f172a] text-slate-100 min-h-screen">
        <div id="root"></div>
        <script type="text/babel">
          const { useState, useEffect, useRef, useMemo } = React;

          // Polyfill Lucide basic icons if referenced
          const LucideIcon = ({ name, size = 16, className = "" }) => (
            <span className={className} style={{ display: 'inline-block', width: size, height: size }}>⚡</span>
          );

          try {
            ${transformCodeForStandalonePreview(reactCode)}
            
            const rootElement = document.getElementById('root');
            const root = ReactDOM.createRoot(rootElement);
            root.render(React.createElement(App));
            
            window.parent.postMessage({ type: 'preview_log', level: 'success', text: 'Application compilée et exécutée avec succès.' }, '*');
          } catch (err) {
            console.error('Preview Execution Error:', err);
            document.getElementById('root').innerHTML = '<div style="padding: 24px; color: #ef4444; font-family: monospace; background: #1e1e24; border: 1px solid #ef4444/40; border-radius: 12px; margin: 20px;"><h3>⚠️ Erreur de compilation</h3><p>' + err.message + '</p></div>';
            window.parent.postMessage({ type: 'preview_log', level: 'error', text: err.message }, '*');
          }
        </script>
      </body>
      </html>
    `;

    setPreviewHtml(previewDoc);
    setPreviewKey(Date.now());
  };

  // Helper to convert ES Module / TypeScript React exports into Babel browser compatible format
  const transformCodeForStandalonePreview = (code: string) => {
    let clean = code;
    // Strip external module imports (e.g., import ... from 'lucide-react')
    clean = clean.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
    // Replace export default function App with function App
    clean = clean.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1');
    clean = clean.replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, '');
    return clean;
  };

  // Listen to Preview Iframe runtime messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'preview_log') {
        setTerminalLogs(prev => [
          ...prev,
          {
            type: e.data.level === 'error' ? 'error' : 'success',
            text: `[Runtime Preview] ${e.data.text}`,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update File Content
  const handleEditorChange = (newContent: string) => {
    setEditorContent(newContent);
    if (!currentProject) return;

    const updatedFiles = currentProject.files.map(f =>
      f.path === activeFilePath ? { ...f, content: newContent } : f
    );

    const updatedProj = { ...currentProject, files: updatedFiles, updatedAt: Date.now() };
    setCurrentProject(updatedProj);
    AppBuilderService.saveProject(updatedProj);
  };

  // Switch Active File
  const handleSelectFile = (path: string) => {
    if (!currentProject) return;
    const file = currentProject.files.find(f => f.path === path);
    if (file) {
      setActiveFilePath(path);
      setEditorContent(file.content);
      if (!openTabs.includes(path)) {
        setOpenTabs(prev => [...prev, path]);
      }
    }
  };

  // Create New File
  const handleCreateNewFile = () => {
    if (!newFileName.trim() || !currentProject) return;
    const path = newFileName.trim().startsWith('/') ? newFileName.trim().slice(1) : newFileName.trim();

    if (currentProject.files.some(f => f.path === path)) {
      alert('Un fichier avec ce nom existe déjà.');
      return;
    }

    const newFile: ProjectFile = {
      path,
      content: path.endsWith('.tsx') || path.endsWith('.ts')
        ? `import React from 'react';\n\nexport const ${path.split('/').pop()?.split('.')[0] || 'Component'} = () => {\n  return <div>Nouveau composant</div>;\n};\n`
        : path.endsWith('.json')
        ? '{\n  \n}\n'
        : '\n',
    };

    const updatedFiles = [...currentProject.files, newFile];
    const updatedProj = { ...currentProject, files: updatedFiles, updatedAt: Date.now() };
    setCurrentProject(updatedProj);
    AppBuilderService.saveProject(updatedProj);
    setActiveFilePath(path);
    setEditorContent(newFile.content);
    setOpenTabs(prev => [...prev, path]);
    setNewFileName('');
    setShowNewFileDialog(false);

    setTerminalLogs(prev => [
      ...prev,
      { type: 'info', text: `Nouveau fichier créé : ${path}`, time: new Date().toLocaleTimeString() },
    ]);
  };

  // Delete File
  const handleDeleteFile = (path: string) => {
    if (!currentProject || currentProject.files.length <= 1) {
      alert('Impossible de supprimer le seul fichier du projet.');
      return;
    }
    if (!confirm(`Supprimer le fichier "${path}" ?`)) return;

    const updatedFiles = currentProject.files.filter(f => f.path !== path);
    const nextActive = updatedFiles[0]?.path || '';
    const updatedProj = { ...currentProject, files: updatedFiles, activeFilePath: nextActive, updatedAt: Date.now() };
    setCurrentProject(updatedProj);
    AppBuilderService.saveProject(updatedProj);
    setOpenTabs(prev => prev.filter(p => p !== path));
    if (activeFilePath === path && updatedFiles[0]) {
      setActiveFilePath(updatedFiles[0].path);
      setEditorContent(updatedFiles[0].content);
    }
  };

  // Create Project from Template
  const createProjectFromTemplate = (template: typeof APP_TEMPLATES[0]) => {
    const slug = `${template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newProj: AppBuilderProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: currentUser.uid,
      userEmail: currentUser.email || undefined,
      name: template.name,
      slug,
      description: template.description,
      techStack: 'react_typescript',
      category: template.category as any,
      status: 'READY',
      files: JSON.parse(JSON.stringify(template.files)),
      activeFilePath: 'src/App.tsx',
      versions: [
        {
          id: `v1_${Date.now()}`,
          versionNumber: 1,
          name: 'Version 1 - Template Initial',
          timestamp: Date.now(),
          files: JSON.parse(JSON.stringify(template.files)),
        },
      ],
      deployments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setCurrentProject(newProj);
    setProjects(prev => [newProj, ...prev]);
    AppBuilderService.saveProject(newProj);
    selectProject(newProj);
    setActiveTab('editor');
    setTerminalLogs(prev => [
      ...prev,
      { type: 'success', text: `Projet "${newProj.name}" créé avec succès à partir du template.`, time: new Date().toLocaleTimeString() },
    ]);
  };

  // Trigger AI Developer Modification or Generation
  const handleAiSubmit = async (customPrompt?: string, command?: string) => {
    const promptToSend = (customPrompt || aiPrompt).trim();
    if (!promptToSend || isAiGenerating || !currentProject) return;

    setIsAiGenerating(true);
    const userMsgId = `usr_${Date.now()}`;
    setAiAgentMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: promptToSend, timestamp: Date.now() },
    ]);
    setAiPrompt('');

    setTerminalLogs(prev => [
      ...prev,
      { type: 'info', text: `[Agent IA] Analyse de la demande : "${promptToSend.slice(0, 40)}..."`, time: new Date().toLocaleTimeString() },
    ]);

    try {
      const result = await AppBuilderService.generateOrModifyProject({
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        prompt: promptToSend,
        command: command || (promptToSend.startsWith('/') ? promptToSend.split(' ')[0] : undefined),
        existingProject: currentProject,
        targetFilePath: activeFilePath,
      });

      if (result.success && result.project) {
        // Automatically save snapshot version
        const snapshot = AppBuilderService.createVersionSnapshot(result.project, `IA: ${promptToSend.slice(0, 30)}`);
        setCurrentProject(snapshot);
        await AppBuilderService.saveProject(snapshot);
        setProjects(prev => prev.map(p => p.id === snapshot.id ? snapshot : p));

        // Refresh editor and preview
        const currentActive = snapshot.files.find(f => f.path === activeFilePath) || snapshot.files[0];
        if (currentActive) {
          setEditorContent(currentActive.content);
        }
        compileAndBuildPreview(snapshot);

        setAiAgentMessages(prev => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            role: 'agent',
            text: result.responseMessage || 'Modifications appliquées avec succès au projet !',
            timestamp: Date.now(),
          },
        ]);

        setTerminalLogs(prev => [
          ...prev,
          { type: 'success', text: `[Agent IA] Modifications compilées. Code source synchronisé.`, time: new Date().toLocaleTimeString() },
        ]);
      } else {
        setAiAgentMessages(prev => [
          ...prev,
          {
            id: `ai_err_${Date.now()}`,
            role: 'agent',
            text: result.error || result.responseMessage || "Une erreur est survenue lors de l'application des modifications.",
            timestamp: Date.now(),
          },
        ]);
        setTerminalLogs(prev => [
          ...prev,
          { type: 'error', text: `[Agent IA] Erreur : ${result.error || 'Échec de génération'}`, time: new Date().toLocaleTimeString() },
        ]);
      }
    } catch (e: any) {
      setTerminalLogs(prev => [
        ...prev,
        { type: 'error', text: `[Erreur Serveur IA] : ${e.message}`, time: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Real Deploy Project
  const handleDeploy = async () => {
    if (!currentProject || isDeploying) return;
    setIsDeploying(true);
    setTerminalLogs(prev => [
      ...prev,
      { type: 'info', text: `[Build] Lancement de la procédure de déploiement pour "${currentProject.name}"...`, time: new Date().toLocaleTimeString() },
      { type: 'info', text: `[Build] Validation des fichiers et configuration SSL HTTPS...`, time: new Date().toLocaleTimeString() },
    ]);

    try {
      const res = await AppBuilderService.deployProject({
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        projectId: currentProject.id,
        project: currentProject,
      });

      if (res.success && res.deployment) {
        setDeploymentResult(res.deployment);
        setTerminalLogs(prev => [
          ...prev,
          { type: 'success', text: `[Déploiement Réussi] Application en ligne sur : ${res.publicUrl}`, time: new Date().toLocaleTimeString() },
        ]);
        setActiveTab('deployments');
      } else {
        setTerminalLogs(prev => [
          ...prev,
          { type: 'error', text: `[Échec Déploiement] : ${res.error || 'Erreur inconnue'}`, time: new Date().toLocaleTimeString() },
        ]);
        alert(`Échec du déploiement : ${res.error}`);
      }
    } catch (e: any) {
      setTerminalLogs(prev => [
        ...prev,
        { type: 'error', text: `[Erreur Réseau Déploiement] : ${e.message}`, time: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setIsDeploying(false);
    }
  };

  // Export ZIP
  const handleExportZip = async () => {
    if (!currentProject) return;
    try {
      const blob = await AppBuilderService.exportProjectZip(currentProject);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.slug || 'berry_project'}_src.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setTerminalLogs(prev => [
        ...prev,
        { type: 'success', text: `Archive ZIP exportée avec succès (sans clés privées).`, time: new Date().toLocaleTimeString() },
      ]);
    } catch (e: any) {
      alert(`Erreur lors de l'export ZIP : ${e.message}`);
    }
  };

  // Create Custom Empty Project
  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const slug = `${newProjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newProj: AppBuilderProject = {
      id: `proj_${Date.now()}`,
      userId: currentUser.uid,
      userEmail: currentUser.email || undefined,
      name: newProjectName.trim(),
      slug,
      description: newProjectDescription.trim() || 'Application personnalisée',
      techStack: 'react_typescript',
      category: newProjectCategory,
      status: 'READY',
      files: [
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <title>${newProjectName.trim()}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="root"></div>
</body>
</html>`,
        },
        {
          path: 'src/App.tsx',
          content: `import React, { useState } from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
        ⚡
      </div>
      <h1 className="text-3xl font-black text-white">${newProjectName.trim()}</h1>
      <p className="text-sm text-slate-400 max-w-md">
        Votre projet est initialisé. Utilisez l'assistant Berry GPT à droite pour construire les fonctionnalités !
      </p>
    </div>
  );
}`,
        },
        {
          path: 'package.json',
          content: `{\n  "name": "${slug}",\n  "version": "1.0.0",\n  "private": true\n}`,
        },
      ],
      activeFilePath: 'src/App.tsx',
      versions: [],
      deployments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setCurrentProject(newProj);
    setProjects(prev => [newProj, ...prev]);
    AppBuilderService.saveProject(newProj);
    selectProject(newProj);
    setShowNewProjectModal(false);
    setNewProjectName('');
    setNewProjectDescription('');
    setActiveTab('editor');
  };

  return (
    <div className="flex h-full w-full bg-[#0d0d12] text-slate-200 overflow-hidden font-sans flex-col md:flex-row">
      {/* ========================================================================= */}
      {/* MOBILE INTERFACE (< md screens) */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-col h-full w-full overflow-hidden">
        {/* Mobile Top Header */}
        <header className="h-14 bg-[#121218] border-b border-[#1f1f2a] px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {onClose ? (
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                title="Quitter le Studio et retourner au chat Berry GPT"
              >
                <ArrowLeft size={14} className="text-amber-400" />
                <span>Retour Chat</span>
              </button>
            ) : null}

            <div className="min-w-0">
              <h3 className="font-extrabold text-xs text-white truncate">
                {currentProject?.name || 'Berry App Builder'}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">PRO</span>
                {currentProject?.latestDeploymentUrl && (
                  <span className="text-[9px] text-emerald-400 font-semibold truncate flex items-center gap-0.5">
                    ● En ligne
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="p-1.5 rounded-lg bg-[#1e1e2b] text-amber-400 border border-amber-500/30 text-xs"
              title="Nouvelle application"
            >
              <Plus size={15} />
            </button>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50"
            >
              <Globe size={12} />
              <span>{isDeploying ? '...' : 'Déployer'}</span>
            </button>
          </div>
        </header>

        {/* Mobile Main Body */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0d0d12]">
          {/* TAB: CHAT & AGENT DEVELOPER */}
          {mobileTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Guidance Info Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20 px-3.5 py-2 shrink-0 flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Sparkles size={13} />
                </div>
                <div className="text-[11px] leading-relaxed text-slate-300">
                  <span className="font-bold text-amber-400">Comment créer votre app :</span> Décrivez votre idée ci-dessous (ex : <em>« Crée une boutique avec catalogue et panier »</em>). L'agent génère le code, puis cliquez sur <strong>👁️ Aperçu</strong> pour tester !
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0f0f15]">
                {aiAgentMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-black font-medium ml-6'
                        : 'bg-[#1a1a24] text-slate-200 border border-[#262638] mr-4'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
                {isAiGenerating && (
                  <div className="p-3 rounded-2xl bg-[#1a1a24] text-xs text-amber-400 animate-pulse border border-amber-500/30">
                    ⚡ Berry GPT génère le code et applique les modifications au projet...
                  </div>
                )}
              </div>

              {/* Quick Action Suggestion Chips */}
              <div className="px-3 py-1.5 bg-[#101016] border-t border-[#1f1f2a] flex gap-1.5 overflow-x-auto shrink-0">
                {[
                  { label: '+ Connexion', prompt: 'Ajoute une page de connexion et d’authentification sécurisée avec formulaires.' },
                  { label: '🎨 Design Pro', prompt: 'Modernise le design avec de superbes dégradés, des cartes et une mise en page épurée.' },
                  { label: '📊 Graphiques', prompt: 'Ajoute des statistiques interactives et des graphiques de données.' },
                  { label: '🛒 Panier & Achat', prompt: 'Ajoute un système complet de panier d’achats et calcul de total.' },
                ].map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => handleAiSubmit(pill.prompt)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#1a1a26] hover:bg-[#252538] text-slate-300 border border-slate-800 shrink-0 transition-all"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Input Form & Preview Trigger */}
              <div className="p-2.5 bg-[#121218] border-t border-[#1f1f2a] space-y-2 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAiSubmit();
                  }}
                  className="relative"
                >
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Crée un tableau de bord moderne avec stats et gestion de commandes..."
                    rows={2}
                    className="w-full p-2.5 pr-10 bg-[#0a0a0f] border border-[#242436] focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!aiPrompt.trim() || isAiGenerating}
                    className="absolute right-2 bottom-2.5 p-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg transition-all"
                  >
                    <Send size={13} />
                  </button>
                </form>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (currentProject) {
                        compileAndBuildPreview(currentProject);
                      }
                      setMobileTab('preview');
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play size={13} />
                    <span>Compiler & Voir l'Aperçu</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PREVIEW */}
          {mobileTab === 'preview' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#0b0b10] overflow-hidden">
              <div className="h-10 bg-[#121218] border-b border-[#1f1f2a] px-3 flex items-center justify-between shrink-0 text-xs">
                <div className="flex items-center gap-1 text-slate-300 font-bold">
                  <Eye size={13} className="text-amber-400" />
                  <span>Aperçu en Direct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (currentProject) compileAndBuildPreview(currentProject);
                    }}
                    className="p-1 rounded bg-[#1e1e2b] text-slate-300 hover:text-white"
                    title="Recharger"
                  >
                    <RefreshCw size={13} />
                  </button>
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[11px]"
                  >
                    {isDeploying ? '...' : 'Déployer URL'}
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-black overflow-hidden relative">
                {previewHtml ? (
                  <iframe
                    key={previewKey}
                    srcDoc={previewHtml}
                    title="Berry App Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    className="w-full h-full border-none bg-slate-950"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <p className="text-xs text-slate-400">Cliquez ci-dessous pour compiler le code et afficher l'application.</p>
                    <button
                      onClick={() => {
                        if (currentProject) compileAndBuildPreview(currentProject);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
                    >
                      Compiler & Lancer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CODE & FILES */}
          {mobileTab === 'code' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#0d0d12] overflow-hidden">
              {/* File selector bar */}
              <div className="h-10 bg-[#121218] border-b border-[#1f1f2a] px-2 flex items-center gap-1 overflow-x-auto shrink-0">
                {currentProject?.files.map(f => (
                  <button
                    key={f.path}
                    onClick={() => handleSelectFile(f.path)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                      activeFilePath === f.path
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-[#181822] text-slate-400'
                    }`}
                  >
                    {f.path.split('/').pop()}
                  </button>
                ))}
                <button
                  onClick={() => setShowNewFileDialog(true)}
                  className="p-1 rounded bg-[#1e1e2b] text-slate-300 hover:text-white shrink-0"
                  title="Nouveau fichier"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Textarea Editor */}
              <div className="flex-1 p-3 overflow-hidden flex flex-col bg-[#0b0b10]">
                <textarea
                  value={editorContent}
                  onChange={(e) => handleEditorChange(e.target.value)}
                  spellCheck={false}
                  className="w-full flex-1 bg-transparent text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-none"
                  placeholder="// Écrivez votre code ici..."
                />
              </div>
            </div>
          )}

          {/* TAB: PROJECTS & TEMPLATES */}
          {mobileTab === 'projects' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0f0f15]">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-white">Mes Applications ({projects.length})</h4>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Nouveau Projet</span>
                </button>
              </div>

              <div className="space-y-2">
                {projects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      selectProject(p);
                      setMobileTab('chat');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      currentProject?.id === p.id
                        ? 'bg-[#1e1e2c] border-amber-500/40'
                        : 'bg-[#14141d] border-[#222230] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">📁 {p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">{p.category}</span>
                    </div>
                    {p.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description}</p>}
                    {p.latestDeploymentUrl && (
                      <div className="mt-2 text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <Globe size={12} />
                        <span>En ligne</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Templates Pro */}
              <div className="pt-3 border-t border-[#1f1f2a] space-y-2">
                <h4 className="font-extrabold text-xs text-slate-400 uppercase">Templates Clé en Main</h4>
                <div className="space-y-2">
                  {APP_TEMPLATES.slice(0, 3).map(tpl => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        createProjectFromTemplate(tpl);
                        setMobileTab('chat');
                      }}
                      className="p-3 rounded-2xl bg-[#14141d] border border-[#222230] hover:border-amber-500/40 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{tpl.name}</span>
                        <span className="text-[10px] text-amber-400 font-bold">{tpl.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{tpl.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="h-16 bg-[#121218] border-t border-[#1f1f2a] grid grid-cols-4 px-2 shrink-0">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
              mobileTab === 'chat' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <MessageSquare size={16} />
            <span>Discuter / IA</span>
          </button>
          <button
            onClick={() => {
              if (currentProject) compileAndBuildPreview(currentProject);
              setMobileTab('preview');
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
              mobileTab === 'preview' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <Eye size={16} />
            <span>Aperçu</span>
          </button>
          <button
            onClick={() => setMobileTab('code')}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
              mobileTab === 'code' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <Code size={16} />
            <span>Code</span>
          </button>
          <button
            onClick={() => setMobileTab('projects')}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
              mobileTab === 'projects' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <Folder size={16} />
            <span>Projets</span>
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP INTERFACE (>= md screens) */}
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR: Projects & Navigation */}
      <aside className="hidden md:flex w-64 bg-[#121218] border-r border-[#1f1f2a] flex-col justify-between shrink-0">
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black font-black text-base shadow-md shadow-amber-500/20">
                B
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white tracking-tight leading-none">Berry Builder</h2>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">PRO STUDIO</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all border border-amber-500/30"
                title="Nouvelle application"
              >
                <Plus size={15} />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-1"
                  title="Retourner au chat Berry GPT"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-1">
            {[
              { id: 'editor', label: 'Éditeur & Code', icon: <Code size={15} /> },
              { id: 'preview', label: 'Prévisualisation', icon: <Eye size={15} /> },
              { id: 'templates', label: 'Templates Pro', icon: <Layers size={15} /> },
              { id: 'deployments', label: 'Déploiements Réels', icon: <Globe size={15} /> },
              { id: 'history', label: 'Historique Versions', icon: <RotateCcw size={15} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'preview' && currentProject) {
                    compileAndBuildPreview(currentProject);
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a24]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* My Applications List */}
          <div className="pt-3 border-t border-[#1f1f2a] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase px-1">
              <span>Mes Applications ({projects.length})</span>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => selectProject(p)}
                  className={`w-full group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    currentProject?.id === p.id
                      ? 'bg-[#1e1e2c] text-white border border-amber-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#171722]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-amber-400 text-sm">📁</span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  {p.latestDeploymentUrl && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Déployé en ligne" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Status / Pro Indicator */}
        <div className="p-3 bg-[#0a0a0e] border-t border-[#1f1f2a] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              👑
            </div>
            <span className="text-slate-300 font-semibold truncate text-[11px]">
              {currentUser.displayName || currentUser.email || 'Membre Pro'}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-black border border-amber-500/30">
            PRO
          </span>
        </div>
      </aside>

      {/* 2. MAIN CENTER AREA: Workspace (Editor, Preview, Templates, Deployments) */}
      <main className="hidden md:flex flex-1 flex-col min-w-0 bg-[#0d0d12] overflow-hidden">
        {/* Top Action Bar */}
        <header className="h-14 bg-[#121218] border-b border-[#1f1f2a] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Retourner au chat Berry GPT"
              >
                <ArrowLeft size={14} className="text-amber-400" />
                <span>Retour Chat</span>
              </button>
            )}
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projet actif :</span>
            <h3 className="font-extrabold text-sm text-white truncate">
              {currentProject?.name || 'Aucun projet sélectionné'}
            </h3>
            {currentProject?.latestDeploymentUrl && (
              <a
                href={currentProject.latestDeploymentUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all"
              >
                <Globe size={13} />
                <span>En ligne</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportZip}
              className="px-3 py-1.5 rounded-xl bg-[#1c1c28] hover:bg-[#252536] text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Télécharger l'archive ZIP"
            >
              <Download size={14} />
              <span className="hidden md:inline">Export ZIP</span>
            </button>

            <button
              onClick={() => {
                if (currentProject) {
                  compileAndBuildPreview(currentProject);
                  setActiveTab('preview');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Play size={14} />
              <span>Compiler & Preview</span>
            </button>

            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              <Globe size={14} />
              <span>{isDeploying ? 'Déploiement...' : 'Déployer'}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Center Tab Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* TAB 1: CODE EDITOR & FILE TREE */}
          {activeTab === 'editor' && (
            <div className="flex-1 flex overflow-hidden">
              {/* File Explorer Tree */}
              <div className="w-56 bg-[#0f0f15] border-r border-[#1f1f2a] flex flex-col shrink-0">
                <div className="p-3 border-b border-[#1f1f2a] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Fichiers ({currentProject?.files.length || 0})</span>
                  <button
                    onClick={() => setShowNewFileDialog(true)}
                    className="p-1 rounded bg-[#1e1e2b] hover:bg-[#28283a] text-slate-300"
                    title="Nouveau fichier"
                  >
                    <FilePlus size={14} />
                  </button>
                </div>

                <div className="p-2 overflow-y-auto space-y-0.5 flex-1">
                  {currentProject?.files.map(file => (
                    <div
                      key={file.path}
                      onClick={() => handleSelectFile(file.path)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                        activeFilePath === file.path
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#181822]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode size={13} className={file.path.endsWith('.tsx') ? 'text-cyan-400' : file.path.endsWith('.html') ? 'text-amber-400' : 'text-slate-400'} />
                        <span className="truncate">{file.path}</span>
                      </div>

                      {currentProject.files.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.path);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5"
                          title="Supprimer"
                        >
                          <Trash size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor Workspace with Tabs */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d12]">
                {/* Tabs bar */}
                <div className="flex bg-[#121218] border-b border-[#1f1f2a] px-2 overflow-x-auto">
                  {openTabs.map(tabPath => (
                    <div
                      key={tabPath}
                      onClick={() => handleSelectFile(tabPath)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-all shrink-0 ${
                        activeFilePath === tabPath
                          ? 'border-amber-400 text-amber-400 bg-[#1a1a24]'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileCode size={13} />
                      <span>{tabPath.split('/').pop()}</span>
                      {openTabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTabs(prev => prev.filter(p => p !== tabPath));
                          }}
                          className="hover:text-red-400 ml-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Real Code Textarea */}
                <div className="flex-1 p-4 relative overflow-hidden flex flex-col bg-[#0b0b10]">
                  <textarea
                    value={editorContent}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    spellCheck={false}
                    className="w-full flex-1 bg-transparent text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-amber-500/30"
                    placeholder="// Écrivez ou collez votre code ici..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE ISOLATED PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex-1 flex flex-col bg-[#0b0b10] overflow-hidden">
              {/* Device Selector Header */}
              <div className="h-10 bg-[#121218] border-b border-[#1f1f2a] px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Vue Exécutable :</span>
                  <div className="flex bg-[#1a1a24] p-0.5 rounded-lg border border-slate-800">
                    {[
                      { id: 'desktop', icon: <Monitor size={13} />, label: 'Desktop' },
                      { id: 'tablet', icon: <Tablet size={13} />, label: 'Tablette' },
                      { id: 'mobile', icon: <Smartphone size={13} />, label: 'Mobile' },
                    ].map(dev => (
                      <button
                        key={dev.id}
                        onClick={() => setPreviewDevice(dev.id as any)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                          previewDevice === dev.id
                            ? 'bg-amber-500 text-black font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {dev.icon}
                        <span className="hidden sm:inline">{dev.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => currentProject && compileAndBuildPreview(currentProject)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <RefreshCw size={12} />
                  <span>Recharger</span>
                </button>
              </div>

              {/* Preview Iframe Container */}
              <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-[#08080c]">
                <div
                  className={`h-full transition-all duration-200 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 ${
                    previewDevice === 'mobile'
                      ? 'w-[375px] max-h-[720px]'
                      : previewDevice === 'tablet'
                      ? 'w-[768px] max-h-[900px]'
                      : 'w-full'
                  }`}
                >
                  <iframe
                    key={previewKey}
                    title="Berry Pro Executable Preview"
                    srcDoc={previewHtml}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRO TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="flex-1 p-8 overflow-y-auto bg-[#0a0a0f] space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">Templates d'Applications Pro</h2>
                <p className="text-sm text-slate-400">
                  Démarrez instantanément avec des architectures professionnelles complètes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {APP_TEMPLATES.map(tpl => (
                  <div
                    key={tpl.id}
                    className="bg-[#121218] border border-[#1f1f2a] hover:border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all space-y-4 shadow-lg group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold uppercase">
                          {tpl.category}
                        </span>
                        <span className="text-xs text-slate-500">{tpl.files.length} fichiers</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-3 group-hover:text-amber-400 transition-colors">
                        {tpl.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#1f1f2a] flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {tpl.tags.map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => createProjectFromTemplate(tpl)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
                      >
                        Utiliser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REAL DEPLOYMENTS & LIVE URLS */}
          {activeTab === 'deployments' && (
            <div className="flex-1 p-8 overflow-y-auto bg-[#0a0a0f] space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">Déploiements Réels & Domaines Publics</h2>
                <p className="text-sm text-slate-400">
                  Chaque déploiement génère une véritable URL permanente accessible sur le web mondial.
                </p>
              </div>

              {currentProject?.latestDeploymentUrl ? (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-600/15 to-blue-600/15 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Globe size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Application Active en Ligne</span>
                      <h4 className="text-lg font-bold text-white">{currentProject.name}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-black/40 border border-emerald-500/30 rounded-xl">
                    <span className="text-xs font-mono text-emerald-300 truncate flex-1 select-all">
                      {currentProject.latestDeploymentUrl}
                    </span>
                    <a
                      href={currentProject.latestDeploymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all shrink-0"
                    >
                      <span>Ouvrir l'application</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#121218] border border-[#1f1f2a] text-center space-y-4">
                  <Globe size={32} className="mx-auto text-slate-600" />
                  <div>
                    <h3 className="font-bold text-base text-white">Aucun déploiement actif pour ce projet</h3>
                    <p className="text-xs text-slate-400 mt-1">Cliquez sur « Déployer » en haut à droite pour publier votre application.</p>
                  </div>
                  <button
                    onClick={handleDeploy}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Déployer maintenant
                  </button>
                </div>
              )}

              {/* History Table */}
              <div className="bg-[#121218] border border-[#1f1f2a] rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-white">Historique des Déploiements</h3>
                {currentProject?.deployments && currentProject.deployments.length > 0 ? (
                  <div className="divide-y divide-slate-800">
                    {currentProject.deployments.map(dep => (
                      <div key={dep.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-white font-mono">{dep.publicUrl}</p>
                          <p className="text-slate-500">{new Date(dep.deployedAt).toLocaleString()}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md font-bold">
                          {dep.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Aucun historique enregistré.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SNAPSHOT VERSIONS */}
          {activeTab === 'history' && (
            <div className="flex-1 p-8 overflow-y-auto bg-[#0a0a0f] space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">Versions & Restauration</h2>
                <p className="text-sm text-slate-400">
                  Consultez et restaurez les instantanés de votre projet à n'importe quel moment.
                </p>
              </div>

              <div className="space-y-3">
                {currentProject?.versions && currentProject.versions.length > 0 ? (
                  currentProject.versions.map(v => (
                    <div
                      key={v.id}
                      className="p-4 bg-[#121218] border border-[#1f1f2a] rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
                          Version {v.versionNumber}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-1">{v.name}</h4>
                        <p className="text-xs text-slate-500">{new Date(v.timestamp).toLocaleString()} • {v.files.length} fichiers</p>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Restaurer la version "${v.name}" ?`)) {
                            const restored = AppBuilderService.restoreVersion(currentProject, v.id);
                            setCurrentProject(restored);
                            AppBuilderService.saveProject(restored);
                            selectProject(restored);
                            alert('Version restaurée avec succès !');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                      >
                        Restaurer cette version
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Aucune version antérieure enregistrée.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. BOTTOM PANEL: TERMINAL & BUILD LOGS */}
        {isTerminalOpen && (
          <div className="h-40 bg-[#0a0a0e] border-t border-[#1f1f2a] flex flex-col shrink-0">
            <div className="h-8 bg-[#101016] border-b border-[#1f1f2a] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={13} className="text-amber-400" />
                <span className="text-[11px] font-bold text-slate-300 uppercase">Console & Debugging en Direct</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAiSubmit("Corrige automatiquement toutes les erreurs détectées dans le projet.", "/fix")}
                  className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1"
                >
                  <Wrench size={10} />
                  <span>Réparer automatiquement avec l'IA</span>
                </button>
                <button onClick={() => setIsTerminalOpen(false)} className="text-slate-500 hover:text-slate-300 text-xs">
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1 bg-[#060608]">
              {terminalLogs.map((l, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0">[{l.time}]</span>
                  <span
                    className={
                      l.type === 'error'
                        ? 'text-red-400'
                        : l.type === 'warn'
                        ? 'text-amber-400'
                        : l.type === 'success'
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }
                  >
                    {l.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. RIGHT SIDEBAR: BERRY AI DEVELOPER AGENT */}
      <aside className="hidden md:flex w-80 bg-[#121218] border-l border-[#1f1f2a] flex-col justify-between shrink-0">
        {/* Agent Header */}
        <div className="p-4 border-b border-[#1f1f2a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black font-black text-xs">
              <Sparkles size={14} />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white">Agent Développeur IA</h3>
              <p className="text-[10px] text-emerald-400 font-semibold">Connecté au Projet</p>
            </div>
          </div>
        </div>

        {/* Conversation Logs */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0f0f15]">
          {aiAgentMessages.map(msg => (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-black font-medium ml-4'
                  : 'bg-[#1a1a24] text-slate-200 border border-[#262638] mr-2'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))}
          {isAiGenerating && (
            <div className="p-3 rounded-2xl bg-[#1a1a24] text-xs text-amber-400 animate-pulse border border-amber-500/30">
              ⚡ Berry GPT analyse le code et applique les modifications...
            </div>
          )}
        </div>

        {/* Quick Command Pills */}
        <div className="px-3 py-2 bg-[#101016] border-t border-[#1f1f2a] flex gap-1.5 overflow-x-auto">
          {[
            { label: '+ Page Connexion', prompt: 'Ajoute une page de connexion et d’authentification sécurisée avec formulaires.' },
            { label: '🎨 Design Pro', prompt: 'Modernise le design avec de superbes dégradés, des cartes et une mise en page épurée.' },
            { label: '📊 Ajouter Graphique', prompt: 'Ajoute des statistiques interactives et des graphiques de données.' },
          ].map((pill, i) => (
            <button
              key={i}
              onClick={() => handleAiSubmit(pill.prompt)}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#1a1a26] hover:bg-[#252538] text-slate-300 border border-slate-800 shrink-0 transition-all"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Agent Input Box */}
        <div className="p-3 border-t border-[#1f1f2a] bg-[#121218]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAiSubmit();
            }}
            className="relative"
          >
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAiSubmit();
                }
              }}
              placeholder="Ex: Ajoute un système de filtre par prix et un panier persistant..."
              rows={3}
              className="w-full p-3 pr-10 bg-[#0a0a0f] border border-[#242436] focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none resize-none"
            />
            <button
              type="submit"
              disabled={!aiPrompt.trim() || isAiGenerating}
              className="absolute right-2.5 bottom-3.5 p-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </aside>

      {/* MODAL: NEW FILE DIALOG */}
      {showNewFileDialog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181822] border border-[#29293d] rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-sm text-white">Nouveau Fichier</h3>
            <input
              type="text"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              placeholder="Ex: src/components/Dashboard.tsx"
              className="w-full px-3.5 py-2.5 bg-[#0e0e14] border border-[#2b2b40] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFileDialog(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateNewFile}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW PROJECT CREATION */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewProject}
            className="bg-[#181822] border border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl"
          >
            <div>
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">+ Nouvelle Application Pro</span>
              <h3 className="text-xl font-black text-white mt-1">Configurer le Projet</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nom de l'application</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="Ex: Travel Booking Pro"
                  className="w-full px-3.5 py-2.5 bg-[#0e0e14] border border-[#2b2b40] rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Catégorie</label>
                <select
                  value={newProjectCategory}
                  onChange={e => setNewProjectCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#0e0e14] border border-[#2b2b40] rounded-xl text-white focus:outline-none"
                >
                  <option value="SaaS">SaaS</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="CRM">CRM & Tâches</option>
                  <option value="AI App">Application IA</option>
                  <option value="Custom">Personnalisé</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description & Fonctionnalités</label>
                <textarea
                  value={newProjectDescription}
                  onChange={e => setNewProjectDescription(e.target.value)}
                  placeholder="Ex: Système de réservation avec calendrier, gestion des clients et paiement..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#0e0e14] border border-[#2b2b40] rounded-xl text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-md shadow-amber-500/20"
              >
                Initialiser le Projet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
