import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { ContractsPage } from './contracts.page';
import { ContractsService, Contract } from './contracts.service';
import { CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { OrganizationsService } from '../../shared/services/organizations.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';

/**
 * TZ-232.D sentinel #2 spec v2 — ContractsPage migrated on
 * <pi-entity-list> via Approach D hybrid (synthetic localAdapter).
 *
 * v2 changes vs v1:
 *  - Removed `provideHttpClient` / `provideHttpClientTesting`
 *    because the contracts page no longer uses `httpResource`
 *    (v3 page refactor moved to direct `service.list()` + signal).
 *  - Removed the useless `mount cleanly` smoke test (was
 *    `expect(true).toBe(true)`, no value add).
 *
 * Coverage:
 *  1. localAdapter slicer returns {items, total} shape.
 *  2. onSortChange updates sortKeySig/sortDirSig signals + sortedRows re-computes.
 *  3. openCreate opens dialog with width lg.
 *  4. onDelete opens destructive AlertDialogComponent.
 *  5. onCreateDocument navigates to /doc-constructor/builder.
 */
describe('ContractsPage', () => {
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  const toastSpy = { success: jest.fn(), error: jest.fn() };
  const routerSpy = { navigate: jest.fn().mockResolvedValue(true) };
  let listSpy: jest.Mock;
  let removeSpy: jest.Mock;

  const fakeContracts: Contract[] = [
    {
      _id: 'c1',
      number: 'CTR-001',
      status: 'draft',
      totalAmount: 1000,
      items: [],
      createdAt: '2026-01-01',
    } as Contract,
    {
      _id: 'c2',
      number: 'CTR-002',
      status: 'active',
      totalAmount: 5000,
      items: [],
      createdAt: '2026-01-02',
    } as Contract,
  ];

  async function mountPage(): Promise<void> {
    listSpy = jest.fn().mockReturnValue(of({ ok: true, data: fakeContracts }));
    removeSpy = jest.fn().mockReturnValue(of({ ok: true, data: undefined }));

    TestBed.overrideProvider(ContractsService, {
      useValue: {
        list: listSpy,
        findById: () => of({ ok: true as const, data: {} as never }),
        create: () => of({ ok: true as const, data: {} as never }),
        update: () => of({ ok: true as const, data: {} as never }),
        remove: removeSpy,
      },
    });
    TestBed.overrideProvider(CounterpartyService, {
      useValue: { list: () => of({ ok: true as const, data: { items: [], total: 0 } }) },
    });
    TestBed.overrideProvider(OrganizationsService, {
      useValue: { list: () => of({ ok: true as const, data: { items: [], total: 0 } }) },
    });

    await TestBed.configureTestingModule({
      imports: [ContractsPage],
      providers: [
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(ContractsPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(ContractsPage);
    fixture.detectChanges();
    await Promise.resolve();
  }

  beforeEach(() => {
    dialogSpy.open.mockClear();
    toastSpy.success.mockClear();
    toastSpy.error.mockClear();
    routerSpy.navigate.mockClear();
  });

  it('initial reload() resolves dataSig with list result', async () => {
    await mountPage();
    expect(listSpy).toHaveBeenCalled();
    // After microtask + fixture.detectChanges, dataSig should hold our mock contracts.
    const fixture = TestBed.createComponent(ContractsPage);
    fixture.detectChanges();
    await Promise.resolve();
    const comp = fixture.componentInstance as unknown as {
      dataSig: () => Contract[];
    };
    expect(comp.dataSig().length).toBe(2);
  });

  it('localAdapter.list returns {items, total} shape sliced from sortedRows', async () => {
    await mountPage();

    const fixture = TestBed.createComponent(ContractsPage);
    const comp = fixture.componentInstance as unknown as {
      localAdapter: {
        list: (params: { page: number; limit: number }) => {
          subscribe: (
            fn: (res: {
              ok: boolean;
              data: { items: Contract[]; total: number };
            }) => void,
          ) => void;
        };
      };
    };

    // Page 1 of size 1 → first contract only.
    comp.localAdapter.list({ page: 1, limit: 1 }).subscribe((res) => {
      expect(res.ok).toBe(true);
      expect(res.data.total).toBe(2);
      expect(res.data.items.length).toBe(1);
    });
  });

  it('onSortChange updates sortKeySig/sortDirSig + sortedRows re-derives', async () => {
    await mountPage();

    const fixture = TestBed.createComponent(ContractsPage);
    fixture.detectChanges();
    await Promise.resolve();

    const comp = fixture.componentInstance as unknown as {
      onSortChange: (event: { key: string; dir: 'asc' | 'desc' | null }) => void;
      sortedRows: () => Contract[];
    };

    // Sort by totalAmount ascending — 1000 first, 5000 second.
    comp.onSortChange({ key: 'totalAmount', dir: 'asc' });
    expect(comp.sortedRows()[0]?.totalAmount).toBe(1000);
    expect(comp.sortedRows()[1]?.totalAmount).toBe(5000);

    clearSort(comp);
    expect(comp.sortedRows().length).toBe(2);
  });

  function clearSort(comp: { onSortChange: (e: { key: string; dir: null }) => void }): void {
    comp.onSortChange({ key: 'number', dir: null });
  }

  it('openCreate opens ContractFormDialog with width lg', async () => {
    await mountPage();

    const fixture = TestBed.createComponent(ContractsPage);
    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 'lg' }),
    );
  });

  it('onDelete opens destructive AlertDialogComponent', async () => {
    await mountPage();

    const fixture = TestBed.createComponent(ContractsPage);
    const comp = fixture.componentInstance as unknown as { onDelete: (row: Contract) => void };
    comp.onDelete(fakeContracts[0]!);

    expect(dialogSpy.open).toHaveBeenCalled();
    const [, opts] = dialogSpy.open.mock.calls[0]!;
    expect(opts).toMatchObject({
      data: expect.objectContaining({
        title: 'Удалить договор?',
        variant: 'destructive',
      }),
      width: 'sm',
    });
  });

  it('onCreateDocument navigates to /doc-constructor/builder with contract params', async () => {
    await mountPage();

    const fixture = TestBed.createComponent(ContractsPage);
    const comp = fixture.componentInstance as unknown as {
      onCreateDocument: (row: Contract) => void;
    };
    comp.onCreateDocument(fakeContracts[0]!);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/doc-constructor/builder'], {
      queryParams: { source: 'contract', sourceId: 'c1' },
    });
  });
});