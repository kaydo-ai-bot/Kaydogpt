import React, { useState } from 'react';
import { X, Copy, Check, Share2, Link as LinkIcon, Lock, Globe } from 'lucide-react';
import { Conversation } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  conversation,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !conversation) return null;

  const shareUrl = `${window.location.origin}/share/${conversation.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95 duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#242424] border border-gray-200 dark:border-[#383838] rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#333]">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-emerald-500" />
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
              Partager le lien vers la discussion
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conversation Preview Card */}
        <div className="my-5 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333]">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
            {conversation.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {conversation.messages.length} messages • Créé le{' '}
            {new Date(conversation.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Public Share Info */}
        <div className="flex items-start gap-2.5 mb-5 text-xs text-gray-500 dark:text-gray-400">
          <Globe size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p>
            Toute personne disposant de ce lien pourra consulter la discussion. Votre nom et vos informations personnelles restent privés.
          </p>
        </div>

        {/* Share Link Input & Copy button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#3a3a3a] text-xs text-gray-700 dark:text-gray-300 overflow-hidden font-mono">
            <LinkIcon size={14} className="shrink-0 text-gray-400" />
            <span className="truncate">{shareUrl}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copier le lien</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
