import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
  destructive?: boolean;
}

/**
 * Context menu (TZ-38) — right-click trigger.
 * Usage:
 *   <hlm-context-menu [items]="items" (selected)="onPick($event)">
 *     <div class="...">Right-click here</div>
 *   </hlm-context-menu>
 */
@Component({
  selector: 'hlm-context-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content></ng-content>
    @if (open()) {
      <ul
        class="fixed z-50 min-w-44 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-scale-in"
        [style.top.px]="position().y"
        [style.left.px]="position().x"
        role="menu"
        (click)="$event.stopPropagation()"
      >
        @for (i of items(); track i.id) {
          @if (i.divider) {
            <li class="my-1 h-px bg-border" role="separator"></li>
          } @else {
            <li
              role="menuitem"
              [class]="itemClass(i)"
              (click)="pick(i)"
            >
              @if (i.icon) {
                <span class="lucide-{{ i.icon }} h-4 w-4" aria-hidden="true"></span>
              }
              <span class="flex-1">{{ i.label }}</span>
              @if (i.shortcut) {
                <span class="ml-2 text-xs text-muted-foreground font-mono">{{ i.shortcut }}</span>
              }
            </li>
          }
        }
      </ul>
    }
  `,
})
export class ContextMenuComponent {
  readonly items = input.required<ContextMenuItem[]>();
  readonly selected = output<ContextMenuItem>();

  protected readonly open = signal(false);
  protected readonly position = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  private readonly host = inject(ElementRef<HTMLElement>);

  @HostListener('contextmenu', ['$event'])
  onContext(e: MouseEvent): void {
    e.preventDefault();
    this.position.set({ x: e.clientX, y: e.clientY });
    this.open.set(true);
  }

  @HostListener('document:click')
  @HostListener('document:contextmenu')
  onDoc(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.open.set(false);
  }

  protected itemClass(i: ContextMenuItem): string {
    return [
      'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      i.destructive ? 'text-destructive hover:text-destructive' : '',
      i.disabled ? 'pointer-events-none opacity-50' : '',
    ].join(' ');
  }

  protected pick(i: ContextMenuItem): void {
    if (i.disabled || i.divider) return;
    this.open.set(false);
    this.selected.emit(i);
  }
}
