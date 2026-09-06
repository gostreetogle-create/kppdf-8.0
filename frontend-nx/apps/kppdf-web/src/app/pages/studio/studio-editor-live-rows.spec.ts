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
import type { StudioBlockLayout } from '@kppdf/data-access';

/**
 * TZ-NX-DOCSTUDIO-S46 — the exact PO bug: rows inserted from «Выбрано»
 * (putDataSet → settings.liveRows, client-only) disappear forever after a
 * drag because `saveLayouts` used to replace blocks with the layout API
 * response, which never contains liveRows. This spec locks the merge:
 * a layout response without liveRows must not erase them, and the safety
 * net must not fire when rows survived.
 */
describe('StudioEditorPage — saveLayouts preserves liveRows (TZ-NX-DOCSTUDIO-S46)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void; update: (fn: (x: StudioDocument) => StudioDocument) => void };
    blocks: { set: (blocks: readonly StudioBlock[]) => void; (): readonly StudioBlock[] };
    layoutsDirty: boolean;
    saveLayouts: () => Promise<boolean>;
    changeLayout: (id: string, layout: StudioBlockLayout) => void;
  }

  const DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'S46 doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
    // Real backend: putDataSet hydrates rows into the dataSet entry, so the
    // document always carries them for the on-load / safety-net paths.
    dataSets: [
      {
        key: 'table-tbl-1',
        source: { type: 'catalog-products' },
        rows: [
          ['Кровать «Ночной сон»', '2'],
          ['Стол «Обеденный»', '1'],
        ],
        catalogSelectionCount: 2,
      },
    ],
  };

  const TABLE: StudioBlock = {
    _id: 'tbl-1',
    type: 'table',
    order: 0,
    title: 'Витрина',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      dataSource: { type: 'catalog-products' },
      liveRows: [
        ['Кровать «Ночной сон»', '2'],
        ['Стол «Обеденный»', '1'],
      ],
    },
  };

  let blocksService: { updateLayouts: jest.Mock };
  let documentsService: { putDataSet: jest.Mock; getById: jest.Mock };

  beforeEach(() => {
    blocksService = {
      // Layout response mirrors the real backend: layouts updated, settings WITHOUT liveRows.
      updateLayouts: jest.fn().mockImplementation((_id: string, payload: { updates: { blockId: string; layout: object }[] }) =>
        of({
          ok: true,
          data: [
            {
              ...TABLE,
              layout: { ...TABLE.layout, ...(payload.updates[0]?.layout as object) },
              settings: { dataSource: { type: 'catalog-products' } },
            } as StudioBlock,
          ],
        }),
      ),
    };
    documentsService = {
      putDataSet: jest.fn().mockReturnValue(of({ ok: true, data: DOC })),
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
          // Initial load list returns the hydrated table; updateLayouts serves the layout save.
          useValue: {
            list: jest.fn().mockImplementation(() => of({ ok: true, data: blocksSeed ?? [TABLE] })),
            updateLayouts: blocksService.updateLayouts,
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

  let blocksSeed: readonly StudioBlock[] | null = null;
  let fixture: ComponentFixture<StudioEditorPage>;

  afterEach(() => {
    // Cancel the debounced schedule() timer so it can't fire a second
    // saveLayouts after the test finished awaiting the awaited one.
    fixture?.destroy();
  });

  function createEditor(): TestableEditor {
    fixture = TestBed.createComponent(StudioEditorPage);
    const component = fixture.componentInstance as unknown as TestableEditor;
    component.document.set(DOC);
    component.blocks.set(blocksSeed ?? [TABLE]);
    component.layoutsDirty = true;
    return component;
  }

  /** Drain the constructor's getById → list → putDataSet chains before driving the flow. */
  async function drainBootstraps(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }

  it('keeps liveRows after a layout save whose response omits them', async () => {
    const component = createEditor();
    const ok = await component.saveLayouts();

    expect(ok).toBe(true);
    expect(blocksService.updateLayouts).toHaveBeenCalled();
    const after = component.blocks();
    expect(after).toHaveLength(1);
    expect(after[0]!.settings?.['liveRows']).toEqual(TABLE.settings?.['liveRows']);
    // The server layout (unchanged coordinates here) still applies.
    expect(after[0]!.layout).toEqual(TABLE.layout);
  });

  it('applies the new server layout while preserving liveRows (drag scenario)', async () => {
    const component = createEditor();
    // NB: updateLayouts is captured by reference in the provider, so re-point the
    // SAME function object's behavior via mockImplementation on the shared mock.
    blocksService.updateLayouts.mockImplementation(() =>
      of({
        ok: true,
        data: [
          {
            ...TABLE,
            // Drag result within bounds: width/height unchanged, x→0.2, y→0.2.
            layout: { ...TABLE.layout, x: 0.2, y: 0.2 },
            settings: { dataSource: { type: 'catalog-products' } },
          } as StudioBlock,
        ],
      }),
    );

    // Drain the constructor's async bootstrap (getById → list) first.
    await drainBootstraps();
    // Simulate the drag BEFORE save: canvas mutates local layout via changeLayout (real flow).
    component.changeLayout('tbl-1', { ...TABLE.layout!, x: 0.2, y: 0.2 });
    await component.saveLayouts();

    const after = component.blocks();
    // Server layout applies (drag result) after the normalizer.
    expect(after[0]!.layout?.x).toBeCloseTo(0.2, 5);
    expect(after[0]!.layout?.y).toBeCloseTo(0.2, 5);
    expect(after[0]!.settings?.['liveRows']).toEqual(TABLE.settings?.['liveRows']);
    // Rows survived → no EXTRA putDataSet re-hydrate beyond the bootstrap one.
    expect(documentsService.putDataSet).toHaveBeenCalledTimes(1); // bootstrap only
  });

  it('re-hydrates once when liveRows are empty and a dataSet entry exists (safety net)', async () => {
    blocksSeed = [{ ...TABLE, settings: { dataSource: { type: 'catalog-products' }, liveRows: [] } }];
    const component = createEditor();

    await component.saveLayouts();

    // expectedRevision is the post-save revision (local optimistic +1 after the layout save).
    expect(documentsService.putDataSet).toHaveBeenCalledWith(
      'doc-1',
      'table-tbl-1',
      expect.objectContaining({ expectedRevision: expect.any(Number) }),
    );
    const payload = documentsService.putDataSet.mock.calls[0]![2] as { expectedRevision: number };
    expect(payload.expectedRevision).toBeGreaterThanOrEqual(1);
  });
});
