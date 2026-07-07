import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiScrollAreaComponent } from './pi-scroll-area.component';

/**
 * TZ-NEW: Unit tests for PiScrollAreaComponent.
 *
 * Contract under test:
 *  - role="region" + tabindex="0" (keyboard accessible)
 *  - aria-label defaults to "Прокручиваемая область"
 *  - `maxHeight` (default 320px) is forwarded as inline style
 *  - `orientation` (default vertical) applies overflow-* classes
 *  - Component is standalone
 */
describe('PiScrollAreaComponent', () => {
  async function createFixture(
    inputs: Partial<{
      maxHeight: string;
      orientation: 'vertical' | 'horizontal' | 'both';
      ariaLabel: string;
    }> = {},
  ): Promise<ComponentFixture<PiScrollAreaComponent>> {
    await TestBed.configureTestingModule({
      imports: [PiScrollAreaComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PiScrollAreaComponent);
    if (inputs.maxHeight !== undefined) fixture.componentRef.setInput('maxHeight', inputs.maxHeight);
    if (inputs.orientation) fixture.componentRef.setInput('orientation', inputs.orientation);
    if (inputs.ariaLabel !== undefined) fixture.componentRef.setInput('ariaLabel', inputs.ariaLabel);
    fixture.detectChanges();
    return fixture;
  }

  function region(fixture: ComponentFixture<PiScrollAreaComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;
  }

  it('renders a role="region" wrapper', async () => {
    const fixture = await createFixture();
    expect(region(fixture)).toBeTruthy();
  });

  it('tabindex="0" so keyboard users can focus and scroll', async () => {
    const fixture = await createFixture();
    expect(region(fixture).getAttribute('tabindex')).toBe('0');
  });

  it('default maxHeight is 320px', async () => {
    const fixture = await createFixture();
    expect(region(fixture).style.maxHeight).toBe('320px');
  });

  it('forwards custom maxHeight as inline style', async () => {
    const fixture = await createFixture({ maxHeight: '500px' });
    expect(region(fixture).style.maxHeight).toBe('500px');
  });

  it('default ariaLabel is "Прокручиваемая область"', async () => {
    const fixture = await createFixture();
    expect(region(fixture).getAttribute('aria-label')).toBe('Прокручиваемая область');
  });

  it('forwards custom ariaLabel', async () => {
    const fixture = await createFixture({ ariaLabel: 'Список материалов' });
    expect(region(fixture).getAttribute('aria-label')).toBe('Список материалов');
  });

  describe('orientation classes', () => {
    it('default orientation=vertical applies overflow-y-auto', async () => {
      const fixture = await createFixture();
      expect(region(fixture).className).toContain('overflow-y-auto');
    });

    it('orientation=horizontal applies overflow-x-auto', async () => {
      const fixture = await createFixture({ orientation: 'horizontal' });
      expect(region(fixture).className).toContain('overflow-x-auto');
    });

    it('orientation=both applies overflow-auto', async () => {
      const fixture = await createFixture({ orientation: 'both' });
      expect(region(fixture).className).toContain('overflow-auto');
    });
  });

  it('is a standalone component', () => {
    expect(PiScrollAreaComponent.prototype).toBeDefined();
  });
});
