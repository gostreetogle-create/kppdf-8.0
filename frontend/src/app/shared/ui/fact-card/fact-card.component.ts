import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type PiFactCardVariant = 'default' | 'emphasis' | 'danger';

const VARIANT_CLASS: Record<PiFactCardVariant, string> = {
  default: 'bg-paper hairline',
  emphasis: 'bg-paper-2/50 hairline border-l-[3px] border-l-gold',
  danger: 'bg-destructive/5 hairline border-l-[3px] border-l-destructive',
};

/**
 * Compact fact atom: label · value · caption · optional actions.
 * Canon: docs/pages/ui-fact-card.md (TZ-UX-FACT-301).
 * Not for composition-tree rows.
 */
@Component({
  selector: 'app-pi-fact-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="rootClass()"
      [attr.data-test]="dataTest() || 'pi-fact-card'"
      [attr.data-variant]="variant()"
    >
      @if (label()) {
        <p class="eyebrow text-muted-foreground" data-test="pi-fact-card-label">
          {{ label() }}
        </p>
      }
      <p
        class="mt-1 text-base font-medium text-ink leading-snug"
        [class.font-mono]="mono()"
        [class.tabular-nums]="mono()"
        data-test="pi-fact-card-value"
      >
        {{ value() }}
      </p>
      @if (caption()) {
        <p
          class="mt-1 text-xs text-muted-foreground leading-snug line-clamp-2"
          data-test="pi-fact-card-caption"
        >
          {{ caption() }}
        </p>
      }
      <div class="mt-2 empty:hidden" data-test="pi-fact-card-actions">
        <ng-content select="[actions]" />
      </div>
    </div>
  `,
})
export class PiFactCardComponent {
  readonly label = input<string>('');
  readonly value = input.required<string>();
  readonly caption = input<string>('');
  /** Use tabular mono for money / counts. */
  readonly mono = input<boolean>(false);
  readonly variant = input<PiFactCardVariant>('default');
  readonly dataTest = input<string>('');

  protected readonly rootClass = computed(
    () => `rounded-sm px-3 py-2.5 ${VARIANT_CLASS[this.variant()]}`,
  );
}
