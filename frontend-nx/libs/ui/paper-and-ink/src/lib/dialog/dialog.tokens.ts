import { InjectionToken } from '@angular/core';
import { DialogConfig, DialogRef } from './dialog.types';

export const PI_DIALOG_DATA = new InjectionToken<unknown>('PI_DIALOG_DATA');
export const PI_DIALOG_REF = new InjectionToken<DialogRef<unknown>>('PI_DIALOG_REF');
export const PI_DIALOG_CONFIG = new InjectionToken<DialogConfig>('PI_DIALOG_CONFIG');
