import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ModuleDetailPage } from './module-detail.page';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { ProductModulePhotosService } from '../../shared/services/pi-product-module-photos.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';
import { ProductBomPanelComponent } from '../products/product-bom-panel.component';
import { CatalogReturnStore } from '../../shared/navigation/catalog-return.util';

async function tickMicrotask(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 0));
}

describe('ModuleDetailPage (TZ-CATALOG-336)', () => {
  let fixture: ComponentFixture<ModuleDetailPage>;
  let httpMock: HttpTestingController;

  const moduleBody = {
    _id: 'mod-1',
    name: 'Каркас',
    article: 'KR-01',
    dimensions: { width: 100, height: 50, depth: 20, unit: 'мм' },
    weight: 12,
    workTypes: [{ workTypeId: { _id: 'wt1', name: 'Сварка' }, estimatedHours: 2, sortOrder: 1 }],
    materials: [],
    composition: [],
  };

  const costBody = {
    materialCost: 10,
    laborCost: 5,
    totalCost: 15,
    currency: 'RUB' as const,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleDetailPage],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (k: string) => (k === 'id' ? 'mod-1' : null) }),
            snapshot: { paramMap: { get: (k: string) => (k === 'id' ? 'mod-1' : null) } },
          },
        },
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: ProductModulesService,
          useValue: {
            remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
            getModuleTree: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: {
                  _id: 'mod-1',
                  name: 'Каркас',
                  kind: 'module',
                  quantity: 1,
                  children: [],
                },
              }),
            ),
            getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
            getCostPreview: jest.fn().mockReturnValue(of({ ok: true, data: costBody })),
            addModuleCompositionLine: jest.fn(),
            updateModuleCompositionLine: jest.fn(),
            removeModuleCompositionLine: jest.fn(),
          },
        },
        {
          provide: ProductModulePhotosService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
            attach: jest.fn(),
            setMain: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: MaterialsService,
          useValue: { findById: jest.fn().mockReturnValue(of({ ok: true, data: {} })) },
        },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ModuleDetailPage);
    fixture.detectChanges();

    httpMock.expectOne('/api/modules/mod-1').flush(moduleBody);
    httpMock.expectOne('/api/modules/mod-1/cost-preview').flush(costBody);
    await tickMicrotask();
    fixture.detectChanges();
    // composition-tree / catalog kind colors may request appearance settings
    const appearance = httpMock.match('/api/settings/catalog-appearance');
    for (const req of appearance) req.flush({});
    await tickMicrotask();
    fixture.detectChanges();
  });

  afterEach(() => {
    const leftover = httpMock.match(() => true);
    for (const req of leftover) req.flush({});
    httpMock.verify();
  });

  it('renders A+ split layout (left passport, right BOM) without showcase sheet', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="module-detail-layout"]')).toBeTruthy();
    expect(el.querySelector('[data-test="module-detail-aside"]')).toBeTruthy();
    expect(el.querySelector('[data-test="module-composition-panel"]')).toBeTruthy();
    expect(el.querySelector('[data-test="module-showcase"]')).toBeNull();
    expect(el.querySelector('[data-test="module-title"]')?.textContent).toContain('Каркас');
    expect(el.querySelector('[data-test="module-composition-editor"]')).toBeNull();
  });

  it('shows cost-preview in Себестоимость accordion (FactCards, not hero tiles)', () => {
    const page = fixture.componentInstance as unknown as {
      openCost: { set: (v: boolean) => void };
    };
    page.openCost.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="module-hero-cost"]')).toBeNull();
    expect(el.querySelector('[data-test="module-hero-dims"]')).toBeTruthy();
    expect(el.querySelector('[data-test="module-cost-total"]')?.textContent).toMatch(/15/);
    expect(el.querySelector('[data-test="module-cost-panel"]')).toBeTruthy();
  });

  it('passes rootKind=module to BOM panel', () => {
    const panelDe = fixture.debugElement.query(By.directive(ProductBomPanelComponent));
    expect(panelDe).toBeTruthy();
    const panel = panelDe.componentInstance as ProductBomPanelComponent;
    expect(panel.rootKind()).toBe('module');
    expect(panel.productId()).toBe('mod-1');
  });

  it('onBack uses CatalogReturnStore (TZ-UX-313)', () => {
    const store = TestBed.inject(CatalogReturnStore);
    const spy = jest.spyOn(store, 'navigateBackOr');
    store.setPreviousUrlForTests('/products');
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { onBack: () => void }).onBack();
    expect(spy).toHaveBeenCalledWith('/modules');
    expect((fixture.componentInstance as unknown as { backLabel: () => string }).backLabel()).toBe(
      '← Назад',
    );
  });
});
