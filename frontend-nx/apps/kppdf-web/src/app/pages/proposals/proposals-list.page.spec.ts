import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { Observable, of } from 'rxjs';
import {
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioDocumentsService,
  type Quotation,
  type QuotationFamilyResponse,
  type StudioDocument,
} from '@kppdf/data-access';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { ProposalsListPage } from './proposals-list.page';

describe('ProposalsListPage (TZ-NX-SALES-S37-QUOTATION-CONVERT)', () => {
  let fixture: ComponentFixture<ProposalsListPage>;
  let quotationsApi: { list: jest.Mock; convertToOrder: jest.Mock; getFamily: jest.Mock };
  let studioApi: { list: jest.Mock };
  let organizationsApi: { list: jest.Mock };
  let toast: { error: jest.Mock };
  let router: { navigate: jest.Mock };

  const quotations: Quotation[] = [
    { _id: 'q-accepted', number: 'KP-001', status: 'accepted' },
    { _id: 'q-draft', number: 'KP-002', status: 'draft' },
    { _id: 'q-sent', number: 'KP-003', status: 'sent' },
  ];

  async function setup(): Promise<void> {
    quotationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: quotations })), convertToOrder: jest.fn(), getFamily: jest.fn() };
    studioApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] } satisfies SilentResult<StudioDocument[]>)) };
    organizationsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 100 } })),
    };
    toast = { error: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [ProposalsListPage],
      providers: [
        provideRouter([]),
        { provide: PiQuotationsService, useValue: quotationsApi },
        { provide: PiStudioDocumentsService, useValue: studioApi },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiToastService, useValue: toast },
      ],
    }).compileComponents();

    router = { navigate: jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) };
    fixture = TestBed.createComponent(ProposalsListPage);
    fixture.detectChanges();
  }

  async function settle(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the convert button only on accepted rows', async () => {
    await setup();
    await settle();

    const rows = fixture.nativeElement.querySelectorAll('[data-test="proposal-row"]');
    expect(rows.length).toBe(3);
    const buttons = fixture.nativeElement.querySelectorAll('[data-test="proposal-convert-order"]');
    expect(buttons.length).toBe(1);
    expect(buttons[0].closest('[data-test="proposal-row"]').textContent).toContain('KP-001');
  });

  it('converts an accepted quotation and navigates to the order card', async () => {
    await setup();
    await settle();
    quotationsApi.convertToOrder.mockReturnValue(of({ ok: true, data: { orderId: 'order-1' } }));

    (fixture.nativeElement.querySelector('[data-test="proposal-convert-order"]') as HTMLButtonElement).click();
    await settle();

    expect(quotationsApi.convertToOrder).toHaveBeenCalledWith('q-accepted');
    expect(router.navigate).toHaveBeenCalledWith(['/orders', 'order-1']);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows a toast and stays on the list when the convert call fails', async () => {
    await setup();
    await settle();
    quotationsApi.convertToOrder.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 400, error: { message: 'Status must be accepted' } }) }),
    );


    (fixture.nativeElement.querySelector('[data-test="proposal-convert-order"]') as HTMLButtonElement).click();
    await settle();

    expect(quotationsApi.convertToOrder).toHaveBeenCalledWith('q-accepted');
    expect(toast.error).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

describe('ProposalsListPage — KP family list (TZ-NX-KP-FAMILY-S42-LIST-HIDE-VARIANTS)', () => {
  let fixture: ComponentFixture<ProposalsListPage>;
  let quotationsApi: { list: jest.Mock; convertToOrder: jest.Mock; getFamily: jest.Mock };
  let studioApi: { list: jest.Mock };
  let organizationsApi: { list: jest.Mock };
  let toast: { error: jest.Mock };

  const familyRows: Quotation[] = [
    { _id: 'q-master', number: 'KP-010', status: 'sent', familyRole: 'master', familyVersion: 3 },
    { _id: 'q-variant-a', number: 'KP-011', status: 'draft', familyRole: 'variant', masterId: 'q-master' },
    { _id: 'q-solo', number: 'KP-012', status: 'draft' },
  ];

  async function setup(): Promise<void> {
    quotationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: familyRows })), convertToOrder: jest.fn(), getFamily: jest.fn() };
    studioApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] } satisfies SilentResult<StudioDocument[]>)) };
    organizationsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 100 } })),
    };
    toast = { error: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [ProposalsListPage],
      providers: [
        provideRouter([]),
        { provide: PiQuotationsService, useValue: quotationsApi },
        { provide: PiStudioDocumentsService, useValue: studioApi },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('hides family variants from the flat list but keeps master and solo rows', async () => {
    await setup();

    const rows = fixture.nativeElement.querySelectorAll('[data-test="proposal-row"]');
    expect(rows.length).toBe(2);
    const numbers = Array.from(rows).map((row) => (row as HTMLElement).textContent ?? '');
    expect(numbers.some((text) => text.includes('KP-011'))).toBe(false);
    expect(numbers.some((text) => text.includes('KP-010'))).toBe(true);
    expect(numbers.some((text) => text.includes('KP-012'))).toBe(true);
  });

  it('renders the «Семья» badge only on the master row', async () => {
    await setup();

    const rows = fixture.nativeElement.querySelectorAll('[data-test="proposal-row"]');
    const masterRow = Array.from(rows).find((row) =>
      ((row as HTMLElement).textContent ?? '').includes('KP-010'),
    );
    const soloRow = Array.from(rows).find((row) =>
      ((row as HTMLElement).textContent ?? '').includes('KP-012'),
    );
    expect(masterRow?.querySelector('[data-test="proposal-family-badge"]')).toBeTruthy();
    expect(soloRow?.querySelector('[data-test="proposal-family-badge"]')).toBeFalsy();
  });
});

describe('ProposalsListPage — family expand (TZ-NX-KP-FAMILY-S43-EXPAND)', () => {
  let fixture: ComponentFixture<ProposalsListPage>;
  let quotationsApi: { list: jest.Mock; convertToOrder: jest.Mock; getFamily: jest.Mock };
  let studioApi: { list: jest.Mock };
  let organizationsApi: { list: jest.Mock };
  let toast: { error: jest.Mock };

  const masterRow: Quotation = {
    _id: 'q-master',
    number: 'KP-010',
    status: 'sent',
    familyRole: 'master',
    familyVersion: 2,
  };
  const soloRow: Quotation = { _id: 'q-solo', number: 'KP-012', status: 'draft' };
  const familyRows: Quotation[] = [masterRow, soloRow];

  const familyResponse: QuotationFamilyResponse = {
    master: {
      id: 'q-master',
      number: 'KP-010',
      organizationId: 'org-master',
      familyRole: 'master',
      familyVersion: 2,
      total: 1000,
      status: 'sent',
    },
    variants: [
      {
        id: 'q-var-b',
        number: 'KP-011',
        organizationId: 'org-beta',
        familyRole: 'variant',
        familyVersion: 2,
        orgMarkupPercent: 8,
        total: 1080,
        status: 'draft',
      },
    ],
    familyVersion: 2,
  };

  async function setup(): Promise<void> {
    quotationsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: familyRows })),
      convertToOrder: jest.fn(),
      getFamily: jest.fn().mockReturnValue(of({ ok: true, data: familyResponse })),
    };
    studioApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] } satisfies SilentResult<StudioDocument[]>)) };
    organizationsApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            items: [
              { _id: 'org-beta', name: 'ООО Бета', shortName: 'Бета' },
              { _id: 'org-master', name: 'ООО Альфа', shortName: 'Альфа' },
            ],
            total: 2,
            page: 1,
            limit: 100,
          },
        }),
      ),
    };
    toast = { error: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [ProposalsListPage],
      providers: [
        provideRouter([]),
        { provide: PiQuotationsService, useValue: quotationsApi },
        { provide: PiStudioDocumentsService, useValue: studioApi },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function expandButtonOf(number: string): HTMLButtonElement {
    const rows = fixture.nativeElement.querySelectorAll('[data-test="proposal-row"]');
    const row = Array.from(rows).find((r) => ((r as HTMLElement).textContent ?? '').includes(number));
    const button = row?.querySelector('[data-test="proposal-family-expand"]') as HTMLButtonElement | null;
    if (!button) throw new Error(`family expand button not found for ${number}`);
    return button;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads the family on expand and shows variants with org, markup, number and status', async () => {
    await setup();

    expandButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(quotationsApi.getFamily).toHaveBeenCalledWith('q-master');
    const members = fixture.nativeElement.querySelectorAll('[data-test="proposal-family-member"]');
    expect(members.length).toBe(1);
    const text = members[0].textContent ?? '';
    expect(text).toContain('Бета');
    expect(text).toContain('KP-011');
    expect(text).toContain('8%');
    expect(text).toContain('Черновик');
    // Org names fetched once via the organizations service.
    expect(organizationsApi.list).toHaveBeenCalledWith({ limit: 100 });
  });

  it('collapses the panel on a second click and does not refetch', async () => {
    await setup();

    expandButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="proposal-family-list"]')).toBeTruthy();

    expandButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="proposal-family-list"]')).toBeFalsy();

    expandButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="proposal-family-list"]')).toBeTruthy();
    // Cached — still one request for the same row.
    expect(quotationsApi.getFamily).toHaveBeenCalledTimes(1);
  });

  it('shows an empty-state message for a solo quotation without variants', async () => {
    await setup();
    quotationsApi.getFamily.mockReturnValue(
      of({
        ok: true,
        data: {
          master: {
            id: 'q-solo',
            number: 'KP-012',
            organizationId: 'org-master',
            familyRole: 'solo',
            familyVersion: 1,
            total: 500,
            status: 'draft',
          },
          variants: [],
          familyVersion: 1,
        },
      }),
    );

    expandButtonOf('KP-012').click();
    await fixture.whenStable();
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('[data-test="proposal-family-list"]');
    expect(list).toBeTruthy();
    expect(list.textContent).toContain('Нет вариантов фирм');
  });

  it('shows the error banner and retries the family load', async () => {
    await setup();
    quotationsApi.getFamily.mockReturnValue(
      of({
        ok: false,
        error: new HttpErrorResponse({ status: 404, error: { message: 'Not found' } }),
      }),
    );

    expandButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('[data-test="proposal-family-list"] [data-test="pi-status-banner"]');
    expect(banner).toBeTruthy();

    // Retry works after the error clears.
    quotationsApi.getFamily.mockReturnValue(of({ ok: true, data: familyResponse }));
    (banner.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(quotationsApi.getFamily).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelectorAll('[data-test="proposal-family-member"]').length).toBe(1);
  });

  it('ignores a stale family result when the panel is closed during the fetch', async () => {
    await setup();
    let resolveFamily!: (value: SilentResult<QuotationFamilyResponse>) => void;
    quotationsApi.getFamily.mockReturnValue(
      new Observable<SilentResult<QuotationFamilyResponse>>((subscriber) => {
        resolveFamily = (value) => {
          subscriber.next(value);
          subscriber.complete();
        };
      }),
    );

    expandButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();
    // Loading while the request is pending.
    expect(fixture.nativeElement.querySelector('[data-test="proposal-family-list"]')?.textContent).toContain('Загрузка');

    // Close the panel before the response arrives.
    expandButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="proposal-family-list"]')).toBeFalsy();

    resolveFamily({ ok: true, data: familyResponse });
    await fixture.whenStable();
    fixture.detectChanges();

    // No panel, no crash — the stale result was ignored (still one request).
    expect(fixture.nativeElement.querySelector('[data-test="proposal-family-list"]')).toBeFalsy();
    expect(quotationsApi.getFamily).toHaveBeenCalledTimes(1);
  });
});