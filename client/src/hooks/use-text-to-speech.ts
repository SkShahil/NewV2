import { useState, useEffect } from 'react';

interface TextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export function useTextToSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if the browser supports speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      
      // Get available voices
      const getVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      
      // Some browsers load voices asynchronously, so we need to listen for the voiceschanged event
      window.speechSynthesis.addEventListener('voiceschanged', getVoices);
      getVoices();
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', getVoices);
      };
    }
  }, []);

  // Function to speak text
  const speak = (text: string, options: TextToSpeechOptions = {}) => {
    if (!supported) {
      console.warn('Text-to-speech is not supported in this browser');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Set voice if provided
    if (options.voice) {
      utterance.voice = options.voice;
    }
    
    // Event handlers
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    // Speak
    window.speechSynthesis.speak(utterance);
  };

  // Function to stop speaking
  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Filter voices by language
  const getVoicesByLang = (lang: string) => {
    return voices.filter(voice => voice.lang.startsWith(lang));
  };

  // Get the default voice for the user's language
  const getDefaultVoice = () => {
    if (voices.length === 0) return null;
    
    // Try to find a voice that matches the user's language
    const userLang = navigator.language || 'en-US';
    const langVoices = getVoicesByLang(userLang);
    
    // If we found voices for the user's language, return the first one
    if (langVoices.length > 0) {
      return langVoices[0];
    }
    
    // Otherwise, try to find an English voice
    const englishVoices = getVoicesByLang('en');
    if (englishVoices.length > 0) {
      return englishVoices[0];
    }
    
    // If all else fails, return the first voice
    return voices[0];
  };

  return {
    speak,
    stop,
    speaking,
    supported,
    voices,
    getVoicesByLang,
    getDefaultVoice
  };
}