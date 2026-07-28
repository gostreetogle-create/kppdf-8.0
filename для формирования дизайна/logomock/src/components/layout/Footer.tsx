import React from 'react';
import { ThemeMode } from '../../types';

interface FooterProps {
  themeMode: ThemeMode;
}

export const Footer: React.FC<FooterProps> = ({ themeMode }) => {
  return (
    <footer className="mt-auto bg-[var(--color-paper-2)] hairline-t py-4 text-xs text-[var(--color-muted)] font-mono transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-[var(--color-ink)]">
            КП PDF 8.0 Executive
          </span>
          <span className="text-[var(--color-rule)]">|</span>
          <span>
            Тема: <strong className="text-[var(--color-gold)] uppercase">{themeMode}</strong>
          </span>
          <span className="text-[var(--color-rule)]">|</span>
          <span>Дизайн-система: Paper &amp; Ink (OKLCH Slate &amp; Gold)</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
            100% Hairline 1px Grid
          </span>
          <span>WCAG AAA Contrast</span>
          <span>PDF Engine v8.4 Ready</span>
        </div>
      </div>
    </footer>
  );
};
