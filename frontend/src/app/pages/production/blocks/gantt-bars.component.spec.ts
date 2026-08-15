import { TestBed } from '@angular/core/testing';
import {
  GanttBarsComponent,
  GANTT_PX_PER_DAY,
  snapEstimateDaysFromDelta,
  snapMoveDeltaDays,
} from './gantt-bars.component';
import type { GanttBar } from '../gantt-bar.model';

describe('GanttBarsComponent', () => {
  const sample: GanttBar = {
    id: 'o1:0:p1:m1:wt1:1',
    orderId: 'o1',
    orderNumber: 'ORD-1',
    orderStatus: 'confirmed',
    orderItemIndex: 0,
    productId: 'p1',
    productName: 'Стол',
    moduleId: 'm1',
    moduleName: 'Каркас',
    workTypeId: 'wt1',
    workTypeName: 'Сварка',
    occurrence: 1,
    quantity: 1,
    quantityLabel: null,
    days: 2,
    noTerm: false,
    startDate: '2026-08-01',
    endDate: '2026-08-02',
    usedFallbackToday: false,
    workerLabel: '—',
  };

  const samplePaint: GanttBar = {
    ...sample,
    id: 'o1:0:p1:m1:wt2:2',
    workTypeId: 'wt2',
    workTypeName: 'Покраска',
    occurrence: 2,
    days: 3,
    startDate: '2026-08-03',
    endDate: '2026-08-05',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GanttBarsComponent],
    });
  });

  it('collapsed default shows one summary bar per order', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('[data-test="gantt-bar-summary"]').length).toBe(1);
    expect(el.querySelector('[data-test="gantt-bar"]')).toBeFalsy();
    expect(el.textContent).toContain('ORD-1');
    // Work-type names appear in legend, but not as child label rows when collapsed.
    expect(el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]')).toBeFalsy();
    expect(el.querySelector('[data-test="gantt-label-header"]')?.textContent?.trim()).toBe('Заказ');
  });

  it('expand shows work-type children; collapse hides them', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('[data-test="gantt-bar-summary"]').length).toBe(1);
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(2);
    expect(el.textContent).toContain('Сварка');
    expect(el.textContent).toContain('Покраска');
    expect(el.querySelector('[data-test="gantt-label-header"]')?.textContent?.trim()).toBe(
      'Заказ · работа',
    );

    fixture.componentRef.setInput('expandedOrderIds', new Set());
    fixture.detectChanges();
    expect(el.querySelector('[data-test="gantt-bar"]')).toBeFalsy();
  });

  it('TZ-PRODUCTION-317: expand inserts children under summary; peer orders remain and shift down', () => {
    const peer: GanttBar = {
      ...sample,
      id: 'o2:0:p1:m1:wt1:1',
      orderId: 'o2',
      orderNumber: 'ORD-2',
    };
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint, peer]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('[data-test="gantt-bar-summary"]').length).toBe(2);
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(0);

    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    expect(el.querySelectorAll('[data-test="gantt-bar-summary"]').length).toBe(2);
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(2);
    const labels = Array.from(el.querySelectorAll('[data-test^="gantt-label-"]')).map((n) =>
      (n as HTMLElement).getAttribute('data-test'),
    );
    const iSum1 = labels.indexOf('gantt-label-summary:o1');
    const iChild = labels.indexOf('gantt-label-o1:0:p1:m1:wt1:1');
    const iSum2 = labels.indexOf('gantt-label-summary:o2');
    expect(iSum1).toBeGreaterThanOrEqual(0);
    expect(iChild).toBeGreaterThan(iSum1);
    expect(iSum2).toBeGreaterThan(iChild);
  });

  it('emits toggleExpand from chevron', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const toggles: string[] = [];
    const labels: string[] = [];
    fixture.componentInstance.toggleExpand.subscribe((id) => toggles.push(id));
    fixture.componentInstance.orderLabelClick.subscribe((id) => labels.push(id));
    const btn = fixture.nativeElement.querySelector('[data-test="gantt-expand-o1"]') as HTMLElement;
    btn.click();
    expect(toggles).toEqual(['o1']);
    expect(labels).toEqual([]);
  });

  it('TZ-PRODUCTION-319: summary label emits orderLabelClick; child and timeline do not', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    const clicks: string[] = [];
    const toggles: string[] = [];
    fixture.componentInstance.orderLabelClick.subscribe((id) => clicks.push(id));
    fixture.componentInstance.toggleExpand.subscribe((id) => toggles.push(id));

    const summaryLabel = fixture.nativeElement.querySelector(
      '[data-test="gantt-label-summary:o1"] button.flex-1',
    ) as HTMLElement;
    summaryLabel.click();
    expect(clicks).toEqual(['o1']);

    const childLabel = fixture.nativeElement.querySelector(
      '[data-test="gantt-label-o1:0:p1:m1:wt1:1"] button.flex-1',
    ) as HTMLElement;
    childLabel.click();
    expect(clicks).toEqual(['o1']);

    const timelineRow = fixture.nativeElement.querySelector(
      '[data-test="gantt-row-summary:o1"]',
    ) as HTMLElement;
    timelineRow.click();
    expect(clicks).toEqual(['o1']);
    expect(toggles).toEqual([]);
  });

  it('renders legend and a summary with required range', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('План-оценка');
    expect(el.querySelector('[data-test="gantt-legend"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-bar-summary"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-expand-hint"]')?.textContent).toContain(
      'Разверните заказ',
    );
  });

  it('shows work-type detail in title when expanded', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('ORD-1');
    expect(el.textContent).toContain('Сварка');
    const label = el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]') as HTMLElement;
    expect(label?.getAttribute('title') ?? label?.textContent).toBeTruthy();
    const titleBtn = label?.querySelector('button[title]') as HTMLElement | null;
    expect(titleBtn?.getAttribute('title')).toContain('Стол');
    expect(el.querySelector('[data-test="gantt-worktype-legend"]')?.textContent).toContain(
      'Сварка',
    );
  });

  it('keeps label and timeline row height in sync', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const label = el.querySelector('[data-test="gantt-label-summary:o1"]') as HTMLElement;
    const row = el.querySelector('[data-test="gantt-row-summary:o1"]') as HTMLElement;
    expect(label.classList.contains('gantt-row-h')).toBe(true);
    expect(row.classList.contains('gantt-row-h')).toBe(true);
    expect(getComputedStyle(label).height).toBe(getComputedStyle(row).height);
  });

  it('keeps calendar scale visible when no bars', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', []);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-16');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-test="gantt-scale"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-today-marker"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-empty"]')).toBeTruthy();
    expect(el.querySelectorAll('[data-test="gantt-placeholder-row"]').length).toBeGreaterThan(0);
  });

  it('day vs week zoom changes px density and scale hint', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-15');
    fixture.componentRef.setInput('zoom', 'day');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '[data-test="gantt-bars-root"]',
    ) as HTMLElement;
    expect(root.getAttribute('data-zoom')).toBe('day');
    expect(fixture.nativeElement.textContent).toContain('масштаб: день');
    expect(fixture.componentInstance['pxPerDay']()).toBe(GANTT_PX_PER_DAY.day);

    fixture.componentRef.setInput('zoom', 'week');
    fixture.detectChanges();
    expect(root.getAttribute('data-zoom')).toBe('week');
    expect(fixture.nativeElement.textContent).toContain('масштаб: неделя');
    expect(fixture.componentInstance['pxPerDay']()).toBe(GANTT_PX_PER_DAY.week);
    expect(fixture.componentInstance['timelineMinWidth']()).toBeLessThan(
      14 * GANTT_PX_PER_DAY.day + 224,
    );
  });

  it('shows right-edge resize handle on child when expanded and editable', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('readOnly', false);
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    const handle = fixture.nativeElement.querySelector(
      '[data-test="gantt-resize-handle-o1:0:p1:m1:wt1:1"]',
    );
    expect(handle).toBeTruthy();
    expect(handle.getAttribute('aria-label')).toContain('Изменить длительность');
    // Summary has no resize
    expect(
      fixture.nativeElement.querySelector('[data-test="gantt-resize-handle-summary:o1"]'),
    ).toBeFalsy();
  });

  it('hides resize handle for noTerm bars', () => {
    const noTerm: GanttBar = {
      ...sample,
      id: 'o1:0:p1:m1:wt1:2',
      days: null,
      noTerm: true,
      endDate: '2026-08-01',
    };
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [noTerm]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test^="gantt-resize-handle-"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('[data-test="gantt-bar-no-term"]')).toBeTruthy();
  });

  it('hides resize handle when readOnly', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('readOnly', true);
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test^="gantt-resize-handle-"]')).toBeFalsy();
  });

  it('hides resize handle for shipped order status', () => {
    const shipped: GanttBar = { ...sample, orderStatus: 'shipped' };
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [shipped]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test^="gantt-resize-handle-"]')).toBeFalsy();
  });

  it('emits estimateDaysCommit on pointer resize commit (child)', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();

    const commits: unknown[] = [];
    fixture.componentInstance.estimateDaysCommit.subscribe((v) => commits.push(v));

    const handle = fixture.nativeElement.querySelector(
      '[data-test="gantt-resize-handle-o1:0:p1:m1:wt1:1"]',
    ) as HTMLElement;
    const rows = fixture.componentInstance['rows']();
    const childRow = rows.find((r: { bar: GanttBar }) => r.bar.id === sample.id)!;
    fixture.componentInstance.onResizePointerDown(
      {
        pointerId: 1,
        clientX: 100,
        preventDefault: () => undefined,
        stopPropagation: () => undefined,
        currentTarget: {
          setPointerCapture: () => undefined,
        },
      } as unknown as PointerEvent,
      childRow,
    );
    fixture.componentInstance.onDocumentPointerMove({
      pointerId: 1,
      clientX: 100 + GANTT_PX_PER_DAY.day * 2,
    } as PointerEvent);
    fixture.componentInstance.onDocumentPointerUp({
      pointerId: 1,
      clientX: 100 + GANTT_PX_PER_DAY.day * 2,
    } as PointerEvent);

    expect(handle).toBeTruthy();
    expect(commits).toEqual([
      {
        orderId: 'o1',
        orderItemIndex: 0,
        moduleId: 'm1',
        workTypeId: 'wt1',
        days: 4,
      },
    ]);
  });

  it('emits plannedDateMoveCommit on summary body drag only', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();

    const moves: unknown[] = [];
    const resizes: unknown[] = [];
    fixture.componentInstance.plannedDateMoveCommit.subscribe((v) => moves.push(v));
    fixture.componentInstance.estimateDaysCommit.subscribe((v) => resizes.push(v));

    const summary = fixture.componentInstance['rows']().find(
      (r: { isSummary: boolean }) => r.isSummary,
    )!.bar;

    // Child body-drag emits startOffset (316), not plannedDate.
    expect(fixture.componentInstance.canMoveBar(sample)).toBe(true);
    fixture.componentInstance.onMovePointerDown(
      {
        pointerId: 8,
        clientX: 50,
        preventDefault: () => undefined,
        stopPropagation: () => undefined,
        currentTarget: { setPointerCapture: () => undefined },
      } as unknown as PointerEvent,
      sample,
    );
    fixture.componentInstance.onDocumentPointerMove({
      pointerId: 8,
      clientX: 50 + GANTT_PX_PER_DAY.day,
    } as PointerEvent);
    fixture.componentInstance.onDocumentPointerUp({
      pointerId: 8,
      clientX: 50 + GANTT_PX_PER_DAY.day,
    } as PointerEvent);
    expect(moves).toEqual([]);

    fixture.componentInstance.onMovePointerDown(
      {
        pointerId: 7,
        clientX: 50,
        preventDefault: () => undefined,
        stopPropagation: () => undefined,
        currentTarget: { setPointerCapture: () => undefined },
      } as unknown as PointerEvent,
      summary,
    );
    fixture.componentInstance.onDocumentPointerMove({
      pointerId: 7,
      clientX: 50 + GANTT_PX_PER_DAY.day * 3,
    } as PointerEvent);
    fixture.componentInstance.onDocumentPointerUp({
      pointerId: 7,
      clientX: 50 + GANTT_PX_PER_DAY.day * 3,
    } as PointerEvent);

    expect(moves).toEqual([{ orderId: 'o1', deltaDays: 3 }]);
    expect(resizes).toEqual([]);
  });

  it('emits startOffsetCommit on child body drag (not plannedDate)', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();

    const moves: unknown[] = [];
    const offsets: unknown[] = [];
    fixture.componentInstance.plannedDateMoveCommit.subscribe((v) => moves.push(v));
    fixture.componentInstance.startOffsetCommit.subscribe((v) => offsets.push(v));

    expect(fixture.componentInstance.canMoveBar(sample)).toBe(true);
    fixture.componentInstance.onMovePointerDown(
      {
        pointerId: 9,
        clientX: 50,
        preventDefault: () => undefined,
        stopPropagation: () => undefined,
        currentTarget: { setPointerCapture: () => undefined },
      } as unknown as PointerEvent,
      sample,
    );
    fixture.componentInstance.onDocumentPointerMove({
      pointerId: 9,
      clientX: 50 + GANTT_PX_PER_DAY.day * 2,
    } as PointerEvent);
    fixture.componentInstance.onDocumentPointerUp({
      pointerId: 9,
      clientX: 50 + GANTT_PX_PER_DAY.day * 2,
    } as PointerEvent);

    expect(moves).toEqual([]);
    expect(offsets).toEqual([
      {
        orderId: 'o1',
        orderItemIndex: 0,
        moduleId: 'm1',
        workTypeId: 'wt1',
        startDate: '2026-08-01',
        deltaDays: 2,
      },
    ]);
  });

  it('does not emit move when starting on resize handle path', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();

    const moves: unknown[] = [];
    fixture.componentInstance.plannedDateMoveCommit.subscribe((v) => moves.push(v));

    const rows = fixture.componentInstance['rows']();
    const childRow = rows.find((r: { bar: GanttBar }) => r.bar.id === sample.id)!;
    fixture.componentInstance.onResizePointerDown(
      {
        pointerId: 2,
        clientX: 100,
        preventDefault: () => undefined,
        stopPropagation: () => undefined,
        currentTarget: { setPointerCapture: () => undefined },
      } as unknown as PointerEvent,
      childRow,
    );
    fixture.componentInstance.onDocumentPointerMove({
      pointerId: 2,
      clientX: 100 + GANTT_PX_PER_DAY.day,
    } as PointerEvent);
    fixture.componentInstance.onDocumentPointerUp({
      pointerId: 2,
      clientX: 100 + GANTT_PX_PER_DAY.day,
    } as PointerEvent);

    expect(moves).toEqual([]);
  });

  it('disallows summary body-drag when readOnly or shipped', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();
    const summary = fixture.componentInstance['rows']()[0]!.bar;
    expect(fixture.componentInstance.canMoveBar(summary)).toBe(false);

    const shipped: GanttBar = { ...sample, orderStatus: 'shipped' };
    fixture.componentRef.setInput('readOnly', false);
    fixture.componentRef.setInput('bars', [shipped]);
    fixture.detectChanges();
    const shippedSummary = fixture.componentInstance['rows']()[0]!.bar;
    expect(fixture.componentInstance.canMoveBar(shippedSummary)).toBe(false);
  });
});

describe('snapEstimateDaysFromDelta', () => {
  it('snaps to calendar days and clamps to ≥1', () => {
    expect(snapEstimateDaysFromDelta(2, 36, 36)).toBe(3);
    expect(snapEstimateDaysFromDelta(2, -36, 36)).toBe(1);
    expect(snapEstimateDaysFromDelta(2, -1000, 36)).toBe(1);
    expect(snapEstimateDaysFromDelta(5, 18, 36)).toBe(6); // half day rounds up via Math.round
    expect(snapEstimateDaysFromDelta(5, 17, 36)).toBe(5);
  });
});

describe('snapMoveDeltaDays', () => {
  it('snaps body-drag px to signed calendar days', () => {
    expect(snapMoveDeltaDays(36, 36)).toBe(1);
    expect(snapMoveDeltaDays(-72, 36)).toBe(-2);
    expect(snapMoveDeltaDays(17, 36)).toBe(0);
    expect(snapMoveDeltaDays(18, 36)).toBe(1);
  });
});
