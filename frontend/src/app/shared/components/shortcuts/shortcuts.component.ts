import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';

export interface Shortcut {
  keys: string[];
  description: string;
  group?: string;
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Open command palette', group: 'Global' },
  { keys: ['?'], description: 'Show keyboard shortcuts', group: 'Global' },
  { keys: ['Esc'], description: 'Close dialog / sheet', group: 'Global' },
  { keys: ['G', 'D'], description: 'Go to dashboard', group: 'Navigation' },
  { keys: ['G', 'P'], description: 'Go to products', group: 'Navigation' },
  { keys: ['G', 'O'], description: 'Go to orders', group: 'Navigation' },
  { keys: ['N'], description: 'New (context-dependent)', group: 'Actions' },
  { keys: ['/'], description: 'Focus search', group: 'Actions' },
];

@Component({
  selector: 'hlm-shortcuts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
        (click)="close()"
        role="presentation"
      ></div>
      <div
        class="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <div class="flex items-center justify-between border-b border-border pb-3">
          <h2 class="text-lg font-semibold">Keyboard shortcuts</h2>
          <button type="button" class="rounded-sm p-1 hover:bg-accent" (click)="close()" aria-label="Close">
            <span class="lucide-x h-4 w-4"></span>
          </button>
        </div>
        <div class="mt-4 max-h-96 overflow-y-auto">
          @for (g of grouped(); track g.group) {
            <div class="mb-4">
              <div class="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{{ g.group }}</div>
              <div class="space-y-2">
                @for (s of g.items; track s.description) {
                  <div class="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50">
                    <span class="text-sm">{{ s.description }}</span>
                    <span class="flex items-center gap-1">
                      @for (k of s.keys; track k) {
                        <kbd class="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border bg-muted px-1.5 text-xs font-mono">{{ k }}</kbd>
                        @if (!$last) {
                          <span class="text-muted-foreground">+</span>
                        }
                      }
                    </span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ShortcutsComponent {
  readonly shortcuts = signal<Shortcut[]>(DEFAULT_SHORTCUTS);
  protected readonly open = signal<boolean>(false);

  protected readonly grouped = () => {
    const items = this.shortcuts();
    const map = new Map<string, Shortcut[]>();
    for (const s of items) {
      const g = s.group ?? 'Other';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(s);
    }
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
  };

  show(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === '?' && (e.shiftKey || true)) {
      e.preventDefault();
      this.open() ? this.close() : this.show();
    }
  }
}
