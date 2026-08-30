import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  LucideAngularModule,
  Plus,
  Pencil,
  Copy,
  Archive,
  Layers,
  Check,
  X,
  Power,
} from 'lucide-angular';
import type { RegistryRowAction, RegistryRow, RegistryRowActionIcon } from './model/registry.types';
import {
  registryActionToneClass,
  resolveRegistryActionIcon,
  resolveRegistryActionTone,
} from './registry-action-icons';

const ICON_MAP: Record<RegistryRowActionIcon, typeof Plus> = {
  plus: Plus,
  pencil: Pencil,
  copy: Copy,
  archive: Archive,
  layers: Layers,
  check: Check,
  x: X,
  power: Power,
};

/**
 * TZ-NX-REGISTRIES-FULL-CLOSEOUT — icon-only registry row action using Lucide +
 * semantic Paper & Ink `.pi-icon-btn-*` tokens (app-layer, not libs/ui).
 */
@Component({
  selector: 'pi-registry-row-action-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <button
      type="button"
      [class]="buttonClass()"
      [attr.aria-label]="accessibleName()"
      [attr.title]="tooltip()"
      [attr.data-test]="dataTest()"
      [disabled]="disabled()"
      (click)="actionClick.emit()"
    >
      <lucide-angular [img]="iconImg()" [size]="14" aria-hidden="true" />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .registry-icon-btn-success {
        color: var(--color-success);
        border-color: color-mix(in oklch, var(--color-success) 45%, var(--color-rule));
        --pi-btn-hover-bg: color-mix(in oklch, var(--color-success) 14%, var(--color-paper));
        --pi-btn-hover-fg: var(--color-success);
        --pi-btn-hover-border: var(--color-success);
      }
      .registry-icon-btn-accent {
        color: var(--color-gold-deep);
        border-color: color-mix(in oklch, var(--color-gold-deep) 50%, var(--color-rule));
        background-color: color-mix(in oklch, var(--color-gold) 12%, var(--color-paper-raised));
        --pi-btn-hover-bg: color-mix(in oklch, var(--color-gold) 22%, var(--color-paper));
        --pi-btn-hover-fg: var(--color-gold-deep);
        --pi-btn-hover-border: var(--color-gold-deep);
      }
      button:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    `,
  ],
})
export class RegistryRowActionButtonComponent {
  readonly action = input.required<RegistryRowAction<RegistryRow>>();
  readonly disabled = input(false);
  readonly disabledReason = input<string | null>(null);

  readonly actionClick = output<void>();

  protected readonly resolvedIcon = computed(() =>
    resolveRegistryActionIcon(this.action().id, this.action().icon),
  );

  protected readonly buttonClass = computed(() =>
    registryActionToneClass(
      resolveRegistryActionTone(this.action().id, this.resolvedIcon(), {
        destructive: this.action().destructive,
        tone: this.action().tone,
      }),
    ),
  );

  protected readonly iconImg = computed(() => ICON_MAP[this.resolvedIcon()]);

  protected readonly accessibleName = computed(
    () => this.action().ariaLabel ?? this.action().label,
  );

  protected readonly tooltip = computed(() => this.disabledReason() ?? this.accessibleName());

  protected readonly dataTest = computed(() => `registry-row-action-${this.action().id}`);
}
