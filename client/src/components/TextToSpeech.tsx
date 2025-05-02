import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VolumeIcon, VolumeXIcon } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface TextToSpeechProps {
  text: string;
  className?: string;
  compact?: boolean;
}

export function TextToSpeech({ text, className = '', compact = false }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speak, stop, speaking } = useTextToSpeech();
  
  const toggleSpeech = () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
    } else {
      speak(text, {
        rate: 0.9,  // Slightly slower rate for better clarity
        onEnd: () => setIsSpeaking(false)
      });
      setIsSpeaking(true);
    }
  };
  
  // Update state if speech is stopped externally
  React.useEffect(() => {
    if (!speaking && isSpeaking) {
      setIsSpeaking(false);
    }
  }, [speaking, isSpeaking]);
  
  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 rounded-full ${className}`}
        onClick={toggleSpeech}
        aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
        title={isSpeaking ? "Stop speaking" : "Read aloud"}
      >
        {isSpeaking ? (
          <VolumeXIcon className="h-4 w-4" />
        ) : (
          <VolumeIcon className="h-4 w-4" />
        )}
      </Button>
    );
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
      onClick={toggleSpeech}
      aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
    >
      {isSpeaking ? (
        <>
          <VolumeXIcon className="h-4 w-4" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <VolumeIcon className="h-4 w-4" />
          <span>Read Aloud</span>
        </>
      )}
    </Button>
  );
}