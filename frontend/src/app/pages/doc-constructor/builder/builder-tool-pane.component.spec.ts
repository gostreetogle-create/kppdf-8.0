import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BuilderToolPaneComponent } from './builder-tool-pane.component';
import { BuilderTextFilterService } from './builder-text-filter.service';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TextBlockCategoriesService } from '../../../shared/services/pi-text-block-categories.service';
import { TableTemplatesService } from '../../../shared/services/pi-table-templates.service';
import { API_BASE_URL } from '../../../core/api.tokens';

/**
 * TZ-DOC-317 — BuilderToolPane «Тексты» category filter.
 *
 * The pane renders a «Категория» dropdown above the text-blocks list.
 * Selecting a category rebuilds the `textsRes` httpResource URL with
 * `&categoryId=<id>` (server-side Mongo filter, backend TZ-DOC-315).
 * «Все» (empty) → no `categoryId` param.
 *
 * httpResource test contract (see materials.page.spec.ts):
 *   1. `fixture.detectChanges()` — first CD reads the resource URL;
 *   2. `TestBed.flushEffects()` — dispatch the HTTP request;
 *   3. mutate a signal the config fn reads;
 *   4. `TestBed.flushEffects()` — httpResource re-dispatches the re-fetch.
 */
describe('BuilderToolPaneComponent (TZ-DOC-317 category filter)', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';

  const fakeCategories = [
    {
      _id: 'c1',
      name: 'Описания',
      slug: 'opisaniya',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 1,
    },
    {
      _id: 'c2',
      name: 'Реквизиты',
      slug: 'rekvizity',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 2,
    },
  ];

  /** Drain pending microtasks (Promise.then chains inside httpResource). */
  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        TextBlocksService,
        TextBlockCategoriesService,
        TableTemplatesService,
        BuilderTextFilterService,
      ],
    })
      .overrideComponent(BuilderToolPaneComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Create the fixture, open the «Тексты» section, and flush initial requests. */
  async function openTextsSection(): Promise<{
    fixture: ReturnType<typeof TestBed.createComponent<BuilderToolPaneComponent>>;
    comp: BuilderToolPaneComponent;
  }> {
    const fixture = TestBed.createComponent(BuilderToolPaneComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    // Initial requests fired by httpResources + the category catalog.
    httpMock
      .expectOne((r) => r.method === 'GET' && r.url.includes('/text-block-categories'))
      .flush(fakeCategories);
    httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks')).flush([]);
    httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/table-templates')).flush([]);
    await tickMicrotask();
    TestBed.flushEffects();
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    (comp as unknown as { toggle: (k: string) => void }).toggle('texts');
    fixture.detectChanges();
    return { fixture, comp };
  }

  it('TZ-DOC-317: dropdown shows «Все» + active category options from the API', async () => {
    const { fixture } = await openTextsSection();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#tb-category-filter');
    expect(select).toBeTruthy();
    const options = Array.from(select.querySelectorAll('option'));
    expect(options.map((o) => o.textContent?.trim())).toEqual(['Все', 'Описания', 'Реквизиты']);
  });

  it('TZ-DOC-317: selecting a category rebuilds the texts URL with categoryId', async () => {
    const { fixture } = await openTextsSection();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#tb-category-filter');
    select.value = 'c2';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    TestBed.flushEffects(); // httpResource picks up categoryId → dispatches re-fetch.

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks'));
    expect(req.request.urlWithParams).toContain('isActive=true');
    expect(req.request.urlWithParams).toContain('categoryId=c2');
    req.flush([
      {
        _id: 'tb1',
        name: 'Реквизиты сторон',
        slug: 'rekvizity-storon',
        categoryId: 'c2',
        tags: [],
        content: '# Реквизиты',
        isActive: true,
        sortOrder: 0,
      },
    ]);

    // The shared filter state is the single source of truth for the pane.
    const filter = TestBed.inject(BuilderTextFilterService);
    expect(filter.categoryId()).toBe('c2');
  });

  it('TZ-DOC-317: clearing back to «Все» drops the categoryId param', async () => {
    const { fixture } = await openTextsSection();

    const filter = TestBed.inject(BuilderTextFilterService);
    filter.categoryId.set('c1');
    fixture.detectChanges();
    TestBed.flushEffects();
    httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks')).flush([]);

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#tb-category-filter');
    select.value = '';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    TestBed.flushEffects();

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks'));
    expect(req.request.urlWithParams).toContain('isActive=true');
    expect(req.request.urlWithParams).not.toContain('categoryId');
    req.flush([]);
    expect(filter.categoryId()).toBeNull();
  });

  it('TZ-DOC-317: empty result after filter shows the category empty state (no crash)', async () => {
    const { fixture } = await openTextsSection();

    const filter = TestBed.inject(BuilderTextFilterService);
    filter.categoryId.set('c1');
    fixture.detectChanges();
    TestBed.flushEffects();
    httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks')).flush([]);
    await tickMicrotask();
    TestBed.flushEffects();
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('[data-test="tool-pane-texts-empty"]');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('Нет блоков в этой категории');
  });

  it('TZ-DOC-317: category dropdown is disabled while the catalog is loading', async () => {
    const fixture = TestBed.createComponent(BuilderToolPaneComponent);
    fixture.detectChanges();
    TestBed.flushEffects();

    const comp = fixture.componentInstance;
    (comp as unknown as { toggle: (k: string) => void }).toggle('texts');
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#tb-category-filter');
    expect(select.disabled).toBe(true);

    httpMock
      .expectOne((r) => r.method === 'GET' && r.url.includes('/text-block-categories'))
      .flush(fakeCategories);
    httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks')).flush([]);
    httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/table-templates')).flush([]);
    await tickMicrotask();
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(select.disabled).toBe(false);
  });

  it('renders Groups section and emits selectGroup / ungroupGroup', async () => {
    const fixture = TestBed.createComponent(BuilderToolPaneComponent);
    const selectSpy = jest.fn();
    const ungroupSpy = jest.fn();
    fixture.componentRef.setInput('groups', [{ groupId: 'g1', label: 'Группа 1', count: 3 }]);
    fixture.componentInstance.selectGroup.subscribe(selectSpy);
    fixture.componentInstance.ungroupGroup.subscribe(ungroupSpy);
    fixture.detectChanges();
    TestBed.flushEffects();

    // Drain initial httpResource requests so afterEach verify() stays clean.
    httpMock
      .expectOne((r) => r.method === 'GET' && r.url.includes('/text-block-categories'))
      .flush(fakeCategories);
    httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/text-blocks')).flush([]);
    httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/table-templates')).flush([]);
    await tickMicrotask();

    (fixture.componentInstance as unknown as { toggle: (k: string) => void }).toggle('groups');
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('[data-test="tool-pane-groups-list"]');
    expect(list).toBeTruthy();
    expect(list.textContent).toContain('Группа 1');
    expect(list.textContent).toContain('3 блоков');

    fixture.nativeElement.querySelector('[data-test="tool-pane-group-select"]').click();
    expect(selectSpy).toHaveBeenCalledWith('g1');

    fixture.nativeElement.querySelector('[data-test="tool-pane-group-ungroup"]').click();
    expect(ungroupSpy).toHaveBeenCalledWith('g1');
  });
});
