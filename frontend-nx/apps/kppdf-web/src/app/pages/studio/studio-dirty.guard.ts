import type { CanDeactivateFn } from '@angular/router';
import type { StudioEditorPage } from './studio-editor.page';

/** Blocks navigation away from a dirty studio document until the user confirms (TZ-NX-DOCSTUDIO-S38). */
export const studioDirtyGuard: CanDeactivateFn<StudioEditorPage> = (component) =>
  component.canDeactivate();
