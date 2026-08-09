import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';

import { ProposalsPage } from './proposals.page';
import { ProposalsService, Proposal } from '../../../shared/services/pi-proposals.service';
import { CounterpartyService } from '../../../shared/services/pi-counterparty.service';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import { API_BASE_URL } from '../../../core/api.tokens';

describe('ProposalsPage (TZ-SALES-301)', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/quotations`;
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  const routerSpy = { navigate: jest.fn() };
  /** Reconfigurable per-test (cannot use overrideProvider after compile). */
  const freezeMock = jest.fn(() => of({ ok: true, data: {} as never }));
  const duplicateMock = jest.fn(() =>
    of({ ok: true, data: { _id: 'copy-1', number: 'QTN-003', status: 'draft' } as Proposal }),
  );
  const listVersionsMock = jest.fn(() => of({ ok: true, data: [] }));
  const convertToOrderMock = jest.fn(() =>
    of({ ok: true, data: { quotation: {}, orderId: 'ord-42' } }),
  );
  const getFamilyMock = jest.fn(() =>
    of({
      ok: true,
      data: {
        master: {
          id: 'p1',
          number: 'QTN-001',
          organizationId: 'org-1',
          familyRole: 'master',
          familyVersion: 1,
          total: 10000,
          status: 'draft',
        },
        variants: [
          {
            id: 'p-var',
            number: 'QTN-001-B',
            organizationId: 'org-2',
            familyRole: 'variant',
            familyVersion: 1,
            orgMarkupPercent: 10,
            total: 10000,
            status: 'draft',
          },
        ],
        familyVersion: 1,
      },
    }),
  );
  const syncFromMasterMock = jest.fn(() => of({ ok: true, data: {} as never }));
  const findByIdMock = jest.fn(() =>
    of({
      ok: true,
      data: {
        _id: 'p-var',
        number: 'QTN-001-B',
        status: 'draft',
        familyRole: 'variant',
      } as Proposal,
    }),
  );

  const fakeCounterparties = [
    { _id: 'cp-1', name: 'ООО Ромашка' },
    { _id: 'cp-2', name: 'ИП Иванов' },
  ];

  const fakeProposals: Proposal[] = [
    {
      _id: 'p1',
      number: 'QTN-001',
      counterpartyId: { _id: 'cp-1', name: 'ООО Ромашка' },
      date: '2026-08-02T00:00:00.000Z',
      status: 'accepted',
      total: 10000,
      items: [{ productId: 'prod-1', productName: 'Стенд', quantity: 2, unitPrice: 5000 }],
    } as Proposal,
    {
      _id: 'p2',
      number: 'QTN-002',
      counterpartyId: { _id: 'cp-2', name: 'ИП Иванов' },
      date: '2026-08-01T00:00:00.000Z',
      status: 'draft',
      total: 2500,
      items: [{ productId: 'prod-2', productName: 'Баннер', quantity: 1, unitPrice: 2500 }],
    } as Proposal,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    routerSpy.navigate.mockClear();
    freezeMock.mockReset();
    duplicateMock.mockReset();
    listVersionsMock.mockReset();
    freezeMock.mockReturnValue(of({ ok: true, data: {} as never }));
    duplicateMock.mockReturnValue(
      of({ ok: true, data: { _id: 'copy-1', number: 'QTN-003', status: 'draft' } as Proposal }),
    );
    listVersionsMock.mockReturnValue(of({ ok: true, data: [] }));
    convertToOrderMock.mockReset();
    convertToOrderMock.mockReturnValue(
      of({ ok: true, data: { quotation: {}, orderId: 'ord-42' } }),
    );
    getFamilyMock.mockClear();
    syncFromMasterMock.mockClear();
    findByIdMock.mockClear();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: ProposalsService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            findById: findByIdMock,
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            duplicate: duplicateMock,
            freeze: freezeMock,
            listVersions: listVersionsMock,
            getVersion: () => of({ ok: true, data: {} as never }),
            convertToOrder: convertToOrderMock,
            getFamily: getFamilyMock,
            attachOrganizations: () => of({ ok: true, data: {} as never }),
            syncFromMaster: syncFromMasterMock,
          },
        },
        {
          provide: CounterpartyService,
          useValue: {
            list: () => of({ ok: true, data: { items: fakeCounterparties, total: 2 } }),
          },
        },
        {
          provide: OrganizationsService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: {
                  items: [
                    { _id: 'org-1', name: 'ООО Альфа' },
                    { _id: 'org-2', name: 'ООО Бета' },
                  ],
                  total: 2,
                },
              }),
          },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(ProposalsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fires an initial GET /api/quotations on creation', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => Proposal[];
      total: () => number;
      loading: () => boolean;
    };

    expect(comp.data().length).toBe(2);
    expect(comp.total()).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state before response', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
  });

  it('shows empty state when no proposals', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => Proposal[];
      total: () => number;
    };
    expect(comp.data().length).toBe(0);
    expect(comp.total()).toBe(0);
  });

  it('handles error response gracefully', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();

    httpMock
      .expectOne(matchListGet)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as { error: () => string | null };
    expect(() => comp.error()).not.toThrow();
  });

  it('create button navigates to the Create studio instead of opening a form dialog', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/proposals/create'], {
      queryParams: { new: '1' },
    });
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  it('openEdit navigates to the Create studio with the quotation id', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openEdit: (p: Proposal) => void };
    comp.openEdit(fakeProposals[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/proposals/create'], {
      queryParams: { id: 'p1' },
    });
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  it('maps proposal statuses to Russian labels + badge classes', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as {
      statusLabel: (s: string) => string;
      statusBadgeClass: (s: string) => string;
    };
    expect(comp.statusLabel('accepted')).toBe('Оплачена');
    expect(comp.statusLabel('draft')).toBe('Черновик');
    expect(comp.statusLabel('converted')).toBe('Преобразовано');
    expect(comp.statusBadgeClass('accepted')).toContain('pine');
    expect(comp.statusBadgeClass('draft')).toContain('muted');
  });

  it('copies a quotation and opens the new draft in Create КП', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { onCopy: (p: Proposal) => void };
    comp.onCopy(fakeProposals[0]);

    expect(duplicateMock).toHaveBeenCalledWith('p1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/proposals/create'], {
      queryParams: { id: 'copy-1' },
    });
  });

  it('onSortChange mirrors pi-table event into page sort signals + resets page', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onSortChange: (e: { key: string; dir: 'asc' | 'desc' | null }) => void;
      sortKey: () => string | null;
      sortDir: () => 'asc' | 'desc';
      page: () => number;
    };
    comp.onSortChange({ key: 'total', dir: 'desc' });
    expect(comp.sortKey()).toBe('total');
    expect(comp.sortDir()).toBe('desc');
    expect(comp.page()).toBe(1);

    comp.onSortChange({ key: 'total', dir: null });
    expect(comp.sortKey()).toBeNull();
  });

  it('onPageChange advances the page signal', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onPageChange: (p: number) => void;
      page: () => number;
    };
    comp.onPageChange(3);
    expect(comp.page()).toBe(3);
  });

  // ─── TZ-ORDERS-301: КП → Заказ ────────────────────────────────────
  it('canConvertToOrder allows ONLY accepted proposals', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as {
      canConvertToOrder: (p: Proposal) => boolean;
    };
    expect(comp.canConvertToOrder(fakeProposals[0])).toBe(true); // accepted
    for (const status of ['draft', 'sent', 'rejected', 'converted', 'cancelled']) {
      expect(comp.canConvertToOrder({ ...fakeProposals[0], status } as Proposal)).toBe(false);
    }
  });

  it('onConvertToOrder early-returns for a NON-accepted row (no confirm dialog)', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onConvertToOrder: (p: Proposal) => void;
    };
    comp.onConvertToOrder(fakeProposals[1]); // draft
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  it('onConvertToOrder opens the confirm dialog for an ACCEPTED row', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onConvertToOrder: (p: Proposal) => void;
    };
    comp.onConvertToOrder(fakeProposals[0]); // accepted
    expect(dialogSpy.open).toHaveBeenCalled();
    const data = dialogSpy.open.mock.calls[0][1]?.data;
    expect(data.title).toContain('Преобразовать в заказ');
    expect(data.description).toContain('QTN-001');
  });

  it('confirmed conversion calls convertToOrder, toasts and reloads the list', async () => {
    const closeSignal = signal<unknown>(undefined);
    dialogSpy.open.mockReturnValue({ closed: closeSignal });
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onConvertToOrder: (p: Proposal) => void;
    };
    comp.onConvertToOrder(fakeProposals[0]);
    closeSignal.set(true); // user confirms
    await tickMicrotask();
    fixture.detectChanges();

    // Page calls convertToOrder(row._id) — body is optional (default {}).
    expect(convertToOrderMock).toHaveBeenCalledTimes(1);
    expect(convertToOrderMock.mock.calls[0][0]).toBe('p1');
    // A fresh GET after the conversion reload.
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
  });

  it('failed conversion surfaces the backend error via toast', async () => {
    const closeSignal = signal<unknown>(undefined);
    dialogSpy.open.mockReturnValue({ closed: closeSignal });
    convertToOrderMock.mockReturnValue(
      of({ ok: false, error: { message: 'КП не принято покупателем' } }),
    );
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onConvertToOrder: (p: Proposal) => void;
    };
    comp.onConvertToOrder(fakeProposals[0]);
    closeSignal.set(true);
    await tickMicrotask();
    fixture.detectChanges();

    expect(convertToOrderMock).toHaveBeenCalledWith('p1');
    // No reload GET on failure — afterEach httpMock.verify() confirms
    // no pending requests remain.
  });

  it('freezes a quotation and reloads its visible version history', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { onFreeze: (p: Proposal) => void };
    comp.onFreeze(fakeProposals[0]);
    expect(freezeMock).toHaveBeenCalledWith('p1');
    expect(listVersionsMock).toHaveBeenCalledWith('p1');
  });

  it('resolves the counterparty name via the lookup (dual-shape id/object)', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      counterpartyNameOf: (p: Proposal) => string | null;
    };
    // Populated sub-doc shape (lookup resolves by id).
    expect(comp.counterpartyNameOf(fakeProposals[0])).toBe('ООО Ромашка');
    // Raw string-id shape resolves the same way.
    const rawId: Proposal = { ...fakeProposals[1], counterpartyId: 'cp-2' } as Proposal;
    expect(comp.counterpartyNameOf(rawId)).toBe('ИП Иванов');
    // Unknown id → '—' fallback (null).
    const unknown: Proposal = { ...fakeProposals[1], counterpartyId: 'cp-999' } as Proposal;
    expect(comp.counterpartyNameOf(unknown)).toBeNull();
  });

  it('hides family variants from the list rows (SALES-313)', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([
      ...fakeProposals,
      {
        ...fakeProposals[0],
        _id: 'p-var',
        number: 'QTN-001-B',
        familyRole: 'variant',
        masterId: 'p1',
      } as Proposal,
    ]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => Proposal[];
      total: () => number;
    };
    expect(comp.data().length).toBe(3);
    expect(comp.total()).toBe(2);
  });

  it('toggleFamily loads family and openVariantView uses read-only dialog data', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock
      .expectOne(matchListGet)
      .flush([{ ...fakeProposals[0], familyRole: 'master' } as Proposal, fakeProposals[1]]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleFamily: (p: Proposal) => void;
      openVariantView: (member: {
        id: string;
        number: string;
        organizationId: string;
        familyRole: string;
        familyVersion: number;
        total: number;
        status: string;
      }) => void;
      familyVariantsFor: (id: string) => { id: string }[];
      expandedFamilyId: () => string | null;
    };

    comp.toggleFamily({ ...fakeProposals[0], familyRole: 'master' } as Proposal);
    await tickMicrotask();
    expect(getFamilyMock).toHaveBeenCalledWith('p1');
    expect(comp.expandedFamilyId()).toBe('p1');
    expect(comp.familyVariantsFor('p1').length).toBe(1);

    dialogSpy.open.mockClear();
    comp.openVariantView({
      id: 'p-var',
      number: 'QTN-001-B',
      organizationId: 'org-2',
      familyRole: 'variant',
      familyVersion: 1,
      total: 10000,
      status: 'draft',
    });
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(dialogSpy.open.mock.calls[0][1]?.data).toMatchObject({
      member: expect.objectContaining({ id: 'p-var' }),
      organizationName: 'ООО Бета',
    });
  });

  it('onFamilySync opens confirm dialog for master', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();
    httpMock
      .expectOne(matchListGet)
      .flush([{ ...fakeProposals[0], familyRole: 'master' } as Proposal]);
    await tickMicrotask();
    fixture.detectChanges();

    const closeSignal = signal<unknown>(undefined);
    dialogSpy.open.mockReturnValue({ closed: closeSignal });

    const comp = fixture.componentInstance as unknown as {
      onFamilySync: (p: Proposal) => void;
    };
    comp.onFamilySync({ ...fakeProposals[0], familyRole: 'master' } as Proposal);
    expect(dialogSpy.open).toHaveBeenCalled();
    const data = dialogSpy.open.mock.calls[0][1]?.data;
    expect(data.title).toContain('Синхронизировать');

    closeSignal.set(true);
    await tickMicrotask();
    await tickMicrotask();
    fixture.detectChanges();
    expect(syncFromMasterMock).toHaveBeenCalledWith('p1');
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
  });
});
