import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DropdownMenuComponent, type DropdownMenuItem } from './pi-dropdown-menu.component';

describe('DropdownMenuComponent', () => {
  let fixture: ComponentFixture<DropdownMenuComponent>;
  let component: DropdownMenuComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownMenuComponent);
    component = fixture.componentInstance;
  });

  function setItems(items: DropdownMenuItem[]): void {
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  }

  it('renders items with labels', () => {
    setItems([{ label: 'First' }, { label: 'Second' }]);
    const items = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('First');
  });

  it('renders href items as <a> with routerLink', () => {
    setItems([{ label: 'Go', href: '/products' }]);
    const link = fixture.nativeElement.querySelector('a[role="menuitem"]');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/products');
  });

  it('renders disabled items as <span aria-disabled>', () => {
    setItems([{ label: 'Soon', disabled: true }]);
    const item = fixture.nativeElement.querySelector('[aria-disabled="true"]');
    expect(item).toBeTruthy();
    expect(item.textContent).toContain('Soon');
  });

  it('renders separator labels', () => {
    setItems([{ label: 'Item', separatorLabel: 'Section' }]);
    const sep = fixture.nativeElement.querySelector('[role="separator"]');
    expect(sep).toBeTruthy();
    expect(sep.textContent).toContain('Section');
  });

  it('calls handler and emits close on click', () => {
    const handler = jest.fn();
    const closeSpy = jest.fn();
    component.close.subscribe(closeSpy);
    setItems([{ label: 'Click me', handler }]);

    fixture.nativeElement.querySelector('[role="menuitem"]').click();
    expect(handler).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('renders empty menu when items is empty', () => {
    setItems([]);
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(0);
  });
});
