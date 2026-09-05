import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { PiContractsService, type Contract } from '@kppdf/data-access';
import type { SilentResult } from '@kppdf/util-http';
import { ContractDetailPage } from './contract-detail.page';

describe('ContractDetailPage (TZ-NX-DEALS-D4-CONTRACTS-THIN)', () => {
  let fixture: ComponentFixture<ContractDetailPage>;
  let service: { getById: jest.Mock };

  const contract: Contract = {
    _id: 'c-1',
    number: 'DOG-001',
    organizationId: 'org-1',
    customerId: { _id: 'cp-1', name: 'ООО Альфа' },
    proposalId: { _id: 'q-1', number: 'KP-010' },
    status: 'signed',
    contractStatus: 'none',
    items: [{ productId: 'p-1', productName: 'Дверь', quantity: 2, unitPrice: 1000, total: 2000 }],
    totalAmount: 2000,
  };

  async function setup(result: SilentResult<Contract>, id = 'c-1'): Promise<void> {
    service = { getById: jest.fn().mockReturnValue(of(result)) };
    await TestBed.configureTestingModule({
      imports: [ContractDetailPage],
      providers: [
        { provide: PiContractsService, useValue: service },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDetailPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders number, status, customer, КП and items with totals', async () => {
    await setup({ ok: true, data: contract });

    expect(service.getById).toHaveBeenCalledWith('c-1');
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="contract-title"]')?.textContent).toContain('DOG-001');
    expect(root.textContent).toContain('Подписан');
    expect(root.textContent).toContain('ООО Альфа');
    expect(root.textContent).toContain('KP-010');
    const item = root.querySelector('[data-test="contract-item"]');
    expect(item?.textContent).toContain('Дверь');
    expect(item?.textContent).toContain('×2');
    expect(root.querySelector('[data-test="contract-total"]')?.textContent).toContain('2000');
  });

  it('shows «Без КП» when proposalId is absent', async () => {
    await setup({ ok: true, data: { ...contract, proposalId: undefined } });
    expect(fixture.nativeElement.textContent).toContain('Без КП');
  });

  it('shows the empty-items dash panel when there are no items', async () => {
    await setup({ ok: true, data: { ...contract, items: [] } });
    expect(fixture.nativeElement.querySelector('[data-test="contract-items-empty"]')).toBeTruthy();
  });

  it('renders a retryable error state', async () => {
    await setup({ ok: false, error: new HttpErrorResponse({ status: 404 }) });
    expect(fixture.nativeElement.querySelector('[data-test="contract-error"]')).toBeTruthy();
  });
});
