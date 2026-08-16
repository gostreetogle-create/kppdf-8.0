import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  GanttBarsComponent,
  GANTT_LABEL_COL_PX,
  GANTT_NEST_INDENT_PX,
  GANTT_PX_PER_DAY,
  GANTT_SUMMARY_BAR_FILL,
  calculateGanttPxPerDay,
  calculateCenteredMarkerScrollLeft,
  ganttMonthTickLabel,
  ganttNestDepth,
  ganttRowKind,
  ganttWeekdayShortRu,
  snapEstimateDaysFromDelta,
  snapMoveDeltaDays,
} from './gantt-bars.component';
import type { GanttBar } from '../gantt-bar.model';
import {
  UNASSIGNED_WORKER_LABEL,
  resolveWorkTypeHue,
  workTypeOklch,
  workTypeWash,
} from '../gantt-bar.model';

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

  const productKeyO1 = 'product:o1:0';
  const moduleKeyO1 = 'module:o1:0:m1';

  /** Expand Order → Product → Module so work bars are visible (TZ-PRODUCTION-342). */
  function setFullTreeExpand(
    fixture: { componentRef: { setInput: (k: string, v: unknown) => void } },
    orderIds: string[] = ['o1'],
  ): void {
    fixture.componentRef.setInput('expandedOrderIds', new Set(orderIds));
    fixture.componentRef.setInput(
      'expandedProductIds',
      new Set(orderIds.map((id) => `product:${id}:0`)),
    );
    fixture.componentRef.setInput(
      'expandedModuleIds',
      new Set(orderIds.map((id) => `module:${id}:0:m1`)),
    );
  }

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

  it('TZ-PRODUCTION-342: expand order shows products; full path shows work types', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('[data-test="gantt-bar-summary"]').length).toBe(2); // order + product
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(0);
    expect(el.textContent).toContain('Стол');
    expect(el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]')).toBeFalsy();
    expect(el.querySelector('[data-test="gantt-label-header"]')?.textContent).toContain('Заказ');
    expect(el.querySelector('[data-test="gantt-label-header"]')?.textContent).not.toContain('·');

    setFullTreeExpand(fixture);
    fixture.detectChanges();
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(2);
    expect(el.textContent).toContain('Сварка');
    expect(el.textContent).toContain('Покраска');
    expect(el.textContent).toContain('Каркас');

    fixture.componentRef.setInput('expandedOrderIds', new Set());
    fixture.componentRef.setInput('expandedProductIds', new Set());
    fixture.componentRef.setInput('expandedModuleIds', new Set());
    fixture.detectChanges();
    expect(el.querySelector('[data-test="gantt-bar"]')).toBeFalsy();
  });

  it('TZ-PRODUCTION-317/342: expand order inserts products; full path shows work; peer remains', () => {
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
    expect(el.querySelectorAll('[data-test="gantt-bar-summary"]').length).toBe(3); // o1 + product + o2
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(0);
    const labels = Array.from(el.querySelectorAll('[data-test^="gantt-label-"]')).map((n) =>
      (n as HTMLElement).getAttribute('data-test'),
    );
    const iSum1 = labels.indexOf('gantt-label-summary:o1');
    const iProduct = labels.indexOf(`gantt-label-${productKeyO1}`);
    const iSum2 = labels.indexOf('gantt-label-summary:o2');
    expect(iSum1).toBeGreaterThanOrEqual(0);
    expect(iProduct).toBeGreaterThan(iSum1);
    expect(iSum2).toBeGreaterThan(iProduct);

    setFullTreeExpand(fixture, ['o1']);
    fixture.detectChanges();
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(2);
    const labels2 = Array.from(el.querySelectorAll('[data-test^="gantt-label-"]')).map((n) =>
      (n as HTMLElement).getAttribute('data-test'),
    );
    const iChild = labels2.indexOf('gantt-label-o1:0:p1:m1:wt1:1');
    expect(iChild).toBeGreaterThan(labels2.indexOf(`gantt-label-${moduleKeyO1}`));
    expect(iChild).toBeLessThan(labels2.indexOf('gantt-label-summary:o2'));
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
    setFullTreeExpand(fixture);
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

  it('TZ-PRODUCTION-343: product/module expand aria + nested group frames', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('expandedProductIds', new Set([productKeyO1]));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const productExpand = el.querySelector(
      `[data-test="gantt-expand-${productKeyO1}"]`,
    ) as HTMLElement;
    expect(productExpand.getAttribute('aria-label')).toContain('модули изделия');
    expect(productExpand.getAttribute('aria-label')).toContain('Стол');
    expect(productExpand.getAttribute('aria-expanded')).toBe('true');

    const productLabel = el.querySelector(
      `[data-test="gantt-label-${productKeyO1}"]`,
    ) as HTMLElement;
    expect(productLabel.classList.contains('gantt-product-group-start')).toBe(true);
    expect(productLabel.getAttribute('data-product-group-start')).toBe('true');
    expect(productLabel.textContent).toContain('Стол');

    const moduleLabel = el.querySelector(`[data-test="gantt-label-${moduleKeyO1}"]`) as HTMLElement;
    expect(moduleLabel.classList.contains('gantt-product-group-end')).toBe(true);
    expect(moduleLabel.getAttribute('data-product-group-end')).toBe('true');
    expect(moduleLabel.textContent).toContain('Каркас');

    const moduleExpand = el.querySelector(
      `[data-test="gantt-expand-${moduleKeyO1}"]`,
    ) as HTMLElement;
    expect(moduleExpand.getAttribute('aria-label')).toContain('виды работ');
    expect(moduleExpand.getAttribute('aria-label')).toContain('Каркас');
    expect(moduleExpand.getAttribute('aria-expanded')).toBe('false');

    fixture.componentRef.setInput('expandedModuleIds', new Set([moduleKeyO1]));
    fixture.detectChanges();

    expect(moduleExpand.getAttribute('aria-expanded')).toBe('true');
    expect(moduleLabel.classList.contains('gantt-module-group-start')).toBe(true);
    expect(moduleLabel.getAttribute('data-module-group-start')).toBe('true');

    const wtRow = el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]') as HTMLElement;
    expect(wtRow.classList.contains('gantt-module-group-mid')).toBe(true);
    const wtEnd = el.querySelector(`[data-test="gantt-label-${samplePaint.id}"]`) as HTMLElement;
    expect(wtEnd.classList.contains('gantt-module-group-end')).toBe(true);
    expect(wtEnd.getAttribute('data-module-group-end')).toBe('true');
    expect(wtRow.textContent).toContain('Сварка');
  });

  it('TZ-PRODUCTION-345: whole-product module row shows «целиком» label', () => {
    const wholeModuleId = 'p1';
    const wholeBars: GanttBar[] = [
      {
        ...sample,
        id: 'o1:0:p1:p1:wt1:1',
        moduleId: wholeModuleId,
        moduleName: 'Стол · целиком',
      },
      {
        ...samplePaint,
        id: 'o1:0:p1:p1:wt2:2',
        moduleId: wholeModuleId,
        moduleName: 'Стол · целиком',
      },
    ];
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', wholeBars);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.componentRef.setInput('expandedProductIds', new Set([productKeyO1]));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const moduleKey = `module:o1:0:${wholeModuleId}`;
    const moduleLabel = el.querySelector(`[data-test="gantt-label-${moduleKey}"]`) as HTMLElement;
    expect(moduleLabel).toBeTruthy();
    expect(moduleLabel.textContent).toContain('Стол · целиком');
    expect(moduleLabel.textContent).not.toContain('Каркас');
  });

  it('TZ-PRODUCTION-346: nest indent + level wash markers; timeline bars unshifted', () => {
    expect(ganttNestDepth('order')).toBe(0);
    expect(ganttNestDepth('product')).toBe(1);
    expect(ganttNestDepth('module')).toBe(2);
    expect(ganttNestDepth('work')).toBe(3);
    expect(
      ganttRowKind({
        isOrderSummary: false,
        isWorkerSummary: false,
        isProductSummary: true,
        isModuleSummary: false,
      }),
    ).toBe('product');

    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    setFullTreeExpand(fixture);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const orderLabel = el.querySelector('[data-test="gantt-label-summary:o1"]') as HTMLElement;
    const productLabel = el.querySelector(
      `[data-test="gantt-label-${productKeyO1}"]`,
    ) as HTMLElement;
    const moduleLabel = el.querySelector(`[data-test="gantt-label-${moduleKeyO1}"]`) as HTMLElement;
    const workLabel = el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]') as HTMLElement;
    expect(orderLabel.getAttribute('data-nest-depth')).toBe('0');
    expect(productLabel.getAttribute('data-nest-depth')).toBe('1');
    expect(moduleLabel.getAttribute('data-nest-depth')).toBe('2');
    expect(workLabel.getAttribute('data-nest-depth')).toBe('3');
    expect(productLabel.getAttribute('data-row-kind')).toBe('product');
    expect(moduleLabel.getAttribute('data-row-kind')).toBe('module');
    expect(workLabel.getAttribute('data-row-kind')).toBe('work');
    expect(productLabel.classList.contains('gantt-level-product')).toBe(true);
    expect(moduleLabel.classList.contains('gantt-level-module')).toBe(true);
    expect(workLabel.classList.contains('gantt-level-work')).toBe(true);
    expect(orderLabel.classList.contains('gantt-level-order')).toBe(true);

    const productPad = Number.parseFloat(
      getComputedStyle(productLabel.querySelector('.gantt-label-btn') as HTMLElement).paddingLeft,
    );
    const modulePad = Number.parseFloat(
      getComputedStyle(moduleLabel.querySelector('.gantt-label-btn') as HTMLElement).paddingLeft,
    );
    const workPad = Number.parseFloat(
      getComputedStyle(workLabel.querySelector('.gantt-label-btn') as HTMLElement).paddingLeft,
    );
    expect(productPad).toBe(GANTT_NEST_INDENT_PX);
    expect(modulePad).toBe(GANTT_NEST_INDENT_PX * 2);
    expect(workPad).toBe(GANTT_NEST_INDENT_PX * 3);

    const workRow = el.querySelector('[data-test="gantt-row-o1:0:p1:m1:wt1:1"]') as HTMLElement;
    expect(workRow.getAttribute('data-row-kind')).toBe('work');
    expect(workRow.getAttribute('data-nest-depth')).toBeNull();
    expect(workRow.classList.contains('gantt-level-work')).toBe(true);
    const bar = workRow.querySelector('[data-test="gantt-bar"]') as HTMLElement;
    expect(bar).toBeTruthy();
    expect(bar.style.left).toBeTruthy();

    const hostStyles = Array.from(el.ownerDocument.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('\n');
    expect(hostStyles).toContain('--gantt-level-order');
    expect(hostStyles).toContain('--gantt-level-product');
    expect(hostStyles).toContain('--gantt-level-module');
    expect(hostStyles).toContain('oklch(0.945 0.016 84)');
    expect(hostStyles).toContain('oklch(0.965 0.012 82)');
    expect(hostStyles).toContain('oklch(0.985 0.006 85)');
    /* Frames / meta still present (hierarchy intact). */
    expect(hostStyles).toContain('oklch(0.92 0.022 86)');
    expect(hostStyles).toContain('oklch(0.995 0.008 95)');
  });

  it('TZ-PRODUCTION-346: worker lens module/work nest indent', () => {
    const assigned: GanttBar = { ...sample, workerLabel: 'Иванов Иван' };
    const paint: GanttBar = { ...samplePaint, workerLabel: 'Иванов Иван' };
    const moduleId = `worker-module:Иванов Иван:${assigned.orderId}:${assigned.orderItemIndex}:${assigned.moduleId}`;
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [assigned, paint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.componentRef.setInput('expandedWorkerIds', new Set(['Иванов Иван']));
    fixture.componentRef.setInput('expandedWorkerModuleIds', new Set([moduleId]));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const workerLabel = el.querySelector(
      '[data-test="gantt-label-worker-summary:Иванов Иван"]',
    ) as HTMLElement;
    const moduleLabel = el.querySelector(`[data-test="gantt-label-${moduleId}"]`) as HTMLElement;
    const workLabel = el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]') as HTMLElement;
    expect(workerLabel.getAttribute('data-nest-depth')).toBe('0');
    expect(moduleLabel.getAttribute('data-nest-depth')).toBe('2');
    expect(workLabel.getAttribute('data-nest-depth')).toBe('3');
    const modulePad = Number.parseFloat(
      getComputedStyle(moduleLabel.querySelector('.gantt-label-btn') as HTMLElement).paddingLeft,
    );
    const workPad = Number.parseFloat(
      getComputedStyle(workLabel.querySelector('.gantt-label-btn') as HTMLElement).paddingLeft,
    );
    expect(modulePad).toBe(GANTT_NEST_INDENT_PX * 2);
    expect(workPad).toBe(GANTT_NEST_INDENT_PX * 3);
  });

  it('TZ-PRODUCTION-339: chevron ≥14px ink, expand hit ≥36px; not text-[10px]', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    setFullTreeExpand(fixture);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const expand = el.querySelector('[data-test="gantt-expand-o1"]') as HTMLElement;
    const chevron = expand.querySelector('.gantt-chevron') as HTMLElement;
    expect(chevron).toBeTruthy();
    expect(chevron.classList.contains('text-[10px]')).toBe(false);
    expect(expand.classList.contains('text-muted-foreground')).toBe(false);
    const chevronSize = Number.parseFloat(getComputedStyle(chevron).fontSize);
    expect(chevronSize).toBeGreaterThanOrEqual(14);
    const colWidth = Number.parseFloat(getComputedStyle(expand).width);
    expect(colWidth).toBeGreaterThanOrEqual(36);
    expect(expand.getAttribute('aria-expanded')).toBe('true');

    const workExpand = el.querySelector(
      '[data-test="gantt-work-expand-o1:0:p1:m1:wt1:1"]',
    ) as HTMLElement;
    const workChevron = workExpand.querySelector('.gantt-chevron') as HTMLElement;
    expect(workChevron.classList.contains('text-[10px]')).toBe(false);
    expect(Number.parseFloat(getComputedStyle(workChevron).fontSize)).toBeGreaterThanOrEqual(14);
  });

  it('TZ-PRODUCTION-339: two expanded orders get group-start/end frame markers', () => {
    const peer: GanttBar = {
      ...sample,
      id: 'o2:0:p1:m1:wt1:1',
      orderId: 'o2',
      orderNumber: 'ORD-2',
    };
    const peerPaint: GanttBar = {
      ...samplePaint,
      id: 'o2:0:p1:m1:wt2:2',
      orderId: 'o2',
      orderNumber: 'ORD-2',
    };
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint, peer, peerPaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    setFullTreeExpand(fixture, ['o1', 'o2']);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const sum1 = el.querySelector('[data-test="gantt-label-summary:o1"]') as HTMLElement;
    const sum2 = el.querySelector('[data-test="gantt-label-summary:o2"]') as HTMLElement;
    const end1 = el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt2:2"]') as HTMLElement;
    const end2 = el.querySelector('[data-test="gantt-label-o2:0:p1:m1:wt2:2"]') as HTMLElement;
    expect(sum1.classList.contains('gantt-order-group-start')).toBe(true);
    expect(sum2.classList.contains('gantt-order-group-start')).toBe(true);
    expect(sum1.getAttribute('data-order-group-start')).toBe('true');
    expect(end1.classList.contains('gantt-order-group-end')).toBe(true);
    expect(end2.classList.contains('gantt-order-group-end')).toBe(true);
    expect(end1.getAttribute('data-order-group-end')).toBe('true');
    expect(sum1.classList.contains('gantt-order-expanded')).toBe(true);
    expect(sum2.classList.contains('gantt-order-expanded')).toBe(true);

    const rowSum1 = el.querySelector('[data-test="gantt-row-summary:o1"]') as HTMLElement;
    expect(rowSum1.classList.contains('gantt-order-group-start')).toBe(true);
    expect(rowSum1.getAttribute('data-order-group-start')).toBe('true');

    /* Chevron still separated from orderLabelClick (320). */
    const clicks: string[] = [];
    const toggles: string[] = [];
    fixture.componentInstance.orderLabelClick.subscribe((id) => clicks.push(id));
    fixture.componentInstance.toggleExpand.subscribe((id) => toggles.push(id));
    (el.querySelector('[data-test="gantt-expand-o1"]') as HTMLElement).click();
    expect(toggles).toEqual(['o1']);
    expect(clicks).toEqual([]);
  });

  it('TZ-PRODUCTION-340: group-start summary wash marker vs mid children', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    setFullTreeExpand(fixture);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const sum = el.querySelector('[data-test="gantt-label-summary:o1"]') as HTMLElement;
    const child = el.querySelector(`[data-test="gantt-label-${sample.id}"]`) as HTMLElement;
    expect(sum.classList.contains('gantt-order-group-start')).toBe(true);
    expect(sum.classList.contains('gantt-order-expanded')).toBe(true);
    expect(child.classList.contains('gantt-order-expanded')).toBe(true);
    expect(child.classList.contains('gantt-order-group-start')).toBe(false);

    const hostStyles = Array.from(el.ownerDocument.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('\n');
    expect(hostStyles).toContain('--gantt-level-order');
    expect(hostStyles).toContain('oklch(0.92 0.022 86)');
    /* Expanded frame must not paint children with beige !important. */
    expect(hostStyles).not.toMatch(
      /\.gantt-order-expanded\s*\{[^}]*background:\s*oklch\(0\.97 0\.012 95\)\s*!important/,
    );
    expect(hostStyles).toContain('oklch(0.26 0.03 86)');
  });

  it('TZ-PRODUCTION-350: mono milk ladder — one hue family; no rainbow jumps', () => {
    expect(GANTT_SUMMARY_BAR_FILL.order).toBe('oklch(0.90 0.028 86)');
    expect(GANTT_SUMMARY_BAR_FILL.product).toBe('oklch(0.925 0.022 84)');
    expect(GANTT_SUMMARY_BAR_FILL.module).toBe('oklch(0.945 0.016 82)');
    expect(GANTT_SUMMARY_BAR_FILL.order).not.toBe(GANTT_SUMMARY_BAR_FILL.product);
    expect(GANTT_SUMMARY_BAR_FILL.product).not.toBe(GANTT_SUMMARY_BAR_FILL.module);

    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    setFullTreeExpand(fixture);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const cmp = fixture.componentInstance;

    const rows = cmp['rows']() as Array<{
      bar: { id: string; workTypeId: string; accentHue?: number | null };
      isSummary: boolean;
      rowKind: 'order' | 'worker' | 'product' | 'module' | 'work';
    }>;
    const orderRow = rows.find((r) => r.rowKind === 'order')!;
    const productRow = rows.find((r) => r.rowKind === 'product')!;
    const moduleRow = rows.find((r) => r.rowKind === 'module')!;
    const workRow = rows.find((r) => r.rowKind === 'work')!;

    expect(cmp.barFill(orderRow)).toBe(GANTT_SUMMARY_BAR_FILL.order);
    expect(cmp.barFill(productRow)).toBe(GANTT_SUMMARY_BAR_FILL.product);
    expect(cmp.barFill(moduleRow)).toBe(GANTT_SUMMARY_BAR_FILL.module);
    const workFill = cmp.barFill(workRow);
    expect(workFill).not.toBe(GANTT_SUMMARY_BAR_FILL.order);
    expect(workFill).toMatch(/^oklch\(/);

    const hostStyles = Array.from(el.ownerDocument.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('\n');
    expect(hostStyles).toContain('oklch(0.92 0.022 86)');
    expect(hostStyles).toContain('oklch(0.945 0.016 84)');
    expect(hostStyles).toContain('oklch(0.965 0.012 82)');
    expect(hostStyles).toContain('oklch(0.985 0.006 85)');
    /* No rainbow hue jumps from 349. */
    expect(hostStyles).not.toContain('oklch(0.96 0.025 240)');
    expect(hostStyles).not.toContain('oklch(0.96 0.03 70)');
    expect(hostStyles).not.toContain('oklch(0.988 0.006 145)');
    expect(hostStyles).not.toContain('oklch(0.90 0.028 240)');
    expect(hostStyles).toContain(GANTT_SUMMARY_BAR_FILL.order);
    expect(hostStyles).toContain(GANTT_SUMMARY_BAR_FILL.product);
    expect(hostStyles).toContain(GANTT_SUMMARY_BAR_FILL.module);
  });

  it('TZ-PRODUCTION-349: summary barFill distinct per level; WT accent unchanged', () => {
    expect(GANTT_SUMMARY_BAR_FILL.order).not.toBe(GANTT_SUMMARY_BAR_FILL.product);
    expect(GANTT_SUMMARY_BAR_FILL.product).not.toBe(GANTT_SUMMARY_BAR_FILL.module);
    expect(GANTT_SUMMARY_BAR_FILL.order).not.toBe(GANTT_SUMMARY_BAR_FILL.module);

    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    setFullTreeExpand(fixture);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const cmp = fixture.componentInstance;

    const rows = cmp['rows']() as Array<{
      bar: { id: string; workTypeId: string; accentHue?: number | null };
      isSummary: boolean;
      rowKind: 'order' | 'worker' | 'product' | 'module' | 'work';
    }>;
    const orderRow = rows.find((r) => r.rowKind === 'order')!;
    const productRow = rows.find((r) => r.rowKind === 'product')!;
    const moduleRow = rows.find((r) => r.rowKind === 'module')!;
    const workRow = rows.find((r) => r.rowKind === 'work')!;

    expect(cmp.barFill(orderRow)).toBe(GANTT_SUMMARY_BAR_FILL.order);
    expect(cmp.barFill(productRow)).toBe(GANTT_SUMMARY_BAR_FILL.product);
    expect(cmp.barFill(moduleRow)).toBe(GANTT_SUMMARY_BAR_FILL.module);
    const workFill = cmp.barFill(workRow);
    expect(workFill).not.toBe(GANTT_SUMMARY_BAR_FILL.order);
    expect(workFill).not.toBe(GANTT_SUMMARY_BAR_FILL.product);
    expect(workFill).not.toBe(GANTT_SUMMARY_BAR_FILL.module);
    expect(workFill).toMatch(/^oklch\(/);

    const productLabel = el.querySelector(
      `[data-test="gantt-label-${productKeyO1}"]`,
    ) as HTMLElement;
    const productTl = el.querySelector(`[data-test="gantt-row-${productKeyO1}"]`) as HTMLElement;
    const moduleLabel = el.querySelector(`[data-test="gantt-label-${moduleKeyO1}"]`) as HTMLElement;
    const moduleTl = el.querySelector(`[data-test="gantt-row-${moduleKeyO1}"]`) as HTMLElement;
    expect(productLabel.classList.contains('gantt-level-product')).toBe(true);
    expect(productTl.classList.contains('gantt-level-product')).toBe(true);
    expect(moduleLabel.classList.contains('gantt-level-module')).toBe(true);
    expect(moduleTl.classList.contains('gantt-level-module')).toBe(true);

    const hostStyles = Array.from(el.ownerDocument.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('\n');
    expect(hostStyles).toContain('--gantt-bar-order');
    expect(hostStyles).toContain('--gantt-bar-product');
    expect(hostStyles).toContain('--gantt-bar-module');
    expect(hostStyles).toContain(GANTT_SUMMARY_BAR_FILL.order);
    expect(hostStyles).toContain(GANTT_SUMMARY_BAR_FILL.product);
    expect(hostStyles).toContain(GANTT_SUMMARY_BAR_FILL.module);
    /* order-expanded must not beige-flatten children */
    expect(hostStyles).not.toMatch(
      /\.gantt-order-expanded\s*\{[^}]*background:\s*oklch\(0\.97 0\.012 95\)\s*!important/,
    );
  });

  it('renders toolbar, legend and a summary with required range', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-test="gantt-toolbar"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-group-orders"]')?.textContent).toContain(
      'По заказам',
    );
    expect(el.querySelector('[data-test="gantt-zoom-day"]')?.textContent).toContain('День');
    expect(el.querySelector('[data-test="gantt-fit"]')?.textContent).toContain('Вместить сроки');
    expect(el.textContent).not.toContain('План-оценка');
    expect(el.querySelector('[data-test="gantt-estimate-label"]')).toBeNull();
    expect(el.querySelector('[data-test="gantt-expand-hint"]')).toBeNull();
    expect(el.querySelector('[data-test="gantt-zoom-hint"]')).toBeNull();
    expect(el.querySelector('[data-test="gantt-legend"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-bar-summary"]')).toBeTruthy();
  });

  it('shows work-type detail in title when expanded', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    setFullTreeExpand(fixture);
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

  it('day vs month zoom changes px density and toolbar active state', () => {
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
    expect(
      fixture.nativeElement.querySelector('[data-test="gantt-zoom-day"]')?.classList,
    ).toContain('pi-btn-ink');
    expect(fixture.componentInstance['pxPerDay']()).toBe(GANTT_PX_PER_DAY.day);

    fixture.componentRef.setInput('zoom', 'month');
    fixture.detectChanges();
    expect(root.getAttribute('data-zoom')).toBe('month');
    expect(
      fixture.nativeElement.querySelector('[data-test="gantt-zoom-month"]')?.classList,
    ).toContain('pi-btn-ink');
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
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test^="gantt-resize-handle-"]')).toBeFalsy();
  });

  it('emits estimateDaysCommit on pointer resize commit (child)', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
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

  it('TZ-PRODUCTION-335: order-meta auto-saves on change; no obsolete hint', () => {
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
    expect(strip.textContent).toContain('Статус заказа: Подтверждён');
    expect(strip.textContent).toContain('Важность');
    expect(strip.textContent).toContain('Начало плана');
    expect(strip.textContent).not.toContain('После сохранения Гант обновится');
    expect(el.querySelector('[data-test="gantt-order-meta-save"]')).toBeNull();
    expect(el.querySelector('[data-test="gantt-order-meta-sync-hint"]')).toBeNull();
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
    setFullTreeExpand(fixture);
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
    setFullTreeExpand(fixture);
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

  it('TZ-PRODUCTION-344: worker view shows ▸ and collapses to worker summaries by default', () => {
    const assigned: GanttBar = { ...sample, workerLabel: 'Иванов Иван' };
    const unassigned: GanttBar = { ...samplePaint, workerLabel: '—' };
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [assigned, unassigned]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('[data-test="gantt-bar-summary"]').length).toBe(2);
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(0);
    expect(el.textContent).toContain('Иванов Иван');
    expect(el.textContent).toContain('Не назначен');
    expect(el.querySelector('[data-test="gantt-expand-worker:Иванов Иван"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-expand-worker:Не назначен"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]')).toBeNull();
    expect(el.querySelector('[data-test="gantt-label-header"]')?.textContent).toContain('Рабочий');
  });

  it('TZ-PRODUCTION-344: expand worker → module context; expand module → WT', () => {
    const assigned: GanttBar = { ...sample, workerLabel: 'Иванов Иван' };
    const paint: GanttBar = { ...samplePaint, workerLabel: 'Иванов Иван' };
    const moduleId = `worker-module:Иванов Иван:${assigned.orderId}:${assigned.orderItemIndex}:${assigned.moduleId}`;
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [assigned, paint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.componentRef.setInput('expandedWorkerIds', new Set(['Иванов Иван']));
    fixture.detectChanges();
    let el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('ORD-1 · Стол · Каркас');
    expect(el.querySelector(`[data-test="gantt-label-${moduleId}"]`)).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]')).toBeNull();

    fixture.componentRef.setInput('expandedWorkerModuleIds', new Set([moduleId]));
    fixture.detectChanges();
    el = fixture.nativeElement;
    expect(el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt1:1"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-label-o1:0:p1:m1:wt2:2"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-label-header"]')?.textContent?.trim()).toBe(
      'Рабочий',
    );
  });

  it('TZ-PRODUCTION-348: worker label click emits toggleExpand', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [{ ...sample, workerLabel: 'Иванов Иван' }]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.detectChanges();
    const toggles: string[] = [];
    fixture.componentInstance.toggleExpand.subscribe((id) => toggles.push(id));
    const summaryLabel = fixture.nativeElement.querySelector(
      '[data-test="gantt-label-worker-summary:Иванов Иван"] button.flex-1',
    ) as HTMLElement;
    summaryLabel.click();
    expect(toggles).toEqual(['worker:Иванов Иван']);
  });

  it('TZ-PRODUCTION-348: product/module label click emits toggleExpand', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample, samplePaint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    const toggles: string[] = [];
    fixture.componentInstance.toggleExpand.subscribe((id) => toggles.push(id));
    const productLabel = fixture.nativeElement.querySelector(
      `[data-test="gantt-label-${productKeyO1}"] button.flex-1`,
    ) as HTMLElement;
    productLabel.click();
    expect(toggles).toEqual([productKeyO1]);
  });

  it('TZ-PRODUCTION-348: header is single word without border-l box', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('expandedOrderIds', new Set(['o1']));
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector(
      '[data-test="gantt-label-header"]',
    ) as HTMLElement;
    expect(header.classList.contains('items-center')).toBe(true);
    expect(header.classList.contains('items-end')).toBe(false);
    expect(header.textContent?.trim()).toBe('Заказ');
    expect(header.textContent).not.toContain('·');
    const textSpan = header.querySelector('span.flex-1') as HTMLElement;
    expect(textSpan.classList.contains('border-l')).toBe(false);
  });

  it('TZ-GANTT-401: worker view is read-only (no resize handle, no move)', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [sample]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('canEditOrder', true);
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.componentRef.setInput('expandedWorkerIds', new Set([UNASSIGNED_WORKER_LABEL]));
    fixture.componentRef.setInput(
      'expandedWorkerModuleIds',
      new Set([
        `worker-module:${UNASSIGNED_WORKER_LABEL}:${sample.orderId}:${sample.orderItemIndex}:${sample.moduleId}`,
      ]),
    );
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-test^="gantt-resize-handle-"]')).toBeNull();

    const rows = fixture.componentInstance['rows']() as Array<{ bar: GanttBar }>;
    const summary = rows.find((r) => r.bar.kind === 'summary')!.bar;
    const child = rows.find((r) => r.bar.kind !== 'summary' && r.bar.kind !== 'module')!.bar;
    expect(fixture.componentInstance.canResizeBar(child)).toBe(false);
    expect(fixture.componentInstance.canMoveBar(summary)).toBe(false);
    expect(fixture.componentInstance.canMoveBar(child)).toBe(false);
  });

  it('TZ-GANTT-401: worker summary label does not emit orderLabelClick', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [{ ...sample, workerLabel: 'Иванов Иван' }]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.detectChanges();
    const clicks: string[] = [];
    fixture.componentInstance.orderLabelClick.subscribe((id) => clicks.push(id));
    const summaryLabel = fixture.nativeElement.querySelector(
      '[data-test="gantt-label-worker-summary:Иванов Иван"] button.flex-1',
    ) as HTMLElement;
    summaryLabel.click();
    expect(clicks).toEqual([]);
    expect(summaryLabel.getAttribute('aria-label')).toContain('Группа рабочего');
  });

  it('TZ-GANTT-402: worker view work-detail is read-only (days disabled, no catalog button)', () => {
    const moduleId = `worker-module:Иванов Иван:${sample.orderId}:${sample.orderItemIndex}:${sample.moduleId}`;
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [{ ...sample, workerLabel: 'Иванов Иван' }]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('expandedWorkerIds', new Set(['Иванов Иван']));
    fixture.componentRef.setInput('expandedWorkerModuleIds', new Set([moduleId]));
    fixture.componentRef.setInput('expandedWorkBarId', sample.id);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const days = el.querySelector(
      `[data-test="gantt-work-detail-days-${sample.id}"]`,
    ) as HTMLInputElement;
    expect(days).toBeTruthy();
    expect(days.disabled).toBe(true);
    expect(el.querySelector(`[data-test="gantt-work-detail-catalog-${sample.id}"]`)).toBeNull();
  });

  it('TZ-PRODUCTION-351: worker summary barFill + label use WT oklch when hue set', () => {
    const paintHue = 170;
    const assigned: GanttBar = {
      ...sample,
      workerLabel: 'Иванов Иван',
      accentHue: 140,
    };
    const paint: GanttBar = {
      ...samplePaint,
      workerLabel: 'Иванов Иван',
      accentHue: paintHue,
    };
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [assigned, paint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const el: HTMLElement = fixture.nativeElement;

    const rows = cmp['rows']() as Array<{
      bar: GanttBar;
      isSummary: boolean;
      rowKind: 'order' | 'worker' | 'product' | 'module' | 'work';
      isWorkerSummary: boolean;
    }>;
    const workerRow = rows.find((r) => r.rowKind === 'worker')!;
    const resolvedPaintHue = resolveWorkTypeHue('wt2', paintHue);
    expect(workerRow.bar.accentHue).toBe(resolvedPaintHue);
    const wtFill = workTypeOklch('worker-tint', 0.12, 0.72, resolvedPaintHue);
    const chipFill = workTypeOklch('worker-tint', 0.14, 0.76, resolvedPaintHue);
    expect(cmp.barFill(workerRow)).toBe(wtFill);
    expect(cmp.barFill(workerRow)).not.toBe(GANTT_SUMMARY_BAR_FILL.order);
    expect(cmp.workerLabelWash({ isWorkerSummary: true, bar: workerRow.bar })).toBe(
      workTypeWash('worker-tint', resolvedPaintHue),
    );
    expect(cmp.workerChipFill(resolvedPaintHue)).toBe(chipFill);

    const labelBtn = el.querySelector(
      '[data-test="gantt-label-worker-summary:Иванов Иван"] .gantt-label-btn',
    ) as HTMLElement;
    expect(labelBtn.getAttribute('data-worker-tint')).toBe('true');
    expect(labelBtn.querySelector('span[aria-hidden="true"]')).toBeTruthy();
  });

  it('TZ-PRODUCTION-351: worker summary without hue keeps milk barFill', () => {
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [{ ...sample, workerLabel: '—' }]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const rows = cmp['rows']() as Array<{
      bar: GanttBar;
      isSummary: boolean;
      rowKind: 'order' | 'worker' | 'product' | 'module' | 'work';
    }>;
    const workerRow = rows.find((r) => r.rowKind === 'worker')!;
    expect(workerRow.bar.accentHue).toBeNull();
    expect(cmp.barFill(workerRow)).toBe(GANTT_SUMMARY_BAR_FILL.order);
  });

  it('TZ-PRODUCTION-352: worker summary with null catalog accent gets chip/wash/barFill', () => {
    const assigned: GanttBar = {
      ...sample,
      workerLabel: 'Иванов Иван',
      accentHue: null,
    };
    const resolvedHue = resolveWorkTypeHue(assigned.workTypeId, null);
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [assigned]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const el: HTMLElement = fixture.nativeElement;
    const rows = cmp['rows']() as Array<{
      bar: GanttBar;
      rowKind: 'order' | 'worker' | 'product' | 'module' | 'work';
      isWorkerSummary: boolean;
    }>;
    const workerRow = rows.find((r) => r.rowKind === 'worker')!;
    expect(workerRow.bar.accentHue).toBe(resolvedHue);
    expect(cmp.barFill(workerRow)).toBe(workTypeOklch('worker-tint', 0.12, 0.72, resolvedHue));
    expect(cmp.workerLabelWash({ isWorkerSummary: true, bar: workerRow.bar })).toBe(
      workTypeWash('worker-tint', resolvedHue),
    );
    const labelBtn = el.querySelector(
      '[data-test="gantt-label-worker-summary:Иванов Иван"] .gantt-label-btn',
    ) as HTMLElement;
    expect(labelBtn.getAttribute('data-worker-tint')).toBe('true');
  });

  it('TZ-PRODUCTION-351: expand worker → module row-kind only (not raw WT)', () => {
    const assigned: GanttBar = { ...sample, workerLabel: 'Иванов Иван', accentHue: 140 };
    const paint: GanttBar = { ...samplePaint, workerLabel: 'Иванов Иван', accentHue: 170 };
    const fixture = TestBed.createComponent(GanttBarsComponent);
    fixture.componentRef.setInput('bars', [assigned, paint]);
    fixture.componentRef.setInput('rangeStart', '2026-08-01');
    fixture.componentRef.setInput('rangeEnd', '2026-08-10');
    fixture.componentRef.setInput('groupByWorkers', true);
    fixture.componentRef.setInput('expandedWorkerIds', new Set(['Иванов Иван']));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const moduleRows = el.querySelectorAll('[data-row-kind="module"]');
    expect(moduleRows.length).toBeGreaterThanOrEqual(1);
    expect(el.querySelector('[data-row-kind="work"]')).toBeNull();
    expect(el.textContent).toContain('ORD-1 · Стол · Каркас');
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
