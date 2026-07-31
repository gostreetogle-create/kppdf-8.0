import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { CurrencyFormDialogComponent } from './currency-form-dialog.component';
import { CurrencyService } from '../../shared/services/pi-currency.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';

const ref = { close: jest.fn(), closed: undefined };
const toast = { success: jest.fn(), error: jest.fn() };

describe('CurrencyFormDialogComponent', () => {
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
        { provide: CurrencyService, useValue: { create, update } },
        { provide: PiToastService, useValue: toast },
      ],
    })
      .overrideComponent(CurrencyFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('starts in create mode and validates the ISO key format', () => {
    const fixture = TestBed.createComponent(CurrencyFormDialogComponent);
    const component = fixture.componentInstance as unknown as {
      form: { controls: { key: { setValue: (value: string) => void; invalid: boolean } } };
      errorFor: (name: string) => string;
    };

    component.form.controls.key.setValue('rub');
    component.form.controls.key.markAsTouched();
    expect(component.form.controls.key.invalid).toBe(true);
    expect(component.errorFor('key')).toBe('Используйте 2–8 заглавных латинских букв');
    fixture.destroy();
  });

  it('POSTs a valid currency payload and closes on success', () => {
    const currency = { _id: 'c-1', key: 'RUB', label: 'Рубль' };
    create.mockReturnValue(of({ ok: true, data: currency }));
    const fixture = TestBed.createComponent(CurrencyFormDialogComponent);
    const component = fixture.componentInstance as unknown as {
      form: { patchValue: (value: unknown) => void };
      onSubmit: () => void;
    };
    component.form.patchValue({ key: 'RUB', label: 'Рубль', code: '643', symbol: '₽' });

    component.onSubmit();

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'RUB', label: 'Рубль', code: '643', symbol: '₽' }),
    );
    expect(ref.close).toHaveBeenCalledWith(currency);
    expect(toast.success).toHaveBeenCalledWith('Валюта создана');
    fixture.destroy();
  });
});
