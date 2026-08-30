import { DestroyRef, Signal } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- TResult/TData used externally for type inference
export interface DialogConfig<TResult = unknown, TData = unknown> {
  width?: 'sm' | 'md' | 'lg' | string;
  height?: string;
  modal?: boolean;
  dismissOnBackdropClick?: boolean;
  dismissOnEscape?: boolean;
  data?: TData;
  ariaLabel?: string;
  /** Additional CSS class(es) added to the CDK overlay panel element. */
  panelClass?: string;
  /** TZ-103.2: caller's DestroyRef; service auto-closes dialog when caller is destroyed. */
  parentDestroyRef?: DestroyRef;
}

export interface DialogRef<T = unknown> {
  readonly closed: Signal<T | undefined>;
  close: (v?: T) => void;
}
