import { useState, useEffect, useCallback, useRef } from 'react';

interface TextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
  onEnd?: () => void;
}

export function useTextToSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const onEndRef = useRef<(() => void) | null>(null);
  
  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      // Get list of available voices
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);
  
  // Handle speech ending
  useEffect(() => {
    const handleSpeechEnd = () => {
      setSpeaking(false);
      if (onEndRef.current) {
        onEndRef.current();
        onEndRef.current = null;
      }
    };
    
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('end', handleSpeechEnd);
      
      return () => {
        window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
      };
    }
  }, []);
  
  // Get the preferred voice based on browser language
  const getPreferredVoice = useCallback(() => {
    if (voices.length === 0) return null;
    
    // Try to find a voice that matches browser language
    const browserLanguage = navigator.language || 'en-US';
    let preferredVoice = voices.find(
      voice => voice.lang === browserLanguage && voice.localService
    );
    
    // Fall back to any voice in the browser language
    if (!preferredVoice) {
      preferredVoice = voices.find(
        voice => voice.lang.startsWith(browserLanguage.split('-')[0])
      );
    }
    
    // Final fallback to any English voice
    if (!preferredVoice) {
      preferredVoice = voices.find(
        voice => voice.lang.startsWith('en')
      );
    }
    
    // Ultimate fallback to first available voice
    return preferredVoice || voices[0];
  }, [voices]);
  
  const speak = useCallback((text: string, options: TextToSpeechOptions = {}) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    // Cancel any ongoing speech
    stop();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    
    // Set voice
    const voice = options.voice || getPreferredVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    // Store onEnd callback in ref for the effect
    if (options.onEnd) {
      onEndRef.current = options.onEnd;
    }
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    
    return utterance;
  }, [getPreferredVoice]);
  
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      
      if (onEndRef.current) {
        onEndRef.current = null;
      }
    }
  }, []);
  
  const pause = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }, []);
  
  const resume = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }, []);
  
  return {
    speak,
    stop,
    pause,
    resume,
    voices,
    speaking,
    supported: !!window.speechSynthesis
  };
}