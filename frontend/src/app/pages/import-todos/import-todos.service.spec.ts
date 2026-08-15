import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { ImportTodosService } from './import-todos.service';

describe('ImportTodosService', () => {
  let service: ImportTodosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(ImportTodosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('preserves the mark-done URL and payload', () => {
    service.markDone('todo-1').subscribe();
    const request = httpMock.expectOne('/api/import-todos/todo-1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'done' });
    request.flush({ id: 'todo-1', title: 'Finish import', status: 'done' });
  });

  it('returns silent errors for a failed mark-done request', () => {
    let result: unknown;
    service.markDone('todo-1').subscribe((response) => {
      result = response;
    });
    httpMock
      .expectOne('/api/import-todos/todo-1')
      .flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    expect(result).toEqual(expect.objectContaining({ ok: false }));
  });
});
