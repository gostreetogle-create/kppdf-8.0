import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { CounterpartyFullEditorDialogComponent } from '../../counterparties/counterparty-full-editor-dialog.component';
import {
  ProposalCreateRecipientComponent,
  type ProposalRecipientState,
} from './proposal-create-recipient.component';
import { CounterpartyService } from '../../../shared/services/pi-counterparty.service';
import { PersonsService } from '../../../shared/services/pi-persons.service';
import { SiteService } from '../../../shared/services/pi-site.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PersonQuickCreateDialogComponent } from '../../../shared/person/person-quick-create-dialog.component';

interface RecipientHarness {
  selectSite(siteId: string): void;
  openCard(): void;
  openCreatePerson(): void;
}

describe('ProposalCreateRecipientComponent A5 characterization', () => {
  let fixture: ComponentFixture<ProposalCreateRecipientComponent>;
  let sitesList: jest.Mock;
  let dialogSpy: { open: jest.Mock };
  let routerNavigate: jest.SpyInstance;

  const fakeClient = { _id: 'cp-1', name: 'ООО Клиент', inn: '7700000001', isActive: true };

  beforeEach(async () => {
    sitesList = jest.fn(() =>
      of({
        ok: true,
        data: [{ _id: 'site-1', counterpartyId: 'cp-1', name: 'Офис', address: 'Москва' }],
      }),
    );
    dialogSpy = { open: jest.fn().mockReturnValue({}) };
    await TestBed.configureTestingModule({
      imports: [ProposalCreateRecipientComponent],
      providers: [
        provideRouter([]),
        { provide: PiDialogService, useValue: dialogSpy },
        {
          provide: CounterpartyService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: { items: [fakeClient], total: 1, page: 1, limit: 200 },
              }),
            findById: jest.fn(),
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
    routerNavigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
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

  it('openCard opens CounterpartyFullEditor in-place without router navigation', async () => {
    fixture.componentRef.setInput('selectedCounterpartyId', 'cp-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const harness = fixture.componentInstance as unknown as RecipientHarness;
    harness.openCard();

    expect(routerNavigate).not.toHaveBeenCalled();
    expect(dialogSpy.open).toHaveBeenCalledWith(
      CounterpartyFullEditorDialogComponent,
      expect.objectContaining({ data: fakeClient }),
    );
  });
});

describe('ProposalCreateRecipientComponent template (TZ-PARTY-306)', () => {
  let fixture: ComponentFixture<ProposalCreateRecipientComponent>;
  let dialogSpy: { open: jest.Mock };

  const fakeClient = {
    _id: 'cp-1',
    name: 'ООО Клиент',
    inn: '7700000001',
    isActive: true,
    contactPersonId: 'person-old',
  };

  beforeEach(async () => {
    dialogSpy = { open: jest.fn().mockReturnValue({}) };
    await TestBed.configureTestingModule({
      imports: [ProposalCreateRecipientComponent],
      providers: [
        provideRouter([]),
        { provide: PiDialogService, useValue: dialogSpy },
        {
          provide: CounterpartyService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: { items: [fakeClient], total: 1, page: 1, limit: 200 },
              }),
          },
        },
        {
          provide: PersonsService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: {
                  items: [
                    { _id: 'person-1', firstName: 'Анна', lastName: 'Смирнова' },
                    { _id: 'person-2', firstName: 'Борис', lastName: 'Козлов' },
                  ],
                },
              }),
          },
        },
        {
          provide: SiteService,
          useValue: { listByCounterparty: () => of({ ok: true, data: [] }) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProposalCreateRecipientComponent);
  });

  it('lists all persons in overflow-select and shows + button', async () => {
    fixture.componentRef.setInput('selectedCounterpartyId', 'cp-1');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[data-test="kp-recipient-contact"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-recipient-contact-add"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('select[data-test="kp-recipient-contact"]'),
    ).toBeNull();
  });

  it('openCreatePerson opens PersonQuickCreate dialog', async () => {
    fixture.componentRef.setInput('selectedCounterpartyId', 'cp-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const harness = fixture.componentInstance as unknown as RecipientHarness;
    harness.openCreatePerson();

    expect(dialogSpy.open).toHaveBeenCalledWith(
      PersonQuickCreateDialogComponent,
      expect.objectContaining({ width: 'sm' }),
    );
  });
});
