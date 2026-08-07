import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiOverflowSelectComponent } from './pi-overflow-select.component';

describe('PiOverflowSelectComponent', () => {
  let fixture: ComponentFixture<PiOverflowSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiOverflowSelectComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(PiOverflowSelectComponent);
    fixture.componentRef.setInput('items', [
      { id: 'a', label: 'Короткое' },
      {
        id: 'b',
        label: 'Очень длинное название изделия с артикулом и SKU которое должно переноситься',
      },
    ]);
    fixture.detectChanges();
  });

  it('opens overlay list with wrapping option labels', () => {
    fixture.nativeElement
      .querySelector('[data-test="pi-overflow-select-trigger"]')
      ?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    const option = document.querySelector(
      '[data-test="pi-overflow-select-list"] button',
    ) as HTMLElement | null;
    expect(option).toBeTruthy();
    expect(option!.className).toContain('break-words');
    expect(option!.className).toContain('whitespace-normal');
  });

  it('emits value on pick and closes', () => {
    const emits: string[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emits.push(v));
    fixture.nativeElement
      .querySelector('[data-test="pi-overflow-select-trigger"]')
      ?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    (
      document.querySelectorAll('[data-test="pi-overflow-select-list"] button')[1] as HTMLElement
    ).click();
    fixture.detectChanges();
    expect(emits).toEqual(['b']);
    expect(fixture.componentInstance.value()).toBe('b');
    expect(document.querySelector('[data-test="pi-overflow-select-list"]')).toBeFalsy();
  });
});
