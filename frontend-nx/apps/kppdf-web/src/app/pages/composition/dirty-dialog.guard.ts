import type { DestroyRef, Injector } from '@angular/core';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from '../on-dialog-close-once';

/** Prompt before closing a dirty passport dialog (Cancel / backdrop / ESC). */
export function confirmDirtyClose(
  dialog: PiDialogService,
  destroyRef: DestroyRef,
  injector: Injector,
  isDirty: () => boolean,
  onConfirmedClose: () => void,
): void {
  if (!isDirty()) {
    onConfirmedClose();
    return;
  }
  const ref = dialog.open<boolean>(AlertDialogComponent, {
    data: {
      title: 'Закрыть без сохранения?',
      description: 'Несохранённые изменения паспорта будут потеряны.',
      confirmLabel: 'Закрыть',
      cancelLabel: 'Остаться',
      destructive: true,
    },
    parentDestroyRef: destroyRef,
  });
  onDialogCloseOnce(ref, injector, (confirmed) => {
    if (confirmed) onConfirmedClose();
  });
}
