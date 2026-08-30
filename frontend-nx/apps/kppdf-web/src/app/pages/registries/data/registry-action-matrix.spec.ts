import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter, type ParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { RegistryDetailPanelComponent } from '../registry-detail-panel.component';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import {
  PiMaterialsService,
  PiModulesService,
  PiProductsService,
  PiUnitsService,
  type Material,
  type ProductModule,
  type Unit,
} from '@kppdf/data-access';
import { buildRegistriesCatalogDefault } from './registries.catalog';
import {
  mockOrganizationsService,
  mockProductPassportsService,
  mockSupplyRequestsService,
} from './registries-catalog-test-mocks';
import type { MaterialRegistryDialogHost } from './material-registry-dialog-host';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';

const UNITS: Unit[] = [
  { key: 'pcs', label: 'Штука', symbol: 'шт', isActive: true, isSystem: true, sortOrder: 0 },
  { key: 'kg', label: 'Килограмм', symbol: 'кг', isActive: false, isSystem: false, sortOrder: 1 },
];

const MATERIAL: Material = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Стекло',
  article: 'STK-1',
  unit: 'м²',
  materialKind: 'raw',
};

const MODULE: ProductModule = { _id: 'mod-1', name: 'Каркас', article: 'MOD-1' };

function routeStub(): ActivatedRoute {
  const queryParamMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
  return {
    queryParamMap: queryParamMap$,
    snapshot: { get queryParamMap() { return queryParamMap$.value; } },
  } as unknown as ActivatedRoute;
}

function mockMaterialDialogHost(): MaterialRegistryDialogHost {
  return { openCreate: jest.fn(), openEdit: jest.fn() };
}

function mockCatalogDialogHost(): CatalogRegistryDialogHost {
  return {
    openModuleCreate: jest.fn(),
    openModuleEdit: jest.fn(),
    openProductCreate: jest.fn(),
    openProductEdit: jest.fn(),
  };
}

describe('registry action matrix — click effects (TZ-NX-REGISTRIES-FULL-CLOSEOUT)', () => {
  let fixture: ComponentFixture<RegistryDetailPanelComponent>;
  let toast: { success: jest.Mock; error: jest.Mock };
  let dialogOpen: jest.Mock;

  function mountCatalogKey(
    key: string,
    services: {
      units?: Partial<PiUnitsService>;
      materials?: Partial<PiMaterialsService>;
      modules?: Partial<PiModulesService>;
      products?: Partial<PiProductsService>;
    } = {},
    materialHost = mockMaterialDialogHost(),
    catalogHost = mockCatalogDialogHost(),
  ): void {
    TestBed.configureTestingModule({
      imports: [RegistryDetailPanelComponent],
      providers: [
        provideRouter([]),
        {
          provide: PiUnitsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({ ok: true, data: { items: UNITS, total: UNITS.length, page: 1, limit: 50 } }),
            ),
            update: jest.fn().mockReturnValue(
              of({ ok: true, data: { ...UNITS[1], isActive: true } }),
            ),
            ...(services.units ?? {}),
          },
        },
        {
          provide: PiMaterialsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({ ok: true, data: { items: [MATERIAL], total: 1, page: 1, limit: 25 } }),
            ),
            duplicate: jest.fn().mockReturnValue(
              of({ ok: true, data: { ...MATERIAL, _id: 'copy-1' } }),
            ),
            archive: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
            getById: jest.fn(),
            ...(services.materials ?? {}),
          },
        },
        {
          provide: PiModulesService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: [MODULE] })),
            archive: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
            getById: jest.fn(),
            ...(services.modules ?? {}),
          },
        },
        {
          provide: PiProductsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } }),
            ),
            duplicate: jest.fn(),
            archive: jest.fn(),
            getById: jest.fn(),
            ...(services.products ?? {}),
          },
        },
        { provide: ActivatedRoute, useValue: routeStub() },
        {
          provide: PiToastService,
          useValue: (toast = { success: jest.fn(), error: jest.fn() }),
        },
        {
          provide: PiDialogService,
          useValue: { open: (dialogOpen = jest.fn().mockReturnValue({ closed: () => true })) },
        },
      ],
    });

    const router = TestBed.inject(Router);
    const catalog = buildRegistriesCatalogDefault(
      TestBed.inject(PiUnitsService),
      TestBed.inject(PiMaterialsService),
      TestBed.inject(PiModulesService),
      TestBed.inject(PiProductsService),
      mockSupplyRequestsService(),
      mockOrganizationsService(),
      mockProductPassportsService(),
      router,
      materialHost,
      catalogHost,
    );
    const definition = catalog.find((d) => d.key === key)!;
    fixture = TestBed.createComponent(RegistryDetailPanelComponent);
    fixture.componentRef.setInput('definition', definition);
  }

  it('units: activate click PATCHes isActive and shows success toast', fakeAsync(() => {
    mountCatalogKey('units');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const unitsService = TestBed.inject(PiUnitsService);
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('[data-test="registry-row-action-activate"]'),
    ) as HTMLButtonElement[];
    const btn = buttons.find((b) => !b.disabled);
    if (!btn) throw new Error('expected enabled activate button');
    btn.click();
    tick();

    expect(unitsService.update).toHaveBeenCalledWith('kg', { isActive: true });
    expect(toast.success).toHaveBeenCalledWith('Единица активирована');
  }));

  it('units: copy-key click notifies success without API delete action present', fakeAsync(() => {
    mountCatalogKey('units');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      '[data-test="registry-row-action-copy-key"]',
    ) as HTMLButtonElement;
    btn.click();
    tick();
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Ключ'));
    expect(fixture.nativeElement.querySelector('[data-test="registry-row-action-delete"]')).toBeNull();
  }));

  it('materials: create toolbar opens dialog host', fakeAsync(() => {
    const host = mockMaterialDialogHost();
    mountCatalogKey('materials', {}, host);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-test="registry-create"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Создать материал');
    btn.click();
    tick();
    expect(host.openCreate).toHaveBeenCalled();
  }));

  it('materials: copy click calls duplicate API and reloads via notify success', fakeAsync(() => {
    mountCatalogKey('materials');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const materials = TestBed.inject(PiMaterialsService);
    const btn = fixture.nativeElement.querySelector(
      '[data-test="registry-row-action-copy-material"]',
    ) as HTMLButtonElement;
    btn.click();
    tick();

    expect(materials.duplicate).toHaveBeenCalledWith(MATERIAL._id);
    expect(toast.success).toHaveBeenCalledWith('Копия создана');
  }));

  it('materials: edit click opens dialog with row payload', fakeAsync(() => {
    const host = mockMaterialDialogHost();
    mountCatalogKey('materials', {}, host);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      '[data-test="registry-row-action-edit-material"]',
    ) as HTMLButtonElement;
    btn.click();
    tick();
    expect(host.openEdit).toHaveBeenCalledWith(
      expect.objectContaining({ _id: MATERIAL._id }),
      expect.any(Object),
      expect.any(Object),
    );
  }));

  it('modules: edit click opens module dialog host', fakeAsync(() => {
    const host = mockCatalogDialogHost();
    mountCatalogKey('modules', {}, mockMaterialDialogHost(), host);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      '[data-test="registry-row-action-edit-module"]',
    ) as HTMLButtonElement;
    btn.click();
    tick();
    expect(host.openModuleEdit).toHaveBeenCalledWith(
      expect.objectContaining({ _id: MODULE._id }),
      expect.any(Object),
      false,
    );
  }));

  it('modules: open-composition click opens dialog in composition mode', fakeAsync(() => {
    const host = mockCatalogDialogHost();
    mountCatalogKey('modules', {}, mockMaterialDialogHost(), host);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      '[data-test="registry-row-action-open-composition"]',
    ) as HTMLButtonElement;
    btn.click();
    tick();
    expect(host.openModuleEdit).toHaveBeenCalledWith(
      expect.objectContaining({ _id: MODULE._id }),
      expect.any(Object),
      true,
    );
  }));

  it('departments: archive click opens confirm dialog before mutating fixture', fakeAsync(() => {
    mountCatalogKey('departments');
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();

    const retry = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b) =>
      (b as HTMLButtonElement).textContent?.includes('Повторить'),
    ) as HTMLButtonElement;
    retry?.click();
    tick(500);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      '[data-test="registry-row-action-archive"]',
    ) as HTMLButtonElement;
    btn.click();
    tick();
    expect(dialogOpen).toHaveBeenCalled();
  }));
});
