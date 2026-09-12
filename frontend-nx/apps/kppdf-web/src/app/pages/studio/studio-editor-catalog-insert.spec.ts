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

  let documentsService: { putDataSet: jest.Mock };
  let blocksService: { create: jest.Mock; list: jest.Mock };
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
    };
    blocksService = {
      create: jest.fn(),
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
    };

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: documentsService },
        { provide: PiStudioBlocksService, useValue: blocksService },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })) } },
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
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(blocksService.create).toHaveBeenCalledTimes(1);
    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-blk-new',
      expect.objectContaining({ dataSet: expect.objectContaining({ source: { type: 'catalog-modules' } }) }),
    );
    expect(toast.success).not.toHaveBeenCalledWith(expect.stringContaining('уже на листе'));
  });
});
