import { of } from 'rxjs';
import type { CompositionTreeNode } from '../services/pi-product-modules.service';
import { loadOrderCompositionForest } from './order-composition-forest';
import { isCatalogCompositionId, isEmptyCatalogBranch } from './open-catalog-composition-edit';

describe('order composition helpers (TZ-ORDERS-337)', () => {
  it('loads live catalog trees and keeps snapshot qty/name', () => {
    const tree: CompositionTreeNode = {
      _id: 'p1',
      name: 'Каталог',
      kind: 'product',
      quantity: 1,
      children: [{ _id: 'm1', name: 'Модуль', kind: 'module', quantity: 1, children: [] }],
    };
    const getProductTree = jest.fn().mockReturnValue(of({ ok: true, data: tree }));
    let roots: CompositionTreeNode[] = [];
    loadOrderCompositionForest(
      { getProductTree },
      [{ productId: 'p1', productName: 'Стеллаж', quantity: 3, unitPrice: 0, unit: 'шт' }],
      2,
    ).subscribe((value) => {
      roots = value;
    });
    expect(getProductTree).toHaveBeenCalledWith('p1', 2);
    expect(roots).toHaveLength(1);
    expect(roots[0]?.name).toBe('Стеллаж');
    expect(roots[0]?.quantity).toBe(3);
    expect(roots[0]?.children[0]?.name).toBe('Модуль');
  });

  it('skips synthetic line ids and treats empty product/module as editable branch', () => {
    expect(isCatalogCompositionId('line:0:missing')).toBe(false);
    expect(isCatalogCompositionId('prod-1')).toBe(true);
    expect(
      isEmptyCatalogBranch({
        _id: 'prod-1',
        name: 'Пустое',
        kind: 'product',
        quantity: 1,
        children: [],
      }),
    ).toBe(true);
    expect(
      isEmptyCatalogBranch({
        _id: 'mat-1',
        name: 'Лист',
        kind: 'material',
        quantity: 1,
        children: [],
      }),
    ).toBe(false);
  });
});
