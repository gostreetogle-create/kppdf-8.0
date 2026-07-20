import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { ContractsPage } from './contracts.page';
import { ContractsService, Contract } from './contracts.service';
import { CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { OrganizationsService } from '../../shared/services/organizations.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('ContractsPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/contracts`;

  const fakeContracts: Contract[] = [
    { _id: 'c1', number: 'CTR-001', status: 'draft', totalAmount: 1000, items: [], createdAt: '2026-01-01' } as Contract,
    { _id: 'c2', number: 'CTR-002', status: 'active', totalAmount: 5000, items: [], createdAt: '2026-01-02' } as Contract,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: ContractsService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        {
          provide: CounterpartyService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        {
          provide: OrganizationsService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        { provide: PiDialogService, useValue: { open: () => ({} as never) } },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(ContractsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fires an initial GET /api/contracts on creation', async () => {
    const fixture = TestBed.createComponent(ContractsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeContracts);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => Contract[];
      total: () => number;
      loading: () => boolean;
    };

    expect(comp.data().length).toBe(2);
    expect(comp.total()).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state before response', async () => {
    const fixture = TestBed.createComponent(ContractsPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
  });

  it('shows empty state when no contracts', async () => {
    const fixture = TestBed.createComponent(ContractsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { data: () => Contract[]; total: () => number };
    expect(comp.data().length).toBe(0);
    expect(comp.total()).toBe(0);
  });
});
