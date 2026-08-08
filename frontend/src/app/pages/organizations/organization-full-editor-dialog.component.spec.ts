import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrganizationFullEditorDialogComponent } from './organization-full-editor-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import {
  OrganizationsService,
  type Organization,
} from '../../shared/services/organizations.service';
import { PiToastService } from '../../shared/ui/toast';

type Editor = OrganizationFullEditorDialogComponent & {
  form: {
    controls: Record<string, { setValue: (v: unknown) => void }>;
    patchValue: (v: Record<string, unknown>) => void;
    markAllAsTouched: () => void;
  };
  onSubmit: () => void;
  onLegalTypeChange: (value: string) => void;
  isSoleProprietor: () => boolean;
  errorMessage: () => string | null;
};

describe('OrganizationFullEditorDialogComponent (TZ-PARTY-302)', () => {
  let fixture: ComponentFixture<OrganizationFullEditorDialogComponent>;
  let create: jest.Mock;
  let update: jest.Mock;

  const existing: Organization = {
    _id: 'org-1',
    name: 'ООО Ромашка',
    inn: '7701234567',
    kpp: '770101001',
    ogrn: '1027700012345',
    bankName: 'ПАО Сбербанк',
    bankBik: '044525225',
    bankAccount: '40702810000000000000',
    signerName: 'Иванов И. И.',
    signerPosition: 'Генеральный директор',
    legalType: 'ooo',
    paymentTermDays: 14,
    vatRate: 20,
    isOurCompany: true,
    registrationDate: '2019-04-05T00:00:00.000Z',
    type: ['customer'],
  };

  function dialogRef<T>(): DialogRef<T> {
    return { closed: signal<T | undefined>(undefined), close: jest.fn() } as DialogRef<T>;
  }

  async function build(data: Organization | null) {
    create = jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'new' } }));
    update = jest.fn().mockReturnValue(of({ ok: true, data: existing }));
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [OrganizationFullEditorDialogComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: PI_DIALOG_DATA, useValue: data },
          { provide: PI_DIALOG_REF, useValue: dialogRef() },
          { provide: OrganizationsService, useValue: { create, update } },
          { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        ],
      })
      .compileComponents();
    fixture = TestBed.createComponent(OrganizationFullEditorDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance as Editor;
  }

  it('renders the kind C wide shell with all requisite sections', async () => {
    await build(existing);
    const sections = Array.from(
      fixture.nativeElement.querySelectorAll('app-pi-form-section'),
    ) as HTMLElement[];

    expect(fixture.nativeElement.querySelector('app-pi-dialog')).toBeTruthy();
    expect(sections.length).toBeGreaterThanOrEqual(4);
    expect(
      fixture.nativeElement.querySelector('[data-test="organization-full-editor"]'),
    ).toBeTruthy();
  });

  it('prefills every requisite field from the edited organization', async () => {
    const editor = await build(existing);
    const value = (
      editor.form as unknown as { getRawValue: () => Record<string, unknown> }
    ).getRawValue();

    expect(value).toMatchObject({
      name: 'ООО Ромашка',
      inn: '7701234567',
      kpp: '770101001',
      ogrn: '1027700012345',
      bankName: 'ПАО Сбербанк',
      bankBik: '044525225',
      signerPosition: 'Генеральный директор',
      legalType: 'ooo',
      paymentTermDays: 14,
      vatRate: 20,
      isOurCompany: true,
    });
    expect(value.registrationDate).toBe('2019-04-05');
  });

  it('saves bank, signer and «наша фирма» through PATCH', async () => {
    const editor = await build(existing);
    editor.onSubmit();

    expect(update).toHaveBeenCalledTimes(1);
    const [id, payload] = update.mock.calls[0] as [string, Record<string, unknown>];
    expect(id).toBe('org-1');
    expect(payload).toMatchObject({
      name: 'ООО Ромашка',
      inn: '7701234567',
      bankBik: '044525225',
      signerName: 'Иванов И. И.',
      isOurCompany: true,
      paymentTermDays: 14,
    });
    expect(payload.registrationDate).toBe('2019-04-05T00:00:00.000Z');
  });

  it('shows passport fields only for ИП', async () => {
    const editor = await build(existing);
    expect(editor.isSoleProprietor()).toBe(false);
    expect(fixture.nativeElement.querySelector('#org-passportSeries')).toBeNull();

    editor.onLegalTypeChange('ip');
    fixture.detectChanges();

    expect(editor.isSoleProprietor()).toBe(true);
    expect(fixture.nativeElement.querySelector('#org-passportSeries')).toBeTruthy();
  });

  it('omits passport data when the organization is not ИП', async () => {
    const editor = await build(existing);
    editor.form.patchValue({ passportSeries: '0305', passportNumber: '123456' });
    editor.onSubmit();

    const [, payload] = update.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.passportSeries).toBeUndefined();
    expect(payload.passportNumber).toBeUndefined();
  });

  it('omits empty requisites instead of writing blank strings', async () => {
    const editor = await build(null);
    editor.form.patchValue({ name: 'ИП Иванов', inn: '123456789047' });
    editor.onSubmit();

    const [payload] = create.mock.calls[0] as [Record<string, unknown>];
    expect(payload).toEqual({
      name: 'ИП Иванов',
      inn: '123456789047',
      type: [],
      isActive: true,
      isOurCompany: false,
    });
  });

  it('refuses to submit without name and INN', async () => {
    const editor = await build(null);
    editor.onSubmit();

    expect(create).not.toHaveBeenCalled();
    expect(editor.errorMessage()).toContain('ИНН');
  });
});
