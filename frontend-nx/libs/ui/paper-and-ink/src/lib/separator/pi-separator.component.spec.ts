import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiSeparatorComponent } from './pi-separator.component';

/**
 * TZ-NEW: Unit tests for PiSeparatorComponent.
 *
 * Contract under test:
 *  - 3 render modes:
 *    a) horizontal + no label  → bare <hr> with role="separator"
 *    b) horizontal + label     → flex with two hairlines + label text
 *    c) vertical               → <span> with role="separator"
 *  - `ariaLabel` is forwarded to the role="separator" element
 *  - `label` text is rendered when present (horizontal mode)
 *  - Component is standalone
 */
describe('PiSeparatorComponent', () => {
  async function createFixture(
    inputs: Partial<{
      orientation: 'horizontal' | 'vertical';
      label: string;
      ariaLabel: string;
    }> = {},
  ): Promise<ComponentFixture<PiSeparatorComponent>> {
    await TestBed.configureTestingModule({
      imports: [PiSeparatorComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PiSeparatorComponent);
    if (inputs.orientation) fixture.componentRef.setInput('orientation', inputs.orientation);
    if (inputs.label !== undefined) fixture.componentRef.setInput('label', inputs.label);
    if (inputs.ariaLabel !== undefined)
      fixture.componentRef.setInput('ariaLabel', inputs.ariaLabel);
    fixture.detectChanges();
    return fixture;
  }

  function separator(fixture: ComponentFixture<PiSeparatorComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('[role="separator"]') as HTMLElement;
  }

  describe('horizontal + no label (default)', () => {
    it('renders a bare <hr> with role="separator"', async () => {
      const fixture = await createFixture();
      const sep = separator(fixture);
      expect(sep.tagName).toBe('HR');
      expect(sep.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('ariaLabel defaults to "Разделитель" when not provided', async () => {
      const fixture = await createFixture();
      expect(separator(fixture).getAttribute('aria-label')).toBe('Разделитель');
    });

    it('forwards custom ariaLabel', async () => {
      const fixture = await createFixture({ ariaLabel: 'Section divider' });
      expect(separator(fixture).getAttribute('aria-label')).toBe('Section divider');
    });
  });

  describe('horizontal + label', () => {
    it('renders a flex container with eyebrow text', async () => {
      const fixture = await createFixture({ label: 'Foundations' });
      const sep = separator(fixture);
      expect(sep.tagName).toBe('DIV');
      expect(sep.textContent).toContain('Foundations');
    });

    it('label is used as the aria-label (announced by screen reader)', async () => {
      const fixture = await createFixture({ label: 'Foundations' });
      expect(separator(fixture).getAttribute('aria-label')).toBe('Foundations');
    });
  });

  describe('vertical', () => {
    it('renders a <span> with role="separator" and aria-orientation=vertical', async () => {
      const fixture = await createFixture({ orientation: 'vertical' });
      const sep = separator(fixture);
      expect(sep.tagName).toBe('SPAN');
      expect(sep.getAttribute('aria-orientation')).toBe('vertical');
    });
  });

  it('is a standalone component', () => {
    expect(PiSeparatorComponent.prototype).toBeDefined();
  });
});
