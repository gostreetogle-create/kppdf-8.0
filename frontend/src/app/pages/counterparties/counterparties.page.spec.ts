import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { CounterpartiesPage } from './counterparties.page';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { TableComponent } from '../../shared/ui/pi-table.component';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';

/**
 * TZ-PARTY-301 — the «временный» badge is the only signal a manager gets that
 * an INN came from quick-create, so it is covered by a rendering test.
 */
describe('CounterpartiesPage (TZ-PARTY-301 stub INN badge)', () => {
  const rows: Counterparty[] = [
    { _id: 'cp-1', name: 'ООО Ромашка', inn: '7701234567', innIsStub: false },
    { _id: 'cp-2', name: 'Иванов', inn: '1234567894', innIsStub: true },
  ];

  async function render(items: Counterparty[]) {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CounterpartyService,
          useValue: {
            list: () => of({ ok: true, data: { items, total: items.length, page: 1, limit: 200 } }),
          },
        },
      ],
    })
      .overrideComponent(CounterpartiesPage, {
        set: { imports: [TableComponent, BadgeComponent], schemas: [NO_ERRORS_SCHEMA] },
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
});
