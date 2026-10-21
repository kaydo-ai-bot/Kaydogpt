// Speech Synthesis & Recognition utility for Kaydo GPT

let currentAudio: HTMLAudioElement | null = null;

export async function playTextToSpeech(
  text: string,
  voiceName: string = 'Kore',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<() => void> {
  // Stop existing playback
  stopAudioPlayback();

  try {
    onStart?.();

    // Clean text for speech (remove markdown symbols)
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~\[\]]/g, '')
      .trim();

    // Call server Gemini TTS endpoint
    const response = await fetch('/api/speech/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText.slice(0, 1000), voice: voiceName }),
    });

    const data = await response.json();

    if (data.success && data.audioBase64) {
      const audioUrl = `data:audio/mp3;base64,${data.audioBase64}`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onended = () => {
        currentAudio = null;
        onEnd?.();
      };
      audio.onerror = (e) => {
        currentAudio = null;
        onError?.(e);
      };

      await audio.play();
      return () => {
        audio.pause();
        currentAudio = null;
        onEnd?.();
      };
    } else {
      // Browser SpeechSynthesis fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 500));
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        utterance.onend = () => onEnd?.();
        utterance.onerror = (e) => onError?.(e);

        window.speechSynthesis.speak(utterance);
        return () => {
          window.speechSynthesis.cancel();
          onEnd?.();
        };
      }
      onEnd?.();
      return () => {};
    }
  } catch (err) {
    console.warn('TTS playback fallback error:', err);
    // Browser speech fallback
    if ('speechSynthesis' in window) {
      const cleanText = text.replace(/[*#`_\[\]]/g, '').slice(0, 300);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => onEnd?.();
      window.speechSynthesis.speak(utterance);
    } else {
      onEnd?.();
    }
    return () => {
      window.speechSynthesis?.cancel();
      onEnd?.();
    };
  }
}

export function stopAudioPlayback(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Browser SpeechRecognition helper
export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onEnd: () => void,
  onError: (err: any) => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = navigator.language || 'fr-FR';

  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
