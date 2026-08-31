import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export type PiFlowNodeStatus = 'idle' | 'active' | 'ok';

export interface PiFlowNode {
  id: string;
  label: string;
  status?: PiFlowNodeStatus;
}

export interface PiFlowEdge {
  from: string;
  to: string;
}

export interface PiFlowNodeRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

export interface PiFlowPath {
  id: string;
  from: string;
  to: string;
  d: string;
}

/**
 * Build a measured, orthogonal route between two node rectangles.
 *
 * The route leaves the side of the source node that faces the target and
 * enters the corresponding side of the target. A midpoint elbow keeps every
 * segment horizontal or vertical, so the route remains legible when a grid
 * wraps on narrow screens.
 */
export function orthogonalPath(
  from: PiFlowNodeRect,
  to: PiFlowNodeRect,
): string {
  const deltaX = to.centerX - from.centerX;
  const deltaY = to.centerY - from.centerY;
  const format = (value: number): string => Number(value.toFixed(2)).toString();

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    const direction = deltaX >= 0 ? 1 : -1;
    const startX = direction > 0 ? from.right : from.left;
    const endX = direction > 0 ? to.left : to.right;
    const startY = from.centerY;
    const endY = to.centerY;

    if (Math.abs(startY - endY) < 0.5) {
      return `M ${format(startX)} ${format(startY)} H ${format(endX)}`;
    }

    const elbowX = startX + (endX - startX) / 2;
    return `M ${format(startX)} ${format(startY)} H ${format(elbowX)} V ${format(endY)} H ${format(endX)}`;
  }

  const direction = deltaY >= 0 ? 1 : -1;
  const startY = direction > 0 ? from.bottom : from.top;
  const endY = direction > 0 ? to.top : to.bottom;
  const startX = from.centerX;
  const endX = to.centerX;

  if (Math.abs(startX - endX) < 0.5) {
    return `M ${format(startX)} ${format(startY)} V ${format(endY)}`;
  }

  const elbowY = startY + (endY - startY) / 2;
  return `M ${format(startX)} ${format(startY)} V ${format(elbowY)} H ${format(endX)} V ${format(endY)}`;
}

interface FlowCanvasSize {
  width: number;
  height: number;
}

/** Kept as a named stylesheet so the reduced-motion contract can be verified without relying on jsdom style injection. */
export const PI_FLOW_DIAGRAM_STYLES = `
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .pi-flow-diagram__viewport {
    position: relative;
    min-height: 7rem;
    width: 100%;
  }

  .pi-flow-diagram__routes {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  .pi-flow-diagram__nodes {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 3rem 1rem;
    align-items: center;
  }

  .pi-flow-node {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 3.25rem;
    padding: 0.75rem 1rem;
    background: var(--color-paper-raised);
    color: var(--color-ink);
    border: 1px solid var(--color-rule-strong);
    border-radius: var(--radius-sm);
    font: inherit;
    text-align: center;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      border-color 150ms ease,
      color 150ms ease,
      box-shadow 150ms ease;
  }

  .pi-flow-node:hover {
    background: var(--color-paper-2);
  }

  .pi-flow-node--active {
    background: color-mix(in oklch, var(--color-gold) 18%, var(--color-paper-raised));
    border-color: var(--color-gold-deep);
    color: var(--color-ink);
  }

  .pi-flow-node--ok {
    border-color: var(--color-success);
  }

  .pi-flow-node__label {
    overflow-wrap: anywhere;
  }

  .pi-route-pulse {
    stroke-dasharray: 0.25rem 0.45rem;
    animation: pi-flow-route-pulse 2.4s linear infinite;
  }

  @keyframes pi-flow-route-pulse {
    to {
      stroke-dashoffset: -1.4rem;
    }
  }

  @media (max-width: 42rem) {
    .pi-flow-diagram__nodes {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 2rem 0.75rem;
    }
  }

  @media (max-width: 26rem) {
    .pi-flow-diagram__nodes {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pi-route-pulse {
      display: none;
    }
  }
`;

/**
 * Paper & Ink orthogonal flow diagram.
 *
 * Use for a compact process overview (for example, Order → Supply → Workshop
 * → Shipping). Do not use it as an ERP table or a replacement for a dense
 * list: the diagram explains relationships, while the table carries detail.
 */
@Component({
  selector: 'app-pi-flow-diagram',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'accessibleLabel()',
  },
  template: `
    <div class="pi-flow-diagram__viewport" data-flow-viewport>
      <svg
        class="pi-flow-diagram__routes"
        [attr.viewBox]="'0 0 ' + canvasSize().width + ' ' + canvasSize().height"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        @for (route of routes(); track route.id) {
          <path
            class="pi-flow-route pi-flow-route-base"
            [attr.d]="route.d"
            fill="none"
            stroke="var(--color-rule)"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          @if (pulse()) {
            <path
              class="pi-flow-route pi-route-pulse"
              [attr.d]="route.d"
              fill="none"
              stroke="var(--color-gold-deep)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          }
        }
      </svg>

      <div class="pi-flow-diagram__nodes">
        @for (node of nodes(); track node.id) {
          <button
            type="button"
            class="pi-flow-node pi-focus-ring"
            [class.pi-flow-node--active]="node.status === 'active'"
            [class.pi-flow-node--ok]="node.status === 'ok'"
            [attr.data-flow-node]="node.id"
            [attr.aria-label]="node.label"
            [attr.aria-selected]="node.status === 'active' ? 'true' : null"
            (click)="nodeSelect.emit(node.id)"
          >
            <span class="pi-flow-node__label">{{ node.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [PI_FLOW_DIAGRAM_STYLES],
})
export class PiFlowDiagramComponent implements AfterViewInit, OnDestroy {
  readonly nodes = input<readonly PiFlowNode[]>([]);
  readonly edges = input<readonly PiFlowEdge[]>([]);
  readonly pulse = input(true);

  readonly nodeSelect = output<string>();

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly measurements = signal<ReadonlyMap<string, PiFlowNodeRect>>(
    new Map(),
  );
  private readonly canvasSizeState = signal<FlowCanvasSize>({
    width: 1,
    height: 1,
  });
  private resizeObserver?: ResizeObserver;
  private destroyed = false;

  protected readonly canvasSize = this.canvasSizeState.asReadonly();

  protected readonly accessibleLabel = computed(() => {
    const labels = new Map(this.nodes().map((node) => [node.id, node.label]));
    const relationships = this.edges().map((edge) => {
      const from = labels.get(edge.from) ?? edge.from;
      const to = labels.get(edge.to) ?? edge.to;
      return `${from} → ${to}`;
    });

    if (relationships.length > 0)
      return `Схема потока: ${relationships.join('; ')}`;
    if (this.nodes().length > 0)
      return `Схема потока: ${this.nodes()
        .map((node) => node.label)
        .join(' → ')}`;
    return 'Схема потока: нет связей';
  });

  protected readonly routes = computed<PiFlowPath[]>(() => {
    const measured = this.measurements();
    return this.edges().flatMap((edge, index) => {
      const from = measured.get(edge.from);
      const to = measured.get(edge.to);
      if (!from || !to) return [];

      return [
        {
          id: `${edge.from}-${edge.to}-${index}`,
          from: edge.from,
          to: edge.to,
          d: orthogonalPath(from, to),
        },
      ];
    });
  });

  constructor() {
    effect(() => {
      this.nodes();
      this.edges();
      queueMicrotask(() => {
        if (!this.destroyed) this.recalculate();
      });
    });
  }

  ngAfterViewInit(): void {
    this.recalculate();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.recalculate());
      this.resizeObserver.observe(this.hostEl.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
  }

  private recalculate(): void {
    const host = this.hostEl.nativeElement as HTMLElement;
    const viewport = host.querySelector(
      '[data-flow-viewport]',
    ) as HTMLElement | null;
    if (!viewport) return;

    const viewportRect = viewport.getBoundingClientRect();
    const width = Math.max(viewport.clientWidth, viewportRect.width, 1);
    const height = Math.max(
      viewport.clientHeight,
      viewport.scrollHeight,
      viewportRect.height,
      1,
    );
    const nodeElements = Array.from(
      viewport.querySelectorAll('[data-flow-node]'),
    ) as HTMLElement[];
    const nextMeasurements = new Map<string, PiFlowNodeRect>();

    for (const node of this.nodes()) {
      const element = nodeElements.find(
        (candidate) => candidate.dataset['flowNode'] === node.id,
      );
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const left = rect.left - viewportRect.left;
      const top = rect.top - viewportRect.top;
      const right = rect.right - viewportRect.left;
      const bottom = rect.bottom - viewportRect.top;
      nextMeasurements.set(node.id, {
        left,
        top,
        right,
        bottom,
        centerX: left + rect.width / 2,
        centerY: top + rect.height / 2,
      });
    }

    const nextSize: FlowCanvasSize = {
      width: Math.ceil(width),
      height: Math.ceil(height),
    };

    if (
      this.isSameCanvasSize(this.canvasSizeState(), nextSize) &&
      this.isSameMeasurements(nextMeasurements)
    ) {
      return;
    }

    this.canvasSizeState.set(nextSize);
    this.measurements.set(nextMeasurements);
  }

  private isSameCanvasSize(
    previous: FlowCanvasSize,
    next: FlowCanvasSize,
  ): boolean {
    return previous.width === next.width && previous.height === next.height;
  }

  private isSameMeasurements(
    next: ReadonlyMap<string, PiFlowNodeRect>,
  ): boolean {
    const previous = this.measurements();
    if (previous.size !== next.size) return false;

    for (const [id, rect] of next) {
      const old = previous.get(id);
      if (!old || !this.isSameRect(old, rect)) return false;
    }
    return true;
  }

  private isSameRect(previous: PiFlowNodeRect, next: PiFlowNodeRect): boolean {
    return (
      previous.left === next.left &&
      previous.top === next.top &&
      previous.right === next.right &&
      previous.bottom === next.bottom &&
      previous.centerX === next.centerX &&
      previous.centerY === next.centerY
    );
  }
}
