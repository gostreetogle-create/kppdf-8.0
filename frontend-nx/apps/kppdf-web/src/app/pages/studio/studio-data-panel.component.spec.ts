import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudioDataPanelComponent } from './studio-data-panel.component';

describe('StudioDataPanelComponent', () => {
  let fixture: ComponentFixture<StudioDataPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioDataPanelComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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

  it('shows KP status select when showKpStatus=true', () => {
    fixture.componentRef.setInput('showKpStatus', true);
    fixture.componentRef.setInput('quotationStatus', 'draft');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-quotation-status-select"]')).toBeTruthy();
    expect(el.textContent).toContain('Черновик');
  });

  it('renders catalog vitrina segment + grid inside data panel', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-data-vitrina"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-data-vitrina-tab-products"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-data-vitrina-grid"]')).toBeTruthy();
  });

  it('keeps the vitrina grid inside its panel and clips only horizontal overflow', () => {
    const css = readFileSync(
      join(__dirname, 'studio-data-vitrina.component.ts'),
      'utf8',
    );
    expect(css).toMatch(/\.vitrina-grid\s*\{[^}]*min-width:\s*0/s);
    expect(css).toMatch(/\.vitrina-grid\s*\{[^}]*overflow-x:\s*hidden/s);
    expect(css).toMatch(/\.vitrina-grid\s*\{[^}]*overflow-y:\s*auto/s);
    expect(css).toMatch(/\.vitrina-grid app-pi-showcase-card\s*\{[^}]*min-width:\s*0/s);
  });
});
