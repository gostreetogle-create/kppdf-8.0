import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { StudioBlocksCanvasComponent } from './studio-blocks-canvas.component';
import type { StudioBlock } from '@kppdf/data-access';

/**
 * TZ-NX-DOCSTUDIO-S45 — the canvas is print-like: a manual table never shows an
 * inline `.table-edit` grid on the A4 sheet; empty tables show a placeholder
 * row instead of a bare thead.
 * TZ-NX-PO-SWEEP-02 — single click only selects (+ resize handle); dblclick
 * (or the chrome-rail Свойства button) asks the host to open Свойства.
 */
describe('StudioBlocksCanvasComponent — S45 print-like tables', () => {
  const TABLE: StudioBlock = {
    _id: 'tbl-1',
    type: 'table',
    order: 0,
    title: 'Витрина',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateColumns: [
        { key: 'name', label: 'Наименование', type: 'text', width: 60, align: 'left' },
        { key: 'qty', label: 'Кол-во', type: 'number', width: 20, align: 'right' },
      ],
      tableTemplateSampleRows: [
        ['Кровать «Ночной сон»', '2'],
        ['Стол «Обеденный»', '1'],
      ],
    },
  };

  let fixture: ComponentFixture<StudioBlocksCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StudioBlocksCanvasComponent] }).compileComponents();
  });

  function createCanvas(blocks: readonly StudioBlock[]): StudioBlocksCanvasComponent {
    fixture = TestBed.createComponent(StudioBlocksCanvasComponent);
    fixture.componentRef.setInput('blocks', [...blocks]);
    fixture.componentRef.setInput('selectedId', null);
    fixture.componentRef.setInput('activeLayerId', null);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('manual selected table keeps the document-like preview with selection frame + handle', () => {
    createCanvas([TABLE]);
    fixture.componentRef.setInput('selectedId', 'tbl-1');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    // No admin-grid on the sheet…
    expect(host.querySelector('[data-test="studio-table-rows-editor"]')).toBeNull();
    expect(host.querySelector('.table-edit')).toBeNull();
    // …the print-like preview stays…
    expect(host.querySelector('.table-preview table')).not.toBeNull();
    // …and the selection frame + handle are present.
    expect(host.querySelector('.selection-frame')).not.toBeNull();
  });

  it('TZ-NX-PO-SWEEP-02: single click only selects — no tableEditRequest, handle stays reachable', () => {
    const component = createCanvas([TABLE]);
    const selectSpy = jest.fn();
    const editSpy = jest.fn();
    component.selected.subscribe(selectSpy);
    component.tableEditRequest.subscribe(editSpy);

    const host: HTMLElement = fixture.nativeElement;
    const article = host.querySelector<HTMLElement>('article.studio-block--table')!;
    article.click();

    expect(selectSpy).toHaveBeenCalledWith('tbl-1');
    expect(editSpy).not.toHaveBeenCalled();
  });

  it('TZ-NX-PO-SWEEP-02: dblclick opens Свойства (tableEditRequest)', () => {
    const component = createCanvas([TABLE]);
    fixture.componentRef.setInput('selectedId', 'tbl-1');
    fixture.detectChanges();
    const editSpy = jest.fn();
    component.tableEditRequest.subscribe(editSpy);

    const host: HTMLElement = fixture.nativeElement;
    const article = host.querySelector<HTMLElement>('article.studio-block--table')!;
    article.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    expect(editSpy).toHaveBeenCalledWith('tbl-1');
  });

  it('empty manual table renders a placeholder row, not a bare thead', () => {
    createCanvas([{ ...TABLE, settings: { ...TABLE.settings, tableTemplateSampleRows: [] } }]);

    const host: HTMLElement = fixture.nativeElement;
    const emptyRow = host.querySelector('.table-preview__empty');
    expect(emptyRow).not.toBeNull();
    // TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE — no dataSource at all: points at
    // Properties / Insert, not the wired-source "check Selected/КП/order" text.
    expect(emptyRow!.textContent).toContain('Нет источника строк');
  });

  it('TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE: wired catalog table with empty liveRows shows the "check source" text, not "Свойства"', () => {
    createCanvas([
      {
        ...TABLE,
        settings: { ...TABLE.settings, dataSource: { type: 'catalog-products' }, liveRows: [] },
      },
    ]);

    const host: HTMLElement = fixture.nativeElement;
    const emptyRow = host.querySelector('.table-preview__empty');
    expect(emptyRow).not.toBeNull();
    expect(emptyRow!.textContent).toContain('Нет строк из источника');
    expect(emptyRow!.textContent).not.toContain('Свойствах');
  });

  it('table click is a single selection gesture — no row inputs to fight drag', () => {
    const component = createCanvas([TABLE]);
    fixture.componentRef.setInput('selectedId', 'tbl-1');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.table-preview input[type="text"]')).toBeNull();
    expect(host.querySelector('.table-preview input[type="checkbox"]')).toBeNull();
  });
});

/**
 * TZ-NX-DOCSTUDIO-S47 (BUG-5) — `tableRows()` returned raw `liveRows` untouched
 * by `tableHiddenColumnKeys`, so a hidden column stayed visible for live/catalog
 * -source tables even though manual tables correctly hide it via
 * `studioVisibleTableRows`. Live rows must go through the same visible-column
 * filter as headers (`tableColumns()`).
 */
describe('StudioBlocksCanvasComponent — liveRows respect hidden columns (TZ-NX-DOCSTUDIO-S47)', () => {
  const LIVE_TABLE: StudioBlock = {
    _id: 'tbl-live',
    type: 'table',
    order: 0,
    title: 'КП',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      dataSource: { type: 'catalog-products' },
      tableTemplateColumns: [
        { key: 'article', label: 'Артикул', type: 'text', width: 20, align: 'left' },
        { key: 'photo', label: 'Фото', type: 'text', width: 20, align: 'center' },
        { key: 'productName', label: 'Наименование', type: 'text', width: 60, align: 'left' },
      ],
      tableHiddenColumnKeys: ['photo'],
      liveRows: [['SKU-1', '/uploads/mangal.webp', 'Мангал']],
    },
  };

  let fixture: ComponentFixture<StudioBlocksCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StudioBlocksCanvasComponent] }).compileComponents();
  });

  it('hides the same column in liveRows as in the header, not the raw positional cell', () => {
    fixture = TestBed.createComponent(StudioBlocksCanvasComponent);
    fixture.componentRef.setInput('blocks', [LIVE_TABLE]);
    fixture.componentRef.setInput('selectedId', null);
    fixture.componentRef.setInput('activeLayerId', null);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.tableColumns(LIVE_TABLE).map((c) => c.key)).toEqual(['article', 'productName']);
    expect(component.tableRows(LIVE_TABLE)).toEqual([['SKU-1', 'Мангал']]);
  });
});

/**
 * TZ-NX-DOCSTUDIO-S48 — the Фото column used to render whatever raw string sat
 * in that cell position (e.g. quantity `1` after a BUG-1 column-count
 * mismatch, or a URL as plain text). It must render an `<img>` when a URL is
 * present and a blank cell when it is empty — never a bare digit or raw URL
 * text. TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK (2026-09-14) reversed S48's
 * own "Нет фото" placeholder text — PO wants a silent blank cell instead.
 */
describe('StudioBlocksCanvasComponent — photo column renders image or empty state (TZ-NX-DOCSTUDIO-S48)', () => {
  const TABLE_WITH_PHOTO: StudioBlock = {
    _id: 'tbl-photo',
    type: 'table',
    order: 0,
    title: 'КП',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateColumns: [
        { key: 'article', label: 'Артикул', type: 'text', width: 20, align: 'left' },
        { key: 'photo', label: 'Фото', type: 'text', width: 20, align: 'center' },
        { key: 'productName', label: 'Наименование', type: 'text', width: 60, align: 'left' },
      ],
      tableTemplateSampleRows: [
        ['SKU-1', '/uploads/mangal.webp', 'Мангал'],
        ['SKU-2', '', 'Стол'],
      ],
    },
  };

  let fixture: ComponentFixture<StudioBlocksCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StudioBlocksCanvasComponent] }).compileComponents();
  });

  function createCanvas(blocks: readonly StudioBlock[]): void {
    fixture = TestBed.createComponent(StudioBlocksCanvasComponent);
    fixture.componentRef.setInput('blocks', [...blocks]);
    fixture.componentRef.setInput('selectedId', null);
    fixture.componentRef.setInput('activeLayerId', null);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
  }

  it('renders an <img> for a populated photo cell and never the raw URL as text', () => {
    createCanvas([TABLE_WITH_PHOTO]);
    const host: HTMLElement = fixture.nativeElement;
    const rows = host.querySelectorAll('tbody tr');
    const firstRowPhotoCell = rows[0]!.querySelectorAll('td')[1]!;

    const img = firstRowPhotoCell.querySelector('img.table-preview__photo');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toBe('/uploads/mangal.webp');
    expect(firstRowPhotoCell.textContent?.trim()).toBe('');
  });

  /**
   * TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG — a URL that resolved as valid
   * server-side can still fail to load client-side (upload mid-flight, dev
   * server restart); the browser's default broken-image icon must never be
   * the end state on canvas. TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK: that
   * end state is now a blank cell, not a "Нет фото" label.
   */
  it('falls back to a blank cell when the <img> fails to load, instead of a broken-image icon (TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK)', () => {
    createCanvas([TABLE_WITH_PHOTO]);
    const host: HTMLElement = fixture.nativeElement;
    const firstRowPhotoCell = host.querySelectorAll('tbody tr')[0]!.querySelectorAll('td')[1]!;
    const img = firstRowPhotoCell.querySelector('img.table-preview__photo');
    expect(img).not.toBeNull();

    img!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(firstRowPhotoCell.querySelector('img')).toBeNull();
    expect(firstRowPhotoCell.textContent?.trim()).toBe('');
  });

  it('renders a blank cell for an empty photo cell, not a "Нет фото" label or a stray digit (TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK)', () => {
    createCanvas([TABLE_WITH_PHOTO]);
    const host: HTMLElement = fixture.nativeElement;
    const rows = host.querySelectorAll('tbody tr');
    const secondRowPhotoCell = rows[1]!.querySelectorAll('td')[1]!;

    expect(secondRowPhotoCell.querySelector('img')).toBeNull();
    expect(secondRowPhotoCell.textContent?.trim()).toBe('');
  });

  it('non-photo columns still render as plain text cells', () => {
    createCanvas([TABLE_WITH_PHOTO]);
    const host: HTMLElement = fixture.nativeElement;
    const rows = host.querySelectorAll('tbody tr');
    const nameCell = rows[0]!.querySelectorAll('td')[2]!;

    expect(nameCell.querySelector('img')).toBeNull();
    expect(nameCell.textContent?.trim()).toBe('Мангал');
  });

  /**
   * TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE — the real «Продукты» table templates
   * in the live DB key their photo column `photoIds` (matches the catalog
   * Product/Material field name they were built from), not the shorter
   * canonical `photo` used in the other fixtures above. Locks that the alias
   * list already covers it case-insensitively — audited, not assumed.
   */
  it('recognizes the real-world "photoIds" column key (not just canonical "photo")', () => {
    const tableWithPhotoIds: StudioBlock = {
      ...TABLE_WITH_PHOTO,
      _id: 'tbl-photoids',
      settings: {
        tableTemplateColumns: [
          { key: 'sku', label: 'Артикул', type: 'text', width: 20, align: 'left' },
          { key: 'photoIds', label: 'Фото', type: 'text', width: 20, align: 'center' },
          { key: 'name', label: 'Наименование', type: 'text', width: 60, align: 'left' },
        ],
        tableTemplateSampleRows: [['1101', '/uploads/vorota.png', 'Ворота мини-футбольные']],
      },
    };
    createCanvas([tableWithPhotoIds]);
    const host: HTMLElement = fixture.nativeElement;
    const photoCell = host.querySelectorAll('tbody tr')[0]!.querySelectorAll('td')[1]!;

    const img = photoCell.querySelector('img.table-preview__photo');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toBe('/uploads/vorota.png');
  });
});

/**
 * TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY — `col.width` used to be a dead
 * control: saved by Свойства, never applied by the canvas (which had no
 * width styling on th/td at all — the browser's default equal auto-layout
 * won regardless of the saved number).
 */
describe('StudioBlocksCanvasComponent — column width applies to th/td (TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY)', () => {
  const TABLE_WITH_WIDTHS: StudioBlock = {
    _id: 'tbl-widths',
    type: 'table',
    order: 0,
    title: 'КП',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateColumns: [
        { key: 'name', label: 'Наименование', type: 'text', width: 70, align: 'left' },
        { key: 'qty', label: 'Кол-во', type: 'number', width: 30, align: 'right' },
      ],
      tableTemplateSampleRows: [['Стол', '2']],
    },
  };

  let fixture: ComponentFixture<StudioBlocksCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StudioBlocksCanvasComponent] }).compileComponents();
  });

  function createCanvas(blocks: readonly StudioBlock[]): void {
    fixture = TestBed.createComponent(StudioBlocksCanvasComponent);
    fixture.componentRef.setInput('blocks', [...blocks]);
    fixture.componentRef.setInput('selectedId', null);
    fixture.componentRef.setInput('activeLayerId', null);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
  }

  it('applies explicit widths (70/30) to both th and td, changing them visibly changes the DOM width', () => {
    createCanvas([TABLE_WITH_WIDTHS]);
    const host: HTMLElement = fixture.nativeElement;
    const headers = host.querySelectorAll('thead th');
    const cells = host.querySelectorAll('tbody td');

    expect((headers[0] as HTMLElement).style.width).toBe('70%');
    expect((headers[1] as HTMLElement).style.width).toBe('30%');
    expect((cells[0] as HTMLElement).style.width).toBe('70%');
    expect((cells[1] as HTMLElement).style.width).toBe('30%');
  });

  it('no widths set: falls back to an equal split, not left unstyled', () => {
    const table: StudioBlock = {
      ...TABLE_WITH_WIDTHS,
      _id: 'tbl-no-width',
      settings: {
        tableTemplateColumns: [
          { key: 'a', label: 'A', type: 'text', align: 'left' } as never,
          { key: 'b', label: 'B', type: 'text', align: 'left' } as never,
        ],
        tableTemplateSampleRows: [['1', '2']],
      },
    };
    createCanvas([table]);
    const host: HTMLElement = fixture.nativeElement;
    const headers = host.querySelectorAll('thead th');
    expect((headers[0] as HTMLElement).style.width).toBe('50%');
    expect((headers[1] as HTMLElement).style.width).toBe('50%');
  });
});

/**
 * TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP — `textHtml()` used to be a raw
 * `bypassSecurityTrustHtml` with zero token handling: a plain-text
 * `{{organization.shortName}}` rendered as ordinary black text on the
 * canvas (only the RTE dialog migrated tokens to chips). Default is now
 * chips (`tokens` mode); `values` mode substitutes from the bag as plain
 * ink instead, per the TZ's own explicit "не chip" wording for resolved
 * values.
 */
describe('StudioBlocksCanvasComponent — text token display mode (TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP)', () => {
  const TEXT_BLOCK: StudioBlock = {
    _id: 'txt-1',
    type: 'text',
    order: 0,
    title: 'Текст',
    content: 'Исполнитель: {{organization.shortName}}',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.12, zIndex: 1, rotation: 0 },
  };

  let fixture: ComponentFixture<StudioBlocksCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StudioBlocksCanvasComponent] }).compileComponents();
  });

  function createCanvas(blocks: readonly StudioBlock[]): StudioBlocksCanvasComponent {
    fixture = TestBed.createComponent(StudioBlocksCanvasComponent);
    fixture.componentRef.setInput('blocks', [...blocks]);
    fixture.componentRef.setInput('selectedId', null);
    fixture.componentRef.setInput('activeLayerId', null);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('default «tokens» mode renders a chip, not raw {{…}} black text', () => {
    createCanvas([TEXT_BLOCK]);
    const host: HTMLElement = fixture.nativeElement;
    const chip = host.querySelector('.studio-block__text-body .substitution-token');
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toBe('{{organization.shortName}}');
  });

  it('«values» mode substitutes the resolved value as plain text, no chip', () => {
    createCanvas([TEXT_BLOCK]);
    fixture.componentRef.setInput('tokenDisplayMode', 'values');
    fixture.componentRef.setInput('substitutionBag', { organization: { shortName: 'Ромашка' } });
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.studio-block__text-body .substitution-token')).toBeNull();
    expect(host.querySelector('.studio-block__text-body')!.textContent).toContain('Исполнитель: Ромашка');
  });

  it('«values» mode keeps an unresolved token as a chip (empty bag)', () => {
    createCanvas([TEXT_BLOCK]);
    fixture.componentRef.setInput('tokenDisplayMode', 'values');
    fixture.componentRef.setInput('substitutionBag', {});
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const chip = host.querySelector('.studio-block__text-body .substitution-token');
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toBe('{{organization.shortName}}');
  });

  it('switching back to «tokens» restores the chip without reloading the document', () => {
    createCanvas([TEXT_BLOCK]);
    fixture.componentRef.setInput('tokenDisplayMode', 'values');
    fixture.componentRef.setInput('substitutionBag', { organization: { shortName: 'Ромашка' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.substitution-token')).toBeNull();

    fixture.componentRef.setInput('tokenDisplayMode', 'tokens');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.substitution-token')).not.toBeNull();
  });
});

/**
 * TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG — the audit's root cause was
 * .studio-block--passport-bg img and .studio-block--image img sitting at
 * EQUAL CSS specificity, so source order silently decided which object-fit
 * won (cover always beat contain, since it was declared later) — a
 * passport (settings.overlay=true) rendered stretched/cropped on the canvas
 * while the PDF (server-side, contain, unaffected) letterboxed it. The fix
 * is a compound `.studio-block--passport-bg.studio-block--image img`
 * selector, which getComputedStyle can verify directly: at equal
 * specificity a plain class-presence check would not prove which rule the
 * cascade actually picked.
 */
describe('StudioBlocksCanvasComponent — passport contain vs regular photo cover (TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG)', () => {
  let fixture: ComponentFixture<StudioBlocksCanvasComponent>;

  function createCanvas(blocks: readonly StudioBlock[]): StudioBlocksCanvasComponent {
    fixture = TestBed.createComponent(StudioBlocksCanvasComponent);
    fixture.componentRef.setInput('blocks', [...blocks]);
    fixture.componentRef.setInput('selectedId', null);
    fixture.componentRef.setInput('activeLayerId', null);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StudioBlocksCanvasComponent] }).compileComponents();
  });

  const PASSPORT: StudioBlock = {
    _id: 'img-passport',
    type: 'image',
    order: 0,
    content: '',
    layout: { page: 1, x: 0, y: 0, width: 1, height: 1, zIndex: 0, rotation: 0 },
    settings: { overlay: true, imageUrl: '/uploads/passport.png' },
  };

  const REGULAR_PHOTO: StudioBlock = {
    _id: 'img-regular',
    type: 'image',
    order: 1,
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.4, height: 0.3, zIndex: 1, rotation: 0 },
    settings: { imageUrl: '/uploads/photo.png' },
  };

  it('a passport background image (settings.overlay=true) renders with BOTH classes (compound selector target)', () => {
    createCanvas([PASSPORT]);
    const host: HTMLElement = fixture.nativeElement;
    const article = host.querySelector<HTMLElement>('article.studio-block--passport-bg')!;
    expect(article).not.toBeNull();
    expect(article.classList.contains('studio-block--image')).toBe(true);
    expect(article.querySelector('img')).not.toBeNull();
  });

  it('a regular (non-overlay) photo block renders WITHOUT the passport-bg class', () => {
    createCanvas([REGULAR_PHOTO]);
    const host: HTMLElement = fixture.nativeElement;
    const article = host.querySelector<HTMLElement>('article.studio-block--image')!;
    expect(article).not.toBeNull();
    expect(article.classList.contains('studio-block--passport-bg')).toBe(false);
    expect(article.querySelector('img')).not.toBeNull();
  });

  /**
   * jsdom does not resolve computed style or expose the component's CSS
   * text for this Angular version's style-injection mechanism (both
   * getComputedStyle and reading document `<style>` nodes returned ''
   * against a real element/rule in this setup) — a jsdom assertion here
   * would pass or fail independent of the actual cascade fix. The class-
   * presence tests above are the reliable unit-level contract (they prove
   * the template tags overlay vs non-overlay images correctly, which the
   * CSS selectors key off); the real object-fit/padding behavior is
   * confirmed live against a real browser instead — see
   * `scripts/tz-nx-docstudio-image-passport-fit-wysiwyg-smoke.mjs` and the
   * TZ's checklist for the live evidence (screenshots + computed-style
   * assertions that DO work under real Chrome).
   */
});
