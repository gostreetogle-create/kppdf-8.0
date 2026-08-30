/** Scroll composition block into view when opened via «Открыть состав». */
export function scrollCompositionBlockIntoView(el: HTMLElement | null | undefined): void {
  if (!el) return;
  queueMicrotask(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  });
}
