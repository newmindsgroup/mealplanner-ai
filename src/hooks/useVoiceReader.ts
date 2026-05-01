import { useState, useRef, useEffect } from 'react';

interface VoiceReaderOptions {
  autoRead?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useVoiceReader(options: VoiceReaderOptions = {}) {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const cleanText = (text: string): string => {
    // Remove markdown, emojis, and special characters
    return text
      .replace(/\*\*/g, '') // Bold
      .replace(/\*/g, '') // Italic
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
      .replace(/`([^`]+)`/g, '$1') // Code
      .replace(/[^\w\s.,!?;:()\-'"]/g, ' ') // Remove special chars but keep punctuation
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .trim();
  };

  const read = (text: string, onComplete?: () => void) => {
    if (!synthRef.current || !text.trim()) return;

    // Stop any current reading
    stop();

    const clean = cleanText(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume ?? 1.0;

    utterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const pause = () => {
    if (synthRef.current && isReading) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsReading(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    read,
    pause,
    resume,
    stop,
    isReading,
    isPaused,
  };
}

