# TZ-NX-DOCSTUDIO-S35-ORPHAN-PURGE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S35-ORPHAN-PURGE.md` (removed after archive)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-04T00:00:00Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S35
- team_room_claim: unavailable (no Team Room CLI in this worktree)

## Preflight

- [x] `git status` / `git branch --show-current` → worktree `D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S35`, branch `claude/docstudio-s35`
- [x] `_NOW.md` + `tasks/_active/` read — only this TZ in `_active`, no other CLAIM on `studio-shell.page.ts` / `studio-table-editor.component.ts` / `studio-editor.page.ts` / `studio-workspace-chrome.ts` / `nx build kppdf-web`
- [x] TZ read; S34 dependency already merged (`7a832b69 merge(S34)`)
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S35-ORPHAN-PURGE.md` on place (copied from `_ready`)

## Investigation (Grep evidence)

- [x] `studio-shell.page.ts` (`StudioShellPage` / `studio-shell.page`) — Grep across `frontend-nx`: **only self-match**, not in any routes file, not imported anywhere → true orphan, zero refs
- [x] `studio-table-editor.component.ts` (`StudioTableEditorComponent` / `studio-table-editor`) — Grep across `frontend-nx`: **only self-match** → true orphan, zero refs
- [x] `studio-editor.page.ts` dead lucide imports — checked occurrence count of every icon imported from `lucide-angular`: `LayoutGrid` occurs exactly once (the import line itself) → dead import; all others (ChevronLeft/Right, Database, FileStack, FileText, Layers, LayoutTemplate, Settings2) are used ≥2×
- [x] Dual rail `STUDIO_RAIL_ITEMS` vs `[railItems]="[]"` — `STUDIO_RAIL_ITEMS` is **not** fully dead: `studioPanelTitle()` (used live at `studio-editor.page.ts:624` for panel header text) reads it. Only its role as the *rendered* rail-button list is unused, because `studio-editor.page.ts:144` hardcodes `[railItems]="[]"` to `pi-studio-workspace-shell`. Not zero-refs → per TZ option ("упростить комментарием **или** удалить мёртвое"), documented with a comment instead of deleted, to avoid touching the live title-lookup contract / `StudioWsRailItem` shape used elsewhere
- [x] `studio-table-defaults.ts` (helpers used by the orphan table editor) — still imported by live `studio-table-properties.component.ts`, `studio-editor.page.ts`, `studio-blocks-canvas.component.ts` → kept, not orphaned
- [x] `studio-geometry.ts` / `studioSheetRect` (used only by the orphan `studio-shell.page.ts` besides its own spec) — **out of scope**: not a named conflict key in this TZ, has its own `studio-geometry.spec.ts`; left untouched per "не изменять поведение живых панелей" / minimal-diff scope

## Acceptance

- [x] Grep: no dangling imports on deleted files (`studio-shell.page.ts`, `studio-table-editor.component.ts`) anywhere in `frontend-nx`
- [x] Orphan files deleted: `studio-shell.page.ts`, `studio-table-editor.component.ts`
- [x] Dead `LayoutGrid` import removed from `studio-editor.page.ts`
- [x] Dual-rail state clarified with comment (no behavior change to live panels)
- [x] `nx build kppdf-web` PASS

## Integrity slot

- [x] Тип изменения: hygiene/dead-code removal (frontend-nx `apps/kppdf-web`), no new surface, no behavior change to live panels
- [x] FIC §A–E: N/A — no new permission/module/MCP surface, no backend contract touched
- [x] page.md / PAGE-TZ-INDEX: N/A — orphan files were not routed/wired, no route/page-contract change
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys (`studio-shell.page.ts`, `studio-table-editor.component.ts`, `studio-editor.page.ts`, `studio-workspace-chrome.ts`) соблюдены
- [x] Coupling map: N/A — no shared-field/status contract changed
- [x] docs/DOCS-INTEGRITY.md: канон соблюдён

## Build integrity

- [x] Baseline `nx build kppdf-web` перед кодом — see Gates
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` implicit conflict — только эта TZ в `_active`
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```text
cd frontend-nx && pnpm exec nx build kppdf-web (baseline, до кода)
  → PASS, exit 0

cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0, no output

cd frontend-nx && pnpm exec nx test kppdf-web (full suite, baseline check)
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    файл вне diff этого TZ, идентично документированному в S31/S32/S33/S34
    (350 passed / 7 skipped / 359 total)

cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts apps/kppdf-web/src/app/pages/studio/studio-workspace-chrome.ts
  → PASS, exit 0, 0 errors, 5 pre-existing warnings (non-null assertions / unused var,
    вне зоны правки этого TZ)

pnpm architecture:check
  → PASS: "Architecture check passed (1396 files; baseline 17; resolved since baseline: 2)."

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

## Executor report

**Удалено (orphan, zero refs подтверждено Grep по всему `frontend-nx`):**
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-shell.page.ts` — stub-компонент
  `StudioShellPage`, не в routes, не импортировался нигде
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-editor.component.ts` —
  `StudioTableEditorComponent`, не импортировался нигде (актуальная таблица живёт
  в `studio-blocks-canvas.component.ts`)

**Изменено:**
- `studio-editor.page.ts` — убран мёртвый `LayoutGrid` import из `lucide-angular`
  (встречался только в самом импорте, нигде не использовался); добавлен HTML-комментарий
  перед `<pi-studio-workspace-shell>`, поясняющий почему `[railItems]="[]"` +
  `[showDesktopRail]="false"` — намеренное состояние (рельс отключён, заголовки панелей
  идут через `studioPanelTitle()`)
- `studio-workspace-chrome.ts` — добавлен комментарий над `STUDIO_RAIL_ITEMS`, поясняющий
  что список используется только как источник данных для `studioPanelTitle()`, а не как
  рендерящийся rail (это и есть живой consumer, поэтому константа не мертва и не удалена)

**Оставлено намеренно (вне scope conflict keys TZ):**
- `studio-geometry.ts` / `studioSheetRect` — после удаления `studio-shell.page.ts`
  используется только собственным `studio-geometry.spec.ts`; не входит в conflict keys
  этого TZ, поведение живых панелей не менялось, отдельная TZ по желанию PO

**Known limits:** нет.

## Review handoff

- [x] Self-reviewed diff; no wave inbox review required by TZ

## Closeout

- [x] archive + удалить `_active`
- Status = DONE
- closed_at: 2026-09-04
