import { of } from 'rxjs';
import type { PiCategoriesService, Category } from '@kppdf/data-access';
import { createCategoriesRegistryDefinition } from './categories.registry';
import type { CategoryRegistryDeps } from './category-registry-actions';
import type { CategoryRegistryDialogHost } from './category-registry-dialog-host';
import type { RegistryActionContext, RegistryRow } from '../model/registry.types';

describe('createCategoriesRegistryDefinition', () => {
  let removeMock: jest.Mock;
  let dialogHost: CategoryRegistryDialogHost;
  let deps: CategoryRegistryDeps;
  let notify: jest.Mock;
  let reload: jest.Mock;
  let ctx: RegistryActionContext;

  const cat = (overrides: Partial<Category> = {}): Category => ({
    _id: 'c1',
    name: 'Метизы',
    slug: 'metizy',
    type: 'material',
    skuPrefix: 'MTZ',
    sortOrder: 0,
    isActive: true,
    ...overrides,
  });

  beforeEach(() => {
    removeMock = jest.fn().mockReturnValue(of({ ok: true, data: undefined }));
    dialogHost = { openCreate: jest.fn(), openEdit: jest.fn() };
    notify = jest.fn();
    reload = jest.fn();
    ctx = { notify, reload };
    deps = {
      categoriesService: { remove: removeMock } as unknown as PiCategoriesService,
      dialogHost,
    };
  });

  function definition() {
    return createCategoriesRegistryDefinition(deps);
  }

  function rowAction(id: string) {
    const action = definition().rowActions?.find((a) => a.id === id);
    if (!action) throw new Error(`no rowAction "${id}"`);
    return action;
  }

  it('exposes the key/title/category the audit asked for', () => {
    const def = definition();
    expect(def.key).toBe('categories');
    expect(def.title).toBe('Категории');
    expect(def.category).toBe('Справочники');
  });

  it('exposes a type filter with the 3 wireable RU labels', () => {
    const typeFilter = definition().filters?.find((f) => f.key === 'type');
    expect(typeFilter?.options?.map((o) => o.label)).toEqual(['Детали', 'Изделия', 'Модули']);
  });

  it('toolbar create delegates to the dialog host', () => {
    const createAction = definition().createAction;
    if (!createAction) throw new Error('registry has no createAction');
    createAction.run(ctx);
    expect(dialogHost.openCreate).toHaveBeenCalledWith(ctx);
  });

  it('edit delegates to the dialog host with the row', () => {
    const row = cat() as unknown as RegistryRow;
    rowAction('edit').run(row, ctx);
    expect(dialogHost.openEdit).toHaveBeenCalledWith(row, ctx);
  });

  it('delete removes and reloads on success', async () => {
    await rowAction('delete').run(cat() as unknown as RegistryRow, ctx);
    expect(removeMock).toHaveBeenCalledWith('c1');
    expect(notify).toHaveBeenCalledWith('Категория удалена', 'success');
    expect(reload).toHaveBeenCalled();
  });

  it('delete surfaces a BE conflict (children/refs) without reloading', async () => {
    removeMock.mockReturnValue(of({ ok: false, error: { status: 409, error: { message: 'has children' } } }));
    await rowAction('delete').run(cat() as unknown as RegistryRow, ctx);
    expect(notify).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(reload).not.toHaveBeenCalled();
  });
});
