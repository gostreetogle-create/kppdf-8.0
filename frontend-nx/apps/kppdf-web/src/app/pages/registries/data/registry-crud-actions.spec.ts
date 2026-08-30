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
});
