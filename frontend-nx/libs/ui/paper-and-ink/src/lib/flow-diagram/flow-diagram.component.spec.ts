import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  PiFlowDiagramComponent,
  PI_FLOW_DIAGRAM_STYLES,
  type PiFlowEdge,
  type PiFlowNode,
  orthogonalPath,
} from './flow-diagram.component';

const domRect = (
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect =>
  ({
    x: left,
    y: top,
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    toJSON: () => ({}),
  }) as DOMRect;

type ResizeCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver,
) => void;

class ResizeObserverMock {
  static readonly instances: ResizeObserverMock[] = [];

  readonly observed = new Set<Element>();

  constructor(private readonly callback: ResizeCallback) {
    ResizeObserverMock.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.add(target);
  }

  disconnect(): void {
    this.observed.clear();
  }

  trigger(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

const nativeResizeObserver = globalThis.ResizeObserver;

@Component({
  standalone: true,
  imports: [PiFlowDiagramComponent],
  template: `<app-pi-flow-diagram
    [nodes]="nodes"
    [edges]="edges"
    [pulse]="pulse"
  />`,
})
class FlowHostComponent {
  readonly nodes: PiFlowNode[] = [
    { id: 'order', label: 'Заказ', status: 'ok' },
    { id: 'supply', label: 'Снабжение', status: 'active' },
  ];
  readonly edges: PiFlowEdge[] = [{ from: 'order', to: 'supply' }];
  pulse = true;
}

describe('PiFlowDiagramComponent', () => {
  let fixture: ComponentFixture<FlowHostComponent>;

  beforeEach(async () => {
    ResizeObserverMock.instances.length = 0;
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: ResizeObserverMock,
    });
    await TestBed.configureTestingModule({
      imports: [FlowHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FlowHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    if (nativeResizeObserver) {
      Object.defineProperty(globalThis, 'ResizeObserver', {
        configurable: true,
        writable: true,
        value: nativeResizeObserver,
      });
    } else {
      delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    }
  });

  it('creates an orthogonal horizontal route with a measured elbow', () => {
    expect(
      orthogonalPath(
        {
          left: 0,
          top: 0,
          right: 80,
          bottom: 40,
          centerX: 40,
          centerY: 20,
        },
        {
          left: 220,
          top: 100,
          right: 300,
          bottom: 140,
          centerX: 260,
          centerY: 120,
        },
      ),
    ).toBe('M 80 20 H 150 V 120 H 220');
  });

  it('creates an orthogonal vertical route when nodes are stacked', () => {
    expect(
      orthogonalPath(
        {
          left: 100,
          top: 0,
          right: 180,
          bottom: 40,
          centerX: 140,
          centerY: 20,
        },
        {
          left: 120,
          top: 160,
          right: 200,
          bottom: 200,
          centerX: 160,
          centerY: 180,
        },
      ),
    ).toBe('M 140 40 V 100 H 160 V 160');
  });

  it('exposes a relationship fallback and accessible selected node', () => {
    const host = fixture.nativeElement as HTMLElement;
    const diagram = host.querySelector('[role="img"]');
    expect(diagram?.getAttribute('aria-label')).toBe(
      'Схема потока: Заказ → Снабжение',
    );
    expect(
      host
        .querySelector('[data-flow-node="supply"]')
        ?.getAttribute('aria-selected'),
    ).toBe('true');
    expect(host.querySelectorAll('button.pi-focus-ring')).toHaveLength(2);
  });

  it('renders base and pulse routes by default and only base routes when pulse is false', () => {
    const host = fixture.nativeElement as HTMLElement;
    const { observer } = prepareGeometry();
    expect(observer.observed.size).toBe(1);
    expect(host.querySelectorAll('.pi-flow-route-base')).toHaveLength(1);
    expect(host.querySelectorAll('.pi-route-pulse')).toHaveLength(1);

    fixture.componentInstance.pulse = false;
    fixture.detectChanges();
    expect(host.querySelectorAll('.pi-flow-route-base')).toHaveLength(1);
    expect(host.querySelectorAll('.pi-route-pulse')).toHaveLength(0);
  });

  it('recalculates measured path coordinates after ResizeObserver callback', () => {
    const host = fixture.nativeElement as HTMLElement;
    const { observer, viewportRect, nodeRects } = prepareGeometry();
    const initialPath = host
      .querySelector('.pi-flow-route-base')
      ?.getAttribute('d');
    expect(initialPath).toBe('M 100 60 H 500');

    viewportRect.mockReturnValue(domRect(0, 0, 800, 120));
    nodeRects[0].mockReturnValue(domRect(0, 40, 160, 40));
    nodeRects[1].mockReturnValue(domRect(640, 40, 160, 40));
    observer.trigger();
    fixture.detectChanges();

    expect(host.querySelector('.pi-flow-route-base')?.getAttribute('d')).toBe(
      'M 160 60 H 640',
    );
    expect(host.querySelector('svg')?.getAttribute('viewBox')).toBe(
      '0 0 800 120',
    );
  });

  it('keeps the reduced-motion contract in component styles', () => {
    expect(PI_FLOW_DIAGRAM_STYLES).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(PI_FLOW_DIAGRAM_STYLES).toContain('.pi-route-pulse');
    expect(PI_FLOW_DIAGRAM_STYLES).toContain('display: none');
  });

  it('disconnects ResizeObserver on destroy', () => {
    const { observer } = prepareGeometry();
    fixture.destroy();
    expect(observer.observed.size).toBe(0);
  });

  function prepareGeometry(): {
    observer: ResizeObserverMock;
    viewportRect: jest.SpyInstance<DOMRect, []>;
    nodeRects: [jest.SpyInstance<DOMRect, []>, jest.SpyInstance<DOMRect, []>];
  } {
    const host = fixture.nativeElement as HTMLElement;
    const viewport = host.querySelector('[data-flow-viewport]') as HTMLElement;
    const nodes = Array.from(
      host.querySelectorAll('[data-flow-node]'),
    ) as HTMLElement[];
    const viewportRect = jest.spyOn(viewport, 'getBoundingClientRect');
    const nodeRects = [
      jest.spyOn(nodes[0], 'getBoundingClientRect'),
      jest.spyOn(nodes[1], 'getBoundingClientRect'),
    ] as [jest.SpyInstance<DOMRect, []>, jest.SpyInstance<DOMRect, []>];

    viewportRect.mockReturnValue(domRect(0, 0, 600, 120));
    Object.defineProperty(viewport, 'clientWidth', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(viewport, 'clientHeight', {
      configurable: true,
      value: 120,
    });
    Object.defineProperty(viewport, 'scrollHeight', {
      configurable: true,
      value: 120,
    });
    nodeRects[0].mockReturnValue(domRect(0, 40, 100, 40));
    nodeRects[1].mockReturnValue(domRect(500, 40, 100, 40));

    const observer = ResizeObserverMock.instances[0];
    if (!observer) throw new Error('ResizeObserver was not created');
    observer.trigger();
    fixture.detectChanges();
    return { observer, viewportRect, nodeRects };
  }
});
