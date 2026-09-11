# TZ-NX-NO-NATIVE-CONFIRM checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-NO-NATIVE-CONFIRM.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T04:59:29Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — предыдущая волна (01–03) уже DONE/archived/pushed на HEAD; `_active` был пуст, нет чужого CLAIM
- [x] TZ / канон / deps прочитаны: `studio-editor.page.ts:1964-1985` (`onFinalize`, `window.confirm`), delete-layer эталон `:2091-2118` (`AlertDialogComponent` + `onDialogCloseOnce`), `on-dialog-close-once.ts`, `pi-alert-dialog.component.ts` (`AlertDialogData` shape)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-NO-NATIVE-CONFIRM.md` на месте

## Acceptance

- [x] Клик «В архив» → Pi `AlertDialogComponent` (destructive), не браузерный confirm
- [x] Отмена → finalize не вызывается; Confirm → прежний flushLayouts+finalize flow (extracted to `runFinalize`, не задублирован)
- [x] `rg 'window\.(confirm|alert|prompt)' frontend-nx` → 0 hits (verified twice — before and after fixing a wording false-positive in my own new spec's comment/description)
- [x] Gates PASS + `no-alert: 'error'` added to `frontend-nx/eslint.config.mjs` workspace-wide

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (dialog UX) + lint config (workspace-wide rule)
- [x] FIC: N/A — bugfix/hygiene on an existing flow, не новая page/permission/module/MCP
- [x] page.md: одна строка в `document-studio.page.md` (архив = Pi dialog, no-alert lint guard)
- [x] DOMAIN-MAP: N/A — не менял module/route/page контур
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity / Gates (факт)

- Baseline (до кода): `cd frontend-nx && pnpm exec nx build kppdf-web` → **PASS** (verified in prior wave's session, same HEAD, no intervening kppdf-web changes)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` → **PASS** 107 suites / 733 passed (2 new spec files, 7 new tests: `studio-editor-finalize.spec.ts` ×3, `on-dialog-close-once.spec.ts` ×4)
- `cd frontend-nx && pnpm lint` → **PASS** for touched files (0 new errors/warnings); same pre-existing `271 problems (38 errors, 233 warnings)` baseline as prior wave, unchanged — `no-alert` rule live, 0 violations (the only prior `window.confirm` call site was removed)
- `pnpm architecture:check` → **PASS** (1473 files; baseline 17; resolved since baseline: 2)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → **PASS** exit 0 (closing, last command)

## Executor report

- `studio-editor.page.ts` `onFinalize()`: replaced `window.confirm(...)` with `this.dialog.open(AlertDialogComponent, { data: { title: 'Отправить документ в архив?', description: 'Редактирование будет закрыто.', confirmLabel: 'В архив', cancelLabel: 'Отмена', variant: 'destructive' }, parentDestroyRef: this.destroyRef })` + `onDialogCloseOnce(ref, this.injector, (confirmed) => { if (!confirmed) return; this.runFinalize(doc); })` — identical pattern to the delete-layer confirm already in this file. Extracted the existing `flushLayouts().then(finalize).then(...)` body into a new private `runFinalize(doc)` so the flow isn't duplicated.
- `frontend-nx/eslint.config.mjs`: added `'no-alert': 'error'` to the workspace-wide rules block (applies to all of `frontend-nx`, matching the TZ's "workspace" fallback option — simpler than duplicating into every app-level config).
- New `frontend-nx/apps/kppdf-web/src/app/pages/on-dialog-close-once.spec.ts`: isolated unit spec for the shared `onDialogCloseOnce` helper (used by every AlertDialog call site, previously untested) — 4 tests, including one that documents a real pre-existing subtlety: closing a dialog with **no value** (`ref.close()`, what `AlertDialogComponent.onCancel()` does) never invokes the callback at all, because the helper's own `value === undefined` guard treats that the same as "still open." This is existing, unrelated behavior — not something this TZ changes — but it means every call site's `if (!confirmed) return` is reachable only for an explicit `false`, never for a real cancel. Documented, not touched.
- New `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-finalize.spec.ts`: focused regression on `onFinalize()` — 3 tests (opens the right AlertDialog config; does not call finalize synchronously; does nothing when the doc isn't `draft`). **Deliberately does not** exercise the confirm→finalize continuation through `StudioEditorPage` itself: `TestBed.flushEffects()`/`fixture.detectChanges()` on this 15-injected-service, heavily-nested page forces a full `ApplicationRef.tick()` that tries to instantiate every child panel's own services (hit a real `NG0201: No provider for HttpClient` trying to render `StudioDataVitrinaComponent` → `PiProductsService`), which is exactly the "harness тяжёлый" case this TZ's own Preflight anticipated with its "unit on helper / spy dialog.open" fallback. The confirm-gated continuation itself is proven by the isolated `onDialogCloseOnce` spec instead, since that's the exact same gate `onFinalize` delegates to.
- `document-studio.page.md`: one-line note (archive = Pi dialog, no-alert guard).
- No live-browser/Playwright screenshot taken (still no chromium-cli/Playwright in this environment); confirmed instead that the frontend-nx dev server (still running from the prior wave) rebuilt cleanly after this edit (`.logs/launcher-frontend.log`, "Application bundle generation complete" at 2026-09-11T05:00:50Z, no new compiler errors) — same verification approach used for the Lucide fix in the prior wave.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T05:15:00Z
