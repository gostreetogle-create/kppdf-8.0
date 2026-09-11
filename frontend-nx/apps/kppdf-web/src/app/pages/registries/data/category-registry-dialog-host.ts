import { firstValueFrom } from 'rxjs';
import type { DestroyRef, Injector } from '@angular/core';
import { PiCategoriesService, type Category } from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from '../../on-dialog-close-once';
import {
  CategoryFormDialogComponent,
  type CategoryFormDialogData,
} from '../dialogs/category-form-dialog.component';
import type { RegistryActionContext } from '../model/registry.types';

export interface CategoryRegistryDialogHost {
  openCreate(ctx: RegistryActionContext): void;
  openEdit(row: Category, ctx: RegistryActionContext): void;
}

export interface CategoryRegistryDialogHostDeps {
  readonly dialog: PiDialogService;
  readonly destroyRef: DestroyRef;
  readonly injector: Injector;
  readonly categoriesService: PiCategoriesService;
}

/**
 * Fetches the full category list fresh on every open (not cached) — the
 * form's parent picker filters it by the selected type, and this dialog is
 * opened rarely enough (an explicit create/edit click) that a fresh read
 * beats any risk of showing a stale sibling list.
 */
export function createCategoryRegistryDialogHost(
  deps: CategoryRegistryDialogHostDeps,
): CategoryRegistryDialogHost {
  async function openDialog(
    mode: CategoryFormDialogData['mode'],
    category: Category | null,
    ctx: RegistryActionContext,
  ): Promise<void> {
    const listResult = await firstValueFrom(deps.categoriesService.list());
    const categories = listResult.ok ? listResult.data : [];
    const ref = deps.dialog.open<Category | undefined>(CategoryFormDialogComponent, {
      data: { mode, category, categories } satisfies CategoryFormDialogData,
      parentDestroyRef: deps.destroyRef,
    });
    onDialogCloseOnce(ref, deps.injector, (value) => {
      if (!value) return;
      ctx.notify(mode === 'edit' ? 'Категория обновлена' : 'Категория создана', 'success');
      ctx.reload();
    });
  }

  return {
    openCreate(ctx) {
      void openDialog('create', null, ctx);
    },
    openEdit(row, ctx) {
      void openDialog('edit', row, ctx);
    },
  };
}
