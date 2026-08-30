import type {
  RegistryActionContext,
  RegistryRowAction,
} from '../model/registry.types';

export interface RegistryCrudActionOptions<TRow> {
  readonly entityLabel: string;
  readonly edit: (row: TRow, ctx: RegistryActionContext) => void | Promise<void>;
  readonly copy?: (row: TRow, ctx: RegistryActionContext) => void | Promise<void>;
  readonly remove: (row: TRow, ctx: RegistryActionContext) => void | Promise<void>;
  readonly domainActions?: readonly RegistryRowAction<TRow>[];
}

export function createRegistryCrudActions<TRow>(
  options: RegistryCrudActionOptions<TRow>,
): readonly RegistryRowAction<TRow>[] {
  const actions: RegistryRowAction<TRow>[] = [
    {
      id: 'edit',
      label: 'Редактировать',
      icon: 'pencil',
      tone: 'edit',
      run: options.edit,
    },
  ];
  if (options.copy) {
    actions.push({
      id: 'copy',
      label: 'Копировать',
      icon: 'copy',
      tone: 'copy',
      run: options.copy,
    });
  }
  actions.push(...(options.domainActions ?? []));
  actions.push({
    id: 'delete',
    label: 'Удалить',
    icon: 'x',
    tone: 'destructive',
    destructive: true,
    confirm: {
      title: `Удалить ${options.entityLabel}?`,
      description: 'Действие нельзя отменить.',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена',
    },
    run: options.remove,
  });
  return actions;
}

export function copyName(name: string): string {
  return `${name} — копия`;
}
