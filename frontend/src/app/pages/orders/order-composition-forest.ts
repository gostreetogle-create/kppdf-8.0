import { forkJoin, map, of, type Observable } from 'rxjs';
import type {
  CompositionTreeNode,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import type { OrderItem } from './orders.service';

/** Same depth ladder as order-detail (TZ-ORDERS-302). */
export const ORDER_TREE_MAX_DEPTH = 8;
export const ORDER_TREE_INITIAL_DEPTH = 2;

/**
 * Live catalog BOM roots for order lines. Snapshot name/qty stay on the
 * root; children come from GET /products/:id/tree — not an order copy.
 */
export function loadOrderCompositionForest(
  catalog: Pick<ProductModulesService, 'getProductTree'>,
  items: readonly OrderItem[] | undefined,
  depth: number,
): Observable<CompositionTreeNode[]> {
  const lines = items ?? [];
  if (lines.length === 0) return of([]);
  return forkJoin(lines.map((item, index) => loadOrderLineRoot(catalog, item, index, depth)));
}

export function loadOrderLineRoot(
  catalog: Pick<ProductModulesService, 'getProductTree'>,
  item: OrderItem,
  index: number,
  depth: number,
): Observable<CompositionTreeNode> {
  const productId = (item.productId ?? '').trim();
  const snapshotName = (item.productName ?? '').trim();
  const qty = item.quantity > 0 ? item.quantity : 1;
  const fallbackId = `line:${index}:${productId || 'missing'}`;

  if (!productId) {
    return of({
      _id: fallbackId,
      name: snapshotName || 'Изделие без ссылки на каталог',
      kind: 'product',
      quantity: qty,
      unit: item.unit,
      children: [],
    });
  }

  return catalog.getProductTree(productId, depth).pipe(
    map((res) => {
      if (!res.ok) {
        return {
          _id: productId,
          name: snapshotName
            ? `${snapshotName} — не найдено в каталоге`
            : 'Изделие не найдено в каталоге',
          kind: 'product' as const,
          quantity: qty,
          unit: item.unit,
          children: [] as CompositionTreeNode[],
        };
      }
      const tree = res.data;
      return {
        ...tree,
        name: snapshotName || tree.name,
        quantity: qty,
        unit: item.unit ?? tree.unit,
      };
    }),
  );
}
