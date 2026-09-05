import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CheckboxComponent } from '@kppdf/ui/checkbox';
import { of } from 'rxjs';
import { PiWorkTypesService } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { WorkTypeFormDialogComponent } from './work-type-form-dialog.component';

describe('WorkTypeFormDialogComponent (TZ-NX-REGISTRIES-WORK-TYPES)', () => {
  let fixture: ComponentFixture<WorkTypeFormDialogComponent>;
  const close = jest.fn();
  const create = jest.fn().mockReturnValue(
    of({ ok: true, data: { _id: 'wt-1', name: 'Сварка', isActive: true, hourlyRate: 500 } }),
  );

  beforeEach(async () => {
    close.mockReset();
    create.mockClear();
    await TestBed.configureTestingModule({
      imports: [WorkTypeFormDialogComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create', workType: null } },
        { provide: PI_DIALOG_REF, useValue: { close } as DialogRef<unknown> },
        { provide: PiWorkTypesService, useValue: { create, update: jest.fn(), archive: jest.fn() } },
      ],
    })
      .overrideComponent(CheckboxComponent, {
        remove: { imports: [LucideAngularModule] },
      })
      .overrideComponent(CheckboxComponent, {
        set: { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(WorkTypeFormDialogComponent);
    fixture.detectChanges();
  });

  it('requires a non-negative hourly rate', async () => {
    const component = fixture.componentInstance as unknown as { form: { controls: { name: { setValue: (v: string) => void }; hourlyRate: { setValue: (v: number | null) => void } }; invalid: boolean }; onSubmit: () => Promise<void> };
    component.form.controls.name.setValue('Сварка');
    component.form.controls.hourlyRate.setValue(null);
    await component.onSubmit();
    expect(create).not.toHaveBeenCalled();
    expect(component.form.invalid).toBe(true);

    component.form.controls.hourlyRate.setValue(-1);
    await component.onSubmit();
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a work type with days, rate, hue, and active state', async () => {
    const component = fixture.componentInstance as unknown as { form: { patchValue: (value: Record<string, unknown>) => void }; onSubmit: () => Promise<void> };
    component.form.patchValue({ name: ' Сварка ', hourlyRate: 500, days: 2, accentHue: 250, isActive: true });
    await component.onSubmit();
    expect(create).toHaveBeenCalledWith({
      name: 'Сварка',
      hourlyRate: 500,
      days: 2,
      accentHue: 250,
      isActive: true,
    });
    expect(close).toHaveBeenCalled();
  });
});
