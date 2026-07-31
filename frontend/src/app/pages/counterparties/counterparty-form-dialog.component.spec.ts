import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { CounterpartyFormDialogComponent } from './counterparty-form-dialog.component';
import { CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';

const ref = { close: jest.fn(), closed: undefined };
const toast = { success: jest.fn(), error: jest.fn() };
const roles = [
  { _id: 'role-1', name: 'Покупатель', slug: 'customer', isActive: true, isSystem: true },
  { _id: 'role-2', name: 'Неактивная роль', slug: 'old', isActive: false, isSystem: false },
];

describe('CounterpartyFormDialogComponent', () => {
  const listRoles = jest.fn();
  const create = jest.fn();
  const update = jest.fn();

  beforeEach(async () => {
    listRoles.mockReset().mockReturnValue(of({ ok: true, data: roles }));
    create.mockReset();
    update.mockReset();
    ref.close.mockReset();
    toast.success.mockReset();
    await TestBed.configureTestingModule({
      providers: [
        { provide: PI_DIALOG_DATA, useValue: null },
        { provide: PI_DIALOG_REF, useValue: ref },
        { provide: CounterpartyService, useValue: { listRoles, create, update } },
        { provide: PiToastService, useValue: toast },
      ],
    })
      .overrideComponent(CounterpartyFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('loads only active roles and rejects an empty role selection', () => {
    const fixture = TestBed.createComponent(CounterpartyFormDialogComponent);
    const component = fixture.componentInstance as unknown as {
      roles: () => Array<{ slug: string }>;
      form: {
        invalid: boolean;
        controls: {
          name: { touched: boolean };
          inn: { touched: boolean };
          roles: { touched: boolean };
        };
      };
      onSubmit: () => void;
    };

    expect(listRoles).toHaveBeenCalledTimes(1);
    expect(component.roles().map((role) => role.slug)).toEqual(['customer']);
    expect(component.form.invalid).toBe(true);
    component.onSubmit();
    expect(component.form.controls.name.touched).toBe(true);
    expect(component.form.controls.inn.touched).toBe(true);
    expect(component.form.controls.roles.touched).toBe(true);
    expect(create).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('blocks submission when the role lookup fails', () => {
    listRoles.mockReturnValueOnce(
      of({ ok: false, error: new HttpErrorResponse({ status: 503, statusText: 'Unavailable' }) }),
    );
    const fixture = TestBed.createComponent(CounterpartyFormDialogComponent);
    const component = fixture.componentInstance as unknown as {
      rolesLoadError: () => string | null;
      form: { patchValue: (value: unknown) => void };
      onSubmit: () => void;
    };

    component.form.patchValue({ name: 'ООО Ромашка', inn: '1234567890', roles: ['customer'] });
    component.onSubmit();

    expect(component.rolesLoadError()).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('POSTs selected roles in the counterparty payload and closes on success', () => {
    const counterparty = {
      _id: 'cp-1',
      name: 'ООО Ромашка',
      inn: '1234567890',
      roles: ['customer'],
    };
    create.mockReturnValue(of({ ok: true, data: counterparty }));
    const fixture = TestBed.createComponent(CounterpartyFormDialogComponent);
    const component = fixture.componentInstance as unknown as {
      form: { patchValue: (value: unknown) => void };
      onRoleToggle: (slug: string, checked: boolean) => void;
      onSubmit: () => void;
    };
    component.form.patchValue({ name: 'ООО Ромашка', inn: '1234567890' });
    component.onRoleToggle('customer', true);

    component.onSubmit();

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ООО Ромашка', inn: '1234567890', roles: ['customer'] }),
    );
    expect(ref.close).toHaveBeenCalledWith(counterparty);
    expect(toast.success).toHaveBeenCalledWith('Контрагент создан');
    fixture.destroy();
  });
});
