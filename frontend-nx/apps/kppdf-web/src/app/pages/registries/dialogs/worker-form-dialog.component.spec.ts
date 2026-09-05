import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { of } from 'rxjs';
import { PiPeopleService, PiWorkTypesService } from '@kppdf/data-access';
import { CheckboxComponent } from '@kppdf/ui/checkbox';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { WorkerFormDialogComponent } from './worker-form-dialog.component';

describe('WorkerFormDialogComponent (TZ-NX-REGISTRIES-WORKERS)', () => {
  let fixture: ComponentFixture<WorkerFormDialogComponent>;
  const close = jest.fn();
  const create = jest.fn().mockReturnValue(
    of({ ok: true, data: { _id: 'worker-1', lastName: 'Иванов', firstName: 'Иван', isActive: true } }),
  );

  beforeEach(async () => {
    close.mockReset();
    create.mockClear();
    await TestBed.configureTestingModule({
      imports: [WorkerFormDialogComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create', person: null } },
        { provide: PI_DIALOG_REF, useValue: { close } as DialogRef<unknown> },
        { provide: PiPeopleService, useValue: { create, update: jest.fn(), getById: jest.fn(), archive: jest.fn() } },
        {
          provide: PiWorkTypesService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({ ok: true, data: { items: [{ _id: 'wt-1', name: 'Сварка', isActive: true, days: 2 }], total: 1 } }),
            ),
          },
        },
      ],
    })
      .overrideComponent(CheckboxComponent, { remove: { imports: [LucideAngularModule] } })
      .overrideComponent(CheckboxComponent, { set: { schemas: [CUSTOM_ELEMENTS_SCHEMA] } })
      .compileComponents();
    fixture = TestBed.createComponent(WorkerFormDialogComponent);
    fixture.detectChanges();
  });

  it('renders identity fields and active work types', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="worker-form"]')).toBeTruthy();
    expect(el.querySelector('[data-test="worker-last-name"]')).toBeTruthy();
    expect(el.querySelector('[data-test="worker-first-name"]')).toBeTruthy();
    expect(el.querySelector('[data-test="worker-work-type-wt-1"]')).toBeTruthy();
  });

  it('does not show a days suffix next to a work type skill', () => {
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('[data-test="worker-work-type-wt-1"]')?.closest('label');
    expect(label?.textContent ?? '').not.toMatch(/\d+\s*д/);
  });

  it('does not submit without both required identity fields', async () => {
    await fixture.componentInstance['onSubmit']();
    expect(create).not.toHaveBeenCalled();
    expect(fixture.componentInstance['form'].invalid).toBe(true);
  });

  it('creates a worker with selected workTypeIds', async () => {
    const component = fixture.componentInstance as unknown as {
      form: { patchValue: (value: Record<string, unknown>) => void };
      toggleWorkType: (id: string, event: Event) => void;
      onSubmit: () => Promise<void>;
    };
    component.form.patchValue({
      lastName: ' Иванов ',
      firstName: ' Иван ',
      email: 'IVAN@EXAMPLE.COM',
      position: 'Сварщик',
    });
    component.toggleWorkType('wt-1', { target: { checked: true } } as unknown as Event);
    await component.onSubmit();
    expect(create).toHaveBeenCalledWith({
      lastName: 'Иванов',
      firstName: 'Иван',
      workTypeIds: ['wt-1'],
      isActive: true,
      email: 'ivan@example.com',
      position: 'Сварщик',
    });
    expect(close).toHaveBeenCalled();
  });
});
