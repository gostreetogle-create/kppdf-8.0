import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { StorageItemService } from '../storage-item/storage-item.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { StockMovementService } from '../stock-movement/stock-movement.service';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly storage: StorageItemService,
    private readonly warehouses: WarehouseService,
    private readonly movements: StockMovementService,
  ) {}

  @Get()
  @Roles('admin', 'manager', 'user')
  async dashboard() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      allWarehouses,
      allItems,
      recentMovements,
    ] = await Promise.all([
      this.warehouses.findAll(),
      this.storage.findAll(),
      this.movements.findAll(undefined, undefined, undefined, thirtyDaysAgo),
    ]);

    const activeWarehouses = allWarehouses.filter((w: any) => w.isActive !== false);
    const activeItems = allItems.filter((i: any) => i.isActive !== false && (i.quantity ?? 0) > 0);
    const outOfStock = allItems.filter((i: any) => i.isActive !== false && (i.quantity ?? 0) === 0);
    const lowStock = allItems.filter(
      (i: any) => i.isActive !== false && (i.quantity ?? 0) > 0 && (i.quantity ?? 0) <= (i.minQuantity ?? 0),
    );

    const warehouseCounts = new Map<string, { name: string; count: number }>();
    for (const item of activeItems) {
      const whId = String(item.warehouseId?._id ?? item.warehouseId);
      const whName = (item.warehouseId as any)?.name ?? whId;
      const entry = warehouseCounts.get(whId) ?? { name: whName, count: 0 };
      entry.count++;
      warehouseCounts.set(whId, entry);
    }
    const byWarehouseTop = [...warehouseCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([warehouseId, { name: warehouseName, count: itemCount }]) => ({
        warehouseId,
        warehouseName,
        itemCount,
      }));

    const recentlyUpdatedItems = [...allItems]
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map((i: any) => ({
        id: String(i._id),
        name: i.name,
        qty: i.quantity ?? 0,
        unit: i.unit ?? '',
        updatedAt: i.updatedAt,
      }));

    return {
      totalWarehouses: activeWarehouses.length,
      totalActiveItems: activeItems.length,
      outOfStockCount: outOfStock.length,
      lowStockCount: lowStock.length,
      totalMovementsLast30d: recentMovements.length,
      byWarehouseTop,
      recentlyUpdatedItems,
      asOf: new Date(),
    };
  }

  @Get('low-stock')
  @Roles('admin', 'manager', 'user')
  lowStock() {
    return this.storage.findAll(undefined, undefined, true);
  }
}
