import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiPhotosService } from './pi-photos.service';

describe('PiPhotosService (TZ-NX-PHOTO-P0)', () => {
  let service: PiPhotosService;
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

    service = TestBed.inject(PiPhotosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('upload() posts multipart with field `file` to /photos/upload', () => {
    const file = new File(['image'], 'front.jpg', { type: 'image/jpeg' });
    service.upload(file).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/photos/upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('file')).not.toBeNull();
    req.flush({ _id: 'p1', storageUrl: '/uploads/p1.jpg' });
  });

  it('get() hits /photos/:id', () => {
    service.get('p1').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/photos/p1`);
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'p1', storageUrl: '/uploads/p1.jpg' });
  });

  it('remove() deletes /photos/:id', () => {
    service.remove('p1').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/photos/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('updateFrame() patches /photos/:id/frame with partial merge payload', () => {
    service.updateFrame('p1', { fit: 'cover', posX: 30 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/photos/p1/frame`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ frame: { fit: 'cover', posX: 30 } });
    req.flush({ _id: 'p1', storageUrl: '/uploads/p1.jpg' });
  });
});
