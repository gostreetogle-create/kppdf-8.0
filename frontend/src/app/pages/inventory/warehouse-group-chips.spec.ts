import {
  buildMovementWarehouseFilterChips,
  buildWarehouseFilterChips,
  type QueryGroupChip,
} from './warehouse-group-chips';

describe('warehouse-group-chips (TZ-WAREHOUSE-UX-301)', () => {
  const warehouses = [
    { _id: 'w1', name: 'Основной' },
    { _id: 'w2', name: 'Резервный' },
  ];

  describe('buildMovementWarehouseFilterChips', () => {
    it('builds all + per-warehouse chips with warehouseId query', () => {
      const chips = buildMovementWarehouseFilterChips(warehouses);
      expect(chips.map((c) => c.id)).toEqual(['all', 'w1', 'w2']);
      expect(chips[0].queryParams).toEqual({ warehouseId: null, type: null });
      expect(chips[1].queryParams).toEqual({ warehouseId: 'w1', type: null });
      expect(chips[2].queryParams).toEqual({ warehouseId: 'w2', type: null });
    });

    it('preserves the active type filter in every chip query', () => {
      const chips = buildMovementWarehouseFilterChips(warehouses, 'in');
      expect(chips[0].queryParams).toEqual({ warehouseId: null, type: 'in' });
      expect(chips[2].queryParams).toEqual({ warehouseId: 'w2', type: 'in' });
    });

    it('returns only the all-chip when no warehouses exist', () => {
      const chips = buildMovementWarehouseFilterChips([], 'out');
      expect(chips).toHaveLength(1);
      expect(chips[0].queryParams).toEqual({ warehouseId: null, type: 'out' });
    });
  });

  describe('buildWarehouseFilterChips (Остатки — не ломать)', () => {
    it('keeps storage-items route + materialId preservation', () => {
      const chips: readonly QueryGroupChip[] = buildWarehouseFilterChips(warehouses, 'mat-1');
      expect(chips[0].route).toBe('/storage-items');
      expect(chips[0].queryParams).toEqual({ warehouseId: null, materialId: 'mat-1' });
      expect(chips[1].queryParams).toEqual({ warehouseId: 'w1', materialId: 'mat-1' });
      expect(chips[1].route).toBe('/storage-items');
    });
  });
});
