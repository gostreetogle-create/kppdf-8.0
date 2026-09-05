# TZD-72 checklist — NX «Подключить / Скачать Desktop» + RBAC desktop:admin

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZD-72.done.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-05T22:41:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] `_active` had only `TZD-72.md` (own claim); TZD-71 DONE + committed (`b064ea86`) before starting code
- [x] TZ + audit §5–6 read; legacy `pi-desktop-pairing.service.ts`, `pairing-dialog.component.ts` (+spec), `app-layout.component.ts` (`onDesktopPairing`/`resolveApiBaseUrl`) read in full
- [x] BE `desktop-pairing.controller.ts`, `desktop-pairing-key.service.ts`, `permissions.constants.ts`, `permissions.decorator.ts`, `permissions.guard.ts` (+specs) read
- [x] NX `capabilities.metadata.ts`, `capabilities.service.ts`, `permission-labels.ru.ts`, `role-form-dialog.component.ts` (SECTION_TO_GROUP/GROUP_ORDER), `app-shell.component.ts` (+spec), `pi-dialog.service.ts`, `on-dialog-close-once.ts` read

### Preflight Check Output
- **Context read:** see above — full legacy pairing stack + BE RBAC contract + NX capabilities/shell/dialog infra.
- **Key Constraints:** `@Permissions('desktop:admin')` throws at module-load if the key isn't in the BE catalog first (decorator asserts canonical keys) — catalog step must land before the controller step; `compat` stays `@Public`; button hidden (not just disabled) without the cap; no session JWT in the pairing packet; no Excel/registries/Desktop-Tauri changes.
- **Planned Deliverable:** BE `desktop:admin` permission + `@Permissions` gate + controller RBAC spec; NX `PiDesktopPairingService` + `desktop-download-url.ts` port (`libs/data-access/src/lib/desktop/`) + `PairingDialogComponent` (`pages/desktop/`) + AppShell button gated by `caps.hasAny(['desktop:admin'])`; RU labels + role-matrix group; FIC §B/E + DOMAIN-MAP + admin-roles.page.md.
- **Validation Path:** backend full suite + focused NX jest (data-access/desktop, pages/desktop, app-shell) + `nx build kppdf-web` + architecture checks.

**Проверено:** two hardcoded catalog-size regression pins existed (`permissions.guard.spec.ts` `CANONICAL.size).toBe(29)`, `rbac-contract.spec.ts` `PERMISSIONS.length).toBe(29)`) — both bumped to 30 with a comment citing TZD-72, otherwise the full backend suite would fail on unrelated-looking assertions after adding the 30th key.

---

## Критерии приёмки (из TZ)

- [x] `desktop:admin` в BE+FE catalog; виден в roles matrix (`PermissionsCatalogService` reads the BE catalog live — no separate FE data-access change needed beyond the metadata mirror + RU label/group)
- [x] Pairing API 403 без права — `desktop-pairing.controller.spec.ts` (new)
- [x] Shell: admin видит; user без права — нет — `app-shell.component.spec.ts` (+3 new tests)
- [x] Dialog: issue + copy + download работают при наличии ZIP URL — `pairing-dialog.component.spec.ts` (14 tests, ported from legacy TZD-21/57/59)
- [x] `nx build kppdf-web` PASS; focused jest PASS; BE pairing tests PASS
- [x] FIC §B (via §E bullet); DOMAIN-MAP updated

## Шаги (факт)

- [x] ШАГ 1 — Permission catalog: BE `permissions.constants.ts` (+description), NX `capabilities.metadata.ts` (lockstep key/section/action), RU label + `PERMISSION_GROUP_TITLE_RU['desktop']` + `SECTION_TO_GROUP`/`GROUP_ORDER` in `role-form-dialog.component.ts`, FIC §E bullet.
- [x] ШАГ 2 — BE gate: `@Permissions('desktop:admin')` on `issue`/`issuePairing`/`list`/`revoke`; `compatInfo` untouched (`@Public`); new `desktop-pairing.controller.spec.ts` uses the REAL controller class + a real `Reflector` (not mocked) so the test proves the decorator is actually wired, not just that `PermissionsGuard`'s generic ladder works.
- [x] ШАГ 3 — NX data-access: `libs/data-access/src/lib/desktop/` — `desktop-download-url.ts` (+spec, ported 1:1 from legacy), `desktop-pairing.types.ts`, `pi-desktop-pairing.service.ts` (+spec), `index.ts`; wired into `libs/data-access/src/index.ts`.
- [x] ШАГ 4 — `PairingDialogComponent` (`apps/kppdf-web/src/app/pages/desktop/`) — full UX port (TTL/label/issue/copy/download/compat subtitle/list/revoke); spec ported from legacy (14 tests incl. TZD-46/57/59 regressions: no `v?` placeholder, alias/versioned/empty-URL fallback chain, no JWT in packet).
- [x] ШАГ 5 — AppShell: `canPairDesktop = computed(() => caps.hasAny(['desktop:admin']))`; button rendered only inside that guard, next to the user chip (same slot as legacy); `onDesktopPairing()` + `resolveApiBaseUrl()` ported; 3 new spec tests (renders with cap / absent without / opens dialog with resolved data).
- [x] ШАГ 6 — Docs: `docs/DOMAIN-MAP.md` Desktop/Import NX column → live (chrome action, no route); `docs/pages/admin-roles.page.md` one-line desktop:admin mention; CAPABILITY-LEDGER left to TZD-73 (its own explicit scope per the TZ's "или TZD-73" alternative).

## Gates (факт)

- [x] Backend full suite: `cd backend && pnpm test` — 129 suites / 1232 tests PASS (includes the new `desktop-pairing.controller.spec.ts` and the two bumped regression pins)
- [x] Backend typecheck: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — clean
- [x] Backend lint: `cd backend && pnpm lint` — 0 errors (pre-existing `any` warnings only, none in new/edited files)
- [x] `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — clean
- [x] `cd frontend-nx && pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` — clean
- [x] Focused NX Jest: `pi-desktop-pairing.service.spec.ts` + `desktop-download-url.spec.ts` (data-access, new) PASS; `pairing-dialog.component.spec.ts` (new, 14/14) PASS; `app-shell.component.spec.ts` (+3 new) — only pre-existing known 2 failures remain (N/A, unrelated)
- [x] Full `nx test kppdf-web` — 584 tests, only the 2 pre-existing known `app-shell.component.spec.ts` failures (N/A)
- [x] Full `nx test data-access` — 116/116 PASS
- [x] Changed-path ESLint (NX) — 0 errors; 1 new warning consistent with the file's pre-existing non-null-assertion convention
- [x] `pnpm architecture:check` + `pnpm architecture:check:nx` — both PASS (see Executor report)
- [x] Final `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS (only pre-existing known warnings: Studio NG8102, Gantt CSS budget)

## Executor report

- BE: new permission `desktop:admin` (section `desktop`, action `admin`) in `permissions.constants.ts`; `@Permissions('desktop:admin')` on `POST/GET pairing-keys`, `POST pairing-keys/:id/revoke`, `POST pairing` (alias); `GET compat` stays `@Public`. New `desktop-pairing.controller.spec.ts` proves the metadata is really on the production controller methods (via `Reflect.getMetadata` + a real `Reflector`-backed `PermissionsGuard`), not just a generic guard-ladder test.
- NX data-access: new `libs/data-access/src/lib/desktop/` (`desktop-download-url.ts`, `desktop-pairing.types.ts`, `pi-desktop-pairing.service.ts` + specs) — 1:1 port of the legacy pairing client and the meta-tag URL resolver, exported from the library's public `index.ts`.
- NX capabilities: `capabilities.metadata.ts` gained `desktop:admin` (admin-role/wildcard shortcut in `CapabilitiesService.effectivePermissions()` picks it up automatically — no extra code). `permission-labels.ru.ts` gained the RU label + a new `desktop` group title; `role-form-dialog.component.ts` gained the `desktop` section→group mapping and display order so the Roles matrix renders a real "Десктоп" section instead of falling back to the raw key.
- NX UI: new `PairingDialogComponent` (`pages/desktop/`) — full port of the legacy TTL/issue/copy/download/compat-subtitle/list/revoke UX, including the TZD-59 "never show a literal `v?`" regressions. AppShell gained a `canPairDesktop` computed gate and a «Подключить десктоп» icon button (next to the user chip, same slot as legacy) that opens the dialog with `{ apiBaseUrl, username }` resolved the same way legacy does (absolute `API_BASE_URL` token → its origin; dev mode → `127.0.0.1:3000`; else `window.location.origin`).
- Regression-pin fix: two backend specs hardcoded the permission-catalog size (29); both bumped to 30 with a comment citing this TZD, otherwise unrelated-looking test failures would have appeared after adding the 30th key.
- Docs: `docs/DOMAIN-MAP.md` Desktop/Import NX column marked live (chrome action, no route); `docs/pages/admin-roles.page.md` one-line desktop:admin mention; `docs/FEATURE-INTEGRATION-CHECKLIST.md` §E bullet. CAPABILITY-LEDGER left to TZD-73 by design (its own explicit scope).
- Scope discipline: no Excel/Form-Studio, no `/registries` Excel buttons, no Desktop Tauri `App.svelte` pairing flow, no change to public `/downloads` static serving rules touched.
- known_limitation (carried from the TZ itself): legacy `frontend/` shell button is still ungated (no cap check) — optional successor hardening, out of this TZ's scope (NX is the RBAC-correct surface going forward).

## Closeout

- [x] Archive + remove active marker
- [x] Status = DONE
- closed_at: 2026-09-06T00:10:00+03:00
- commit SHA: `c615ace7`
