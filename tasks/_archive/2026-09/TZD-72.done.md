# TZD-72: NX — порт «Подключить / Скачать Desktop» + RBAC desktop:admin

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06
closed_by: freebuff

## Verification

- acceptance criteria: PASS — `desktop:admin` in BE+FE catalog and visible in the roles matrix; pairing API 403 without the permission; AppShell button renders for admin/desktop:admin, absent otherwise; dialog issue+copy+download work when a ZIP URL is configured.
- backend full suite: PASS — `cd backend && pnpm test` (129 suites / 1232 tests, includes new `desktop-pairing.controller.spec.ts` + two bumped catalog-size regression pins 29→30).
- backend typecheck: PASS — `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`.
- backend lint: PASS — `cd backend && pnpm lint` (0 errors; pre-existing `any` warnings only).
- frontend-nx app typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`.
- frontend-nx data-access typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit`.
- focused NX Jest: PASS — `pi-desktop-pairing.service.spec.ts` + `desktop-download-url.spec.ts` (data-access), `pairing-dialog.component.spec.ts` (14/14), `app-shell.component.spec.ts` (+3 new; only the 2 pre-existing known failures remain, N/A).
- full `nx test kppdf-web`: 584 tests, only the 2 pre-existing known `app-shell.component.spec.ts` failures (N/A, unrelated).
- full `nx test data-access`: PASS — 116/116.
- lint (NX changed paths): PASS — 0 errors; 1 new warning consistent with the file's pre-existing non-null-assertion convention.
- architecture: PASS — `pnpm architecture:check` (1457 files; baseline 17, 2 resolved) + `pnpm architecture:check:nx` (399 files, 0 violations).
- final gate: PASS — `cd frontend-nx && pnpm exec nx build kppdf-web` (only pre-existing known warnings: Studio NG8102, Gantt CSS budget).

## Delivered

- BE: new permission `desktop:admin` (`backend/src/common/seed/permissions.constants.ts`); `@Permissions('desktop:admin')` on `POST/GET pairing-keys`, `POST pairing-keys/:id/revoke`, `POST pairing` alias (`desktop-pairing.controller.ts`); `GET compat` stays `@Public`. New `desktop-pairing.controller.spec.ts` verifies the metadata is really reflected off the production controller (real `Reflector` + real class, not a mock), and separately verifies 403/200 behavior for no-permission / explicit desktop:admin / admin-wildcard.
- NX data-access: `frontend-nx/libs/data-access/src/lib/desktop/` — `desktop-download-url.ts` (+spec, 1:1 port of the legacy meta-tag URL resolver/InjectionToken), `desktop-pairing.types.ts`, `pi-desktop-pairing.service.ts` (+spec) — issue/list/revoke/compat. Exported via the library's public `index.ts`.
- NX capabilities: `capabilities.metadata.ts` gained `desktop:admin` (admin-role/wildcard shortcut in `CapabilitiesService` picks it up automatically); `permission-labels.ru.ts` gained the RU label + a new `desktop` group title; `role-form-dialog.component.ts` gained the `desktop` section→group mapping so the Roles matrix renders a real "Десктоп" section.
- NX UI: new `PairingDialogComponent` (`apps/kppdf-web/src/app/pages/desktop/`) — full port of legacy TTL/issue/copy/download/compat-subtitle/list/revoke UX including the TZD-59 "never show a literal `v?`" regressions (+spec, 14 tests). AppShell (`app-shell.component.ts`) gained `canPairDesktop = computed(() => caps.hasAny(['desktop:admin']))` and a «Подключить десктоп» icon button next to the user chip, gated by that computed signal; `onDesktopPairing()` + `resolveApiBaseUrl()` ported 1:1 from legacy `app-layout.component.ts`.
- Docs: `docs/DOMAIN-MAP.md` Desktop/Import NX column marked live (chrome action, no route); `docs/pages/admin-roles.page.md` one-line desktop:admin mention; `docs/FEATURE-INTEGRATION-CHECKLIST.md` §E bullet.

## Scope disclosure

- No Excel/Form-Studio, no `/registries` Excel buttons, no Desktop Tauri `App.svelte` pairing flow touched.
- Public `/downloads` static serving rules untouched (still ungated, per the audit's explicit note that download-by-URL may stay behind whatever site-level auth already exists — only the UI button and the pairing API needed the new RBAC gate).
- CAPABILITY-LEDGER update deliberately left to TZD-73 (its own explicit scope, per the TZ's "или TZD-73" alternative).
- known_limitation (carried from the TZ itself): legacy `frontend/` shell button is still ungated (no cap check) — optional successor hardening.

## Commit

- see git log
