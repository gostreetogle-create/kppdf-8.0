/**
 * TZ-UX-FORM-312 — PeopleFormDialogComponent tests.
 *
 * Locks the 12-col density pack:
 *   - ФИО: md:grid-cols-12, three fields at md:col-span-4 each;
 *   - Контакты: single md:grid-cols-12 row (position=8, department=4, email=8, phone=4);
 *   - phone wrapped with max-w-[14rem] (not full-width on half the dialog);
 *   - data-test attributes preserved.
 */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LucideAngularModule, Check, Minus } from 'lucide-angular';
import { PeopleFormDialogComponent } from './people-form-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiWorkersService } from '../../shared/services/pi-workers.service';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';
import { PiToastService } from '../../shared/ui/toast';

describe('PeopleFormDialogComponent (TZ-UX-FORM-312)', () => {
  let fixture: ComponentFixture<PeopleFormDialogComponent>;
  let close: jest.Mock;
  let success: jest.Mock;
  let workersSvc: { create: jest.Mock; update: jest.Mock };
  let workTypesSvc: { list: jest.Mock };

  beforeEach(async () => {
    close = jest.fn();
    success = jest.fn();
    workersSvc = { create: jest.fn(), update: jest.fn() };
    workTypesSvc = { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) };

    await TestBed.configureTestingModule({
      imports: [PeopleFormDialogComponent, LucideAngularModule.pick({ Check, Minus })],
      schemas: [NO_ERRORS_SCHEMA],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_REF, useValue: { close } },
        { provide: PI_DIALOG_DATA, useValue: null },
        { provide: PiWorkersService, useValue: workersSvc },
        { provide: WorkTypesService, useValue: workTypesSvc },
        { provide: PiToastService, useValue: { success, error: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PeopleFormDialogComponent);
    fixture.detectChanges();
  });

  it('instantiates in create mode', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the form with data-test', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="people-form"]')).toBeTruthy();
  });

  it('renders ФИО inputs with correct data-test attributes', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="last-name-input"]')).toBeTruthy();
    expect(el.querySelector('[data-test="first-name-input"]')).toBeTruthy();
    expect(el.querySelector('[data-test="patronymic-input"]')).toBeTruthy();
  });

  it('renders contact inputs with correct data-test attributes', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="position-input"]')).toBeTruthy();
    expect(el.querySelector('[data-test="department-input"]')).toBeTruthy();
    expect(el.querySelector('[data-test="email-input"]')).toBeTruthy();
    expect(el.querySelector('[data-test="phone-input"]')).toBeTruthy();
  });

  it('ФИО section uses md:grid-cols-12 (not sm:grid-cols-3)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('[data-test="form-section-people-sec-basics"]');
    expect(section).toBeTruthy();
    const grid = section!.querySelector('.grid');
    expect(grid).toBeTruthy();
    expect(grid!.className).toContain('md:grid-cols-12');
    expect(grid!.className).not.toContain('sm:grid-cols-3');
  });

  it('Контакты section uses a single md:grid-cols-12 row (not two separate sm:grid-cols-2 grids)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('[data-test="form-section-people-sec-contact"]');
    expect(section).toBeTruthy();
    const grids = section!.querySelectorAll('.grid');
    // Exactly one md:grid-cols-12 grid, no sm:grid-cols-2 anywhere in the section
    const md12 = Array.from(grids).filter((g) =>
      (g as HTMLElement).className.includes('md:grid-cols-12'),
    );
    expect(md12.length).toBe(1);
    const sm2 = section!.querySelector('.sm\\:grid-cols-2');
    expect(sm2).toBeNull();
  });

  it('phone is wrapped with max-w-[14rem] (not full-width half-dialog)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const phoneInput = el.querySelector('[data-test="phone-input"]');
    expect(phoneInput).toBeTruthy();
    const phoneWrapper = phoneInput!.closest('.max-w-\\[14rem\\]');
    expect(phoneWrapper).toBeTruthy();
  });

  it('submit calls create for new person', () => {
    workersSvc.create.mockReturnValue(
      of({ ok: true, data: { _id: 'w1', lastName: 'Иванов', firstName: 'Иван' } }),
    );

    const form = fixture.nativeElement.querySelector('[data-test="people-form"]');
    expect(form).toBeTruthy();

    // Fill required fields
    fixture.componentInstance.form.controls.lastName.setValue('Иванов');
    fixture.componentInstance.form.controls.firstName.setValue('Иван');

    fixture.componentInstance['onSubmit']();
    fixture.detectChanges();

    expect(workersSvc.create).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalled();
  });

  it('cancel closes without saving', () => {
    const btn = fixture.nativeElement.querySelector('[data-test="cancel-button"]');
    expect(btn).toBeTruthy();
    btn!.click();
    fixture.detectChanges();
    expect(close).toHaveBeenCalledWith(null);
  });
});
