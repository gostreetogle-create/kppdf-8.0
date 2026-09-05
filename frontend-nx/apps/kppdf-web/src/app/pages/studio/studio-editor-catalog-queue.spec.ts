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
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { StudioEditorPage } from './studio-editor.page';

/**
 * TZ-NX-DOCSTUDIO-S41 — locks the vitrina write queue. Before this TZ,
 * `onCatalogSelectionChange` fired `patchDocumentContext` (PATCH context)
 * and `putDataSet` (PUT data-set) in parallel against the SAME snapshotted
 * revision, so two rapid adds raced each other into a 409 and the
 * «Документ изменён в другом месте» conflict dialog. The fix serializes
 * every vitrina write onto one chain: PATCH context → await → putDataSet
 * with the revision the PATCH just returned. This spec proves two adds
 * fired back-to-back (no await between them, simulating rapid clicks)
 * never trigger conflict(), and that each write step carries the revision
 * the previous step actually returned — not one snapshotted at click time.
 *
 * Deliberately skips `fixture.detectChanges()`: the full editor template
 * renders a heavy canvas + panel tree with its own service graph unrelated
 * to this queue. Angular still runs the constructor on `TestBed.createComponent`,
 * which is enough to drive `onCatalogSelectionChange` directly against a
 * mocked `PiStudioDocumentsService` — the focused scope the TZ asks for.
 */
describe('StudioEditorPage — catalog write queue (TZ-NX-DOCSTUDIO-S41)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    blocks: { set: (blocks: readonly StudioBlock[]) => void };
    catalogSelections: { set: (sel: Record<string, readonly string[]>) => void };
    catalogWriteBusy: () => boolean;
    onCatalogSelectionChange: (change: { kind: 'products'; ids: readonly string[] }) => void;
    catalogWriteChain: Promise<void>;
  }

  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'S41 doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
  };

  const TABLE_BLOCK: StudioBlock = {
    _id: 'blk-table',
    type: 'table',
    order: 0,
    isActive: true,
    settings: { dataSource: { type: 'catalog-products' } },
  };

  let documentsService: { update: jest.Mock; putDataSet: jest.Mock };
  let dialog: { open: jest.Mock };
  let revisionCounter: number;

  function nextRevisionDoc(patch: Partial<StudioDocument>): StudioDocument {
    revisionCounter += 1;
    return { ...BASE_DOC, ...patch, revision: revisionCounter };
  }

  beforeEach(() => {
    revisionCounter = 1;
    documentsService = {
      update: jest.fn((_id: string, payload: { expectedRevision: number; context?: Record<string, unknown> }) =>
        of({ ok: true, data: nextRevisionDoc({ context: payload.context }) }),
      ),
      putDataSet: jest.fn(
        (_id: string, key: string, payload: { expectedRevision: number; dataSet: unknown }) =>
          of({
            ok: true,
            data: nextRevisionDoc({ dataSets: [{ key, ...(payload.dataSet as object) } as never] }),
          }),
      ),
    };
    dialog = { open: jest.fn() };

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: documentsService },
        { provide: PiStudioBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: dialog },
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
    const component = fixture.componentInstance as unknown as TestableEditor;
    component.document.set(BASE_DOC);
    component.blocks.set([TABLE_BLOCK]);
    component.catalogSelections.set({ products: [], modules: [], parts: [], materials: [] });
    return component;
  }

  it('two rapid adds are serialized — no conflict() and each write carries the previous write\'s revision', async () => {
    const component = createEditor();

    component.onCatalogSelectionChange({ kind: 'products', ids: ['p1'] });
    component.onCatalogSelectionChange({ kind: 'products', ids: ['p1', 'p2'] });

    await component.catalogWriteChain;

    expect(dialog.open).not.toHaveBeenCalled();
    expect(documentsService.update).toHaveBeenCalledTimes(2);
    expect(documentsService.putDataSet).toHaveBeenCalledTimes(2);

    // Call order across the two calls interleaves: update#1, putDataSet#1, update#2, putDataSet#2.
    const updateRevisions = documentsService.update.mock.calls.map((call) => call[1].expectedRevision);
    const putRevisions = documentsService.putDataSet.mock.calls.map((call) => call[2].expectedRevision);
    expect(updateRevisions).toEqual([1, 3]); // doc starts at rev 1; second PATCH only after first add's full sequence (rev 2 → 3) landed
    expect(putRevisions).toEqual([2, 4]); // each putDataSet carries the revision its own preceding PATCH just returned

    expect(component.catalogWriteBusy()).toBe(false);
  });

  it('a real 409 from another tab still opens the conflict dialog', async () => {
    const component = createEditor();
    documentsService.update.mockReturnValueOnce(of({ ok: false, error: { message: 'conflict' } }));

    component.onCatalogSelectionChange({ kind: 'products', ids: ['p1'] });
    await component.catalogWriteChain;

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(component.catalogWriteBusy()).toBe(false);
  });

  it('registers Data then Selected on the left rail and mirrors the buffer count as a badge (TZ-NX-DOCSTUDIO-D56)', () => {
    const fixture = TestBed.createComponent(StudioEditorPage);
    const component = fixture.componentInstance as unknown as TestableEditor;
    component.document.set(BASE_DOC);
    component.catalogSelections.set({ products: ['p1', 'p2'], modules: [], parts: [], materials: [] });
    fixture.detectChanges();

    const leftTools = TestBed.inject(ShellToolRailService).leftTools();
    expect(leftTools.map((tool) => tool.id)).toEqual(['data', 'selected']);
    expect(leftTools[1]?.ariaLabel).toBe('Выбрано');
    expect(leftTools[1]?.badge).toBe(2);
  });
});
