import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { OrderItem, Product } from '@kppdf/data-access';
import { OrderWsCompositionComponent } from './order-ws-composition.component';

const ITEMS: OrderItem[] = [
  {
    lineId: 'line-1',
    productId: 'product-1',
    productName: 'Дверь',
    productSku: 'DR-1',
    quantity: 2,
    unit: 'шт',
    readyForWork: false,
  },
];

const PRODUCTS: Product[] = [];

describe('OrderWsCompositionComponent line expansion', () => {
  let fixture: ComponentFixture<OrderWsCompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderWsCompositionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderWsCompositionComponent);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('products', PRODUCTS);
    fixture.detectChanges();
  });

  it('makes the chevron and product title one 44px expansion hit target', () => {
    const expand = fixture.nativeElement.querySelector('[data-test="composition-line-expand"]') as HTMLButtonElement;
    expect(expand).toBeTruthy();
    expect(expand.classList.contains('min-h-11')).toBe(true);
    expect(expand.textContent).toContain('Дверь');

    const emitted: number[] = [];
    fixture.componentInstance.toggleTree.subscribe((index) => emitted.push(index));
    expand.click();
    expect(emitted).toEqual([0]);
  });

  it('does not route quantity or ready controls through tree expansion', () => {
    const emitted: number[] = [];
    fixture.componentInstance.toggleTree.subscribe((index) => emitted.push(index));
    (fixture.nativeElement.querySelector('[data-test="composition-qty"]') as HTMLInputElement).click();
    (fixture.nativeElement.querySelector('[data-test="composition-ready"]') as HTMLInputElement).click();
    expect(emitted).toEqual([]);
  });
});
