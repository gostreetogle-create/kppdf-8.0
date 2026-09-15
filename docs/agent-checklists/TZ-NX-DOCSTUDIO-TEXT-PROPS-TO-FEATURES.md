# TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T09:59:36Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (TZ 1 archived `f67ba41b`/`bf6b991a`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES.md`, `WAVE-MAP.md`, depends on TZ 1 archived)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES.md` на месте

## What changed

This is the exact move that was investigated, attempted, and reverted
during B6 (see the archived `TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES.md`)
— TZ 1 of this wave fixed the real blocker (`libs/features`'s
`moduleResolution`), so this retry closes cleanly.

Moved `studio-text-properties.component.ts` (+ spec) and
`studio-properties-panel.component.ts` (no spec) into
`libs/features/src/lib/doc-studio/ui/`. Both had zero real blockers on
their own — only the established `on-dialog-close-once.ts` duplicate
(already present in this lib from Phase 3) and a self-referential
`@kppdf/features/doc-studio` barrel import in each, switched to a
relative sibling path (`./studio-data-field-picker-dialog.component`,
`../util/studio-block-helpers`, `./studio-table-properties.component`)
— same fix pattern already applied to `supply-requests.facade.ts` in C2
when a file joining a lib it already imported via the barrel needs to
stop self-referencing through it.

Updated the `ui/index.ts` barrel (+2 exports) and the one external
consumer, `studio-editor.page.ts` (`StudioPropertiesPanelComponent`
import switched from the relative path to `@kppdf/features/doc-studio`).

## Acceptance

- [x] Text/properties specs green — features lib 43/43 suites (382/382 tests, +1 suite/+5 tests vs. baseline for the moved spec)
- [x] studio-editor gates green — `kppdf-web --testPathPattern=studio` 24/24 suites (152/152 tests, -1 suite/-5 tests, matching the moved spec)
- [x] nx build last 0 — **the exact gate that failed during B6's reverted attempt now passes clean** (no `TS2307`, no tiptap error)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, no route change)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A (module boundary moved only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: the 2 moved files + barrel + studio-editor.page.ts import + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from TZ 1 closure (`f67ba41b`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB); confirmed no eager route provider

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `npx jest --config libs/features/jest.config.ts studio-text-properties.component.spec.ts` → PASS (5/5)
- `cd frontend-nx && pnpm exec nx test features` → PASS (43/43 suites, 382/382 tests)
- `npx jest --config apps/kppdf-web/jest.config.ts --testPathPattern=studio` → PASS (24/24 suites, 152/152 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (88/88 suites, 610/617 passed, 7 skipped, 0 failed)
- `pnpm architecture:check` → PASS (1545 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged) — **this is the gate that failed during B6; now clean**

## Executor report

Что сделано: повторил перенос `studio-text-properties`/`studio-properties-panel`
из B6 (тогда откатил из-за реального `nx build` фейла). После фикса
tsconfig в TZ 1 этой волны перенос закрылся чисто — все gates, включая
именно тот `nx build kppdf-web`, что упал в B6, зелёные.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio-list.page.ts/.spec.ts — Cursor's WIP) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
