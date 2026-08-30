import {
  allowedLineTypes,
  canAddIntoNode,
  isLineTypeAllowed,
  isMaterialKindAllowedForParent,
  treeHasProductChild,
} from './composition-tree.contract';

describe('composition-tree.contract (TZ-NX-REGISTRIES-COMPOSITION-DIALOG)', () => {
  it('module parent allows module and material only', () => {
    expect(allowedLineTypes('module')).toEqual(['module', 'material']);
    expect(isLineTypeAllowed('module', 'product')).toBe(false);
  });

  it('product parent allows module, non-raw material, and product', () => {
    expect(allowedLineTypes('product')).toEqual(['module', 'material', 'product']);
    expect(isLineTypeAllowed('product', 'product')).toBe(true);
  });

  it('forbids raw material as direct product child', () => {
    expect(isMaterialKindAllowedForParent('product', 'raw')).toBe(false);
    expect(isMaterialKindAllowedForParent('product', 'part')).toBe(true);
    expect(isMaterialKindAllowedForParent('module', 'raw')).toBe(true);
  });

  it('canAddIntoNode matches legacy BOM parent rules', () => {
    const moduleNode = { _id: 'm', name: 'M', kind: 'module' as const, quantity: 1, children: [] };
    const productNode = { _id: 'p', name: 'P', kind: 'product' as const, quantity: 1, children: [] };
    const materialNode = { _id: 'mat', name: 'Mat', kind: 'material' as const, quantity: 1, children: [] };
    expect(canAddIntoNode('product', moduleNode)).toBe(true);
    expect(canAddIntoNode('product', productNode)).toBe(true);
    expect(canAddIntoNode('product', materialNode)).toBe(false);
    expect(canAddIntoNode('module', moduleNode)).toBe(true);
    expect(canAddIntoNode('module', productNode)).toBe(false);
  });

  it('re-exports treeHasProductChild for derived Комплекс badge', () => {
    expect(
      treeHasProductChild({
        _id: 'p',
        name: 'P',
        kind: 'product',
        quantity: 1,
        children: [
          {
            _id: 'c',
            name: 'C',
            kind: 'product',
            lineType: 'product',
            quantity: 1,
            children: [],
          },
        ],
      }),
    ).toBe(true);
  });
});
