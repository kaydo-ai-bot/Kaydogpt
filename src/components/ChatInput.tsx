import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Globe,
  Brain,
  Mic,
  MicOff,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import { ImageAttachment } from '../types';
import { createSpeechRecognizer } from '../utils/speech';
import { SupportedLanguage, translations } from '../utils/i18n';

interface ChatInputProps {
  onSendMessage: (
    content: string,
    images: ImageAttachment[],
    options: { webSearch: boolean; reasoning: boolean }
  ) => void;
  onStopStreaming: () => void;
  isStreaming: boolean;
  onOpenVoiceMode: () => void;
  defaultReasoning?: boolean;
  isOffline?: boolean;
  isOfflineUnlocked?: boolean;
  language?: SupportedLanguage;
  onOpenSupport?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  onOpenVoiceMode,
  defaultReasoning = false,
  isOffline = false,
  language = 'fr',
}) => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [webSearch, setWebSearch] = useState(false);
  const [reasoning, setReasoning] = useState(defaultReasoning);
  const [isRecording, setIsRecording] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const t = translations[language] || translations.fr;

  useEffect(() => {
    setReasoning(defaultReasoning);
  }, [defaultReasoning]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) return;
    if (!input.trim() && images.length === 0) return;

    onSendMessage(input.trim(), images, { webSearch, reasoning });
    setInput('');
    setImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages((prev) => [
              ...prev,
              {
                data: event.target!.result as string,
                mimeType: file.type,
                name: file.name,
                size: file.size,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setInput((prev) => `${prev}\n\n[Fichier: ${file.name}]\n\`\`\`\n${content}\n\`\`\``);
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPlusMenuOpen(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        () => setIsRecording(false),
        (err) => {
          console.warn('Speech recognition error', err);
          setIsRecording(false);
        }
      );

      if (recognizer) {
        recognitionRef.current = recognizer;
        recognizer.start();
        setIsRecording(true);
      } else {
        alert("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      }
    }
  };

  const hasContent = input.trim().length > 0 || images.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4">
      {/* File Upload Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.txt,.js,.ts,.tsx,.jsx,.py,.html,.css,.json,.md"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Floating Pill Input Container matching the screenshot */}
      <div className="relative rounded-[28px] bg-[#212121] border border-white/10 shadow-xl transition-all focus-within:border-white/20">
        {/* Attached Images Preview */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
            {images.map((img, idx) => (
              <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-gray-700 bg-black/30">
                <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-white hover:bg-black transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Active feature tags (if Web Search or Reasoning enabled) */}
        {(webSearch || reasoning) && (
          <div className="flex items-center gap-2 px-4 pt-2.5">
            {webSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <Globe size={11} />
                <span>Web Search</span>
                <button onClick={() => setWebSearch(false)} className="hover:text-white ml-0.5">×</button>
              </span>
            )}
            {reasoning && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <Brain size={11} />
                <span>Raisonnement</span>
                <button onClick={() => setReasoning(false)} className="hover:text-white ml-0.5">×</button>
              </span>
            )}
          </div>
        )}

        {/* Input Bar: Plus on Left, Textarea Center, Mic & Blue Voice on Right */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 min-h-[52px]">
          {/* Plus button on the left */}
          <div className="relative shrink-0" ref={plusMenuRef}>
            <button
              onClick={() => setPlusMenuOpen(!plusMenuOpen)}
              className="w-9 h-9 rounded-full bg-[#2e2e2e] hover:bg-[#383838] text-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Ajouter des outils ou fichiers"
            >
              <Plus size={19} className={plusMenuOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
            </button>

            {/* Plus Tools Popup Menu */}
            {plusMenuOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-64 bg-[#23252d] border border-[#343844] rounded-2xl shadow-2xl p-2 z-30 space-y-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium text-gray-200 hover:bg-[#2d303b] transition-colors cursor-pointer"
                >
                  <Paperclip size={16} className="text-gray-400" />
                  <span>Ajouter une image ou un document</span>
                </button>
                <button
                  onClick={() => {
                    setWebSearch(!webSearch);
                    setPlusMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors cursor-pointer ${
                    webSearch ? 'bg-blue-500/20 text-blue-300' : 'text-gray-200 hover:bg-[#2d303b]'
                  }`}
                >
                  <Globe size={16} className={webSearch ? 'text-blue-400' : 'text-gray-400'} />
                  <span>Recherche Web en direct</span>
                  {webSearch && <span className="ml-auto text-[10px] text-blue-400 font-bold">Actif</span>}
                </button>
                <button
                  onClick={() => {
                    setReasoning(!reasoning);
                    setPlusMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors cursor-pointer ${
                    reasoning ? 'bg-purple-500/20 text-purple-300' : 'text-gray-200 hover:bg-[#2d303b]'
                  }`}
                >
                  <Brain size={16} className={reasoning ? 'text-purple-400' : 'text-gray-400'} />
                  <span>Raisonnement pas-à-pas</span>
                  {reasoning && <span className="ml-auto text-[10px] text-purple-400 font-bold">Actif</span>}
                </button>
              </div>
            )}
          </div>

          {/* Center Text Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isOffline
                ? t.inputOfflinePlaceholder
                : 'Répondre à Kaydo GPT'
            }
            rows={1}
            className="flex-1 px-3 py-2.5 text-[15px] bg-transparent text-gray-100 placeholder-gray-400 outline-none resize-none max-h-[160px] leading-relaxed self-center"
          />

          {/* Right Controls: Mic + Blue Wave Voice or Send/Stop */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isStreaming ? (
              <button
                onClick={onStopStreaming}
                className="w-9 h-9 rounded-full bg-[#2563eb] hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95"
                title="Arrêter la génération"
              >
                <Square size={13} fill="white" className="text-white" />
              </button>
            ) : hasContent ? (
              <button
                onClick={handleSubmit}
                className="w-9 h-9 rounded-full bg-[#2563eb] hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95"
                title="Envoyer le message"
              >
                <ArrowUp size={18} className="text-white" />
              </button>
            ) : (
              <>
                {/* Voice Dictation (Microphone) */}
                <button
                  onClick={toggleRecording}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-gray-300 hover:text-white hover:bg-[#272a33]'
                  }`}
                  title={isRecording ? 'Arrêter la dictée' : 'Dicter vocalement'}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={19} />}
                </button>

                {/* Blue ChatGPT-style Voice Button with Audio Bars */}
                <button
                  onClick={onOpenVoiceMode}
                  className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all cursor-pointer active:scale-95 shrink-0"
                  title="Ouvrir le Mode Vocal"
                >
                  <div className="flex items-center justify-center gap-[2.5px] h-4">
                    <span className="w-[2.5px] h-2.5 bg-white rounded-full animate-pulse" />
                    <span className="w-[2.5px] h-4 bg-white rounded-full" />
                    <span className="w-[2.5px] h-2.5 bg-white rounded-full animate-pulse" />
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
