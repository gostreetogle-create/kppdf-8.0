import { scrollCompositionBlockIntoView } from './composition-focus-scroll';

describe('scrollCompositionBlockIntoView (TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1)', () => {
  it('scrolls and focuses composition block', async () => {
    const el = document.createElement('div');
    el.scrollIntoView = jest.fn();
    el.focus = jest.fn();
    scrollCompositionBlockIntoView(el);
    await Promise.resolve();
    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(el.getAttribute('tabindex')).toBe('-1');
    expect(el.focus).toHaveBeenCalledWith({ preventScroll: true });
  });
});
