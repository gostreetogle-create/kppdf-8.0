import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CONSTRUCTOR_ROUTES } from './constructor.routes';

describe('CONSTRUCTOR_ROUTES (TZ-NX-CONSTRUCTOR-SHELL)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'constructor',
            children: CONSTRUCTOR_ROUTES,
          },
        ]),
      ],
    }).compileComponents();
  });

  it('resolves /constructor to the workspace page', async () => {
    const harness = await RouterTestingHarness.create('/constructor');
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.querySelector('[data-test="constructor-workspace"]')).toBeTruthy();
  });

  it('resolves /constructor/create/:kind to the placeholder page', async () => {
    const harness = await RouterTestingHarness.create('/constructor/create/product');
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(
      harness.routeNativeElement?.querySelector('[data-test="constructor-create-placeholder"]'),
    ).toBeTruthy();
  });

  it('does not shadow /registries or /kit routes', () => {
    const router = TestBed.inject(Router);
    const paths = router.config.flatMap((r) => (r.path ? [r.path] : []));
    expect(paths).toContain('constructor');
    expect(paths.filter((p) => p === 'registries').length).toBe(0);
    expect(paths.filter((p) => p === 'kit').length).toBe(0);
  });
});
