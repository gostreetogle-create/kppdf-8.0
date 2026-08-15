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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GanttBarsComponent],
    });
  });

  it('renders legend and a bar with required range', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('План-оценка');
    expect(el.querySelector('[data-test="gantt-legend"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-bar"]')).toBeTruthy();
  });

  it('shows compact label (order · work type) and keeps detail in title', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('ORD-1');
    expect(el.textContent).toContain('Сварка');
    // Product / module stay out of the dense row — available via title + inspector
    const label = el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]') as HTMLElement;
    expect(label?.getAttribute('title')).toContain('Стол');
    expect(label?.getAttribute('title')).toContain('Каркас');
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
    const label = el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]') as HTMLElement;
    const row = el.querySelector('[data-test="gantt-row-o1:0:p1:m1:wt1:1"]') as HTMLElement;
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

  it('shows right-edge resize handle when editable', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('readOnly', false);
    fixture.detectChanges();
    const handle = fixture.nativeElement.querySelector(
      '[data-test="gantt-resize-handle-o1:0:p1:m1:wt1:1"]',
    );
    expect(handle).toBeTruthy();
    expect(handle.getAttribute('aria-label')).toContain('Изменить длительность');
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
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test^="gantt-resize-handle-"]')).toBeFalsy();
  });

  it('emits estimateDaysCommit on pointer resize commit', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges();

    const commits: unknown[] = [];
    fixture.componentInstance.estimateDaysCommit.subscribe((v) => commits.push(v));

    const handle = fixture.nativeElement.querySelector(
      '[data-test="gantt-resize-handle-o1:0:p1:m1:wt1:1"]',
    ) as HTMLElement;
    const rows = fixture.componentInstance['rows']();
    const row = rows[0]!;
    // jsdom lacks PointerEvent — drive the public handlers directly.
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
      row,
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

  it('emits plannedDateMoveCommit on body drag (not resize)', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges();

    const moves: unknown[] = [];
    const resizes: unknown[] = [];
    fixture.componentInstance.plannedDateMoveCommit.subscribe((v) => moves.push(v));
    fixture.componentInstance.estimateDaysCommit.subscribe((v) => resizes.push(v));

    fixture.componentInstance.onMovePointerDown(
      {
        pointerId: 7,
        clientX: 50,
        preventDefault: () => undefined,
        stopPropagation: () => undefined,
        currentTarget: { setPointerCapture: () => undefined },
      } as unknown as PointerEvent,
      sample,
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

  it('does not emit move when starting on resize handle path', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges();

    const moves: unknown[] = [];
    fixture.componentInstance.plannedDateMoveCommit.subscribe((v) => moves.push(v));

    const rows = fixture.componentInstance['rows']();
    fixture.componentInstance.onResizePointerDown(
      {
        pointerId: 2,
        clientX: 100,
        preventDefault: () => undefined,
        stopPropagation: () => undefined,
        currentTarget: { setPointerCapture: () => undefined },
      } as unknown as PointerEvent,
      rows[0]!,
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

  it('disallows body-drag when readOnly or shipped', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.canMoveBar(sample)).toBe(false);

    const shipped: GanttBar = { ...sample, orderStatus: 'shipped' };
    fixture.componentRef.setInput('readOnly', false);
    fixture.componentRef.setInput('bars', [shipped]);
    fixture.detectChanges();
    expect(fixture.componentInstance.canMoveBar(shipped)).toBe(false);
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
