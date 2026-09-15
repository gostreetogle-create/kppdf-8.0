import type { CompositionLine, CompositionTreeNode } from '@kppdf/data-access';
import {
  findCompositionLine,
  lineTypeForNode,
  treeHasProductChild,
} from './composition-line-resolve';

const MODULE_LINE: CompositionLine = {
  _id: 'line-mod-1',
  refId: 'mod-child',
  lineType: 'module',
  quantity: 2,
  sortOrder: 0,
};

describe('composition-line-resolve (Phase 2)', () => {
  it('resolves line by refId + lineType (tree _id is refId)', () => {
    const node: CompositionTreeNode = {
      _id: 'mod-child',
      name: 'Child module',
      kind: 'module',
      lineType: 'module',
      quantity: 2,
      children: [],
    };
    expect(findCompositionLine([MODULE_LINE], node)?._id).toBe('line-mod-1');
  });

  it('lineTypeForNode falls back to kind', () => {
    expect(
      lineTypeForNode({
        _id: 'p1',
        name: 'P',
        kind: 'product',
        quantity: 1,
        children: [],
      }),
    ).toBe('product');
  });

  it('treeHasProductChild detects direct and nested product lines', () => {
    const root: CompositionTreeNode = {
      _id: 'root',
      name: 'Root',
      kind: 'product',
      quantity: 1,
      children: [
        {
          _id: 'nested',
          name: 'Nested',
          kind: 'product',
          lineType: 'product',
          quantity: 1,
          children: [],
        },
      ],
    };
    expect(treeHasProductChild(root)).toBe(true);
    expect(
      treeHasProductChild({
        _id: 'm',
        name: 'M',
        kind: 'module',
        quantity: 1,
        children: [
          {
            _id: 'mat',
            name: 'Mat',
            kind: 'material',
            lineType: 'material',
            quantity: 1,
            children: [],
          },
        ],
      }),
    ).toBe(false);
  });
});
