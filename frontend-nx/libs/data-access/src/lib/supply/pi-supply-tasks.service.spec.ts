import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiSupplyTasksService } from './pi-supply-tasks.service';

describe('PiSupplyTasksService (NX S1)', () => {
  let service: PiSupplyTasksService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(PiSupplyTasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists tasks with orderId and status params', () => {
    service.list({ orderId: 'o1', status: 'confirmed' }).subscribe();

    const request = httpMock.expectOne((req) => req.url === `${baseUrl}/supply-tasks`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('orderId')).toBe('o1');
    expect(request.request.params.get('status')).toBe('confirmed');
    request.flush([]);
  });

  it('lists with no params when none are given', () => {
    service.list().subscribe();
    const request = httpMock.expectOne(`${baseUrl}/supply-tasks`);
    expect(request.request.params.keys().length).toBe(0);
    request.flush([]);
  });

  it('creates a task through the existing endpoint', () => {
    const payload = { orderId: 'o1', title: 'Профиль 40x40', qty: 12 };
    service.create(payload).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/supply-tasks`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: 't1', orderId: 'o1', title: 'Профиль 40x40', qty: 12, status: 'draft' });
  });

  it('explodes tasks from an order composition', () => {
    service.explode({ orderId: 'o1' }).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/supply-tasks/explode`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ orderId: 'o1' });
    request.flush({ created: [], skipped: 0 });
  });

  it('confirms a task', () => {
    service.confirm('t1').subscribe();
    const request = httpMock.expectOne(`${baseUrl}/supply-tasks/t1/confirm`);
    expect(request.request.method).toBe('POST');
    request.flush({ _id: 't1', status: 'confirmed' });
  });

  it('marks a task ordered', () => {
    service.markOrdered('t1').subscribe();
    const request = httpMock.expectOne(`${baseUrl}/supply-tasks/t1/ordered`);
    expect(request.request.method).toBe('POST');
    request.flush({ _id: 't1', status: 'ordered' });
  });

  it('marks a task received', () => {
    service.markReceived('t1').subscribe();
    const request = httpMock.expectOne(`${baseUrl}/supply-tasks/t1/received`);
    expect(request.request.method).toBe('POST');
    request.flush({ _id: 't1', status: 'received' });
  });

  it('removes a task', () => {
    service.remove('t1').subscribe();
    const request = httpMock.expectOne(`${baseUrl}/supply-tasks/t1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
