/** True for the cross-platform save-and-continue shortcut. */
export function isSaveAndContinueKey(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.key === 'Enter';
}

/** Focus the first native control inside a marked dialog field after a reset. */
export function focusDialogField(selector: string): void {
  queueMicrotask(() => {
    const host = document.querySelector<HTMLElement>(selector);
    const control = host?.matches('input,textarea,select,button')
      ? host
      : host?.querySelector<HTMLElement>('input,textarea,select,button');
    control?.focus();
  });
}
