import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiStudioDocumentsService } from './pi-studio-documents.service';
import type { StudioDocument } from './studio-document.types';

describe('PiStudioDocumentsService (TZ-NX-DOCSTUDIO-S2-SHELL)', () => {
  let service: PiStudioDocumentsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiStudioDocumentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const doc: StudioDocument = {
    _id: 'd1',
    name: 'КП №1',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
  };

  it('list() GETs /studio-documents', () => {
    let result: { ok: boolean; data?: unknown } | undefined;
    service.list().subscribe((res) => {
      result = res;
    });
    const req = httpMock.expectOne(`${baseUrl}/studio-documents`);
    expect(req.request.method).toBe('GET');
    req.flush([doc]);
    expect(result?.ok).toBe(true);
    expect((result as { ok: true; data: StudioDocument[] }).data).toHaveLength(1);
  });

  it('list() maps SilentResult error without throwing', () => {
    let result: { ok: boolean; error?: { status?: number } } | undefined;
    service.list().subscribe((res) => {
      result = res;
    });
    httpMock.expectOne(`${baseUrl}/studio-documents`).flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    expect(result?.ok).toBe(false);
    expect(result?.error?.status).toBe(403);
  });

  it('getById() GETs /studio-documents/:id', () => {
    service.getById('d1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/studio-documents/d1`);
    expect(req.request.method).toBe('GET');
    req.flush(doc);
  });

  it('create() POSTs /studio-documents with payload', () => {
    const payload = { name: 'Новый документ', orientation: 'portrait' as const, pageSize: 'A4' as const };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/studio-documents`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: 'd-new', ...payload, status: 'draft' });
  });

  it('update() PATCHes /studio-documents/:id with the revision gate, without clobbering other fields', () => {
    const payload = { expectedRevision: 1, orientation: 'landscape' as const };
    service.update('d1', payload).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/studio-documents/d1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...doc, revision: 2, orientation: 'landscape', name: 'КП №1', pageSize: 'A4' });
  });

  it('remove() DELETEs /studio-documents/:id', () => {
    service.remove('d1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/studio-documents/d1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});