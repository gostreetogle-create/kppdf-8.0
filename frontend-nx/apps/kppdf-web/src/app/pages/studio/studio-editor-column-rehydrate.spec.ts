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
 * TZ-NX-DOCSTUDIO-S47 (BUG-1) — changing table columns (template pick or
 * manual add/remove/rename-key) while a live source is bound used to only
 * patch `block.settings` — `liveRows` built for the OLD column count stayed
 * cached and rendered under the NEW headers (PO screenshot: 3 cells under 6
 * headers). This spec locks that a column-structure patch re-puts the
 * dataSet with empty rows so the backend re-fetches liveRows at the new width.
 */
describe('StudioEditorPage — re-hydrates liveRows on column change (TZ-NX-DOCSTUDIO-S47)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    blocks: { set: (blocks: readonly StudioBlock[]) => void; (): readonly StudioBlock[] };
    activeLayerId: { set: (id: string | null) => void };
    patchTableSettings: (patch: Record<string, unknown>) => void;
  }

  const DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'S47 doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
    dataSets: [
      {
        key: 'table-tbl-1',
        source: { type: 'catalog-products' },
        rows: [['Мангал', '1', '4500']],
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
      liveRows: [['Мангал', '1', '4500']],
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
            dataSets: [{ key: 'table-tbl-1', source: { type: 'catalog-products' }, rows: [['SKU-1', 'Мангал', '4500']] }],
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

  /** Drain the constructor's getById → list → putDataSet (S46 on-load hydrate) bootstrap. */
  async function drainBootstraps(component: TestableEditor): Promise<void> {
    await flush();
    await flush();
    component.activeLayerId.set('tbl-1');
  }

  it('re-puts the dataSet with empty rows when columns change on a live-source table', async () => {
    const component = createEditor();
    await drainBootstraps(component);
    documentsService.putDataSet.mockClear();

    const nextColumns = [
      { key: 'article', label: 'Артикул' },
      { key: 'photo', label: 'Фото' },
      { key: 'productName', label: 'Наименование' },
      { key: 'description', label: 'Описание' },
      { key: 'unit', label: 'Ед.Изм.' },
      { key: 'unitPrice', label: 'Цена' },
    ];
    component.patchTableSettings({ tableTemplateColumns: nextColumns, tableTemplateSampleRows: [Array(6).fill('')] });
    await flush();

    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-tbl-1',
      expect.objectContaining({
        dataSet: expect.objectContaining({ source: { type: 'catalog-products' }, rows: [] }),
      }),
    );
    const after = component.blocks();
    expect(after[0]!.settings?.['liveRows']).toEqual([['SKU-1', 'Мангал', '4500']]);
  });

  it('does not re-hydrate when the patch does not touch columns (e.g. transparent-background toggle)', async () => {
    const component = createEditor();
    await drainBootstraps(component);
    documentsService.putDataSet.mockClear();

    component.patchTableSettings({ tableTransparentBackground: true });
    await flush();

    expect(documentsService.putDataSet).not.toHaveBeenCalled();
  });
});
