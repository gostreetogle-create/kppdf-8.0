# TZ-NX-FEATURES-TIPTAP-TSCONFIG checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-FEATURES-TIPTAP-TSCONFIG.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T09:56:57Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (B6 archived `df158e3b`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-FEATURES-TIPTAP-TSCONFIG.md`, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-FEATURES-TIPTAP-TSCONFIG.md` на месте

## What changed

`libs/features/tsconfig.json`: `"module": "commonjs"` → `"module": "preserve"`
+ added `"moduleResolution": "bundler"` — the exact same override
`apps/kppdf-web/tsconfig.json` already uses (the TZ's own preferred
option).

**Why this is safe for jest:** `libs/features/tsconfig.spec.json`
(what `jest-preset-angular`/`ts-jest` actually uses, per
`jest.config.ts`'s `tsconfig: '<rootDir>/tsconfig.spec.json'`) already
independently pins its own `"module": "commonjs"` +
`"moduleResolution": "node10"`, unrelated to and unaffected by whatever
`tsconfig.json`/`tsconfig.lib.json` (the build-time config) sets — same
pattern the app already relies on (`apps/kppdf-web/tsconfig.spec.json`
pins its own `commonjs`/`node10` too, independent of the app's own
`preserve`/`bundler` build config). Confirmed by running the full `nx
test features` suite after the change: unchanged, 42/42 green.

**Why this actually fixes the B6 blocker:** `moduleResolution: "bundler"`
(unlike plain `"node"`) understands a package's `exports` field subpath
resolution, which `@tiptap/extensions/placeholder` (imported by
`pi-rich-text-editor.component.ts` in `@kppdf/ui/rich-text`) requires.
`moduleResolution: "bundler"` itself requires `module` to be `"preserve"`
or ES2015+ — `libs/features` previously had `module: "commonjs"`, which
is why the narrower one-line fix attempted during B6 (adding
`moduleResolution` alone) failed with a second compiler error
(`TS5095`). Changing both together, matching the app exactly, resolves
it cleanly.

**Verified directly, not assumed:** added a throwaway probe file
(`libs/features/src/lib/__tiptap-probe.ts`, never committed) importing
`PiRichTextEditorComponent` from `@kppdf/ui/rich-text` and ran
`tsc -p libs/features/tsconfig.lib.json --noEmit` — clean (0 errors) —
before removing the probe and re-confirming the lib still typechecks
clean on its own. This is the same import chain that failed the real
`nx build kppdf-web` during B6's reverted attempt.

## Acceptance

- [x] Can compile a features file that imports `@kppdf/ui/rich-text` (verified via the probe file above)
- [x] `nx test features` → PASS (42/42 suites, 377/377 tests, unchanged)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (build-config alignment, no product code)
- [x] FIC §A–E — N/A (no page/permission/module/MCP surface change)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: `libs/features/tsconfig.json` + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (confirmed before claim)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors, clean; verified resolves `@tiptap/extensions/placeholder` via a throwaway probe file)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test features` → PASS (42/42 suites, 377/377 tests, unchanged — confirms jest's independent `tsconfig.spec.json` was unaffected)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (89/89 suites, 615/622 passed, 7 skipped, 0 failed, unchanged)
- `pnpm architecture:check` → PASS (1545 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: выровнял `libs/features/tsconfig.json` с
`apps/kppdf-web/tsconfig.json` (`module: preserve` + `moduleResolution:
bundler`) — тот самый блокер из B6. Убедился, что jest не пострадает,
т.к. `tsconfig.spec.json` уже независимо фиксирует свой
`commonjs`/`node10` (тот же паттерн, что уже используется в app).
Проверил фикс напрямую через одноразовый probe-файл (импорт
`PiRichTextEditorComponent`), не просто предположил — probe скомпилировался
чисто, затем удалён.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
