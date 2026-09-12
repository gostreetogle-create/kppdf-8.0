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
 * present and an honest "Нет фото" placeholder when the cell is empty — never
 * a bare digit or raw URL text.
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

  it('renders «Нет фото» for an empty photo cell, not a blank cell or a stray digit', () => {
    createCanvas([TABLE_WITH_PHOTO]);
    const host: HTMLElement = fixture.nativeElement;
    const rows = host.querySelectorAll('tbody tr');
    const secondRowPhotoCell = rows[1]!.querySelectorAll('td')[1]!;

    expect(secondRowPhotoCell.querySelector('img')).toBeNull();
    expect(secondRowPhotoCell.querySelector('.table-preview__photo-empty')?.textContent).toBe('Нет фото');
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
