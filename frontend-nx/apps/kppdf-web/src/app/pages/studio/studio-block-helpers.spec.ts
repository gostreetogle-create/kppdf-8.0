import type { StudioBlock } from '@kppdf/data-access';
import {
  studioCanvasBackgroundBlocks,
  studioCanvasBlocks,
  studioCanvasForegroundBlocks,
  studioBlockIsPassportBackground,
  studioImageSettingsForUpdate,
  studioMergeBlockSettings,
  studioPreserveClientBlockSettings,
  resolveStudioTokenValue,
  renderStudioTokensAsValues,
  studioTextDisplayHtml,
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

describe('studioPreserveClientBlockSettings (TZ-NX-DOCSTUDIO-S46)', () => {
  const table = (overrides: Partial<StudioBlock>): StudioBlock => ({
    _id: 'tbl-1',
    type: 'table',
    order: 0,
    title: 'Таблица',
    content: '',
    ...overrides,
  });

  it('carries local liveRows onto a server block that omits them', () => {
    const local = table({
      settings: { dataSource: { type: 'catalog-products' }, liveRows: [['Кровать', '2'], ['Стол', '1']] },
    });
    const remote = table({
      layout: { page: 1, x: 0.2, y: 0.3, width: 0.4, height: 0.3, zIndex: 7, rotation: 0 },
      settings: { dataSource: { type: 'catalog-products' } },
    });
    const merged = studioPreserveClientBlockSettings(local, remote);
    expect(merged.settings?.['liveRows']).toEqual([['Кровать', '2'], ['Стол', '1']]);
    expect(merged.layout).toEqual(remote.layout); // server layout wins
  });

  it('lets the server win when the response does carry liveRows', () => {
    const local = table({ settings: { liveRows: [['local']] } });
    const remote = table({ settings: { liveRows: [['server']] } });
    expect(studioPreserveClientBlockSettings(local, remote).settings?.['liveRows']).toEqual([['server']]);
  });

  it('keeps a local blob imageUrl when the response omits it', () => {
    const local: StudioBlock = {
      ...table({}),
      type: 'image',
      settings: { imageUrl: 'blob:http://local/x' },
    };
    const remote: StudioBlock = { ...local, settings: {} };
    expect(studioPreserveClientBlockSettings(local, remote).settings?.['imageUrl']).toBe('blob:http://local/x');
  });

  it('returns the remote block untouched without local state or nothing to restore', () => {
    const remote = table({ settings: { liveRows: [['server']] } });
    expect(studioPreserveClientBlockSettings(undefined, remote)).toBe(remote);
    const local = table({ settings: { dataSource: { type: 'manual' } } });
    const remote2 = table({ settings: {} });
    expect(studioPreserveClientBlockSettings(local, remote2)).toBe(remote2);
  });
});

describe('resolveStudioTokenValue (TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP)', () => {
  const bag = {
    organization: { shortName: 'Ромашка', inn: '123' },
    anchor: { client: { name: 'ООО Клиент' } },
    items: ['A', 'B'],
  };

  it('walks a dotted path into the bag', () => {
    expect(resolveStudioTokenValue(bag, 'organization.shortName')).toBe('Ромашка');
    expect(resolveStudioTokenValue(bag, 'anchor.client.name')).toBe('ООО Клиент');
  });

  it('supports a numeric array index segment', () => {
    expect(resolveStudioTokenValue(bag, 'items.0')).toBe('A');
    expect(resolveStudioTokenValue(bag, 'items.9')).toBeNull();
  });

  it('returns null (not "") for an unresolved path, and coerces a real empty string correctly', () => {
    expect(resolveStudioTokenValue(bag, 'organization.missing')).toBeNull();
    expect(resolveStudioTokenValue(bag, 'nope.nope')).toBeNull();
    expect(resolveStudioTokenValue({ x: '' }, 'x')).toBe('');
  });
});

describe('renderStudioTokensAsValues (TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP)', () => {
  const bag = { organization: { shortName: 'Ромашка' } };

  it('substitutes a resolved token as plain escaped text — no chip styling', () => {
    const html = renderStudioTokensAsValues('Изготовитель: {{organization.shortName}}', bag);
    expect(html).toBe('Изготовитель: Ромашка');
    expect(html).not.toContain('substitution-token');
  });

  /**
   * TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON — an unresolved token in «Значения»
   * keeps the same substitution-token base markup/data-attrs, but gets the
   * `--unresolved` modifier (dashed/muted, see studio-blocks-canvas.component
   * .ts's CSS), NOT the identical `.substitution-token` chip «Токены» mode
   * uses — that identity was the audit's "визуально no-op" bug (switching
   * modes with nothing resolved looked unchanged).
   */
  it('marks an unresolved token distinctly from the plain «Токены» chip, not a bare "" or "—"', () => {
    const html = renderStudioTokensAsValues('Клиент: {{counterparty.name}}', bag);
    expect(html).toContain('data-substitution-token=""');
    expect(html).toContain('data-token="{{counterparty.name}}"');
    expect(html).toContain('class="substitution-token substitution-token--unresolved"');
    expect(html).not.toContain('class="substitution-token"');
    expect(html).toContain('{{counterparty.name}}');
  });

  it('escapes HTML-significant characters in a resolved value (canvas renders via innerHTML)', () => {
    const html = renderStudioTokensAsValues('{{organization.shortName}}', { organization: { shortName: '<b>x</b> & "y"' } });
    expect(html).toBe('&lt;b&gt;x&lt;/b&gt; &amp; &quot;y&quot;');
  });

  it('returns plain text unchanged when it holds no tokens at all', () => {
    expect(renderStudioTokensAsValues('Просто текст', bag)).toBe('Просто текст');
  });

  it('never touches the source string / has no write-path — pure function', () => {
    const before = 'A {{organization.shortName}} B';
    renderStudioTokensAsValues(before, bag);
    expect(before).toBe('A {{organization.shortName}} B');
  });
});

describe('studioTextDisplayHtml (TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP)', () => {
  const bag = { organization: { shortName: 'Ромашка' } };

  it('«tokens» mode chips every {{…}} occurrence (canvas previously showed raw text)', () => {
    const html = studioTextDisplayHtml('{{organization.shortName}}', 'tokens', bag);
    expect(html).toContain('class="substitution-token"');
    expect(html).toContain('{{organization.shortName}}');
  });

  it('«values» mode substitutes from the bag instead', () => {
    expect(studioTextDisplayHtml('{{organization.shortName}}', 'values', bag)).toBe('Ромашка');
  });
});
