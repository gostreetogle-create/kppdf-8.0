import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AuthService, PiContractsService, type Contract } from '@kppdf/data-access';
import type { SilentResult } from '@kppdf/util-http';
import { ContractsListPage } from './contracts-list.page';

describe('ContractsListPage (TZ-NX-DEALS-D4-CONTRACTS-THIN)', () => {
  let fixture: ComponentFixture<ContractsListPage>;
  let service: { list: jest.Mock };

  const contracts: Contract[] = [
    {
      _id: 'c-1',
      number: 'DOG-001',
      organizationId: 'org-1',
      customerId: { _id: 'cp-1', name: 'ООО Альфа' },
      status: 'active',
      contractStatus: 'none',
      items: [],
      totalAmount: 15000,
    },
    {
      _id: 'c-2',
      number: 'DOG-002',
      organizationId: 'org-1',
      customerId: 'cp-2',
      status: 'draft',
      contractStatus: 'none',
      items: [],
      totalAmount: 0,
    },
  ];

  async function setup(result: ReturnType<typeof of> | Subject<SilentResult<Contract[]>>): Promise<void> {
    service = { list: jest.fn().mockReturnValue(result) };
    await TestBed.configureTestingModule({
      imports: [ContractsListPage],
      providers: [
        provideRouter([]),
        { provide: PiContractsService, useValue: service },
        { provide: AuthService, useValue: { user: () => null } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractsListPage);
    fixture.detectChanges();
  }

  async function settle(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the loading state while the list request is pending', async () => {
    const pending = new Subject<SilentResult<Contract[]>>();
    await setup(pending);

    expect(fixture.nativeElement.querySelector('[data-test="contracts-list"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="contracts-loading"]')).toBeTruthy();
  });

  it('renders a retryable error state', async () => {
    await setup(of({ ok: false, error: new HttpErrorResponse({ status: 500 }) } satisfies SilentResult<Contract[]>));
    await settle();
    expect(fixture.nativeElement.querySelector('[data-test="contracts-error"]')).toBeTruthy();
  });

  it('renders an honest empty state', async () => {
    await setup(of({ ok: true, data: [] } satisfies SilentResult<Contract[]>));
    await settle();
    expect(fixture.nativeElement.querySelector('[data-test="contracts-empty"]')).toBeTruthy();
  });

  it('renders rows with populated and raw-id customer name, Russian status, and a detail link', async () => {
    await setup(of({ ok: true, data: contracts } satisfies SilentResult<Contract[]>));
    await settle();

    const rows = fixture.nativeElement.querySelectorAll('[data-test="contract-row"]');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('DOG-001');
    expect(rows[0].textContent).toContain('ООО Альфа');
    expect(rows[0].textContent).toContain('Действует');
    expect(rows[1].textContent).toContain('cp-2');
    expect(rows[1].textContent).toContain('Черновик');
    const link = rows[0].querySelector('[data-test="contract-row-link"]') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/contracts/c-1');
  });
});
