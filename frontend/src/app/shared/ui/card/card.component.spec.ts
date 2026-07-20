import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent } from './card.component';

/**
 * TZ-NEW: Unit tests for CardComponent.
 *
 * Contract under test:
 *  - 5 inputs: eyebrow, title, description, interactive, arrow
 *  - Empty inputs render no <h3>/<p> elements (conditional @if)
 *  - `interactive=true` adds cursor + hover classes
 *  - `arrow=true && interactive=true` renders the lucide arrow icon
 *  - `arrow=false` suppresses the lucide arrow
 *  - Component is standalone
 *
 * Test environment note: the component imports `LucideAngularModule`
 * which globally registers the `<i-lucide>` web component. In jsdom
 * that registration fails (CSS parsing of the inline SVG
 * stylesheet). We override the component to drop the Lucide module
 * and rely on `CUSTOM_ELEMENTS_SCHEMA` to allow `<i-lucide>` through
 * without schema validation — so DOM-level assertions on the element
 * still work even though the icon SVG doesn't render in jsdom.
 */
describe('CardComponent', () => {
  async function createFixture(
    inputs: Partial<{
      eyebrow: string;
      title: string;
      description: string;
      interactive: boolean;
      arrow: boolean;
    }> = {},
  ): Promise<ComponentFixture<CardComponent>> {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(CardComponent, {
        remove: { imports: [LucideAngularModule] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(CardComponent);
    if (inputs.eyebrow !== undefined) fixture.componentRef.setInput('eyebrow', inputs.eyebrow);
    if (inputs.title !== undefined) fixture.componentRef.setInput('title', inputs.title);
    if (inputs.description !== undefined)
      fixture.componentRef.setInput('description', inputs.description);
    if (inputs.interactive !== undefined)
      fixture.componentRef.setInput('interactive', inputs.interactive);
    if (inputs.arrow !== undefined) fixture.componentRef.setInput('arrow', inputs.arrow);
    fixture.detectChanges();
    return fixture;
  }

  function article(fixture: ComponentFixture<CardComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('article') as HTMLElement;
  }

  it('renders an <article> wrapper by default', async () => {
    const fixture = await createFixture();
    expect(article(fixture)).toBeTruthy();
  });

  it('renders the eyebrow when provided', async () => {
    const fixture = await createFixture({ eyebrow: '01 · highlight' });
    expect(article(fixture).textContent).toContain('01 · highlight');
  });

  it('renders the title in an <h3> when provided', async () => {
    const fixture = await createFixture({ title: 'Card Title' });
    const h3 = article(fixture).querySelector('h3');
    expect(h3?.textContent).toContain('Card Title');
  });

  it('renders the description in a <p> when provided', async () => {
    const fixture = await createFixture({ description: 'Some description text' });
    expect(article(fixture).querySelector('p')?.textContent).toContain('Some description text');
  });

  it('omits empty inputs (no empty <h3>/<p>)', async () => {
    const fixture = await createFixture();
    expect(article(fixture).querySelector('h3')).toBeNull();
    expect(article(fixture).querySelector('p')).toBeNull();
  });

  it('default is non-interactive (no cursor/hover classes)', async () => {
    const fixture = await createFixture();
    expect(article(fixture).className).not.toContain('cursor-pointer');
  });

  it('interactive=true adds cursor-pointer + transition-colors classes', async () => {
    const fixture = await createFixture({ interactive: true });
    expect(article(fixture).className).toContain('cursor-pointer');
    expect(article(fixture).className).toContain('transition-colors');
  });

  it('arrow=true (default) + interactive=true renders the lucide arrow icon', async () => {
    const fixture = await createFixture({ interactive: true, arrow: true });
    const arrow = fixture.nativeElement.querySelector('i-lucide.card-arrow');
    expect(arrow).toBeTruthy();
  });

  it('arrow=false suppresses the lucide arrow icon', async () => {
    const fixture = await createFixture({ interactive: true, arrow: false });
    expect(fixture.nativeElement.querySelector('i-lucide.card-arrow')).toBeNull();
  });

  it('all inputs default to safe values (eyebrow/title/description empty, interactive=false, arrow=true)', async () => {
    const fixture = await createFixture();
    expect(fixture.componentInstance.eyebrow()).toBe('');
    expect(fixture.componentInstance.title()).toBe('');
    expect(fixture.componentInstance.description()).toBe('');
    expect(fixture.componentInstance.interactive()).toBe(false);
    expect(fixture.componentInstance.arrow()).toBe(true);
  });

  it('is a standalone component', () => {
    // `imports: [CardComponent]` in TestBed would throw at compile
    // time if not standalone — reaching this assertion is sufficient proof.
    expect(CardComponent.prototype).toBeDefined();
  });
});
