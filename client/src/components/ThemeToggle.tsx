import React from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function ThemeToggle() {
  const { theme, setTheme } = useNextTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 hover:from-purple-500 hover:to-blue-600 dark:from-indigo-600 dark:to-purple-800"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="space-y-3">
          <h4 className="font-medium text-center leading-none tracking-tight">
            Choose a theme
          </h4>
          <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value)} className="flex justify-between">
            <ToggleGroupItem 
              value="light" 
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 w-full data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              aria-label="Light mode"
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs">Light</span>
              {theme === 'light' && <Check className="h-3.5 w-3.5 absolute top-1 right-1" />}
            </ToggleGroupItem>
            
            <ToggleGroupItem 
              value="dark" 
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 w-full data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              aria-label="Dark mode"
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs">Dark</span>
              {theme === 'dark' && <Check className="h-3.5 w-3.5 absolute top-1 right-1" />}
            </ToggleGroupItem>
            
            <ToggleGroupItem 
              value="system" 
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 w-full data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              aria-label="System preference"
            >
              <Monitor className="h-5 w-5" />
              <span className="text-xs">System</span>
              {theme === 'system' && <Check className="h-3.5 w-3.5 absolute top-1 right-1" />}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}