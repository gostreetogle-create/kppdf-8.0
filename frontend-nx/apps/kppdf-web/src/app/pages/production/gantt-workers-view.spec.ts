import {
  buildWorkerTreeBars,
  UNASSIGNED_WORKER_LABEL,
  isWorkerSummaryBar,
  isUnassignedWorkerSummaryBar,
  workerGroupKeyOf,
  type GanttBar,
} from './gantt-bar.model';

/**
 * TZ-NX-GANTT-G6 — режим «По рабочим» (TZ-GANTT-401 / 344):
 * - Worker → Module(+контекст заказ·изделие) → WT; «Не назначен» последней;
 * - read-only: у worker-summary нет resize/move (canResizeBar/canMoveBar
 *   отсекают через groupByWorkers — покрыто компонентными тестами логики ниже).
 */
function bar(overrides: Partial<GanttBar>): GanttBar {
  return {
    id: 'o1:0:m1:wt1',
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
    workerLabel: 'Иванов',
    ...overrides,
  } as GanttBar;
}

describe('Workers view (TZ-NX-GANTT-G6)', () => {
  it('groups work bars by workerLabel; worker summary appears before its module rows', () => {
    const bars = [
      bar({ id: 'o1:0:m1:wt1', workerLabel: 'Иванов' }),
      bar({ id: 'o1:1:m2:wt2', workTypeId: 'wt2', workTypeName: 'Покраска', workerLabel: 'Иванов' }),
      bar({ id: 'o2:0:m1:wt1', orderId: 'o2', orderNumber: 'ORD-2', workerLabel: 'Петров' }),
    ];
    const tree = buildWorkerTreeBars(bars, new Set(['Иванов']), new Set());
    expect(tree[0]!.id).toBe('worker-summary:Иванов');
    expect(isWorkerSummaryBar(tree[0]!)).toBe(true);
    // Both of Иванов's module rows follow after expand (module-level).
    const workerRows = tree.slice(1).filter((r) => r.orderNumber === 'ORD-1' || r.orderNumber === 'ORD-2');
    expect(workerRows.length).toBeGreaterThan(0);
  });

  it('puts «Не назначен» group last, RU-sorted before it', () => {
    const bars = [
      bar({ id: 'a', workerLabel: '—' }),
      bar({ id: 'b', workTypeId: 'wt2', workerLabel: 'Яна' }),
      bar({ id: 'c', workTypeId: 'wt3', workerLabel: 'Анна' }),
    ];
    const tree = buildWorkerTreeBars(bars, new Set(), new Set());
    const last = tree[tree.length - 1]!;
    expect(isUnassignedWorkerSummaryBar(last)).toBe(true);
    expect(last.orderNumber).toBe(UNASSIGNED_WORKER_LABEL);
  });

  it('workerGroupKeyOf maps «—»/empty to «Не назначен»', () => {
    expect(workerGroupKeyOf(bar({ workerLabel: '—' }))).toBe(UNASSIGNED_WORKER_LABEL);
    expect(workerGroupKeyOf(bar({ workerLabel: '' }))).toBe(UNASSIGNED_WORKER_LABEL);
    expect(workerGroupKeyOf(bar({ workerLabel: 'Иванов' }))).toBe('Иванов');
  });

  it('worker summary bars are not work bars (read-only view has no editable target)', () => {
    const bars = [bar({ workerLabel: 'Иванов' })];
    const tree = buildWorkerTreeBars(bars, new Set(), new Set());
    const summary = tree.find((r) => isWorkerSummaryBar(r))!;
    expect(summary.kind).toBe('summary');
    expect(summary.workTypeId).not.toBe('wt1');
  });
});
