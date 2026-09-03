import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  PiQuotationsService,
  PiStudioDocumentsService,
  type Quotation,
  type StudioDocument,
} from '@kppdf/data-access';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { ProposalsListPage } from './proposals-list.page';

describe('ProposalsListPage (TZ-NX-SALES-S37-QUOTATION-CONVERT)', () => {
  let fixture: ComponentFixture<ProposalsListPage>;
  let quotationsApi: { list: jest.Mock; convertToOrder: jest.Mock };
  let studioApi: { list: jest.Mock };
  let toast: { error: jest.Mock };
  let router: { navigate: jest.Mock };

  const quotations: Quotation[] = [
    { _id: 'q-accepted', number: 'KP-001', status: 'accepted' },
    { _id: 'q-draft', number: 'KP-002', status: 'draft' },
    { _id: 'q-sent', number: 'KP-003', status: 'sent' },
  ];

  async function setup(): Promise<void> {
    quotationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: quotations })), convertToOrder: jest.fn() };
    studioApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] } satisfies SilentResult<StudioDocument[]>)) };
    toast = { error: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [ProposalsListPage],
      providers: [
        provideRouter([]),
        { provide: PiQuotationsService, useValue: quotationsApi },
        { provide: PiStudioDocumentsService, useValue: studioApi },
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
  let quotationsApi: { list: jest.Mock; convertToOrder: jest.Mock };
  let studioApi: { list: jest.Mock };
  let toast: { error: jest.Mock };

  const familyRows: Quotation[] = [
    { _id: 'q-master', number: 'KP-010', status: 'sent', familyRole: 'master', familyVersion: 3 },
    { _id: 'q-variant-a', number: 'KP-011', status: 'draft', familyRole: 'variant', masterId: 'q-master' },
    { _id: 'q-solo', number: 'KP-012', status: 'draft' },
  ];

  async function setup(): Promise<void> {
    quotationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: familyRows })), convertToOrder: jest.fn() };
    studioApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] } satisfies SilentResult<StudioDocument[]>)) };
    toast = { error: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [ProposalsListPage],
      providers: [
        provideRouter([]),
        { provide: PiQuotationsService, useValue: quotationsApi },
        { provide: PiStudioDocumentsService, useValue: studioApi },
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