import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { PiCounterpartiesService, type Counterparty } from '@kppdf/data-access';
import { AlertDialogComponent, PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { CounterpartiesListPage } from './counterparties-list.page';
import { CounterpartyFormDialogComponent } from './counterparty-form-dialog.component';

describe('CounterpartiesListPage (TZ-NX-DEALS-D3-COUNTERPARTIES)', () => {
  let fixture: ComponentFixture<CounterpartiesListPage>;
  let api: { list: jest.Mock; create: jest.Mock; update: jest.Mock; remove: jest.Mock };
  let toast: { error: jest.Mock; success: jest.Mock };
  let dialog: { open: jest.Mock };

  const rows: Counterparty[] = [
    { _id: 'cp-1', name: 'ООО Альфа', inn: '7707083893', roles: ['customer'], isActive: true, phone: '+7 999 000-00-00' },
    { _id: 'cp-2', name: 'ООО Бета', shortName: 'Бета', inn: '500100732259', innIsStub: true, roles: ['customer'], isActive: true },
  ];

  async function setup(listResult: SilentResult<{ items: Counterparty[]; total: number; page: number; limit: number }> = { ok: true, data: { items: rows, total: 2, page: 1, limit: 200 } }): Promise<void> {
    api = {
      list: jest.fn().mockReturnValue(of(listResult)),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    toast = { error: jest.fn(), success: jest.fn() };
    dialog = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [CounterpartiesListPage],
      providers: [
        { provide: PiCounterpartiesService, useValue: api },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterpartiesListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the list with name, ИНН (+ временный badge for stub) and contact', async () => {
    await setup();
    const rowEls = fixture.nativeElement.querySelectorAll('[data-test="counterparty-row"]');
    expect(rowEls.length).toBe(2);
    expect(rowEls[0].textContent).toContain('ООО Альфа');
    expect(rowEls[0].textContent).toContain('7707083893');
    expect(rowEls[0].textContent).toContain('+7 999 000-00-00');
    expect(rowEls[1].textContent).toContain('Бета');
    expect(rowEls[1].textContent).toContain('(временный)');
  });

  it('renders an honest empty state', async () => {
    await setup({ ok: true, data: { items: [], total: 0, page: 1, limit: 200 } });
    expect(fixture.nativeElement.querySelector('[data-test="counterparties-empty"]')).toBeTruthy();
  });

  it('renders a retryable error state', async () => {
    await setup({ ok: false, error: new HttpErrorResponse({ status: 500 }) });
    expect(fixture.nativeElement.querySelector('[data-test="counterparties-error"]')).toBeTruthy();
  });

  it('opens the create dialog and POSTs the confirmed payload, then reloads', async () => {
    await setup();
    const closedSignal = signal<{ name: string; inn: string; roles: string[] } | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: unknown) => closedSignal.set(v as never) } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);
    api.create.mockReturnValue(of({ ok: true, data: rows[0] } satisfies SilentResult<Counterparty>));

    (fixture.nativeElement.querySelector('[data-test="counterparty-create"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(dialog.open).toHaveBeenCalledWith(
      CounterpartyFormDialogComponent,
      expect.objectContaining({ data: {} }),
    );

    closedSignal.set({ name: 'ООО Новый', inn: '7707083893', roles: ['customer'] });
    await fixture.whenStable();
    fixture.detectChanges();
    // Effect fires after the signal write; the POST result resolves in a follow-up microtask.
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.create).toHaveBeenCalledWith({ name: 'ООО Новый', inn: '7707083893', roles: ['customer'] });
    expect(toast.success).toHaveBeenCalled();
    expect(api.list).toHaveBeenCalledTimes(2); // initial + reload after create
  });

  it('toasts an error and does not reload when create fails', async () => {
    await setup();
    const closedSignal = signal<{ name: string; inn: string; roles: string[] } | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: unknown) => closedSignal.set(v as never) } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);
    api.create.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 400 }) } satisfies SilentResult<Counterparty>),
    );

    (fixture.nativeElement.querySelector('[data-test="counterparty-create"]') as HTMLButtonElement).click();
    closedSignal.set({ name: 'ООО Новый', inn: 'bad', roles: ['customer'] });
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalled();
    expect(api.list).toHaveBeenCalledTimes(1); // no reload on failure
  });

  it('opens the edit dialog pre-filled with the row and PATCHes on confirm', async () => {
    await setup();
    const closedSignal = signal<{ name: string; inn: string; roles: string[] } | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: unknown) => closedSignal.set(v as never) } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);
    api.update.mockReturnValue(of({ ok: true, data: rows[0] } satisfies SilentResult<Counterparty>));

    const editButtons = fixture.nativeElement.querySelectorAll('[data-test="counterparty-edit"]');
    (editButtons[0] as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(
      CounterpartyFormDialogComponent,
      expect.objectContaining({ data: { counterparty: rows[0] } }),
    );

    closedSignal.set({ name: 'ООО Альфа', inn: '7707083893', roles: ['customer'] });
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.update).toHaveBeenCalledWith('cp-1', { name: 'ООО Альфа', inn: '7707083893', roles: ['customer'] });
    expect(toast.success).toHaveBeenCalled();
  });

  it('does not call remove when the delete confirm is cancelled', async () => {
    await setup();
    const closedSignal = signal<boolean | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: boolean) => closedSignal.set(v) } as unknown as DialogRef<boolean>;
    dialog.open.mockReturnValue(ref);

    (fixture.nativeElement.querySelectorAll('[data-test="counterparty-delete"]')[0] as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(AlertDialogComponent, expect.objectContaining({ data: expect.any(Object) }));

    closedSignal.set(false);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.remove).not.toHaveBeenCalled();
  });

  it('removes and reloads after the delete confirm', async () => {
    await setup();
    const closedSignal = signal<boolean | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: boolean) => closedSignal.set(v) } as unknown as DialogRef<boolean>;
    dialog.open.mockReturnValue(ref);
    api.remove.mockReturnValue(of({ ok: true, data: undefined } satisfies SilentResult<void>));

    (fixture.nativeElement.querySelectorAll('[data-test="counterparty-delete"]')[0] as HTMLButtonElement).click();
    closedSignal.set(true);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.remove).toHaveBeenCalledWith('cp-1');
    expect(toast.success).toHaveBeenCalled();
  });
});
