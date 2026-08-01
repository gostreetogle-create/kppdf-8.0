import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import {
  ResetPasswordDialogComponent,
  type ResetPasswordData,
} from './reset-password-dialog.component';

/**
 * TZ-264 — ResetPasswordDialogComponent unit spec.
 *
 * The smoke test instantiates the dialog through TestBed, which forces
 * Angular template compilation — a permanent regression guard against
 * NG5xxx (e.g. the TZ-261 `as`-casts-in-templates class of bug that
 * `tsc` cannot catch).
 *
 * Child primitives (app-pi-dialog / app-pi-button) are tolerated via
 * NO_ERRORS_SCHEMA; DI comes from the PI_DIALOG_DATA / PI_DIALOG_REF
 * tokens exactly as the page's PiDialogService.open() provides them.
 */

interface ResetHarness {
  password: { set: (v: string) => void };
  confirm: { set: (v: string) => void };
  error: () => string | null;
  canSubmit: () => boolean;
  onSubmit: () => void;
}

async function setup(data: ResetPasswordData): Promise<{
  comp: ResetHarness;
  close: jest.Mock;
  fixture: ReturnType<typeof TestBed.createComponent<ResetPasswordDialogComponent>>;
}> {
  const close = jest.fn();
  await TestBed.configureTestingModule({
    providers: [
      { provide: PI_DIALOG_DATA, useValue: data },
      { provide: PI_DIALOG_REF, useValue: { close } },
    ],
  })
    .overrideComponent(ResetPasswordDialogComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    })
    .compileComponents();
  const fixture = TestBed.createComponent(ResetPasswordDialogComponent);
  return { comp: fixture.componentInstance as unknown as ResetHarness, close, fixture };
}

describe('ResetPasswordDialogComponent', () => {
  it('instantiates (template compiles — NG5xxx regression guard)', async () => {
    const { fixture } = await setup({ username: 'alice' });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('canSubmit() is false when password is shorter than 8 chars', async () => {
    const { comp } = await setup({ username: 'alice' });
    comp.password.set('1234567');
    expect(comp.canSubmit()).toBe(false);
  });

  it('canSubmit() is true when password has 8+ chars', async () => {
    const { comp } = await setup({ username: 'alice' });
    comp.password.set('12345678');
    expect(comp.canSubmit()).toBe(true);
  });

  it('onSubmit() with mismatched confirm sets error and does NOT close the dialog', async () => {
    const { comp, close } = await setup({ username: 'alice' });
    comp.password.set('12345678');
    comp.confirm.set('87654321');
    comp.onSubmit();
    expect(comp.error()).toBe('Пароли не совпадают');
    expect(close).not.toHaveBeenCalled();
  });

  it('onSubmit() with matching confirm closes the dialog with the password', async () => {
    const { comp, close } = await setup({ username: 'alice' });
    comp.password.set('12345678');
    comp.confirm.set('12345678');
    comp.onSubmit();
    expect(close).toHaveBeenCalledWith('12345678');
    expect(comp.error()).toBeNull();
  });
});
