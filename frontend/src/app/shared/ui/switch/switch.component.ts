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
      [attr.id]="id() ?? null"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-disabled]="disabled()"
      [disabled]="disabled()"
      [class]="computedClass()"
      [style.--switch-thumb-offset]="thumbOffset()"
      (click)="onToggle()"
    >
      <span class="switch-thumb" aria-hidden="true"></span>
    </button>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; justify-content: center; min-height: 32px; min-width: 32px; }
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
    .switch-track.is-on .switch-thumb { background: var(--color-paper); transform: translate(var(--switch-thumb-offset, 16px), -50%); }
  `],
})
export class SwitchComponent {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly size = input<SwitchSize>('md');
  readonly ariaLabel = input<string | null>(null);
  /**
   * TZ-104.2 — DOM id forwarded to the inner `<button role="switch">`
   * so e2e selectors like `[id]="switch-' + row._id"` target an exact
   * switch per row, and `<label htmlFor>` linkage from form wrappers
   * focuses the correct switch. Mirrors pi-textarea id pattern from
   * commit a2d1e84.
   */
  readonly id = input<string | null>(null);

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
      'pi-focus-ring',
    ].filter(Boolean).join(' ');
  });

  readonly thumbOffset = computed(() => this.size() === 'md' ? '16px' : '12px');

  onToggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.checkedChange.emit(next);
  }
}
