import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Edit3,
  ArrowDown,
} from 'lucide-react';
import { Message, ImageAttachment } from '../types';
import { OpenAILogo } from './OpenAILogo';
import { MarkdownRenderer } from './MarkdownRenderer';
import { playTextToSpeech, stopAudioPlayback } from '../utils/speech';
import { SupportedLanguage, translations } from '../utils/i18n';

// Real high quality assets matching the user's photo
import poppyArtImg from '../assets/images/poppy_bloom_art_1789624804501.jpg';
import curlyPortraitImg from '../assets/images/curly_woman_portrait_1789624814415.jpg';
import isometricRoomImg from '../assets/images/isometric_mini_room_1789624791395.jpg';
import frogShirtImg from '../assets/images/frog_shirt_hanging_1789624824328.jpg';
import gameIconsImg from '../assets/images/game_icons_gem_1789624834349.jpg';

interface ChatViewProps {
  messages: Message[];
  isStreaming: boolean;
  onSendMessage: (
    content: string,
    images: ImageAttachment[],
    options: { webSearch: boolean; reasoning: boolean }
  ) => void;
  onRegenerate: () => void;
  onOpenCanvas: (code: string, language: string, title: string) => void;
  speechVoice: string;
  language?: SupportedLanguage;
  onEditMessage?: (messageIndex: number, newContent: string) => void;
  onOpenSupport?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onRegenerate,
  onOpenCanvas,
  speechVoice,
  language = 'fr',
  onEditMessage,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [thoughtOpen, setThoughtOpen] = useState<{ [key: string]: boolean }>({});
  const [feedbackState, setFeedbackState] = useState<{ [key: string]: 'like' | 'dislike' | null }>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editInput, setEditInput] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const t = translations[language] || translations.fr;

  // Auto scroll to bottom during streaming or new messages
  useEffect(() => {
    if (!showScrollBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Handle scroll detection for scroll-to-bottom button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleToggleAudio = async (id: string, text: string) => {
    if (playingAudioId === id) {
      stopAudioPlayback();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(id);
    await playTextToSpeech(
      text,
      speechVoice,
      () => setPlayingAudioId(id),
      () => setPlayingAudioId(null),
      () => setPlayingAudioId(null)
    );
  };

  const toggleFeedback = (id: string, type: 'like' | 'dislike') => {
    setFeedbackState((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
  };

  const startEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditInput(content);
  };

  const saveEdit = (index: number) => {
    if (editInput.trim() && onEditMessage) {
      onEditMessage(index, editInput.trim());
    }
    setEditingIndex(null);
  };

  return (
    <div
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-4 py-6 scrollbar-thin scrollbar-thumb-neutral-800 relative bg-black"
    >
      {/* Empty State / Welcome Screen - EXACT MATCH TO THE USER'S PHOTO */}
      {messages.length === 0 ? (
        <div className="max-w-2xl mx-auto my-auto min-h-[70vh] flex flex-col items-center justify-center text-center px-2 py-6 animate-in fade-in duration-300">
          {/* Fan Arc of 5 Image Cards */}
          <div className="relative w-full max-w-lg h-56 sm:h-64 flex items-center justify-center mb-6 select-none overflow-visible">
            {/* Card 1: Far Left (Red Poppy Bloom art) */}
            <div
              className="absolute w-28 sm:w-36 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-transform duration-300 hover:scale-105 cursor-pointer"
              style={{
                transform: 'translateX(-120px) translateY(18px) rotate(-14deg) scale(0.88)',
                zIndex: 1,
              }}
              onClick={() =>
                onSendMessage(
                  'Génère une illustration artistique moderne d\'une fleur de coquelicot rouge vif sur fond terre cuite avec typographie Bloom',
                  [],
                  { webSearch: false, reasoning: false }
                )
              }
            >
              <img
                src={poppyArtImg}
                alt="Bloom Art Poster"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 2: Mid Left (Curly hair woman portrait) */}
            <div
              className="absolute w-28 sm:w-36 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-transform duration-300 hover:scale-105 cursor-pointer"
              style={{
                transform: 'translateX(-60px) translateY(6px) rotate(-7deg) scale(0.95)',
                zIndex: 2,
              }}
              onClick={() =>
                onSendMessage(
                  'Génère un portrait photo réaliste et lumineux d\'une jeune femme souriante avec cheveux afro bouclés au coucher du soleil',
                  [],
                  { webSearch: false, reasoning: false }
                )
              }
            >
              <img
                src={curlyPortraitImg}
                alt="Portrait Photo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 3: Center (Isometric Living Room miniature) - Highlighted */}
            <div
              className="absolute w-32 sm:w-40 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transition-transform duration-300 hover:scale-105 cursor-pointer"
              style={{
                transform: 'translateX(0px) translateY(-4px) rotate(0deg) scale(1.05)',
                zIndex: 5,
              }}
              onClick={() =>
                onSendMessage(
                  'Génère une maquette 3D isométrique détaillée d\'un salon moderne chaleureux avec canapé vert velours et plantes',
                  [],
                  { webSearch: false, reasoning: false }
                )
              }
            >
              <img
                src={isometricRoomImg}
                alt="Isometric 3D Room"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 4: Mid Right (Frog T-shirt on clothesline) */}
            <div
              className="absolute w-28 sm:w-36 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-transform duration-300 hover:scale-105 cursor-pointer"
              style={{
                transform: 'translateX(60px) translateY(6px) rotate(7deg) scale(0.95)',
                zIndex: 2,
              }}
              onClick={() =>
                onSendMessage(
                  'Génère un t-shirt blanc avec une grenouille mignonne suspendu à une corde à linge sous un ciel bleu ensoleillé',
                  [],
                  { webSearch: false, reasoning: false }
                )
              }
            >
              <img
                src={frogShirtImg}
                alt="Frog Shirt Clothesline"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 5: Far Right (Game UI icons) */}
            <div
              className="absolute w-28 sm:w-36 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-transform duration-300 hover:scale-105 cursor-pointer"
              style={{
                transform: 'translateX(120px) translateY(18px) rotate(14deg) scale(0.88)',
                zIndex: 1,
              }}
              onClick={() =>
                onSendMessage(
                  'Génère un ensemble d\'icônes de jeu vidéo 3D brillantes en cristaux d\'émeraude sur fond sombre',
                  [],
                  { webSearch: false, reasoning: false }
                )
              }
            >
              <img
                src={gameIconsImg}
                alt="Game Icons & Gems"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Heading from Photo */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mt-2 mb-3 max-w-xl leading-tight">
            La création d’images fait un bond en avant
          </h1>

          {/* Description from Photo */}
          <p className="text-sm sm:text-base text-gray-400 max-w-md mb-8 leading-relaxed font-normal">
            Des résultats de meilleure qualité, une génération plus rapide et des outils de création plus intelligents
          </p>

          {/* Call to Action Button from Photo */}
          <button
            onClick={() =>
              onSendMessage(
                'Génère une illustration créative et détaillée en haute définition',
                [],
                { webSearch: false, reasoning: false }
              )
            }
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg shadow-white/10 active:scale-95 cursor-pointer"
          >
            Faites-en l’essai
          </button>
        </div>
      ) : (
        /* Conversation Message Stream */
        <div className="max-w-3xl mx-auto space-y-6 pb-6">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isEditing = editingIndex === index;
            const isPlaying = playingAudioId === msg.id;
            const hasThought = msg.reasoning || (msg.thought && msg.thought.length > 0);
            const isThoughtExpanded = thoughtOpen[msg.id] ?? false;

            if (isUser) {
              const isSending = msg.status === 'sending' || (isStreaming && index === messages.length - 2);
              return (
                <div key={msg.id} className="flex flex-col items-end group/user pl-8 sm:pl-16">
                  <div className="relative max-w-[88%] sm:max-w-[80%] rounded-[22px] px-5 py-3 bg-[#2563eb] text-white text-[15px] shadow-sm leading-relaxed">
                    {/* Attached Images */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.images.map((img, i) => (
                          <img
                            key={i}
                            src={img.data}
                            alt={img.name}
                            onClick={() => setSelectedImage(img.data)}
                            className="w-24 h-24 object-cover rounded-xl border border-blue-400/40 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        ))}
                      </div>
                    )}

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          className="w-full bg-[#1d4ed8] text-white p-2.5 rounded-xl border border-white/40 outline-none text-sm resize-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="px-3 py-1 rounded-lg bg-black/40 text-gray-200 hover:bg-black/60 cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => saveEdit(index)}
                            className="px-3 py-1 rounded-lg bg-white text-blue-700 font-semibold hover:bg-gray-100 cursor-pointer"
                          >
                            Enregistrer & Renvoyer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed select-text font-normal">{msg.content}</p>
                    )}

                    {/* Edit hover button */}
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(index, msg.content)}
                        className="absolute -left-8 top-3 p-1 rounded-lg text-gray-400 opacity-0 group-hover/user:opacity-100 hover:text-gray-200 transition-opacity cursor-pointer"
                        title="Modifier le message"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Sending status under user bubble - EXACT match to user request & screenshot */}
                  {isSending && (
                    <div className="text-[12px] text-gray-400 font-normal mt-1.5 pr-2 text-right select-none animate-in fade-in duration-200">
                      Envoi en cours
                    </div>
                  )}
                </div>
              );
            }

            // Assistant waiting state: EXACT blue sphere ("cette boule") from screenshot
            if (msg.isStreaming && !msg.content) {
              return (
                <div key={msg.id} className="flex items-center py-2.5 pl-1 sm:pl-2 animate-in fade-in duration-200">
                  <div className="relative flex items-center justify-center">
                    <span className="w-4 h-4 rounded-full bg-[#2563eb] shadow-[0_0_14px_rgba(37,99,235,0.95)] animate-pulse" />
                  </div>
                </div>
              );
            }

            // Assistant Message with content
            return (
              <div key={msg.id} className="flex items-start gap-3 sm:gap-3.5 group/assistant pr-2 animate-in fade-in duration-200">
                {/* Kaydo GPT Assistant Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#1a1b1e] border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <OpenAILogo size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Thinking / Reasoning Accordion */}
                  {hasThought && (
                    <div className="mb-3 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 p-2.5 text-xs text-purple-900 dark:text-purple-200">
                      <button
                        onClick={() =>
                          setThoughtOpen((prev) => ({
                            ...prev,
                            [msg.id]: !isThoughtExpanded,
                          }))
                        }
                        className="w-full flex items-center justify-between font-medium cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Sparkles size={13} className="text-purple-400" />
                          <span>Raisonnement approfondi</span>
                        </span>
                        {isThoughtExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {isThoughtExpanded && (
                        <div className="mt-2 pt-2 border-t border-purple-200/60 dark:border-purple-800/40 text-gray-600 dark:text-gray-300 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap">
                          {msg.thought ||
                            '1. Analyse de la demande.\n2. Élaboration de la réponse structurée.\n3. Synthèse claire et précise.'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Message Content */}
                  <div className="text-gray-900 dark:text-[#ececec]">
                    <MarkdownRenderer
                      content={msg.content}
                      onOpenCanvas={onOpenCanvas}
                    />
                  </div>

                  {/* Streaming pulse glowing cursor */}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-[#2563eb] rounded-full animate-pulse align-middle shadow-[0_0_8px_#2563eb]" />
                  )}

                  {/* Actions Toolbar */}
                  {!msg.isStreaming && msg.content && (
                    <div className="flex items-center gap-1 mt-3 text-gray-400 dark:text-gray-400 opacity-85 group-hover/assistant:opacity-100 transition-opacity">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2e2e2e] hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        title="Copier la réponse"
                      >
                        {copiedId === msg.id ? (
                          <Check size={15} className="text-blue-400" />
                        ) : (
                          <Copy size={15} />
                        )}
                      </button>

                      {/* Read Aloud Audio */}
                      <button
                        onClick={() => handleToggleAudio(msg.id, msg.content)}
                        className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2e2e2e] transition-colors ${
                          isPlaying
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                        title={isPlaying ? 'Arrêter la lecture' : 'Écouter la réponse'}
                      >
                        {isPlaying ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      </button>

                      {/* Regenerate */}
                      <button
                        onClick={onRegenerate}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2e2e2e] hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        title="Régénérer la réponse"
                      >
                        <RotateCw size={15} />
                      </button>

                      {/* Thumbs Up */}
                      <button
                        onClick={() => toggleFeedback(msg.id, 'like')}
                        className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2e2e2e] transition-colors cursor-pointer ${
                          feedbackState[msg.id] === 'like' ? 'text-green-500' : ''
                        }`}
                        title="Bonne réponse"
                      >
                        <ThumbsUp size={15} />
                      </button>

                      {/* Thumbs Down */}
                      <button
                        onClick={() => toggleFeedback(msg.id, 'dislike')}
                        className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2e2e2e] transition-colors cursor-pointer ${
                          feedbackState[msg.id] === 'dislike' ? 'text-rose-500' : ''
                        }`}
                        title="Réponse insatisfaisante"
                      >
                        <ThumbsDown size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="fixed bottom-24 right-8 p-2.5 rounded-full bg-white dark:bg-[#2f2f2f] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#444] shadow-lg hover:bg-gray-50 dark:hover:bg-[#383838] transition-all z-30 animate-in fade-in zoom-in-90 duration-150 cursor-pointer"
          title="Faire défiler jusqu'en bas"
        >
          <ArrowDown size={17} />
        </button>
      )}

      {/* Full image zoom preview modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Zoom"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
