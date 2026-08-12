import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { BuilderPage } from './builder.page';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import {
  DocumentTemplatesService,
  type DocumentTemplate,
} from '../../../shared/services/pi-document-templates.service';
import { TextBlockCategoriesService } from '../../../shared/services/pi-text-block-categories.service';
import { BuilderTextFilterService } from './builder-text-filter.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../../core/api.tokens';
import { CatalogReturnStore } from '../../../shared/navigation/catalog-return.util';

/**
 * ParamMap-shaped fake — Angular's `paramMap` is an Observable of
 * `{ keys: string[], get(key: string): string | null }` objects.
 * Using `BehaviorSubject` (not `of(...)`) so additional `next()` calls
 * from TZ-DOC-317 roundtrip tests can drive subsequent emissions.
 */
function makeParamMap(values: Record<string, string | null>): {
  keys: string[];
  get: (key: string) => string | null;
} {
  const keys = Object.keys(values);
  return {
    keys,
    get: (key: string) => (key in values ? (values[key] ?? null) : null),
  };
}

describe('BuilderPage', () => {
  const baseUrl = '/api';
  const initialParamMap = makeParamMap({});
  const initialQueryParamMap = makeParamMap({});
  const paramSubject = new BehaviorSubject<ReturnType<typeof makeParamMap>>(initialParamMap);
  const queryParamSubject = new BehaviorSubject<ReturnType<typeof makeParamMap>>(
    initialQueryParamMap,
  );
  const fakeActivatedRoute = {
    paramMap: paramSubject.asObservable(),
    queryParamMap: queryParamSubject.asObservable(),
    // TZ-DOC-317: the write-side effect() reads `route.snapshot.queryParamMap`
    // to skip redundant navigate() calls (loop guard).
    snapshot: { queryParamMap: { get: () => null } },
  };

  // TZ-DOC-324 (IA): builder.page is now pure editor for /:id. CRUD для
  // шаблонов (create/duplicate/delete) перенесён в TemplatesPage, поэтому
  // related TZ-DOC-268/310 regression tests теперь живут там.
  // Эти тесты остаются — они о pure editor-функциональности.

  const navigate = jest.fn();
  const navigateByUrl = jest.fn().mockResolvedValue(true);
  // TZ-UX-316: builder back без returnUrl делегирует CatalogReturnStore
  // (реальный store требует Router.events/Location — в этом suite не нужен).
  const catalogNavigateBackOr = jest.fn();
  const toastSuccess = jest.fn();
  const toastError = jest.fn();
  const templatesSvcUpdate = jest
    .fn()
    .mockReturnValue(of({ ok: true, data: { _id: 'tpl-1' } as never }));
  const templatesSvcFindById = jest.fn().mockReturnValue(of({ ok: true, data: null }));
  // Hoisted mock so TZ-DOC-318 tests can seed a catalog for the badge lookup.
  const catSvcList = jest.fn().mockReturnValue(of({ ok: true, data: [] }));
  const blocksSvcUpdate = jest.fn().mockReturnValue(of({ ok: true, data: {} as never }));
  // TZ-DOC-333: hoisted photo-flow mocks (create returns a persisted block,
  // upload returns a canonical /uploads/... URL).
  const blocksSvcAdd = jest.fn();
  const blocksSvcUploadImage = jest.fn();
  const createObjectURLSpy = jest.fn(() => 'blob:mock-1');
  const revokeObjectURLSpy = jest.fn();
  const createdBlock = (id: string) => ({
    _id: id,
    templateId: 'tpl-1',
    type: 'image' as const,
    order: 0,
    showLine: false,
    isActive: true,
    settings: { overlay: true },
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    // Node 18 / jsdom lacks globalThis.crypto.randomUUID — onPhotoFile (photo
    // upload) relies on it for tempId. Stub it for the whole suite.
    if (typeof globalThis.crypto?.randomUUID !== 'function') {
      Object.defineProperty(globalThis, 'crypto', {
        writable: true,
        configurable: true,
        value: { ...(globalThis.crypto ?? {}), randomUUID: () => 'temp-uuid-1' },
      });
    }
    // Test isolation: the describe-scoped BehaviorSubjects retain state from
    // the previous test (e.g. `categoryId=cat-7` seeded by TZ-DOC-318 URL
    // tests) and would leak into the next fixture. Reset both to empty.
    paramSubject.next(initialParamMap);
    queryParamSubject.next(initialQueryParamMap);
    // The catalog mock's implementation survives `clearAllMocks` — reset the
    // default (empty) so badge-lookup tests don't inherit a seeded catalog.
    catSvcList.mockReturnValue(of({ ok: true, data: [] }));
    blocksSvcUpdate.mockReturnValue(of({ ok: true, data: {} as never }));
    // TZ-DOC-333: default photo-flow implementations + URL object spies.
    blocksSvcAdd.mockReturnValue(of({ ok: true, data: createdBlock('block-1') as never }));
    blocksSvcUploadImage.mockReturnValue(
      of({ ok: true, data: { url: '/uploads/template-blocks/block-1/a.png' } }),
    );
    Object.defineProperty(URL, 'createObjectURL', { writable: true, value: createObjectURLSpy });
    Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: revokeObjectURLSpy });
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: Router, useValue: { navigate, navigateByUrl } },
        {
          provide: CatalogReturnStore,
          useValue: { navigateBackOr: catalogNavigateBackOr },
        },
        {
          provide: TemplateBlocksService,
          useValue: {
            listByTemplate: () => of({ ok: true, data: [] }),
            add: blocksSvcAdd,
            update: blocksSvcUpdate,
            updateLayouts: jest.fn().mockReturnValue(of({ ok: true, data: null })),
            remove: () => of({ ok: true, data: undefined }),
            reorder: () => of({ ok: true, data: undefined }),
            uploadImage: blocksSvcUploadImage,
          },
        },
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0 } }),
            findById: templatesSvcFindById,
            create: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'tpl-1' } })),
            update: templatesSvcUpdate,
            remove: () => of({ ok: true, data: undefined }),
            uploadBackground: () => of({ ok: true, data: { url: '', backgroundImage: [] } }),
            removeBackground: () => of({ ok: true, data: undefined }),
            setDefaultBackground: () => of({ ok: true, data: undefined }),
            setOrientation: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiToastService, useValue: { success: toastSuccess, error: toastError } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        {
          provide: TextBlockCategoriesService,
          useValue: {
            list: catSvcList,
            findById: () => of({ ok: true, data: null }),
          },
        },
        BuilderTextFilterService,
      ],
    })
      .overrideComponent(BuilderPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts with null templateId (pure editor — picker moved to TemplatesPage)', () => {
    // TZ-DOC-324: /builder без :id → редирект на /templates, поэтому
    // BuilderPage больше не показывает picker-ветку в template. Однако
    // signal templateId всё равно null на пустом init — это нормально,
    // важно что в template больше нет if(!templateId()) блока (verified
    // by code-reviewer + tsc build).
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as { templateId: () => string | null };
    expect(comp.templateId()).toBeNull();
  });

  it('starts with empty blocks', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as { blocks: () => unknown[] };
    expect(comp.blocks().length).toBe(0);
  });

  it('starts with idle save status', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as {
      saveStatus: () => 'idle' | 'saving' | 'saved' | 'error';
    };
    expect(comp.saveStatus()).toBe('idle');
  });

  it('selectedBlock is null when nothing selected', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as {
      selectedBlock: () => { _id: string } | null;
    };
    expect(comp.selectedBlock()).toBeNull();
  });

  // ═══ TZ-DOC-311: template property persistence regression tests ═══

  it('TZ-DOC-311: onTemplateUpdate PATCHes pageNumbering to the templates service', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      templateId: { set: (v: string | null) => void };
      onTemplateUpdate: (patch: Record<string, unknown>) => void;
    };
    comp.templateId.set('tpl-1');
    comp.onTemplateUpdate({ pageNumbering: true });
    expect(templatesSvcUpdate).toHaveBeenCalledWith('tpl-1', { pageNumbering: true });
  });

  it('TZ-DOC-311: template update API error reverts via findById (no false optimistic state)', () => {
    templatesSvcUpdate.mockReturnValueOnce(of({ ok: false, error: { status: 400 } as never }));
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      templateId: { set: (v: string | null) => void };
      template: { set: (t: unknown) => void };
      onTemplateUpdate: (patch: Record<string, unknown>) => void;
    };
    comp.templateId.set('tpl-1');
    comp.template.set({ _id: 'tpl-1', pageNumbering: true } as never);
    comp.onTemplateUpdate({ pageNumbering: true });
    expect(templatesSvcUpdate).toHaveBeenCalled();
    expect(templatesSvcFindById).toHaveBeenCalledWith('tpl-1');
  });

  // ═══ TZ-DOC-317: shared category filter rebuilds the «Тексты» URL ═══

  it('TZ-DOC-317: left palette texts section includes the category filter', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      templateId: { set: (v: string | null) => void };
      selectedCategoryId: () => string | null;
    };
    // Tool pane (and its filter) only meaningful when a template is loaded.
    // Child panes are stubbed via NO_ERRORS_SCHEMA in this suite — DOM filter
    // coverage lives in builder-tool-pane.component.spec.ts.
    comp.templateId.set('tpl-1');
    fixture.detectChanges();
    expect(comp.selectedCategoryId()).toBeNull();
  });

  it('TZ-DOC-335: BuilderPage no longer owns texts/tables httpResources (palette does)', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const httpMock = TestBed.inject(HttpTestingController);
    const textReqs = httpMock.match((r) => r.method === 'GET' && r.url.includes('/text-blocks'));
    const tableReqs = httpMock.match(
      (r) => r.method === 'GET' && r.url.includes('/table-templates'),
    );
    expect(textReqs).toHaveLength(0);
    expect(tableReqs).toHaveLength(0);
  });

  it('TZ-DOC-335: goToTemplates without returnUrl falls back to CatalogReturnStore → templates', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    (fixture.componentInstance as unknown as { goToTemplates: () => void }).goToTemplates();
    expect(catalogNavigateBackOr).toHaveBeenCalledWith('/doc-constructor/templates');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  // ═══ TZ-UX-316: explicit ?returnUrl deep-link return (Create КП) ═══

  it('TZ-UX-316: goToTemplates honors same-origin ?returnUrl', async () => {
    queryParamSubject.next(makeParamMap({ returnUrl: '/proposals/create' }));
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();

    (fixture.componentInstance as unknown as { goToTemplates: () => void }).goToTemplates();
    expect(navigateByUrl).toHaveBeenCalledWith('/proposals/create');
    expect(catalogNavigateBackOr).not.toHaveBeenCalled();
  });

  it('TZ-UX-316: back label becomes «← К созданию КП» when returnUrl is present', async () => {
    queryParamSubject.next(makeParamMap({ returnUrl: '/proposals/create?id=draft-1' }));
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      backButtonLabel: () => string;
      backButtonTitle: () => string;
    };
    expect(comp.backButtonLabel()).toBe('← К созданию КП');
    expect(comp.backButtonTitle()).toBe('Вернуться к созданию КП');
    const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '[data-test="builder-back-templates"]',
    );
    expect(btn).toBeTruthy();
    expect(btn.textContent?.trim()).toContain('К созданию КП');
    expect(btn.getAttribute('aria-label')).toBe('Вернуться к созданию КП');
  });

  it('TZ-UX-316: back label stays «← Шаблоны» without returnUrl', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      backButtonLabel: () => string;
    };
    expect(comp.backButtonLabel()).toBe('← Шаблоны');
  });

  it('TZ-UX-316: rejects unsafe returnUrl (scheme / protocol-relative)', async () => {
    queryParamSubject.next(makeParamMap({ returnUrl: 'javascript:alert(1)' }));
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      returnUrl: () => string | null;
      backButtonLabel: () => string;
    };
    expect(comp.returnUrl()).toBeNull();
    expect(comp.backButtonLabel()).toBe('← Шаблоны');

    queryParamSubject.next(makeParamMap({ returnUrl: '//evil.example/x' }));
    fixture.detectChanges();
    expect(comp.returnUrl()).toBeNull();
  });

  // ────────────────────────────────────────────────────────────────────
  // TZ-DOC-317 (steps e + f): URL roundtrip + template-switch reset.
  //
  // Uses the Subject-backed paramMap / queryParamMap declared at the top
  // of this describe so subsequent emissions re-enter the route handlers.
  // ────────────────────────────────────────────────────────────────────

  it('TZ-DOC-317 step e: changing the shared filter writes ?category=<id> to URL via merge+replaceUrl', async () => {
    // Build fixture (paramMap / queryParamMap are BehaviorSubjects seeded
    // with empty maps, so the constructor's initial subscribe completes).
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    // Drain any GETs the constructor's httpResources fired.
    const httpMock = TestBed.inject(HttpTestingController);
    while (httpMock.match(() => true).length > 0) {
      httpMock.match(() => true).forEach((m) => m.flush([]));
    }

    // We may have observed an initial `navigate` from the constructor's
    // effect() running on a null categoryId. Drop it so the next call is
    // unambiguously our driver's action.
    const callsBefore = navigate.mock.calls.length;
    const filter = TestBed.inject(BuilderTextFilterService);
    filter.categoryId.set('cat-7');

    // Drive CD + effect flush; Angular effects only fire in CD context.
    fixture.detectChanges();
    TestBed.flushEffects();

    const newCalls = navigate.mock.calls.slice(callsBefore);
    expect(newCalls.length).toBeGreaterThan(0);
    // Router.navigate signature: (commands: any[], extras?: { ... }).
    // Effects navigate with `commands = []` (relative route) and extras
    // carrying `queryParams + relativeTo + queryParamsHandling + replaceUrl`.
    const lastCall = newCalls[newCalls.length - 1];
    const extras = lastCall[1];
    expect(extras).toEqual(
      expect.objectContaining({
        queryParams: { categoryId: 'cat-7' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );

    // Drain any pending HTTP requests fired by the signal-driven reload.
    while (httpMock.match(() => true).length > 0) {
      httpMock.match(() => true).forEach((m) => m.flush([]));
    }
  });

  it('TZ-DOC-317 step f: switching templates resets the shared filter back to null', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    // Pick a category for the current template.
    const filter = TestBed.inject(BuilderTextFilterService);
    filter.categoryId.set('cat-7');
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(filter.categoryId()).toBe('cat-7');

    // Drain pending HTTP requests fired by the previous filter set.
    const httpMock = TestBed.inject(HttpTestingController);
    while (httpMock.match(() => true).length > 0) {
      httpMock.match(() => true).forEach((m) => m.flush([]));
    }

    // Pick a different template via paramMap → BuilderPage's paramMap
    // subscribe calls `textFilter.reset()` per TZ-DOC-317 step f.
    paramSubject.next(makeParamMap({ id: 'tmpl-other' }));
    await new Promise<void>((r) => setTimeout(r, 0));
    expect(filter.categoryId()).toBeNull();

    // Drain remaining pending requests fired by the template switch.
    while (httpMock.match(() => true).length > 0) {
      httpMock.match(() => true).forEach((m) => m.flush([]));
    }
  });

  // ────────────────────────────────────────────────────────────────────
  // TZ-DOC-318 (step b + badge): URL persistence `?categoryId=...` and
  // the topbar breadcrumb chip.
  // ────────────────────────────────────────────────────────────────────

  it('TZ-DOC-318: reading ?categoryId= from URL restores the filter (F5 refresh)', async () => {
    // Seed the URL with an existing category BEFORE creating the page.
    queryParamSubject.next(makeParamMap({ categoryId: 'cat-7' }));
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const filter = TestBed.inject(BuilderTextFilterService);
    expect(filter.categoryId()).toBe('cat-7');

    // Drain any GETs the constructor's httpResources fired.
    const httpMock = TestBed.inject(HttpTestingController);
    while (httpMock.match(() => true).length > 0) {
      httpMock.match(() => true).forEach((m) => m.flush([]));
    }
  });

  it('TZ-DOC-318: shareable link ?categoryId=<id> pre-selects the filter on open', async () => {
    const fakeCategories = [
      {
        _id: 'cat-7',
        name: 'Описания',
        slug: 'opisaniya',
        isActive: true,
        isSystem: false,
        isDefault: false,
        sortOrder: 1,
      },
      {
        _id: 'cat-9',
        name: 'Реквизиты',
        slug: 'rekvizity',
        isActive: true,
        isSystem: false,
        isDefault: false,
        sortOrder: 2,
      },
    ];
    catSvcList.mockReturnValue(of({ ok: true, data: fakeCategories }));

    queryParamSubject.next(makeParamMap({ categoryId: 'cat-7' }));
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const comp = fixture.componentInstance as unknown as {
      templateId: { set: (v: string | null) => void };
      selectedCategoryId: () => string | null;
      currentCategoryLabel: () => string;
    };
    comp.templateId.set('tpl-1');
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(comp.selectedCategoryId()).toBe('cat-7');
    expect(comp.currentCategoryLabel()).toBe('Описания');

    const chip: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '[data-test="builder-category-chip"]',
    );
    expect(chip).toBeTruthy();
    expect(chip.textContent).toContain('Описания');

    const httpMock = TestBed.inject(HttpTestingController);
    while (httpMock.match(() => true).length > 0) {
      httpMock.match(() => true).forEach((m) => m.flush([]));
    }
  });

  it('TZ-DOC-318: breadcrumb chip shows «Все» when no category selected', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      templateId: { set: (v: string | null) => void };
      currentCategoryLabel: () => string;
    };
    comp.templateId.set('tpl-1');
    fixture.detectChanges();

    expect(comp.currentCategoryLabel()).toBe('Все');
    const chip: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '[data-test="builder-category-chip"]',
    );
    expect(chip).toBeTruthy();
    expect(chip.textContent).toContain('Все');
  });

  it('TZ-DOC-318: clicking the breadcrumb chip resets the filter to null', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      templateId: { set: (v: string | null) => void };
      onCategoryChipReset: () => void;
    };
    comp.templateId.set('tpl-1');
    fixture.detectChanges();

    // Set the filter AFTER creation — the constructor's URL read-side
    // would otherwise reset it to null from the empty queryParamMap.
    const filter = TestBed.inject(BuilderTextFilterService);
    filter.categoryId.set('cat-7');
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(filter.categoryId()).toBe('cat-7');

    comp.onCategoryChipReset();
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(filter.categoryId()).toBeNull();
  });

  describe('persistent block groups', () => {
    type PageApi = {
      blocks: { set: (v: unknown[]) => void; (): unknown[] };
      selectedIds: { set: (v: Set<string>) => void; (): Set<string> };
      selectedId: { set: (v: string | null) => void; (): string | null };
      onSelect: (b: unknown) => void;
      onGroupSelected: () => void;
      onUngroupSelected: () => void;
      onCanvasClick: () => void;
      onSelectGroup: (id: string) => void;
      selectionIsPersistedGroup: () => boolean;
      paletteGroups: () => Array<{ groupId: string; count: number }>;
    };

    function layoutBlock(id: string, order: number, groupId?: string | null) {
      return {
        _id: id,
        templateId: 'tpl-1',
        type: 'text',
        order,
        showLine: false,
        isActive: true,
        groupId: groupId ?? null,
        layout: { x: 0.1 * order, y: 0.1, width: 0.2, height: 0.1, zIndex: order },
      };
    }

    it('group → all members share one groupId and persist via update', () => {
      const fixture = TestBed.createComponent(BuilderPage);
      const comp = fixture.componentInstance as unknown as PageApi;
      const a = layoutBlock('a', 1);
      const b = layoutBlock('b', 2);
      comp.blocks.set([a, b]);
      comp.selectedIds.set(new Set(['a', 'b']));
      comp.selectedId.set(null);

      comp.onGroupSelected();

      const updated = comp.blocks() as Array<{ _id: string; groupId?: string | null }>;
      expect(updated[0].groupId).toBeTruthy();
      expect(updated[0].groupId).toBe(updated[1].groupId);
      expect(comp.selectionIsPersistedGroup()).toBe(true);
      expect(comp.paletteGroups()).toHaveLength(1);
      expect(blocksSvcUpdate).toHaveBeenCalledTimes(2);
      expect(blocksSvcUpdate).toHaveBeenCalledWith('a', {
        groupId: updated[0].groupId,
      });
    });

    it('select member → selects entire group; canvas click clears selection only', () => {
      const fixture = TestBed.createComponent(BuilderPage);
      const comp = fixture.componentInstance as unknown as PageApi;
      const gid = 'g-persist-1';
      const a = layoutBlock('a', 1, gid);
      const b = layoutBlock('b', 2, gid);
      const c = layoutBlock('c', 3, null);
      comp.blocks.set([a, b, c]);

      comp.onSelect(a);
      expect(comp.selectedId()).toBeNull();
      expect([...comp.selectedIds()].sort()).toEqual(['a', 'b']);
      expect(comp.selectionIsPersistedGroup()).toBe(true);

      comp.onCanvasClick();
      expect(comp.selectedIds().size).toBe(0);
      const after = comp.blocks() as Array<{ groupId?: string | null }>;
      expect(after[0].groupId).toBe(gid);
      expect(after[1].groupId).toBe(gid);
    });

    it('ungroup → clears groupId on members and persists null', () => {
      const fixture = TestBed.createComponent(BuilderPage);
      const comp = fixture.componentInstance as unknown as PageApi;
      const gid = 'g-persist-2';
      comp.blocks.set([layoutBlock('a', 1, gid), layoutBlock('b', 2, gid)]);
      comp.selectedIds.set(new Set(['a', 'b']));
      comp.selectedId.set(null);

      comp.onUngroupSelected();

      const updated = comp.blocks() as Array<{ groupId?: string | null }>;
      expect(updated.every((b) => b.groupId == null)).toBe(true);
      expect(comp.paletteGroups()).toHaveLength(0);
      expect(blocksSvcUpdate).toHaveBeenCalledWith('a', { groupId: null });
      expect(blocksSvcUpdate).toHaveBeenCalledWith('b', { groupId: null });
    });

    it('selectGroup from palette selects all members', () => {
      const fixture = TestBed.createComponent(BuilderPage);
      const comp = fixture.componentInstance as unknown as PageApi;
      const gid = 'g-palette';
      comp.blocks.set([layoutBlock('a', 1, gid), layoutBlock('b', 2, gid)]);

      comp.onSelectGroup(gid);
      expect([...comp.selectedIds()].sort()).toEqual(['a', 'b']);
    });

    it('layoutChanges updates layouts for all peers and preserves groupId', () => {
      const fixture = TestBed.createComponent(BuilderPage);
      const comp = fixture.componentInstance as unknown as PageApi & {
        templateId: { set: (v: string | null) => void };
        onLayoutChanges: (
          changes: Array<{
            block: TemplateBlock;
            layout: NonNullable<TemplateBlock['layout']>;
          }>,
        ) => void;
      };
      const gid = 'g-drag-peers';
      const a = layoutBlock('a', 1, gid);
      const b = layoutBlock('b', 2, gid);
      comp.templateId.set('tpl-1');
      comp.blocks.set([a, b]);
      // Empty selection — mirrors first mousedown before expand.
      comp.selectedIds.set(new Set());
      comp.selectedId.set(null);

      // Simulate renderer emitting multi-peer layoutChanges after group drag.
      const dx = 0.05;
      comp.onLayoutChanges([
        {
          block: a,
          layout: { ...a.layout!, x: a.layout!.x + dx, y: a.layout!.y },
        },
        {
          block: b,
          layout: { ...b.layout!, x: b.layout!.x + dx, y: b.layout!.y },
        },
      ]);

      const after = comp.blocks() as Array<{
        _id: string;
        groupId?: string | null;
        layout?: { x: number };
      }>;
      expect(after.find((x) => x._id === 'a')?.layout?.x).toBeCloseTo(0.15);
      expect(after.find((x) => x._id === 'b')?.layout?.x).toBeCloseTo(0.25);
      expect(after.every((x) => x.groupId === gid)).toBe(true);

      // Selection sync path used at drag start (select.emit → onSelect).
      comp.onSelect(a);
      expect([...comp.selectedIds()].sort()).toEqual(['a', 'b']);
      expect(comp.selectionIsPersistedGroup()).toBe(true);
    });
  });

  // ═══ TZ-DOC-333: photo blocks persist via /uploads/... (never blob:) ═══

  describe('photo upload (TZ-DOC-333)', () => {
    type PhotoApi = {
      templateId: { set: (v: string | null) => void };
      onPhotoFile: (file: File) => void;
      blocks: () => TemplateBlock[];
    };

    it('create payload omits the blob: imageUrl; upload happens after persist', () => {
      const fixture = TestBed.createComponent(BuilderPage);
      fixture.detectChanges();
      const comp = fixture.componentInstance as unknown as PhotoApi;
      comp.templateId.set('tpl-1');
      fixture.detectChanges();

      const file = new File(['x'], 'photo.png', { type: 'image/png' });
      comp.onPhotoFile(file);

      // The create body must NOT carry the blob preview URL (backend 400s on it).
      expect(blocksSvcAdd).toHaveBeenCalledWith(
        'tpl-1',
        expect.objectContaining({
          settings: expect.not.objectContaining({ imageUrl: expect.any(String) }),
        }),
      );
      const payload = blocksSvcAdd.mock.calls[0][1] as {
        settings?: Record<string, unknown>;
      };
      expect(payload.settings).toEqual({ overlay: true });

      // Upload fires after the block is persisted, targeting the new _id.
      expect(blocksSvcUploadImage).toHaveBeenCalledWith('block-1', file);

      // Local block swaps blob → canonical /uploads/ URL; blob is released.
      const block = comp.blocks().find((b) => b._id === 'block-1');
      expect(block?.settings?.['imageUrl']).toBe('/uploads/template-blocks/block-1/a.png');
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-1');
    });

    it('upload failure drops the dead blob and toasts (no blob reaches the persist path)', () => {
      blocksSvcUploadImage.mockReturnValueOnce(of({ ok: false, error: { status: 400 } as never }));
      const fixture = TestBed.createComponent(BuilderPage);
      fixture.detectChanges();
      const comp = fixture.componentInstance as unknown as PhotoApi;
      comp.templateId.set('tpl-1');
      fixture.detectChanges();

      const file = new File(['x'], 'photo.png', { type: 'image/png' });
      comp.onPhotoFile(file);

      // Block stays on canvas but shows no image — reload shows empty, not broken.
      const block = comp.blocks().find((b) => b._id === 'block-1');
      expect(block?.settings?.['imageUrl']).toBe('');
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-1');
      expect(toastError).toHaveBeenCalled();
    });

    it('sanitizeOutgoingPatch scrubs transient blob:/data: imageUrl from settings PATCHes', () => {
      const fixture = TestBed.createComponent(BuilderPage);
      const comp = fixture.componentInstance as unknown as {
        sanitizeOutgoingPatch: (p: Partial<TemplateBlock>) => Partial<TemplateBlock>;
      };

      const scrubbed = comp.sanitizeOutgoingPatch({
        settings: { imageUrl: 'blob:http://localhost:4200/x', overlay: true },
      });
      expect((scrubbed.settings as Record<string, unknown>)['imageUrl']).toBe('');
      expect((scrubbed.settings as Record<string, unknown>)['overlay']).toBe(true);

      const kept = comp.sanitizeOutgoingPatch({
        settings: { imageUrl: '/uploads/template-blocks/b1/a.png', overlay: true },
      });
      expect((kept.settings as Record<string, unknown>)['imageUrl']).toBe(
        '/uploads/template-blocks/b1/a.png',
      );
    });
  });

  describe('TZ-DOC-344 backgroundImages', () => {
    it('returns only the default background (never stacks all when index is -1)', () => {
      const fixture = TestBed.createComponent(BuilderPage);
      const comp = fixture.componentInstance as unknown as {
        template: { set: (v: DocumentTemplate | null) => void };
        backgroundImages: () => string[];
      };
      comp.template.set({
        _id: 'tpl-1',
        name: 'T',
        organizationId: 'o',
        docTypeId: 'd',
        pageSize: 'A4',
        orientation: 'portrait',
        backgroundOpacity: 0.3,
        pageNumbering: false,
        version: 1,
        backgroundImage: ['/a.png', '/b.png', '/c.png'],
        defaultBackgroundIndex: -1,
      } as DocumentTemplate);

      expect(comp.backgroundImages()).toEqual(['/a.png']);

      comp.template.set({
        _id: 'tpl-1',
        name: 'T',
        organizationId: 'o',
        docTypeId: 'd',
        pageSize: 'A4',
        orientation: 'portrait',
        backgroundOpacity: 0.3,
        pageNumbering: false,
        version: 1,
        backgroundImage: ['/a.png', '/b.png', '/c.png'],
        defaultBackgroundIndex: 2,
      } as DocumentTemplate);
      expect(comp.backgroundImages()).toEqual(['/c.png']);
    });
  });
});
