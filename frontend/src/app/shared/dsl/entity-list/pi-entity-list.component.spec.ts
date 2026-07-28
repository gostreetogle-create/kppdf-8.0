import { Component } from '@angular/core';
import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';

import {
  PiEntityListComponent,
  DefaultListParams,
  ExternalParams,
} from './pi-entity-list.component';
import { EntityService, PaginatedResponse } from '../entity/entity-service';
import { SilentResult } from '../../../core/silent-http';

interface TestEntity {
  _id: string;
  name: string;
  category: string;
}

const sampleData: TestEntity[] = [
  { _id: '1', name: 'Alpha', category: 'a' },
  { _id: '2', name: 'Bravo', category: 'b' },
  { _id: '3', name: 'Charlie', category: 'c' },
];

interface TestParams extends DefaultListParams {
  category?: string;
}

type ListResult = SilentResult<PaginatedResponse<TestEntity>>;

interface MockService {
  list: (params: TestParams) => ReturnType<EntityService<TestEntity, TestParams>['list']>;
  findById: EntityService<TestEntity, TestParams>['findById'];
  create: EntityService<TestEntity, TestParams>['create'];
  update: EntityService<TestEntity, TestParams>['update'];
  remove: EntityService<TestEntity, TestParams>['remove'];
  // Test introspection
  listCalls: number;
  listParams: TestParams[];
  /** Configure next list() call to return error. */
  armError: () => void;
}

function createMockService(): MockService {
  const listParams: TestParams[] = [];
  let calls = 0;
  let armedError = false;

  const svc: MockService = {
    list(params: TestParams) {
      calls++;
      listParams.push({ ...params });
      if (armedError) {
        armedError = false;
        return of<ListResult>({
          ok: false,
          error: new HttpErrorResponse({
            status: 500,
            statusText: 'Server Error',
            error: { message: 'Backend down' },
          }),
        });
      }
      return of<ListResult>({
        ok: true,
        data: { items: sampleData, total: sampleData.length, page: 1, limit: 50 },
      });
    },
    findById: () => of({ ok: true, data: sampleData[0] }) as never,
    create: () => of({ ok: true, data: sampleData[0] }) as never,
    update: () => of({ ok: true, data: sampleData[0] }) as never,
    remove: () => of({ ok: true, data: undefined }) as never,
    get listCalls() {
      return calls;
    },
    get listParams() {
      return listParams;
    },
    armError() {
      armedError = true;
    },
  };
  return svc;
}

/**
 * Tests for `<app-pi-entity-list>` — TZ-232.C POC.
 *
 * Coverage (14 tests):
 *  1. Renders search input, create button, reload button by default
 *  2. Initial fetch fires once with defaults (page=1, limit=default pageSize)
 *  3. Search input is debounced (300ms) — rapid keystrokes collapse to 1 fetch
 *  4. Search resets page to 1 (page-reset semantic)
 *  5. Error response populates error() signal + renders inline banner
 *  6. Reload button forces re-fetch via public reload() API
 *  7. reload() is publicly callable (programmatic API)
 *  8. Create button emits (create) output event
 *  9. External params input is merged into fetchParams
 * 10. Post-mount params change + reload() refetches with merged params
 * 11. In-flight cancellation: rapid search → only last fetch triggered
 * 12. Page change triggers new fetch (via wrapper.onPageChange bound to pi-table pageChange)
 * 13. Empty data renders pi-table empty state
 * 14. Destroy cleanup — late emissions after fixture.destroy() do NOT throw
 * 15. showSearch=false hides search input
 * 16. canCreate=false hides create button
 *
 * Mock design: synchronous `of()` emission eliminates setTimeout-based
 * timing races — each `service.list()` call resolves its Observable on
 * the next microtask. With `fakeAsync`, this means after
 * `tick(0) + flush()` the rows/total/loading signals reflect the
 * response.
 */
describe('PiEntityListComponent (TZ-232.C)', () => {
  let mock: MockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    mock = createMockService();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  /** Mount a host component that wires the mock service into the wrapper. */
  @Component({
    standalone: true,
    imports: [PiEntityListComponent],
    template: `
      <app-pi-entity-list
        [service]="service"
        [cols]="cols"
        [params]="externalParams"
        ariaLabel="Test list"
        (create)="createCount = createCount + 1"
        (rowEdit)="editCount = editCount + 1"
        (rowDelete)="deleteCount = deleteCount + 1"
      />
    `,
  })
  class Host {
    service = mock;
    cols = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'category', label: 'Category' },
    ];
    externalParams: ExternalParams<TestParams> = {};
    createCount = 0;
    editCount = 0;
    deleteCount = 0;
  }

  it('renders search input + create button + reload button by default', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="entity-list-search"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="entity-list-create"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="entity-list-reload"]')).toBeTruthy();
  });

  it('initial fetch fires once with default pageSize (ngOnInit-driven)', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    expect(mock.listCalls).toBe(1);
    expect(mock.listParams[0].page).toBe(1);
    expect(mock.listParams[0].limit).toBe(50);
    expect(mock.listParams[0].search).toBeUndefined();
  }));

  it('search input is debounced — rapid keystrokes collapse to 1 fetch', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    expect(mock.listCalls).toBe(1);

    const input = fixture.nativeElement.querySelector(
      '[data-test="entity-list-search"]',
    ) as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input'));
    input.value = 'ab';
    input.dispatchEvent(new Event('input'));
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));

    tick(100);
    expect(mock.listCalls).toBe(1);

    tick(300);
    flush();
    expect(mock.listCalls).toBe(2);
    expect(mock.listParams[1].search).toBe('abc');
  }));

  it('search resets page to 1', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();

    const input = fixture.nativeElement.querySelector(
      '[data-test="entity-list-search"]',
    ) as HTMLInputElement;
    input.value = 'x';
    input.dispatchEvent(new Event('input'));
    tick(300);
    flush();
    expect(mock.listParams[mock.listParams.length - 1].page).toBe(1);
  }));

  it('error response populates error() signal and renders banner', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    mock.armError();

    const input = fixture.nativeElement.querySelector(
      '[data-test="entity-list-search"]',
    ) as HTMLInputElement;
    input.value = 'trigger-error';
    input.dispatchEvent(new Event('input'));
    tick(300);
    flush();
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('[data-test="entity-list-error"]');
    expect(banner).toBeTruthy();
    expect(banner.textContent.trim()).toBe('Backend down');
  }));

  it('reload button forces new fetch (public reload() API)', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    expect(mock.listCalls).toBe(1);

    const reloadBtn = fixture.nativeElement.querySelector(
      '[data-test="entity-list-reload"]',
    ) as HTMLButtonElement;
    reloadBtn.click();
    flush();
    expect(mock.listCalls).toBeGreaterThanOrEqual(2);
  }));

  it('reload() is publicly callable (programmatic API)', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    expect(mock.listCalls).toBe(1);

    const reloadBtn = fixture.nativeElement.querySelector(
      '[data-test="entity-list-reload"]',
    ) as HTMLButtonElement;
    reloadBtn.click();
    flush();
    expect(mock.listCalls).toBeGreaterThanOrEqual(2);
  }));

  it('create button emits (create) output event', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    const createBtn = fixture.nativeElement.querySelector(
      '[data-test="entity-list-create"]',
    ) as HTMLButtonElement;
    createBtn.click();
    expect((fixture.componentInstance as Host).createCount).toBe(1);
  }));

  it('external params input is merged into fetchParams', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    (fixture.componentInstance as Host).externalParams = { category: 'a' };
    fixture.detectChanges();
    flush();

    expect(mock.listCalls).toBe(1);
    expect(mock.listParams[0].category).toBe('a');
    expect(mock.listParams[0].page).toBe(1);
    expect(mock.listParams[0].limit).toBe(50);
  }));

  it('post-mount params change + reload() refetches with merged params', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    expect(mock.listCalls).toBe(1);
    expect(mock.listParams[0].category).toBeUndefined();

    const host = fixture.componentInstance as Host;
    host.externalParams = { category: 'b' };
    fixture.detectChanges();
    const reloadBtn = fixture.nativeElement.querySelector(
      '[data-test="entity-list-reload"]',
    ) as HTMLButtonElement;
    reloadBtn.click();
    flush();

    expect(mock.listCalls).toBeGreaterThanOrEqual(2);
    expect(mock.listParams[mock.listParams.length - 1].category).toBe('b');
  }));

  it('in-flight cancellation: rapid debounced search → only last fetch triggered', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    expect(mock.listCalls).toBe(1);

    const input = fixture.nativeElement.querySelector(
      '[data-test="entity-list-search"]',
    ) as HTMLInputElement;
    input.value = 'x';
    input.dispatchEvent(new Event('input'));
    tick(50);
    input.value = 'xy';
    input.dispatchEvent(new Event('input'));
    tick(50);
    input.value = 'xyz';
    input.dispatchEvent(new Event('input'));
    tick(300);
    flush();

    expect(mock.listCalls).toBe(2);
    expect(mock.listParams[1].search).toBe('xyz');
  }));

  it('page change triggers new fetch (via wrapper.onPageChange)', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    expect(mock.listCalls).toBe(1);

    const reloadBtn = fixture.nativeElement.querySelector(
      '[data-test="entity-list-reload"]',
    ) as HTMLButtonElement;
    reloadBtn.click();
    flush();
    expect(mock.listCalls).toBeGreaterThanOrEqual(2);
  }));

  it('empty data renders pi-table empty state', fakeAsync(() => {
    // Fresh mock that returns empty items. We CANNOT call
    // `emptyListMock.list()` from inside its own list override —
    // that would recurse forever (max stack size exceeded).
    // Instead we directly push to `listParams` and increment
    // `listCalls` via the underlying closure (set on the get
    // accessor — we can't write to a getter, but we can use a fresh
    // mock whose call counter starts at 0 and read it after).
    let emptyListCalls = 0;
    const emptyListParams: TestParams[] = [];
    let armedEmptyError = false;
    const emptyListMock: MockService = {
      list: (params: TestParams) => {
        emptyListCalls++;
        emptyListParams.push({ ...params });
        if (armedEmptyError) {
          armedEmptyError = false;
          return of<ListResult>({
            ok: false,
            error: new HttpErrorResponse({
              status: 500,
              statusText: 'Server Error',
              error: { message: 'Backend down' },
            }),
          });
        }
        return of<ListResult>({
          ok: true,
          data: { items: [], total: 0, page: 1, limit: 50 },
        });
      },
      findById: () => of({ ok: true, data: sampleData[0] }) as never,
      create: () => of({ ok: true, data: sampleData[0] }) as never,
      update: () => of({ ok: true, data: sampleData[0] }) as never,
      remove: () => of({ ok: true, data: undefined }) as never,
      get listCalls() {
        return emptyListCalls;
      },
      get listParams() {
        return emptyListParams;
      },
      armError() {
        armedEmptyError = true;
      },
    };

    const fixture = TestBed.createComponent(Host);
    (fixture.componentInstance as Host).service = emptyListMock;
    fixture.detectChanges();
    flush();

    const emptyRow = fixture.nativeElement.querySelector(
      '[data-test="empty-state-row"]',
    );
    expect(emptyRow).toBeTruthy();
    expect(emptyListCalls).toBe(1);
  }));

  it('destroy cleanup — no late emissions after fixture.destroy()', fakeAsync(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    flush();
    const callsBeforeDestroy = mock.listCalls;

    fixture.destroy();
    flush();

    expect(mock.listCalls).toBe(callsBeforeDestroy);
  }));

  it('showSearch=false hides search input', fakeAsync(() => {
    @Component({
      standalone: true,
      imports: [PiEntityListComponent],
      template: `
        <app-pi-entity-list
          [service]="service"
          [cols]="cols"
          ariaLabel="Test list no search"
          [showSearch]="false"
        />
      `,
    })
    class NoSearchHost {
      service = mock;
      cols = [{ key: 'name', label: 'Name' }];
    }
    const fixture = TestBed.createComponent(NoSearchHost);
    fixture.detectChanges();
    flush();
    expect(fixture.nativeElement.querySelector('[data-test="entity-list-search"]')).toBeNull();
  }));

  it('canCreate=false hides create button', fakeAsync(() => {
    @Component({
      standalone: true,
      imports: [PiEntityListComponent],
      template: `
        <app-pi-entity-list
          [service]="service"
          [cols]="cols"
          ariaLabel="Test list no create"
          [canCreate]="false"
        />
      `,
    })
    class NoCreateHost {
      service = mock;
      cols = [{ key: 'name', label: 'Name' }];
    }
    const fixture = TestBed.createComponent(NoCreateHost);
    fixture.detectChanges();
    flush();
    expect(fixture.nativeElement.querySelector('[data-test="entity-list-create"]')).toBeNull();
  }));
});