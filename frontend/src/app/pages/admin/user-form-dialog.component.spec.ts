import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import type { SilentResult } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import {
  UserFormDialogComponent,
  type UserFormData,
  type UserFormResult,
  type RoleOption,
} from './user-form-dialog.component';
import type { AdminRole } from '../../shared/services/pi-roles.service';

/**
 * TZ-264 — UserFormDialogComponent unit spec.
 *
 * Smoke tests instantiate both create and edit modes through TestBed
 * (template compilation — NG5xxx regression guard). Validation and
 * result-shape logic (canSubmit / onSubmit) are exercised directly.
 *
 * TZ-ADMIN-306 — the role dropdown now loads from `PiRolesService`
 * (GET /admin/roles). Every test flushes that request; dedicated tests
 * verify system + custom roles render with RU labels, the current role
 * survives edit mode, and the fallback kicks in on API failure.
 */

interface UserFormHarness {
  username: { set: (v: string) => void };
  displayName: { set: (v: string) => void };
  email: { set: (v: string) => void };
  password: { set: (v: string) => void };
  canSubmit: () => boolean;
  onSubmit: () => void;
  submitting: () => boolean;
  error: () => string | null;
  roleOptions: () => RoleOption[];
  rolesLoading: () => boolean;
  rolesError: () => string | null;
}

const EDIT_USER = {
  id: 'u1',
  username: 'alice',
  email: 'a@example.com',
  displayName: 'Alice',
  role: 'manager',
  isActive: true,
};

const BASE_URL = '/api';

/** API shape returned for GET /admin/roles (PiRolesService). */
function rolesPage(items: AdminRole[]) {
  return { items, total: items.length, page: 1, limit: 200 };
}

/** Default role list: system roles (admin/director/manager/user) + one custom role. */
function defaultRoles(): AdminRole[] {
  return [
    { id: 'r-admin', name: 'admin', label: 'Administrator', permissions: [], isSystem: true },
    { id: 'r-dir', name: 'director', label: 'Директор', permissions: [], isSystem: true },
    { id: 'r-mgr', name: 'manager', label: 'Manager', permissions: [], isSystem: true },
    { id: 'r-user', name: 'user', label: 'User', permissions: [], isSystem: true },
    { id: 'r-packer', name: 'packer', label: 'Упаковщик', permissions: [], isSystem: false },
  ];
}

async function setup(
  data: UserFormData,
  roles: AdminRole[] = defaultRoles(),
): Promise<{
  comp: UserFormHarness;
  close: jest.Mock;
  httpMock: HttpTestingController;
  fixture: import('@angular/core/testing').ComponentFixture<UserFormDialogComponent>;
}> {
  const close = jest.fn();
  await TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([]), withFetch()),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: BASE_URL },
      { provide: PI_DIALOG_DATA, useValue: data },
      { provide: PI_DIALOG_REF, useValue: { close } },
    ],
  })
    .overrideComponent(UserFormDialogComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    })
    .compileComponents();
  const fixture = TestBed.createComponent(UserFormDialogComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  httpMock
    .expectOne(`${BASE_URL}/admin/roles?page=1&limit=200`)
    .flush(rolesPage(roles));
  fixture.detectChanges();
  // loadRoles() awaits the firstValueFrom promise — flush the microtask queue
  // before assertions (rolesLoading must flip to false).
  await fixture.whenStable();
  fixture.detectChanges();
  return { comp: fixture.componentInstance as unknown as UserFormHarness, close, httpMock, fixture };
}

function fillValidCreate(comp: UserFormHarness): void {
  comp.username.set('alice');
  comp.displayName.set('Alice');
  comp.email.set('a@example.com');
  comp.password.set('12345678');
}

describe('UserFormDialogComponent', () => {
  it('instantiates in create mode (template compiles)', async () => {
    const { comp } = await setup({ mode: 'create' });
    expect(comp).toBeTruthy();
  });

  it('instantiates in edit mode (template compiles)', async () => {
    const { comp } = await setup({ mode: 'edit', user: EDIT_USER });
    expect(comp).toBeTruthy();
  });

  it('canSubmit() is false when username is shorter than 3 chars', async () => {
    const { comp } = await setup({ mode: 'create' });
    fillValidCreate(comp);
    comp.username.set('ab');
    expect(comp.canSubmit()).toBe(false);
  });

  it('canSubmit() is false when email is invalid', async () => {
    const { comp } = await setup({ mode: 'create' });
    fillValidCreate(comp);
    comp.email.set('not-an-email');
    expect(comp.canSubmit()).toBe(false);
  });

  it('canSubmit() is false when password is shorter than 8 chars in create mode', async () => {
    const { comp } = await setup({ mode: 'create' });
    fillValidCreate(comp);
    comp.password.set('1234567');
    expect(comp.canSubmit()).toBe(false);
  });

  it('canSubmit() is true for valid create-mode fields', async () => {
    const { comp } = await setup({ mode: 'create' });
    fillValidCreate(comp);
    expect(comp.canSubmit()).toBe(true);
  });

  it('onSubmit() in create mode returns the password in the result', async () => {
    const { comp, close } = await setup({ mode: 'create' });
    fillValidCreate(comp);
    comp.onSubmit();
    const result = close.mock.calls[0]?.[0] as UserFormResult;
    expect(result).toEqual(
      expect.objectContaining({
        username: 'alice',
        displayName: 'Alice',
        email: 'a@example.com',
        role: 'user',
        isActive: true,
        password: '12345678',
      }),
    );
  });

  it('keeps the dialog open and blocks duplicate submit while the API is pending', async () => {
    const pending = new Subject<SilentResult<unknown>>();
    const submit = jest.fn(() => pending.asObservable());
    const { comp, close } = await setup({ mode: 'create', submit });
    fillValidCreate(comp);

    comp.onSubmit();
    comp.onSubmit();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(comp.submitting()).toBe(true);
    expect(close).not.toHaveBeenCalled();

    pending.next({
      ok: false,
      error: new HttpErrorResponse({
        status: 500,
        error: { message: 'Server exploded' },
      }),
    });
    expect(comp.submitting()).toBe(false);
    expect(comp.error()).toBe('Server exploded');
    expect(close).not.toHaveBeenCalled();
  });

  it('closes only after a successful API callback', async () => {
    const pending = new Subject<SilentResult<unknown>>();
    const submit = jest.fn(() => pending.asObservable());
    const { comp, close } = await setup({ mode: 'create', submit });
    fillValidCreate(comp);

    comp.onSubmit();
    pending.next({ ok: true, data: {} });
    expect(comp.submitting()).toBe(false);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('onSubmit() in edit mode returns NO password field', async () => {
    const { comp, close } = await setup({ mode: 'edit', user: EDIT_USER });
    comp.username.set('alice');
    comp.displayName.set('Alice');
    comp.email.set('a@example.com');
    comp.onSubmit();
    const result = close.mock.calls[0]?.[0] as UserFormResult;
    expect(result).not.toHaveProperty('password');
    expect(result?.username).toBe('alice');
  });

  // ── TZ-ADMIN-306: role dropdown = live API list ──

  it('loads system + custom roles from the API with RU labels (system-first order)', async () => {
    const { comp } = await setup({ mode: 'create' });
    expect(comp.rolesLoading()).toBe(false);
    expect(comp.rolesError()).toBeNull();
    // System roles first in canonical order, then custom roles by RU label.
    expect(comp.roleOptions()).toEqual([
      { name: 'admin', label: 'Администратор' },
      { name: 'director', label: 'Директор' },
      { name: 'manager', label: 'Менеджер' },
      { name: 'user', label: 'Пользователь' },
      { name: 'packer', label: 'Упаковщик' },
    ]);
  });

  it('renders the custom role as a selectable <option> in the dropdown', async () => {
    const { fixture } = await setup({ mode: 'create' });
    const options = Array.from(
      fixture.nativeElement.querySelectorAll('select[data-test="user-form-role"] option'),
    ) as HTMLOptionElement[];
    const values = options.map((o) => o.value);
    expect(values).toContain('packer');
    expect(values).toContain('director');
    const packer = options.find((o) => o.value === 'packer');
    expect(packer?.textContent?.trim()).toBe('Упаковщик');
  });

  it('keeps the current role in the list when the API no longer returns it (edit mode)', async () => {
    const withoutManager = defaultRoles().filter((r) => r.name !== 'manager');
    const { comp } = await setup({ mode: 'edit', user: EDIT_USER }, withoutManager);
    const names = comp.roleOptions().map((o) => o.name);
    expect(names).toContain('manager');
  });

  it('falls back to canonical system roles and surfaces the error when the API fails', async () => {
    const close = jest.fn();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } satisfies UserFormData },
        { provide: PI_DIALOG_REF, useValue: { close } },
      ],
    })
      .overrideComponent(UserFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(UserFormDialogComponent);
    const httpMock = TestBed.inject(HttpTestingController);
    httpMock
      .expectOne(`${BASE_URL}/admin/roles?page=1&limit=200`)
      .flush({ message: 'Server exploded' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as UserFormHarness;
    expect(comp.rolesLoading()).toBe(false);
    expect(comp.rolesError()).toBe('Server exploded');
    expect(comp.roleOptions().map((o) => o.name)).toEqual([
      'admin',
      'director',
      'manager',
      'user',
    ]);
  });
});
