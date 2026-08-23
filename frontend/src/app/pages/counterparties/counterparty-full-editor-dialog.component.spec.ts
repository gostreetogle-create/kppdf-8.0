import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CounterpartyFullEditorDialogComponent } from './counterparty-full-editor-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import {
  CounterpartyService,
  type Counterparty,
  type CounterpartyRole,
} from '../../shared/services/pi-counterparty.service';
import { PersonsService } from '../../shared/services/pi-persons.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PersonQuickCreateDialogComponent } from '../../shared/person/person-quick-create-dialog.component';

type Editor = CounterpartyFullEditorDialogComponent & {
  form: {
    controls: Record<string, { setValue: (v: unknown) => void }>;
    patchValue: (v: Record<string, unknown>) => void;
    getRawValue: () => Record<string, unknown>;
  };
  onSubmit: () => void;
  onRoleToggle: (slug: string, checked: boolean) => void;
  roleItems: () => { slug: string; label: string }[];
  rolesError: () => string;
  errorMessage: () => string | null;
  openCreatePerson: () => void;
  personItems: () => { id: string; label: string }[];
};

describe('CounterpartyFullEditorDialogComponent (TZ-PARTY-303)', () => {
  let fixture: ComponentFixture<CounterpartyFullEditorDialogComponent>;
  let create: jest.Mock;
  let update: jest.Mock;
  let listRoles: jest.Mock;

  const roles: CounterpartyRole[] = [
    { _id: 'r-1', slug: 'customer', name: 'Customer', description: 'Покупатель' },
    { _id: 'r-2', slug: 'supplier', name: 'Supplier', description: 'Поставщик' },
    { _id: 'r-3', slug: 'installer', name: 'Installer', isActive: true },
  ];

  const existing: Counterparty = {
    _id: 'cp-1',
    name: 'ООО Ромашка',
    inn: '7701234567',
    innIsStub: false,
    kpp: '770101001',
    ogrn: '1027700012345',
    phone: '+7 900 111-22-33',
    email: 'info@romashka.ru',
    roles: ['customer', 'supplier'],
    bankName: 'ПАО Сбербанк',
    bankBik: '044525225',
    bankAccount: '40702810000000000000',
    signerName: 'Иванов И. И.',
    signerPosition: 'Генеральный директор',
    legalType: 'ooo',
    paymentTermDays: 14,
    vatRate: 20,
    registrationDate: '2019-04-05T00:00:00.000Z',
    organizationId: 'org-1',
  };

  function dialogRef<T>(): DialogRef<T> {
    return { closed: signal<T | undefined>(undefined), close: jest.fn() } as DialogRef<T>;
  }

  let listPersons: jest.Mock;
  let dialogOpen: jest.Mock;

  async function build(data: Counterparty | null, rolesResult = { ok: true, data: roles }) {
    create = jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'new' } }));
    update = jest.fn().mockReturnValue(of({ ok: true, data: existing }));
    listRoles = jest.fn().mockReturnValue(of(rolesResult));
    listPersons = jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } }));
    dialogOpen = jest.fn().mockReturnValue({ closed: signal(undefined) });
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [CounterpartyFullEditorDialogComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: PI_DIALOG_DATA, useValue: data },
          { provide: PI_DIALOG_REF, useValue: dialogRef() },
          { provide: CounterpartyService, useValue: { create, update, listRoles } },
          { provide: PersonsService, useValue: { list: listPersons } },
          { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
          { provide: PiDialogService, useValue: { open: dialogOpen } },
        ],
      })
      .compileComponents();
    fixture = TestBed.createComponent(CounterpartyFullEditorDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance as Editor;
  }

  it('renders the kind C wide shell with requisite sections', async () => {
    await build(existing);
    const sections = fixture.nativeElement.querySelectorAll('app-pi-form-section');

    expect(fixture.nativeElement.querySelector('app-pi-dialog')).toBeTruthy();
    expect(sections.length).toBeGreaterThanOrEqual(4);
    expect(
      fixture.nativeElement.querySelector('[data-test="counterparty-full-editor"]'),
    ).toBeTruthy();
  });

  it('prefills bank, signer, phone and roles from the edited counterparty', async () => {
    const editor = await build(existing);
    const value = editor.form.getRawValue();

    expect(value).toMatchObject({
      name: 'ООО Ромашка',
      inn: '7701234567',
      kpp: '770101001',
      phone: '+7 900 111-22-33',
      email: 'info@romashka.ru',
      bankBik: '044525225',
      signerPosition: 'Генеральный директор',
      legalType: 'ooo',
      paymentTermDays: 14,
      roles: ['customer', 'supplier'],
    });
    expect(value.registrationDate).toBe('2019-04-05');
  });

  it('never sends organizationId — the server stamps the tenant', async () => {
    const editor = await build(existing);
    editor.onSubmit();

    const [id, payload] = update.mock.calls[0] as [string, Record<string, unknown>];
    expect(id).toBe('cp-1');
    expect(payload['organizationId']).toBeUndefined();
    expect(payload).toMatchObject({ inn: '7701234567', roles: ['customer', 'supplier'] });
  });

  it('omits empty requisites instead of writing blank strings', async () => {
    const editor = await build(null);
    editor.form.patchValue({ name: 'ИП Иванов', inn: '123456789047' });
    editor.onSubmit();

    const [payload] = create.mock.calls[0] as [Record<string, unknown>];
    expect(payload).toEqual({
      name: 'ИП Иванов',
      inn: '123456789047',
      roles: ['customer'],
      isActive: true,
    });
  });

  it('refuses to submit without name and INN', async () => {
    const editor = await build(null);
    editor.onSubmit();

    expect(create).not.toHaveBeenCalled();
    expect(editor.errorMessage()).toContain('ИНН');
  });

  it('refuses to submit with no role, because the API requires roles', async () => {
    const editor = await build(existing);
    editor.onRoleToggle('customer', false);
    editor.onRoleToggle('supplier', false);
    editor.onSubmit();

    expect(update).not.toHaveBeenCalled();
    expect(editor.rolesError()).toContain('роль');
  });

  it('reads role labels from the catalog and falls back to the seeded set', async () => {
    const withCatalog = await build(null);
    expect(withCatalog.roleItems().map((r) => r.label)).toEqual([
      'Покупатель',
      'Поставщик',
      'Installer',
    ]);

    const offline = await build(null, { ok: false, data: [] } as unknown as {
      ok: true;
      data: CounterpartyRole[];
    });
    expect(offline.roleItems().map((r) => r.slug)).toEqual([
      'customer',
      'supplier',
      'contractor',
      'manufacturer',
    ]);
  });

  it('includes email in update payload when set (TZ-MIG-304)', async () => {
    const editor = await build(existing);
    editor.form.controls.email.setValue('billing@romashka.ru');
    editor.onSubmit();

    const [, payload] = update.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.email).toBe('billing@romashka.ru');
    expect(fixture.nativeElement.querySelector('[data-test="cp-email"]')).toBeTruthy();
  });

  it('coerces VAT and payment terms strings to numbers in the payload', async () => {
    const editor = await build(null);
    editor.form.patchValue({
      name: 'ИП Иванов',
      inn: '123456789047',
      paymentTermDays: '30',
      vatRate: '20',
    });
    editor.onSubmit();

    const [payload] = create.mock.calls[0] as [Record<string, unknown>];
    expect(payload.paymentTermDays).toBe(30);
    expect(payload.vatRate).toBe(20);
    expect(typeof payload.paymentTermDays).toBe('number');
    expect(typeof payload.vatRate).toBe('number');
  });

  it('warns that a quick-created INN is temporary', async () => {
    await build({ ...existing, innIsStub: true });
    expect(fixture.nativeElement.querySelector('[data-test="cp-inn-stub-hint"]')).toBeTruthy();

    await build(existing);
    expect(fixture.nativeElement.querySelector('[data-test="cp-inn-stub-hint"]')).toBeNull();
  });

  it('uses Paper & Ink density: gold role chips (TZ-UI-DEN-530)', async () => {
    await build(existing);
    const html = (fixture.nativeElement as HTMLElement).innerHTML;
    expect(html).toContain('bg-gold');
    expect(html).not.toContain('bg-sunrise-warm');
  });

  it('shows + button and opens PersonQuickCreate dialog (TZ-PARTY-306)', async () => {
    const editor = await build(existing);
    expect(fixture.nativeElement.querySelector('[data-test="cp-contact-person-add"]')).toBeTruthy();
    editor.openCreatePerson();
    expect(dialogOpen).toHaveBeenCalledWith(
      PersonQuickCreateDialogComponent,
      expect.objectContaining({ width: 'sm' }),
    );
  });

  it('keeps contact + on same row as overflow-select with supply add-btn class (TZ-UI-PLUS-601)', async () => {
    await build(existing);
    const row = fixture.nativeElement.querySelector('.pi-select-add-row') as HTMLElement;
    const select = row?.querySelector('app-pi-overflow-select');
    const btn = row?.querySelector('[data-test="cp-contact-person-add"]') as HTMLButtonElement;
    expect(row).toBeTruthy();
    expect(select).toBeTruthy();
    expect(btn?.classList.contains('pi-select-add-btn')).toBe(true);
    expect(row.children[0]).toBe(select);
    expect(row.children[1]).toBe(btn);
  });
});
