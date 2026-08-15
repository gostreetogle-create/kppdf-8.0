import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProposalCreateInspectorComponent } from './proposal-create-inspector.component';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { CounterpartyService } from '../../../shared/services/pi-counterparty.service';

interface InspectorHarness {
  onTextChange(field: 'number' | 'title' | 'date' | 'validUntil', event: Event): void;
  number(): string;
}

describe('ProposalCreateInspectorComponent A6 characterization', () => {
  let fixture: ComponentFixture<ProposalCreateInspectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalCreateInspectorComponent],
      providers: [
        provideRouter([]),
        {
          provide: OrganizationsService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
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
});
