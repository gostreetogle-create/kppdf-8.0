import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudioDataPanelComponent } from './studio-data-panel.component';

describe('StudioDataPanelComponent', () => {
  let fixture: ComponentFixture<StudioDataPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioDataPanelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StudioDataPanelComponent);
    fixture.componentRef.setInput('issuerOrgName', 'OOO Test');
    fixture.componentRef.setInput('counterparties', [{ _id: 'cp1', name: 'Client 1' }]);
    fixture.componentRef.setInput('quotations', [{ _id: 'q1', number: 'KP-1' }]);
    fixture.componentRef.setInput('orders', [{ _id: 'o1', number: 'Z-1' }]);
    fixture.detectChanges();
  });

  it('renders data panel root', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-data-panel"]')).toBeTruthy();
    expect(el.textContent).toContain('OOO Test');
  });

  it('exposes ERP select data-test hooks', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-counterparty-select"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-quotation-select"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-order-select"]')).toBeTruthy();
  });
});