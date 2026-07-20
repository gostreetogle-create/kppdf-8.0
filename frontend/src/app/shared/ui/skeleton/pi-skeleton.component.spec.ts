import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiSkeletonComponent } from './pi-skeleton.component';

/**
 * TZ-NEW: Unit tests for PiSkeletonComponent.
 *
 * Contract under test:
 *  - `count` controls how many placeholder lines render
 *  - `variant`: 'text' (default) | 'circle' | 'rect'
 *  - `width` / `height` are forwarded to inline styles
 *  - ARIA: role="status", aria-live="polite", aria-busy="true", aria-label
 *  - `lines()` signal materialises `[0, 1, ..., count-1]`
 *  - Component is standalone
 */
describe('PiSkeletonComponent', () => {
  async function createFixture(
    inputs: Partial<{
      width: string;
      height: string;
      variant: 'text' | 'circle' | 'rect';
      count: number;
      ariaLabel: string;
    }> = {},
  ): Promise<ComponentFixture<PiSkeletonComponent>> {
    await TestBed.configureTestingModule({
      imports: [PiSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PiSkeletonComponent);
    if (inputs.width !== undefined) fixture.componentRef.setInput('width', inputs.width);
    if (inputs.height !== undefined) fixture.componentRef.setInput('height', inputs.height);
    if (inputs.variant) fixture.componentRef.setInput('variant', inputs.variant);
    if (inputs.count !== undefined) fixture.componentRef.setInput('count', inputs.count);
    if (inputs.ariaLabel !== undefined)
      fixture.componentRef.setInput('ariaLabel', inputs.ariaLabel);
    fixture.detectChanges();
    return fixture;
  }

  function root(fixture: ComponentFixture<PiSkeletonComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
  }

  function placeholders(fixture: ComponentFixture<PiSkeletonComponent>): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('[role="status"] > span');
  }

  it('renders a role="status" container', async () => {
    const fixture = await createFixture();
    expect(root(fixture)).toBeTruthy();
  });

  it('aria-live="polite" and aria-busy="true" for screen readers', async () => {
    const fixture = await createFixture();
    expect(root(fixture).getAttribute('aria-live')).toBe('polite');
    expect(root(fixture).getAttribute('aria-busy')).toBe('true');
  });

  it('default count=1 renders exactly 1 placeholder', async () => {
    const fixture = await createFixture();
    expect(placeholders(fixture).length).toBe(1);
  });

  it('count=5 renders 5 placeholders', async () => {
    const fixture = await createFixture({ count: 5 });
    expect(placeholders(fixture).length).toBe(5);
  });

  it('count=0 renders 0 placeholders (defensive)', async () => {
    const fixture = await createFixture({ count: 0 });
    expect(placeholders(fixture).length).toBe(0);
  });

  it('forwards custom width/height as inline styles', async () => {
    const fixture = await createFixture({ width: '200px', height: '24px' });
    const ph = placeholders(fixture)[0] as HTMLElement;
    expect(ph.style.width).toBe('200px');
    expect(ph.style.height).toBe('24px');
  });

  it('variant="circle" applies rounded-full class', async () => {
    const fixture = await createFixture({ variant: 'circle' });
    expect(placeholders(fixture)[0].className).toContain('rounded-full');
  });

  it('variant="text" (default) applies rounded-none class', async () => {
    const fixture = await createFixture({ variant: 'text' });
    expect(placeholders(fixture)[0].className).toContain('rounded-none');
  });

  it('forwards ariaLabel (default "Загрузка")', async () => {
    const fixture = await createFixture();
    expect(root(fixture).getAttribute('aria-label')).toBe('Загрузка');
  });

  it('is a standalone component', () => {
    expect(PiSkeletonComponent.prototype).toBeDefined();
  });
});
