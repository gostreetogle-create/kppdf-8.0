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
import { PhotosService } from '../../shared/services/photos.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';
import { ProductBomPanelComponent } from '../../shared/ui/composition/product-bom-panel.component';
import { CatalogReturnStore } from '../../shared/navigation/catalog-return.util';

async function tickMicrotask(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 0));
}

function flushDictionaryLabels(httpMock: HttpTestingController): void {
  const requests = httpMock.match(
    (request) =>
      request.method === 'GET' && request.urlWithParams.startsWith('/api/dictionary-labels'),
  );
  for (const request of requests) request.flush([]);
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
          provide: PhotosService,
          useValue: {
            uploadWithProgress: jest.fn(),
            remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
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
    const whereUsed = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.urlWithParams.startsWith('/api/modules/mod-1/where-used'),
    );
    expect(whereUsed.request.params.get('limit')).toBe('50');
    whereUsed.flush({
      items: [
        {
          id: 'prod-1',
          kind: 'product',
          name: 'Горка',
          relation: 'module',
          quantity: 2,
          unit: 'шт',
        },
        {
          id: 'mod-2',
          kind: 'module',
          name: 'Каркас усиленный',
          relation: 'module',
          quantity: 1,
          unit: 'шт',
        },
      ],
      total: 2,
      page: 1,
      limit: 50,
    });
    await tickMicrotask();
    fixture.detectChanges();
    // composition-tree / catalog kind colors may request appearance settings
    const appearance = httpMock.match('/api/settings/catalog-appearance');
    for (const req of appearance) req.flush({});
    await tickMicrotask();
    fixture.detectChanges();
    flushDictionaryLabels(httpMock);
    await tickMicrotask();
    fixture.detectChanges();
    flushDictionaryLabels(httpMock);
    await tickMicrotask();
    fixture.detectChanges();
  });

  afterEach(() => {
    flushDictionaryLabels(httpMock);
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

  it('shows file dropzone and keeps URL as a secondary collapsed path', () => {
    const page = fixture.componentInstance as unknown as {
      openPhotos: { set: (v: boolean) => void };
    };
    page.openPhotos.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="module-photo-upload"]')).toBeTruthy();
    expect(el.querySelector('[data-test="photo-dropzone"]')).toBeTruthy();
    expect(el.textContent).toContain('Добавить по ссылке');
  });

  it('opens the module hero photo through the shared lightbox', () => {
    const dialog = TestBed.inject(PiDialogService) as unknown as { open: jest.Mock };
    const page = fixture.componentInstance as unknown as {
      openPhotoUrl: (src: string, label: string) => void;
    };

    page.openPhotoUrl('/uploads/module.jpg', 'Каркас');

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: { src: '/uploads/module.jpg', alt: 'Каркас', filename: 'Каркас' },
      }),
    );
  });

  it('shows where-used above BOM with rows and links (TZ-UX-444B)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('[data-test="module-where-used"]') as HTMLElement;
    expect(section).toBeTruthy();
    expect(section.textContent).toContain('Где используется');
    expect(section.textContent).toContain('Горка');
    expect(section.textContent).toContain('Товар');
    expect(section.textContent).toContain('Каркас усиленный');
    expect(section.textContent).toContain('Модуль');
    const links = Array.from(section.querySelectorAll('a'));
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toContain('/products/prod-1');
    expect(links[1].getAttribute('href')).toContain('/modules/mod-2');
  });

  it('shows RU empty state when where-used has no items (TZ-UX-444B)', async () => {
    const page = fixture.componentInstance as unknown as {
      whereUsedRes: { reload: () => unknown };
    };
    page.whereUsedRes.reload();
    fixture.detectChanges();
    await tickMicrotask();
    fixture.detectChanges();
    const whereUsedEmpty = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.urlWithParams.startsWith('/api/modules/mod-1/where-used'),
    );
    whereUsedEmpty.flush({ items: [], total: 0, page: 1, limit: 50 });
    await tickMicrotask();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('[data-test="module-where-used"]') as HTMLElement;
    expect(section.textContent).toContain('Этот модуль пока не используется');
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
