import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import type { SilentResult } from '../../core/silent-http';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import {
  UserFormDialogComponent,
  type UserFormData,
  type UserFormResult,
} from './user-form-dialog.component';

/**
 * TZ-264 — UserFormDialogComponent unit spec.
 *
 * Smoke tests instantiate both create and edit modes through TestBed
 * (template compilation — NG5xxx regression guard). Validation and
 * result-shape logic (canSubmit / onSubmit) are exercised directly.
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
}

const EDIT_USER = {
  id: 'u1',
  username: 'alice',
  email: 'a@example.com',
  displayName: 'Alice',
  role: 'manager',
  isActive: true,
};

async function setup(data: UserFormData): Promise<{
  comp: UserFormHarness;
  close: jest.Mock;
}> {
  const close = jest.fn();
  await TestBed.configureTestingModule({
    providers: [
      { provide: PI_DIALOG_DATA, useValue: data },
      { provide: PI_DIALOG_REF, useValue: { close } },
    ],
  })
    .overrideComponent(UserFormDialogComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    })
    .compileComponents();
  const fixture = TestBed.createComponent(UserFormDialogComponent);
  return { comp: fixture.componentInstance as unknown as UserFormHarness, close };
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
});
