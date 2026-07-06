import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Paper & Ink AccordionItem — single print-style accordion row.
 * Header: index ('01') + title + meta + chevron. Hairline-b between items.
 */
@Component({
  selector: 'app-pi-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="border-b hairline border-rule">
      <button
        type="button"
        [attr.aria-expanded]="expanded()"
        [disabled]="disabled()"
        (click)="expandedChange.emit(!expanded())"
        class="w-full text-left flex items-center justify-between gap-4 min-h-touch py-control-y px-control-x hover:bg-paper-2 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        <div class="flex items-baseline gap-3">
          @if (index()) {
            <span class="font-display text-sm tracking-tight min-w-[2.5rem] text-ink">{{ index() }}</span>
          }
          <span class="font-display text-lg tracking-tight text-ink">{{ title() }}</span>
        </div>
        <div class="flex items-center gap-3">
          @if (meta()) {
            <span class="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">{{ meta() }}</span>
          }
          <span aria-hidden="true" class="text-muted text-sm leading-none">
            {{ expanded() ? '−' : '+' }}
          </span>
        </div>
      </button>
      @if (expanded()) {
        <div class="px-control-x pb-4 text-sm text-ink">
          <ng-content />
        </div>
      }
    </div>
  `,
})
export class AccordionItemComponent {
  readonly title = input.required<string>();
  readonly index = input<string>('');
  readonly meta = input<string>('');
  readonly expanded = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly expandedChange = output<boolean>();
}
