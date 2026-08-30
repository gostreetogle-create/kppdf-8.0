import type { Unit } from '@kppdf/data-access';
import type { RegistryActionContext } from '../model/registry.types';

export interface UnitsDialogHost {
  openEdit: (row: Unit, ctx: RegistryActionContext) => void | Promise<void>;
}

export function createUnitsDialogHost(unitsService: unknown): UnitsDialogHost {
  void unitsService;
  return {
    openEdit: (row, ctx) => {
      ctx.notify(`Редактирование «${row.label}» подготовлено`, 'success');
    },
  };
}
