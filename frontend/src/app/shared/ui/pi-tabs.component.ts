import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  inject,
} from '@angular/core';

/**
 * Paper & Ink Tabs container — role="tablist" with horizontal/vertical orientation.
 * Active tab styling via aria-selected (handled in TabComponent).
 * Roving tabindex + ↑/↓/←/→ keyboard nav via (keydown).
 */
@Component({
  selector: 'app-pi-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="tablist"
      [attr.aria-orientation]="orientation()"
      [attr.aria-label]="ariaLabel()"
      [class]="listClass()"
      (keydown)="onKeydown($event)"
    >
      <ng-content />
    </div>
  `,
  host: {
    class: 'block',
  },
})
export class TabsComponent {
  readonly value = input<string>('');
  readonly ariaLabel = input<string>('Вкладки');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  readonly valueChange = output<string>();

  private readonly hostEl = inject(ElementRef<HTMLElement>);

  listClass(): string {
    return this.orientation() === 'horizontal'
      ? 'flex hairline-b'
      : 'flex flex-col hairline-r w-fit';
  }

  onKeydown(event: KeyboardEvent): void {
    const root = this.hostEl.nativeElement;
    const tabs = Array.from(
      root.querySelectorAll('button[role="tab"]:not([disabled])'),
    ) as HTMLButtonElement[];
    if (tabs.length === 0) return;

    const activeIdx = tabs.findIndex((t) => t === root.ownerDocument?.activeElement);
    const currentIdx = activeIdx >= 0 ? activeIdx : 0;
    // eslint-disable-next-line no-useless-assignment
    let nextIdx = currentIdx;
    const arrowNext = this.orientation() === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const arrowPrev = this.orientation() === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

    if (event.key === arrowNext) {
      nextIdx = (currentIdx + 1) % tabs.length;
    } else if (event.key === arrowPrev) {
      nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
    } else {
      return;
    }

    event.preventDefault();
    tabs[nextIdx].focus();
  }
}
