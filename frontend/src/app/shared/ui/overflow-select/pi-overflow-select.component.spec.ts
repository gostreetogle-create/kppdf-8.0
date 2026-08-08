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

  it('default searchable=false does not show search for short lists', () => {
    fixture.nativeElement
      .querySelector('[data-test="pi-overflow-select-trigger"]')
      ?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(document.querySelector('[data-test="pi-overflow-select-search"]')).toBeFalsy();
  });

  it('searchable=true filters by substring (letters/digits)', () => {
    fixture.componentRef.setInput('searchable', true);
    fixture.componentRef.setInput('items', [
      { id: '1', label: 'Демо · Панель' },
      { id: '2', label: 'DEMO-LOCAL-MOD-FRAME' },
      { id: '3', label: 'Финиш 100' },
    ]);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-test="pi-overflow-select-trigger"]')
      ?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    const search = document.querySelector(
      '[data-test="pi-overflow-select-search"]',
    ) as HTMLInputElement;
    expect(search).toBeTruthy();
    search.value = 'demo';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    let labels = Array.from(
      document.querySelectorAll('[data-test="pi-overflow-select-list"] button'),
    ).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['DEMO-LOCAL-MOD-FRAME']);

    search.value = 'финиш';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    labels = Array.from(
      document.querySelectorAll('[data-test="pi-overflow-select-list"] button'),
    ).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['Финиш 100']);
  });

  it('searchable=auto shows search only when items >= threshold', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      label: `Пункт ${i}`,
    }));
    fixture.componentRef.setInput('searchable', 'auto');
    fixture.componentRef.setInput('items', many);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-test="pi-overflow-select-trigger"]')
      ?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(document.querySelector('[data-test="pi-overflow-select-search"]')).toBeTruthy();
    fixture.componentInstance.close();
    fixture.detectChanges();

    fixture.componentRef.setInput('items', many.slice(0, 5));
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('[data-test="pi-overflow-select-trigger"]')
      ?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(document.querySelector('[data-test="pi-overflow-select-search"]')).toBeFalsy();
  });
});
