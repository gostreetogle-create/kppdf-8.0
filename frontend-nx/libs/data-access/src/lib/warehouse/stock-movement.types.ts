import type { Warehouse } from './pi-warehouses.service';

export type MovementType = 'in' | 'out' | 'transfer' | 'adjust';

export interface StockMovementCatalogRef {
  _id: string;
  name: string;
  sku?: string;
  unit?: string;
}

export interface StockMovement {
  _id: string;
  type: MovementType;
  date: string;
  productId?: string | StockMovementCatalogRef;
  product?: StockMovementCatalogRef;
  materialId?: string | StockMovementCatalogRef;
  material?: StockMovementCatalogRef;
  warehouseId: string | Warehouse;
  warehouse?: Warehouse;
  toWarehouseId?: string | Warehouse;
  toWarehouse?: Warehouse;
  zoneName?: string;
  toZoneName?: string;
  qty: number;
  documentRef?: string;
  orderId?: string;
  createdAt?: string;
}

export interface StockMovementsListResponse {
  items: StockMovement[];
  total: number;
}

export interface StockMovementsListParams {
  warehouseId?: string;
  materialId?: string;
  productId?: string;
  type?: MovementType;
  from?: string;
  to?: string;
}

/** Existing atomic POST /stock-movements contract for in/out UI. */
export interface CreateStockMovementPayload {
  type: 'in' | 'out';
  warehouseId: string;
  qty: number;
  materialId?: string;
  productId?: string;
  zoneName?: string;
  documentRef?: string;
  orderId?: string;
}

export function stockMovementTargetName(movement: StockMovement): string {
  const material =
    typeof movement.materialId === 'object'
      ? movement.materialId
      : movement.material;
  const product =
    typeof movement.productId === 'object'
      ? movement.productId
      : movement.product;
  return material?.name ?? product?.name ?? '—';
}

export function stockMovementWarehouseName(movement: StockMovement): string {
  if (movement.warehouse?.name) return movement.warehouse.name;
  if (typeof movement.warehouseId === 'object')
    return movement.warehouseId.name;
  return '—';
}

export function stockMovementDocument(movement: StockMovement): string {
  return movement.documentRef ?? movement.orderId ?? '—';
}
