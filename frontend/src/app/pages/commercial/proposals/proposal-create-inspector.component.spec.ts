import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { OrganizationFullEditorDialogComponent } from '../../organizations/organization-full-editor-dialog.component';
import { ProposalCreateInspectorComponent } from './proposal-create-inspector.component';
import { Organization, OrganizationsService } from '../../../shared/services/organizations.service';
import { CounterpartyService } from '../../../shared/services/pi-counterparty.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';

interface InspectorHarness {
  onTextChange(field: 'number' | 'title' | 'date' | 'validUntil', event: Event): void;
  number(): string;
  openOrganization(): void;
}

describe('ProposalCreateInspectorComponent A6 characterization', () => {
  let fixture: ComponentFixture<ProposalCreateInspectorComponent>;
  let dialogSpy: { open: jest.Mock };
  let routerNavigate: jest.SpyInstance;

  const fakeOrg = { _id: 'org-1', name: 'ООО Наша фирма', inn: '7700000002' } as Organization;

  beforeEach(async () => {
    dialogSpy = { open: jest.fn().mockReturnValue({}) };
    await TestBed.configureTestingModule({
      imports: [ProposalCreateInspectorComponent],
      providers: [
        provideRouter([]),
        { provide: PiDialogService, useValue: dialogSpy },
        {
          provide: OrganizationsService,
          useValue: {
            list: () => of({ ok: true, data: { items: [fakeOrg], total: 1 } }),
            findById: jest.fn(),
          },
        },
        {
          provide: CounterpartyService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
      ],
    })
      .overrideComponent(ProposalCreateInspectorComponent, { set: { template: '', imports: [] } })
      .compileComponents();
    fixture = TestBed.createComponent(ProposalCreateInspectorComponent);
    routerNavigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('does not wipe an in-progress number when the parent rebinds inputs', () => {
    fixture.componentRef.setInput('initialNumber', 'server-1');
    fixture.detectChanges();
    const inspector = fixture.componentInstance as unknown as InspectorHarness;

    inspector.onTextChange('number', { target: { value: 'draft-edit' } } as unknown as Event);
    fixture.componentRef.setInput('initialNumber', 'server-2');
    fixture.detectChanges();

    expect(inspector.number()).toBe('draft-edit');
  });

  it('accepts a parent input update when the field was not edited locally', () => {
    fixture.componentRef.setInput('initialNumber', 'server-1');
    fixture.detectChanges();
    const inspector = fixture.componentInstance as unknown as InspectorHarness;

    fixture.componentRef.setInput('initialNumber', 'server-2');
    fixture.detectChanges();

    expect(inspector.number()).toBe('server-2');
  });

  it('MECH-503: number input shows autosave placeholder when empty', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProposalCreateInspectorComponent],
      providers: [
        provideRouter([]),
        { provide: PiDialogService, useValue: dialogSpy },
        {
          provide: OrganizationsService,
          useValue: {
            list: () => of({ ok: true, data: { items: [fakeOrg], total: 1 } }),
            findById: jest.fn(),
          },
        },
        {
          provide: CounterpartyService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
      ],
    }).compileComponents();
    const fullFixture = TestBed.createComponent(ProposalCreateInspectorComponent);
    fullFixture.detectChanges();
    await fullFixture.whenStable();

    const input = fullFixture.nativeElement.querySelector(
      '[data-test="kp-insp-number"]',
    ) as HTMLInputElement;
    expect(input.placeholder).toBe('Присвоится при сохранении');
    expect(input.value).toBe('');

    fullFixture.componentRef.setInput('initialNumber', 'QTN-001');
    fullFixture.detectChanges();
    expect(
      (fullFixture.nativeElement.querySelector('[data-test="kp-insp-number"]') as HTMLInputElement)
        .value,
    ).toBe('QTN-001');
  });

  it('openOrganization opens OrganizationFullEditor in-place without router navigation', async () => {
    fixture.componentRef.setInput('initialOrganizationId', 'org-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const inspector = fixture.componentInstance as unknown as InspectorHarness;
    inspector.openOrganization();

    expect(routerNavigate).not.toHaveBeenCalled();
    expect(dialogSpy.open).toHaveBeenCalledWith(
      OrganizationFullEditorDialogComponent,
      expect.objectContaining({ data: fakeOrg }),
    );
  });
});
