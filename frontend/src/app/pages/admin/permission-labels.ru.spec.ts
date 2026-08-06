import { roleLabelRu, permissionsSummary, ROLE_LABEL_RU } from './permission-labels.ru';
import { ADMIN_TOC_CHIPS } from './admin-group-chips';

describe('permission-labels.ru helpers', () => {
  it('uses system RU map for known role names', () => {
    expect(roleLabelRu('admin', 'broken')).toBe(ROLE_LABEL_RU.admin);
    expect(roleLabelRu('director', '????????')).toBe(ROLE_LABEL_RU.director);
    expect(roleLabelRu('manager')).toBe(ROLE_LABEL_RU.manager);
    expect(roleLabelRu('user', '')).toBe(ROLE_LABEL_RU.user);
  });

  it('uses API label for custom roles; falls back to name when empty/mojibake', () => {
    expect(roleLabelRu('packer', 'Упаковщик')).toBe('Упаковщик');
    expect(roleLabelRu('packer', '')).toBe('packer');
    expect(roleLabelRu('packer', '????')).toBe('packer');
  });

  it('permissionsSummary truncates long lists', () => {
    expect(permissionsSummary([])).toBe('—');
    expect(permissionsSummary(['a', 'b'])).toBe('a, b');
    expect(permissionsSummary(['a', 'b', 'c', 'd'])).toBe('4 прав · a, b…');
  });
});

describe('ADMIN_TOC_CHIPS', () => {
  it('exposes Users and Roles peers for Group Chip TOC', () => {
    expect(ADMIN_TOC_CHIPS.map((c) => c.id)).toEqual(['users', 'roles']);
    expect(ADMIN_TOC_CHIPS.find((c) => c.id === 'roles')?.route).toBe('/admin/roles');
    expect(ADMIN_TOC_CHIPS.find((c) => c.id === 'users')?.route).toBe('/admin/users');
  });
});
