import { TestBed } from '@angular/core/testing';
import { GanttBarsComponent, GANTT_PX_PER_DAY } from './gantt-bars.component';
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

  it('shows order number on labels and work-type legend', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('ORD-1');
    expect(el.textContent).toContain('Стол');
    expect(el.querySelector('[data-test="gantt-worktype-legend"]')?.textContent).toContain(
      'Сварка',
    );
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
});
