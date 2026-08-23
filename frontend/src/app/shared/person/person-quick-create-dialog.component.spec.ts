import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PersonQuickCreateDialogComponent } from './person-quick-create-dialog.component';
import { PI_DIALOG_REF } from '../ui/dialog/dialog.tokens';
import { PersonsService } from '../services/pi-persons.service';
import { PiToastService } from '../ui/toast';

type Editor = PersonQuickCreateDialogComponent & {
  form: {
    controls: Record<string, { setValue: (v: string) => void }>;
    markAllAsTouched: () => void;
    invalid: boolean;
  };
  onSubmit: () => void;
  errorMessage: () => string | null;
};

describe('PersonQuickCreateDialogComponent (TZ-PARTY-306)', () => {
  let fixture: ComponentFixture<PersonQuickCreateDialogComponent>;
  let create: jest.Mock;
  let close: jest.Mock;

  beforeEach(async () => {
    create = jest.fn();
    close = jest.fn();
    await TestBed.configureTestingModule({
      imports: [PersonQuickCreateDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_REF, useValue: { closed: signal(undefined), close } },
        { provide: PersonsService, useValue: { create } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PersonQuickCreateDialogComponent);
    fixture.detectChanges();
  });

  it('renders compact contact form', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="person-quick-create-form"]')).toBeTruthy();
    expect(el.querySelector('[data-test="pqc-first-name"]')).toBeTruthy();
  });

  it('creates person via PersonsService and closes dialog', () => {
    create.mockReturnValue(
      of({
        ok: true,
        data: { _id: 'p-new', firstName: 'Иван', lastName: 'Иванов' },
      }),
    );
    const editor = fixture.componentInstance as Editor;
    editor.form.controls.firstName.setValue('Иван');
    editor.onSubmit();

    expect(create).toHaveBeenCalledWith({ firstName: 'Иван' });
    expect(close).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'p-new', firstName: 'Иван' }),
    );
  });

  it('refuses submit without first name', () => {
    const editor = fixture.componentInstance as Editor;
    editor.onSubmit();
    expect(create).not.toHaveBeenCalled();
  });
});
