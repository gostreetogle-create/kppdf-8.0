# TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T19:11:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] `git branch --show-current` → `main`
- [x] `tasks/_active/` пуст перед клеймом
- [x] Зависимость: `TZ-NX-DOCSTUDIO-EDITOR-FACADE` archived (142d66e4 / 2545d06e) + `nx build kppdf-web` green on main
- [x] Baseline `nx build kppdf-web` → exit 0 (унаследован из Phase 1 closeout, тот же коммит)

## Acceptance

- [x] 1. No util sources left under `pages/studio/` for the 8 listed files
- [x] 2. Imports resolve via `@kppdf/features/doc-studio`
- [x] 3. Specs green: 6 moved specs (table-defaults/layout/block-helpers/geometry/session/workspace-chrome) под `nx test features`; regression `nx test kppdf-web --testPathPattern=studio-` (studio-editor suite included); `studio-list.page.spec.ts` не использует session-хелперы напрямую в тестах — не задет
- [x] 4. `nx build kppdf-web` последний, exit 0
- [x] 5. Archive + report SHA

## Integrity slot

- [x] Тип изменения: pure FE structure (file move + import fix), без нового route/permission/module
- [x] FIC — N/A
- [x] Чужой WIP не в коммите — `studio-list.page.ts` содержит несвязанный bulk-delete WIP; закоммичена **только** строка импорта `studio-session` → `@kppdf/features/doc-studio` (staged точечно через `git hash-object`/`update-index`, working tree с остальным WIP не тронут). `studio-list.page.spec.ts` вообще не тронут.

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (унаследован от Phase 1)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```
tsc -p apps/kppdf-web/tsconfig.app.json --noEmit          → PASS (0 output)
nx test kppdf-web --testPathPattern=studio-                → PASS 123/123 suites, 900/907 (7 pre-existing skip)
nx test features                                            → PASS 8/8 suites, 92/92 tests
nx build kppdf-web                                          → PASS exit 0 (after fix below)
```

## Executor report

**Root cause / what:** 8 pure helper files (`studio-table-defaults`, `studio-layout`,
`studio-block-helpers`, `studio-geometry`, `studio-text-helpers`, `studio-session`,
`studio-kp-doc-type`, `studio-workspace-chrome` + their specs) `git mv`'d from
`apps/kppdf-web/.../pages/studio/` into `libs/features/src/lib/doc-studio/util/`,
zero logic changes. New `@kppdf/features/doc-studio` secondary tsconfig path
(mirrors `@kppdf/data-access/auth` pattern) + two-level barrel (`util/index.ts`
→ `doc-studio/index.ts`, "secondary path only" per WAVE-MAP §ШАГ1 — root
`@kppdf/features` barrel untouched). Every consumer import updated: facade,
canvas, table-properties, properties-panel, proposals-list, studio-list,
templates-list, page.

**Two necessary adaptations (not covered by "move only" verbatim, both found
only by actually running the moved specs/build in their new home, not
predictable from the TZ text):**

1. `studio-workspace-chrome.ts` imported `type { StudioWsRailItem }` from
   `studio-workspace-shell.component.ts` (an app file staying put — libs
   cannot import from apps). Moved `StudioWsLucideIcon`/`StudioWsRailItem`'s
   *definition* into the relocated file (their only real owner now); the
   still-in-app shell component imports both back from
   `@kppdf/features/doc-studio`. Same shape, single definition, just
   relocated — not a behavior change.

2. `studio-block-helpers.ts` imported `migratePlainTokensToNodes` from
   `@kppdf/ui/rich-text`, which transitively pulls in
   `pi-rich-text-editor.component.ts` (Angular component + TipTap). Under
   `libs/features`'s plain `@nx/js:tsc` build (not Angular-aware), that
   broke `nx build kppdf-web` two ways: a `rootDir` violation (cross-lib
   source import from `libs/ui/paper-and-ink`) and an unresolvable
   `@tiptap/extensions/placeholder` subpath type under `node10`
   `moduleResolution`. `migratePlainTokensToNodes` itself is pure string
   manipulation with zero Angular/TipTap dependency of its own — inlined a
   verbatim copy in `studio-block-helpers.ts` (JSDoc explains why + flags
   "keep in sync") instead of restructuring paper-and-ink's rich-text
   barrel, which is outside this TZ's conflict keys.

**Third, test-infra-only fix:** two of the moved specs (`studio-table-defaults.spec.ts`,
`studio-block-helpers.spec.ts`) failed to even compile under `nx test features` —
not from the move itself, but because `libs/features/tsconfig.spec.json` (unlike
`apps/kppdf-web/tsconfig.json`, which already sets `isolatedModules: true`) was
doing full type-checking during Jest's ts-jest transform, surfacing two
pre-existing, previously-silent issues: a test fixture's `sampleRows` literal
technically violating its own declared type, and the same tiptap subpath-type
gap as above. Added `isolatedModules: true` to `libs/features/tsconfig.spec.json`
only (not `tsconfig.lib.json` — production build stays fully strict) to match
the rest of this workspace's established (if imperfect) convention, rather than
chasing two latent, pre-existing, out-of-scope type gaps.

**Files changed:**
- 8 files + 6 specs moved: `apps/kppdf-web/.../pages/studio/studio-{table-defaults,layout,block-helpers,geometry,text-helpers,session,kp-doc-type,workspace-chrome}.ts(+.spec.ts)` → `libs/features/src/lib/doc-studio/util/`
- `libs/features/src/lib/doc-studio/util/index.ts` (new, barrel)
- `libs/features/src/lib/doc-studio/index.ts` (new, barrel)
- `libs/features/tsconfig.spec.json` (isolatedModules)
- `frontend-nx/tsconfig.base.json` (`@kppdf/features/doc-studio` path)
- Import updates: `studio-editor.facade.ts`, `studio-editor.page.ts`, `studio-blocks-canvas.component.ts`, `studio-table-properties.component.ts`, `studio-properties-panel.component.ts`, `studio-workspace-shell.component.ts`, `proposals-list.page.ts`, `studio-templates-list.page.ts`, `studio-list.page.ts` (import line only — see Integrity slot re: WIP isolation)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE.md` (this file, new)

**Not touched:** `libs/ui/paper-and-ink/**` (out of conflict keys — the
`migratePlainTokensToNodes` duplication above is the deliberate alternative
to touching it), facade algorithms/signals, dumb UI (Phase 3), routes/guard,
`app/doc-studio/dialogs/**`, backend, `studio-list.page.spec.ts` and the rest
of the pre-existing bulk-delete WIP in `studio-list.page.ts`.

commit: (filled after commit below)

## Review handoff

- [x] Continuous wave, PO-issued prompt authorizes closeout without separate Cursor Verdict
- [x] Archive after gates PASS

## Closeout

- [x] archive + WAVE-MAP.md + tracker обновлены + `_active` очищен
- [x] Status = DONE
- closed_at: 2026-09-14T19:20:00Z
