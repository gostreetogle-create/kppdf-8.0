import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
  effect,
} from '@angular/core';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  group?: string;
  action: () => void;
}

/**
 * Command palette (TZ-33) — Cmd+K / Ctrl+K to open.
 * Usage:
 *   <hlm-command-palette
 *     [items]="items()"
 *     (selected)="onPick($event)"
 *   />
 */
@Component({
  selector: 'hlm-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
        (click)="close()"
        role="presentation"
      ></div>
      <div
        class="fixed left-1/2 top-1/4 z-50 w-full max-w-lg -translate-x-1/2 rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div class="flex items-center gap-2 border-b border-border px-3">
          <span class="lucide-search h-4 w-4 text-muted-foreground" aria-hidden="true"></span>
          <input
            #input
            type="text"
            placeholder="Type a command or search..."
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKey($event)"
            class="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            autocomplete="off"
          />
          <kbd class="rounded border border-border bg-muted px-1.5 text-[10px] font-mono">esc</kbd>
        </div>
        <div class="max-h-80 overflow-y-auto p-2">
          @for (g of grouped(); track g.group) {
            <div class="mb-2">
              <div class="px-2 py-1 text-xs font-medium text-muted-foreground">{{ g.group || 'Commands' }}</div>
              @for (item of g.items; track item.id; let i = $index) {
                <button
                  type="button"
                  [class]="itemClass(i)"
                  (click)="select(item)"
                  (mouseenter)="active.set(i)"
                >
                  @if (item.icon) {
                    <span class="lucide-{{ item.icon }} h-4 w-4 text-muted-foreground" aria-hidden="true"></span>
                  }
                  <span class="flex-1 truncate text-left">{{ item.label }}</span>
                  @if (item.shortcut) {
                    <span class="ml-2 text-xs text-muted-foreground font-mono">{{ item.shortcut }}</span>
                  }
                </button>
              }
            </div>
          } @empty {
            <div class="py-6 text-center text-sm text-muted-foreground">No results</div>
          }
        </div>
        <div class="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>{{ filtered().length }} results</span>
          <span class="flex items-center gap-2">
            <kbd class="rounded border border-border bg-muted px-1.5 font-mono">↑↓</kbd> navigate
            <kbd class="rounded border border-border bg-muted px-1.5 font-mono">↵</kbd> select
          </span>
        </div>
      </div>
    }
  `,
})
export class CommandPaletteComponent {
  readonly items = input.required<CommandItem[]>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly selected = output<CommandItem>();

  protected readonly open = signal<boolean>(false);
  protected readonly query = signal<string>('');
  protected readonly active = signal<number>(0);

  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.items();
    return this.items().filter(
      (i) =>
        i.label.toLowerCase().includes(q) || (i.description?.toLowerCase().includes(q) ?? false) || (i.group?.toLowerCase().includes(q) ?? false),
    );
  });

  protected readonly grouped = computed(() => {
    const items = this.filtered();
    const map = new Map<string, CommandItem[]>();
    for (const item of items) {
      const g = item.group ?? '';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        // Focus after render
        setTimeout(() => this.input()?.nativeElement.focus(), 0);
      }
    });
  }

  show(): void {
    this.query.set('');
    this.active.set(0);
    this.open.set(true);
    this.opened.emit();
  }

  protected close(): void {
    this.open.set(false);
    this.closed.emit();
  }

  protected select(item: CommandItem): void {
    this.close();
    this.selected.emit(item);
    item.action();
  }

  protected onInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
    this.active.set(0);
  }

  protected onKey(e: KeyboardEvent): void {
    const items = this.filtered();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.active.update((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.active.update((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = items[this.active()];
      if (opt) this.select(opt);
    } else if (e.key === 'Escape') {
      this.close();
    }
  }

  protected itemClass(i: number): string {
    const isActive = i === this.active();
    return [
      'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors',
      isActive ? 'bg-accent text-accent-foreground' : 'text-foreground/80 hover:bg-accent/50',
    ].join(' ');
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKey(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (this.open()) this.close();
      else this.show();
    }
  }
}
