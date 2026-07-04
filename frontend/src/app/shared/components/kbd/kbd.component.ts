import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'hlm-kbd',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kbd [class]="rootClass()">
      <ng-content></ng-content>
    </kbd>
  `,
})
export class KbdComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected rootClass(): string {
    const s = this.size();
    return [
      'inline-flex items-center justify-center font-mono font-medium',
      'border border-border bg-muted text-foreground/80 shadow-sm',
      'rounded-md pointer-events-none select-none',
      s === 'sm' ? 'h-5 min-w-5 px-1 text-[10px]' : s === 'lg' ? 'h-8 min-w-8 px-2 text-sm' : 'h-6 min-w-6 px-1.5 text-xs',
    ].join(' ');
  }
}

@Component({
  selector: 'hlm-kbd-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="inline-flex items-center gap-1"><ng-content></ng-content></span>`,
})
export class KbdGroupComponent {}
