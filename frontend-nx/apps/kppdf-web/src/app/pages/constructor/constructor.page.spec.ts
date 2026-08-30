import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConstructorPage } from './constructor.page';
import { CONSTRUCTOR_CREATE_KINDS } from './constructor.types';

describe('ConstructorPage (TZ-NX-CONSTRUCTOR-SHELL)', () => {
  let fixture: ComponentFixture<ConstructorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstructorPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ConstructorPage);
    fixture.detectChanges();
  });

  it('renders the workspace with heading chrome and domain note', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="constructor-workspace"]')).toBeTruthy();
    expect(root.querySelector('[data-test="page-crumbs"]')?.textContent).toContain('Конструктор');
    expect(root.querySelector('[data-test="constructor-domain-note"]')?.textContent).toContain('part');
    expect(root.querySelector('[data-test="constructor-domain-note"]')?.textContent).toContain('Комплекс');
  });

  it('renders four create CTAs and no Complex kind', () => {
    const grid = fixture.nativeElement.querySelector('[data-test="constructor-cta-grid"]') as HTMLElement;
    const ctas = grid.querySelectorAll('[data-test^="constructor-cta-"]');
    expect(ctas.length).toBe(4);
    expect(CONSTRUCTOR_CREATE_KINDS.map((k) => k.kind)).toEqual(['material', 'part', 'module', 'product']);

    const labels = Array.from(ctas).map((el) => el.getAttribute('aria-label'));
    expect(labels).toEqual(CONSTRUCTOR_CREATE_KINDS.map((k) => k.label));
    expect(labels.join(' ')).not.toMatch(/комплекс/i);
  });

  it('links each CTA to a typed placeholder route', () => {
    for (const entry of CONSTRUCTOR_CREATE_KINDS) {
      const link = fixture.nativeElement.querySelector(
        `[data-test="${entry.testId}"]`,
      ) as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe(`/constructor/create/${entry.kind}`);
    }
  });

  it('exposes keyboard-focusable CTA links with aria-label', () => {
    const link = fixture.nativeElement.querySelector(
      '[data-test="constructor-cta-material"]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute('aria-label')).toBe('Создать материал');
    expect(link.tabIndex).not.toBe(-1);
  });
});
