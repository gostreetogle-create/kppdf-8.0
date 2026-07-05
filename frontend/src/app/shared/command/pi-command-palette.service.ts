import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

/**
 * PiCommandPaletteService — TZ-75.
 *
 * Singleton state for the ⌘K command palette overlay. Listens for
 * global keyboard shortcuts:
 *   - Cmd+K (mac) / Ctrl+K (win/linux): toggle
 *   - Esc (when open): close
 *
 * SSR-safe: keyboard listener only attached in browser.
 */
@Injectable({ providedIn: 'root' })
export class PiCommandPaletteService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  constructor() {
    if (!this.isBrowser) return;
    this.doc.addEventListener('keydown', (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const isEscape = e.key === 'Escape';
      if (isModK) {
        e.preventDefault();
        this.toggle();
      } else if (isEscape && this._isOpen()) {
        this.close();
      }
    });
  }

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }

  toggle(): void {
    this._isOpen.update((v) => !v);
  }
}
