import { of } from 'rxjs';
import { PiModulesService, PiProductsService } from '@kppdf/data-access';
import { buildModuleRowActions } from '../registries/data/module-registry-actions';
import { buildProductRowActions } from '../registries/data/product-registry-actions';
import type { CatalogRegistryDialogHost } from '../registries/data/catalog-registry-dialog-host';

const SAMPLE_MODULE = { _id: 'mod-1', name: 'Каркас', article: 'MOD-1' };
const SAMPLE_PRODUCT = {
  _id: 'prod-1',
  name: 'Окно',
  sku: 'WIN-1',
  kind: 'good' as const,
  unit: 'шт',
};

function mockCatalogHost(): CatalogRegistryDialogHost {
  return {
    openModuleCreate: jest.fn(),
    openModuleEdit: jest.fn(),
    openProductCreate: jest.fn(),
    openProductEdit: jest.fn(),
  };
}

describe('composition registry actions (TZ-NX-REGISTRIES-COMPOSITION-DIALOG)', () => {
  it('module edit opens dialog host', () => {
    const host = mockCatalogHost();
    const edit = buildModuleRowActions({
      modulesService: { archive: jest.fn() } as unknown as PiModulesService,
      dialogHost: host,
    }).find((a) => a.id === 'edit-module')!;
    edit.run(SAMPLE_MODULE, { reload: jest.fn(), notify: jest.fn() });
    expect(host.openModuleEdit).toHaveBeenCalledWith(
      SAMPLE_MODULE,
      expect.anything(),
      false,
    );
  });

  it('module open composition focuses composition block', () => {
    const host = mockCatalogHost();
    const open = buildModuleRowActions({
      modulesService: { archive: jest.fn() } as unknown as PiModulesService,
      dialogHost: host,
    }).find((a) => a.id === 'open-composition')!;
    open.run(SAMPLE_MODULE, { reload: jest.fn(), notify: jest.fn() });
    expect(host.openModuleEdit).toHaveBeenCalledWith(SAMPLE_MODULE, expect.anything(), true);
  });

  it('product copy uses duplicate endpoint', async () => {
    const duplicate = jest.fn().mockReturnValue(of({ ok: true, data: { ...SAMPLE_PRODUCT, _id: 'copy' } }));
    const reload = jest.fn();
    const copy = buildProductRowActions({
      productsService: { duplicate } as unknown as PiProductsService,
      dialogHost: mockCatalogHost(),
      router: { navigate: jest.fn(), config: [] } as never,
      existingPaths: new Set(),
    }).find((a) => a.id === 'copy-product')!;
    await copy.run(SAMPLE_PRODUCT, { reload, notify: jest.fn() });
    expect(duplicate).toHaveBeenCalledWith('prod-1');
    expect(reload).toHaveBeenCalled();
  });

  it('module archive requires confirmation metadata', () => {
    const archive = buildModuleRowActions({
      modulesService: { archive: jest.fn() } as unknown as PiModulesService,
      dialogHost: mockCatalogHost(),
    }).find((a) => a.id === 'archive-module')!;
    expect(archive.destructive).toBe(true);
    expect(archive.confirm?.confirmLabel).toBe('Архивировать');
  });

  it('module row actions exclude copy', () => {
    const ids = buildModuleRowActions({
      modulesService: { archive: jest.fn() } as unknown as PiModulesService,
      dialogHost: mockCatalogHost(),
    }).map((a) => a.id);
    expect(ids).not.toContain('copy-module');
    expect(ids).toEqual(expect.arrayContaining(['edit-module', 'open-composition', 'archive-module']));
  });
});
