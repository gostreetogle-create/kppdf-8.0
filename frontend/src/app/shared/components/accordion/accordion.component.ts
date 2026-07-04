import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

export interface AccordionItem {
  id: string;
  title: string;
  /** Optional icon (lucide name without prefix) */
  icon?: string;
  /** Render helper text under title */
  subtitle?: string;
}

@Component({
  selector: 'hlm-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  providers: [], // do not scope — we use a separate signal store
})
export class AccordionComponent {
  readonly type = input<'single' | 'multiple'>('single');
  readonly collapsible = input<boolean>(true);
  readonly defaultValue = input<string | string[]>('');

  private readonly internal = signal<Set<string>>(this.parseDefault(this.defaultValue()));

  isOpen(id: string): boolean {
    return this.internal().has(id);
  }

  toggle(id: string): void {
    const next = new Set(this.internal());
    if (next.has(id)) {
      if (this.collapsible()) next.delete(id);
    } else {
      if (this.type() === 'single') next.clear();
      next.add(id);
    }
    this.internal.set(next);
  }

  private parseDefault(v: string | string[]): Set<string> {
    if (Array.isArray(v)) return new Set(v);
    if (v) return new Set([v]);
    return new Set();
  }
}

@Component({
  selector: 'hlm-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="'border-b border-border last:border-b-0 ' + (class_())"
      [attr.data-state]="open() ? 'open' : 'closed'"
    >
      <h3 class="flex">
        <button
          type="button"
          [id]="triggerId"
          [attr.aria-controls]="contentId"
          [attr.aria-expanded]="open()"
          [class]="triggerClass()"
          (click)="toggle()"
        >
          @if (item().icon) {
            <span class="lucide-{{ item().icon }} h-4 w-4" aria-hidden="true"></span>
          }
          <span class="flex-1 text-left">
            <span class="text-sm font-medium">{{ item().title }}</span>
            @if (item().subtitle) {
              <span class="block text-xs text-muted-foreground">{{ item().subtitle }}</span>
            }
          </span>
          <span
            class="lucide-chevron-down h-4 w-4 shrink-0 text-muted-foreground transition-transform"
            [class.rotate-180]="open()"
            aria-hidden="true"
          ></span>
        </button>
      </h3>
      @if (open()) {
        <div [id]="contentId" role="region" [attr.aria-labelledby]="triggerId" class="overflow-hidden text-sm animate-slide-down">
          <div class="pb-4 pt-0">
            <ng-content></ng-content>
          </div>
        </div>
      }
    </div>
  `,
})
export class AccordionItemComponent {
  readonly item = input.required<AccordionItem>();
  readonly class_ = input<string>('');

  private readonly parent = inject(AccordionComponent, { optional: true });
  private static counter = 0;
  protected readonly triggerId = `accordion-trigger-${++AccordionItemComponent.counter}`;
  protected readonly contentId = `accordion-content-${AccordionItemComponent.counter}`;

  protected readonly open = computed(() => this.parent?.isOpen(this.item().id) ?? false);

  toggle(): void {
    this.parent?.toggle(this.item().id);
  }

  protected triggerClass(): string {
    return [
      'flex w-full items-center justify-between gap-2 py-4 text-sm font-medium',
      'transition-all hover:underline',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
    ].join(' ');
  }
}
