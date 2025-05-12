import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface SettingsContextType {
  textToSpeech: boolean;
  setTextToSpeech: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  theme: Theme;
  setTheme: (val: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textToSpeech, setTextToSpeech] = useState<boolean>(() => {
    const stored = localStorage.getItem('textToSpeech');
    return stored ? stored === 'true' : false;
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const stored = localStorage.getItem('highContrast');
    return stored ? stored === 'true' : false;
  });
  const [largeText, setLargeText] = useState<boolean>(() => {
    const stored = localStorage.getItem('largeText');
    return stored ? stored === 'true' : false;
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored || 'system'; // Default to 'system'
  });

  useEffect(() => {
    localStorage.setItem('textToSpeech', String(textToSpeech));
  }, [textToSpeech]);

  useEffect(() => {
    localStorage.setItem('highContrast', String(highContrast));
    document.body.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('largeText', String(largeText));
    document.body.classList.toggle('large-text', largeText);
  }, [largeText]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemPrefersDark);
      document.body.classList.toggle('dark', systemPrefersDark);
      document.body.classList.toggle('light', !systemPrefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.body.classList.toggle('dark', theme === 'dark');
      document.body.classList.toggle('light', theme === 'light');
    }
  }, [theme]);

  // Listener for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
        document.body.classList.toggle('dark', mediaQuery.matches);
        document.body.classList.toggle('light', !mediaQuery.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]); // Rerun if theme changes to/from system


  return (
    <SettingsContext.Provider value={{
      textToSpeech, setTextToSpeech,
      highContrast, setHighContrast,
      largeText, setLargeText,
      theme, setTheme
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}; 