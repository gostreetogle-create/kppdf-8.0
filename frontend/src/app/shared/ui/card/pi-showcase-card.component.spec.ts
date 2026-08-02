import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal, ViewChild } from '@angular/core';
import { PiShowcaseCardComponent } from './pi-showcase-card.component';

/**
 * TZ-PRODUCTS-305 — unit tests for PiShowcaseCardComponent.
 *
 * Uses signals in the fixture host so input changes propagate to the
 * child component reliably (Angular 20 input binding pattern).
 */
@Component({
  selector: 'app-fixture-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiShowcaseCardComponent],
  template: `
    <app-pi-showcase-card
      [size]="size()"
      [eyebrow]="eyebrow()"
      [title]="title()"
      [description]="description()"
      [mediaUrl]="mediaUrl()"
      [badge]="badge()"
      [interactive]="interactive()"
      [arrow]="arrow()"
      data-test="card"
    >
      <span data-test="body-content">Body</span>
      <span sc-related data-test="related">Related</span>
      <span sc-actions data-test="actions">Actions</span>
    </app-pi-showcase-card>
  `,
})
class FixtureHostComponent {
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly eyebrow = signal<string>('');
  readonly title = signal<string>('');
  readonly description = signal<string>('');
  readonly mediaUrl = signal<string>('');
  readonly badge = signal<string>('');
  readonly interactive = signal<boolean>(false);
  readonly arrow = signal<boolean>(true);
  @ViewChild(PiShowcaseCardComponent) card!: PiShowcaseCardComponent;
}

describe('PiShowcaseCardComponent — TZ-PRODUCTS-305', () => {
  let fixture: ComponentFixture<FixtureHostComponent>;
  let host: FixtureHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixtureHostComponent, PiShowcaseCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FixtureHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders as standalone component', () => {
    expect(host.card).toBeTruthy();
    const article = fixture.nativeElement.querySelector('article[data-test="showcase-card"]');
    expect(article).toBeTruthy();
  });

  it('default size is md (data-size attribute)', () => {
    const article = fixture.nativeElement.querySelector('article[data-test="showcase-card"]');
    expect(article.getAttribute('data-size')).toBe('md');
  });

  it('size="sm" renders compact row layout', () => {
    host.size.set('sm');
    host.title.set('Material X');
    host.description.set('Stainless steel');
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('article[data-test="showcase-card"]');
    expect(article.getAttribute('data-size')).toBe('sm');
    const titleEl = article.querySelector('[data-test="title"]');
    expect(titleEl?.textContent?.trim()).toBe('Material X');
    const descEl = article.querySelector('[data-test="description"]');
    expect(descEl?.textContent?.trim()).toBe('Stainless steel');
  });

  it('size="md" shows eyebrow, title, media img', () => {
    host.size.set('md');
    host.eyebrow.set('product module');
    host.title.set('Module M');
    host.description.set('desc');
    host.mediaUrl.set('/img.png');
    host.badge.set('new');
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('article[data-test="showcase-card"]');
    expect(article.getAttribute('data-size')).toBe('md');
    expect(article.querySelector('[data-test="eyebrow"]')?.textContent?.trim()).toBe(
      'product module',
    );
    expect(article.querySelector('[data-test="badge"]')?.textContent?.trim()).toBe('new');
    expect(article.querySelector('[data-test="title"]')?.textContent?.trim()).toBe('Module M');
    expect(article.querySelector('img')?.getAttribute('src')).toBe('/img.png');
  });

  it('size="lg" renders magazine-layout (data-size=lg, h2 title, related slot)', () => {
    host.size.set('lg');
    host.eyebrow.set('модуль');
    host.title.set('Big Card');
    host.description.set('Module description');
    host.badge.set('system');
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('article[data-test="showcase-card"]');
    expect(article.getAttribute('data-size')).toBe('lg');
    const h2 = article.querySelector('h2[data-test="title"]');
    expect(h2?.textContent?.trim()).toBe('Big Card');
    expect(article.querySelector('[data-test="eyebrow"]')).toBeTruthy();
    expect(article.querySelector('[data-test="badge"]')).toBeTruthy();
    expect(article.querySelector('[data-test="related"]')?.textContent?.trim()).toBe('Related');
  });

  it('interactive=true adds is-hoverable class', () => {
    host.size.set('md');
    host.interactive.set(true);
    fixture.detectChanges();
    const article = fixture.nativeElement.querySelector('article[data-test="showcase-card"]');
    expect(article.classList.contains('is-hoverable')).toBe(true);
  });

  it('arrow suppressed when arrow=false even with interactive=true', () => {
    host.size.set('md');
    host.interactive.set(true);
    host.arrow.set(false);
    fixture.detectChanges();
    const article = fixture.nativeElement.querySelector('article[data-test="showcase-card"]');
    expect(article.querySelector('[data-test="arrow"]')).toBeNull();
    expect(article.classList.contains('is-hoverable')).toBe(true);
  });

  it('no media img when mediaUrl empty', () => {
    host.size.set('lg');
    host.mediaUrl.set('');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('article[data-test="showcase-card"] img');
    expect(img).toBeNull();
  });

  it('body content projects through default slot (sc-body-lg contains body span)', () => {
    host.size.set('lg');
    fixture.detectChanges();
    const bodySpan = fixture.nativeElement.querySelector('[data-test="body-content"]');
    expect(bodySpan?.textContent?.trim()).toBe('Body');
    // Confirm body content was projected into the body wrapper, not elsewhere
    const wrapper = fixture.nativeElement.querySelector('.sc-body-lg');
    expect(wrapper?.contains(bodySpan)).toBe(true);
  });
});
