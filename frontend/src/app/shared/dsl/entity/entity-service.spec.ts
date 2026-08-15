import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { defineEntity, paramsToHttpParams } from './entity-service';

/**
 * Local fixture entity — the shared DSL spec must stay page-neutral and must
 * not import a page-domain model (`pages/users`). Mirrors the users entity
 * contract (`endpoint: '/users'`, `idKey: '_id'`) so the typed CRUD
 * assertions below remain identical to the real page usage.
 */
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

const Users = defineEntity<User>({
  endpoint: '/users',
  idKey: '_id',
});

/**
 * Tests live under jest workers where `beforeEach` is NOT an Angular
 * injection context — calling `inject(...)` directly from `beforeEach`
 * throws NG0203. The shared `inCtx` helper wraps calls in
 * `runInInjectionContext(TestBed.inject(Injector), fn)` so the inner
 * `Users.inject()` runs inside an authentic injector. Same pattern as
 * `shared/util/lookup-table.spec.ts:14-16`.
 */
function inCtx<T>(fn: () => T): T {
  return runInInjectionContext(TestBed.inject(Injector), fn);
}

describe('paramsToHttpParams', () => {
  it('drops null / undefined / empty-string values silently', () => {
    const params = paramsToHttpParams({ a: null, b: undefined, c: '', d: 'x' });
    expect(params.has('a')).toBe(false);
    expect(params.has('b')).toBe(false);
    expect(params.has('c')).toBe(false);
    expect(params.get('d')).toBe('x');
  });

  it('serializes scalars through String(value)', () => {
    const params = paramsToHttpParams({ page: 1, limit: 50, active: true });
    expect(params.get('page')).toBe('1');
    expect(params.get('limit')).toBe('50');
    expect(params.get('active')).toBe('true');
  });

  it('serializes arrays as multiple keys (NestJS-friendly)', () => {
    const params = paramsToHttpParams({ roles: ['admin', 'manager'] });
    expect(params.getAll('roles')).toEqual(['admin', 'manager']);
  });

  it('drops empty arrays', () => {
    const params = paramsToHttpParams({ roles: [] });
    expect(params.has('roles')).toBe(false);
  });

  it('handles an empty input object', () => {
    const params = paramsToHttpParams({});
    expect(params.keys().length).toBe(0);
  });
});

describe('defineEntity: Users (canonical 5-method, default idKey, leading-slash endpoint)', () => {
  let httpMock: HttpTestingController;
  let users: ReturnType<typeof Users.inject>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    users = inCtx(() => Users.inject());
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('list() GETs /api/users with encoded query params', async () => {
    const resPromise = firstValueFrom(
      users.list({ page: 1, limit: 50, search: 'bob', role: 'admin' }),
    );
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === '/api/users');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('50');
    expect(req.request.params.get('search')).toBe('bob');
    expect(req.request.params.get('role')).toBe('admin');
    req.flush({
      items: [{ _id: 'u1', username: 'Bob', email: 'bob@x', role: 'admin' }],
      total: 1,
      page: 1,
      limit: 50,
    });
    const res = await resPromise;
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.items).toHaveLength(1);
      expect(res.data.items[0]!._id).toBe('u1');
      expect(res.data.items[0]!.username).toBe('Bob');
      expect(res.data.total).toBe(1);
      expect(res.data.page).toBe(1);
      expect(res.data.limit).toBe(50);
    }
  });

  it('list() drops undefined params (no empty ?search=)', async () => {
    const resPromise = firstValueFrom(
      users.list({
        page: 1,
        limit: 50,
        search: undefined,
        role: undefined,
      }),
    );
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === '/api/users');
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.has('role')).toBe(false);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
    await resPromise;
  });

  it('findById() GETs /api/users/:id', async () => {
    const resPromise = firstValueFrom(users.findById('u1'));
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === '/api/users/u1');
    req.flush({ _id: 'u1', username: 'Bob', email: 'bob@x', role: 'admin' });
    const res = await resPromise;
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data._id).toBe('u1');
      expect(res.data.username).toBe('Bob');
    }
  });

  it('create() POSTs payload to /api/users', async () => {
    const payload: Partial<User> = {
      username: 'Bob',
      email: 'bob@x',
      role: 'admin',
    };
    const resPromise = firstValueFrom(users.create(payload));
    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === '/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: 'u1', ...payload });
    const res = await resPromise;
    expect(res.ok).toBe(true);
  });

  it('update() PATCHes /api/users/:id with payload', async () => {
    const payload: Partial<User> = { role: 'manager' };
    const resPromise = firstValueFrom(users.update('u1', payload));
    const req = httpMock.expectOne((r) => r.method === 'PATCH' && r.url === '/api/users/u1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: 'u1', username: 'Bob', email: 'bob@x', role: 'manager' });
    await resPromise;
  });

  it('remove() DELETEs /api/users/:id and returns ok:true on null body', async () => {
    const resPromise = firstValueFrom(users.remove('u1'));
    const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url === '/api/users/u1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    const res = await resPromise;
    expect(res.ok).toBe(true);
  });

  it('returns ok=false with HttpErrorResponse 4xx on failing GET', async () => {
    const resPromise = firstValueFrom(users.findById('u-missing'));
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === '/api/users/u-missing');
    req.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
    const res = await resPromise;
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error instanceof HttpErrorResponse).toBe(true);
      expect(res.error.status).toBe(404);
    }
  });

  it('exposes schema.idKey of "_id" (default)', () => {
    expect(Users.schema.idKey).toBe('_id');
    expect(Users.schema.endpoint).toBe('/users');
  });
});

describe('defineEntity: bare-config defaults (singleton + slash normalization)', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('returns the same singleton service across separate inject() calls', () => {
    interface Thing {
      _id: string;
      name: string;
    }
    const Things = defineEntity<Thing>({ endpoint: 'singleton-things' });
    const a = inCtx(() => Things.inject());
    const b = inCtx(() => Things.inject());
    expect(a).toBe(b);
  });

  it('defaults idKey to "_id" when not specified (list)', async () => {
    interface Thing {
      _id: string;
      name: string;
    }
    const Things = defineEntity<Thing>({ endpoint: 'things' });
    const things = inCtx(() => Things.inject());
    const resPromise = firstValueFrom(things.list({ page: 1, limit: 10 }));
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === '/api/things');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({
      items: [{ _id: 't1', name: 'one' }],
      total: 1,
      page: 1,
      limit: 10,
    });
    await resPromise;
  });

  it('defaults idKey to "_id" when not specified (findById URL)', async () => {
    interface Thing {
      _id: string;
      name: string;
    }
    const Things = defineEntity<Thing>({ endpoint: 'things' });
    const things = inCtx(() => Things.inject());
    const resPromise = firstValueFrom(things.findById('t1'));
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === '/api/things/t1');
    req.flush({ _id: 't1', name: 'one' });
    await resPromise;
  });

  it('collapses duplicate leading slashes on endpoint gracefully', async () => {
    interface Thing {
      _id: string;
      name: string;
    }
    const Things = defineEntity<Thing>({ endpoint: '///things' });
    const things = inCtx(() => Things.inject());
    const resPromise = firstValueFrom(things.list({ page: 1, limit: 10 }));
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === '/api/things');
    req.flush({ items: [], total: 0, page: 1, limit: 10 });
    await resPromise;
  });

  it('collapses trailing slashes on endpoint gracefully', async () => {
    interface Thing {
      _id: string;
      name: string;
    }
    const Things = defineEntity<Thing>({ endpoint: 'things///' });
    const things = inCtx(() => Things.inject());
    const resPromise = firstValueFrom(things.list({ page: 1, limit: 10 }));
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === '/api/things');
    req.flush({ items: [], total: 0, page: 1, limit: 10 });
    await resPromise;
  });
});
