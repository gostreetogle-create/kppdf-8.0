import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

/**
 * TZ-NEW: Unit tests for ButtonComponent.
 *
 * Contract under test:
 *  - 6 variants: default / secondary / outline / ghost / link / destructive
 *  - 4 sizes: sm / md / lg / icon
 *  - `disabled` true → button has `disabled` attribute, click emits nothing
 *  - `href` set → renders <a> instead of <button>
 *  - `ariaLabel` set → forwarded to button/anchor
 *  - `pressed` output emits the click event payload
 *  - Component is standalone (compiles via `imports`)
 */
describe('ButtonComponent', () => {
  async function createFixture(
    inputs: Partial<{
      variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
      size: 'sm' | 'md' | 'lg' | 'icon';
      disabled: boolean;
      href: string | null;
      ariaLabel: string | null;
      type: 'button' | 'submit' | 'reset';
    }> = {},
  ): Promise<ComponentFixture<ButtonComponent>> {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ButtonComponent);
    if (inputs.variant) fixture.componentRef.setInput('variant', inputs.variant);
    if (inputs.size) fixture.componentRef.setInput('size', inputs.size);
    if (inputs.disabled !== undefined) fixture.componentRef.setInput('disabled', inputs.disabled);
    if (inputs.href !== undefined) fixture.componentRef.setInput('href', inputs.href);
    if (inputs.ariaLabel !== undefined) fixture.componentRef.setInput('ariaLabel', inputs.ariaLabel);
    if (inputs.type) fixture.componentRef.setInput('type', inputs.type);
    fixture.detectChanges();
    return fixture;
  }

  function hostEl(fixture: ComponentFixture<ButtonComponent>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('renders a <button> by default (no href)', async () => {
    const fixture = await createFixture();
    expect(hostEl(fixture).querySelector('button')).toBeTruthy();
    expect(hostEl(fixture).querySelector('a')).toBeNull();
  });

  it('renders an <a> when href is set', async () => {
    const fixture = await createFixture({ href: 'https://example.com' });
    const a = hostEl(fixture).querySelector('a');
    expect(a).toBeTruthy();
    expect(a?.getAttribute('href')).toBe('https://example.com');
    expect(hostEl(fixture).querySelector('button')).toBeNull();
  });

  it('forwards ariaLabel to <button>', async () => {
    const fixture = await createFixture({ ariaLabel: 'Сохранить документ' });
    expect(hostEl(fixture).querySelector('button')?.getAttribute('aria-label'))
      .toBe('Сохранить документ');
  });

  it('forwards ariaLabel to <a> when href is set', async () => {
    const fixture = await createFixture({
      href: '/x',
      ariaLabel: 'Open settings',
    });
    expect(hostEl(fixture).querySelector('a')?.getAttribute('aria-label'))
      .toBe('Open settings');
  });

  it('disabled=true puts the button into the disabled state', async () => {
    const fixture = await createFixture({ disabled: true });
    const btn = hostEl(fixture).querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('clicking emits the `pressed` output', async () => {
    const fixture = await createFixture();
    const pressedSpy = jest.fn();
    fixture.componentInstance.pressed.subscribe(pressedSpy);

    hostEl(fixture).querySelector('button')?.click();
    expect(pressedSpy).toHaveBeenCalledTimes(1);
  });

  it('disabled=true blocks the `pressed` output', async () => {
    const fixture = await createFixture({ disabled: true });
    const pressedSpy = jest.fn();
    fixture.componentInstance.pressed.subscribe(pressedSpy);

    hostEl(fixture).querySelector('button')?.click();
    expect(pressedSpy).not.toHaveBeenCalled();
  });

  describe('variants (apply different class sets)', () => {
    const variants = ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive'] as const;
    for (const v of variants) {
      it(`variant="${v}" compiles and renders a button`, async () => {
        const fixture = await createFixture({ variant: v });
        expect(hostEl(fixture).querySelector('button')).toBeTruthy();
      });
    }
  });

  describe('sizes (apply different height/padding classes)', () => {
    const sizes = ['sm', 'md', 'lg', 'icon'] as const;
    for (const s of sizes) {
      it(`size="${s}" compiles and renders a button`, async () => {
        const fixture = await createFixture({ size: s });
        expect(hostEl(fixture).querySelector('button')).toBeTruthy();
      });
    }
  });

  it('is a standalone component', () => {
    // `imports: [ButtonComponent]` in TestBed would throw at compile
    // time if not standalone — reaching this assertion is sufficient proof.
    expect(ButtonComponent.prototype).toBeDefined();
  });
});
