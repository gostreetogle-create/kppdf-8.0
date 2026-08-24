import { TestBed } from '@angular/core/testing';
import { PiSelectAddRowComponent } from './pi-select-add-row.component';

describe('PiSelectAddRowComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiSelectAddRowComponent],
    }).compileComponents();
  });

  it('renders green add button beside projected content', () => {
    const fixture = TestBed.createComponent(PiSelectAddRowComponent);
    fixture.componentRef.setInput('addDataTest', 'test-add');
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('.pi-select-add-row') as HTMLElement;
    const btn = fixture.nativeElement.querySelector('[data-test="test-add"]') as HTMLButtonElement;
    expect(row).toBeTruthy();
    expect(btn?.classList.contains('pi-select-add-btn')).toBe(true);
  });

  it('emits addClick when + is clicked', () => {
    const fixture = TestBed.createComponent(PiSelectAddRowComponent);
    const addClick = jest.fn();
    fixture.componentInstance.addClick.subscribe(addClick);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.pi-select-add-btn') as HTMLButtonElement).click();
    expect(addClick).toHaveBeenCalled();
  });
});
