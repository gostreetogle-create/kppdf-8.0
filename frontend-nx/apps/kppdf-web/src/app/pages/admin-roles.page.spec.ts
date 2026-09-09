import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CapabilitiesService } from '@kppdf/data-access/capabilities';
import { AuthService } from '@kppdf/data-access/auth';
import { AdminRole, PiRolesService } from '@kppdf/data-access/admin';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { RolesAdminPage } from './admin-roles.page';
import { RoleFormDialogComponent, type RoleFormData } from './role-form-dialog.component';

describe('RolesAdminPage (TZ-NX-UX-17-admin-roles-FIX)', () => {
  let fixture: ComponentFixture<RolesAdminPage>;
  let rolesApi: { list: jest.Mock; create: jest.Mock; update: jest.Mock; remove: jest.Mock };
  let dialog: { open: jest.Mock };
  let toast: { success: jest.Mock; error: jest.Mock };

  const systemRole: AdminRole = {
    id: 'r-system',
    name: 'admin',
    label: 'Администратор',
    permissions: ['user:admin'],
    isSystem: true,
  };
  const customRole: AdminRole = {
    id: 'r-custom',
    name: 'foreman',
    label: 'Бригадир',
    description: 'Управляет бригадой на объекте',
    permissions: ['order:read'],
    pages: ['orders'],
    isSystem: false,
  };

  async function setup(
    caps: readonly string[] = ['role:write', 'role:admin'],
    listResult: SilentResult<{ items: AdminRole[]; total: number; page: number }> = {
      ok: true,
      data: { items: [systemRole, customRole], total: 2, page: 1 },
    },
  ): Promise<void> {
    rolesApi = {
      list: jest.fn().mockReturnValue(of(listResult)),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    dialog = { open: jest.fn() };
    toast = { success: jest.fn(), error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [RolesAdminPage],
      providers: [
        provideRouter([]),
        { provide: PiRolesService, useValue: rolesApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: toast },
        { provide: CapabilitiesService, useValue: { hasAny: (req: string[]) => req.some((k) => caps.includes(k)) } },
        { provide: AuthService, useValue: { user: () => null, isOwner: () => false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesAdminPage);
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders name/label/permissions/type columns for every role', async () => {
    await setup();
    const table: HTMLElement = fixture.nativeElement;
    expect(table.textContent).toContain('admin');
    expect(table.textContent).toContain('foreman');
    expect(table.textContent).toContain('Бригадир');
  });

  it('shows edit/delete row actions for a custom role when the viewer can manage roles', async () => {
    await setup(['role:write', 'role:admin']);
    expect(
      fixture.nativeElement.querySelector('[data-test="roles-admin-edit"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="roles-admin-delete"]'),
    ).toBeTruthy();
  });

  it('shows a read-only «Смотреть» fallback for a custom role when the viewer has neither role:write nor role:admin', async () => {
    await setup([]);

    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-edit"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-delete"]')).toBeNull();
    const viewButtons = fixture.nativeElement.querySelectorAll('[data-test="roles-admin-view"]');
    // One for the system role's own fallback branch, one for the custom role (T1 fix).
    expect(viewButtons.length).toBe(2);

    (viewButtons[1] as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenLastCalledWith(
      RoleFormDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          mode: 'view',
          role: expect.objectContaining({ id: 'r-custom', isSystem: false }),
        } satisfies Partial<RoleFormData>),
      }),
    );
  });

  it('uses data-test (not data-testid) for the error banner', async () => {
    await setup(['role:write'], { ok: false, error: new Error('boom') });
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-error"]')).toBeTruthy();
  });
});
