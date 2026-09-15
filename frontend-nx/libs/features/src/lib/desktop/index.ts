/**
 * `@kppdf/features/desktop` public API.
 *
 * TZ-NX-DESKTOP-PAIRING-TO-FEATURES: `PairingDialogFacade` (lib root) and
 * `PairingDialogComponent` (`ui/`) moved here in full — both were already
 * fully self-contained (zero app-local relative imports, only `@angular/*`,
 * `lucide-angular`, and public `@kppdf/*` libs). `app-shell.component.ts`
 * imports `PairingDialogComponent`/`PairingDialogData` from here directly;
 * no route page hosts this dialog (opened imperatively via `PiDialogService`).
 */
export * from './ui';
export * from './pairing-dialog.facade';
