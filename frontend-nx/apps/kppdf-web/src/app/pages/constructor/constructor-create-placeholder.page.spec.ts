import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { ConstructorCreatePlaceholderPage } from './constructor-create-placeholder.page';
import { ConstructorPage } from './constructor.page';
import { CONSTRUCTOR_CREATE_KINDS } from './constructor.types';

describe('ConstructorCreatePlaceholderPage (TZ-NX-CONSTRUCTOR-SHELL)', () => {
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

  it('shows honest placeholder state for a known kind', () => {
    setKind('module');
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="constructor-create-placeholder"]')).toBeTruthy();
    expect(root.querySelector('[data-test="constructor-placeholder-banner"]')?.textContent).toContain(
      'готовится',
    );
    expect(root.querySelector('[data-test="constructor-placeholder-copy"]')?.textContent).toContain(
      'Создать модуль',
    );
  });

  it('explains part = Material kind part and product/complex semantics', () => {
    setKind('part');
    expect(fixture.nativeElement.textContent).toContain('materialKind = part');

    setKind('product');
    expect(fixture.nativeElement.textContent).toContain('Complex');
    expect(fixture.nativeElement.textContent).toContain('create-kind');
  });

  it('shows unknown-kind alert for invalid route param', () => {
    setKind('complex');
    expect(fixture.nativeElement.querySelector('[data-test="constructor-unknown-kind"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="constructor-create-placeholder"]')).toBeTruthy();
  });

  it('does not list Complex among create kind labels', () => {
    const labels = (
      fixture.componentInstance as unknown as { allCreateKindLabels: string[] }
    ).allCreateKindLabels;
    expect(labels.length).toBe(4);
    expect(labels.join(' ')).not.toMatch(/комплекс/i);
    expect(CONSTRUCTOR_CREATE_KINDS.some((k) => k.kind === 'complex' as never)).toBe(false);
  });

  it('navigates to /constructor when back button is clicked', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'constructor', component: ConstructorPage },
          { path: 'constructor/create/:kind', component: ConstructorCreatePlaceholderPage },
        ]),
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create('/constructor/create/material');
    harness.detectChanges();
    await harness.fixture.whenStable();

    const back = harness.routeNativeElement?.querySelector(
      '[data-test="constructor-placeholder-back"] button',
    ) as HTMLButtonElement;
    expect(back).toBeTruthy();
    back.click();
    harness.detectChanges();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/constructor');
  });
});
