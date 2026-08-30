import { of } from 'rxjs';
import {
  PiMaterialsService, PiModulesService, PiOrganizationsService, PiProductPassportsService,
  PiProductsService, PiSupplyRequestsService, PiUnitsService, PiTextBlocksService,
  PiTextBlockCategoriesService, PiTableTemplatesService, PiRegistryDataSourcesService,
} from '@kppdf/data-access';
import { buildRegistriesCatalogDefault } from './registries.catalog';
import type { MaterialRegistryDialogHost } from './material-registry-dialog-host';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';

const host = (): MaterialRegistryDialogHost => ({ openCreate: jest.fn(), openEdit: jest.fn() });
const catalogHost = (): CatalogRegistryDialogHost => ({ openModuleCreate: jest.fn(), openModuleEdit: jest.fn(), openProductCreate: jest.fn(), openProductEdit: jest.fn() });
const empty = (value: unknown) => value;

function buildCatalog() {
  const units = { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } })), update: jest.fn(), remove: jest.fn() } as unknown as PiUnitsService;
  const materials = { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } })), getById: jest.fn() } as unknown as PiMaterialsService;
  const modules = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), getById: jest.fn() } as unknown as PiModulesService;
  const products = { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } })), getById: jest.fn() } as unknown as PiProductsService;
  const supply = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), getById: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() } as unknown as PiSupplyRequestsService;
  const organizations = { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } })), getById: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() } as unknown as PiOrganizationsService;
  const passports = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), getById: jest.fn(), getByProductId: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() } as unknown as PiProductPassportsService;
  return buildRegistriesCatalogDefault(units, materials, modules, products, supply, organizations, passports, { config: [], navigate: jest.fn() } as never, host(), catalogHost(), { textBlocks: empty({}), categories: empty({}), templates: empty({}), dataSources: empty({}) } as never);
}

describe('registries.catalog CRUD unify', () => {
  it('contains production registries and excludes the fixture departments registry', () => {
    expect(buildCatalog().map((registry) => registry.key)).toEqual(['units', 'materials', 'details', 'modules', 'products', 'supply-requests', 'organizations', 'product-passports', 'text-blocks', 'table-templates']);
  });

  it('does not expose constructor actions or route capability', () => {
    for (const registry of buildCatalog()) expect(registry.rowActions?.some((action) => action.id === 'open-constructor')).toBe(false);
  });
});
