import { useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, type LanguageCode } from './translations';

export function useVoice() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentText('');
    }
  }, []);

  const speak = useCallback((text: string, langCode: LanguageCode = 'en') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported');
      return;
    }
    stop();

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    const speechCode = langObj ? langObj.speechCode : 'en-US';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechCode;
    utterance.rate = speed;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(speechCode.slice(0, 2)) || v.lang === speechCode
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentText(text);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentText('');
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentText('');
    };

    window.speechSynthesis.speak(utterance);
  }, [speed, stop]);

  // Speech to Text (Browser Web Speech API)
  const startListening = useCallback((langCode: LanguageCode = 'hi', onResult?: (res: string) => void) => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      recognition.lang = langObj ? langObj.speechCode : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        if (onResult) onResult(spoken);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    currentText,
    speed,
    setSpeed,
    isListening,
    transcript,
    startListening,
  };
}
