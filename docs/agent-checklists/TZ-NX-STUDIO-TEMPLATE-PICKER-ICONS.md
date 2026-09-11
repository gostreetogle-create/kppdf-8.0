# TZ-NX-STUDIO-TEMPLATE-PICKER-ICONS checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-STUDIO-TEMPLATE-PICKER-ICONS.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T04:39:31Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только что закрытый 01, нет чужого CLAIM на template-picker-dialog
- [x] TZ / канон / deps прочитаны (`studio-templates-list.page.ts:48` эталон `pi-icon-btn pi-icon-btn-danger`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-STUDIO-TEMPLATE-PICKER-ICONS.md` на месте

## Acceptance

- [x] В DOM delete имеет `pi-icon-btn` + `pi-icon-btn-danger`; нет `pi-icon-button` (source class swap, `studio-template-picker-dialog.component.ts:26`)
- [x] Визуально: тот же селектор/классы, что уже gold-эталон `studio-templates-list.page.ts:48` (`pi-icon-btn pi-icon-btn-danger pi-focus-ring`) → идентичный рендер квадрата hairline + ×; ряд `flex items-center gap-2` не менялся, вертикальный центр сохранён
- [x] `rg pi-icon-button frontend-nx` → 0 hits (verified)
- [x] `document-studio.page.md` note про третье место `pi-icon-button` закрыт
- [x] Gates PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (dialog markup/class only, no new route)
- [x] FIC: N/A — CSS class swap, не новая page/permission/module/MCP
- [x] page.md обновлён: `document-studio.page.md` note закрыт; PAGE-TZ-INDEX строка N/A (уже есть строка на document-studio, класс-фикс не новая page)
- [x] DOMAIN-MAP: N/A — не менял module/route/page контур
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline до кода: TZ-01 closing `nx build kppdf-web` только что PASS на этом же HEAD (код с тех пор не менялся) — переиспользован как baseline
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — только этот TZ
- [x] Закрытие: `nx build kppdf-web` → exit 0 (PASS)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` → **PASS** 105 suites / 726 passed / 7 skipped (no change from TZ-01 baseline — no test file for this component previously existed, none required by TZ acceptance)
- `cd frontend-nx && pnpm lint` → **FAIL** same pre-existing 38-error baseline as TZ-01 (verified `studio-template-picker-dialog.component.ts` produces 0 of its own lint errors — grepped lint output for the filename, no hits)
- `rg pi-icon-button frontend-nx` (via `grep -rn`) → **0 hits** (acceptance criterion #3, PASS)
- `pnpm architecture:check` → **PASS** (1473 files; baseline 17; resolved since baseline: 2)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → **PASS** exit 0

## Executor report

- `studio-template-picker-dialog.component.ts:26` — `pi-icon-button` → `pi-icon-btn pi-icon-btn-danger pi-focus-ring shrink-0`, matching the gold reference in `studio-templates-list.page.ts:48`. Delete-button click handler / confirm-dialog flow untouched.
- `document-studio.page.md` — closed the "third pi-icon-button spot" note left open by `TZ-NX-UX-15-studio-list-FIX`.
- No dedicated component spec existed for this dialog and TZ acceptance did not require adding one (grep + visual only); did not create one to avoid scope creep on an S-size class-rename fix.
- No browser/Playwright click-through performed — no chromium-cli/Playwright installed in this environment. Dev server (`node start.mjs --nx --no-browser`) is live on :4201 and rebuilt after this edit; visual confirmation is by class-parity with the already-shipped `studio-templates-list.page.ts` pattern, not a live screenshot.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T04:55:00Z
