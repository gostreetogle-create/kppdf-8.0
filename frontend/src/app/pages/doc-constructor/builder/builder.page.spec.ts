import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { BuilderPage } from './builder.page';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { TextBlockCategoriesService } from '../../../shared/services/pi-text-block-categories.service';
import { BuilderTextFilterService } from './builder-text-filter.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../../core/api.tokens';

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
    get: (key: string) => (key in values ? values[key] ?? null : null),
  };
}

describe('BuilderPage', () => {
  const baseUrl = '/api';
  const initialParamMap = makeParamMap({});
  const initialQueryParamMap = makeParamMap({});
  const paramSubject = new BehaviorSubject<ReturnType<typeof makeParamMap>>(
    initialParamMap,
  );
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
  const toastSuccess = jest.fn();
  const toastError = jest.fn();
  const templatesSvcUpdate = jest
    .fn()
    .mockReturnValue(of({ ok: true, data: { _id: 'tpl-1' } as never }));
  const templatesSvcFindById = jest.fn().mockReturnValue(of({ ok: true, data: null }));

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: Router, useValue: { navigate } },
        {
          provide: TemplateBlocksService,
          useValue: {
            listByTemplate: () => of({ ok: true, data: [] }),
            add: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            reorder: () => of({ ok: true, data: undefined }),
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
            list: () => of({ ok: true, data: [] }),
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

  it('TZ-DOC-317: inline texts dropdown includes the category filter', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      templateId: { set: (v: string | null) => void };
      openDropdown: { set: (v: string | null) => void };
      selectedCategoryId: () => string | null;
    };
    // The toolbar (and its dropdowns) only render when a template is loaded.
    comp.templateId.set('tpl-1');
    comp.openDropdown.set('texts');
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      '#bd-text-category-filter',
    );
    expect(select).toBeTruthy();
    expect(comp.selectedCategoryId()).toBeNull();
    // «Все» is the only option while the mock catalog returns [].
    const options = Array.from(select.querySelectorAll('option'));
    expect(options.map((o) => o.textContent?.trim())).toEqual(['Все']);
  });

  it('TZ-DOC-317: changing the shared filter categoryId rebuilds the texts request URL', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const httpMock = TestBed.inject(HttpTestingController);

    // Initial GET fires on creation without categoryId — flush it first.
    httpMock
      .expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks'))
      .flush([]);

    const filter = TestBed.inject(BuilderTextFilterService);
    filter.categoryId.set('cat-9');
    fixture.detectChanges();
    TestBed.flushEffects(); // httpResource re-dispatches with the new URL.

    const req = httpMock.expectOne(
      (r) => r.method === 'GET' && r.url.includes('/text-blocks'),
    );
    expect(req.request.urlWithParams).toContain('categoryId=cat-9');
    expect(req.request.urlWithParams).toContain('isActive=true');
    req.flush([]);
  });

  it('TZ-DOC-317: resetting the filter to null drops categoryId from the URL', async () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const httpMock = TestBed.inject(HttpTestingController);

    // Initial GET fires on creation without categoryId — flush it first.
    httpMock
      .expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks'))
      .flush([]);

    const filter = TestBed.inject(BuilderTextFilterService);
    filter.categoryId.set('cat-9');
    fixture.detectChanges();
    TestBed.flushEffects();
    httpMock
      .expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks'))
      .flush([]);

    filter.reset();
    fixture.detectChanges();
    TestBed.flushEffects();
    const req = httpMock.expectOne(
      (r) => r.method === 'GET' && r.url.includes('/text-blocks'),
    );
    expect(req.request.urlWithParams).not.toContain('categoryId');
    expect(req.request.urlWithParams).toContain('isActive=true');
    req.flush([]);
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
        queryParams: { category: 'cat-7' },
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
});
