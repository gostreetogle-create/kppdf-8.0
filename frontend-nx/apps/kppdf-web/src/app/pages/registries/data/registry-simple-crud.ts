import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { Injector } from '@angular/core';
import { onDialogCloseOnce } from '../../on-dialog-close-once';
import type { RegistryActionContext, RegistryRowAction } from '../model/registry.types';
import { createRegistryCrudActions, copyName } from './registry-crud-actions';
import { SimpleRegistryFormDialogComponent, type SimpleRegistryDialogKind } from '../dialogs/simple-registry-form-dialog.component';
import type { PiOrganizationsService, PiProductPassportsService, PiSupplyRequestsService } from '@kppdf/data-access';

type SimpleService = { create: (payload: Record<string, unknown>) => ReturnType<PiOrganizationsService['create']>; update: (id: string, payload: Record<string, unknown>) => ReturnType<PiOrganizationsService['update']>; remove: (id: string) => ReturnType<PiOrganizationsService['remove']> };

export function simpleCrudActions<TRow extends { _id: string }, TService extends SimpleService>(dialog: PiDialogService, service: TService, kind: SimpleRegistryDialogKind, label: string, getValues: (row: TRow) => Record<string, unknown>, reloadDialog: (ctx: RegistryActionContext, value?: Record<string, unknown>) => void): readonly RegistryRowAction<TRow>[] {
  return createRegistryCrudActions<TRow>({
    entityLabel: label,
    edit: (row, ctx) => reloadDialog(ctx, getValues(row)),
    copy: (row, ctx) => reloadDialog(ctx, { ...getValues(row), name: copyName(String(getValues(row)['name'] ?? label)) }),
    remove: async (row, ctx) => {
      const result = await firstValueFrom(service.remove(row._id));
      if (!result.ok) { ctx.notify(extractErrorMessage(result.error), 'error'); return; }
      ctx.notify(`${label} удалён`, 'success'); ctx.reload();
    },
  });
}

export function openSimpleDialog(dialog: PiDialogService, kind: SimpleRegistryDialogKind, ctx: RegistryActionContext, value?: Record<string, unknown>): void {
  void dialog.open(SimpleRegistryFormDialogComponent, { data: { kind, value } });
  ctx.notify('Форма открыта', 'success');
}

export type SupportedSimpleService = PiOrganizationsService | PiSupplyRequestsService | PiProductPassportsService;
