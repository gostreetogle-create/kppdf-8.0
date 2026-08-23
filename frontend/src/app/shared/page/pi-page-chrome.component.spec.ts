import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PiPageChromeComponent } from './pi-page-chrome.component';

describe('PiPageChromeComponent (TZ-UI-DEN-511)', () => {
  let fixture: ComponentFixture<PiPageChromeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiPageChromeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PiPageChromeComponent);
  });

  it('uses compact chrome block with edge-bleed padding and hairline', () => {
    fixture.componentRef.setInput('crumbs', [
      { label: 'Каталог', link: '/products' },
      { label: 'Модули' },
    ]);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('[data-test="page-chrome"]') as HTMLElement;
    expect(header.classList.contains('pi-edge-bleed')).toBe(true);
    expect(header.classList.contains('py-2')).toBe(true);
    expect(header.classList.contains('hairline-b')).toBe(true);
  });

  it('renders breadcrumbs at meta scale (text-xs, not text-sm)', () => {
    fixture.componentRef.setInput('crumbs', [
      { label: 'Документы', link: '/templates' },
      { label: 'Шаблоны' },
    ]);
    fixture.detectChanges();

    const crumbs = fixture.nativeElement.querySelector('[data-test="page-crumbs"]') as HTMLElement;
    expect(crumbs.classList.contains('text-xs')).toBe(true);
    expect(crumbs.classList.contains('text-sm')).toBe(false);
  });

  it('caps H1 at text-lg (no text-xl/2xl)', () => {
    fixture.componentRef.setInput('title', 'Контрагент');
    fixture.detectChanges();

    const h1 = fixture.nativeElement.querySelector(
      '[data-test="page-chrome-title"]',
    ) as HTMLElement;
    expect(h1.classList.contains('text-lg')).toBe(true);
    expect(h1.classList.contains('text-xl')).toBe(false);
    expect(h1.classList.contains('text-2xl')).toBe(false);

    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'pi-page-chrome.component.ts'),
      'utf8',
    );
    expect(source).not.toMatch(/text-(xl|2xl|3xl|4xl|5xl)/);
  });

  it('renders description at text-xs meta scale', () => {
    fixture.componentRef.setInput('title', 'Заказ');
    fixture.componentRef.setInput('description', 'Краткое описание');
    fixture.detectChanges();

    const desc = fixture.nativeElement.querySelector('p.text-xs') as HTMLElement | null;
    expect(desc?.textContent?.trim()).toBe('Краткое описание');
  });
});
