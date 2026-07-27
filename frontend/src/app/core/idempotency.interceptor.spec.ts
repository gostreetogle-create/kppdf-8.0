import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { idempotencyInterceptor } from './idempotency.interceptor';

const mockUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

beforeEach(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: mockUUID },
    writable: true,
    configurable: true,
  });
});

describe('idempotencyInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([idempotencyInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('generates Idempotency-Key header for POST', () => {
    http.post('/api/items', { name: 'test' }).subscribe((res) => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne((r) => r.url === '/api/items' && r.method === 'POST');
    expect(req.request.headers.has('Idempotency-Key')).toBe(true);
    expect(typeof req.request.headers.get('Idempotency-Key')).toBe('string');
    req.flush({ id: '1' });
  });

  it('does not add Idempotency-Key to GET requests', () => {
    http.get('/api/items').subscribe((res) => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne((r) => r.url === '/api/items' && r.method === 'GET');
    expect(req.request.headers.has('Idempotency-Key')).toBe(false);
    req.flush({ items: [] });
  });

  it('does not overwrite existing Idempotency-Key header', () => {
    http
      .post('/api/items', { name: 'test' }, { headers: { 'Idempotency-Key': 'existing-key' } })
      .subscribe((res) => {
        expect(res).toBeTruthy();
      });
    const req = httpMock.expectOne((r) => r.url === '/api/items' && r.method === 'POST');
    expect(req.request.headers.get('Idempotency-Key')).toBe('existing-key');
    req.flush({ id: '1' });
  });

  it('generates Idempotency-Key for PATCH requests', () => {
    http.patch('/api/items/1', { name: 'updated' }).subscribe((res) => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne((r) => r.url === '/api/items/1' && r.method === 'PATCH');
    expect(req.request.headers.has('Idempotency-Key')).toBe(true);
    req.flush({ id: '1' });
  });

  it('generates Idempotency-Key for DELETE requests', () => {
    http.delete('/api/items/1').subscribe((res) => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne((r) => r.url === '/api/items/1' && r.method === 'DELETE');
    expect(req.request.headers.has('Idempotency-Key')).toBe(true);
    req.flush({});
  });
});
