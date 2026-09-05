import type { Warehouse } from './pi-warehouses.service';

export interface StorageCatalogRef {
  _id: string;
  name: string;
  sku?: string;
  unit?: string;
}

export interface StorageItem {
  _id: string;
  warehouseId: string | Warehouse;
  warehouse?: Warehouse;
  materialId?: string | StorageCatalogRef;
  material?: StorageCatalogRef;
  productId?: string | StorageCatalogRef;
  product?: StorageCatalogRef;
  name?: string;
  zoneName?: string;
  quantity: number;
  reservedQty: number;
  minQuantity: number;
  isActive: boolean;
}

export interface StorageItemsListResponse {
  items: StorageItem[];
  total: number;
}

export interface StorageItemsListParams {
  warehouseId?: string;
  materialId?: string;
  productId?: string;
  lowStock?: boolean;
}

export interface PutOnStockPayload {
  warehouseId: string;
  quantity?: number;
  minQuantity?: number;
  zoneName?: string;
}

export interface StorageAdjustPayload {
  delta: number;
  reason: string;
}

export function storageItemName(item: StorageItem): string {
  const product =
    typeof item.productId === 'object' ? item.productId : item.product;
  const material =
    typeof item.materialId === 'object' ? item.materialId : item.material;
  return product?.name ?? material?.name ?? item.name ?? '—';
}

export function storageItemWarehouseName(item: StorageItem): string {
  if (item.warehouse?.name) return item.warehouse.name;
  if (typeof item.warehouseId === 'object') return item.warehouseId.name;
  return '—';
}

export function storageItemMaterialId(item: StorageItem): string | null {
  if (typeof item.materialId === 'string') return item.materialId;
  return item.materialId?._id ?? null;
}
