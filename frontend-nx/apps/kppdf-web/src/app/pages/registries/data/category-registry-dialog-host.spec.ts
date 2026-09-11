import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { DestroyRef } from '@angular/core';
import type { PiDialogService } from '@kppdf/ui/dialog';
import type { PiCategoriesService, Category } from '@kppdf/data-access';
import { createCategoryRegistryDialogHost } from './category-registry-dialog-host';
import { CategoryFormDialogComponent } from '../dialogs/category-form-dialog.component';
import type { RegistryActionContext } from '../model/registry.types';

describe('createCategoryRegistryDialogHost', () => {
  let dialogOpen: jest.Mock;
  let listMock: jest.Mock;
  let notify: jest.Mock;
  let reload: jest.Mock;
  let ctx: RegistryActionContext;
  const allCategories: Category[] = [
    { _id: 'c1', name: 'Метизы', slug: 'metizy', type: 'material', skuPrefix: 'MTZ', sortOrder: 0, isActive: true },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    dialogOpen = jest.fn().mockReturnValue({ closed: () => undefined });
    listMock = jest.fn().mockReturnValue(of({ ok: true, data: allCategories }));
    notify = jest.fn();
    reload = jest.fn();
    ctx = { notify, reload };
  });

  function host() {
    return createCategoryRegistryDialogHost({
      dialog: { open: dialogOpen } as unknown as PiDialogService,
      destroyRef: {} as DestroyRef,
      injector: TestBed.inject(Injector),
      categoriesService: { list: listMock } as unknown as PiCategoriesService,
    });
  }

  it('openCreate fetches the current category list and opens a blank create dialog with it', async () => {
    host().openCreate(ctx);
    await Promise.resolve();
    await Promise.resolve();

    expect(listMock).toHaveBeenCalledWith();
    expect(dialogOpen).toHaveBeenCalledWith(
      CategoryFormDialogComponent,
      expect.objectContaining({ data: { mode: 'create', category: null, categories: allCategories } }),
    );
  });

  it('openEdit opens the edit dialog with the row and the fetched sibling list', async () => {
    const row = allCategories[0];
    host().openEdit(row, ctx);
    await Promise.resolve();
    await Promise.resolve();

    expect(dialogOpen).toHaveBeenCalledWith(
      CategoryFormDialogComponent,
      expect.objectContaining({ data: { mode: 'edit', category: row, categories: allCategories } }),
    );
  });
});
