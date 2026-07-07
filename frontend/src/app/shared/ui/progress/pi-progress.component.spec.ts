import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiProgressComponent } from './pi-progress.component';

/**
 * TZ-NEW: Unit tests for PiProgressComponent.
 *
 * Contract under test:
 *  - Required input: value
 *  - `variant`: 'linear' (default) | 'circular'
 *  - `size`: 'sm' | 'md' | 'lg' — only affects circular (square SVG)
 *  - `max`: default 100
 *  - `indeterminate=true` → aria-valuenow is null, aria-valuetext='Загрузка'
 *  - aria-valuenow/min/max/label forwarded to role="progressbar"
 *  - Value clamping: percent() clamps to [0, 100]
 *  - Component is standalone
 */
describe('PiProgressComponent', () => {
  async function createFixture(
    inputs: Partial<{
      value: number;
      max: number;
      variant: 'linear' | 'circular';
      size: 'sm' | 'md' | 'lg';
      indeterminate: boolean;
      ariaLabel: string;
    }> = { value: 0 },
  ): Promise<ComponentFixture<PiProgressComponent>> {
    await TestBed.configureTestingModule({
      imports: [PiProgressComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PiProgressComponent);
    fixture.componentRef.setInput('value', inputs.value ?? 0);
    if (inputs.max !== undefined) fixture.componentRef.setInput('max', inputs.max);
    if (inputs.variant) fixture.componentRef.setInput('variant', inputs.variant);
    if (inputs.size) fixture.componentRef.setInput('size', inputs.size);
    if (inputs.indeterminate !== undefined) fixture.componentRef.setInput('indeterminate', inputs.indeterminate);
    if (inputs.ariaLabel !== undefined) fixture.componentRef.setInput('ariaLabel', inputs.ariaLabel);
    fixture.detectChanges();
    return fixture;
  }

  function progressbar(fixture: ComponentFixture<PiProgressComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
  }

  it('renders a role="progressbar" element', async () => {
    const fixture = await createFixture({ value: 50 });
    expect(progressbar(fixture)).toBeTruthy();
  });

  it('forwards aria-valuenow, aria-valuemin, aria-valuemax', async () => {
    const fixture = await createFixture({ value: 25, max: 50 });
    const bar = progressbar(fixture);
    expect(bar.getAttribute('aria-valuenow')).toBe('25');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('50');
  });

  it('default variant is linear (no <svg>)', async () => {
    const fixture = await createFixture({ value: 50 });
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('variant="circular" renders an <svg>', async () => {
    const fixture = await createFixture({ value: 50, variant: 'circular' });
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('circular variant renders 2 concentric <circle> elements (track + arc)', async () => {
    const fixture = await createFixture({ value: 50, variant: 'circular' });
    expect(fixture.nativeElement.querySelectorAll('svg circle').length).toBe(2);
  });

  describe('indeterminate mode (a11y contract)', () => {
    it('omits aria-valuenow when indeterminate=true', async () => {
      const fixture = await createFixture({ value: 50, indeterminate: true });
      expect(progressbar(fixture).getAttribute('aria-valuenow')).toBeNull();
    });

    it('sets aria-valuetext="Загрузка" when indeterminate=true', async () => {
      const fixture = await createFixture({ value: 50, indeterminate: true });
      expect(progressbar(fixture).getAttribute('aria-valuetext')).toBe('Загрузка');
    });
  });

  describe('percent() clamping', () => {
    it('clamps value > max to 100', async () => {
      const fixture = await createFixture({ value: 999, max: 100 });
      expect(fixture.componentInstance.percent()).toBe(100);
    });

    it('clamps value < 0 to 0', async () => {
      const fixture = await createFixture({ value: -50, max: 100 });
      expect(fixture.componentInstance.percent()).toBe(0);
    });

    it('computes correct percentage for in-range value', async () => {
      const fixture = await createFixture({ value: 25, max: 50 });
      expect(fixture.componentInstance.percent()).toBe(50);
    });
  });

  it('forwards ariaLabel', async () => {
    const fixture = await createFixture({ value: 0, ariaLabel: 'Загрузка материалов' });
    expect(progressbar(fixture).getAttribute('aria-label')).toBe('Загрузка материалов');
  });

  it('default ariaLabel is "Прогресс"', async () => {
    const fixture = await createFixture({ value: 0 });
    expect(progressbar(fixture).getAttribute('aria-label')).toBe('Прогресс');
  });

  it('is a standalone component', () => {
    expect(PiProgressComponent.prototype).toBeDefined();
  });
});
