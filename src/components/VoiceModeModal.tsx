import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  PhoneOff,
  Radio,
  Settings,
} from 'lucide-react';
import { createSpeechRecognizer, playTextToSpeech, stopAudioPlayback } from '../utils/speech';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceMessage: (text: string) => Promise<string>;
  speechVoice: string;
  onSelectVoice: (voice: any) => void;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  onSendVoiceMessage,
  speechVoice,
  onSelectVoice,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');

  const recognizerRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    if (isOpen) {
      startListening();
    }
    return () => {
      isComponentMounted.current = false;
      stopAudioPlayback();
      recognizerRef.current?.stop();
    };
  }, [isOpen]);

  const startListening = () => {
    if (!isComponentMounted.current) return;
    setStatus('listening');
    setTranscript('');

    const recognizer = createSpeechRecognizer(
      (text) => {
        setTranscript(text);
      },
      async () => {
        // Recognition ended, send text if any
        if (transcript.trim()) {
          await handleProcessVoice(transcript.trim());
        } else {
          // Restart listening after brief pause
          setTimeout(() => {
            if (isOpen && isComponentMounted.current && !isMuted) {
              startListening();
            }
          }, 600);
        }
      },
      (err) => {
        console.warn('Voice recognition error:', err);
        setTimeout(() => {
          if (isOpen && isComponentMounted.current) {
            startListening();
          }
        }, 1000);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleProcessVoice = async (userText: string) => {
    setStatus('thinking');
    try {
      const responseText = await onSendVoiceMessage(userText);
      setLastResponse(responseText);
      setStatus('speaking');

      await playTextToSpeech(
        responseText,
        speechVoice,
        () => setStatus('speaking'),
        () => {
          setStatus('listening');
          setTranscript('');
          setTimeout(startListening, 500);
        },
        () => {
          setStatus('listening');
          setTimeout(startListening, 500);
        }
      );
    } catch (err) {
      console.error(err);
      setStatus('listening');
      startListening();
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
    } else {
      setIsMuted(true);
      recognizerRef.current?.stop();
      stopAudioPlayback();
      setStatus('listening');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] text-white flex flex-col items-center justify-between p-6 select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
          <span className="font-semibold text-sm tracking-wide text-gray-300">
            Mode Vocal Avancé Kaydo GPT
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Voice Selector */}
          <select
            value={speechVoice}
            onChange={(e) => onSelectVoice(e.target.value)}
            className="bg-[#242424] text-xs text-gray-300 border border-[#3d3d3d] rounded-xl px-2.5 py-1.5 outline-none"
          >
            <option value="Kore">Voix Kore</option>
            <option value="Zephyr">Voix Zephyr</option>
            <option value="Puck">Voix Puck</option>
            <option value="Fenrir">Voix Fenrir</option>
            <option value="Charon">Voix Charon</option>
          </select>

          <button
            onClick={() => {
              stopAudioPlayback();
              onClose();
            }}
            className="p-2 rounded-full bg-[#242424] hover:bg-[#333333] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Center Animated Voice Orb */}
      <div className="flex flex-col items-center justify-center my-auto relative">
        {/* Ambient Glows */}
        <div
          className={`absolute w-72 h-72 rounded-full transition-all duration-700 filter blur-3xl opacity-40 ${
            status === 'speaking'
              ? 'bg-emerald-500 scale-125'
              : status === 'thinking'
              ? 'bg-purple-500 scale-110'
              : 'bg-blue-500 scale-100'
          }`}
        />

        {/* Pulsing Core Sphere */}
        <div
          className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border border-white/20 ${
            status === 'speaking'
              ? 'bg-linear-to-tr from-emerald-400 via-teal-300 to-cyan-500 scale-105 animate-pulse'
              : status === 'thinking'
              ? 'bg-linear-to-tr from-purple-500 via-indigo-400 to-pink-400 animate-spin duration-3000'
              : 'bg-linear-to-tr from-blue-600 via-indigo-500 to-sky-400 animate-pulse'
          }`}
        >
          {/* Inner Light Ring */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Radio
              size={36}
              className={`text-white transition-transform ${
                status === 'speaking' ? 'scale-125' : ''
              }`}
            />
          </div>
        </div>

        {/* State Label */}
        <div className="mt-8 text-center">
          <span className="text-lg font-medium tracking-wide text-gray-200">
            {status === 'speaking'
              ? 'Kaydo GPT parle...'
              : status === 'thinking'
              ? 'Réflexion en cours...'
              : isMuted
              ? 'Micro désactivé'
              : 'À vous de parler...'}
          </span>
          {transcript && (
            <p className="mt-3 text-sm text-gray-400 max-w-md italic px-4">
              "{transcript}"
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-md flex items-center justify-center gap-6 mb-4">
        {/* Mute Button */}
        <button
          onClick={handleToggleMute}
          className={`p-4 rounded-full transition-all ${
            isMuted
              ? 'bg-rose-600 text-white'
              : 'bg-[#2a2a2a] hover:bg-[#383838] text-gray-200'
          }`}
          title={isMuted ? 'Activer le micro' : 'Couper le micro'}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* End Call button */}
        <button
          onClick={() => {
            stopAudioPlayback();
            onClose();
          }}
          className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-transform hover:scale-105"
          title="Terminer l'appel"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
};
