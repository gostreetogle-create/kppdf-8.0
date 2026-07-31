import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { UnitFormDialogComponent } from './unit-form-dialog.component';
import { UnitsService } from '../dictionaries/units.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';

const ref = { close: jest.fn(), closed: undefined };
const toast = { success: jest.fn(), error: jest.fn() };

describe('UnitFormDialogComponent', () => {
  const create = jest.fn();
  const update = jest.fn();

  beforeEach(async () => {
    create.mockReset();
    update.mockReset();
    ref.close.mockReset();
    toast.success.mockReset();
    await TestBed.configureTestingModule({
      providers: [
        { provide: PI_DIALOG_DATA, useValue: null },
        { provide: PI_DIALOG_REF, useValue: ref },
        { provide: UnitsService, useValue: { create, update } },
        { provide: PiToastService, useValue: toast },
      ],
    })
      .overrideComponent(UnitFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('starts in create mode and validates the unit key', () => {
    const fixture = TestBed.createComponent(UnitFormDialogComponent);
    const component = fixture.componentInstance as unknown as {
      form: { controls: { key: { setValue: (value: string) => void; invalid: boolean } } };
      errorFor: (name: string) => string;
    };

    component.form.controls.key.setValue('bad key');
    component.form.controls.key.markAsTouched();
    expect(component.form.controls.key.invalid).toBe(true);
    expect(component.errorFor('key')).toBe('Недопустимый формат ключа');
    fixture.destroy();
  });

  it('POSTs a valid unit payload and closes on success', () => {
    const unit = { _id: 'u-1', key: 'kg', label: 'Килограмм' };
    create.mockReturnValue(of({ ok: true, data: unit }));
    const fixture = TestBed.createComponent(UnitFormDialogComponent);
    const component = fixture.componentInstance as unknown as {
      form: { patchValue: (value: unknown) => void };
      onSubmit: () => void;
    };
    component.form.patchValue({ key: 'kg', label: 'Килограмм', symbol: 'кг', category: 'mass' });

    component.onSubmit();

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'kg', label: 'Килограмм', symbol: 'кг', category: 'mass' }),
    );
    expect(ref.close).toHaveBeenCalledWith(unit);
    expect(toast.success).toHaveBeenCalledWith('Единица создана');
    fixture.destroy();
  });
});
