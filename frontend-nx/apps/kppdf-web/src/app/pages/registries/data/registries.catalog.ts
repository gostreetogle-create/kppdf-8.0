import { inject, InjectionToken, DestroyRef, Injector, type Provider } from '@angular/core';
import { Router } from '@angular/router';
import { PiDialogService } from '@kppdf/ui/dialog';
import {
  PiMaterialsService,
  PiModulesService,
  PiOrganizationsService,
  PiProductPassportsService,
  PiProductsService,
  PiSupplyRequestsService,
  PiUnitsService,
} from '@kppdf/data-access';
import { collectPageRoutePaths } from '../../../layout/route-paths';
import type { RegistryDefinition, RegistryRow } from '../model/registry.types';
import { createCatalogRegistryDialogHost } from './catalog-registry-dialog-host';
import { createDetailsRegistry } from './details.registry';
import { createMaterialRegistryDialogHost } from './material-registry-dialog-host';
import { createMaterialsRegistry, type MaterialRegistryDeps } from './materials.registry';
import { createModulesRegistry, type ModuleRegistryDeps } from './modules.registry';
import { createProductsRegistry, type ProductRegistryDeps } from './products.registry';
import { createSupplyRequestsRegistry } from './supply-requests.registry';
import { createOrganizationsRegistry } from './organizations.registry';
import { createProductPassportsRegistry } from './product-passports.registry';
import { createUnitsRegistry } from './units.registry';
import { DEPARTMENTS_REGISTRY } from './departments.registry';

export function buildMaterialRegistryDeps(
  materialsService: PiMaterialsService,
  router: Router,
  dialogHost: MaterialRegistryDeps['dialogHost'],
): MaterialRegistryDeps {
  return {
    materialsService,
    router,
    existingPaths: collectPageRoutePaths(router.config ?? []),
    dialogHost,
  };
}

export function buildModuleRegistryDeps(
  modulesService: PiModulesService,
  catalogDialogHost: ModuleRegistryDeps['dialogHost'],
): ModuleRegistryDeps {
  return {
    modulesService,
    dialogHost: catalogDialogHost,
  };
}

export function buildProductRegistryDeps(
  productsService: PiProductsService,
  router: Router,
  catalogDialogHost: ProductRegistryDeps['dialogHost'],
): ProductRegistryDeps {
  return {
    productsService,
    router,
    existingPaths: collectPageRoutePaths(router.config ?? []),
    dialogHost: catalogDialogHost,
  };
}

/** Default catalog: catalog + supply/org/passport API registries + Departments (fixture). */
export function buildRegistriesCatalogDefault(
  unitsService: PiUnitsService,
  materialsService: PiMaterialsService,
  modulesService: PiModulesService,
  productsService: PiProductsService,
  supplyRequestsService: PiSupplyRequestsService,
  organizationsService: PiOrganizationsService,
  productPassportsService: PiProductPassportsService,
  router: Router,
  materialDialogHost: MaterialRegistryDeps['dialogHost'],
  catalogDialogHost: ModuleRegistryDeps['dialogHost'],
): readonly RegistryDefinition<RegistryRow>[] {
  const materialDeps = buildMaterialRegistryDeps(materialsService, router, materialDialogHost);
  const moduleDeps = buildModuleRegistryDeps(modulesService, catalogDialogHost);
  const productDeps = buildProductRegistryDeps(productsService, router, catalogDialogHost);
  return [
    createUnitsRegistry(unitsService),
    createMaterialsRegistry(materialDeps),
    createDetailsRegistry(materialDeps),
    createModulesRegistry(moduleDeps),
    createProductsRegistry(productDeps),
    createSupplyRequestsRegistry(supplyRequestsService),
    createOrganizationsRegistry(organizationsService),
    createProductPassportsRegistry(productPassportsService),
    DEPARTMENTS_REGISTRY,
  ];
}

/**
 * Host-scoped catalog factory — `DestroyRef` must come from `RegistriesPage`, not root injector,
 * so registry dialogs auto-close when the page is destroyed (TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1).
 */
export function createRegistriesCatalog(
  destroyRef: DestroyRef,
  injector: Injector,
): readonly RegistryDefinition<RegistryRow>[] {
  const router = inject(Router);
  const dialog = inject(PiDialogService);
  const materialsService = inject(PiMaterialsService);
  const modulesService = inject(PiModulesService);
  const productsService = inject(PiProductsService);
  const supplyRequestsService = inject(PiSupplyRequestsService);
  const organizationsService = inject(PiOrganizationsService);
  const productPassportsService = inject(PiProductPassportsService);
  const unitsService = inject(PiUnitsService);

  const materialDialogHost = createMaterialRegistryDialogHost({
    dialog,
    destroyRef,
    injector,
    materialsService,
  });
  const catalogDialogHost = createCatalogRegistryDialogHost({
    dialog,
    destroyRef,
    injector,
    modulesService,
    productsService,
  });

  return buildRegistriesCatalogDefault(
    unitsService,
    materialsService,
    modulesService,
    productsService,
    supplyRequestsService,
    organizationsService,
    productPassportsService,
    router,
    materialDialogHost,
    catalogDialogHost,
  );
}

export const REGISTRIES_CATALOG = new InjectionToken<readonly RegistryDefinition<RegistryRow>[]>(
  'REGISTRIES_CATALOG',
);

/** Provide on `RegistriesPage` so dialog `parentDestroyRef` is page-scoped. */
export function provideRegistriesCatalog(): Provider {
  return {
    provide: REGISTRIES_CATALOG,
    useFactory: () => createRegistriesCatalog(inject(DestroyRef), inject(Injector)),
  };
}
