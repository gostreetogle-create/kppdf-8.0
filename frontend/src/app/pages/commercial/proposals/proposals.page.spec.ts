import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { ProposalsPage } from './proposals.page';
import { ProposalsService, Proposal } from '../../../shared/services/pi-proposals.service';
import { CounterpartyService } from '../../../shared/services/pi-counterparty.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import { API_BASE_URL } from '../../../core/api.tokens';

describe('ProposalsPage (TZ-SALES-301)', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/quotations`;
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };

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
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: ProposalsService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            duplicate: () => of({ ok: true, data: {} as never }),
            convertToOrder: () => of({ ok: true, data: { quotation: {}, orderId: 'x' } }),
          },
        },
        {
          provide: CounterpartyService,
          useValue: {
            list: () => of({ ok: true, data: { items: fakeCounterparties, total: 2 } }),
          },
        },
        { provide: PiDialogService, useValue: dialogSpy },
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

  it('create button triggers openCreate → dialog.open', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('openEdit passes the row to the form dialog', async () => {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeProposals);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openEdit: (p: Proposal) => void };
    comp.openEdit(fakeProposals[0]);
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(dialogSpy.open.mock.calls[0][1]).toMatchObject({ data: fakeProposals[0] });
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
    expect(comp.statusLabel('accepted')).toBe('Принято');
    expect(comp.statusLabel('draft')).toBe('Черновик');
    expect(comp.statusLabel('converted')).toBe('Преобразовано');
    expect(comp.statusBadgeClass('accepted')).toContain('pine');
    expect(comp.statusBadgeClass('draft')).toContain('muted');
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
});
