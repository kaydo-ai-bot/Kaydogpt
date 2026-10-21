import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  FolderPlus,
  Folder,
  Trash2,
  Edit2,
  Check,
  FolderKanban,
  Sparkles,
} from 'lucide-react';
import { ConversationFolder, UserProfile } from '../types';

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: ConversationFolder[];
  onAddFolder: (name: string, color: string) => void;
  onDeleteFolder: (id: string) => void;
  user: UserProfile | null;
  onOpenPremium: () => void;
}

const FOLDER_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
];

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  isOpen,
  onClose,
  folders,
  onAddFolder,
  onDeleteFolder,
  user,
  onOpenPremium,
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  if (!isOpen) return null;

  const isPremium = true;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    onAddFolder(newFolderName.trim(), selectedColor);
    setNewFolderName('');
  };

  return (
    <div id="folder-manager-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#333] overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Dossiers de Conversations
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                  100% Gratuit
                </span>
              </div>
              <p className="text-xs text-gray-500">Organisez vos échanges par thématiques et projets</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Create new folder form */}
          <form onSubmit={handleCreate} className="space-y-3">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nouveau Dossier
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ex: Travail, Études, Code..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FolderPlus size={14} />
                <span>Créer</span>
              </button>
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-gray-500">Couleur :</span>
              <div className="flex gap-1.5">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      selectedColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-80'
                    }`}
                  >
                    {selectedColor === c && <Check size={10} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* List of existing folders */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">Vos dossiers existants</h4>
            {folders.length === 0 ? (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#252525] border border-dashed border-gray-200 dark:border-[#333] text-center text-xs text-gray-400">
                Aucun dossier créé pour le moment.
              </div>
            ) : (
              folders.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#252525] border border-gray-200/70 dark:border-[#333]"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder size={16} style={{ color: f.color || '#3b82f6' }} />
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{f.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteFolder(f.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-[#181818] border-t border-gray-200 dark:border-[#2a2a2a] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-[#333] text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-300 cursor-pointer"
          >
            Terminer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
