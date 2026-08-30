import { of } from 'rxjs';
import { PiMaterialsService, type Material } from '@kppdf/data-access';
import { createDetailsRegistryDefinition } from './details.registry';
import { createMaterialsRegistryDefinition } from './materials.registry';
import { buildMaterialRowActions } from './material-registry-actions';
import type { MaterialRegistryDialogHost } from './material-registry-dialog-host';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';

const SAMPLE: Material = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Стекло',
  article: 'STK-1',
  unit: 'м²',
  materialKind: 'raw',
};

function mockMaterialsService(): PiMaterialsService {
  return {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    duplicate: jest.fn().mockReturnValue(of({ ok: true, data: { ...SAMPLE, _id: 'copy-1' } })),
    archive: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
  } as unknown as PiMaterialsService;
}

function mockDialogHost(): MaterialRegistryDialogHost {
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

const mockRouter = { navigate: jest.fn(), config: [] } as never;

describe('material registry dialogs (TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS)', () => {
  const baseDeps = () => ({
    materialsService: mockMaterialsService(),
    dialogHost: mockDialogHost(),
    router: mockRouter,
    existingPaths: new Set(['/constructor']),
  });

  it('materials registry exposes createAction and row dialog actions', () => {
    const def = createMaterialsRegistryDefinition(baseDeps());
    expect(def.createAction?.label).toBe('Создать материал');
    const ids = def.rowActions?.map((a) => a.id) ?? [];
    expect(ids).toContain('edit-material');
    expect(ids).toContain('copy-material');
    expect(ids).toContain('delete-material');
    expect(ids).not.toContain('open-constructor');
    expect(ids).not.toContain('open-composition');
  });

  it('details registry exposes createAction with kind filter unchanged', () => {
    const def = createDetailsRegistryDefinition(baseDeps());
    expect(def.createAction?.label).toBe('Создать деталь');
    expect(def.filters?.some((f) => f.key === 'materialKind')).toBe(true);
  });

  it('edit action opens dialog host', () => {
    const deps = baseDeps();
    const edit = buildMaterialRowActions(deps, {
      lockMaterialKind: 'raw',
      allowKindSelect: false,
      createLabel: 'Создать материал',
      entityLabel: 'материал',
    }).find((a) => a.id === 'edit-material')!;
    edit.run(SAMPLE, { reload: jest.fn(), notify: jest.fn() });
    expect(deps.dialogHost.openEdit).toHaveBeenCalledWith(
      SAMPLE,
      expect.objectContaining({ reload: expect.any(Function), notify: expect.any(Function) }),
      expect.objectContaining({ entityLabel: 'материал', lockMaterialKind: 'raw' }),
    );
  });

  it('copy action calls POST duplicate and reloads', async () => {
    const deps = baseDeps();
    const reload = jest.fn();
    const notify = jest.fn();
    const copy = buildMaterialRowActions(deps, {
      lockMaterialKind: 'raw',
      allowKindSelect: false,
      createLabel: 'Создать',
      entityLabel: 'материал',
    }).find((a) => a.id === 'copy-material')!;
    await copy.run(SAMPLE, { reload, notify });
    expect(deps.materialsService.duplicate).toHaveBeenCalledWith(SAMPLE._id);
    expect(notify).toHaveBeenCalledWith('Копия создана', 'success');
    expect(reload).toHaveBeenCalled();
  });

  it('archive action requires confirm metadata', () => {
    const archive = buildMaterialRowActions(baseDeps(), {
      allowKindSelect: true,
      createLabel: 'Создать',
      entityLabel: 'деталь',
    }).find((a) => a.id === 'delete-material')!;
    expect(archive.destructive).toBe(true);
    expect(archive.confirm?.confirmLabel).toBe('Удалить');
  });

  it('archive run reports API error via notify', async () => {
    const deps = baseDeps();
    (deps.materialsService.archive as jest.Mock).mockReturnValue(
      of({ ok: false, error: { error: { message: 'Forbidden' }, status: 403, statusText: 'Forbidden' } }),
    );
    const notify = jest.fn();
    const archive = buildMaterialRowActions(deps, {
      allowKindSelect: true,
      createLabel: 'Создать',
      entityLabel: 'деталь',
    }).find((a) => a.id === 'delete-material')!;
    await archive.run(SAMPLE, { reload: jest.fn(), notify });
    expect(notify).toHaveBeenCalledWith(expect.any(String), 'error');
  });

  it('units registry in catalog stays without createAction', async () => {
    const { buildRegistriesCatalogDefault } = await import('./registries.catalog');
    const catalog = buildRegistriesCatalogDefault(
      { list: jest.fn(), update: jest.fn() } as never,
      mockMaterialsService(),
      { list: jest.fn(), getById: jest.fn() } as never,
      { list: jest.fn(), getById: jest.fn() } as never,
      { list: jest.fn(), getById: jest.fn() } as never,
      { list: jest.fn(), getById: jest.fn() } as never,
      { list: jest.fn(), getById: jest.fn(), getByProductId: jest.fn() } as never,
      mockRouter,
      mockDialogHost(),
      mockCatalogDialogHost(),
      { openEdit: jest.fn() },
    );
    expect(catalog.find((r) => r.key === 'units')?.createAction).toBeUndefined();
    expect(catalog.find((r) => r.key === 'modules')?.createAction?.label).toContain('Создать');
    expect(catalog.find((r) => r.key === 'products')?.createAction?.label).toContain('Создать');
    expect(catalog.find((r) => r.key === 'departments')?.createAction).toBeUndefined();
  });
});
