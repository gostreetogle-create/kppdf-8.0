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
 * TZ-NX-DOCSTUDIO-TABLE-LINE-QTY — editing a live (catalog/КП/заказ) row's
 * qty stores a per-row override on the block (`tableQtyOverrides`), never on
 * Product/Material/Module, and re-hydrates `liveRows` afterwards so the
 * backend resolver's recomputed qty/total show up immediately (same
 * force-refetch mechanism S47 built for column-structure changes).
 */
describe('StudioEditorPage — live table qty override (TZ-NX-DOCSTUDIO-TABLE-LINE-QTY)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    blocks: { set: (blocks: readonly StudioBlock[]) => void; (): readonly StudioBlock[] };
    activeLayerId: { set: (id: string | null) => void };
    onLiveTableQtyChange: (event: { rowIndex: number; value: string }) => void;
  }

  const DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Qty doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
    dataSets: [
      {
        key: 'table-tbl-1',
        source: { type: 'catalog-products' },
        rows: [['Стол', '1', '1200']],
        catalogSelectionCount: 1,
      },
    ],
  };

  const TABLE: StudioBlock = {
    _id: 'tbl-1',
    type: 'table',
    order: 0,
    title: 'Витрина',
    content: '',
    settings: {
      dataSource: { type: 'catalog-products' },
      tableTemplateColumns: [
        { key: 'name', label: 'Наименование' },
        { key: 'qty', label: 'Кол-во' },
        { key: 'price', label: 'Цена' },
      ],
      liveRows: [['Стол', '1', '1200']],
    },
  };

  let blocksService: { update: jest.Mock };
  let documentsService: { putDataSet: jest.Mock; getById: jest.Mock };

  beforeEach(() => {
    blocksService = {
      update: jest.fn().mockImplementation((_id: string, patch: { settings?: Record<string, unknown>; title?: string }) =>
        of({
          ok: true,
          data: { ...TABLE, settings: { ...TABLE.settings, ...(patch.settings ?? {}) } } as StudioBlock,
        }),
      ),
    };
    documentsService = {
      putDataSet: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            ...DOC,
            dataSets: [{ key: 'table-tbl-1', source: { type: 'catalog-products' }, rows: [['Стол', '3', '3600']] }],
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
            list: jest.fn().mockReturnValue(of({ ok: true, data: [TABLE] })),
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
  });

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

  async function drainBootstraps(component: TestableEditor): Promise<void> {
    await flush();
    await flush();
    component.activeLayerId.set('tbl-1');
  }

  it('patches tableQtyOverrides on the block and re-hydrates liveRows', async () => {
    const component = createEditor();
    await drainBootstraps(component);
    documentsService.putDataSet.mockClear();
    blocksService.update.mockClear();

    component.onLiveTableQtyChange({ rowIndex: 0, value: '3' });
    await flush();

    expect(blocksService.update).toHaveBeenCalledWith(
      'tbl-1',
      expect.objectContaining({ settings: expect.objectContaining({ tableQtyOverrides: { 0: 3 } }) }),
    );
    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-tbl-1',
      expect.objectContaining({ dataSet: expect.objectContaining({ source: { type: 'catalog-products' }, rows: [] }) }),
    );
    const after = component.blocks();
    expect(after[0]!.settings?.['liveRows']).toEqual([['Стол', '3', '3600']]);
  });

  it('accumulates a second row override on top of the first, not replacing it', async () => {
    const component = createEditor();
    await drainBootstraps(component);

    component.onLiveTableQtyChange({ rowIndex: 0, value: '3' });
    await flush();
    blocksService.update.mockClear();

    component.onLiveTableQtyChange({ rowIndex: 1, value: '5' });
    await flush();

    expect(blocksService.update).toHaveBeenCalledWith(
      'tbl-1',
      expect.objectContaining({ settings: expect.objectContaining({ tableQtyOverrides: { 0: 3, 1: 5 } }) }),
    );
  });

  it('ignores the change when no table block is active', async () => {
    const component = createEditor();
    await flush();
    await flush();
    // No activeLayerId set — activeTableBlock() returns null.
    blocksService.update.mockClear();

    component.onLiveTableQtyChange({ rowIndex: 0, value: '3' });
    await flush();

    expect(blocksService.update).not.toHaveBeenCalled();
  });
});
