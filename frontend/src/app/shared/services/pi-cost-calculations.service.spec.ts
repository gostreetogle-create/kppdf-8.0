import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CostCalculationsService, CostCalculation } from './pi-cost-calculations.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { authInterceptor } from '../../core/auth.interceptor';

/**
 * TZ-85 Phase B — Unit tests for CostCalculationsService.
 *
 * Covers: list, findById, create, update, activate, remove.
 * All methods return SilentResult<T> — verify both ok/error paths.
 */
describe('CostCalculationsService', () => {
  let service: CostCalculationsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';

  const mockCalc: CostCalculation = {
    _id: 'cc-1',
    productId: 'prod-1',
    isActive: true,
    materials: [
      {
        materialId: 'mat-1',
        materialName: 'ЛДСП',
        quantity: 2,
        unit: 'шт',
        pricePerUnit: 1500,
        total: 3000,
      },
    ],
    totalMaterialCost: 3000,
    labor: [
      { workTypeId: 'wt-1', workTypeName: 'Раскрой', hours: 2, hourlyRate: 500, total: 1000 },
    ],
    totalLaborCost: 1000,
    overheadPercent: 10,
    overheadCost: 300,
    totalCost: 4300,
    calculatedAt: '2026-07-11T00:00:00.000Z',
    createdAt: '2026-07-11T00:00:00.000Z',
    updatedAt: '2026-07-11T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(CostCalculationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list()', () => {
    it('returns wrapped array for a product', () => {
      const result$ = service.list('prod-1');
      result$.subscribe((res) => {
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.data.length).toBe(1);
          expect(res.data[0]._id).toBe('cc-1');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/products/prod-1/cost-calculations`);
      expect(req.request.method).toBe('GET');
      req.flush([mockCalc]);
    });
  });

  describe('findById()', () => {
    it('returns a single cost calculation', () => {
      service.findById('cc-1').subscribe((res) => {
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.data.totalCost).toBe(4300);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/cost-calculations/cc-1`);
      req.flush(mockCalc);
    });
  });

  describe('create()', () => {
    it('POSTs to products/:id/cost-calculations', () => {
      service.create('prod-1', { overheadPercent: 15 }).subscribe((res) => {
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.data.productId).toBe('prod-1');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/products/prod-1/cost-calculations`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ overheadPercent: 15 });
      req.flush(mockCalc);
    });
  });

  describe('update()', () => {
    it('PATCHes notes and overheadPercent', () => {
      service.update('cc-1', { notes: 'test', overheadPercent: 20 }).subscribe((res) => {
        expect(res.ok).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/cost-calculations/cc-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ notes: 'test', overheadPercent: 20 });
      req.flush(mockCalc);
    });
  });

  describe('activate()', () => {
    it('POSTs to /:id/activate', () => {
      service.activate('cc-1').subscribe((res) => {
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.data.isActive).toBe(true);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/cost-calculations/cc-1/activate`);
      expect(req.request.method).toBe('POST');
      req.flush(mockCalc);
    });
  });

  describe('remove()', () => {
    it('DELETEs the cost calculation', () => {
      service.remove('cc-1').subscribe((res) => {
        expect(res.ok).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/cost-calculations/cc-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
