import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  output,
} from '@angular/core';

/**
 * ScrollSpy directive — emits the id of the section currently in view.
 * Usage: <main hlmScrollSpy (activeIdChange)="activeSection.set($event)">
 *        <section id="colors">...</section>
 *        <section id="typography">...</section>
 * </main>
 */
@Directive({
  selector: '[hlmScrollSpy]',
  standalone: true,
})
export class ScrollSpyDirective implements AfterViewInit, OnDestroy {
  readonly activeIdChange = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const sections: HTMLElement[] = Array.from(
      this.host.nativeElement.querySelectorAll('[id]'),
    );
    if (sections.length === 0) return;

    const visible = new Set<string>();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            visible.add(el.id);
          } else {
            visible.delete(el.id);
          }
        }
        // Pick the first visible section in DOM order
        const first = sections.find((s) => visible.has(s.id));
        if (first) this.activeIdChange.emit(first.id);
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0,
      },
    );

    for (const section of sections) {
      this.observer.observe(section);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
