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

  function tocButton(key: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(`[data-test="studio-data-toc-${key}"]`) as HTMLButtonElement;
  }

  it('renders data panel root', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-data-panel"]')).toBeTruthy();
  });

  it('renders the 4 Data TOC categories with Товары active by default (TZ-NX-DOCSTUDIO-D56)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const toc = el.querySelector('[data-test="studio-data-toc"]') as HTMLElement;
    expect(toc.textContent).toContain('Товары');
    expect(toc.textContent).not.toContain('Выбрано');
    expect(toc.querySelector('[data-test="studio-data-toc-selected"]')).toBeFalsy();
    expect(toc.textContent).toContain('Кому');
    expect(toc.textContent).toContain('Связи');
    expect(toc.textContent).toContain('Ещё');
    expect(tocButton('products').classList.contains('active')).toBe(true);
    expect(el.querySelector('[data-test="studio-data-section-products"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-data-section-whom"]')).toBeFalsy();
  });

  it('switches the visible section on TOC click without touching catalog Add/Remove (TZ-NX-DOCSTUDIO-D50)', () => {
    tocButton('whom').click();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-data-section-whom"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-data-section-products"]')).toBeFalsy();
    expect(el.querySelector('[data-test="studio-counterparty-select"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-payer-disclosure-toggle"]')).toBeTruthy();

    tocButton('products').click();
    fixture.detectChanges();
    expect(el.querySelector('[data-test="studio-data-vitrina"]')).toBeTruthy();
  });

  it('«Связи» holds КП/Статус/Заказ; «Ещё» holds Поставщик + read-only Исполнитель (TZ-NX-DOCSTUDIO-D50)', () => {
    tocButton('links').click();
    fixture.componentRef.setInput('showKpStatus', true);
    fixture.componentRef.setInput('quotationStatus', 'draft');
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-quotation-select"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-quotation-status-select"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-order-select"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-supplier-select"]')).toBeFalsy();

    tocButton('more').click();
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-supplier-select"]')).toBeTruthy();
    expect(el.textContent).toContain('OOO Test');
    expect(el.querySelector('[data-test="studio-quotation-select"]')).toBeFalsy();
  });

  it('uses КП copy, starts every clearable select with an empty option, and emits empty values (TZ-NX-DOCSTUDIO-D55)', () => {
    const emitted: string[] = [];
    fixture.componentInstance.quotationChange.subscribe((value) => emitted.push(value));
    fixture.componentInstance.orderChange.subscribe((value) => emitted.push(value));
    fixture.componentInstance.counterpartyChange.subscribe((value) => emitted.push(value));
    fixture.componentInstance.payerChange.subscribe((value) => emitted.push(value));
    fixture.componentInstance.supplierChange.subscribe((value) => emitted.push(value));

    tocButton('links').click();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const quotationSelect = el.querySelector('[data-test="studio-quotation-select"]') as HTMLElement;
    const orderSelect = el.querySelector('[data-test="studio-order-select"]') as HTMLElement;
    expect(quotationSelect.querySelector('app-pi-select-trigger button')?.getAttribute('aria-label')).toBe('КП');
    expect(quotationSelect.querySelectorAll('app-pi-select-option')[0]?.textContent?.trim()).toBe('— не выбрано —');
    expect(orderSelect.querySelectorAll('app-pi-select-option')[0]?.textContent?.trim()).toBe('— не выбран —');
    expect(el.textContent).not.toContain('Коммерческое предложение');

    (quotationSelect.querySelector('app-pi-select-option button') as HTMLButtonElement).click();
    expect(emitted).toContain('');

    tocButton('whom').click();
    fixture.detectChanges();
    const whom = fixture.nativeElement as HTMLElement;
    expect(whom.querySelector('[data-test="studio-counterparty-select"] app-pi-select-option')?.textContent?.trim()).toBe('— не выбран —');
    (whom.querySelector('[data-test="studio-counterparty-select"] app-pi-select-option button') as HTMLButtonElement).click();
    expect(emitted).toContain('');

    (whom.querySelector('[data-test="studio-payer-disclosure-toggle"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(whom.querySelector('[data-test="studio-payer-select"] app-pi-select-option')?.textContent?.trim()).toBe('— не выбран —');

    tocButton('more').click();
    fixture.detectChanges();
    const more = fixture.nativeElement as HTMLElement;
    expect(more.querySelector('[data-test="studio-supplier-select"] app-pi-select-option')?.textContent?.trim()).toBe('— не выбран —');
  });

  it('does not render the duplicate inner Данные heading (TZ-NX-DOCSTUDIO-D55)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.heading')).toBeFalsy();
  });

  it('renders the selected buffer in fixed mode without a TOC (TZ-NX-DOCSTUDIO-D56)', () => {
    fixture.componentRef.setInput('mode', 'selected');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-data-panel"]')?.getAttribute('data-panel-mode')).toBe('selected');
    expect(el.querySelector('[data-test="studio-data-toc"]')).toBeFalsy();
    expect(el.querySelector('[data-test="studio-selected-empty"]')?.textContent).toContain('Ничего не выбрано');
  });

  it('shows chips + a TOC badge count once anchors/catalog are selected (TZ-NX-DOCSTUDIO-D51)', () => {
    fixture.componentRef.setInput('selectedAnchors', [{ key: 'client', label: 'Клиент', name: 'ООО Альфа' }]);
    fixture.componentRef.setInput('catalogChips', [{ key: 'products', label: 'изделия', count: 2 }]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('mode', 'selected');
    fixture.detectChanges();
    expect(el.querySelector('[data-test="studio-selected-empty"]')).toBeFalsy();
    expect(el.querySelector('[data-test="studio-selected-anchors"]')?.textContent).toContain('ООО Альфа');
    expect(el.querySelector('[data-test="studio-catalog-chip"]')?.textContent).toContain('изделия');
  });

  it('offers only compatible insert targets and emits insertTable on click (TZ-NX-DOCSTUDIO-D52)', () => {
    const emitted: string[] = [];
    fixture.componentInstance.insertTable.subscribe((kind) => emitted.push(kind));
    fixture.componentRef.setInput('catalogChips', [{ key: 'products', label: 'изделия', count: 2 }]);
    fixture.componentRef.setInput('catalogSelections', { products: ['p1', 'p2'], modules: [], parts: [], materials: [] });
    fixture.detectChanges();
    fixture.componentRef.setInput('mode', 'selected');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const productsBtn = el.querySelector('[data-test="studio-insert-products"]') as HTMLButtonElement;
    expect(productsBtn).toBeTruthy();
    expect(el.querySelector('[data-test="studio-insert-modules"]')).toBeFalsy();
    expect(el.querySelector('[data-test="studio-insert-disabled"]')).toBeFalsy();

    productsBtn.click();
    expect(emitted).toEqual(['products']);
  });

  it('shows a disabled CTA + hint when the buffer has anchors but no catalog selections (TZ-NX-DOCSTUDIO-D52)', () => {
    fixture.componentRef.setInput('selectedAnchors', [{ key: 'client', label: 'Клиент', name: 'ООО Альфа' }]);
    fixture.detectChanges();
    fixture.componentRef.setInput('mode', 'selected');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const disabledBtn = el.querySelector('[data-test="studio-insert-disabled"]') as HTMLButtonElement;
    expect(disabledBtn.disabled).toBe(true);
    expect(el.querySelector('[data-test="studio-insert-hint"]')?.textContent).toContain('Выберите товары');
  });

  it('«Плательщик» stays a disclosure by default and opens on click (TZ-NX-DOCSTUDIO-D53)', () => {
    tocButton('whom').click();
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-payer-select"]')).toBeFalsy();
    expect(el.querySelector('[data-test="studio-payer-disclosure-toggle"]')?.textContent).toContain('Указать плательщика отдельно');

    (el.querySelector('[data-test="studio-payer-disclosure-toggle"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-payer-select"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-payer-disclosure-toggle"]')).toBeFalsy();
  });

  it('shows the Плательщик select directly (not the disclosure toggle) when a payer is already set (TZ-NX-DOCSTUDIO-D53)', () => {
    fixture.componentRef.setInput('payerId', 'cp1');
    tocButton('whom').click();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-payer-select"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-payer-disclosure-toggle"]')).toBeFalsy();
  });

  it('shows a one-line hint on «Связи» and read-only «Наша фирма: …» + hint on «Ещё» (TZ-NX-DOCSTUDIO-D53)', () => {
    tocButton('links').click();
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-links-hint"]')?.textContent).toContain('КП или заказом');

    tocButton('more').click();
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-issuer-readonly"]')?.textContent).toContain('Наша фирма: OOO Test');
  });

  it('shows KP status select on «Связи» when showKpStatus=true', () => {
    tocButton('links').click();
    fixture.componentRef.setInput('showKpStatus', true);
    fixture.componentRef.setInput('quotationStatus', 'draft');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-quotation-status-select"]')).toBeTruthy();
    expect(el.textContent).toContain('Черновик');
  });

  it('renders catalog vitrina segment + grid on «Товары»', () => {
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
