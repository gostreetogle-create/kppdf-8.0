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
 * TZ-NX-DOCSTUDIO-CATALOG-HYDRATE-ALL — root cause of "only the first
 * catalog table has rows after reopen". `refreshLiveDataSetsOnLoad` used to
 * fire one `putDataSet` per hydratable table WITHOUT awaiting, so with 2+
 * tables (изделия+модули+детали+материалы is the typical shape) every
 * request read the same not-yet-updated `document().revision` and raced the
 * backend's optimistic-concurrency gate: the server 409'd every request but
 * the first, and the silent `if (!result.ok) return` swallowed the failures
 * — the operator saw rows only in one table. This spec drives a real
 * document load (route id set) with four wired tables and proves every
 * `putDataSet` call carries a strictly increasing `expectedRevision` — i.e.
 * they ran serially, each waiting for the previous response — and that all
 * four end up with liveRows applied, not just the first.
 */
describe('StudioEditorPage — serial hydrate on load (TZ-NX-DOCSTUDIO-CATALOG-HYDRATE-ALL)', () => {
  const DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Hydrate-all doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
    dataSets: [
      { key: 'table-t-products', source: { type: 'catalog-products' }, rows: [] },
      { key: 'table-t-modules', source: { type: 'catalog-modules' }, rows: [] },
      { key: 'table-t-parts', source: { type: 'catalog-parts' }, rows: [] },
      { key: 'table-t-materials', source: { type: 'catalog-materials' }, rows: [] },
    ],
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

  const TABLES = [
    table('t-products', 'catalog-products'),
    table('t-modules', 'catalog-modules'),
    table('t-parts', 'catalog-parts'),
    table('t-materials', 'catalog-materials'),
  ];

  let documentsService: { putDataSet: jest.Mock; getById: jest.Mock };
  let toast: { success: jest.Mock; error: jest.Mock };
  let revisionCounter: number;

  function nextRevisionDoc(key: string, rows: unknown[]): StudioDocument {
    revisionCounter += 1;
    return {
      ...DOC,
      revision: revisionCounter,
      dataSets: DOC.dataSets!.map((entry) => (entry.key === key ? { ...entry, rows } : entry)),
    };
  }

  function configure(putDataSetImpl: jest.Mock): void {
    documentsService = {
      putDataSet: putDataSetImpl,
      getById: jest.fn().mockReturnValue(of({ ok: true, data: DOC })),
    };
    toast = { success: jest.fn(), error: jest.fn() };

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: documentsService },
        { provide: PiStudioBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: TABLES })) } },
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

  it('4 wired catalog tables: putDataSet fires serially with strictly increasing expectedRevision, all four get rows', async () => {
    revisionCounter = 1;
    const putDataSet = jest.fn((_id: string, key: string) => of({ ok: true, data: nextRevisionDoc(key, [['row']]) }));
    configure(putDataSet);

    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    expect(putDataSet).toHaveBeenCalledTimes(4);
    const revisions = putDataSet.mock.calls.map((call) => (call[2] as { expectedRevision: number }).expectedRevision);
    // Strictly increasing — each call read the revision the PREVIOUS call's
    // response actually returned, proving they ran one at a time, not raced
    // against the same stale snapshot.
    expect(revisions).toEqual([1, 2, 3, 4]);
    expect(new Set(revisions).size).toBe(4);

    const component = fixture.componentInstance as unknown as { blocks: () => readonly StudioBlock[] };
    const liveRowsByBlock = component.blocks().map((b) => (b.settings as Record<string, unknown> | undefined)?.['liveRows']);
    expect(liveRowsByBlock).toEqual([[['row']], [['row']], [['row']], [['row']]]);
  });

  it('one table fails (409): toasts once, the remaining tables still hydrate', async () => {
    revisionCounter = 1;
    let call = 0;
    const putDataSet = jest.fn((_id: string, key: string) => {
      call += 1;
      if (call === 2) return of({ ok: false, error: { message: 'conflict' } });
      return of({ ok: true, data: nextRevisionDoc(key, [['row']]) });
    });
    configure(putDataSet);

    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    expect(putDataSet).toHaveBeenCalledTimes(4);
    expect(toast.error).toHaveBeenCalledTimes(1);

    const component = fixture.componentInstance as unknown as { blocks: () => readonly StudioBlock[] };
    const settled = component.blocks().filter((b) => Array.isArray((b.settings as Record<string, unknown> | undefined)?.['liveRows']));
    // 3 of 4 tables still got their rows even though the 2nd request failed.
    expect(settled.length).toBe(3);
  });
});
