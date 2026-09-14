import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }, provideRouter([])],
    }).compileComponents();
  });

  function create(block: StudioBlock): StudioTablePropertiesComponent {
    fixture = TestBed.createComponent(StudioTablePropertiesComponent);
    fixture.componentRef.setInput('block', block);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('links to the «Виды таблиц» registry, opening in a new tab (TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER)', () => {
    create(TABLE);
    const link = fixture.nativeElement.querySelector<HTMLAnchorElement>('[data-test="studio-table-open-registry"]')!;
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/registries/table-templates');
    expect(link.getAttribute('target')).toBe('_blank');
  });

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
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }, provideRouter([])],
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
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }, provideRouter([])],
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
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }, provideRouter([])],
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
    // TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER: quick-add now fits width to the label ("Количество".length = 10), not a flat 20.
    expect(added).toEqual({ key: 'qty', label: 'Количество', type: 'number', width: 10, align: 'right' });
  });

  /**
   * TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY — the width field had no label at
   * all before (only key/type/align had a placeholder/select to hint at
   * their purpose); a bare number input reads as decoration once it turns
   * out to have zero visible effect, which this TZ also fixes at the
   * render layer (canvas/PDF).
   */
  /** TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER — «По заголовкам» recomputes every column's width from its label, without touching key/label/type/align. */
  it('«По заголовкам» refits widths from labels: a short label ends up narrower than a long one', () => {
    const component = create(TABLE_WITH_TEMPLATE);
    const host: HTMLElement = fixture.nativeElement;
    const settingsSpy = jest.fn();
    component.settingsChange.subscribe(settingsSpy);

    (host.querySelector<HTMLButtonElement>('[data-test="studio-table-widths-by-header"]')!).click();

    expect(settingsSpy).toHaveBeenCalledTimes(1);
    const patch = settingsSpy.mock.calls[0]![0] as { tableTemplateColumns: { key: string; width: number }[] };
    const byKey = new Map(patch.tableTemplateColumns.map((c) => [c.key, c.width]));
    // TABLE_WITH_TEMPLATE columns: photo/name/price.
    expect(byKey.get('name')!).toBeGreaterThan(byKey.get('photo')!);
  });

  it('the width input has an accessible label + a column-editor hint that it is a % share', () => {
    create(TABLE_WITH_TEMPLATE);
    const host: HTMLElement = fixture.nativeElement;
    const widthInput = host.querySelector<HTMLInputElement>('[data-test="studio-table-col-width-0"]')!;
    expect(widthInput.getAttribute('aria-label')).toBe('Ширина, %');
    expect(host.querySelector('[data-test="studio-table-width-hint"]')?.textContent).toContain('сумма ≈ 100%');
  });

  /**
   * TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM — a «+ Сумма» chip was missing entirely;
   * an operator who wanted a computed total column had no discoverable way
   * to add one (only the generic «+ Колонка» + manually typing key=`sum`).
   */
  it('offers a «+ Сумма» chip and adds it at the canonical key/type/label', () => {
    const component = create(TABLE_WITH_TEMPLATE);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-quick-add-sum"]')).not.toBeNull();

    const settingsSpy = jest.fn();
    component.settingsChange.subscribe(settingsSpy);
    (host.querySelector<HTMLButtonElement>('[data-test="studio-table-quick-add-sum"]')!).click();

    expect(settingsSpy).toHaveBeenCalledTimes(1);
    const patch = settingsSpy.mock.calls[0]![0] as { tableTemplateColumns: { key: string; label: string; type: string }[] };
    const added = patch.tableTemplateColumns.at(-1)!;
    // TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER: quick-add now fits width to the label ("Сумма".length = 5), not a flat 20.
    expect(added).toEqual({ key: 'sum', label: 'Сумма', type: 'currency', width: 5, align: 'right' });
  });

  it('does not offer «+ Сумма» once a sum-alias column already exists', () => {
    create({
      ...TABLE_WITH_TEMPLATE,
      settings: {
        ...TABLE_WITH_TEMPLATE.settings,
        tableTemplateColumns: [...(TABLE_WITH_TEMPLATE.settings!['tableTemplateColumns'] as unknown[]), { key: 'total', label: 'Итого', type: 'currency', align: 'right', width: 15 }],
      },
    });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-quick-add-sum"]')).toBeNull();
  });

  /**
   * TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM — `column.type` is never read by
   * `lineValue`/the backend hydrate path for a standard key; the select made
   * it look like a working control that did nothing when changed for those
   * keys, so it's disabled there and only left live for a custom key.
   */
  it('disables the type select for a standard key (price) and keeps it enabled for a custom key', async () => {
    create(TABLE_WITH_TEMPLATE);
    // Standalone NgModel defers its initial writeValue() to a microtask (see
    // the same note on the live-qty test above) — flush before reading DOM state.
    await fixture.whenStable();
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    // TABLE_WITH_TEMPLATE columns: [photo, name, price] -> index 2 is price (known key).
    const priceType = host.querySelector<HTMLSelectElement>('[data-test="studio-table-col-type-2"]')!;
    expect(priceType.disabled).toBe(true);

    create({
      ...TABLE_WITH_TEMPLATE,
      settings: {
        ...TABLE_WITH_TEMPLATE.settings,
        tableTemplateColumns: [...(TABLE_WITH_TEMPLATE.settings!['tableTemplateColumns'] as unknown[]), { key: 'col4', label: 'Колонка 4', type: 'text', align: 'left', width: 10 }],
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();
    const customType = fixture.nativeElement.querySelector<HTMLSelectElement>('[data-test="studio-table-col-type-3"]')!;
    expect(customType.disabled).toBe(false);
  });
});

/**
 * TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP (этап A) — an Insert-created
 * catalog table used to show a bare «Источник строк» enum that looked like
 * a pointless duplicate of the Insert button the operator already clicked.
 * It now shows a status («Строки: Изделия из Выбрано») + «Обновить строки»
 * + «Сменить…» instead; the full select is still there for manual/КП/заказ,
 * where it's the only way to reach that source.
 */
describe('StudioTablePropertiesComponent — no source control for catalog-sourced tables (TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP)', () => {
  const CATALOG_TABLE: StudioBlock = {
    _id: 'tbl-catalog',
    type: 'table',
    order: 0,
    title: 'Продукты',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateColumns: [
        { key: 'name', label: 'Наименование', type: 'text', align: 'left', width: 60 },
        { key: 'qty', label: 'Кол-во', type: 'number', align: 'right', width: 40 },
      ],
      dataSource: { type: 'catalog-products' },
      liveRows: [
        ['Стол', '1'],
        ['Стул', '4'],
      ],
    },
  };

  const MANUAL_TABLE: StudioBlock = {
    ...CATALOG_TABLE,
    _id: 'tbl-manual',
    settings: { ...CATALOG_TABLE.settings, dataSource: undefined, liveRows: undefined },
  };

  let fixture: ComponentFixture<StudioTablePropertiesComponent>;
  const templatesService = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioTablePropertiesComponent],
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }, provideRouter([])],
    }).compileComponents();
  });

  function create(block: StudioBlock): StudioTablePropertiesComponent {
    fixture = TestBed.createComponent(StudioTablePropertiesComponent);
    fixture.componentRef.setInput('block', block);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('catalog-sourced table shows no source control at all — no status, no Обновить/Сменить, no select', () => {
    create(CATALOG_TABLE);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-source-status"]')).toBeNull();
    expect(host.querySelector('[data-test="studio-table-refresh-rows"]')).toBeNull();
    expect(host.querySelector('[data-test="studio-table-change-source"]')).toBeNull();
    expect(host.querySelector('[data-test="studio-table-source-select"]')).toBeNull();
    expect(host.textContent).not.toContain('Из Выбрано');
  });

  it('manual table still shows the full source select directly (only way to reach КП/заказ/catalog)', () => {
    create(MANUAL_TABLE);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-source-select"]')).not.toBeNull();
    expect(host.querySelector('[data-test="studio-table-source-status"]')).toBeNull();
  });

  it("picking a value on the manual table's select emits sourceChange", () => {
    const component = create(MANUAL_TABLE);
    const sourceSpy = jest.fn();
    component.sourceChange.subscribe(sourceSpy);
    const host: HTMLElement = fixture.nativeElement;

    const select = host.querySelector<HTMLSelectElement>('[data-test="studio-table-source-select"]')!;
    select.value = 'catalog-products';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(sourceSpy).toHaveBeenCalledWith('catalog-products');
  });

  it('switching a block from manual to catalog-sourced removes the select from the DOM', () => {
    create(MANUAL_TABLE);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-source-select"]')).not.toBeNull();

    fixture.componentRef.setInput('block', CATALOG_TABLE);
    fixture.detectChanges();

    expect(host.querySelector('[data-test="studio-table-source-select"]')).toBeNull();
  });

  it('renamed «Макет колонок» label + a missing-template CTA for a catalog table with no template applied', () => {
    create(CATALOG_TABLE);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Макет колонок');
    expect(host.querySelector('[data-test="studio-table-template-missing"]')).not.toBeNull();
  });

  it('no missing-template CTA once a template is applied', () => {
    create({ ...CATALOG_TABLE, settings: { ...CATALOG_TABLE.settings, tableTemplateId: 'tmpl-1' } });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-template-missing"]')).toBeNull();
  });
});
