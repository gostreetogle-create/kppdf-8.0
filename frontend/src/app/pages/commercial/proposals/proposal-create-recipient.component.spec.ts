import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  ProposalCreateRecipientComponent,
  type ProposalRecipientState,
} from './proposal-create-recipient.component';
import { CounterpartyService } from '../../../shared/services/pi-counterparty.service';
import { PersonsService } from '../../../shared/services/pi-persons.service';
import { SiteService } from '../../../shared/services/pi-site.service';

interface RecipientHarness {
  selectSite(siteId: string): void;
}

describe('ProposalCreateRecipientComponent A5 characterization', () => {
  let fixture: ComponentFixture<ProposalCreateRecipientComponent>;
  let sitesList: jest.Mock;

  beforeEach(async () => {
    sitesList = jest.fn(() =>
      of({
        ok: true,
        data: [{ _id: 'site-1', counterpartyId: 'cp-1', name: 'Офис', address: 'Москва' }],
      }),
    );
    await TestBed.configureTestingModule({
      imports: [ProposalCreateRecipientComponent],
      providers: [
        provideRouter([]),
        {
          provide: CounterpartyService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: {
                  items: [{ _id: 'cp-1', name: 'ООО Клиент', inn: '7700000001', isActive: true }],
                  total: 1,
                  page: 1,
                  limit: 200,
                },
              }),
          },
        },
        {
          provide: PersonsService,
          useValue: {
            list: () => of({ ok: true, data: { items: [] } }),
          },
        },
        { provide: SiteService, useValue: { listByCounterparty: sitesList } },
      ],
    })
      .overrideComponent(ProposalCreateRecipientComponent, { set: { template: '', imports: [] } })
      .compileComponents();
    fixture = TestBed.createComponent(ProposalCreateRecipientComponent);
  });

  it('loads sites from the counterparty input without subscribing inside an effect', async () => {
    fixture.componentRef.setInput('selectedCounterpartyId', 'cp-1');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sitesList).toHaveBeenCalledWith('cp-1');
  });

  it('preserves the stateChange output contract for site selection', () => {
    const states: ProposalRecipientState[] = [];
    fixture.componentInstance.stateChange.subscribe((state) => states.push(state));
    fixture.componentRef.setInput('selectedCounterpartyId', 'cp-1');
    fixture.componentRef.setInput('selectedContactPersonId', 'person-1');
    fixture.detectChanges();

    const harness = fixture.componentInstance as unknown as RecipientHarness;
    harness.selectSite('site-1');

    expect(states).toEqual([
      { counterpartyId: 'cp-1', contactPersonId: 'person-1', siteId: 'site-1' },
    ]);
  });
});
