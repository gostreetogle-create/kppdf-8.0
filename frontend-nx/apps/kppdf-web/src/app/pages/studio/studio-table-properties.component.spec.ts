import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiTableTemplatesService } from '@kppdf/data-access';
import type { StudioBlock } from '@kppdf/data-access';
import { StudioTablePropertiesComponent } from './studio-table-properties.component';

/**
 * TZ-NX-DOCSTUDIO-S45 — row editing lives in Свойства (moved off the A4 canvas):
 * manual tables get the «Строки таблицы» grid with + Строка; live-source tables
 * get a read-only hint instead of a duplicate write path.
 */
describe('StudioTablePropertiesComponent — S45 rows editor', () => {
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

  let fixture: ComponentFixture<StudioTablePropertiesComponent>;
  const templatesService = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioTablePropertiesComponent],
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }],
    }).compileComponents();
  });

  function create(block: StudioBlock): StudioTablePropertiesComponent {
    fixture = TestBed.createComponent(StudioTablePropertiesComponent);
    fixture.componentRef.setInput('block', block);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('manual table shows the rows editor with + Строка and emits rows changes', () => {
    const component = create(TABLE);
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('[data-test="studio-table-rows-editor"]')).not.toBeNull();
    expect(host.querySelector('[data-test="studio-table-add-row"]')).not.toBeNull();

    const rowsSpy = jest.fn();
    component.rowsChange.subscribe(rowsSpy);
    (host.querySelector<HTMLButtonElement>('[data-test="studio-table-add-row"]')!).click();
    expect(rowsSpy).toHaveBeenCalledTimes(1);
    const emitted = rowsSpy.mock.calls[0]![0] as string[][];
    expect(emitted).toHaveLength(3);
    expect(emitted[2]).toEqual(['', '']);
  });

  it('cell edit emits the updated matrix', () => {
    const component = create(TABLE);
    const rowsSpy = jest.fn();
    component.rowsChange.subscribe(rowsSpy);

    const input = fixture.nativeElement.querySelector<HTMLInputElement>('[data-test="studio-table-cell-0-0"]')!;
    input.value = 'Диван';
    input.dispatchEvent(new Event('input'));

    expect(rowsSpy).toHaveBeenCalledTimes(1);
    const emitted = rowsSpy.mock.calls[0]![0] as string[][];
    expect(emitted[0]![0]).toBe('Диван');
    expect(emitted[1]![0]).toBe('Стол «Обеденный»');
  });

  it('row remove emits filtered rows and remapped disabled indices', () => {
    const component = create({
      ...TABLE,
      settings: { ...TABLE.settings, tableDisabledRowIndices: [1] },
    });
    const rowsSpy = jest.fn();
    const disabledSpy = jest.fn();
    component.rowsChange.subscribe(rowsSpy);
    component.disabledRowsChange.subscribe(disabledSpy);

    (fixture.nativeElement.querySelector<HTMLButtonElement>('[data-test="studio-table-row-remove-0"]')!).click();

    // Removing row 0: disabled row 1 survives and shifts up to index 0.
    expect(disabledSpy).toHaveBeenCalledWith([0]);
    expect(rowsSpy).toHaveBeenCalledWith([['Стол «Обеденный»', '1']]);
  });

  it('live-source table with no liveRows yet shows a hint instead of the manual rows editor', () => {
    create({ ...TABLE, settings: { ...TABLE.settings, dataSource: { type: 'catalog-products' } } });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-rows-editor"]')).toBeNull();
    expect(host.querySelector('[data-test="studio-table-live-rows-editor"]')).toBeNull();
    expect(host.querySelector('[data-test="studio-table-rows-live-hint"]')).not.toBeNull();
  });
});

/**
 * TZ-NX-DOCSTUDIO-TABLE-LINE-QTY — a live-sourced table with liveRows already
 * hydrated shows those rows with an editable «Количество» cell; every other
 * cell (name/price/photo) stays read-only display, since it's always live
 * from the catalog/КП/заказ, not something this editor should let drift.
 */
describe('StudioTablePropertiesComponent — live rows qty editing', () => {
  const LIVE_TABLE: StudioBlock = {
    _id: 'tbl-3',
    type: 'table',
    order: 0,
    title: 'Продукты',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateColumns: [
        { key: 'name', label: 'Наименование', type: 'text', align: 'left', width: 50 },
        { key: 'qty', label: 'Кол-во', type: 'number', align: 'right', width: 20 },
        { key: 'price', label: 'Цена', type: 'currency', align: 'right', width: 30 },
      ],
      dataSource: { type: 'catalog-products' },
      liveRows: [
        ['Стол', '1', '1200'],
        ['Стул', '4', '300'],
      ],
    },
  };

  let fixture: ComponentFixture<StudioTablePropertiesComponent>;
  const templatesService = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioTablePropertiesComponent],
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }],
    }).compileComponents();
  });

  function create(block: StudioBlock): StudioTablePropertiesComponent {
    fixture = TestBed.createComponent(StudioTablePropertiesComponent);
    fixture.componentRef.setInput('block', block);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('shows liveRows with name/price read-only and qty as an editable number input', async () => {
    create(LIVE_TABLE);
    // Standalone NgModel defers its initial writeValue() to a microtask
    // (avoids ExpressionChangedAfterItHasBeenCheckedError) — one sync
    // detectChanges() renders the row/interpolation but not yet the
    // ngModel-bound input value; flush microtasks then detect again.
    await fixture.whenStable();
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-live-rows-editor"]')).not.toBeNull();
    expect(host.textContent).toContain('Стол');
    expect(host.textContent).toContain('Стул');

    const qty0 = host.querySelector<HTMLInputElement>('[data-test="studio-table-live-qty-0"]')!;
    const qty1 = host.querySelector<HTMLInputElement>('[data-test="studio-table-live-qty-1"]')!;
    expect(qty0.type).toBe('number');
    expect(qty0.value).toBe('1');
    expect(qty1.value).toBe('4');
    // name/price aren't rendered as inputs at all for a live row.
    expect(host.querySelector('[data-test="studio-table-cell-0-0"]')).toBeNull();
  });

  it('editing a live qty cell emits liveQtyChange with the row index and new value, not rowsChange', () => {
    const component = create(LIVE_TABLE);
    const liveQtySpy = jest.fn();
    const rowsSpy = jest.fn();
    component.liveQtyChange.subscribe(liveQtySpy);
    component.rowsChange.subscribe(rowsSpy);

    const qty1 = fixture.nativeElement.querySelector<HTMLInputElement>('[data-test="studio-table-live-qty-1"]')!;
    qty1.value = '7';
    qty1.dispatchEvent(new Event('input'));

    expect(liveQtySpy).toHaveBeenCalledWith({ rowIndex: 1, value: '7' });
    expect(rowsSpy).not.toHaveBeenCalled();
  });
});

/**
 * TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE — an empty photo cell in the live-rows
 * editor gets an actionable hint, not a bare «—» (which reads as "no data"
 * rather than "go fix this specific thing").
 */
describe('StudioTablePropertiesComponent — live rows photo hint', () => {
  const LIVE_TABLE_WITH_PHOTO: StudioBlock = {
    _id: 'tbl-4',
    type: 'table',
    order: 0,
    title: 'Продукты',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateColumns: [
        { key: 'photoIds', label: 'Фото', type: 'text', align: 'left', width: 15 },
        { key: 'name', label: 'Наименование', type: 'text', align: 'left', width: 50 },
      ],
      dataSource: { type: 'catalog-products' },
      liveRows: [
        ['/uploads/stol.webp', 'Стол'],
        ['', 'Стул без фото'],
      ],
    },
  };

  let fixture: ComponentFixture<StudioTablePropertiesComponent>;
  const templatesService = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioTablePropertiesComponent],
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }],
    }).compileComponents();
    fixture = TestBed.createComponent(StudioTablePropertiesComponent);
    fixture.componentRef.setInput('block', LIVE_TABLE_WITH_PHOTO);
    fixture.detectChanges();
  });

  it('shows the photo URL as text for a row that has one, and a hint for a row that does not', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('/uploads/stol.webp');
    expect(host.querySelector('[data-test="studio-table-live-photo-hint-1"]')).not.toBeNull();
    expect(host.querySelector('[data-test="studio-table-live-photo-hint-1"]')!.textContent).toContain(
      'Загрузите фото в карточке изделия',
    );
    // Row 0 has a photo — no hint for it.
    expect(host.querySelector('[data-test="studio-table-live-photo-hint-0"]')).toBeNull();
  });
});

/**
 * TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE — a selected «Вид» (tableTemplateId set)
 * used to lock reorder/add-column entirely. PO: structure lives on the block
 * (override), editable regardless of template/rowSource; only an explicit
 * `customColumns: false` opts a table out.
 */
describe('StudioTablePropertiesComponent — column structure unlock', () => {
  const TABLE_WITH_TEMPLATE: StudioBlock = {
    _id: 'tbl-2',
    type: 'table',
    order: 0,
    title: 'Продукты',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateId: 'tmpl-products',
      tableTemplateColumns: [
        { key: 'photo', label: 'Фото', type: 'text', align: 'left', width: 15 },
        { key: 'name', label: 'Наименование', type: 'text', align: 'left', width: 45 },
        { key: 'price', label: 'Цена', type: 'currency', align: 'right', width: 20 },
      ],
      tableTemplateSampleRows: [['', 'Стол', '1000']],
      dataSource: { type: 'catalog-products' },
    },
  };

  let fixture: ComponentFixture<StudioTablePropertiesComponent>;
  const templatesService = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioTablePropertiesComponent],
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }],
    }).compileComponents();
  });

  function create(block: StudioBlock): StudioTablePropertiesComponent {
    fixture = TestBed.createComponent(StudioTablePropertiesComponent);
    fixture.componentRef.setInput('block', block);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('a table with a selected template AND a catalog rowSource still shows the editable column grid, not the locked summary', () => {
    create(TABLE_WITH_TEMPLATE);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-column-editor"]')).not.toBeNull();
    expect(host.querySelector('[data-test="studio-table-columns-locked"]')).toBeNull();
    expect(host.querySelector<HTMLButtonElement>('[data-test="studio-table-col-remove-0"]')!.disabled).toBe(false);
  });

  it('reordering «Фото» right while a template is selected emits the swapped column structure', () => {
    const component = create(TABLE_WITH_TEMPLATE);
    const settingsSpy = jest.fn();
    component.settingsChange.subscribe(settingsSpy);

    (fixture.nativeElement.querySelector<HTMLButtonElement>('[aria-label="Ниже"]')!).click();

    expect(settingsSpy).toHaveBeenCalledTimes(1);
    const patch = settingsSpy.mock.calls[0]![0] as { tableTemplateColumns: { key: string }[] };
    expect(patch.tableTemplateColumns.map((c) => c.key)).toEqual(['name', 'photo', 'price']);
  });

  it('locks the structure only when customColumns is explicitly false', () => {
    create({ ...TABLE_WITH_TEMPLATE, settings: { ...TABLE_WITH_TEMPLATE.settings, customColumns: false } });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-column-editor"]')).toBeNull();
    expect(host.querySelector('[data-test="studio-table-columns-locked"]')).not.toBeNull();
  });

  it('offers a quick-add chip for each missing standard field and adds it at the canonical key', () => {
    const component = create(TABLE_WITH_TEMPLATE);
    const host: HTMLElement = fixture.nativeElement;
    // TABLE_WITH_TEMPLATE has photo/name/price already -> qty/sku/unit/description missing.
    expect(host.querySelector('[data-test="studio-table-quick-add-qty"]')).not.toBeNull();
    expect(host.querySelector('[data-test="studio-table-quick-add-price"]')).toBeNull();

    const settingsSpy = jest.fn();
    component.settingsChange.subscribe(settingsSpy);
    (host.querySelector<HTMLButtonElement>('[data-test="studio-table-quick-add-qty"]')!).click();

    expect(settingsSpy).toHaveBeenCalledTimes(1);
    const patch = settingsSpy.mock.calls[0]![0] as { tableTemplateColumns: { key: string; label: string }[] };
    const added = patch.tableTemplateColumns.at(-1)!;
    expect(added).toEqual({ key: 'qty', label: 'Количество', type: 'number', width: 20, align: 'right' });
  });
});
