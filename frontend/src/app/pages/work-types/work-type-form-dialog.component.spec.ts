import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';
import { toOptionalNumber } from '../../shared/forms/to-optional-number';
import { WorkTypeFormDialogComponent } from './work-type-form-dialog.component';

type FormControlHarness = {
  setValue(value: unknown): void;
};

type ComponentHarness = {
  form: {
    controls: {
      name: FormControlHarness;
      hourlyRate: FormControlHarness;
      defaultDurationHours: FormControlHarness;
      days: FormControlHarness;
      accentHue: FormControlHarness;
    };
  };
  onSubmit(): void;
};

describe('WorkTypeFormDialogComponent (TZ-FORMS-314)', () => {
  let fixture: ComponentFixture<WorkTypeFormDialogComponent>;
  let create: jest.Mock;

  beforeEach(async () => {
    create = jest.fn(() =>
      of({
        ok: true,
        data: { _id: 'wt-1', name: 'Покраска', hourlyRate: 150 },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [WorkTypeFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: null },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } },
        { provide: WorkTypesService, useValue: { create, update: jest.fn() } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    })
      .overrideComponent(WorkTypeFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkTypeFormDialogComponent);
    fixture.detectChanges();
  });

  function component(): ComponentHarness {
    return fixture.componentInstance as unknown as ComponentHarness;
  }

  it('normalizes optional values at the submit boundary', () => {
    expect(toOptionalNumber(null)).toBeUndefined();
    expect(toOptionalNumber('')).toBeUndefined();
    expect(toOptionalNumber('150')).toBe(150);
    expect(toOptionalNumber(Number.NaN)).toBeUndefined();
  });

  it('sends hourlyRate as a number when the input value is a string', () => {
    const harness = component();
    harness.form.controls.name.setValue('Покраска');
    harness.form.controls.hourlyRate.setValue('150');

    harness.onSubmit();

    const payload = create.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.hourlyRate).toBe(150);
    expect(typeof payload.hourlyRate).toBe('number');
  });

  it('omits empty duration instead of sending an empty string', () => {
    const harness = component();
    harness.form.controls.name.setValue('Покраска');
    harness.form.controls.hourlyRate.setValue('150');
    harness.form.controls.defaultDurationHours.setValue('');
    harness.form.controls.accentHue.setValue(null);

    harness.onSubmit();

    const payload = create.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('defaultDurationHours');
    expect(payload).not.toHaveProperty('accentHue');
    expect(payload).not.toHaveProperty('defaultDurationHours', '');
    expect(payload.days).toBeNull();
  });
});
