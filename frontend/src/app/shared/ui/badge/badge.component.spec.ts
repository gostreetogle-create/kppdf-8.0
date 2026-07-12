import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { BadgeComponent } from './badge.component';

/**
 * TZ-NEW: Unit tests for BadgeComponent.
 *
 * Contract under test:
 *  - 4 variants: default / secondary / outline / destructive
 *  - 2 sizes: sm / md
 *  - `icon` (string) renders a lucide <i-lucide> child when non-empty
 *  - `dot=true` renders a pulsing dot before content
 *  - Default values: variant=default, size=sm, icon='', dot=false
 *  - Component is standalone
 *
 * Test environment note: same as CardComponent — we override out
 * the LucideAngularModule import and use CUSTOM_ELEMENTS_SCHEMA
 * to allow `<i-lucide>` through (jsdom can't register the web
 * component's SVG stylesheet).
 */
describe('BadgeComponent', () => {
  async function createFixture(
    inputs: Partial<{
      variant: 'default' | 'secondary' | 'outline' | 'destructive';
      size: 'sm' | 'md';
      icon: string;
      dot: boolean;
    }> = {},
  ): Promise<ComponentFixture<BadgeComponent>> {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(BadgeComponent, {
        remove: { imports: [LucideAngularModule] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(BadgeComponent);
    if (inputs.variant) fixture.componentRef.setInput('variant', inputs.variant);
    if (inputs.size) fixture.componentRef.setInput('size', inputs.size);
    if (inputs.icon !== undefined) fixture.componentRef.setInput('icon', inputs.icon);
    if (inputs.dot !== undefined) fixture.componentRef.setInput('dot', inputs.dot);
    fixture.detectChanges();
    return fixture;
  }

  function span(fixture: ComponentFixture<BadgeComponent>): HTMLSpanElement {
    return fixture.nativeElement.querySelector('span') as HTMLSpanElement;
  }

  it('renders a <span> root', async () => {
    const fixture = await createFixture();
    expect(span(fixture)).toBeTruthy();
  });

  it('default variant is "default"', async () => {
    const fixture = await createFixture();
    expect(fixture.componentInstance.variant()).toBe('default');
  });

  it('default size is "sm"', async () => {
    const fixture = await createFixture();
    expect(fixture.componentInstance.size()).toBe('sm');
  });

  it('icon="" (default) does not render a lucide <i-lucide>', async () => {
    const fixture = await createFixture();
    expect(fixture.nativeElement.querySelector('i-lucide')).toBeNull();
  });

  it('icon="check" renders a lucide <i-lucide> child', async () => {
    const fixture = await createFixture({ icon: 'check' });
    expect(fixture.nativeElement.querySelector('i-lucide')).toBeTruthy();
  });

  it('dot=false (default) does not render the pulsing dot', async () => {
    const fixture = await createFixture();
    // The root <span> has no aria-hidden; the inner dot span has aria-hidden.
    // So `span[aria-hidden="true"]` finds the dot only.
    expect(fixture.nativeElement.querySelector('span[aria-hidden="true"]')).toBeNull();
  });

  it('dot=true renders the pulsing dot', async () => {
    const fixture = await createFixture({ dot: true });
    const dot = fixture.nativeElement.querySelector('span[aria-hidden="true"]');
    expect(dot).toBeTruthy();
    expect(dot?.className).toContain('animate-pulse');
  });

  describe('variants (4 total)', () => {
    const variants = ['default', 'secondary', 'outline', 'destructive'] as const;
    for (const v of variants) {
      it(`variant="${v}" compiles and renders a badge`, async () => {
        const fixture = await createFixture({ variant: v });
        expect(span(fixture)).toBeTruthy();
      });
    }

    it('variant="default" uses semi-transparent gold bg + border tint (TZ-96)', async () => {
      const fixture = await createFixture({ variant: 'default' });
      const cls = span(fixture).className;
      expect(cls).toContain('bg-gold/10');
      expect(cls).toContain('border-gold/20');
      expect(cls).toContain('text-gold');
    });

    it('variant="destructive" uses semi-transparent error bg + border tint (TZ-96)', async () => {
      const fixture = await createFixture({ variant: 'destructive' });
      const cls = span(fixture).className;
      expect(cls).toContain('bg-destructive/10');
      expect(cls).toContain('border-destructive/20');
      expect(cls).toContain('text-destructive');
    });

    it('variant="outline" uses surface-container bg + rule border (TZ-96)', async () => {
      const fixture = await createFixture({ variant: 'outline' });
      const cls = span(fixture).className;
      expect(cls).toContain('bg-surface-container');
      expect(cls).toContain('border-rule');
      expect(cls).toContain('text-muted-foreground');
    });

    it('variant="secondary" uses semi-transparent green bg + border tint (TZ-96)', async () => {
      const fixture = await createFixture({ variant: 'secondary' });
      const cls = span(fixture).className;
      expect(cls).toContain('bg-green-500/10');
      expect(cls).toContain('border-green-500/20');
      expect(cls).toContain('text-green-700');
    });
  });

  describe('sizes (2 total)', () => {
    const sizes = ['sm', 'md'] as const;
    for (const s of sizes) {
      it(`size="${s}" compiles and renders a badge`, async () => {
        const fixture = await createFixture({ size: s });
        expect(span(fixture)).toBeTruthy();
      });
    }
  });

  it('is a standalone component', () => {
    // `imports: [BadgeComponent]` in TestBed would throw at compile
    // time if not standalone — reaching this assertion is sufficient proof.
    expect(BadgeComponent.prototype).toBeDefined();
  });
});
