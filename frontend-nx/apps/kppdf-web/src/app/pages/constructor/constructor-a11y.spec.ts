import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConstructorPage } from './constructor.page';

describe('ConstructorPage a11y smoke (TZ-NX-CONSTRUCTOR-SHELL)', () => {
  let fixture: ComponentFixture<ConstructorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstructorPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ConstructorPage);
    fixture.detectChanges();
  });

  it('has a labelled workspace region and action list', () => {
    const section = fixture.nativeElement.querySelector(
      '[data-test="constructor-workspace"]',
    ) as HTMLElement;
    expect(section.getAttribute('aria-labelledby')).toBe('constructor-workspace-heading');

    const list = fixture.nativeElement.querySelector('[data-test="constructor-cta-grid"]') as HTMLElement;
    expect(list.getAttribute('role')).toBe('list');
    expect(list.getAttribute('aria-label')).toBe('Доступные действия создания');
  });

  it('uses visually hidden h2 for screen readers', () => {
    const heading = fixture.nativeElement.querySelector('#constructor-workspace-heading') as HTMLElement;
    expect(heading.tagName).toBe('H2');
    expect(heading.classList.contains('sr-only')).toBe(true);
  });
});
