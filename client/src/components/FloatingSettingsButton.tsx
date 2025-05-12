import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Settings, X, Volume2, VolumeX, Sun, Moon, Tv, Eye, Text } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const FloatingSettingsButton: React.FC = () => {
  const { 
    textToSpeech, setTextToSpeech, 
    theme, setTheme, 
    highContrast, setHighContrast, 
    largeText, setLargeText 
  } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const ToggleButton = ({ label, engaged, onToggle, icon }: { label: string, engaged: boolean, onToggle: () => void, icon: React.ReactNode }) => (
    <div className="flex items-center justify-between py-2">
      <Label htmlFor={`toggle-${label.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </Label>
      <Button 
        id={`toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
        variant={engaged ? 'default' : 'outline'} 
        size="sm" 
        onClick={onToggle}
        className="w-20"
      >
        {engaged ? 'On' : 'Off'}
      </Button>
    </div>
  );

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: <Sun className="h-5 w-5" /> },
    { value: 'dark' as const, label: 'Dark', icon: <Moon className="h-5 w-5" /> },
    { value: 'system' as const, label: 'System', icon: <Tv className="h-5 w-5" /> },
  ];

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-[100] bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all hover:scale-110"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open accessibility settings"
      >
        <Settings className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-[99] bg-card text-card-foreground rounded-lg shadow-xl p-6 w-80 flex flex-col gap-3 border border-border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Accessibility Options</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close settings">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ToggleButton 
            label="Text-to-Speech"
            engaged={textToSpeech}
            onToggle={() => setTextToSpeech(!textToSpeech)}
            icon={<Volume2 className="h-5 w-5 text-muted-foreground" />}
          />
          <p className="text-xs text-muted-foreground -mt-2 ml-7">Press F + J to toggle text-to-speech on/off</p>

          <ToggleButton 
            label="High Contrast Mode"
            engaged={highContrast}
            onToggle={() => setHighContrast(!highContrast)}
            icon={<Eye className="h-5 w-5 text-muted-foreground" />}
          />

          <ToggleButton 
            label="Large Text"
            engaged={largeText}
            onToggle={() => setLargeText(!largeText)}
            icon={<Text className="h-5 w-5 text-muted-foreground" />}
          />
          
          <div className="border-t border-border my-2"></div>

          <div>
            <Label className="font-medium mb-2 block">Theme</Label>
            <div className="flex gap-2">
              {themeOptions.map(option => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? 'default' : 'outline'}
                  onClick={() => setTheme(option.value)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 h-auto text-xs sm:text-sm"
                  aria-pressed={theme === option.value}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-border my-2"></div>

          <div>
            <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex justify-between"><span>Toggle Text-to-Speech:</span> <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">F + J</kbd></li>
              <li className="flex justify-between"><span>Navigate elements:</span> <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">Tab</kbd></li>
              <li className="flex justify-between"><span>Activate buttons/controls:</span> <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">Enter / Space</kbd></li>
              <li className="flex justify-between"><span>Close dialogs/menus:</span> <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">Esc</kbd></li>
            </ul>
          </div>

        </div>
      )}
    </>
  );
};

export default FloatingSettingsButton; 