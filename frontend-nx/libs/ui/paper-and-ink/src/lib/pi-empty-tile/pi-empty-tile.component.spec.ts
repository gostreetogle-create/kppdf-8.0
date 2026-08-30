import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiEmptyTileComponent } from './pi-empty-tile.component';

/**
 * TZ-NEW: Unit tests for PiEmptyTile (TZ-AUDIT-6).
 *
 * Contract under test:
 *  - `sizePx` defaults to 48 (catalog thumbnail size)
 *  - `sizePx` input drives inline width + height in pixels
 *  - Root tile div is `aria-hidden="true"` (decorative stand-in)
 *  - Inner glyph renders the em-dash placeholder (U+2014)
 *  - 1:1 aspect ratio enforced (width === height)
 *  - Component is standalone (no NgModule required for compilation)
 */
describe('PiEmptyTileComponent', () => {
  let fixture: ComponentFixture<PiEmptyTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiEmptyTileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PiEmptyTileComponent);
    fixture.detectChanges();
  });

  function tileDiv(): HTMLElement {
    return fixture.nativeElement.querySelector('.pi-empty-tile') as HTMLElement;
  }

  function glyphSpan(): HTMLElement {
    return fixture.nativeElement.querySelector('.pi-empty-tile__glyph') as HTMLElement;
  }

  it('defaults sizePx to 48px', () => {
    expect(tileDiv().style.width).toBe('48px');
    expect(tileDiv().style.height).toBe('48px');
  });

  it('respects a custom sizePx input', () => {
    fixture.componentRef.setInput('sizePx', 64);
    fixture.detectChanges();
    expect(tileDiv().style.width).toBe('64px');
    expect(tileDiv().style.height).toBe('64px');
  });

  it('enforces 1:1 aspect ratio (width === height) for any sizePx', () => {
    fixture.componentRef.setInput('sizePx', 96);
    fixture.detectChanges();
    expect(tileDiv().style.width).toBe(tileDiv().style.height);
  });

  it('marks the root tile as aria-hidden (decorative)', () => {
    expect(tileDiv().getAttribute('aria-hidden')).toBe('true');
  });

  it('also marks the inner glyph as aria-hidden', () => {
    expect(glyphSpan().getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the em-dash (U+2014) glyph', () => {
    expect(glyphSpan().textContent?.trim()).toBe('\u2014');
  });

  it('compiles as a standalone component (no NgModule required)', () => {
    // `imports: [PiEmptyTileComponent]` in TestBed.configureTestingModule
    // would throw at compile time if the component were not
    // standalone. Reaching this assertion means the compile succeeded,
    // which is sufficient proof of standalone status — no need to
    // poke at the internal `ɵcmp` symbol (private API, may change).
    expect(PiEmptyTileComponent.prototype).toBeDefined();
  });
});
