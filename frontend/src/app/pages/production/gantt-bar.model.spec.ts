import {
  ACTIVE_COMMERCIAL_ORDER_STATUSES,
  ESTIMATE_OVERRIDE_HINT_RU,
  ORDER_STATUS_LABELS,
  UNASSIGNED_WORKER_LABEL,
  WHOLE_PRODUCT_MODULE_SENTINEL,
  WORKER_SUMMARY_WORK_TYPE_ID,
  buildGanttBars,
  buildGanttTreeBars,
  buildOrderSummaryBar,
  buildWorkerTreeBars,
  calendarSpanDays,
  filterOrdersForRail,
  formatWorkerModuleContextLabel,
  ganttSkipProductNames,
  ganttSkipToastRu,
  ganttWorkerModuleSummaryId,
  groupBarsByWorker,
  isHardFrozenOrderStatus,
  isModuleSummaryBar,
  isWholeProductModuleId,
  isWorkerSummaryBar,
  NO_COUNTERPARTY_FILTER,
  normalizeWorkTypeDays,
  orderHasGanttEstimate,
  resolveEstimateModules,
  resolveVisualAnchor,
  wholeProductModuleName,
  workerGroupKeyOf,
  type GanttBar,
  type OrderEstimateInput,
} from './gantt-bar.model';
import type { OrderStatus } from '../orders/orders.service';

describe('gantt-bar.model', () => {
  it('exposes exactly three active commercial statuses', () => {
    expect([...ACTIVE_COMMERCIAL_ORDER_STATUSES]).toEqual(['confirmed', 'in_production', 'ready']);
  });

  it('exposes shared estimate override hint for Gantt work-detail and inspector', () => {
    expect(ESTIMATE_OVERRIDE_HINT_RU).toContain('только этот заказ');
  });

  it('labels all seven real Order statuses', () => {
    const keys = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
    expect(keys.sort()).toEqual(
      ['cancelled', 'confirmed', 'delivered', 'draft', 'in_production', 'ready', 'shipped'].sort(),
    );
    expect('planned' in ORDER_STATUS_LABELS).toBe(false);
  });

  it('TZ-PRODUCTION-331: hard-frozen statuses exclude plan edits', () => {
    expect(isHardFrozenOrderStatus('ready')).toBe(false);
    expect(isHardFrozenOrderStatus('in_production')).toBe(false);
    expect(isHardFrozenOrderStatus('shipped')).toBe(true);
    expect(isHardFrozenOrderStatus('delivered')).toBe(true);
    expect(isHardFrozenOrderStatus('cancelled')).toBe(true);
  });

  it('resolves visualAnchor plannedDate ?? date ?? today without TZ day-shift', () => {
    const today = new Date(2026, 7, 6); // Aug 6 local
    expect(resolveVisualAnchor({ plannedDate: '2026-08-10T22:00:00.000Z' }, today)).toEqual(
      expect.objectContaining({
        source: 'plannedDate',
        usedFallbackToday: false,
      }),
    );
    const fromPlanned = resolveVisualAnchor({ plannedDate: '2026-08-10' }, today);
    expect(fromPlanned.anchor.getFullYear()).toBe(2026);
    expect(fromPlanned.anchor.getMonth()).toBe(7);
    expect(fromPlanned.anchor.getDate()).toBe(10);

    const fromDate = resolveVisualAnchor({ date: '2026-08-01' }, today);
    expect(fromDate.source).toBe('date');
    expect(fromDate.anchor.getDate()).toBe(1);

    const fallback = resolveVisualAnchor({}, today);
    expect(fallback.usedFallbackToday).toBe(true);
    expect(fallback.source).toBe('today');
    expect(fallback.anchor.getDate()).toBe(6);
  });

  it('snaps workType hues to at most 7 stable buckets', async () => {
    const { WORK_TYPE_HUE_BUCKETS, snapWorkTypeHue, workTypeOklch } =
      await import('./gantt-bar.model');
    expect(WORK_TYPE_HUE_BUCKETS).toHaveLength(7);
    expect(snapWorkTypeHue(0)).toBe(WORK_TYPE_HUE_BUCKETS[0]);
    expect(snapWorkTypeHue(100)).toBe(75);
    expect(snapWorkTypeHue(120)).toBe(130);
    const a = workTypeOklch('wt-aaaaaaaa');
    const b = workTypeOklch('wt-bbbbbbbb');
    expect(a).toMatch(/^oklch\(/);
    expect(WORK_TYPE_HUE_BUCKETS.some((h) => a.includes(` ${h})`))).toBe(true);
    expect(WORK_TYPE_HUE_BUCKETS.some((h) => b.includes(` ${h})`))).toBe(true);
  });

  it('treats null/0/invalid days as no-term', () => {
    expect(normalizeWorkTypeDays(null)).toBeNull();
    expect(normalizeWorkTypeDays(undefined)).toBeNull();
    expect(normalizeWorkTypeDays(0)).toBeNull();
    expect(normalizeWorkTypeDays(-2)).toBeNull();
    expect(normalizeWorkTypeDays(Number.NaN)).toBeNull();
    expect(normalizeWorkTypeDays(3.9)).toBe(3);
  });

  it('builds sequential bars by sortOrder and does not multiply duration by quantity', () => {
    const input: OrderEstimateInput = {
      orderId: 'o1',
      orderNumber: 'ORD-1',
      status: 'confirmed',
      plannedDate: '2026-08-01',
      items: [
        {
          orderItemIndex: 0,
          productId: 'p1',
          productName: 'Стол',
          quantity: 5,
          modules: [
            {
              moduleId: 'm1',
              moduleName: 'Каркас',
              sortOrder: 10,
              workTypes: [
                {
                  workTypeId: 'wt-weld',
                  workTypeName: 'Сварка',
                  days: 2,
                  estimatedHours: 16,
                  sortOrder: 0,
                },
                {
                  workTypeId: 'wt-paint',
                  workTypeName: 'Покраска',
                  days: 3,
                  estimatedHours: 8,
                  sortOrder: 1,
                },
              ],
            },
          ],
        },
      ],
    };

    const bars = buildGanttBars(input, new Date(2026, 7, 6));
    expect(bars).toHaveLength(2);
    expect(bars[0].days).toBe(2);
    expect(bars[0].quantityLabel).toBe('×5');
    expect(bars[0].startDate).toBe('2026-08-01');
    expect(bars[0].endDate).toBe('2026-08-02');
    // Second bar starts after first (sequential pack), NOT after 2*5 days.
    expect(bars[1].startDate).toBe('2026-08-03');
    expect(bars[1].days).toBe(3);
    expect(bars[1].endDate).toBe('2026-08-05');
    expect(bars[0].id).toContain(':1');
    expect(bars[1].id).toContain(':2');
    expect(bars[0].workerLabel).toBe('—');
  });

  it('applies order-level estimateDayOverrides without changing other work types', () => {
    const input: OrderEstimateInput = {
      orderId: 'o1',
      orderNumber: 'ORD-1',
      status: 'confirmed',
      plannedDate: '2026-08-01',
      estimateDayOverrides: [{ orderItemIndex: 0, moduleId: 'm1', workTypeId: 'wt-weld', days: 5 }],
      items: [
        {
          orderItemIndex: 0,
          productId: 'p1',
          productName: 'Стол',
          quantity: 1,
          modules: [
            {
              moduleId: 'm1',
              moduleName: 'Каркас',
              sortOrder: 0,
              workTypes: [
                {
                  workTypeId: 'wt-weld',
                  workTypeName: 'Сварка',
                  days: 2,
                  sortOrder: 0,
                },
                {
                  workTypeId: 'wt-paint',
                  workTypeName: 'Покраска',
                  days: 3,
                  sortOrder: 1,
                },
              ],
            },
          ],
        },
      ],
    };

    const bars = buildGanttBars(input, new Date(2026, 7, 6));
    expect(bars[0].days).toBe(5);
    expect(bars[0].startDate).toBe('2026-08-01');
    expect(bars[0].endDate).toBe('2026-08-05');
    expect(bars[1].days).toBe(3);
    expect(bars[1].startDate).toBe('2026-08-06');
  });

  it('renders no-term bar without advancing cursor incorrectly for zero days', () => {
    const input: OrderEstimateInput = {
      orderId: 'o2',
      orderNumber: 'ORD-2',
      status: 'draft',
      date: '2026-08-01',
      items: [
        {
          orderItemIndex: 0,
          productId: 'p1',
          productName: 'X',
          quantity: 1,
          modules: [
            {
              moduleId: 'm1',
              moduleName: 'M',
              sortOrder: 0,
              workTypes: [
                { workTypeId: 'a', workTypeName: 'A', days: null, sortOrder: 0 },
                { workTypeId: 'b', workTypeName: 'B', days: 1, sortOrder: 1 },
              ],
            },
          ],
        },
      ],
    };
    const bars = buildGanttBars(input);
    expect(bars[0].noTerm).toBe(true);
    expect(bars[1].startDate).toBe('2026-08-01');
    expect(bars[1].days).toBe(1);
  });

  it('rail filter keeps selected completed order and hides inactive by default', () => {
    const orders = [
      { _id: '1', number: 'A-1', status: 'draft' as const },
      { _id: '2', number: 'A-2', status: 'shipped' as const },
      { _id: '3', number: 'B-3', status: 'cancelled' as const },
      { _id: '4', number: 'C-4', status: 'confirmed' as const, isActive: false },
      { _id: '5', number: 'D-5', status: 'confirmed' as const },
    ];

    const active = filterOrdersForRail(orders, {
      activeOnly: true,
      search: '',
      selectedOrderId: null,
    });
    expect(active.map((o) => o._id)).toEqual(['5']);

    const withSelected = filterOrdersForRail(orders, {
      activeOnly: true,
      search: '',
      selectedOrderId: '3',
    });
    expect(withSelected.map((o) => o._id).sort()).toEqual(['3', '5']);

    const search = filterOrdersForRail(orders, {
      activeOnly: false,
      search: 'b-3',
      selectedOrderId: null,
    });
    expect(search.map((o) => o._id)).toEqual(['3']);
  });

  it('builds order summary span as min start … max end (not sum of days)', () => {
    const children: GanttBar[] = [
      {
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
      },
      {
        id: 'o1:0:p1:m1:wt2:2',
        orderId: 'o1',
        orderNumber: 'ORD-1',
        orderStatus: 'confirmed',
        orderItemIndex: 0,
        productId: 'p1',
        productName: 'Стол',
        moduleId: 'm1',
        moduleName: 'Каркас',
        workTypeId: 'wt2',
        workTypeName: 'Покраска',
        occurrence: 2,
        quantity: 1,
        quantityLabel: null,
        days: 3,
        noTerm: false,
        startDate: '2026-08-03',
        endDate: '2026-08-05',
        usedFallbackToday: false,
        workerLabel: '—',
      },
    ];
    expect(calendarSpanDays('2026-08-01', '2026-08-05')).toBe(5);
    const summary = buildOrderSummaryBar(children);
    expect(summary).toEqual(
      expect.objectContaining({
        kind: 'summary',
        orderId: 'o1',
        startDate: '2026-08-01',
        endDate: '2026-08-05',
        days: 5,
        noTerm: false,
        id: 'summary:o1',
      }),
    );
  });

  it('tree bars: collapsed = one summary; expand order → product; module → work', () => {
    const input: OrderEstimateInput = {
      orderId: 'o1',
      orderNumber: 'ORD-1',
      status: 'confirmed',
      plannedDate: '2026-08-01',
      items: [
        {
          orderItemIndex: 0,
          productId: 'p1',
          productName: 'Стол',
          quantity: 1,
          modules: [
            {
              moduleId: 'm1',
              moduleName: 'Каркас',
              sortOrder: 0,
              workTypes: [
                { workTypeId: 'wt-weld', workTypeName: 'Сварка', days: 2, sortOrder: 0 },
                { workTypeId: 'wt-paint', workTypeName: 'Покраска', days: 3, sortOrder: 1 },
              ],
            },
          ],
        },
      ],
    };
    const work = buildGanttBars(input, new Date(2026, 7, 6));
    const collapsed = buildGanttTreeBars(work, new Set());
    expect(collapsed).toHaveLength(1);
    expect(collapsed[0]!.kind).toBe('summary');
    expect(collapsed[0]!.days).toBe(5);

    const orderOpen = buildGanttTreeBars(work, new Set(['o1']));
    expect(orderOpen).toHaveLength(2);
    expect(orderOpen[0]!.kind).toBe('summary');
    expect(orderOpen[1]!.kind).toBe('product');
    expect(orderOpen[1]!.productName).toBe('Стол');
    expect(orderOpen[1]!.id).toBe('product:o1:0');
    expect(orderOpen.some((b) => b.workTypeName === 'Сварка')).toBe(false);

    const productOpen = buildGanttTreeBars(work, new Set(['o1']), new Set(['product:o1:0']));
    expect(productOpen).toHaveLength(3);
    expect(productOpen[2]!.kind).toBe('module');
    expect(productOpen[2]!.moduleName).toBe('Каркас');
    expect(productOpen[2]!.id).toBe('module:o1:0:m1');
    expect(
      productOpen.some(
        (b) =>
          b.kind !== 'summary' &&
          b.kind !== 'product' &&
          b.kind !== 'module' &&
          b.workTypeName === 'Сварка',
      ),
    ).toBe(false);

    const moduleOpen = buildGanttTreeBars(
      work,
      new Set(['o1']),
      new Set(['product:o1:0']),
      new Set(['module:o1:0:m1']),
    );
    expect(moduleOpen).toHaveLength(5);
    expect(moduleOpen[3]!.workTypeName).toBe('Сварка');
    expect(moduleOpen[4]!.workTypeName).toBe('Покраска');
  });

  function treeOrderInput(
    orderId: string,
    orderNumber: string,
    plannedDate: string,
  ): OrderEstimateInput {
    return {
      orderId,
      orderNumber,
      status: 'confirmed',
      plannedDate,
      items: [
        {
          orderItemIndex: 0,
          productId: 'p1',
          productName: 'Стол',
          quantity: 1,
          modules: [
            {
              moduleId: 'm1',
              moduleName: 'Каркас',
              sortOrder: 0,
              workTypes: [{ workTypeId: 'wt1', workTypeName: 'Сварка', days: 2, sortOrder: 0 }],
            },
          ],
        },
      ],
    };
  }

  it('TZ-PRODUCTION-335: tree groups sort by summary startDate then orderNumber', () => {
    const later = buildGanttBars(
      treeOrderInput('o-late', 'DEMO-001', '2026-08-10'),
      new Date(2026, 7, 6),
    );
    const earlier = buildGanttBars(
      treeOrderInput('o-early', 'DEMO-002', '2026-08-05'),
      new Date(2026, 7, 6),
    );
    const tree = buildGanttTreeBars([...later, ...earlier], new Set());
    expect(tree.map((b) => b.orderId)).toEqual(['o-early', 'o-late']);
  });

  it('TZ-PRODUCTION-335: plannedDate shift that crosses another order reorders vertically', async () => {
    const { applyOptimisticPlannedDateShift } = await import('./gantt-bar.model');
    const later = buildGanttBars(
      treeOrderInput('o-late', 'DEMO-001', '2026-08-10'),
      new Date(2026, 7, 6),
    );
    const earlier = buildGanttBars(
      treeOrderInput('o-early', 'DEMO-002', '2026-08-05'),
      new Date(2026, 7, 6),
    );
    const work = [...later, ...earlier];
    expect(buildGanttTreeBars(work, new Set()).map((b) => b.orderId)).toEqual([
      'o-early',
      'o-late',
    ]);
    const { bars } = applyOptimisticPlannedDateShift(
      work,
      [
        { _id: 'o-late', plannedDate: '2026-08-10' },
        { _id: 'o-early', plannedDate: '2026-08-05' },
      ],
      'o-late',
      -6,
    );
    expect(buildGanttTreeBars(bars, new Set()).map((b) => b.orderId)).toEqual([
      'o-late',
      'o-early',
    ]);
  });

  it('TZ-PRODUCTION-335: equal startDate tie-breaks by orderNumber', () => {
    const a = buildGanttBars(treeOrderInput('o2', 'DEMO-002', '2026-08-05'), new Date(2026, 7, 6));
    const b = buildGanttBars(treeOrderInput('o1', 'DEMO-001', '2026-08-05'), new Date(2026, 7, 6));
    const tree = buildGanttTreeBars([...a, ...b], new Set());
    expect(tree.map((row) => row.orderNumber)).toEqual(['DEMO-001', 'DEMO-002']);
  });

  it('applies start offsets in parallel without advancing sequential cursor', () => {
    const input: OrderEstimateInput = {
      orderId: 'o1',
      orderNumber: 'ORD-1',
      status: 'confirmed',
      plannedDate: '2026-08-01',
      estimateStartOffsets: [
        { orderItemIndex: 0, moduleId: 'm1', workTypeId: 'wt-paint', offsetDays: 0 },
      ],
      items: [
        {
          orderItemIndex: 0,
          productId: 'p1',
          productName: 'Стол',
          quantity: 1,
          modules: [
            {
              moduleId: 'm1',
              moduleName: 'Каркас',
              sortOrder: 0,
              workTypes: [
                { workTypeId: 'wt-weld', workTypeName: 'Сварка', days: 2, sortOrder: 0 },
                { workTypeId: 'wt-paint', workTypeName: 'Покраска', days: 3, sortOrder: 1 },
              ],
            },
          ],
        },
      ],
    };
    const bars = buildGanttBars(input, new Date(2026, 7, 6));
    expect(bars[0]!.startDate).toBe('2026-08-01');
    expect(bars[0]!.endDate).toBe('2026-08-02');
    // paint overlaps weld (offset 0 from anchor) — parallel OK
    expect(bars[1]!.startDate).toBe('2026-08-01');
    expect(bars[1]!.endDate).toBe('2026-08-03');
    expect(bars[1]!.startOffsetDays).toBe(0);
    const summary = buildOrderSummaryBar(bars);
    expect(summary?.startDate).toBe('2026-08-01');
    expect(summary?.endDate).toBe('2026-08-03');
    expect(summary?.days).toBe(3);
  });

  it('rail filter supports priority and date range on plannedDate', () => {
    const orders = [
      {
        _id: '1',
        number: 'A',
        status: 'confirmed' as const,
        priority: 'urgent',
        plannedDate: '2026-08-10',
      },
      {
        _id: '2',
        number: 'B',
        status: 'confirmed' as const,
        priority: 'low',
        plannedDate: '2026-08-01',
      },
      {
        _id: '3',
        number: 'C',
        status: 'draft' as const,
        priority: 'urgent',
        date: '2026-08-12',
      },
    ];
    const byPriority = filterOrdersForRail(orders, {
      activeOnly: true,
      search: '',
      selectedOrderId: null,
      priority: 'urgent',
    });
    // draft+urgent (_id 3) excluded from ACTIVE (TZ-PRODUCTION-337)
    expect(byPriority.map((o) => o._id)).toEqual(['1']);

    const byDate = filterOrdersForRail(orders, {
      activeOnly: true,
      search: '',
      selectedOrderId: null,
      dateFrom: '2026-08-09',
      dateTo: '2026-08-11',
    });
    expect(byDate.map((o) => o._id)).toEqual(['1']);

    const byCounterparty = filterOrdersForRail(
      [
        { ...orders[0]!, counterpartyId: { _id: 'cp1', name: 'ООО Стол' } },
        { ...orders[1]!, counterpartyId: { _id: 'cp2', name: 'ИП Лес' } },
        { ...orders[2]!, counterpartyId: undefined },
      ],
      {
        activeOnly: true,
        search: '',
        selectedOrderId: null,
        counterpartyId: 'cp1',
      },
    );
    expect(byCounterparty.map((o) => o._id)).toEqual(['1']);

    const withoutCounterparty = filterOrdersForRail(
      [{ ...orders[0]!, counterpartyId: undefined }],
      {
        activeOnly: true,
        search: '',
        selectedOrderId: null,
        counterpartyId: NO_COUNTERPARTY_FILTER,
      },
    );
    expect(withoutCounterparty.map((o) => o._id)).toEqual(['1']);
  });

  it('TZ-PRODUCTION-335: rail filter sorts by plan start then number', () => {
    const orders = [
      {
        _id: 'late',
        number: 'DEMO-001',
        status: 'confirmed' as const,
        plannedDate: '2026-08-10',
      },
      {
        _id: 'early',
        number: 'DEMO-002',
        status: 'confirmed' as const,
        plannedDate: '2026-08-05',
      },
    ];
    const out = filterOrdersForRail(orders, {
      activeOnly: true,
      search: '',
      selectedOrderId: null,
    });
    expect(out.map((o) => o._id)).toEqual(['early', 'late']);
  });

  describe('TZ-PRODUCTION-333 optimistic helpers', () => {
    const workBar = (overrides: Partial<GanttBar> = {}): GanttBar => ({
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
      days: 3,
      noTerm: false,
      startDate: '2026-08-10',
      endDate: '2026-08-12',
      usedFallbackToday: false,
      workerLabel: '—',
      kind: 'work',
      ...overrides,
    });

    it('cloneGanttState is independent of later mutations', async () => {
      const { cloneGanttState } = await import('./gantt-bar.model');
      const bars = [workBar()];
      const orders = [{ _id: 'o1', plannedDate: '2026-08-10' }];
      const snap = cloneGanttState(bars, orders);
      bars[0]!.days = 99;
      orders[0]!.plannedDate = '2099-01-01';
      expect(snap.bars[0]!.days).toBe(3);
      expect(snap.orders[0]!.plannedDate).toBe('2026-08-10');
    });

    it('applyOptimisticEstimateDays updates days, endDate, override and summary span', async () => {
      const { applyOptimisticEstimateDays, buildOrderSummaryBar } =
        await import('./gantt-bar.model');
      const children = [
        workBar(),
        workBar({
          id: 'b2',
          workTypeId: 'wt2',
          startDate: '2026-08-13',
          endDate: '2026-08-14',
          days: 2,
        }),
      ];
      const summary = buildOrderSummaryBar(children)!;
      const { bars, orders } = applyOptimisticEstimateDays(
        [...children, summary],
        [{ _id: 'o1', estimateDayOverrides: [] }],
        { orderId: 'o1', orderItemIndex: 0, moduleId: 'm1', workTypeId: 'wt1', days: 5 },
      );
      const resized = bars.find((b) => b.workTypeId === 'wt1');
      expect(resized?.days).toBe(5);
      expect(resized?.endDate).toBe('2026-08-14');
      expect(orders[0]!.estimateDayOverrides).toEqual([
        { orderItemIndex: 0, moduleId: 'm1', workTypeId: 'wt1', days: 5 },
      ]);
      const nextSummary = bars.find((b) => b.kind === 'summary');
      expect(nextSummary?.startDate).toBe('2026-08-10');
      expect(nextSummary?.endDate).toBe('2026-08-14');
      expect(nextSummary?.days).toBe(5);
    });

    it('applyOptimisticPlannedDateShift moves all order bars and plannedDate', async () => {
      const { applyOptimisticPlannedDateShift } = await import('./gantt-bar.model');
      const { bars, orders } = applyOptimisticPlannedDateShift(
        [
          workBar(),
          workBar({
            id: 'b2',
            workTypeId: 'wt2',
            startDate: '2026-08-13',
            endDate: '2026-08-14',
            days: 2,
          }),
        ],
        [
          { _id: 'o1', plannedDate: '2026-08-10' },
          { _id: 'o2', plannedDate: '2026-08-01' },
        ],
        'o1',
        2,
      );
      expect(bars[0]!.startDate).toBe('2026-08-12');
      expect(bars[0]!.endDate).toBe('2026-08-14');
      expect(bars[1]!.startDate).toBe('2026-08-15');
      expect(orders[0]!.plannedDate).toBe('2026-08-12');
      expect(orders[1]!.plannedDate).toBe('2026-08-01');
    });

    it('applyOptimisticStartOffset moves only the matched child and records offset', async () => {
      const { applyOptimisticStartOffset } = await import('./gantt-bar.model');
      const other = workBar({
        id: 'b2',
        workTypeId: 'wt2',
        startDate: '2026-08-13',
        endDate: '2026-08-14',
        days: 2,
      });
      const { bars, orders } = applyOptimisticStartOffset(
        [workBar(), other],
        [{ _id: 'o1', estimateStartOffsets: [] }],
        {
          orderId: 'o1',
          orderItemIndex: 0,
          moduleId: 'm1',
          workTypeId: 'wt1',
          startDate: '2026-08-10',
          deltaDays: 3,
        },
        3,
      );
      expect(bars[0]!.startDate).toBe('2026-08-13');
      expect(bars[0]!.endDate).toBe('2026-08-15');
      expect(bars[0]!.startOffsetDays).toBe(3);
      expect(bars[1]!.startDate).toBe('2026-08-13');
      expect(orders[0]!.estimateStartOffsets).toEqual([
        { orderItemIndex: 0, moduleId: 'm1', workTypeId: 'wt1', offsetDays: 3 },
      ]);
    });

    it('applyOptimisticOrderMeta updates priority and shifts bars by plannedDate', async () => {
      const { applyOptimisticOrderMeta } = await import('./gantt-bar.model');
      const { bars, orders } = applyOptimisticOrderMeta(
        [workBar()],
        [{ _id: 'o1', plannedDate: '2026-08-10', priority: 'normal' }],
        'o1',
        { priority: 'urgent', plannedDate: '2026-08-12' },
      );
      expect(orders[0]!.priority).toBe('urgent');
      expect(orders[0]!.plannedDate).toBe('2026-08-12');
      expect(bars[0]!.startDate).toBe('2026-08-12');
      expect(bars[0]!.endDate).toBe('2026-08-14');
    });
  });

  it('TZ-PRODUCTION-336: orderHasGanttEstimate follows buildGanttBars work-bars', () => {
    const empty: OrderEstimateInput = {
      orderId: 'o-empty',
      orderNumber: 'ORD-EMPTY',
      status: 'confirmed',
      items: [],
    };
    expect(orderHasGanttEstimate(empty)).toBe(false);

    const noModules: OrderEstimateInput = {
      orderId: 'o-nomod',
      orderNumber: 'ORD-NOMOD',
      status: 'confirmed',
      items: [
        {
          orderItemIndex: 0,
          productId: 'p1',
          productName: 'Пустышка',
          quantity: 1,
          modules: [],
        },
      ],
    };
    expect(orderHasGanttEstimate(noModules)).toBe(false);
    expect(ganttSkipProductNames(noModules)).toEqual(['Пустышка']);

    const noWorkTypes: OrderEstimateInput = {
      orderId: 'o-nowt',
      orderNumber: 'ORD-NOWT',
      status: 'confirmed',
      items: [
        {
          orderItemIndex: 0,
          productId: 'p2',
          productName: 'Без видов',
          quantity: 1,
          modules: [{ moduleId: 'm1', moduleName: 'Каркас', sortOrder: 0, workTypes: [] }],
        },
      ],
    };
    expect(orderHasGanttEstimate(noWorkTypes)).toBe(false);

    const eligible: OrderEstimateInput = {
      orderId: 'o-ok',
      orderNumber: 'ORD-OK',
      status: 'confirmed',
      plannedDate: '2026-08-01',
      items: [
        {
          orderItemIndex: 0,
          productId: 'p3',
          productName: 'Стол',
          quantity: 1,
          modules: [
            {
              moduleId: 'm1',
              moduleName: 'Каркас',
              sortOrder: 0,
              workTypes: [{ workTypeId: 'wt1', workTypeName: 'Сварка', days: 2, sortOrder: 0 }],
            },
          ],
        },
      ],
    };
    expect(orderHasGanttEstimate(eligible, new Date(2026, 7, 6))).toBe(true);
    expect(ganttSkipToastRu('ORD-NOMOD', ['Пустышка'])).toContain('нет прямых модулей');
    expect(ganttSkipToastRu('ORD-NOMOD', ['Пустышка'])).toContain('Пустышка');
  });

  it('TZ-PRODUCTION-345: empty modules stay ineligible; whole-product pseudo-module = «целиком» row', () => {
    expect(wholeProductModuleName('Стеллаж')).toBe('Стеллаж · целиком');
    expect(wholeProductModuleName('')).toBe('целиком');
    expect(isWholeProductModuleId('p1', 'p1')).toBe(true);
    expect(isWholeProductModuleId(WHOLE_PRODUCT_MODULE_SENTINEL, 'p1')).toBe(true);
    expect(isWholeProductModuleId('m1', 'p1')).toBe(false);
    expect(
      resolveEstimateModules({
        orderItemIndex: 0,
        productId: 'p1',
        productName: 'Пустышка',
        quantity: 1,
        modules: [],
      }),
    ).toEqual([]);

    const whole: OrderEstimateInput = {
      orderId: 'o-whole',
      orderNumber: 'ORD-WHOLE',
      status: 'confirmed',
      plannedDate: '2026-08-01',
      items: [
        {
          orderItemIndex: 0,
          productId: 'p-whole',
          productName: 'Стеллаж',
          quantity: 1,
          modules: [
            {
              moduleId: 'p-whole',
              moduleName: '',
              sortOrder: 0,
              workTypes: [
                { workTypeId: 'wt1', workTypeName: 'Сварка', days: 2, sortOrder: 0 },
                { workTypeId: 'wt2', workTypeName: 'Покраска', days: 3, sortOrder: 1 },
              ],
            },
          ],
        },
      ],
    };
    expect(orderHasGanttEstimate(whole, new Date(2026, 7, 6))).toBe(true);
    const work = buildGanttBars(whole, new Date(2026, 7, 6));
    expect(work.every((b) => b.moduleName === 'Стеллаж · целиком')).toBe(true);
    expect(work.every((b) => b.moduleId === 'p-whole')).toBe(true);

    const productOpen = buildGanttTreeBars(
      work,
      new Set(['o-whole']),
      new Set(['product:o-whole:0']),
    );
    expect(productOpen.map((b) => b.kind)).toEqual(['summary', 'product', 'module']);
    expect(productOpen[2]!.moduleName).toBe('Стеллаж · целиком');
    expect(productOpen[2]!.id).toBe('module:o-whole:0:p-whole');

    const moduleOpen = buildGanttTreeBars(
      work,
      new Set(['o-whole']),
      new Set(['product:o-whole:0']),
      new Set(['module:o-whole:0:p-whole']),
    );
    expect(moduleOpen.some((b) => b.workTypeName === 'Сварка')).toBe(true);
    expect(formatWorkerModuleContextLabel(work[0]!)).toBe('ORD-WHOLE · Стеллаж · целиком');
  });
});

describe('gantt-by-workers (TZ-GANTT-401)', () => {
  function workBar(overrides: Partial<GanttBar>): GanttBar {
    return {
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
      ...overrides,
    };
  }

  it('maps empty / dash workerLabel to «Не назначен»', () => {
    expect(workerGroupKeyOf(workBar({ workerLabel: '—' }))).toBe(UNASSIGNED_WORKER_LABEL);
    expect(workerGroupKeyOf(workBar({ workerLabel: '' }))).toBe(UNASSIGNED_WORKER_LABEL);
    expect(workerGroupKeyOf(workBar({ workerLabel: '  ' }))).toBe(UNASSIGNED_WORKER_LABEL);
    expect(workerGroupKeyOf(workBar({ workerLabel: 'Иванов Иван' }))).toBe('Иванов Иван');
  });

  it('groups by workerLabel, «Не назначен» last, RU-sorted', () => {
    const groups = groupBarsByWorker([
      workBar({ id: 'a', workerLabel: '—' }),
      workBar({ id: 'b', workerLabel: 'Петров Пётр' }),
      workBar({ id: 'c', workerLabel: 'Иванов Иван' }),
      workBar({ id: 'd', workerLabel: 'Иванов Иван' }),
    ]);
    expect(groups.map((g) => g.label)).toEqual([
      'Иванов Иван',
      'Петров Пётр',
      UNASSIGNED_WORKER_LABEL,
    ]);
    expect(groups[0]!.children.map((c) => c.id)).toEqual(['c', 'd']);
  });

  it('skips summary bars when grouping', () => {
    const summary = {
      ...workBar({ id: 's', workerLabel: 'Иванов Иван' }),
      kind: 'summary' as const,
      workTypeId: WORKER_SUMMARY_WORK_TYPE_ID,
    };
    const groups = groupBarsByWorker([summary, workBar({ id: 'a', workerLabel: 'Иванов Иван' })]);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.children.map((c) => c.id)).toEqual(['a']);
    expect(isWorkerSummaryBar(summary)).toBe(true);
    expect(isWorkerSummaryBar(workBar({}))).toBe(false);
  });

  it('builds a worker summary spanning min start … max end', () => {
    const summary = buildWorkerTreeBars(
      [
        workBar({
          id: 'a',
          workerLabel: 'Иванов Иван',
          startDate: '2026-08-01',
          endDate: '2026-08-02',
        }),
        workBar({
          id: 'b',
          workerLabel: 'Иванов Иван',
          startDate: '2026-08-03',
          endDate: '2026-08-05',
        }),
      ],
      new Set(['Иванов Иван']),
    )[0]!;
    expect(summary.kind).toBe('summary');
    expect(summary.orderNumber).toBe('Иванов Иван');
    expect(summary.workTypeId).toBe(WORKER_SUMMARY_WORK_TYPE_ID);
    expect(summary.startDate).toBe('2026-08-01');
    expect(summary.endDate).toBe('2026-08-05');
    expect(summary.days).toBe(5);
    expect(summary.noTerm).toBe(false);
  });

  it('TZ-PRODUCTION-344: worker tree defaults collapsed (summaries only)', () => {
    const tree = buildWorkerTreeBars([
      workBar({
        id: 'b',
        workerLabel: 'Иванов Иван',
        startDate: '2026-08-03',
        endDate: '2026-08-05',
        occurrence: 2,
      }),
      workBar({
        id: 'a',
        workerLabel: 'Иванов Иван',
        startDate: '2026-08-01',
        endDate: '2026-08-02',
        occurrence: 1,
      }),
      workBar({ id: 'u', workerLabel: '—' }),
    ]);
    expect(tree.map((b) => b.id)).toEqual([
      'worker-summary:Иванов Иван',
      `worker-summary:${UNASSIGNED_WORKER_LABEL}`,
    ]);
  });

  it('TZ-PRODUCTION-344: expand worker → module context rows (not raw WT)', () => {
    const a = workBar({
      id: 'a',
      workerLabel: 'Иванов Иван',
      workTypeName: 'Сварка',
      startDate: '2026-08-01',
      endDate: '2026-08-02',
    });
    const b = workBar({
      id: 'b',
      workerLabel: 'Иванов Иван',
      workTypeId: 'wt2',
      workTypeName: 'Покраска',
      startDate: '2026-08-03',
      endDate: '2026-08-05',
      occurrence: 2,
    });
    const tree = buildWorkerTreeBars([a, b], new Set(['Иванов Иван']));
    expect(tree.map((b) => b.id)).toEqual([
      'worker-summary:Иванов Иван',
      ganttWorkerModuleSummaryId('Иванов Иван', 'o1', 0, 'm1'),
    ]);
    const mod = tree[1]!;
    expect(isModuleSummaryBar(mod)).toBe(true);
    expect(mod.moduleName).toBe('ORD-1 · Стол · Каркас');
    expect(formatWorkerModuleContextLabel(a)).toBe('ORD-1 · Стол · Каркас');
    expect(tree.some((b) => b.workTypeName === 'Сварка')).toBe(false);
  });

  it('TZ-PRODUCTION-344: expand worker-module → work types sorted by start', () => {
    const moduleId = ganttWorkerModuleSummaryId('Иванов Иван', 'o1', 0, 'm1');
    const tree = buildWorkerTreeBars(
      [
        workBar({
          id: 'b',
          workerLabel: 'Иванов Иван',
          workTypeName: 'Покраска',
          startDate: '2026-08-03',
          endDate: '2026-08-05',
          occurrence: 2,
        }),
        workBar({
          id: 'a',
          workerLabel: 'Иванов Иван',
          workTypeName: 'Сварка',
          startDate: '2026-08-01',
          endDate: '2026-08-02',
          occurrence: 1,
        }),
      ],
      new Set(['Иванов Иван']),
      new Set([moduleId]),
    );
    expect(tree.map((b) => b.id)).toEqual(['worker-summary:Иванов Иван', moduleId, 'a', 'b']);
    expect(tree.every((b) => b.kind != null)).toBe(true);
  });

  it('treats a comma-separated multi-person workerLabel as one group (known limitation)', () => {
    const multi = workBar({ id: 'm', workerLabel: 'Иванов Иван, Петров Пётр' });
    const solo = workBar({ id: 's', workerLabel: 'Иванов Иван' });
    expect(workerGroupKeyOf(multi)).toBe('Иванов Иван, Петров Пётр');
    expect(groupBarsByWorker([multi, solo]).map((g) => g.label)).toEqual([
      'Иванов Иван',
      'Иванов Иван, Петров Пётр',
    ]);
    const tree = buildWorkerTreeBars([multi, solo]);
    expect(tree.filter((b) => b.kind === 'summary')).toHaveLength(2);
  });
});
