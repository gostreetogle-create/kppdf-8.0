import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
  viewChildren,
  effect,
} from '@angular/core';

export interface ResizableSize {
  /** Initial size as percentage of parent or pixels */
  size: number;
  /** 'percent' or 'px' */
  unit: 'percent' | 'px';
  min?: number;
  max?: number;
}

interface PanelDef {
  size: ResizableSize;
  el: HTMLElement;
  visibleSize: number;
}

@Component({
  selector: 'hlm-resizable-panel-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="
        direction() === 'horizontal'
          ? 'flex h-full w-full overflow-hidden'
          : 'flex h-full w-full flex-col overflow-hidden'
      "
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class ResizablePanelGroupComponent {
  readonly direction = input<'horizontal' | 'vertical'>('horizontal');
  readonly autoSaveId = input<string>('');

  protected readonly panels = signal<PanelDef[]>([]);
  protected readonly handleIdx = signal<number>(-1);
  protected readonly startPos = signal<number>(0);
  protected readonly startSizes = signal<number[]>([]);
  private readonly host = inject(ElementRef<HTMLElement>);

  register(panel: PanelDef, index: number): void {
    const list = [...this.panels()];
    list[index] = panel;
    this.panels.set(list);
  }

  startDrag(handleIndex: number, e: PointerEvent): void {
    e.preventDefault();
    this.handleIdx.set(handleIndex);
    this.startPos.set(this.direction() === 'horizontal' ? e.clientX : e.clientY);
    this.startSizes.set(this.panels().map((p) => p.visibleSize));
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  @HostListener('document:pointermove', ['$event'])
  onMove(e: PointerEvent): void {
    if (this.handleIdx() < 0) return;
    const idx = this.handleIdx();
    const delta = (this.direction() === 'horizontal' ? e.clientX : e.clientY) - this.startPos();
    const container = this.host.nativeElement.getBoundingClientRect();
    const containerSize = this.direction() === 'horizontal' ? container.width : container.height;
    const deltaPct = (delta / containerSize) * 100;
    const list = [...this.panels()];
    const start = this.startSizes();
    const a = list[idx];
    const b = list[idx + 1];
    if (!a || !b) return;
    let newA = (start[idx] ?? 0) + deltaPct;
    let newB = (start[idx + 1] ?? 0) - deltaPct;
    const aMin = a.size.min ?? 5;
    const bMin = b.size.min ?? 5;
    if (newA < aMin) {
      newB += newA - aMin;
      newA = aMin;
    }
    if (newB < bMin) {
      newA += newB - bMin;
      newB = bMin;
    }
    a.visibleSize = newA;
    b.visibleSize = newB;
    this.applySizes();
  }

  @HostListener('document:pointerup')
  @HostListener('document:pointercancel')
  onUp(): void {
    if (this.handleIdx() < 0) return;
    this.handleIdx.set(-1);
    if (this.autoSaveId()) {
      try {
        localStorage.setItem(`resizable-${this.autoSaveId()}`, JSON.stringify(this.panels().map((p) => p.visibleSize)));
      } catch {}
    }
  }

  private applySizes(): void {
    for (const p of this.panels()) {
      const flex = p.size.unit === 'percent' ? `${p.visibleSize}%` : `${p.visibleSize}px`;
      p.el.style.flex = `0 0 ${flex}`;
    }
  }
}

@Component({
  selector: 'hlm-resizable-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #panel class="overflow-hidden">
      <ng-content></ng-content>
    </div>
  `,
})
export class ResizablePanelComponent {
  readonly size = input<ResizableSize>({ size: 50, unit: 'percent' });
  readonly min = input<number>(5);
  readonly max = input<number>(95);

  private readonly group = inject(ResizablePanelGroupComponent, { optional: true });
  private readonly host = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    if (!this.group) return;
    const siblings = this.collectSiblings();
    const index = siblings.indexOf(this.host.nativeElement);
    const size = { ...this.size(), min: this.min(), max: this.max() };
    const visibleSize = size.unit === 'percent' ? size.size : size.size;
    this.group.register({ size, el: this.host.nativeElement, visibleSize }, index);
  }

  private collectSiblings(): HTMLElement[] {
    const parent = this.host.nativeElement.parentElement;
    if (!parent) return [];
    return Array.from(parent.querySelectorAll(':scope > hlm-resizable-panel')).map((el) => el as HTMLElement);
  }
}

@Component({
  selector: 'hlm-resizable-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="
        group?.direction() === 'vertical'
          ? 'h-px w-full cursor-row-resize bg-border hover:bg-primary transition-colors'
          : 'h-full w-px cursor-col-resize bg-border hover:bg-primary transition-colors'
      "
      (pointerdown)="onDown($event)"
      role="separator"
      [attr.aria-orientation]="group?.direction() === 'vertical' ? 'horizontal' : 'vertical'"
    >
      <div
        [class]="
          group?.direction() === 'vertical'
            ? 'absolute inset-x-0 -top-1 -bottom-1'
            : 'absolute inset-y-0 -left-1 -right-1'
        "
      ></div>
    </div>
  `,
})
export class ResizableHandleComponent {
  protected readonly group = inject(ResizablePanelGroupComponent, { optional: true });
  private readonly host = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    if (!this.group) return;
    const siblings = this.host.nativeElement.parentElement?.querySelectorAll(':scope > hlm-resizable-handle');
    if (!siblings) return;
    const arr = Array.from(siblings);
    const idx = arr.indexOf(this.host.nativeElement);
    (this.host.nativeElement as HTMLElement).dataset['idx'] = String(idx);
  }

  protected onDown(e: PointerEvent): void {
    if (!this.group) return;
    const idx = Number((this.host.nativeElement as HTMLElement).dataset['idx'] ?? -1);
    if (idx >= 0) this.group.startDrag(idx, e);
  }
}
