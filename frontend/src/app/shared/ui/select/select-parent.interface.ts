import { InjectionToken } from '@angular/core';

export interface SelectParent {
  value: () => string | null;
  selectOption: (value: string) => void;
}

export const SELECT_PARENT = new InjectionToken<SelectParent>('SELECT_PARENT');
