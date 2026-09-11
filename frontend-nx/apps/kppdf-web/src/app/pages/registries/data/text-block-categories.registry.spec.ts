import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { DestroyRef } from '@angular/core';
import type { PiDialogService } from '@kppdf/ui/dialog';
import type { PiTextBlockCategoriesService, TextBlockCategory } from '@kppdf/data-access';
import { createTextBlockCategoriesRegistry } from './text-block-categories.registry';
import { TextBlockCategoryFormDialogComponent } from '../../dictionaries/text-block-category-form-dialog.component';
import type { DocStudioDialogDeps } from './doc-studio-registry-actions';
import type { RegistryActionContext, RegistryRow } from '../model/registry.types';
import type { TextBlockCategoryRow } from './text-block-categories-http-data-source';

/**
 * TZ-NX-REG-TEXT-BLOCK-CATEGORIES — replaces the deleted `/dictionaries/text-block-categories`
 * master-detail page. Ports its "system category has no delete" + "409 on remove"
 * coverage onto the flat registry's row actions.
 */
describe('createTextBlockCategoriesRegistry', () => {
  let dialogOpen: jest.Mock;
  let removeMock: jest.Mock;
  let deps: DocStudioDialogDeps;
  let notify: jest.Mock;
  let reload: jest.Mock;
  let ctx: RegistryActionContext;

  const row = (overrides: Partial<TextBlockCategory> = {}): TextBlockCategoryRow => {
    const category: TextBlockCategory = {
      _id: 'root-1',
      name: 'Общее',
      slug: 'obshchee',
      isActive: true,
      sortOrder: 0,
      ...overrides,
    };
    return { ...category, path: category.parentId ? `Общее › ${category.name}` : category.name };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    dialogOpen = jest.fn().mockReturnValue({ closed: () => undefined });
    removeMock = jest.fn().mockReturnValue(of({ ok: true, data: undefined }));
    notify = jest.fn();
    reload = jest.fn();
    ctx = { notify, reload };
    deps = {
      dialog: { open: dialogOpen } as unknown as PiDialogService,
      destroyRef: {} as DestroyRef,
      injector: TestBed.inject(Injector),
      textBlocks: {} as never,
      categories: { remove: removeMock } as unknown as PiTextBlockCategoriesService,
      templates: {} as never,
      dataSources: {} as never,
    };
  });

  function definition() {
    return createTextBlockCategoriesRegistry(deps);
  }

  function rowAction(id: string) {
    const action = definition().rowActions?.find((a) => a.id === id);
    if (!action) throw new Error(`no rowAction "${id}"`);
    return action;
  }

  it('exposes the key/title/category the audit asked for', () => {
    const def = definition();
    expect(def.key).toBe('text-block-categories');
    expect(def.title).toBe('Категории текстов');
    expect(def.category).toBe('Документы');
  });

  it('toolbar "Создать категорию" opens a blank create dialog', () => {
    const createAction = definition().createAction;
    if (!createAction) throw new Error('registry has no createAction');
    createAction.run(ctx);
    expect(dialogOpen).toHaveBeenCalledWith(
      TextBlockCategoryFormDialogComponent,
      expect.objectContaining({ data: { mode: 'create' } }),
    );
  });

  it('edit opens the edit dialog with the row as the category', () => {
    rowAction('edit').run(row() as unknown as RegistryRow, ctx);
    expect(dialogOpen).toHaveBeenCalledWith(
      TextBlockCategoryFormDialogComponent,
      expect.objectContaining({ data: expect.objectContaining({ mode: 'edit', category: expect.objectContaining({ _id: 'root-1' }) }) }),
    );
  });

  it('"Создать подкатегорию" is enabled on a root row, disabled on a subcategory row', () => {
    const createSub = rowAction('create-sub');
    expect(createSub.isDisabled?.(row() as unknown as RegistryRow)).toBe(false);
    expect(createSub.isDisabled?.(row({ _id: 'sub-1', name: 'Гарантия', parentId: 'root-1' }) as unknown as RegistryRow)).toBe(true);
  });

  it('"Создать подкатегорию" opens create with the clicked row as parent', () => {
    rowAction('create-sub').run(row() as unknown as RegistryRow, ctx);
    expect(dialogOpen).toHaveBeenCalledWith(
      TextBlockCategoryFormDialogComponent,
      expect.objectContaining({ data: { mode: 'create', parentId: 'root-1', parentName: 'Общее' } }),
    );
  });

  it('delete is disabled for a system category, with a reason, and enabled otherwise', () => {
    const del = rowAction('delete');
    const system = row({ isSystem: true });
    expect(del.isDisabled?.(system as unknown as RegistryRow)).toBe(true);
    expect(del.disabledReason?.(system as unknown as RegistryRow)).toBe('Системную категорию нельзя удалить');
    expect(del.isDisabled?.(row() as unknown as RegistryRow)).toBe(false);
  });

  it('delete removes and reloads on success', async () => {
    await rowAction('delete').run(row() as unknown as RegistryRow, ctx);
    expect(removeMock).toHaveBeenCalledWith('root-1');
    expect(notify).toHaveBeenCalledWith('Категория удалена', 'success');
    expect(reload).toHaveBeenCalled();
  });

  it('delete surfaces the BE 409 (e.g. "has subcategories") without reloading', async () => {
    removeMock.mockReturnValue(of({ ok: false, error: { status: 409, error: { message: 'есть подкатегории' } } }));
    await rowAction('delete').run(row() as unknown as RegistryRow, ctx);
    expect(notify).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(reload).not.toHaveBeenCalled();
  });
});
