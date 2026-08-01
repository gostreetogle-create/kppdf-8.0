import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { DocumentTemplatesService } from './pi-document-templates.service';

describe('DocumentTemplatesService', () => {
  let svc: DocumentTemplatesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        DocumentTemplatesService,
      ],
    });
    svc = TestBed.inject(DocumentTemplatesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() wraps raw array as { items, total } envelope', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(2);
        expect(res.data.items[0].name).toBe('Договор поставки (стандарт)');
        expect(res.data.items[1].isDefault).toBe(true);
      }
    });
    const req = httpMock.expectOne('http://test/api/document-templates');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        _id: 'dt1',
        name: 'Договор поставки (стандарт)',
        tags: ['договор', 'поставка'],
        organizationId: 'org1',
        docTypeId: 'doc-contract',
        isDefault: false,
        isActive: true,
        pageSize: 'A4',
        backgroundImage: [],
        backgroundOpacity: 0.3,
        version: 1,
      },
      {
        _id: 'dt2',
        name: 'КП по умолчанию',
        tags: ['КП'],
        organizationId: 'org1',
        docTypeId: 'doc-kp',
        isDefault: true,
        isActive: true,
        pageSize: 'A4',
        backgroundImage: ['/uploads/document-templates/dt2/logo.png'],
        backgroundOpacity: 0.4,
        version: 2,
      },
    ]);
  });

  it('findById() returns DocumentTemplate by id', () => {
    svc.findById('dt1').subscribe((res) => {
      if (res.ok) expect(res.data.name).toBe('Договор поставки (стандарт)');
    });
    const req = httpMock.expectOne('http://test/api/document-templates/dt1');
    expect(req.request.method).toBe('GET');
    req.flush({
      _id: 'dt1',
      name: 'Договор поставки (стандарт)',
      tags: ['договор'],
      organizationId: 'org1',
      docTypeId: 'doc-contract',
      isDefault: false,
      isActive: true,
      pageSize: 'A4',
      backgroundImage: [],
      backgroundOpacity: 0.3,
      version: 1,
    });
  });

  it('create() POSTs payload with required organizationId + docTypeId', () => {
    const payload = {
      name: 'Новый шаблон',
      organizationId: 'org1',
      docTypeId: 'doc-contract',
    };
    svc.create(payload as never).subscribe((res) => {
      if (res.ok) expect(res.data.name).toBe('Новый шаблон');
    });
    const req = httpMock.expectOne('http://test/api/document-templates');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      _id: 'dt3',
      ...payload,
      tags: [],
      isDefault: false,
      isActive: true,
      pageSize: 'A4',
      backgroundImage: [],
      backgroundOpacity: 0.3,
      version: 1,
    });
  });

  it('covers setup and action endpoints through the SilentResult boundary', () => {
    svc.listOrganizations().subscribe((res) => expect(res.ok).toBe(true));
    const listOrganizations = httpMock.expectOne('http://test/api/organizations?limit=1');
    expect(listOrganizations.request.method).toBe('GET');
    listOrganizations.flush({ items: [] });

    svc.listDocTypes().subscribe((res) => expect(res.ok).toBe(true));
    const listTypes = httpMock.expectOne('http://test/api/doc-types');
    expect(listTypes.request.method).toBe('GET');
    listTypes.flush([]);

    svc.createOrganization({ name: 'Org', shortName: 'Org', isActive: true }).subscribe();
    const createOrg = httpMock.expectOne('http://test/api/organizations');
    expect(createOrg.request.method).toBe('POST');
    createOrg.flush({ _id: 'org1', name: 'Org' });

    svc.createDocType({ name: 'КП', slug: 'kp', description: 'КП', isActive: true }).subscribe();
    const createType = httpMock.expectOne('http://test/api/doc-types');
    expect(createType.request.method).toBe('POST');
    createType.flush({ _id: 'type1', name: 'КП' });

    svc.setDefault('dt1').subscribe();
    const setDefault = httpMock.expectOne('http://test/api/document-templates/dt1/set-default');
    expect(setDefault.request.method).toBe('POST');
    setDefault.flush(null);

    svc.duplicate('dt1').subscribe();
    const duplicate = httpMock.expectOne('http://test/api/document-templates/dt1/duplicate');
    expect(duplicate.request.method).toBe('POST');
    duplicate.flush({ _id: 'dt4', name: 'Копия' });
  });

  it('build() POSTs sourceIds and returns rendered HTML string', () => {
    const dummyHtml = '<!DOCTYPE html><html><body><h2>Договор №123</h2></body></html>';
    svc.build('dt1', { organizationId: 'org1', counterpartyId: 'cp1' }).subscribe((res) => {
      if (res.ok) expect(res.data).toBe(dummyHtml);
    });
    const req = httpMock.expectOne('http://test/api/document-templates/dt1/build');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ organizationId: 'org1', counterpartyId: 'cp1' });
    expect(req.request.responseType).toBe('text');
    req.flush(dummyHtml);
  });

  it('uploadBackground() POSTs FormData multipart to /:id/upload-background', () => {
    const blob = new Blob(['fake-image-bytes'], { type: 'image/png' });
    const file = new File([blob], 'letterhead.png', { type: 'image/png' });
    svc.uploadBackground('dt1', file).subscribe((res) => {
      if (res.ok) {
        expect(res.data.url).toBe('/uploads/document-templates/dt1/abc.png');
        expect(res.data.backgroundImage.length).toBe(1);
      }
    });
    const req = httpMock.expectOne('http://test/api/document-templates/dt1/upload-background');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    const form = req.request.body as FormData;
    expect(form.get('file')).toBeTruthy();
    expect((form.get('file') as File).name).toBe('letterhead.png');
    req.flush({
      url: '/uploads/document-templates/dt1/abc.png',
      backgroundImage: ['/uploads/document-templates/dt1/abc.png'],
    });
  });

  it('remove() DELETEs /:id', () => {
    svc.remove('dt1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/document-templates/dt1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
