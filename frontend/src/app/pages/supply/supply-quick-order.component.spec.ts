import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SupplyQuickOrderComponent } from './supply-quick-order.component';

describe('SupplyQuickOrderComponent TZ-SUPPLY-304', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplyQuickOrderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders quick view with mock seed tiles by default', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      visibleRows: () => { id: string }[];
    };
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="supply-quick-order"]')).toBeTruthy();
    expect(root.querySelectorAll('[data-test^="supply-quick-tile-qo-"]').length).toBe(5);
    expect(root.textContent).toContain('Подшипник 6205');
    expect(comp.visibleRows().length).toBe(5);
  });

  it('create adds an expanded tile at the top', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onCreate: () => void;
      expandedId: () => string | null;
      visibleRows: () => { id: string }[];
    };
    comp.onCreate();
    fixture.detectChanges();

    const expandedId = comp.expandedId();
    expect(expandedId).toBeTruthy();
    expect(comp.visibleRows().some((r) => r.id === expandedId)).toBe(true);
    expect(comp.visibleRows().length).toBe(6);
    expect(
      fixture.nativeElement.querySelector('[data-test="supply-quick-tile-expanded"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="supply-quick-title-input"]'),
    ).toBeTruthy();
  });
});
