import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';

import { CounterpartiesPage } from './counterparties.page';
import { CounterpartyFullEditorDialogComponent } from './counterparty-full-editor-dialog.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { TableComponent } from '../../shared/ui/pi-table.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';

type Page = CounterpartiesPage & {
  openCreate: () => void;
  openEdit: (row: Counterparty) => void;
  onDelete: (row: Counterparty) => void;
  onPageChange: (page: number) => void;
  rows: () => Counterparty[];
  total: () => number;
  page: () => number;
};

/**
 * TZ-PARTY-301 — the «временный» badge is the only signal a manager gets that
 * an INN came from quick-create, so it is covered by a rendering test.
 * TZ-PARTY-303 — create / edit / delete now live on this page.
 */
describe('CounterpartiesPage (TZ-PARTY-301 stub INN · TZ-PARTY-303 CRUD)', () => {
  const rows: Counterparty[] = [
    { _id: 'cp-1', name: 'ООО Ромашка', inn: '7701234567', innIsStub: false },
    { _id: 'cp-2', name: 'Иванов', inn: '1234567894', innIsStub: true },
  ];

  let open: jest.Mock;
  let remove: jest.Mock;
  let list: jest.Mock;

  function dialogRef<T>(result: T): DialogRef<T> {
    return { closed: signal<T | undefined>(result), close: jest.fn() } as DialogRef<T>;
  }

  async function render(items: Counterparty[], deleteConfirmed = true) {
    list = jest
      .fn()
      .mockReturnValue(of({ ok: true, data: { items, total: items.length, page: 1, limit: 10 } }));
    remove = jest.fn().mockReturnValue(of({ ok: true, data: undefined }));
    open = jest
      .fn()
      .mockImplementation((component: unknown) =>
        component === AlertDialogComponent
          ? dialogRef<unknown>(deleteConfirmed)
          : dialogRef<unknown>(items[0]),
      );

    await TestBed.resetTestingModule()
      .configureTestingModule({
        providers: [
          { provide: CounterpartyService, useValue: { list, remove, listRoles: () => of([]) } },
          { provide: PiDialogService, useValue: { open } },
          { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        ],
      })
      .overrideComponent(CounterpartiesPage, {
        set: {
          imports: [TableComponent, BadgeComponent, PiRowActionsComponent],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(CounterpartiesPage);
    fixture.detectChanges();
    return fixture;
  }

  it('marks a quick-created INN as временный and leaves verified ones clean', async () => {
    const fixture = await render(rows);
    const badges = fixture.nativeElement.querySelectorAll('[data-test="counterparty-inn-stub"]');

    expect(badges.length).toBe(1);
    expect(badges[0].textContent).toContain('временный');
    expect(fixture.nativeElement.textContent).toContain('1234567894');
  });

  it('counts stub INNs in the toolbar', async () => {
    const fixture = await render(rows);
    const counter = fixture.nativeElement.querySelector(
      '[data-test="counterparties-stub-count"]',
    ) as HTMLElement | null;

    expect(counter?.textContent).toContain('1 с временным ИНН');
  });

  it('shows no badge and no counter when every INN is verified', async () => {
    const fixture = await render([rows[0]]);

    expect(
      fixture.nativeElement.querySelectorAll('[data-test="counterparty-inn-stub"]').length,
    ).toBe(0);
    expect(
      fixture.nativeElement.querySelector('[data-test="counterparties-stub-count"]'),
    ).toBeNull();
  });

  it('opens the FullEditor for create and for edit', async () => {
    const fixture = await render(rows);
    const page = fixture.componentInstance as Page;

    page.openCreate();
    expect(open).toHaveBeenLastCalledWith(
      CounterpartyFullEditorDialogComponent,
      expect.objectContaining({ data: null }),
    );

    page.openEdit(rows[1]);
    expect(open).toHaveBeenLastCalledWith(
      CounterpartyFullEditorDialogComponent,
      expect.objectContaining({ data: rows[1] }),
    );
  });

  it('deletes only after the confirm dialog is accepted', async () => {
    const fixture = await render(rows);
    (fixture.componentInstance as Page).onDelete(rows[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(open).toHaveBeenLastCalledWith(AlertDialogComponent, expect.anything());
    expect(remove).toHaveBeenCalledWith('cp-1');
  });

  it('keeps the counterparty when the confirm dialog is dismissed', async () => {
    const fixture = await render(rows, false);
    (fixture.componentInstance as Page).onDelete(rows[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(remove).not.toHaveBeenCalled();
  });

  it('page 2 requests page=2 and preserves total from the API (TZ-PARTY-304)', async () => {
    list = jest
      .fn()
      .mockReturnValue(of({ ok: true, data: { items: rows, total: 120, page: 1, limit: 50 } }));
    remove = jest.fn().mockReturnValue(of({ ok: true, data: undefined }));
    open = jest.fn().mockReturnValue(dialogRef<unknown>(undefined));

    await TestBed.resetTestingModule()
      .configureTestingModule({
        providers: [
          { provide: CounterpartyService, useValue: { list, remove, listRoles: () => of([]) } },
          { provide: PiDialogService, useValue: { open } },
          { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        ],
      })
      .overrideComponent(CounterpartiesPage, {
        set: {
          imports: [TableComponent, BadgeComponent, PiRowActionsComponent],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(CounterpartiesPage);
    fixture.detectChanges();
    await fixture.whenStable();

    const page = fixture.componentInstance as Page;
    expect(page.total()).toBe(120);

    page.onPageChange(2);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, limit: 50 }));
    expect(page.total()).toBe(120);
    expect(page.page()).toBe(2);

    const range = fixture.nativeElement.querySelector(
      '[data-test="counterparties-range"]',
    ) as HTMLElement | null;
    expect(range?.textContent).toContain('Показано 51–100 из 120');
  });
});
