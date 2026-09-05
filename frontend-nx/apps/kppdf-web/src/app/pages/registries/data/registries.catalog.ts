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
  PiTextBlocksService,
  PiTextBlockCategoriesService,
  PiTableTemplatesService,
  PiRegistryDataSourcesService,
  PiWorkTypesService,
  PiPeopleService,
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
import { createUnitsDialogHost } from './units-dialog-host';
import { createDocStudioDialogDeps, type DocStudioDialogDeps } from './doc-studio-registry-actions';
import { createTextBlocksRegistry } from './text-blocks.registry';
import { createTableTemplatesRegistry } from './table-templates.registry';
import { createVatRateRegistry } from './vat-rate.registry';
import { createFormulasRegistry } from './formulas.registry';
import { createWorkTypesRegistry } from './work-types.registry';
import type { WorkTypeRegistryDeps } from './work-type-registry-actions';
import { createWorkTypeRegistryDialogHost } from './work-type-registry-dialog-host';
import { createWorkersRegistry } from './workers.registry';
import type { WorkerRegistryDeps } from './worker-registry-actions';
import { createWorkerRegistryDialogHost } from './worker-registry-dialog-host';

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

/** Default catalog: editable production API registries plus document-studio registries. */
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
  unitsDialogHost: ReturnType<typeof createUnitsDialogHost>,
  docStudioDeps?: DocStudioDialogDeps,
  workTypesService?: PiWorkTypesService,
  workTypeDialogHost?: WorkTypeRegistryDeps['dialogHost'],
  peopleService?: PiPeopleService,
  workerDialogHost?: WorkerRegistryDeps['dialogHost'],
): readonly RegistryDefinition<RegistryRow>[] {
  const materialDeps = buildMaterialRegistryDeps(materialsService, router, materialDialogHost);
  const moduleDeps = buildModuleRegistryDeps(modulesService, catalogDialogHost);
  const productDeps = buildProductRegistryDeps(productsService, router, catalogDialogHost);
  const studio = docStudioDeps;
  const registryDialog = (() => { try { return inject(PiDialogService, { optional: true }); } catch { return undefined; } })();
  return [
    createUnitsRegistry(unitsService, unitsDialogHost),
    createMaterialsRegistry(materialDeps),
    createDetailsRegistry(materialDeps),
    createModulesRegistry(moduleDeps),
    createProductsRegistry(productDeps),
    createSupplyRequestsRegistry(supplyRequestsService, registryDialog ?? undefined),
    createOrganizationsRegistry(organizationsService, registryDialog ?? undefined),
    createVatRateRegistry(organizationsService),
    createFormulasRegistry(),
    ...(workTypesService && workTypeDialogHost
      ? [createWorkTypesRegistry({ workTypesService, dialogHost: workTypeDialogHost })]
      : []),
    ...(peopleService && workerDialogHost
      ? [createWorkersRegistry({ peopleService, dialogHost: workerDialogHost })]
      : []),
    createProductPassportsRegistry(productPassportsService, registryDialog ?? undefined),
    ...(studio ? [createTextBlocksRegistry(studio), createTableTemplatesRegistry(studio)] : []).map((definition) => definition as RegistryDefinition<RegistryRow>),
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
  const textBlocksService = inject(PiTextBlocksService);
  const textBlockCategoriesService = inject(PiTextBlockCategoriesService);
  const tableTemplatesService = inject(PiTableTemplatesService);
  const dataSourcesService = inject(PiRegistryDataSourcesService);
  const workTypesService = inject(PiWorkTypesService);
  const peopleService = inject(PiPeopleService);

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

  const unitsDialogHost = createUnitsDialogHost({ dialog, destroyRef, injector, unitsService });
  const workTypeDialogHost = createWorkTypeRegistryDialogHost({
    dialog,
    destroyRef,
    injector,
    workTypesService,
  });
  const workerDialogHost = createWorkerRegistryDialogHost({
    dialog,
    destroyRef,
    injector,
    peopleService,
  });

  const docStudioDeps = createDocStudioDialogDeps(dialog, destroyRef, injector);
  docStudioDeps.textBlocks = textBlocksService;
  docStudioDeps.categories = textBlockCategoriesService;
  docStudioDeps.templates = tableTemplatesService;
  docStudioDeps.dataSources = dataSourcesService;

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
    unitsDialogHost,
    docStudioDeps,
    workTypesService,
    workTypeDialogHost,
    peopleService,
    workerDialogHost,
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
