import type { StudioBlock } from '@kppdf/data-access';
import {
  studioCanvasBackgroundBlocks,
  studioCanvasBlocks,
  studioCanvasForegroundBlocks,
  studioBlockIsPassportBackground,
  studioImageSettingsForUpdate,
  studioMergeBlockSettings,
} from './studio-block-helpers';

function block(id: string, page = 1, zIndex = 1): StudioBlock {
  return {
    _id: id,
    type: 'text',
    order: 0,
    title: `Layer ${id}`,
    content: '',
    layout: { page, x: 0.1, y: 0.1, width: 0.3, height: 0.12, zIndex, rotation: 0 },
  };
}

describe('studioCanvasBlocks', () => {
  it('returns all visible blocks on the page sorted by zIndex', () => {
    const blocks = [block('a', 1, 2), block('b', 1, 5), block('c', 2, 1)];
    expect(studioCanvasBlocks(blocks, null, 1).map((b) => b._id)).toEqual(['a', 'b']);
  });

  it('ignores activeLayerId filter — all visible layers render', () => {
    const blocks = [block('a', 1, 1), block('b', 1, 2)];
    expect(studioCanvasBlocks(blocks, 'a', 1).map((b) => b._id)).toEqual(['a', 'b']);
  });

  it('excludes hidden layers (eye off)', () => {
    const hidden = { ...block('a'), isActive: false };
    expect(studioCanvasBlocks([hidden, block('b')], null, 1).map((b) => b._id)).toEqual(['b']);
  });
});


describe('studioBlockIsPassportBackground', () => {
  it('is true for image blocks with settings.overlay', () => {
    const bg: StudioBlock = {
      ...block('img', 1, 0),
      type: 'image',
      settings: { overlay: true },
    };
    expect(studioBlockIsPassportBackground(bg)).toBe(true);
    expect(studioBlockIsPassportBackground(block('t'))).toBe(false);
  });
});

describe('studioCanvasBackgroundBlocks', () => {
  it('splits overlay images from foreground canvas blocks', () => {
    const fg = block('fg', 1, 2);
    const bg: StudioBlock = {
      ...block('bg', 1, 0),
      type: 'image',
      settings: { overlay: true },
    };
    const blocks = [fg, bg];
    expect(studioCanvasForegroundBlocks(blocks, null, 1).map((b) => b._id)).toEqual(['fg']);
    expect(studioCanvasBackgroundBlocks(blocks, null, 1).map((b) => b._id)).toEqual(['bg']);
  });
});

describe('studioImageSettingsForUpdate', () => {
  it('merges overlay while keeping persisted imageUrl', () => {
    expect(
      studioImageSettingsForUpdate(
        { imageUrl: '/uploads/template-blocks/x/a.png', naturalWidth: 800 },
        { overlay: true },
      ),
    ).toEqual({
      imageUrl: '/uploads/template-blocks/x/a.png',
      naturalWidth: 800,
      overlay: true,
    });
  });

  it('drops blob imageUrl from PATCH payload', () => {
    expect(
      studioImageSettingsForUpdate({ imageUrl: 'blob:http://local/x' }, { overlay: true }),
    ).toEqual({ overlay: true });
  });
});

describe('studioMergeBlockSettings', () => {
  it('keeps local imageUrl when remote settings omit it', () => {
    expect(
      studioMergeBlockSettings(
        { imageUrl: '/uploads/template-blocks/x/a.png' },
        { overlay: true },
        { overlay: true },
      ),
    ).toEqual({
      imageUrl: '/uploads/template-blocks/x/a.png',
      overlay: true,
    });
  });
});
