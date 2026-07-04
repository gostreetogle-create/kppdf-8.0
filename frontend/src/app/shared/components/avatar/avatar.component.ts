import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'hlm-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      [class]="rootClass()"
      [style.width.px]="sizePx()"
      [style.height.px]="sizePx()"
      [style.font-size.px]="fontSizePx()"
    >
      @if (src() && !fallback()) {
        <img [src]="src()" [alt]="name() || 'avatar'" class="h-full w-full object-cover" (error)="fallback.set(true)" />
      } @else {
        <span [class]="'flex h-full w-full items-center justify-center font-medium ' + bgClass()">
          {{ initials() }}
        </span>
      }
    </span>
  `,
})
export class AvatarComponent {
  readonly name = input<string>('');
  readonly src = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | number>('md');
  readonly shape = input<'circle' | 'rounded' | 'square'>('circle');
  readonly color = input<'primary' | 'secondary' | 'accent' | 'muted'>('primary');

  protected readonly fallback = signal(false);

  protected readonly sizePx = computed(() => {
    const s = this.size();
    if (typeof s === 'number') return s;
    return s === 'sm' ? 32 : s === 'lg' ? 56 : 40;
  });

  protected readonly fontSizePx = computed(() => this.sizePx() * 0.4);

  protected readonly initials = computed(() => {
    const n = this.name();
    if (!n) return '?';
    return n
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  });

  protected readonly bgClass = computed(() => {
    switch (this.color()) {
      case 'primary':
        return 'bg-primary text-primary-foreground';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      case 'accent':
        return 'bg-accent text-accent-foreground';
      case 'muted':
        return 'bg-muted text-muted-foreground';
    }
  });

  protected rootClass(): string {
    const shape = this.shape();
    const r =
      shape === 'circle' ? 'rounded-full overflow-hidden' : shape === 'rounded' ? 'rounded-md overflow-hidden' : 'rounded-none overflow-hidden';
    return `relative inline-flex items-center justify-center shrink-0 ${r}`;
  }
}

@Component({
  selector: 'hlm-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
  template: `
    <div class="flex items-center -space-x-2">
      @for (a of visible(); track a) {
        <hlm-avatar [name]="a" [size]="size()" shape="circle" [color]="color()"></hlm-avatar>
      }
      @if (overflow() > 0) {
        <span
          [class]="'inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground border-2 border-background ' + sizeClass()"
        >
          +{{ overflow() }}
        </span>
      }
    </div>
  `,
})
export class AvatarGroupComponent {
  readonly names = input.required<string[]>();
  readonly max = input<number>(4);
  readonly size = input<'sm' | 'md' | 'lg'>('sm');
  readonly color = input<'primary' | 'secondary' | 'accent' | 'muted'>('primary');

  protected readonly visible = computed(() => this.names().slice(0, this.max()));
  protected readonly overflow = computed(() => Math.max(0, this.names().length - this.max()));

  protected sizeClass(): string {
    switch (this.size()) {
      case 'sm':
        return 'h-8 w-8 text-xs';
      case 'lg':
        return 'h-14 w-14 text-base';
      default:
        return 'h-10 w-10 text-sm';
    }
  }
}
