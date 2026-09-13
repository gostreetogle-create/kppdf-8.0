import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  PiCounterpartiesService,
  PiDocTypesService,
  PiOrdersService,
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioBlocksService,
  PiStudioDocumentsService,
  PiTableTemplatesService,
  type StudioBlock,
  type StudioDocument,
} from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { API_BASE_URL } from '@kppdf/util-http';
import { StudioEditorPage } from './studio-editor.page';

/**
 * TZ-NX-DOCSTUDIO-CATALOG-INSERT-HONEST — a repeat «Вставить на лист» for a
 * kind that already has a wired table used to silently `activateLayer` and
 * return: no toast, no re-fetch, so an operator staring at a table left
 * empty by an earlier failed hydrate had no way to tell the click did
 * anything at all. Now it toasts "already on sheet" and heals the existing
 * table's rows via `refreshCatalogTablesOfKind` instead of creating a
 * duplicate.
 */
describe('StudioEditorPage — insertCatalogTable (TZ-NX-DOCSTUDIO-CATALOG-INSERT-HONEST)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    blocks: { set: (blocks: readonly StudioBlock[]) => void; (): readonly StudioBlock[] };
    catalogSelections: { set: (sel: Record<string, readonly string[]>) => void };
    activeLayerId: () => string | null;
    insertCatalogTable: (kind: 'products' | 'modules' | 'parts' | 'materials') => void;
    onCatalogEntitySaved: (kind: 'products' | 'modules' | 'parts' | 'materials') => void;
  }

  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Insert-honest doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
  };

  const EXISTING_TABLE: StudioBlock = {
    _id: 'blk-table-1',
    type: 'table',
    order: 0,
    isActive: true,
    settings: { dataSource: { type: 'catalog-products' } },
  };

  let documentsService: { putDataSet: jest.Mock; getById: jest.Mock };
  let blocksService: { create: jest.Mock; list: jest.Mock; update: jest.Mock };
  let tableTemplatesService: { list: jest.Mock };
  let toast: { success: jest.Mock; error: jest.Mock };
  let revisionCounter: number;

  function nextRevisionDoc(patch: Partial<StudioDocument>): StudioDocument {
    revisionCounter += 1;
    return { ...BASE_DOC, ...patch, revision: revisionCounter };
  }

  beforeEach(() => {
    revisionCounter = 1;
    toast = { success: jest.fn(), error: jest.fn() };
    documentsService = {
      putDataSet: jest.fn((_id: string, key: string, payload: { expectedRevision: number; dataSet: unknown }) =>
        of({ ok: true, data: nextRevisionDoc({ dataSets: [{ key, ...(payload.dataSet as object) } as never] }) }),
      ),
      // TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL — createTableBlock now confirms
      // the post-create revision with a follow-up GET instead of a blind +1.
      getById: jest.fn().mockReturnValue(of({ ok: true, data: BASE_DOC })),
    };
    blocksService = {
      create: jest.fn(),
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      // TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP (этап B) — Insert now
      // persists dataSource via patchTableSettingsForBlock (blocksService.update).
      update: jest.fn((id: string, patch: { settings?: Record<string, unknown> }) =>
        of({ ok: true, data: { _id: id, type: 'table', order: 0, isActive: true, settings: patch.settings ?? {} } }),
      ),
    };
    // TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP (этап B) — Insert now looks up
    // a matching registry TableTemplate before wiring the source; an
    // unmocked (root-provided) real HTTP call here would hang forever under
    // HttpClientTesting with no flush, silently stalling the whole
    // insertCatalogTable chain instead of throwing. Default: no templates.
    tableTemplatesService = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: documentsService },
        { provide: PiStudioBlocksService, useValue: blocksService },
        { provide: PiTableTemplatesService, useValue: tableTemplatesService },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })), list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
  });

  function createEditor(): TestableEditor {
    const fixture = TestBed.createComponent(StudioEditorPage);
    return fixture.componentInstance as unknown as TestableEditor;
  }

  async function flush(): Promise<void> {
    // TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP (этап B) — insertCatalogTable
    // now also awaits a template lookup + the applyTableSource write queue,
    // two more async hops than before.
    for (let i = 0; i < 24; i++) await Promise.resolve();
  }

  it('existing wired table: focuses it, toasts, heals rows via putDataSet — no duplicate create', async () => {
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([EXISTING_TABLE]);
    component.catalogSelections.set({ products: ['p1'], modules: [], parts: [], materials: [] });

    component.insertCatalogTable('products');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(blocksService.create).not.toHaveBeenCalled();
    expect(component.activeLayerId()).toBe('blk-table-1');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('уже на листе'));
    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-blk-table-1',
      expect.objectContaining({ expectedRevision: 1 }),
    );
  });

  it('no existing table: creates + wires exactly once (unchanged path)', async () => {
    blocksService.create.mockReturnValue(
      of({
        ok: true,
        data: { _id: 'blk-new', type: 'table', order: 0, isActive: true, settings: {} } as StudioBlock,
      }),
    );
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([]);
    component.catalogSelections.set({ products: [], modules: [], parts: [], materials: [] });

    component.insertCatalogTable('modules');
    // TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL — createTableBlock now awaits a
    // follow-up getById before resolving, one more async hop than before.
    await flush();

    expect(blocksService.create).toHaveBeenCalledTimes(1);
    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-blk-new',
      expect.objectContaining({ dataSet: expect.objectContaining({ source: { type: 'catalog-modules' } }) }),
    );
    expect(toast.success).not.toHaveBeenCalledWith(expect.stringContaining('уже на листе'));
  });

  /**
   * TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP (этап B) — Insert used to leave
   * a brand-new table on STUDIO_DEFAULT_TABLE_COLUMNS (3 hardcoded columns)
   * as if that were the real product outcome; the registry TableTemplate
   * tagged with this `dataSource` is the actual SoT for the column preset.
   */
  it('Insert applies the matching registry TableTemplate columns, not the 3-column default', async () => {
    blocksService.create.mockReturnValue(
      of({ ok: true, data: { _id: 'blk-new', type: 'table', order: 0, isActive: true, settings: {} } as StudioBlock }),
    );
    tableTemplatesService.list.mockReturnValue(
      of({
        ok: true,
        data: [
          {
            _id: 'tmpl-products',
            name: 'Продукты',
            sortOrder: 0,
            isActive: true,
            dataSource: 'catalog-modules',
            columns: [
              { key: 'photo', label: 'Фото', type: 'text', width: 15, align: 'left' },
              { key: 'name', label: 'Наименование', type: 'text', width: 55, align: 'left' },
              { key: 'price', label: 'Цена', type: 'currency', width: 30, align: 'right' },
            ],
          },
        ],
      }),
    );
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([]);
    component.catalogSelections.set({ products: [], modules: [], parts: [], materials: [] });

    component.insertCatalogTable('modules');
    await flush();

    expect(blocksService.update).toHaveBeenCalledWith(
      'blk-new',
      expect.objectContaining({
        settings: expect.objectContaining({
          tableTemplateId: 'tmpl-products',
          tableTemplateColumns: expect.arrayContaining([expect.objectContaining({ key: 'photo' })]),
        }),
      }),
    );
  });

  /**
   * TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP (этап B) — live Mongo check found
   * the real seeded «Продукты» template tagged `dataSource: "product"`
   * (singular, no `catalog-` prefix) — a strict `=== 'catalog-products'`
   * match would never fire against real registry data. Matching must
   * tolerate this.
   */
  it('Insert matches a template tagged with the real-world singular/no-prefix dataSource convention ("product", not "catalog-products")', async () => {
    blocksService.create.mockReturnValue(
      of({ ok: true, data: { _id: 'blk-new', type: 'table', order: 0, isActive: true, settings: {} } as StudioBlock }),
    );
    tableTemplatesService.list.mockReturnValue(
      of({
        ok: true,
        data: [
          {
            _id: 'tmpl-products',
            name: 'Продукты',
            sortOrder: 0,
            isActive: true,
            dataSource: 'product',
            columns: [{ key: 'name', label: 'Наименование', type: 'text', width: 100, align: 'left' }],
          },
        ],
      }),
    );
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([]);
    component.catalogSelections.set({ products: [], modules: [], parts: [], materials: [] });

    component.insertCatalogTable('products');
    await flush();

    expect(blocksService.update).toHaveBeenCalledWith(
      'blk-new',
      expect.objectContaining({ settings: expect.objectContaining({ tableTemplateId: 'tmpl-products' }) }),
    );
  });

  it('Insert with no matching template: toasts to the registry, does not silently keep the 3-column default as the outcome', async () => {
    blocksService.create.mockReturnValue(
      of({ ok: true, data: { _id: 'blk-new', type: 'table', order: 0, isActive: true, settings: {} } as StudioBlock }),
    );
    // Default tableTemplatesService.list() already returns [] (no templates).
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([]);
    component.catalogSelections.set({ products: [], modules: [], parts: [], materials: [] });

    component.insertCatalogTable('modules');
    await flush();

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Реестры'));
    // dataSource is still persisted (B2 fix) even with no template match —
    // just never with tableTemplateColumns, since none was applied.
    expect(blocksService.update).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ settings: expect.objectContaining({ tableTemplateColumns: expect.anything() }) }),
    );
    // The catalog source still gets wired — a missing template doesn't block Insert entirely.
    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-blk-new',
      expect.objectContaining({ dataSet: expect.objectContaining({ source: { type: 'catalog-modules' } }) }),
    );
  });

  it('onCatalogEntitySaved (TZ-NX-DOCSTUDIO-VITRINA-EDIT): re-puts the wired table for that kind', async () => {
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([EXISTING_TABLE]);
    component.catalogSelections.set({ products: ['p1'], modules: [], parts: [], materials: [] });

    component.onCatalogEntitySaved('products');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-blk-table-1',
      expect.objectContaining({ expectedRevision: 1 }),
    );
  });
});

/**
 * TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP (этап A) — «Обновить строки» on
 * the catalog-source status view reuses the same queued heal as Insert/
 * VITRINA-EDIT (`refreshCatalogTablesOfKind`), not a new write path.
 */
describe('StudioEditorPage — refreshActiveTableCatalogRows (этап A)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    blocks: { set: (blocks: readonly StudioBlock[]) => void };
    activeLayerId: { set: (id: string | null) => void };
    refreshActiveTableCatalogRows: () => void;
  }

  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Refresh-rows doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
  };

  const CATALOG_TABLE: StudioBlock = {
    _id: 'blk-table-1',
    type: 'table',
    order: 0,
    isActive: true,
    settings: { dataSource: { type: 'catalog-products' } },
  };

  const MANUAL_TABLE: StudioBlock = {
    _id: 'blk-table-2',
    type: 'table',
    order: 0,
    isActive: true,
    settings: {},
  };

  let documentsService: { putDataSet: jest.Mock };
  let blocksService: { create: jest.Mock; list: jest.Mock };

  beforeEach(() => {
    documentsService = {
      putDataSet: jest.fn((_id: string, key: string) =>
        of({ ok: true, data: { ...BASE_DOC, revision: 2, dataSets: [{ key, rows: [['row']] }] } }),
      ),
    };
    blocksService = { create: jest.fn(), list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: documentsService },
        { provide: PiStudioBlocksService, useValue: blocksService },
        { provide: PiTableTemplatesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })), list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
  });

  function createEditor(): TestableEditor {
    const fixture = TestBed.createComponent(StudioEditorPage);
    return fixture.componentInstance as unknown as TestableEditor;
  }

  it('a catalog-sourced active table re-puts its dataSet via the queued heal', async () => {
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([CATALOG_TABLE]);
    component.activeLayerId.set('blk-table-1');

    component.refreshActiveTableCatalogRows();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-blk-table-1',
      expect.objectContaining({ expectedRevision: 1 }),
    );
  });

  it('a manual active table is a no-op — nothing to refresh from a catalog', async () => {
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([MANUAL_TABLE]);
    component.activeLayerId.set('blk-table-2');

    component.refreshActiveTableCatalogRows();
    await Promise.resolve();

    expect(documentsService.putDataSet).not.toHaveBeenCalled();
  });
});

/**
 * TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP (этап B) — source-select audit
 * bugs B1–B3, all via `onTableSourceChange` (the Свойства «Источник строк»
 * select / «Сменить…» path).
 */
describe('StudioEditorPage — onTableSourceChange round-trip fixes (этап B)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    blocks: { set: (blocks: readonly StudioBlock[]) => void; (): readonly StudioBlock[] };
    catalogSelections: { set: (sel: Record<string, readonly string[]>) => void };
    activeLayerId: { set: (id: string | null) => void };
    onTableSourceChange: (source: string) => void;
  }

  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Round-trip doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
  };

  const CATALOG_TABLE: StudioBlock = {
    _id: 'blk-1',
    type: 'table',
    order: 0,
    isActive: true,
    settings: {
      dataSource: { type: 'catalog-products' },
      liveRows: [['Стол', '1']],
    },
  };

  let documentsService: { putDataSet: jest.Mock };
  let blocksService: { create: jest.Mock; list: jest.Mock; update: jest.Mock };

  beforeEach(() => {
    documentsService = {
      putDataSet: jest.fn((_id: string, key: string) =>
        of({ ok: true, data: { ...BASE_DOC, revision: 2, dataSets: [{ key, rows: [['row']] }] } }),
      ),
    };
    blocksService = {
      create: jest.fn(),
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      update: jest.fn((id: string, patch: { settings?: Record<string, unknown> }) =>
        of({ ok: true, data: { _id: id, type: 'table', order: 0, isActive: true, settings: patch.settings ?? {} } }),
      ),
    };

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: documentsService },
        { provide: PiStudioBlocksService, useValue: blocksService },
        { provide: PiTableTemplatesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })), list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
  });

  function createEditor(): TestableEditor {
    const fixture = TestBed.createComponent(StudioEditorPage);
    return fixture.componentInstance as unknown as TestableEditor;
  }

  async function flush(): Promise<void> {
    for (let i = 0; i < 12; i++) await Promise.resolve();
  }

  it('B1: switching a catalog table to manual sets liveRows to null, not a stale array', async () => {
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([CATALOG_TABLE]);
    component.activeLayerId.set('blk-1');

    component.onTableSourceChange('manual');
    await flush();

    expect(blocksService.update).toHaveBeenCalledWith(
      'blk-1',
      expect.objectContaining({ settings: expect.objectContaining({ liveRows: null }) }),
    );
  });

  it('B2: dataSource is persisted to the block via blocksService.update, not only the local signal', async () => {
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([{ ...CATALOG_TABLE, settings: {} }]);
    component.activeLayerId.set('blk-1');

    component.onTableSourceChange('catalog-modules');
    await flush();

    expect(blocksService.update).toHaveBeenCalledWith(
      'blk-1',
      expect.objectContaining({ settings: expect.objectContaining({ dataSource: { type: 'catalog-modules' } }) }),
    );
    // The local block signal must also reflect it (not just the server round-trip).
    expect((component.blocks().find((b) => b._id === 'blk-1')?.settings as Record<string, unknown>)['dataSource']).toEqual({ type: 'catalog-modules' });
  });

  it('B3: switching to a catalog kind with an empty «Выбрано» toasts an honest error, not a success', async () => {
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([{ ...CATALOG_TABLE, settings: {} }]);
    component.catalogSelections.set({ products: [], modules: [], parts: [], materials: [] });
    component.activeLayerId.set('blk-1');
    const toastService = TestBed.inject(PiToastService) as unknown as { success: jest.Mock; error: jest.Mock };

    component.onTableSourceChange('catalog-modules');
    await flush();

    expect(toastService.error).toHaveBeenCalledWith(expect.stringContaining('нет товаров'));
    expect(toastService.success).not.toHaveBeenCalled();
  });

  it('non-empty «Выбрано» for the picked kind still toasts success', async () => {
    const component = createEditor();
    component.document.set(BASE_DOC);
    component.blocks.set([{ ...CATALOG_TABLE, settings: {} }]);
    component.catalogSelections.set({ products: [], modules: ['m1'], parts: [], materials: [] });
    component.activeLayerId.set('blk-1');
    const toastService = TestBed.inject(PiToastService) as unknown as { success: jest.Mock; error: jest.Mock };

    component.onTableSourceChange('catalog-modules');
    await flush();

    expect(toastService.success).toHaveBeenCalled();
    expect(toastService.error).not.toHaveBeenCalled();
  });
});
