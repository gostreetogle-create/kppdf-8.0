import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiFactCardComponent } from './fact-card.component';
import { PiFactStackComponent } from './fact-stack.component';

@Component({
  standalone: true,
  imports: [PiFactCardComponent, PiFactStackComponent],
  template: `
    <app-pi-fact-stack title="Деньги" headingId="fact-money">
      <app-pi-fact-card
        label="Прайс"
        value="12 900 ₽"
        caption="Цена витрины / для КП"
        [mono]="true"
      >
        <button actions type="button" data-test="fact-action-btn">Пересчитать</button>
      </app-pi-fact-card>
      <app-pi-fact-card label="Себест." value="8 100 ₽" variant="emphasis" [mono]="true" />
    </app-pi-fact-stack>
  `,
})
class HostFactFixture {}

describe('PiFactCard + PiFactStack (TZ-UX-FACT-301)', () => {
  let fixture: ComponentFixture<HostFactFixture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostFactFixture],
    }).compileComponents();
    fixture = TestBed.createComponent(HostFactFixture);
    fixture.detectChanges();
  });

  it('renders stack title and fact label/value/caption', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="pi-fact-stack-title"]')?.textContent?.trim()).toBe(
      'Деньги',
    );
    expect(root.querySelector('[data-test="pi-fact-card-label"]')?.textContent?.trim()).toBe(
      'Прайс',
    );
    const values = Array.from(root.querySelectorAll('[data-test="pi-fact-card-value"]')).map((el) =>
      el.textContent?.trim(),
    );
    expect(values).toEqual(['12 900 ₽', '8 100 ₽']);
    expect(root.querySelector('[data-test="pi-fact-card-caption"]')?.textContent?.trim()).toBe(
      'Цена витрины / для КП',
    );
  });

  it('projects actions slot; mono + emphasis variants', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="fact-action-btn"]')).toBeTruthy();
    const cards = root.querySelectorAll('[data-test="pi-fact-card"]');
    expect(cards.length).toBe(2);
    expect(cards[0]?.getAttribute('data-variant')).toBe('default');
    expect(cards[1]?.getAttribute('data-variant')).toBe('emphasis');
    expect(
      (
        cards[0]?.querySelector('[data-test="pi-fact-card-value"]') as HTMLElement
      ).classList.contains('font-mono'),
    ).toBe(true);
  });

  it('standalone unit: danger variant + empty caption omitted', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PiFactCardComponent],
    }).compileComponents();
    const cardFixture = TestBed.createComponent(PiFactCardComponent);
    cardFixture.componentRef.setInput('value', 'Убрать');
    cardFixture.componentRef.setInput('label', 'Действие');
    cardFixture.componentRef.setInput('variant', 'danger');
    cardFixture.detectChanges();
    const el = cardFixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="pi-fact-card"]')?.getAttribute('data-variant')).toBe(
      'danger',
    );
    expect(el.querySelector('[data-test="pi-fact-card-caption"]')).toBeNull();
  });
});
