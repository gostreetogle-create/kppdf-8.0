import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import { CounterpartyFullEditorDialogComponent } from '../../counterparties/counterparty-full-editor-dialog.component';
import { OrganizationFullEditorDialogComponent } from '../../organizations/organization-full-editor-dialog.component';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { CounterpartyService } from '../../../shared/services/pi-counterparty.service';
import { ProductsService } from '../../../shared/services/products.service';
import { ProposalsService } from '../../../shared/services/pi-proposals.service';
import { ProposalFormDialogComponent } from './proposal-form-dialog.component';

interface FormHarness {
  openCreateOrganization(): void;
  openCreateCounterparty(): void;
}

describe('ProposalFormDialogComponent (TZ-UI-PLUS-604)', () => {
  let dialogOpen: jest.Mock;

  beforeEach(async () => {
    dialogOpen = jest.fn().mockReturnValue({ closed: signal(undefined) });
    await TestBed.configureTestingModule({
      imports: [ProposalFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: null },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } },
        { provide: PiDialogService, useValue: { open: dialogOpen } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        {
          provide: ProposalsService,
          useValue: { create: jest.fn(), update: jest.fn() },
        },
        {
          provide: OrganizationsService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        {
          provide: CounterpartyService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        {
          provide: ProductsService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
      ],
    }).compileComponents();
  });

  it('org/counterparty selects use pi-select-add-row with supply add-btn', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'proposal-form-dialog.component.ts'),
      'utf8',
    );
    expect(source).toContain('pi-select-add-row');
    expect(source).toContain('pi-select-add-btn');
    expect(source).toContain('data-test="pr-org-add"');
    expect(source).toContain('data-test="pr-cp-add"');
    expect(source).toContain('openCreateOrganization()');
    expect(source).toContain('openCreateCounterparty()');
  });

  it('openCreateOrganization opens OrganizationFullEditor with data null', () => {
    const fixture = TestBed.createComponent(ProposalFormDialogComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as FormHarness;
    comp.openCreateOrganization();
    expect(dialogOpen).toHaveBeenCalledWith(
      OrganizationFullEditorDialogComponent,
      expect.objectContaining({ data: null, width: 'lg' }),
    );
  });

  it('openCreateCounterparty opens CounterpartyFullEditor with data null', () => {
    const fixture = TestBed.createComponent(ProposalFormDialogComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as FormHarness;
    comp.openCreateCounterparty();
    expect(dialogOpen).toHaveBeenCalledWith(
      CounterpartyFullEditorDialogComponent,
      expect.objectContaining({ data: null, width: 'lg' }),
    );
  });
});
