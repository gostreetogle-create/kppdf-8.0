import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import type { SilentResult } from '../../core/silent-http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import {
  RoleFormDialogComponent,
  regroupPermissions,
  type RoleFormData,
} from './role-form-dialog.component';
import type {
  PermissionCatalogResponse,
  PermissionSection,
} from '../../shared/services/pi-permissions.service';

/**
 * TZ-264 — RoleFormDialogComponent unit spec.
 *
 * The smoke test instantiates the dialog through TestBed (template
 * compilation — NG5xxx regression guard). loadCatalog success/error is
 * covered via HttpTestingController against the real
 * PermissionsCatalogService + silentGet; the permissions checkbox logic
 * (toggleKey / toggleSection / sectionAllSelected / selectedCount) is
 * exercised directly.
 */

const CATALOG: PermissionCatalogResponse = {
  sections: [
    {
      section: 'user',
      permissions: [
        { key: 'user:read', action: 'read', description: 'Смотреть список пользователей' },
        { key: 'user:admin', action: 'admin', description: 'Удалять пользователей и менять роли' },
      ],
    },
    {
      section: 'role',
      permissions: [{ key: 'role:read', action: 'read', description: 'Смотреть список ролей' }],
    },
    {
      section: 'material',
      permissions: [{ key: 'material:read', action: 'read', description: 'Смотреть материалы' }],
    },
  ],
};

interface RoleHarness {
  sections: () => PermissionSection[];
  catalogLoading: () => boolean;
  catalogError: () => string | null;
  selectedCount: () => number;
  isSelected: (key: string) => boolean;
  toggleKey: (key: string) => void;
  sectionAllSelected: (s: PermissionSection) => boolean;
  toggleSection: (s: PermissionSection, select: boolean) => void;
  name: { set: (v: string) => void };
  label: { set: (v: string) => void };
  onSubmit: () => void;
  submitting: () => boolean;
  error: () => string | null;
}

async function setup(data: RoleFormData): Promise<{
  comp: RoleHarness;
  close: jest.Mock;
  httpMock: HttpTestingController;
  fixture: ReturnType<typeof TestBed.createComponent<RoleFormDialogComponent>>;
}> {
  const close = jest.fn();
  await TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withFetch()),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '/api' },
      { provide: PI_DIALOG_DATA, useValue: data },
      { provide: PI_DIALOG_REF, useValue: { close } },
    ],
  })
    .overrideComponent(RoleFormDialogComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    })
    .compileComponents();
  const fixture = TestBed.createComponent(RoleFormDialogComponent);
  return {
    comp: fixture.componentInstance as unknown as RoleHarness,
    close,
    httpMock: TestBed.inject(HttpTestingController),
    fixture,
  };
}

describe('RoleFormDialogComponent', () => {
  it('instantiates (template compiles — NG5xxx regression guard)', async () => {
    const { fixture, httpMock } = await setup({ mode: 'create' });
    httpMock.expectOne('/api/admin/permissions').flush(CATALOG);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
    httpMock.verify();
  });

  it('loadCatalog: on success fills sections and clears loading', async () => {
    const { comp, fixture, httpMock } = await setup({ mode: 'create' });
    expect(comp.catalogLoading()).toBe(true);
    httpMock.expectOne('/api/admin/permissions').flush(CATALOG);
    await fixture.whenStable();
    expect(comp.catalogLoading()).toBe(false);
    expect(comp.catalogError()).toBeNull();
    expect(comp.sections().length).toBe(3);
    expect(comp.sections()[0].section).toBe('user');
    httpMock.verify();
  });

  it('regroupPermissions merges user+role into Администрирование', () => {
    const groups = regroupPermissions(CATALOG.sections);
    expect(groups[0].id).toBe('admin');
    expect(groups[0].title).toBe('Администрирование');
    expect(groups[0].permissions.map((p) => p.key)).toEqual([
      'user:read',
      'user:admin',
      'role:read',
    ]);
    expect(groups.some((g) => g.id === 'catalog')).toBe(true);
  });

  it('loadCatalog: on HTTP error sets catalogError', async () => {
    const { comp, fixture, httpMock } = await setup({ mode: 'create' });
    httpMock
      .expectOne('/api/admin/permissions')
      .flush({ message: 'Server exploded' }, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(comp.catalogLoading()).toBe(false);
    expect(comp.catalogError()).not.toBeNull();
    httpMock.verify();
  });

  it('keeps the dialog open and blocks duplicate submit on API error', async () => {
    const pending = new Subject<SilentResult<unknown>>();
    const submit = jest.fn(() => pending.asObservable());
    const { comp, fixture, httpMock, close } = await setup({ mode: 'create', submit });
    httpMock.expectOne('/api/admin/permissions').flush(CATALOG);
    await fixture.whenStable();
    comp.name.set('custom');
    comp.label.set('Custom role');

    comp.onSubmit();
    comp.onSubmit();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(comp.submitting()).toBe(true);
    pending.next({
      ok: false,
      error: new HttpErrorResponse({ status: 500, error: { message: 'Server exploded' } }),
    });
    expect(comp.submitting()).toBe(false);
    expect(comp.error()).toBe('Server exploded');
    expect(close).not.toHaveBeenCalled();
    httpMock.verify();
  });

  it('closes after a successful API callback', async () => {
    const pending = new Subject<SilentResult<unknown>>();
    const submit = jest.fn(() => pending.asObservable());
    const { comp, fixture, httpMock, close } = await setup({ mode: 'create', submit });
    httpMock.expectOne('/api/admin/permissions').flush(CATALOG);
    await fixture.whenStable();
    comp.name.set('custom');
    comp.label.set('Custom role');

    comp.onSubmit();
    pending.next({ ok: true, data: {} });
    expect(comp.submitting()).toBe(false);
    expect(close).toHaveBeenCalledTimes(1);
    httpMock.verify();
  });

  it('toggleKey adds and removes a permission key', async () => {
    const { comp, fixture, httpMock } = await setup({ mode: 'create' });
    httpMock.expectOne('/api/admin/permissions').flush(CATALOG);
    await fixture.whenStable();
    expect(comp.selectedCount()).toBe(0);
    comp.toggleKey('user:read');
    expect(comp.selectedCount()).toBe(1);
    expect(comp.isSelected('user:read')).toBe(true);
    comp.toggleKey('user:read');
    expect(comp.selectedCount()).toBe(0);
    expect(comp.isSelected('user:read')).toBe(false);
    httpMock.verify();
  });

  it('toggleSection selects/unselects all permissions of a section', async () => {
    const { comp, fixture, httpMock } = await setup({ mode: 'create' });
    httpMock.expectOne('/api/admin/permissions').flush(CATALOG);
    await fixture.whenStable();
    const userSection = comp.sections()[0];
    expect(comp.sectionAllSelected(userSection)).toBe(false);
    comp.toggleSection(userSection, true);
    expect(comp.selectedCount()).toBe(2);
    expect(comp.sectionAllSelected(userSection)).toBe(true);
    comp.toggleSection(userSection, false);
    expect(comp.selectedCount()).toBe(0);
    expect(comp.sectionAllSelected(userSection)).toBe(false);
    httpMock.verify();
  });
});
