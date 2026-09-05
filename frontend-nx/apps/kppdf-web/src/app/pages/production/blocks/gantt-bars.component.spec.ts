import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  GanttBarsComponent,
  GANTT_PX_PER_DAY,
} from './gantt-bars.component';
import {
  buildWorkerTreeBars,
  isWorkerSummaryBar,
  type GanttBar,
} from '../gantt-bar.model';

/**
 * TZ-NX-GANTT-G4 — zoom/pan/scroll regression:
 * - day/month density parity with legacy;
 * - `scrollRequest.target='bar'` re-anchors the viewport to the moved row
 *   (the «залипает справа» fix) without crashing in jsdom (no layout).
 */
describe('GanttBarsComponent (TZ-NX-GANTT-G4 pan/zoom)', () => {
  function makeBar(overrides: Partial<GanttBar>): GanttBar {
    return {
      id: 'o1:0:p1:m1:wt1',
      orderId: 'o1',
      orderNumber: 'ORD-1',
      orderStatus: 'confirmed',
      orderItemIndex: 0,
      productId: 'p1',
      productName: 'Стол',
      moduleId: 'm1',
      moduleName: 'Корпус',
      workTypeId: 'wt1',
      workTypeName: 'Распил',
      days: 3,
      startDate: '2026-09-02',
      endDate: '2026-09-04',
      noTerm: false,
      kind: 'work',
      quantity: 1,
      workerLabel: '—',
      ...overrides,
    } as GanttBar;
  }

  async function setup(bars: GanttBar[], rangeStart: string, rangeEnd: string) {
    await TestBed.configureTestingModule({
      imports: [GanttBarsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', bars);
    fixture.componentRef.setInput('rangeStart', rangeStart);
    fixture.componentRef.setInput('rangeEnd', rangeEnd);
    fixture.componentRef.setInput('zoom', 'month');
    fixture.detectChanges();
    return fixture;
  }

  it('month density floors at 12px/day and day mode stays 36px/day (legacy parity)', () => {
    expect(GANTT_PX_PER_DAY['day']).toBe(36);
    expect(GANTT_PX_PER_DAY['month']).toBe(12);
  });

  it('removes the obsolete lower legend while keeping the upper Work Type legend', async () => {
    const fixture = await setup([makeBar({})], '2026-09-01', '2026-09-21');
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="gantt-legend"]')).toBeNull();
    expect(root.querySelector('[data-test="gantt-worktype-legend"]')).toBeTruthy();
  });

  it('keeps the calendar pane separate from the sticky label pane', async () => {
    const fixture = await setup([makeBar({})], '2026-09-01', '2026-09-21');
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.gantt-calendar-pane')).toBeTruthy();
    expect(root.querySelector('.gantt-calendar-pane [data-test="gantt-scale"]')).toBeTruthy();
    expect(root.querySelector('.gantt-calendar-pane')?.classList.contains('bg-paper-2')).toBe(true);
    expect(root.querySelector('.sticky.w-52')?.classList.contains('bg-paper')).toBe(true);
  });

  it('renders a shifted bar that starts before rangeStart (negative left is clamped visually, not crashed)', async () => {
    // Order shifted 10 days earlier than rangeStart → left < 0 in px terms.
    const shifted = makeBar({ startDate: '2026-08-20', endDate: '2026-08-22' });
    const fixture = await setup([shifted], '2026-09-01', '2026-09-21');
    // Expand the full tree chain so the work bar row renders.
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput(
      'expandedProductIds',
      new Set(['product:o1:0']),
    );
    fixture.componentRef.setInput(
      'expandedModuleIds',
      new Set(['module:o1:0:m1']),
    );
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    // Bar row still renders; the page widens the range via refitRangeAfterShift.
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(1);
    expect(el.textContent).toContain('Распил');
  });

  it('renders a shifted bar that ends after rangeEnd (forward range remains renderable)', async () => {
    // Order shifted beyond the right edge → the page widens rangeEnd via refitRangeAfterShift.
    const shifted = makeBar({ startDate: '2026-10-01', endDate: '2026-10-03' });
    const fixture = await setup([shifted], '2026-09-01', '2026-09-21');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('expandedProductIds', new Set(['product:o1:0']));
    fixture.componentRef.setInput('expandedModuleIds', new Set(['module:o1:0:m1']));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(1);
    expect(el.textContent).toContain('Распил');
  });

  it('worker summary rows are read-only for move and resize', async () => {
    const workerBar = makeBar({ workerLabel: 'Иванов' });
    const fixture = await setup([workerBar], '2026-09-01', '2026-09-21');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('canEditOrder', true);
    fixture.detectChanges();

    const summary = buildWorkerTreeBars([workerBar])[0]!;
    expect(isWorkerSummaryBar(summary)).toBe(true);
    const component = fixture.componentInstance as unknown as {
      canResizeBar(bar: GanttBar): boolean;
      canMoveBar(bar: GanttBar): boolean;
    };
    expect(component.canResizeBar(summary)).toBe(false);
    expect(component.canMoveBar(summary)).toBe(false);
  });

  it('TZ-NX-GANTT-G10: renders product and module thumbnails only on tree summary rows', async () => {
    const fixture = await setup([
      makeBar({ productPhotoUrl: '/thumbs/product.jpg', modulePhotoUrl: '/thumbs/module.jpg' }),
    ], '2026-09-01', '2026-09-21');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('expandedProductIds', new Set(['product:o1:0']));
    fixture.componentRef.setInput('expandedModuleIds', new Set(['module:o1:0:m1']));
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="gantt-photo-product"]')).toBeTruthy();
    expect(root.querySelector('[data-test="gantt-photo-module"]')).toBeTruthy();
    expect(root.querySelectorAll('[data-test="gantt-photo-product"], [data-test="gantt-photo-module"]').length).toBe(2);
    expect(root.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1"] img')).toBeFalsy();
  });

  it('does not render a photo element when tree rows have no populated URL', async () => {
    const fixture = await setup([makeBar({ productPhotoUrl: null, modulePhotoUrl: null })], '2026-09-01', '2026-09-21');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('expandedProductIds', new Set(['product:o1:0']));
    fixture.componentRef.setInput('expandedModuleIds', new Set(['module:o1:0:m1']));
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="gantt-photo-product"]')).toBeFalsy();
    expect(root.querySelector('[data-test="gantt-photo-module"]')).toBeFalsy();
  });

  it('scrollRequest target "bar" re-anchors without errors (viewport pan fix)', async () => {
    const bar = makeBar({});
    const fixture = await setup([bar], '2026-09-01', '2026-09-21');
    const comp = fixture.componentInstance;
    expect(() => {
      comp.scrollToBarId(bar.id);
      comp.scrollToBarId(null);
      comp.scrollToBarId('missing-row');
    }).not.toThrow();
  });
});
