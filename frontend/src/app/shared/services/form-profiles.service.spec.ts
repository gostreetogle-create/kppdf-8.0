import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { FormProfilesService, type FormProfile } from './form-profiles.service';

describe('FormProfilesService (TZ-DICT-315)', () => {
  let service: FormProfilesService;
  let httpMock: HttpTestingController;

  const sample: FormProfile = {
    _id: 'fp1',
    organizationId: 'org1',
    entity: 'product',
    size: 'M',
    visibleFieldKeys: ['name', 'kind', 'unit', 'sku', 'listPrice'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        FormProfilesService,
      ],
    });
    service = TestBed.inject(FormProfilesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list GETs /form-profiles and optional entity filter', () => {
    service.list('product').subscribe((res) => {
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.data).toEqual([sample]);
    });
    const req = httpMock.expectOne(
      (r) => r.url === 'http://test/api/form-profiles' && r.method === 'GET',
    );
    expect(req.request.params.get('entity')).toBe('product');
    req.flush([sample]);
  });

  it('getOne GETs /form-profiles/:entity/:size', () => {
    service.getOne('module', 'S').subscribe((res) => expect(res.ok).toBe(true));
    const req = httpMock.expectOne('http://test/api/form-profiles/module/S');
    expect(req.request.method).toBe('GET');
    req.flush({ ...sample, entity: 'module', size: 'S', visibleFieldKeys: ['name', 'article'] });
  });

  it('upsert PUTs visibleFieldKeys body', () => {
    const keys = ['name', 'kind', 'unit', 'sku'];
    service.upsert('product', 'M', keys).subscribe((res) => {
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.data.visibleFieldKeys).toEqual(keys);
    });
    const req = httpMock.expectOne('http://test/api/form-profiles/product/M');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ visibleFieldKeys: keys });
    req.flush({ ...sample, visibleFieldKeys: keys });
  });

  it('isLocked respects LockedRequired for product and module', () => {
    expect(service.isLocked('product', 'name')).toBe(true);
    expect(service.isLocked('product', 'sku')).toBe(false);
    expect(service.isLocked('module', 'name')).toBe(true);
    expect(service.isLocked('module', 'article')).toBe(false);
  });

  it('labelRu returns RU labels from allowlist', () => {
    expect(service.labelRu('listPrice')).toBe('Прайс');
    expect(service.labelRu('unknownKey')).toBe('unknownKey');
  });
});
