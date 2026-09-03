import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioDocumentsService,
  type Quotation,
  type QuotationFamilyResponse,
  type StudioDocument,
} from '@kppdf/data-access';
import { AlertDialogComponent, PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { ProposalAttachOrgsDialogComponent, type AttachOrgsResult } from './proposal-attach-orgs.dialog';
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

describe('ProposalsListPage — attach orgs (TZ-NX-KP-FAMILY-S44-ATTACH-ORGS)', () => {
  let fixture: ComponentFixture<ProposalsListPage>;
  let quotationsApi: {
    list: jest.Mock;
    convertToOrder: jest.Mock;
    getFamily: jest.Mock;
    attachOrganizations: jest.Mock;
  };
  let studioApi: { list: jest.Mock };
  let organizationsApi: { list: jest.Mock };
  let toast: { error: jest.Mock; success: jest.Mock };
  let dialogRef: DialogRef<AttachOrgsResult>;

  const masterRow: Quotation = {
    _id: 'q-master',
    number: 'KP-010',
    status: 'sent',
    familyRole: 'master',
    familyVersion: 2,
  };
  const soloRow: Quotation = { _id: 'q-solo', number: 'KP-012', status: 'draft' };
  const rows: Quotation[] = [masterRow, soloRow];

  const orgs = {
    ok: true,
    data: {
      items: [
        { _id: 'org-master', name: 'ООО Альфа', shortName: 'Альфа', inn: 'x', type: [] },
        { _id: 'org-beta', name: 'ООО Бета', shortName: 'Бета', inn: 'y', type: [] },
      ],
      total: 2,
      page: 1,
      limit: 100,
    },
  };

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

  const familyAfterAttach: QuotationFamilyResponse = {
    master: familyResponse.master,
    variants: [
      ...familyResponse.variants,
      {
        id: 'q-var-gamma',
        number: 'KP-013',
        organizationId: 'org-gamma',
        familyRole: 'variant',
        familyVersion: 3,
        orgMarkupPercent: 5,
        total: 1050,
        status: 'draft',
      },
    ],
    familyVersion: 3,
  };

  async function setup(preloadFamily = false): Promise<void> {
    quotationsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: rows })),
      convertToOrder: jest.fn(),
      getFamily: jest.fn(),
      attachOrganizations: jest.fn(),
    };
    studioApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] } satisfies SilentResult<StudioDocument[]>)) };
    organizationsApi = { list: jest.fn().mockReturnValue(of(orgs)) };
    toast = { error: jest.fn(), success: jest.fn() };
    const closedSignal = signal<AttachOrgsResult | undefined>(undefined);
    dialogRef = {
      closed: closedSignal,
      close: (value?: AttachOrgsResult) => closedSignal.set(value),
    } as unknown as DialogRef<AttachOrgsResult>;
    const dialog = { open: jest.fn().mockReturnValue(dialogRef) };

    await TestBed.configureTestingModule({
      imports: [ProposalsListPage],
      providers: [
        provideRouter([]),
        { provide: PiQuotationsService, useValue: quotationsApi },
        { provide: PiStudioDocumentsService, useValue: studioApi },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsListPage);
    fixture.detectChanges();
    if (preloadFamily) {
      fixture.componentInstance.familyByRow.set({ 'q-master': familyResponse });
    }
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function attachButtonOf(number: string): HTMLButtonElement {
    const rowsEl = fixture.nativeElement.querySelectorAll('[data-test="proposal-row"]');
    const row = Array.from(rowsEl).find((r) => ((r as HTMLElement).textContent ?? '').includes(number));
    const button = row?.querySelector('[data-test="proposal-attach-orgs"]') as HTMLButtonElement | null;
    if (!button) throw new Error(`attach button not found for ${number}`);
    return button;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('offers «Несколько фирм» on master and solo rows', async () => {
    await setup();

    expect(attachButtonOf('KP-010')).toBeTruthy();
    expect(attachButtonOf('KP-012')).toBeTruthy();
    // Variant rows are hidden from the flat list entirely (S42).
    const variantButtons = fixture.nativeElement.querySelectorAll('[data-test="proposal-attach-orgs"]');
    expect(variantButtons.length).toBe(2);
  });

  it('opens the attach dialog with organizations loaded and existing variants excluded', async () => {
    await setup(true);

    const dialog = TestBed.inject(PiDialogService) as unknown as { open: jest.Mock };
    attachButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(organizationsApi.list).toHaveBeenCalledWith({ limit: 100 });
    expect(dialog.open).toHaveBeenCalledWith(
      ProposalAttachOrgsDialogComponent,
      expect.objectContaining({
        width: 'md',
        data: expect.objectContaining({
          quotation: masterRow,
          organizations: orgs.data.items,
          existingVariantOrgIds: new Set(['org-beta']),
        }),
      }),
    );
  });

  it('POSTs the attach payload on confirm, updates the family cache and toasts success', async () => {
    await setup(true);
    quotationsApi.attachOrganizations.mockReturnValue(of({ ok: true, data: familyAfterAttach }));
    const dialog = TestBed.inject(PiDialogService) as unknown as { open: jest.Mock };

    attachButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(dialog.open).toHaveBeenCalled();

    const ref = dialog.open.mock.results[0].value as DialogRef<AttachOrgsResult>;
    ref.close({ items: [{ organizationId: 'org-gamma', orgMarkupPercent: 5 }] });
    await fixture.whenStable();
    fixture.detectChanges();
    // Effects fire after the signal write; the POST result resolves in a follow-up microtask.
    await fixture.whenStable();
    fixture.detectChanges();

    expect(quotationsApi.attachOrganizations).toHaveBeenCalledWith('q-master', {
      items: [{ organizationId: 'org-gamma', orgMarkupPercent: 5 }],
    });
    expect(toast.success).toHaveBeenCalledWith('Варианты добавлены');
    const cached = fixture.componentInstance.familyByRow()['q-master'];
    expect(cached.variants.some((v) => v.organizationId === 'org-gamma')).toBe(true);
  });

  it('does not POST when the dialog is cancelled', async () => {
    await setup();
    const dialog = TestBed.inject(PiDialogService) as unknown as { open: jest.Mock };

    attachButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();

    const ref = dialog.open.mock.results[0].value as DialogRef<AttachOrgsResult>;
    ref.close(undefined);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(quotationsApi.attachOrganizations).not.toHaveBeenCalled();
  });

  it('shows an error toast and keeps the list unchanged when attach fails', async () => {
    await setup(true);
    quotationsApi.attachOrganizations.mockReturnValue(
      of({
        ok: false,
        error: new HttpErrorResponse({ status: 400, error: { message: 'Quotation must be master or solo' } }),
      }),
    );
    const dialog = TestBed.inject(PiDialogService) as unknown as { open: jest.Mock };

    attachButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();

    const ref = dialog.open.mock.results[0].value as DialogRef<AttachOrgsResult>;
    ref.close({ items: [{ organizationId: 'org-gamma' }] });
    await fixture.whenStable();
    fixture.detectChanges();
    // Effects fire after the signal write; the POST result resolves in a follow-up microtask.
    await fixture.whenStable();
    fixture.detectChanges();

    expect(quotationsApi.attachOrganizations).toHaveBeenCalledWith('q-master', {
      items: [{ organizationId: 'org-gamma' }],
    });
    expect(toast.error).toHaveBeenCalledWith('Не удалось добавить фирмы', expect.anything());
    // Cache untouched — the old family (org-beta only) is still shown.
    const cached = fixture.componentInstance.familyByRow()['q-master'];
    expect(cached).toEqual(familyResponse);
  });
});

describe('ProposalsListPage — sync from master (TZ-NX-KP-FAMILY-S45-SYNC)', () => {
  let fixture: ComponentFixture<ProposalsListPage>;
  let quotationsApi: { list: jest.Mock; getFamily: jest.Mock; syncFromMaster: jest.Mock };
  let studioApi: { list: jest.Mock };
  let organizationsApi: { list: jest.Mock };
  let toast: { error: jest.Mock; success: jest.Mock };

  const masterRow: Quotation = { _id: 'q-master', number: 'KP-010', status: 'sent', familyRole: 'master', familyVersion: 2 };
  const soloRow: Quotation = { _id: 'q-solo', number: 'KP-012', status: 'draft' };
  const rows: Quotation[] = [masterRow, soloRow];

  const orgs = {
    ok: true,
    data: {
      items: [{ _id: 'org-master', name: 'ООО Альфа', shortName: 'Альфа', inn: 'x', type: [] }],
      total: 1,
      page: 1,
      limit: 100,
    },
  };

  const masterFamily: QuotationFamilyResponse = {
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
        organizationId: 'org-master',
        familyRole: 'variant',
        familyVersion: 2,
        orgMarkupPercent: 5,
        total: 1050,
        status: 'draft',
      },
    ],
    familyVersion: 2,
  };
  const familyAfterSync: QuotationFamilyResponse = {
    ...masterFamily,
    master: { ...masterFamily.master, familyVersion: 3 },
    familyVersion: 3,
  };
  const soloFamily: QuotationFamilyResponse = {
    master: { id: 'q-solo', number: 'KP-012', organizationId: 'org-master', familyRole: 'solo', familyVersion: 1, total: 500, status: 'draft' },
    variants: [],
    familyVersion: 1,
  };

  async function setup(): Promise<void> {
    quotationsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: rows })),
      getFamily: jest.fn().mockImplementation((id: string) =>
        of({ ok: true, data: id === 'q-solo' ? soloFamily : masterFamily }),
      ),
      syncFromMaster: jest.fn(),
    };
    studioApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] } satisfies SilentResult<StudioDocument[]>)) };
    organizationsApi = { list: jest.fn().mockReturnValue(of(orgs)) };
    toast = { error: jest.fn(), success: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ProposalsListPage],
      providers: [
        provideRouter([]),
        { provide: PiQuotationsService, useValue: quotationsApi },
        { provide: PiStudioDocumentsService, useValue: studioApi },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function familyControlsOf(number: string): { expand: HTMLButtonElement; sync: HTMLButtonElement | null } {
    const rowsEl = fixture.nativeElement.querySelectorAll('[data-test="proposal-row"]');
    const row = Array.from(rowsEl).find((r) => ((r as HTMLElement).textContent ?? '').includes(number));
    if (!row) throw new Error(`row not found for ${number}`);
    const expand = row.querySelector('[data-test="proposal-family-expand"]') as HTMLButtonElement | null;
    const sync = row.querySelector('[data-test="proposal-family-sync"]') as HTMLButtonElement | null;
    if (!expand) throw new Error(`expand button not found for ${number}`);
    return { expand, sync };
  }

  function syncButtonOf(number: string): HTMLButtonElement {
    const sync = familyControlsOf(number).sync;
    if (!sync) throw new Error(`sync button not found for ${number}`);
    return sync;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('offers «Синхронизировать» only inside an expanded master family with variants', async () => {
    await setup();

    // Master family with one variant → sync action appears after expand.
    expect(familyControlsOf('KP-010').sync).toBeNull();
    familyControlsOf('KP-010').expand.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(familyControlsOf('KP-010').sync).toBeTruthy();

    // Solo without family → no sync action.
    expect(familyControlsOf('KP-012').sync).toBeNull();
    familyControlsOf('KP-012').expand.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(familyControlsOf('KP-012').sync).toBeNull();
  });

  it('confirms via AlertDialog and POSTs syncFromMaster only when confirmed', async () => {
    await setup();
    quotationsApi.syncFromMaster.mockReturnValue(of({ ok: true, data: familyAfterSync }));
    const dialog = TestBed.inject(PiDialogService) as unknown as { open: jest.Mock };
    const closedSignal = signal<boolean | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: boolean) => closedSignal.set(v) } as unknown as DialogRef<boolean>;
    dialog.open.mockReturnValue(ref);

    familyControlsOf('KP-010').expand.click();
    await fixture.whenStable();
    fixture.detectChanges();

    syncButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(dialog.open).toHaveBeenCalledWith(AlertDialogComponent, expect.objectContaining({ data: expect.any(Object) }));

    ref.close(true);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(quotationsApi.syncFromMaster).toHaveBeenCalledWith('q-master');
    expect(toast.success).toHaveBeenCalledWith('Состав синхронизирован');
    const cached = fixture.componentInstance.familyByRow()['q-master'];
    expect(cached.familyVersion).toBe(3);
  });

  it('does not POST when the sync confirm is cancelled', async () => {
    await setup();
    const dialog = TestBed.inject(PiDialogService) as unknown as { open: jest.Mock };
    const closedSignal = signal<boolean | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: boolean) => closedSignal.set(v) } as unknown as DialogRef<boolean>;
    dialog.open.mockReturnValue(ref);

    familyControlsOf('KP-010').expand.click();
    await fixture.whenStable();
    fixture.detectChanges();
    syncButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();

    ref.close(false);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(quotationsApi.syncFromMaster).not.toHaveBeenCalled();
  });

  it('shows an error toast and keeps the family cache unchanged when sync fails', async () => {
    await setup();
    quotationsApi.syncFromMaster.mockReturnValue(
      of({
        ok: false,
        error: new HttpErrorResponse({ status: 400, error: { message: 'Quotation must be master' } }),
      }),
    );
    const dialog = TestBed.inject(PiDialogService) as unknown as { open: jest.Mock };
    const closedSignal = signal<boolean | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: boolean) => closedSignal.set(v) } as unknown as DialogRef<boolean>;
    dialog.open.mockReturnValue(ref);

    familyControlsOf('KP-010').expand.click();
    await fixture.whenStable();
    fixture.detectChanges();
    syncButtonOf('KP-010').click();
    await fixture.whenStable();
    fixture.detectChanges();

    ref.close(true);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalledWith('Не удалось синхронизировать состав', expect.anything());
    const cached = fixture.componentInstance.familyByRow()['q-master'];
    expect(cached).toEqual(masterFamily);
  });
});