import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { PersonFormDialogComponent } from './person-form-dialog.component';
import { PersonService } from '../../shared/services/pi-person.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';

const ref = { close: jest.fn(), closed: undefined };
const toast = { success: jest.fn(), error: jest.fn() };

describe('PersonFormDialogComponent', () => {
  const create = jest.fn();
  const update = jest.fn();

  beforeEach(async () => {
    create.mockReset();
    update.mockReset();
    ref.close.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
    await TestBed.configureTestingModule({
      providers: [
        { provide: PI_DIALOG_DATA, useValue: null },
        { provide: PI_DIALOG_REF, useValue: ref },
        { provide: PersonService, useValue: { create, update } },
        { provide: PiToastService, useValue: toast },
      ],
    })
      .overrideComponent(PersonFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('starts in create mode and rejects missing required names', () => {
    const fixture = TestBed.createComponent(PersonFormDialogComponent);
    const component = fixture.componentInstance as unknown as {
      isEdit: boolean;
      form: {
        invalid: boolean;
        controls: {
          firstName: { touched: boolean };
          lastName: { touched: boolean };
        };
      };
      onSubmit: () => void;
    };

    expect(component.isEdit).toBe(false);
    expect(component.form.invalid).toBe(true);
    component.onSubmit();
    expect(component.form.controls.firstName.touched).toBe(true);
    expect(component.form.controls.lastName.touched).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it('POSTs a valid person payload and closes on success', () => {
    const person = { _id: 'p-1', firstName: 'Иван', lastName: 'Петров' };
    create.mockReturnValue(of({ ok: true, data: person }));
    const fixture = TestBed.createComponent(PersonFormDialogComponent);
    const component = fixture.componentInstance as unknown as {
      form: { patchValue: (value: unknown) => void };
      onSubmit: () => void;
    };
    component.form.patchValue({ firstName: 'Иван', lastName: 'Петров', email: 'ivan@example.com' });

    component.onSubmit();

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@example.com',
      }),
    );
    expect(ref.close).toHaveBeenCalledWith(person);
    expect(toast.success).toHaveBeenCalledWith('Физическое лицо создано');
    fixture.destroy();
  });
});
