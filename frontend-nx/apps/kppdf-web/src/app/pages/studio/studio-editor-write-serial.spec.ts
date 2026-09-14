import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { from, of } from 'rxjs';
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
 * TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL — «+ Страница» (and the orientation/
 * background/page-numbering toggles) used to read `document().revision` and
 * fire `documents.update` directly, racing the hydrate-on-load / vitrina
 * `putDataSet` queue (`catalogWriteChain`) against the same document's
 * `expectedRevision`. A stale revision 409'd, and a repeated 409 while the
 * conflict dialog was already open was a silent no-op ("the button does
 * nothing"). Separately, block-create/layout-save endpoints bump the
 * document's revision server-side but never return it, so the editor used
 * to guess with a blind local `+ 1` that could also drift out of sync.
 *
 * This spec proves: (1) `addPage` now queues onto the same write chain and
 * only fires once an in-flight hydrate has resolved, using the revision that
 * resolution actually returned; (2) three rapid `addPage` calls all succeed
 * serially with a strictly increasing `expectedRevision`, never racing the
 * same stale snapshot; (3) a second conflict while the dialog is open toasts
 * once instead of doing nothing; (4) creating a block confirms the new
 * revision via a follow-up GET instead of a blind local increment.
 */
describe('StudioEditorPage — one document write queue (TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL)', () => {
  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Write-serial doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    manualPageCount: 1,
    context: {},
    dataSets: [{ key: 'table-t-products', source: { type: 'catalog-products' }, rows: [] }],
  };

  function table(id: string, source: string): StudioBlock {
    return {
      _id: id,
      type: 'table',
      order: 0,
      title: id,
      content: '',
      settings: { dataSource: { type: source } },
    } as unknown as StudioBlock;
  }

  let documentsService: { update: jest.Mock; putDataSet: jest.Mock; getById: jest.Mock };
  let blocksService: { list: jest.Mock; create: jest.Mock; updateLayouts: jest.Mock };
  let toast: { success: jest.Mock; error: jest.Mock };
  let dialogOpen: jest.Mock;

  function configure(opts: {
    tables?: StudioBlock[];
    update?: jest.Mock;
    putDataSet?: jest.Mock;
    getById?: jest.Mock;
    create?: jest.Mock;
  }): void {
    dialogOpen = jest.fn().mockReturnValue({});
    documentsService = {
      update: opts.update ?? jest.fn().mockReturnValue(of({ ok: true, data: { ...BASE_DOC, revision: 2 } })),
      putDataSet: opts.putDataSet ?? jest.fn().mockReturnValue(of({ ok: true, data: { ...BASE_DOC, revision: 2 } })),
      getById: opts.getById ?? jest.fn().mockReturnValue(of({ ok: true, data: BASE_DOC })),
    };
    blocksService = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: opts.tables ?? [] })),
      create: opts.create ?? jest.fn(),
      updateLayouts: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
    };
    toast = { success: jest.fn(), error: jest.fn() };

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
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })), list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: { open: dialogOpen } },
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

  async function flush(): Promise<void> {
    for (let i = 0; i < 24; i++) await Promise.resolve();
  }

  it('addPage waits for an in-flight hydrate instead of racing its stale revision', async () => {
    const callOrder: string[] = [];
    let releaseHydrate!: () => void;
    const hydrateGate = new Promise<void>((resolve) => {
      releaseHydrate = resolve;
    });
    const putDataSet = jest.fn((_id: string, key: string) => {
      callOrder.push('hydrate-start');
      return from(
        hydrateGate.then(() => {
          callOrder.push('hydrate-resolved');
          return {
            ok: true,
            data: {
              ...BASE_DOC,
              revision: 7,
              dataSets: BASE_DOC.dataSets!.map((entry) => (entry.key === key ? { ...entry, rows: [['row']] } : entry)),
            },
          };
        }),
      );
    });
    const update = jest.fn((_id: string, payload: { expectedRevision: number; manualPageCount?: number }) => {
      callOrder.push(`addPage-fired:${payload.expectedRevision}`);
      return of({ ok: true, data: { ...BASE_DOC, revision: payload.expectedRevision + 1, manualPageCount: payload.manualPageCount } });
    });
    configure({ tables: [table('t-products', 'catalog-products')], putDataSet, update });

    fixture = TestBed.createComponent(StudioEditorPage);
    await Promise.resolve();
    await Promise.resolve();

    const component = fixture.componentInstance as unknown as { addPage: () => void };
    component.addPage();
    await Promise.resolve();
    await Promise.resolve();
    // Hydrate is still pending — addPage must be queued behind it, not fired yet.
    expect(update).not.toHaveBeenCalled();

    releaseHydrate();
    await flush();

    expect(update).toHaveBeenCalledTimes(1);
    expect((update.mock.calls[0]![1] as { expectedRevision: number }).expectedRevision).toBe(7);
    expect(callOrder).toEqual(['hydrate-start', 'hydrate-resolved', 'addPage-fired:7']);
  });

  it('three rapid addPage clicks all succeed serially with a strictly increasing expectedRevision', async () => {
    const update = jest.fn((_id: string, payload: { expectedRevision: number; manualPageCount?: number }) =>
      of({ ok: true, data: { ...BASE_DOC, revision: payload.expectedRevision + 1, manualPageCount: payload.manualPageCount } }),
    );
    configure({ update });

    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    const component = fixture.componentInstance as unknown as { addPage: () => void };
    component.addPage();
    component.addPage();
    component.addPage();
    await flush();

    expect(update).toHaveBeenCalledTimes(3);
    const revisions = update.mock.calls.map((call) => (call[1] as { expectedRevision: number }).expectedRevision);
    expect(revisions).toEqual([1, 2, 3]);
    expect(new Set(revisions).size).toBe(3);
    const pageCounts = update.mock.calls.map((call) => (call[1] as { manualPageCount: number }).manualPageCount);
    expect(pageCounts).toEqual([2, 3, 4]);
  });

  it('a second conflict while the dialog is open toasts once instead of silently doing nothing', async () => {
    // TZ-NX-DOCSTUDIO-REVISION-RACE-UX — a genuine, persistent 409 (real
    // second-tab edit): every attempt gets one soft retry (refetch + retry
    // once) before the dialog opens, so `update` fires twice per addPage.
    const update = jest.fn().mockReturnValue(
      of({ ok: false, error: { status: 409, error: { code: 'STUDIO_DOCUMENT_REVISION_CONFLICT' }, message: 'conflict' } }),
    );
    configure({ update });

    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    const component = fixture.componentInstance as unknown as { addPage: () => void };
    component.addPage();
    component.addPage();
    await flush();

    // 2 addPage calls x (1 original attempt + 1 soft retry, since the mock
    // always 409s) = 4.
    expect(update).toHaveBeenCalledTimes(4);
    expect(dialogOpen).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('creating a text layer confirms the new revision via a follow-up GET instead of a blind +1', async () => {
    const create = jest.fn().mockReturnValue(
      of({ ok: true, data: { _id: 'blk-1', type: 'text', order: 0, title: 'Слой 1', content: 'Новый текст' } }),
    );
    const getById = jest.fn().mockReturnValue(of({ ok: true, data: BASE_DOC }));
    configure({ create, getById });

    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    const followUpDoc: StudioDocument = { ...BASE_DOC, revision: 9 };
    getById.mockReturnValue(of({ ok: true, data: followUpDoc }));

    const component = fixture.componentInstance as unknown as {
      addTextToActiveLayer: () => void;
      document: () => StudioDocument | null;
    };
    component.addTextToActiveLayer();
    await flush();

    expect(create).toHaveBeenCalledTimes(1);
    // Once for the initial document load, once more for the post-create refresh.
    expect(getById).toHaveBeenCalledTimes(2);
    expect(component.document()?.revision).toBe(9);
  });

  /**
   * TZ-NX-DOCSTUDIO-REVISION-RACE-UX — the audit's headline complaint: a
   * single self-inflicted 409 (e.g. this queued write's turn came right
   * after another queued write already bumped the revision) must resolve
   * via the soft retry with ZERO dialogs, not just "fewer" — the operator
   * should never see anything at all for this case.
   */
  it('a single self-inflicted 409 resolves via the soft retry with NO conflict dialog at all', async () => {
    let calls = 0;
    const update = jest.fn((_id: string, payload: { expectedRevision: number; manualPageCount?: number }) => {
      calls += 1;
      if (calls === 1) {
        return of({ ok: false, error: { status: 409, error: { code: 'STUDIO_DOCUMENT_REVISION_CONFLICT' } } });
      }
      return of({ ok: true, data: { ...BASE_DOC, revision: payload.expectedRevision + 1, manualPageCount: payload.manualPageCount } });
    });
    const getById = jest.fn().mockReturnValue(of({ ok: true, data: { ...BASE_DOC, revision: 5 } }));
    configure({ update, getById });

    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    const component = fixture.componentInstance as unknown as { addPage: () => void };
    component.addPage();
    await flush();

    expect(update).toHaveBeenCalledTimes(2);
    // The retry re-reads the JUST-refetched document's revision (5), not the stale one from initial load (1).
    expect((update.mock.calls[1]![1] as { expectedRevision: number }).expectedRevision).toBe(5);
    expect(dialogOpen).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  /**
   * TZ-NX-DOCSTUDIO-REVISION-RACE-UX — ШАГ2: a non-409 failure (validation,
   * network, anything that isn't a revision conflict) is never "another tab
   * changed this document" — it was never a second writer.
   */
  it('a non-409 write failure toasts — never the "another tab" dialog, and is never retried', async () => {
    const update = jest.fn().mockReturnValue(
      of({ ok: false, error: { status: 400, error: { message: 'Некорректные данные' } } }),
    );
    configure({ update });

    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    const component = fixture.componentInstance as unknown as { addPage: () => void };
    component.addPage();
    await flush();

    // Not a revision conflict -> attemptWithRevisionRetry never retries it.
    expect(update).toHaveBeenCalledTimes(1);
    expect(dialogOpen).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  /**
   * TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE — a bound user's 403 for a document
   * outside their own org (IDOR guard, kept on purpose) is a distinct,
   * expected case: never the "another tab changed this document" dialog
   * (it is not a 409), and never the raw backend English message either —
   * a specific, honest Russian toast instead.
   */
  it('a 403 org-scope write failure toasts a Russian "no access" message — never the conflict dialog, never the raw English', async () => {
    const update = jest.fn().mockReturnValue(
      of({
        ok: false,
        error: { status: 403, error: { message: 'Studio document belongs to another organization scope' } },
      }),
    );
    configure({ update });

    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    const component = fixture.componentInstance as unknown as { addPage: () => void };
    component.addPage();
    await flush();

    expect(update).toHaveBeenCalledTimes(1);
    expect(dialogOpen).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
    const message = toast.error.mock.calls[0]![0] as string;
    expect(message).not.toMatch(/organization scope/i);
    expect(message).toMatch(/фирм/i);
  });

  /**
   * A plain RBAC 403 ("Forbidden resource" from RolesGuard, unrelated to
   * org scope) must keep the generic toast — matching must key off the
   * scope-specific message, not status 403 alone.
   */
  it('a plain RBAC 403 (role mismatch) keeps the generic toast, not the org-scope wording', async () => {
    const update = jest.fn().mockReturnValue(
      of({ ok: false, error: { status: 403, error: { message: 'Forbidden resource' } } }),
    );
    configure({ update });

    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    const component = fixture.componentInstance as unknown as { addPage: () => void };
    component.addPage();
    await flush();

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
    const message = toast.error.mock.calls[0]![0] as string;
    expect(message).not.toMatch(/фирм/i);
  });

  /**
   * TZ-NX-DOCSTUDIO-REVISION-RACE-UX — `saveLayouts` (drag commit) used to
   * be its own parallel serialization (`layoutSavePromise`), entirely
   * separate from `catalogWriteChain` — the audit's #1 self-race source.
   * Mirrors the `addPage`-waits-for-hydrate test above for the layout path:
   * `changeLayout` (drag move) + `onLayoutCommit` (drag release, the public
   * entry point the canvas's `(layoutCommit)` output calls) must queue
   * behind an in-flight hydrate, not race it.
   */
  it('layout save (drag commit) waits for an in-flight hydrate instead of racing its stale revision', async () => {
    const callOrder: string[] = [];
    let releaseHydrate!: () => void;
    const hydrateGate = new Promise<void>((resolve) => {
      releaseHydrate = resolve;
    });
    const putDataSet = jest.fn((_id: string, key: string) => {
      callOrder.push('hydrate-start');
      return from(
        hydrateGate.then(() => {
          callOrder.push('hydrate-resolved');
          return {
            ok: true,
            data: {
              ...BASE_DOC,
              revision: 7,
              dataSets: BASE_DOC.dataSets!.map((entry) => (entry.key === key ? { ...entry, rows: [['row']] } : entry)),
            },
          };
        }),
      );
    });
    configure({ tables: [table('t-products', 'catalog-products')], putDataSet });
    const updateLayouts = jest.fn((_id: string, payload: { expectedRevision: number }) => {
      callOrder.push(`layout-save-fired:${payload.expectedRevision}`);
      return of({ ok: true, data: [] });
    });
    blocksService.updateLayouts = updateLayouts;

    fixture = TestBed.createComponent(StudioEditorPage);
    await Promise.resolve();
    await Promise.resolve();

    const component = fixture.componentInstance as unknown as {
      changeLayout: (id: string, layout: unknown) => void;
      onLayoutCommit: () => void;
    };
    component.changeLayout('t-products', { page: 1, x: 0.2, y: 0.2, width: 0.3, height: 0.2, zIndex: 1, rotation: 0 });
    component.onLayoutCommit();
    await Promise.resolve();
    await Promise.resolve();
    // Hydrate is still pending — the layout save must be queued behind it, not fired yet.
    expect(updateLayouts).not.toHaveBeenCalled();

    releaseHydrate();
    await flush();

    expect(updateLayouts).toHaveBeenCalledTimes(1);
    expect((updateLayouts.mock.calls[0]![1] as { expectedRevision: number }).expectedRevision).toBe(7);
    expect(callOrder).toEqual(['hydrate-start', 'hydrate-resolved', 'layout-save-fired:7']);
    expect(dialogOpen).not.toHaveBeenCalled();
  });
});
