import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiCompositionService } from './pi-composition.service';

describe('PiCompositionService (TZ-NX-REGISTRIES-COMPOSITION-DIALOG)', () => {
  let service: PiCompositionService;
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
    service = TestBed.inject(PiCompositionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getModuleTree GETs /modules/:id/tree', () => {
    service.getModuleTree('m1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/modules/m1/tree`);
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'm1', name: 'Root', kind: 'module', quantity: 1, children: [] });
  });

  it('getProductTree GETs /products/:id/tree', () => {
    service.getProductTree('p1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/products/p1/tree`);
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'p1', name: 'Root', kind: 'product', quantity: 1, children: [] });
  });

  it('addModuleCompositionLine POSTs composition endpoint', () => {
    service
      .addModuleCompositionLine('m1', { lineType: 'material', refId: 'mat1', quantity: 2 })
      .subscribe();
    const req = httpMock.expectOne(`${baseUrl}/modules/m1/composition`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('removeProductCompositionLine DELETEs composition line', () => {
    service.removeProductCompositionLine('p1', 'line1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/products/p1/composition/line1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
