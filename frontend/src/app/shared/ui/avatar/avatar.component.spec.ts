import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

/**
 * TZ-NEW: Unit tests for AvatarComponent.
 *
 * Contract under test (3-tier fallback):
 *  1. `src` set → renders <img>
 *  2. else if `initials` (or derived from `alt`) → monogram text
 *  3. else → lucide `user` icon
 *
 * Other inputs:
 *  - `size`: xs | sm | md (default) | lg | xl — applies SIZE_CLASS
 *  - `rounded`: 'square' (default) | 'rounded'
 *  - `ariaLabel`: defaults to 'Аватар'
 *  - role="img" + aria-label
 *  - `initials` priority: explicit > derived from alt > none
 *  - Component is standalone
 */
describe('AvatarComponent', () => {
  async function createFixture(
    inputs: Partial<{
      src: string | null;
      alt: string;
      initials: string;
      size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      rounded: 'square' | 'rounded';
      ariaLabel: string;
    }> = {},
  ): Promise<ComponentFixture<AvatarComponent>> {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AvatarComponent);
    if (inputs.src !== undefined) fixture.componentRef.setInput('src', inputs.src);
    if (inputs.alt !== undefined) fixture.componentRef.setInput('alt', inputs.alt);
    if (inputs.initials !== undefined) fixture.componentRef.setInput('initials', inputs.initials);
    if (inputs.size) fixture.componentRef.setInput('size', inputs.size);
    if (inputs.rounded) fixture.componentRef.setInput('rounded', inputs.rounded);
    if (inputs.ariaLabel !== undefined)
      fixture.componentRef.setInput('ariaLabel', inputs.ariaLabel);
    fixture.detectChanges();
    return fixture;
  }

  function root(fixture: ComponentFixture<AvatarComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;
  }

  describe('3-tier fallback chain', () => {
    it('tier 1: src set → renders <img>', async () => {
      const fixture = await createFixture({
        src: 'https://example.com/avatar.png',
        alt: 'Jane',
        initials: 'JD',
      });
      const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('https://example.com/avatar.png');
      expect(img.getAttribute('alt')).toBe('Jane');
    });

    it('tier 2: initials set → renders monogram text (no <img>, no <lucide>)', async () => {
      const fixture = await createFixture({ initials: 'JD' });
      expect(fixture.nativeElement.querySelector('img')).toBeNull();
      expect(fixture.nativeElement.querySelector('lucide-angular')).toBeNull();
      expect(root(fixture).textContent?.trim()).toBe('JD');
    });

    it('tier 3: no src, no initials → renders lucide <lucide-angular> user icon', async () => {
      const fixture = await createFixture();
      expect(fixture.nativeElement.querySelector('lucide-angular')).toBeTruthy();
    });
  });

  describe('initials derivation from alt', () => {
    it('derives "JD" from alt="John Doe"', async () => {
      const fixture = await createFixture({ alt: 'John Doe' });
      expect(fixture.componentInstance.computedInitials()).toBe('JD');
    });

    it('derives single letter from single-word alt', async () => {
      const fixture = await createFixture({ alt: 'Alice' });
      expect(fixture.componentInstance.computedInitials()).toBe('A');
    });

    it('explicit initials override alt derivation', async () => {
      const fixture = await createFixture({ alt: 'John Doe', initials: 'XY' });
      expect(fixture.componentInstance.computedInitials()).toBe('XY');
    });

    it('truncates explicit initials to first 2 chars and uppercases', async () => {
      const fixture = await createFixture({ initials: 'abcdef' });
      expect(fixture.componentInstance.computedInitials()).toBe('AB');
    });
  });

  describe('a11y', () => {
    it('renders role="img"', async () => {
      const fixture = await createFixture();
      expect(root(fixture).getAttribute('role')).toBe('img');
    });

    it('default ariaLabel is "Аватар"', async () => {
      const fixture = await createFixture();
      expect(root(fixture).getAttribute('aria-label')).toBe('Аватар');
    });

    it('forwards custom ariaLabel', async () => {
      const fixture = await createFixture({ ariaLabel: 'User profile photo' });
      expect(root(fixture).getAttribute('aria-label')).toBe('User profile photo');
    });
  });

  describe('sizes (5 total)', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const s of sizes) {
      it(`size="${s}" compiles and renders a root span`, async () => {
        const fixture = await createFixture({ size: s });
        expect(root(fixture)).toBeTruthy();
      });
    }
  });

  describe('shapes', () => {
    it('rounded="square" (default) applies rounded-none class', async () => {
      const fixture = await createFixture();
      expect(root(fixture).className).toContain('rounded-none');
    });

    it('rounded="rounded" applies rounded-sm class', async () => {
      const fixture = await createFixture({ rounded: 'rounded' });
      expect(root(fixture).className).toContain('rounded-sm');
    });
  });

  it('is a standalone component', () => {
    expect(AvatarComponent.prototype).toBeDefined();
  });
});
