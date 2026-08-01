import { PermissionsAdminController } from './permissions-admin.controller';
import { PERMISSIONS } from '../../common/seed/permissions.constants';

/**
 * TZ-257.B — PermissionsAdminController unit spec.
 *
 * The catalog endpoint is a pure function over the canonical
 * `PERMISSIONS` constant. Spec verifies grouping by section, stable
 * ordering, and that every returned key matches `<section>:<action>`
 * — i.e. the UI catalogue can never drift from what the seeder /
 * validator actually enforce.
 */
describe('PermissionsAdminController (TZ-257.B)', () => {
  const controller = new PermissionsAdminController();

  it('returns sections grouped from the canonical PERMISSIONS constant', () => {
    const { sections } = controller.catalog();
    const allKeys = sections.flatMap((s) => s.permissions.map((p) => p.key));
    expect(sections.length).toBeGreaterThan(0);
    // No key lost, none duplicated.
    expect(allKeys.sort()).toEqual(PERMISSIONS.map((p) => p.key).sort());
  });

  it('grouping is by section with stable source order', () => {
    const { sections } = controller.catalog();
    const first = sections[0];
    expect(first.section).toBe(PERMISSIONS[0].section);
    expect(first.permissions.length).toBeGreaterThan(0);
    expect(first.permissions[0].key).toBe(PERMISSIONS[0].key);
    expect(first.permissions[0].action).toBe(PERMISSIONS[0].action);
    expect(first.permissions[0].description).toBe(PERMISSIONS[0].description);
  });

  it('every permission key is exactly <section>:<action>', () => {
    const { sections } = controller.catalog();
    for (const s of sections) {
      for (const p of s.permissions) {
        expect(p.key).toBe(`${s.section}:${p.action}`);
      }
    }
  });

  it('each section entry carries the three fields the dialog renders', () => {
    const { sections } = controller.catalog();
    for (const s of sections) {
      expect(typeof s.section).toBe('string');
      for (const p of s.permissions) {
        expect(typeof p.key).toBe('string');
        expect(['read', 'write', 'admin']).toContain(p.action);
        expect(typeof p.description).toBe('string');
      }
    }
  });
});
