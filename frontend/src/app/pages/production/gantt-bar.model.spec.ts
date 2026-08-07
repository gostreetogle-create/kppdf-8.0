import {
  ACTIVE_COMMERCIAL_ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  buildGanttBars,
  filterOrdersForRail,
  normalizeWorkTypeDays,
  resolveVisualAnchor,
  type OrderEstimateInput,
} from './gantt-bar.model';
import type { OrderStatus } from '../orders/orders.service';

describe('gantt-bar.model', () => {
  it('exposes exactly four active commercial statuses', () => {
    expect([...ACTIVE_COMMERCIAL_ORDER_STATUSES]).toEqual([
      'draft',
      'confirmed',
      'in_production',
      'ready',
    ]);
  });

  it('labels all seven real Order statuses', () => {
    const keys = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
    expect(keys.sort()).toEqual(
      ['cancelled', 'confirmed', 'delivered', 'draft', 'in_production', 'ready', 'shipped'].sort(),
    );
    expect('planned' in ORDER_STATUS_LABELS).toBe(false);
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
    ];

    const active = filterOrdersForRail(orders, {
      activeOnly: true,
      search: '',
      selectedOrderId: null,
    });
    expect(active.map((o) => o._id)).toEqual(['1']);

    const withSelected = filterOrdersForRail(orders, {
      activeOnly: true,
      search: '',
      selectedOrderId: '3',
    });
    expect(withSelected.map((o) => o._id).sort()).toEqual(['1', '3']);

    const search = filterOrdersForRail(orders, {
      activeOnly: false,
      search: 'b-3',
      selectedOrderId: null,
    });
    expect(search.map((o) => o._id)).toEqual(['3']);
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
    expect(byPriority.map((o) => o._id).sort()).toEqual(['1', '3']);

    const byDate = filterOrdersForRail(orders, {
      activeOnly: true,
      search: '',
      selectedOrderId: null,
      dateFrom: '2026-08-09',
      dateTo: '2026-08-11',
    });
    expect(byDate.map((o) => o._id)).toEqual(['1']);
  });
});
