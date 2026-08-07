import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../../core/api.tokens';
import { AuthService } from '../../../core/auth.service';
import { catalogKindHue } from './catalog-kind-oklch';
import {
  CATALOG_APPEARANCE_SETTING_KEY,
  CatalogAppearanceService,
} from './catalog-appearance.service';

describe('CatalogAppearanceService (TZ-CATALOG-331)', () => {
  let service: CatalogAppearanceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: AuthService,
          useValue: { user: () => ({ organizationId: 'org-a' }) },
        },
      ],
    });
    service = TestBed.inject(CatalogAppearanceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads organization palette and updates the shared helper', () => {
    const request = service.load();
    expect(request).toBeTruthy();
    request?.subscribe();
    const req = http.expectOne('/api/settings/catalog-appearance');
    expect(req.request.method).toBe('GET');
    req.flush({
      key: `${CATALOG_APPEARANCE_SETTING_KEY}.org-a`,
      value: { productHue: 12, moduleHue: 210, materialHue: 140, materialRawHue: 88 },
    });
    expect(catalogKindHue('product')).toBe(12);
    expect(catalogKindHue('material', 'raw')).toBe(88);
  });

  it('does not refetch the same organization after a successful load', () => {
    service.load()?.subscribe();
    http.expectOne('/api/settings/catalog-appearance').flush({ value: null });
    expect(service.load()).toBeNull();
  });
});
