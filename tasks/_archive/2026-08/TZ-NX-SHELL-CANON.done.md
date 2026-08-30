# TZ-NX-SHELL-CANON — operational shell placement (audit/verification)

> Mode: documentation-only. No product code was changed by this task.
> Full canon spec lives permanently at `tasks/TZ-NX-SHELL-CANON.md` (not
> archived away — other docs/TZs cite it by that exact path as living
> canon, same role as `docs/PO-CANON.md`). This record documents the
> verification pass, not the spec itself.

## Purpose

Зафиксировать и проверить (после визуальной проверки PO) канон NX
operational shell: полноширинный header, левый rail с Back, центральная
рабочая область, правый rail с Forward, правила добавления новых кнопок,
запрет обычной sidebar, accessibility/responsive, изоляция KitLayout,
разделение global shell actions и page/domain actions.

## Files checked

- `tasks/TZ-NX-SHELL-CANON.md` — the canon spec (pre-existing, not authored this session)
- `docs/pages/nx-shell.page.md`
- `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts`
- `tasks/_archive/2026-08/TZ-NX-SHELL-rail-layout-fix.done.md`
- (supporting evidence) `frontend-nx/apps/kppdf-web/src/app/layout/tool-rail-definitions.ts`
- (supporting evidence) `frontend-nx/apps/kppdf-web/src/app/layout/nav-history.service.ts`
- (supporting evidence) `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` (kit-isolation check)
- (supporting evidence) `docs/agent-checklists/TZ-NX-SHELL-rail-layout-fix.md`
- (history, superseded) `docs/agent-checklists/TZ-NX-SHELL-operational-shell.md`

## Verdict per canon point

| Canon point | Verdict | Evidence |
|---|---|---|
| Header full width | **PASS** | `<header>` (L51) is a full-width block above `.shell-workspace`, not a grid column |
| Left rail, Back first | **PASS** | `<aside data-test="shell-rail-left">` (L138), `shell-nav-back` is the first child (L144) |
| Central workspace via grid, no absolute overlay | **PASS** | `.shell-workspace { display: grid; grid-template-columns: rail-w minmax(0,1fr) rail-w }`; `<router-outlet>` in `.shell-main` between the two `<aside>` rails |
| Right rail, Forward first | **PASS** | `<aside data-test="shell-rail-right">` (L180), `shell-nav-forward` first (L186) |
| Typed-definition rule for new rail buttons | **PASS** | `LEFT_TOOL_RAIL_ITEMS`/`RIGHT_TOOL_RAIL_ITEMS` (`ToolRailItem[]`, presentation-only, no domain imports) — `tool-rail-definitions.ts` |
| No conventional sidebar | **PASS** | No sidebar element/class in the current template; archived history confirms it was deliberately removed by `TZ-NX-SHELL-rail-layout-fix` |
| Accessibility (RU aria-label/title/data-test/focus-ring/disabled) | **PASS** | Every interactive control carries all five |
| Responsive (Back/Forward always reachable, no horizontal overflow) | **PASS** | `@media (max-width:767px)` hides only `.shell-rail-tool`/`.shell-rail-tools-gap`, not `.shell-rail-button`; `.shell-main { contain: inline-size }` + `overflow-x-hidden` |
| KitLayout isolation | **PASS** | `path: 'kit'` is a top-level sibling in `app.routes.ts`, not nested under the shell's `authGuard` subtree |
| Global shell actions vs page/domain actions | **PASS** | `AppShellComponent` references no domain entity; all business logic stays in injected services or the routed page |

## Cross-document consistency

- `docs/pages/nx-shell.page.md` is consistent with `tasks/TZ-NX-SHELL-CANON.md` — no drift found, left unedited.
- `tasks/_archive/2026-08/TZ-NX-SHELL-rail-layout-fix.done.md` (the "Accepted delivery" the canon cites) directly supports every point above; its gates (`nx build`/`test`/`lint`, `architecture:check:nx`, `ui:tokens:nx`) all PASS.
- `docs/agent-checklists/TZ-NX-SHELL-operational-shell.md` (the original sidebar-based predecessor) reviewed for history only — confirms the sidebar→dual-rail migration reasoning, does not contradict the current canon.
- Informational, out of scope, no action taken: the rail-layout-fix delivery record notes it had to apply "minimal fixes" to unblock its own build against another session's *then-untracked* `pages/registries/**` WIP. That WIP has since been completed and archived independently (`tasks/_archive/2026-08/TZ-NX-REGISTRIES-PLATFORM.done.md`) with its own green gates — no impact on the shell canon, noted here only for traceability.

## Changed files (this task)

```
new:
  docs/agent-checklists/TZ-NX-SHELL-CANON.md   (checklist, Status: DONE)
  tasks/_archive/2026-08/TZ-NX-SHELL-CANON.done.md  (this file)

modified:
  docs/agent-checklists/_NOW.md   (claim added, then cleared)

created-then-removed:
  tasks/_active/TZ-NX-SHELL-CANON.md   (claim working copy, removed at closeout)
```

`frontend/**`, `backend/**`, `frontend-nx/**`, `package.json`, `start.mjs` — **untouched**, per explicit task constraint. `tasks/TZ-NX-SHELL-CANON.md` (root) and `docs/pages/nx-shell.page.md` were read/verified, not edited.

## Gates

N/A — documentation-only audit, no product code changed; no build/test/lint gate applicable.

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: Claude
verification:
  - canon points verified: 10/10 PASS
  - cross-document consistency: PASS
  - product code changed: NONE (by design — documentation-only task)
  - checklist: ADDED
  - status synchronization: PASS
