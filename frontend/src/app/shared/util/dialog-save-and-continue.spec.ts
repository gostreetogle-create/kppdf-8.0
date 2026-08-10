import { focusDialogField, isSaveAndContinueKey } from './dialog-save-and-continue';

describe('dialog save-and-continue helpers (TZ-UX-DIALOG-307)', () => {
  it('accepts Ctrl+Enter and Cmd+Enter but not plain Enter', () => {
    expect(
      isSaveAndContinueKey(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true })),
    ).toBe(true);
    expect(
      isSaveAndContinueKey(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true })),
    ).toBe(true);
    expect(isSaveAndContinueKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(false);
    expect(
      isSaveAndContinueKey(new KeyboardEvent('keydown', { key: 'Escape', ctrlKey: true })),
    ).toBe(false);
  });

  it('focuses the first native control inside a marked field', async () => {
    document.body.innerHTML = '<div data-test="first"><input /></div>';
    focusDialogField('[data-test="first"]');
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(document.activeElement).toBe(document.querySelector('input'));
  });
});
