import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import type { PiProductsService, ProductDetail } from '@kppdf/data-access';
import type { RegistryActionContext, RegistryRowAction } from '../model/registry.types';
import { buildOpenConstructorRowAction } from './registry-constructor-action';
import type { ProductRow } from './products-http-data-source';
import type { CatalogRegistryDialogHost } from './catalog-registry-dialog-host';

export interface ProductRegistryActionDeps {
  readonly productsService: PiProductsService;
  readonly dialogHost: CatalogRegistryDialogHost;
  readonly router: import('@angular/router').Router;
  readonly existingPaths: ReadonlySet<string>;
}

export function buildProductCreateAction(deps: ProductRegistryActionDeps) {
  return {
    label: 'Создать изделие',
    run: (ctx: RegistryActionContext) => deps.dialogHost.openProductCreate(ctx),
  };
}

export function buildProductRowActions(
  deps: ProductRegistryActionDeps,
): RegistryRowAction<ProductRow>[] {
  const actions: RegistryRowAction<ProductRow>[] = [
    {
      id: 'edit-product',
      label: 'Редактировать',
      icon: 'pencil',
      tone: 'edit',
      run: (row, ctx) => {
        deps.dialogHost.openProductEdit(row as ProductDetail, ctx, false);
      },
    },
    {
      id: 'open-composition',
      label: 'Открыть состав',
      icon: 'layers',
      tone: 'doc',
      run: (row, ctx) => {
        deps.dialogHost.openProductEdit(row as ProductDetail, ctx, true);
      },
    },
    {
      id: 'copy-product',
      label: 'Копировать',
      icon: 'copy',
      tone: 'copy',
      run: async (row, ctx) => {
        const res = await firstValueFrom(deps.productsService.duplicate(row._id));
        if (!res.ok) {
          ctx.notify(extractErrorMessage(res.error), 'error');
          return;
        }
        ctx.notify('Копия создана', 'success');
        ctx.reload();
      },
    },
    {
      id: 'archive-product',
      label: 'Архивировать',
      icon: 'archive',
      tone: 'destructive',
      destructive: true,
      confirm: {
        title: 'Архивировать изделие?',
        description: 'Изделие будет скрыто из справочника (мягкое удаление).',
        confirmLabel: 'Архивировать',
        cancelLabel: 'Отмена',
      },
      run: async (row, ctx) => {
        const res = await firstValueFrom(deps.productsService.archive(row._id));
        if (!res.ok) {
          ctx.notify(extractErrorMessage(res.error), 'error');
          return;
        }
        ctx.notify('Изделие архивировано', 'success');
        ctx.reload();
      },
    },
  ];

  const openConstructor = buildOpenConstructorRowAction<ProductRow>(deps.router, deps.existingPaths);
  if (openConstructor) actions.push(openConstructor);

  return actions;
}
