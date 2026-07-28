import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../../types';

interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ mode, onToggle }) => {
  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono font-medium rounded hairline bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
      title={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      aria-label="Переключить тему"
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-[var(--color-gold)]" />
          <span className="hidden sm:inline">СВЕТЛАЯ</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-[var(--color-muted)]" />
          <span className="hidden sm:inline">ТЁМНАЯ</span>
        </>
      )}
    </button>
  );
};
