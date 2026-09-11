import { TestBed, type ComponentFixture } from '@angular/core/testing';
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
  type StudioBlock,
  type StudioDocument,
} from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { API_BASE_URL } from '@kppdf/util-http';
import { StudioEditorPage } from './studio-editor.page';

/**
 * TZ-NX-DOCSTUDIO-STALE-LIVEROWS-HEAL — pre-UAT smoke (af78049d) found a
 * real document whose table's cached `liveRows` (3 cells/row) no longer
 * matched its current columns (6) — canvas rendered misaligned cells. That
 * specific document's block had **no** `dataSource` at all (switched back
 * to manual, or never re-synced) — S47's on-edit rehydrate never fires for
 * it, and neither does the existing on-load `refreshLiveDataSetsOnLoad`
 * (it only visits tables with a live-hydratable `dataSource`). PO had to
 * manually re-touch the table to force a fix. This heals both shapes once
 * on document load, no manual re-touch required.
 */
describe('StudioEditorPage — heals stale liveRows on document load (TZ-NX-DOCSTUDIO-STALE-LIVEROWS-HEAL)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    blocks: { set: (blocks: readonly StudioBlock[]) => void; (): readonly StudioBlock[] };
    activeLayerId: { set: (id: string | null) => void };
  }

  const DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Stale liveRows doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
    dataSets: [
      {
        key: 'table-tbl-1',
        source: { type: 'catalog-products' },
        // Stale 3-cell override, same shape the live table's stale liveRows had —
        // proves the *ordinary* refreshLiveDataSetsOnLoad path alone (which sends
        // this back as `rows`) is NOT what fixes the mismatch; the heal's own
        // nuclear rows:[] call is the one that must additionally fire.
        rows: [['Стол', '1', '1200']],
        catalogSelectionCount: 1,
      },
    ],
  };

  const FOUR_COLUMNS = [
    { key: 'name', label: 'Наименование' },
    { key: 'qty', label: 'Кол-во' },
    { key: 'price', label: 'Цена' },
    { key: 'sku', label: 'Артикул' },
  ];

  function makeTable(overrides: Partial<StudioBlock['settings']>): StudioBlock {
    return {
      _id: 'tbl-1',
      type: 'table',
      order: 0,
      title: 'Витрина',
      content: '',
      settings: {
        tableTemplateColumns: FOUR_COLUMNS,
        ...overrides,
      },
    } as unknown as StudioBlock;
  }

  let blocksService: { update: jest.Mock };
  let documentsService: { putDataSet: jest.Mock; getById: jest.Mock };
  let table: StudioBlock;

  function configure(): void {
    blocksService = {
      update: jest.fn().mockImplementation((_id: string, patch: { settings?: Record<string, unknown>; title?: string }) =>
        of({
          ok: true,
          data: { ...table, settings: { ...table.settings, ...(patch.settings ?? {}) } } as StudioBlock,
        }),
      ),
    };
    documentsService = {
      putDataSet: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            ...DOC,
            dataSets: [{ key: 'table-tbl-1', source: { type: 'catalog-products' }, rows: [['Стол', '1', '1200', 'SKU-1']] }],
          },
        }),
      ),
      getById: jest.fn().mockReturnValue(of({ ok: true, data: DOC })),
    };

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: documentsService },
        {
          provide: PiStudioBlocksService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: [table] })),
            update: blocksService.update,
          },
        },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'doc-1' }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
  }

  let fixture: ComponentFixture<StudioEditorPage>;

  afterEach(() => {
    fixture?.destroy();
  });

  function createEditor(): TestableEditor {
    fixture = TestBed.createComponent(StudioEditorPage);
    return fixture.componentInstance as unknown as TestableEditor;
  }

  async function flush(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }

  async function drainBootstraps(): Promise<void> {
    await flush();
    await flush();
  }

  it('live-sourced table with mismatched liveRows: forces a clean (rows: []) re-fetch on load, not just the override-preserving refresh', async () => {
    table = makeTable({
      dataSource: { type: 'catalog-products' },
      liveRows: [['Стол', '1', '1200']], // 3 cells, 4 current columns — stale.
    });
    configure();
    createEditor();
    await drainBootstraps();

    // The nuclear heal call must have fired (rows: []) — proves the mismatch
    // was detected and the SAFE path taken, not just the ordinary refresh's
    // override-preserving call (which alone would have misaligned the stale
    // 3-cell override under the new 4-column shape).
    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-tbl-1',
      expect.objectContaining({ dataSet: expect.objectContaining({ source: { type: 'catalog-products' }, rows: [] }) }),
    );
  });

  it('manual table (no dataSource) with mismatched liveRows: clears the stale liveRows key, no network re-fetch', async () => {
    table = makeTable({
      liveRows: [['a', 'b', 'c']], // 3 cells, 4 current columns — stale; no dataSource at all.
      tableTemplateSampleRows: [['', '', '', '']],
    });
    configure();
    createEditor();
    await drainBootstraps();

    expect(blocksService.update).toHaveBeenCalledWith(
      'tbl-1',
      expect.objectContaining({ settings: expect.objectContaining({ liveRows: null }) }),
    );
    expect(documentsService.putDataSet).not.toHaveBeenCalled();
  });

  it('manual table with no liveRows at all: no-op (nothing stale to heal)', async () => {
    table = makeTable({});
    configure();
    createEditor();
    await drainBootstraps();

    expect(blocksService.update).not.toHaveBeenCalled();
    expect(documentsService.putDataSet).not.toHaveBeenCalled();
  });

  it('live-sourced table whose liveRows already matches the column count: ordinary refresh still fires once, heal adds no second call', async () => {
    table = makeTable({
      dataSource: { type: 'catalog-products' },
      liveRows: [['Стол', '1', '1200', 'SKU-1']], // 4 cells — matches 4 columns, no mismatch.
    });
    configure();
    createEditor();
    await drainBootstraps();

    expect(documentsService.putDataSet).toHaveBeenCalledTimes(1);
    // The one call is the ordinary override-preserving refresh (existing rows), not the heal's empty-rows call.
    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-tbl-1',
      expect.objectContaining({ dataSet: expect.objectContaining({ rows: [['Стол', '1', '1200']] }) }),
    );
  });
});
