/**
 * `@kppdf/features/admin-roles` public API.
 *
 * TZ-NX-ROLE-FORM-TO-FEATURES: `RoleFormFacade` (lib root) and
 * `RoleFormDialogComponent` (`ui/`) moved here in full — the dialog has no
 * illegal app dependency. `permission-labels.ru.ts` (240 LOC, pure RU label
 * data, zero Angular/DI deps) is duplicated into `ui/` — the same
 * low-risk-data pattern already used for `on-dialog-close-once.ts` and
 * production's `ORDER_STATUS_LABELS` — since `admin-roles.page.ts` (which
 * stays in the app) needs its own canonical copy for unrelated exports
 * (`permissionsSummary`, `roleLabelRu`).
 *
 * TZ-NX-ADMIN-ROLES-TO-FEATURES: `AdminRolesPageFacade` (lib root) moved in
 * too, reusing `RoleFormDialogComponent` and the `ui/permission-labels.ru.ts`
 * duplicate already here. `on-dialog-close-once.ts` duplicated into `ui/`
 * for it (same pattern as `shipping`/`registry-forms`). `RolesAdminPage`
 * itself (`admin-roles.page.ts`) stays in the app as the lazy route host
 * (`loadComponent`, no eager provider) — same shape as `shipping.page.ts`.
 */
export * from './ui';
export * from './role-form.facade';
export * from './admin-roles-page.facade';
