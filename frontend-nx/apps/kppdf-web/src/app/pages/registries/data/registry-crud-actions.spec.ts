import { createRegistryCrudActions } from './registry-crud-actions';

describe('createRegistryCrudActions', () => {
  it('orders edit, copy, domain actions, then confirmed delete', () => {
    const actions = createRegistryCrudActions({
      entityLabel: 'запись',
      edit: jest.fn(),
      copy: jest.fn(),
      domainActions: [{ id: 'domain', label: 'Состав', icon: 'layers', run: jest.fn() }],
      remove: jest.fn(),
    });

    expect(actions.map((action) => action.id)).toEqual(['edit', 'copy', 'domain', 'delete']);
    expect(actions.at(-1)).toMatchObject({
      label: 'Удалить',
      destructive: true,
      confirm: { confirmLabel: 'Удалить' },
    });
  });

  it('grays out delete via isDeleteDisabled/deleteDisabledReason instead of hiding it (TZ-NX-REG-TEXT-BLOCK-CATEGORIES)', () => {
    const actions = createRegistryCrudActions<{ isSystem?: boolean }>({
      entityLabel: 'категорию',
      edit: jest.fn(),
      remove: jest.fn(),
      isDeleteDisabled: (row) => row.isSystem === true,
      deleteDisabledReason: (row) => (row.isSystem ? 'Системную нельзя удалить' : null),
    });
    const deleteAction = actions.find((action) => action.id === 'delete');

    expect(deleteAction?.isDisabled?.({ isSystem: true })).toBe(true);
    expect(deleteAction?.disabledReason?.({ isSystem: true })).toBe('Системную нельзя удалить');
    expect(deleteAction?.isDisabled?.({ isSystem: false })).toBe(false);
    expect(deleteAction?.disabledReason?.({ isSystem: false })).toBeNull();
  });
});
