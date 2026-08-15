import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  GanttBarsComponent,
  GANTT_LABEL_COL_PX,
  GANTT_PX_PER_DAY,
  calculateGanttPxPerDay,
  calculateCenteredMarkerScrollLeft,
  ganttMonthTickLabel,
  ganttWeekdayShortRu,
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
      providers: [provideRouter([])],
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
    expect(el.querySelector('[data-test="gantt-label-header"]')?.textContent).toContain('Заказ');
    expect(el.querySelector('[data-test="gantt-label-header"]')?.textContent).not.toContain(
      'работа',
    );
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
    expect(el.querySelector('[data-test="gantt-label-header"]')?.textContent).toContain(
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
    const workDetails: string[] = [];
    fixture.componentInstance.orderLabelClick.subscribe((id) => clicks.push(id));
    fixture.componentInstance.toggleExpand.subscribe((id) => toggles.push(id));
    fixture.componentInstance.toggleWorkDetail.subscribe((id) => workDetails.push(id));

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
    expect(workDetails).toEqual(['o1:0:p1:m1:wt1:1']);

    const timelineRow = fixture.nativeElement.querySelector(
      '[data-test="gantt-row-summary:o1"]',
    ) as HTMLElement;
    timelineRow.click();
    expect(clicks).toEqual(['o1']);
    expect(toggles).toEqual([]);
  });

  it('TZ-PRODUCTION-320: expand column + distinct a11y; chevron never emits orderLabelClick', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const expand = el.querySelector('[data-test="gantt-expand-o1"]') as HTMLElement;
    const labelBtn = el.querySelector(
      '[data-test="gantt-label-summary:o1"] button.flex-1',
    ) as HTMLElement;
    expect(expand.classList.contains('gantt-expand-col')).toBe(true);
    expect(expand.classList.contains('gantt-expand-btn')).toBe(true);
    expect(expand.classList.contains('border-r')).toBe(false); // vertical split via CSS only
    expect(expand.getAttribute('aria-label')).toContain('состав на Ганте');
    expect(labelBtn.getAttribute('aria-label')).toContain('Статус и даты заказа');
    expect(labelBtn.getAttribute('title')).toContain('Статус и даты заказа');
    const header = el.querySelector('[data-test="gantt-label-header"]') as HTMLElement;
    expect(header.textContent).toContain('Заказ');
    expect(header.textContent).not.toMatch(/[▸▾]/);

    const clicks: string[] = [];
    const toggles: string[] = [];
    fixture.componentInstance.orderLabelClick.subscribe((id) => clicks.push(id));
    fixture.componentInstance.toggleExpand.subscribe((id) => toggles.push(id));
    expand.click();
    expect(toggles).toEqual(['o1']);
    expect(clicks).toEqual([]);
    labelBtn.click();
    expect(clicks).toEqual(['o1']);
    expect(toggles).toEqual(['o1']);
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
    const titleBtn = label?.querySelector('button.gantt-label-btn') as HTMLElement | null;
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

  it('highlightOrderId marks active order rows (order-meta open)', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('highlightOrderId', 'o1');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const label = el.querySelector('[data-test="gantt-label-summary:o1"]') as HTMLElement;
    const row = el.querySelector('[data-test="gantt-row-summary:o1"]') as HTMLElement;
    expect(label.classList.contains('gantt-order-active')).toBe(true);
    expect(row.classList.contains('gantt-order-active')).toBe(true);
    expect(label.getAttribute('data-active-order')).toBe('true');
    expect(row.getAttribute('data-active-order')).toBe('true');
    fixture.componentRef.setInput('highlightOrderId', null);
    fixture.detectChanges();
    expect(label.classList.contains('gantt-order-active')).toBe(false);
    expect(row.getAttribute('data-active-order')).toBeNull();
  });

  it('expandedOrderIds marks tree-expanded order rows (▸ open)', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const label = el.querySelector('[data-test="gantt-label-summary:o1"]') as HTMLElement;
    const row = el.querySelector('[data-test="gantt-row-summary:o1"]') as HTMLElement;
    expect(label.classList.contains('gantt-order-expanded')).toBe(true);
    expect(row.classList.contains('gantt-order-expanded')).toBe(true);
    expect(label.getAttribute('data-expanded-order')).toBe('true');
    /* Meta-active wins over tree-expanded styling. */
    fixture.componentRef.setInput('highlightOrderId', 'o1');
    fixture.detectChanges();
    expect(label.classList.contains('gantt-order-active')).toBe(true);
    expect(label.classList.contains('gantt-order-expanded')).toBe(false);
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

  it('fits month density to the measured timeline width without shrinking day mode', () => {
    expect(calculateGanttPxPerDay('month', 14, 700)).toBe(50);
    expect(calculateGanttPxPerDay('month', 100, 700)).toBe(GANTT_PX_PER_DAY.month);
    expect(calculateGanttPxPerDay('day', 14, 700)).toBe(GANTT_PX_PER_DAY.day);
  });

  it('day vs month zoom changes px density and scale hint', () => {
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

    fixture.componentRef.setInput('zoom', 'month');
    fixture.detectChanges();
    expect(root.getAttribute('data-zoom')).toBe('month');
    expect(fixture.nativeElement.textContent).toContain('масштаб: месяц');
    expect(fixture.nativeElement.textContent).not.toContain('н.');
    expect(fixture.componentInstance['pxPerDay']()).toBe(GANTT_PX_PER_DAY.month);
    expect(fixture.componentInstance['timelineMinWidth']()).toBeLessThan(
      14 * GANTT_PX_PER_DAY.day + 224,
    );
  });

  it('TZ-PRODUCTION-330: month ticks use RU month names, not week numbers', () => {
    expect(ganttMonthTickLabel('2026-08-15')).toBe('август');
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-15');
    fixture.componentRef.setInput('rangeEnd', '2026-10-02');
    fixture.componentRef.setInput('zoom', 'month');
    fixture.detectChanges();
    const ticks = fixture.componentInstance['scaleTicks']() as Array<{
      label: string;
      weekdayLabel: string;
    }>;
    expect(ticks.map((t) => t.label)).toEqual(['август', 'сентябрь', 'октябрь']);
    expect(ticks.every((t) => !t.weekdayLabel)).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('август');
    expect(fixture.nativeElement.textContent).not.toMatch(/н\.\d+/);
  });

  it('TZ-PRODUCTION-332: UTC weekday maps to RU abbr', () => {
    expect(ganttWeekdayShortRu('2026-08-03')).toBe('ПН');
    expect(ganttWeekdayShortRu('2026-08-04')).toBe('ВТ');
    expect(ganttWeekdayShortRu('2026-07-31')).toBe('ПТ');
    expect(ganttWeekdayShortRu('2026-08-02')).toBe('ВС');
  });

  it('TZ-PRODUCTION-332: day ticks show DD.MM plus weekday; headers are h-10', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-03');
    fixture.componentRef.setInput('rangeEnd', '2026-08-05');
    fixture.componentRef.setInput('zoom', 'day');
    fixture.detectChanges();
    const ticks = fixture.componentInstance['scaleTicks']() as Array<{
      dateLabel: string;
      weekdayLabel: string;
    }>;
    expect(ticks[0]).toEqual(expect.objectContaining({ dateLabel: '03.08', weekdayLabel: 'ПН' }));
    expect(ticks[1]).toEqual(expect.objectContaining({ dateLabel: '04.08', weekdayLabel: 'ВТ' }));
    const el: HTMLElement = fixture.nativeElement;
    const mondayTick = el.querySelector('[data-test="gantt-tick-2026-08-03"]') as HTMLElement;
    expect(mondayTick.querySelector('[data-test="gantt-tick-date"]')?.textContent).toContain(
      '03.08',
    );
    expect(mondayTick.querySelector('[data-test="gantt-tick-weekday"]')?.textContent).toContain(
      'ПН',
    );
    expect(el.querySelector('[data-test="gantt-tick-2026-08-04"]')?.textContent).toContain('ВТ');
    const scale = el.querySelector('[data-test="gantt-scale"]') as HTMLElement;
    const label = el.querySelector('[data-test="gantt-label-header"]') as HTMLElement;
    expect(scale.classList.contains('h-10')).toBe(true);
    expect(scale.classList.contains('h-7')).toBe(false);
    expect(label.classList.contains('h-10')).toBe(true);
    expect(label.classList.contains('h-7')).toBe(false);
  });

  it('TZ-PRODUCTION-330: Сегодня recenters the marker even when already in view', () => {
    expect(
      calculateCenteredMarkerScrollLeft({
        scrollLeft: 0,
        scrollWidth: 2000,
        clientWidth: 400,
        scrollLeftEdge: 0,
        markerLeft: 80,
        markerWidth: 2,
      }),
    ).toBe(0);
    expect(
      calculateCenteredMarkerScrollLeft({
        scrollLeft: 0,
        scrollWidth: 2000,
        clientWidth: 400,
        scrollLeftEdge: 0,
        markerLeft: 500,
        markerWidth: 2,
      }),
    ).toBe(301);
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

  it('uses canEditOrder for summary planned-date drag but catalog write for child drag', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', false);
    fixture.componentRef.setInput('canEditOrder', true);
    fixture.detectChanges();

    const summary = fixture.componentInstance['rows']()[0]!.bar;
    expect(fixture.componentInstance.canMoveBar(summary)).toBe(true);
    expect(fixture.componentInstance.canMoveBar(sample)).toBe(false);

    fixture.componentRef.setInput('canEditOrder', false);
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.canMoveBar(summary)).toBe(false);
    expect(fixture.componentInstance.canMoveBar(sample)).toBe(true);
  });

  it('emits plannedDateMoveCommit on summary body drag only', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('canEditOrder', true);
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

  it('TZ-PRODUCTION-321: child label opens work-detail with people and days', () => {
    const withPeople: GanttBar = { ...sample, workerLabel: 'Иванов' };
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [withPeople, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const emitted: string[] = [];
    fixture.componentInstance.toggleWorkDetail.subscribe((id) => emitted.push(id));

    const childLabel = el.querySelector(
      '[data-test="gantt-label-o1:0:p1:m1:wt1:1"] button.flex-1',
    ) as HTMLElement;
    childLabel.click();
    expect(emitted).toEqual(['o1:0:p1:m1:wt1:1']);

    fixture.componentRef.setInput('expandedWorkBarId', 'o1:0:p1:m1:wt1:1');
    fixture.detectChanges();
    const detail = el.querySelector(
      '[data-test="gantt-work-detail-o1:0:p1:m1:wt1:1"]',
    ) as HTMLElement;
    const timeline = el.querySelector(
      '[data-test="gantt-work-detail-timeline-o1:0:p1:m1:wt1:1"]',
    ) as HTMLElement;
    const days = el.querySelector(
      '[data-test="gantt-work-detail-days-o1:0:p1:m1:wt1:1"]',
    ) as HTMLInputElement;
    const people = el.querySelector(
      '[data-test="gantt-work-detail-people-o1:0:p1:m1:wt1:1"]',
    ) as HTMLElement;
    const childRow = el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]') as HTMLElement;
    expect(detail).toBeTruthy();
    expect(timeline).toBeTruthy();
    expect(detail.textContent).toContain('только этот заказ');
    expect(people.textContent).toContain('Люди: Иванов');
    expect(days.value).toBe('2');
    expect(childRow.classList.contains('gantt-work-detail-open')).toBe(true);
    expect(childRow.getAttribute('data-work-detail-open')).toBe('true');
    expect(getComputedStyle(detail).height).toBe(getComputedStyle(timeline).height);
    expect(
      el.querySelector('[data-test="gantt-work-detail-catalog-o1:0:p1:m1:wt1:1"]'),
    ).toBeTruthy();
  });

  it('TZ-PRODUCTION-321: child ▸ toggles; second child closes first; catalog hidden without write', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('canEdit', false);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const emitted: string[] = [];
    fixture.componentInstance.toggleWorkDetail.subscribe((id) => emitted.push(id));

    const chevron = el.querySelector(
      '[data-test="gantt-work-expand-o1:0:p1:m1:wt1:1"]',
    ) as HTMLElement;
    chevron.click();
    expect(emitted).toEqual(['o1:0:p1:m1:wt1:1']);

    fixture.componentRef.setInput('expandedWorkBarId', sample.id);
    fixture.detectChanges();
    expect(el.querySelector(`[data-test="gantt-work-detail-${sample.id}"]`)).toBeTruthy();
    expect(el.querySelector(`[data-test="gantt-work-detail-catalog-${sample.id}"]`)).toBeNull();

    const paintLabel = el.querySelector(
      `[data-test="gantt-label-${samplePaint.id}"] button.flex-1`,
    ) as HTMLElement;
    paintLabel.click();
    expect(emitted).toEqual([sample.id, samplePaint.id]);

    fixture.componentRef.setInput('expandedWorkBarId', samplePaint.id);
    fixture.detectChanges();
    expect(el.querySelector(`[data-test="gantt-work-detail-${sample.id}"]`)).toBeNull();
    expect(el.querySelector(`[data-test="gantt-work-detail-${samplePaint.id}"]`)).toBeTruthy();

    paintLabel.click();
    expect(emitted.at(-1)).toBe(samplePaint.id);
    fixture.componentRef.setInput('expandedWorkBarId', null);
    fixture.detectChanges();
    expect(el.querySelector(`[data-test="gantt-work-detail-${samplePaint.id}"]`)).toBeNull();
  });

  it('TZ-PRODUCTION-321: timeline bar click does not open work-detail; days input uses resize path', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('expandedWorkBarId', sample.id);
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const details: string[] = [];
    const commits: unknown[] = [];
    fixture.componentInstance.toggleWorkDetail.subscribe((id) => details.push(id));
    fixture.componentInstance.estimateDaysCommit.subscribe((v) => commits.push(v));

    const bar = el.querySelector('[data-test="gantt-bar"]') as HTMLElement;
    bar.click();
    expect(details).toEqual([]);

    const days = el.querySelector(
      `[data-test="gantt-work-detail-days-${sample.id}"]`,
    ) as HTMLInputElement;
    days.value = '5';
    days.dispatchEvent(new Event('change'));
    expect(commits).toEqual([
      {
        orderId: 'o1',
        orderItemIndex: 0,
        moduleId: 'm1',
        workTypeId: 'wt1',
        days: 5,
      },
    ]);
  });

  it('TZ-PRODUCTION-322: order-meta strip under summary; save emits PATCH payload', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('highlightOrderId', 'o1');
    fixture.componentRef.setInput('canEditOrder', true);
    fixture.componentRef.setInput('orderMeta', {
      orderId: 'o1',
      number: 'ORD-1',
      status: 'confirmed',
      priority: 'normal',
      plannedDate: '2026-08-01',
    });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const strip = el.querySelector('[data-test="gantt-order-meta-o1"]') as HTMLElement;
    const timeline = el.querySelector('[data-test="gantt-order-meta-timeline-o1"]') as HTMLElement;
    expect(strip).toBeTruthy();
    expect(timeline).toBeTruthy();
    expect(strip.textContent).toContain('Статус: Подтверждён');
    expect(el.querySelector('[data-test="gantt-order-meta-priority"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-order-meta-planned"]')).toBeTruthy();
    expect(
      el.querySelector('[data-test="gantt-order-meta-open-order"]')?.getAttribute('href'),
    ).toContain('/orders');
    expect(getComputedStyle(strip).height).toBe(getComputedStyle(timeline).height);

    const commits: unknown[] = [];
    fixture.componentInstance.orderMetaCommit.subscribe((v) => commits.push(v));
    const priority = el.querySelector(
      '[data-test="gantt-order-meta-priority"]',
    ) as HTMLSelectElement;
    priority.value = 'urgent';
    priority.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const save = el.querySelector('[data-test="gantt-order-meta-save"]') as HTMLButtonElement;
    expect(save.disabled).toBe(false);
    save.click();
    expect(commits).toEqual([{ orderId: 'o1', priority: 'urgent', plannedDate: '2026-08-01' }]);

    fixture.componentRef.setInput('orderMeta', null);
    fixture.detectChanges();
    expect(el.querySelector('[data-test="gantt-order-meta-o1"]')).toBeNull();
  });

  it('TZ-PRODUCTION-323: order-meta renders once under summary when children expanded', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('highlightOrderId', 'o1');
    fixture.componentRef.setInput('orderMeta', {
      orderId: 'o1',
      number: 'ORD-1',
      status: 'confirmed',
      priority: 'normal',
      plannedDate: '2026-08-01',
    });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('[data-test="gantt-order-meta-o1"]').length).toBe(1);
    expect(el.querySelectorAll('[data-test="gantt-order-meta-timeline-o1"]').length).toBe(1);
    const labels = Array.from(el.querySelectorAll('[data-test^="gantt-label-"]'));
    const iSum = labels.findIndex((n) => n.getAttribute('data-test') === 'gantt-label-summary:o1');
    const iChild = labels.findIndex(
      (n) => n.getAttribute('data-test') === 'gantt-label-o1:0:p1:m1:wt1:1',
    );
    const meta = el.querySelector('[data-test="gantt-order-meta-o1"]') as HTMLElement;
    const summary = labels[iSum] as HTMLElement;
    const child = labels[iChild] as HTMLElement;
    expect(iSum).toBeGreaterThanOrEqual(0);
    expect(iChild).toBeGreaterThan(iSum);
    expect(summary.compareDocumentPosition(meta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(meta.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('TZ-PRODUCTION-323: cascade panels span label + timeline (full-width)', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('expandedWorkBarId', sample.id);
    fixture.componentRef.setInput('orderMeta', {
      orderId: 'o1',
      number: 'ORD-1',
      status: 'confirmed',
      priority: 'normal',
      plannedDate: '2026-08-01',
    });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const meta = el.querySelector('[data-test="gantt-order-meta-o1"]') as HTMLElement;
    const detail = el.querySelector(`[data-test="gantt-work-detail-${sample.id}"]`) as HTMLElement;
    const metaTl = el.querySelector('[data-test="gantt-order-meta-timeline-o1"]') as HTMLElement;
    const detailTl = el.querySelector(
      `[data-test="gantt-work-detail-timeline-${sample.id}"]`,
    ) as HTMLElement;
    const boardMin = fixture.componentInstance['timelineMinWidth']();
    expect(meta.classList.contains('gantt-cascade-panel')).toBe(true);
    expect(detail.classList.contains('gantt-cascade-panel')).toBe(true);
    expect(metaTl.classList.contains('gantt-cascade-spacer')).toBe(true);
    expect(detailTl.classList.contains('gantt-cascade-spacer')).toBe(true);
    expect(boardMin).toBeGreaterThan(GANTT_LABEL_COL_PX);
    expect(Number.parseFloat(meta.style.minWidth)).toBe(boardMin);
    expect(Number.parseFloat(detail.style.minWidth)).toBe(boardMin);
    expect(getComputedStyle(meta).height).toBe(getComputedStyle(metaTl).height);
    expect(getComputedStyle(detail).height).toBe(getComputedStyle(detailTl).height);
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
