import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Play,
  FileCode,
  Sparkles,
  Wand2,
  Bug,
  MessageSquareQuote,
  Zap,
  Code2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { CanvasArtifact } from '../types';
import { downloadFile } from '../utils/export';

interface CanvasViewProps {
  artifact: CanvasArtifact | null;
  onClose: () => void;
  onUpdateArtifact: (updated: CanvasArtifact) => void;
  onAskAiToEdit: (instruction: string, currentContent: string) => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  artifact,
  onClose,
  onUpdateArtifact,
  onAskAiToEdit,
}) => {
  const [content, setContent] = useState(artifact?.content || '');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (artifact) {
      setContent(artifact.content);
    }
  }, [artifact]);

  if (!artifact) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleDownload = () => {
    const ext =
      artifact.language === 'python'
        ? 'py'
        : artifact.language === 'typescript' || artifact.language === 'tsx'
        ? 'tsx'
        : artifact.language === 'javascript'
        ? 'js'
        : artifact.language === 'html'
        ? 'html'
        : 'txt';
    downloadFile(`canvas-${artifact.id}.${ext}`, content, 'text/plain');
  };

  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    onUpdateArtifact({
      ...artifact,
      content: newVal,
      updatedAt: Date.now(),
    });
  };

  const isPreviewable =
    artifact.language === 'html' ||
    artifact.language === 'javascript' ||
    content.includes('<!DOCTYPE') ||
    content.includes('<html') ||
    content.includes('<div');

  return (
    <div className="w-full lg:w-[480px] xl:w-[560px] h-full flex flex-col bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-[#2f2f2f] z-30 transition-all select-none animate-in slide-in-from-right duration-200">
      {/* Top Canvas Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] bg-gray-50/70 dark:bg-[#202020]">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FileCode size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
                {artifact.title || 'Canvas Workspace'}
              </h3>
              <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                v{artifact.version || 1}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 uppercase font-mono">
              {artifact.language || 'text'}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {isPreviewable && (
            <div className="flex items-center bg-gray-200 dark:bg-[#2e2e2e] p-0.5 rounded-lg text-xs mr-2">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white shadow-2xs font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Code2 size={12} />
                <span>Code</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('preview');
                  setPreviewKey((k) => k + 1);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white shadow-2xs font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Eye size={12} />
                <span>Aperçu</span>
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2e2e2e] hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Copier"
          >
            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2e2e2e] hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Télécharger"
          >
            <Download size={15} />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2e2e2e] hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Fermer le Canvas"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === 'editor' ? (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full flex-1 p-4 bg-transparent text-gray-900 dark:text-gray-100 font-mono text-[13px] leading-relaxed resize-none outline-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#333]"
            placeholder="Écrivez ou modifiez votre code ici..."
            spellCheck={false}
          />
        ) : (
          <div className="w-full h-full bg-white relative">
            <iframe
              key={previewKey}
              srcDoc={content}
              title="Live Preview"
              sandbox="allow-scripts"
              className="w-full h-full border-0"
            />
          </div>
        )}
      </div>

      {/* Bottom Quick AI Edit Toolbar */}
      <div className="p-3 border-t border-gray-200 dark:border-[#2f2f2f] bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 shrink-0 flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-500" /> Actions IA :
          </span>

          <button
            onClick={() =>
              onAskAiToEdit(
                'Ajoute des commentaires clairs et une documentation JSDoc complète à ce code.',
                content
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#383838] hover:bg-gray-100 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 shrink-0 transition-colors flex items-center gap-1"
          >
            <MessageSquareQuote size={12} />
            <span>Commenter</span>
          </button>

          <button
            onClick={() =>
              onAskAiToEdit(
                'Analyse ce code, détecte d\'éventuels bugs et propose une version corrigée et robuste.',
                content
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#383838] hover:bg-gray-100 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 shrink-0 transition-colors flex items-center gap-1"
          >
            <Bug size={12} />
            <span>Corriger bugs</span>
          </button>

          <button
            onClick={() =>
              onAskAiToEdit(
                'Optimise la lisibilité, la performance et réduis la verbosité sans casser la logique.',
                content
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#383838] hover:bg-gray-100 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 shrink-0 transition-colors flex items-center gap-1"
          >
            <Zap size={12} />
            <span>Optimiser</span>
          </button>

          <button
            onClick={() =>
              onAskAiToEdit(
                'Convertis ce code en TypeScript moderne avec typage strict et interfaces.',
                content
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#383838] hover:bg-gray-100 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 shrink-0 transition-colors flex items-center gap-1"
          >
            <Wand2 size={12} />
            <span>TypeScript</span>
          </button>
        </div>
      </div>
    </div>
  );
};
