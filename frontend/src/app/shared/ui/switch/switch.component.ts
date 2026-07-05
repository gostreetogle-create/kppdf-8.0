import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

export type SwitchSize = 'sm' | 'md';

/**
 * Switch — toggle primitive for Paper & Ink.
 * Renders `<button role="switch">` with hairline track and translate-on thumb.
 * Two-way model for `checked`. Standalone, OnPush.
 */
@Component({
  selector: 'app-pi-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-disabled]="disabled()"
      [disabled]="disabled()"
      [class]="computedClass()"
      (click)="onToggle()"
    >
      <span class="switch-thumb" aria-hidden="true"></span>
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }
    .switch-track {
      position: relative;
      display: inline-block;
      border: 1px solid var(--color-rule);
      background: var(--color-paper);
      transition: background-color 150ms ease;
    }
    .switch-track.is-on { background: var(--color-ink); border-color: var(--color-ink); }
    .switch-track.is-disabled { opacity: 0.5; cursor: not-allowed; }
    .switch-track:not(.is-disabled) { cursor: pointer; }
    .switch-thumb {
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      background: var(--color-ink);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 150ms ease;
    }
    .switch-track.is-on .switch-thumb { background: var(--color-paper); transform: translate(16px, -50%); }
  `],
})
export class SwitchComponent {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly size = input<SwitchSize>('md');
  readonly ariaLabel = input<string | null>(null);

  readonly checkedChange = output<boolean>();

  readonly computedClass = computed(() => {
    const isMd = this.size() === 'md';
    const sizeCls = isMd ? 'w-9 h-5 rounded-sm' : 'w-7 h-4 rounded-sm';
    return [
      'switch-track',
      isMd ? '' : 'is-sm',
      this.checked() ? 'is-on' : '',
      this.disabled() ? 'is-disabled' : '',
      sizeCls,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
    ].filter(Boolean).join(' ');
  });

  onToggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.checkedChange.emit(next);
  }
}
