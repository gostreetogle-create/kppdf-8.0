import { InjectionToken, Signal } from '@angular/core';

export interface SheetRef {
  readonly closed: Signal<boolean>;
  close: () => void;
}

export const PI_SHEET_REF = new InjectionToken<SheetRef>('PI_SHEET_REF');
