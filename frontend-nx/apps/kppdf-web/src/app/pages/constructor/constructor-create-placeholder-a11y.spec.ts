import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ConstructorCreatePlaceholderPage } from './constructor-create-placeholder.page';

describe('ConstructorCreatePlaceholderPage a11y (TZ-NX-CONSTRUCTOR-PLACEHOLDER-FIX)', () => {
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let fixture: ComponentFixture<ConstructorCreatePlaceholderPage>;

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ kind: 'material' }));

    await TestBed.configureTestingModule({
      imports: [ConstructorCreatePlaceholderPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$,
            snapshot: {
              get paramMap() {
                return paramMap$.value;
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConstructorCreatePlaceholderPage);
    fixture.detectChanges();
  });

  function setKind(kind: string | null): void {
    paramMap$.next(convertToParamMap(kind ? { kind } : {}));
    fixture.detectChanges();
  }

  function section(): HTMLElement {
    return fixture.nativeElement.querySelector(
      '[data-test="constructor-create-placeholder"]',
    ) as HTMLElement;
  }

  it('known kind: aria-labelledby references the visible heading', () => {
    setKind('module');
    expect(section().getAttribute('aria-labelledby')).toBe('constructor-placeholder-heading');

    const heading = fixture.nativeElement.querySelector(
      '#constructor-placeholder-heading',
    ) as HTMLElement;
    expect(heading).toBeTruthy();
    expect(heading.tagName).toBe('H2');
    expect(heading.textContent).toContain('Создать модуль');
  });

  it('unknown kind: aria-labelledby references the sr-only heading, not the missing known heading', () => {
    setKind('complex');
    expect(section().getAttribute('aria-labelledby')).toBe('constructor-unknown-kind-heading');
    expect(fixture.nativeElement.querySelector('#constructor-placeholder-heading')).toBeNull();

    const heading = fixture.nativeElement.querySelector(
      '#constructor-unknown-kind-heading',
    ) as HTMLElement;
    expect(heading).toBeTruthy();
    expect(heading.tagName).toBe('H2');
    expect(heading.classList.contains('sr-only')).toBe(true);
  });
});
