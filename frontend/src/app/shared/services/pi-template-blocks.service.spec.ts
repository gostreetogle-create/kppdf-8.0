import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { TemplateBlocksService } from './pi-template-blocks.service';

describe('TemplateBlocksService', () => {
  let svc: TemplateBlocksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        TemplateBlocksService,
      ],
    });
    svc = TestBed.inject(TemplateBlocksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listByTemplate() GETs /template-blocks?templateId=', () => {
    svc.listByTemplate('tpl-1').subscribe((res) => {
      if (res.ok) expect(res.data.length).toBe(1);
    });
    const req = httpMock.expectOne('http://test/api/template-blocks?templateId=tpl-1');
    expect(req.request.method).toBe('GET');
    req.flush([
      { _id: 'b1', templateId: 'tpl-1', type: 'text', order: 0, showLine: false, isActive: true },
    ]);
  });

  it('add() POSTs to /document-templates/:id/blocks (templateId from URL)', () => {
    svc
      .add('tpl-1', { type: 'text', order: 0, showLine: false, isActive: true })
      .subscribe((res) => {
        if (res.ok) expect(res.data._id).toBe('b2');
      });
    const req = httpMock.expectOne('http://test/api/document-templates/tpl-1/blocks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ type: 'text', order: 0, showLine: false, isActive: true });
    req.flush({
      _id: 'b2',
      templateId: 'tpl-1',
      type: 'text',
      order: 0,
      showLine: false,
      isActive: true,
    });
  });

  it('update() PATCHes /template-blocks/:id', () => {
    svc
      .update('b1', { settings: { imageUrl: '/uploads/template-blocks/b1/a.png' } })
      .subscribe((res) => {
        if (res.ok) expect(res.data._id).toBe('b1');
      });
    const req = httpMock.expectOne('http://test/api/template-blocks/b1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      settings: { imageUrl: '/uploads/template-blocks/b1/a.png' },
    });
    req.flush({ _id: 'b1', settings: { imageUrl: '/uploads/template-blocks/b1/a.png' } });
  });

  it('uploadImage() POSTs FormData multipart to /template-blocks/:id/image (TZ-DOC-333)', () => {
    const blob = new Blob(['fake-image-bytes'], { type: 'image/png' });
    const file = new File([blob], 'photo.png', { type: 'image/png' });
    svc.uploadImage('b1', file).subscribe((res) => {
      if (res.ok) {
        expect(res.data.url).toBe('/uploads/template-blocks/b1/abc.png');
      }
    });
    const req = httpMock.expectOne('http://test/api/template-blocks/b1/image');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    const form = req.request.body as FormData;
    expect(form.get('file')).toBeTruthy();
    expect((form.get('file') as File).name).toBe('photo.png');
    req.flush({ url: '/uploads/template-blocks/b1/abc.png' });
  });

  it('remove() DELETEs /template-blocks/:id', () => {
    svc.remove('b1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/template-blocks/b1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
