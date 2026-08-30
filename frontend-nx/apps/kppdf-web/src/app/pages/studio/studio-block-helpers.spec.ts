import type { StudioBlock } from '@kppdf/data-access';
import { studioCanvasBlocks } from './studio-block-helpers';

function block(id: string, page = 1): StudioBlock {
  return {
    _id: id,
    type: 'text',
    order: 0,
    title: `Layer ${id}`,
    content: '',
    layout: { page, x: 0.1, y: 0.1, width: 0.3, height: 0.12, zIndex: 1, rotation: 0 },
  };
}

describe('studioCanvasBlocks', () => {
  it('returns empty when no active layer', () => {
    expect(studioCanvasBlocks([block('a'), block('b')], null, 1)).toEqual([]);
  });

  it('returns only the active layer on the current page', () => {
    const blocks = [block('a', 1), block('b', 1), block('c', 2)];
    expect(studioCanvasBlocks(blocks, 'b', 1)).toEqual([block('b', 1)]);
  });

  it('excludes hidden layers', () => {
    const hidden = { ...block('a'), isActive: false };
    expect(studioCanvasBlocks([hidden], 'a', 1)).toEqual([]);
  });
});
