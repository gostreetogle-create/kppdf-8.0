# TZ-NX-SHELL-CANON checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-SHELL-CANON.done.md`
> Mode: documentation-only audit — no product code changed.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T18:25:12+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `git rev-parse --show-toplevel` → `D:\kppdf-8.0`, branch `main`
- [x] `_NOW.md` ACTIVE/LIVE — empty (`TZ-NX-REGISTRIES-PLATFORM` already archived), `tasks/_active/` — empty. No conflicting claim.
- [x] `tasks/TZ-NX-SHELL-CANON.md` read in full (already existed, pre-written canon spec — not authored by this session)
- [x] `docs/pages/nx-shell.page.md` read — short summary doc, points back to `tasks/TZ-NX-SHELL-CANON.md` as canonical
- [x] `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts` read in full
- [x] `tasks/_archive/2026-08/TZ-NX-SHELL-rail-layout-fix.done.md` read (the accepted delivery the canon cites)
- [x] Cross-referenced supporting files for evidence: `layout/tool-rail-definitions.ts`, `layout/nav-history.service.ts`, `app.routes.ts` (kit isolation), `docs/agent-checklists/TZ-NX-SHELL-rail-layout-fix.md`, `docs/agent-checklists/TZ-NX-SHELL-operational-shell.md` (predecessor delivery, for history)
- [x] Claim slot filled; `tasks/_active/TZ-NX-SHELL-CANON.md` created (copy of the root canon spec, per `docs/how-to-connect-ai.md` claim ritual)

## Acceptance — canon points verified against implementation

Verdict per point in `tasks/TZ-NX-SHELL-CANON.md` § Layout contract, cross-checked against `app-shell.component.ts` (line refs from the file read this session):

- [x] **Header full width** — `<header class="shrink-0 z-30 bg-paper hairline-b pi-edge-bleed">` (L51), full-width block above the workspace grid, not itself a grid column. **PASS**.
- [x] **Left rail with Back at top** — `<aside class="shell-rail shell-rail-left" data-test="shell-rail-left">` (L138), first child is `data-test="shell-nav-back"` (L144–155), context tools (`leftTools()`) follow after a `.shell-rail-tools-gap` divider (L156–158). **PASS**.
- [x] **Central workspace** — `<main class="shell-main ...">` with `<router-outlet />` (L176–178), placed between the two `<aside>` rails inside `.shell-workspace` using CSS Grid (`grid-template-columns: rail-w minmax(0,1fr) rail-w`, L221–225) — no `position:absolute` overlay anywhere in the component. **PASS**.
- [x] **Right rail with Forward at top** — `<aside class="shell-rail shell-rail-right" data-test="shell-rail-right">` (L180), first child `data-test="shell-nav-forward"` (L186–197), context tools (`rightTools()`) follow. **PASS**.
- [x] **Rules for adding new buttons** — left/right tools are sourced from typed `LEFT_TOOL_RAIL_ITEMS`/`RIGHT_TOOL_RAIL_ITEMS` (`ToolRailItem[]`, `tool-rail-definitions.ts`), rendered via `@for` (L159–173, L201–215); definitions are presentation-only (`id`, `ariaLabel`, `title`, `icon`, `placeholder`) with **zero domain/service imports** — confirmed by reading `tool-rail-definitions.ts` in full. `AppShellComponent` itself injects only `AuthService`, `CapabilitiesService`, `Router`, `NavHistoryService` — no domain/business services. **PASS**.
- [x] **No conventional sidebar** — no `sidebar`-named element/class anywhere in the current template; `git`/archive history confirms the original `TZ-NX-SHELL-operational-shell` sidebar was deliberately replaced by `TZ-NX-SHELL-rail-layout-fix` with this dual-rail grid specifically because the sidebar diverged from the legacy screenshot canon. **PASS**.
- [x] **Accessibility** — every interactive control carries a Russian `aria-label` + `title` (back: «Назад», forward: «Вперёд», rails: «Левая/Правая панель инструментов», nav: «Основные разделы», brand: «KPPDF — на главную», notifications: «Уведомления (скоро)», logout: «Выйти», tool items: RU labels from `tool-rail-definitions.ts`), a stable `data-test` selector, `pi-focus-ring` for keyboard focus, and `[disabled]` + `[attr.aria-disabled]` pairing for Back/Forward and placeholder tools. **PASS**.
- [x] **Responsive** — `@media (max-width: 767px)` (L295–304) narrows rail width to `2.75rem` and hides `.shell-rail-tool`/`.shell-rail-tools-gap` (placeholder context tools only); the Back/Forward buttons (`.shell-rail-button`, a distinct class) are **not** matched by that hide rule and remain visible/usable at all widths. `.shell-main { contain: inline-size; }` + `overflow-x-hidden` on `<main>` prevent the center from ever forcing horizontal scroll or being covered by the rails (fixed grid columns, no absolute positioning). **PASS**.
- [x] **KitLayout isolation** — `app.routes.ts` keeps `path: 'kit'` (→ `KitLayoutComponent`) as a **top-level sibling** route, not nested under the shell's `path: ''` (`canMatch: [authGuard]`) subtree; confirmed by re-reading the current `app.routes.ts` this session (comment at L22: "`/kit/*` is deliberately NOT nested here"). **PASS**.
- [x] **Global shell actions vs page/domain actions** — `AppShellComponent` contains only global chrome (brand, capability-filtered primary nav from `NAV_CATEGORIES`, notifications placeholder, theme, user/logout, Back/Forward, typed placeholder rail tools); it references no domain entity (no orders/products/materials/registries/etc.) and delegates all business logic to injected services or leaves it to the routed page. Page-specific/domain actions are absent from the shell entirely — matches the canon's classification table. **PASS**.

## Cross-document consistency

- [x] `docs/pages/nx-shell.page.md` — consistent with `tasks/TZ-NX-SHELL-CANON.md` (same structure: full-width header, left rail Back-first, center outlet, right rail Forward-first, no sidebar, kit isolation, typed rail-definition extension rule). No contradiction found; left as-is (not edited — the audit found nothing stale to fix).
- [x] `tasks/_archive/2026-08/TZ-NX-SHELL-rail-layout-fix.done.md` — the delivery the canon cites as "Accepted delivery": its "Screenshot alignment" table and gate results (`nx build`/`test`/`lint`/`architecture:check:nx`/`ui:tokens:nx` all PASS, 33 tests) directly support every canon claim; no discrepancy between the archived delivery record and the current live `app-shell.component.ts`.
- [x] Predecessor `docs/agent-checklists/TZ-NX-SHELL-operational-shell.md` (the original sidebar-based delivery, superseded) reviewed only as history — confirms the sidebar→rails migration reasoning; not itself a current source of truth, not contradicting the canon.
- [x] Observation (informational, out of this task's scope — no action taken): `TZ-NX-SHELL-rail-layout-fix.done.md` § "Gate unblock" notes that agent's build run hit 2 TS errors from *another* session's untracked `pages/registries/**` WIP and applied "minimal fixes" to unblock its own shell gates. That WIP has since been completed and archived independently (`tasks/_archive/2026-08/TZ-NX-REGISTRIES-PLATFORM.done.md`, same day) with its own green gates (build/test/lint/architecture/ui-tokens all PASS) — no shell-canon impact, flagged here only for traceability, not re-verified as it is outside `layout/**` and outside this audit's file list.

## Integrity slot (до READY / archive)

- [x] Тип изменения: docs-only (audit/canon verification, no product code touched)
- [x] FIC §A–E: N/A — no route/permission/backend/MCP change
- [x] page.md / PAGE-TZ-INDEX: N/A — `docs/pages/nx-shell.page.md` reviewed, already consistent, not edited (no drift to fix); no route added/changed
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: none — no files modified outside `tasks/`, `docs/agent-checklists/`, this checklist, and the archive record
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

N/A — documentation-only task, no product code changed (`frontend/**`, `backend/**`, `frontend-nx/**`, `package.json`, `start.mjs` all untouched per explicit task constraint). No build/test/lint gate applicable or required.

## Auditor report

**Verdict: PASS.** All ten canon points in `tasks/TZ-NX-SHELL-CANON.md` (full-width header; left rail with Back first; central workspace via CSS Grid, no absolute overlay; right rail with Forward first; typed-rail-definition rule for new buttons; no conventional sidebar; accessibility — RU aria-label/title/data-test/focus-ring/disabled semantics; responsive — Back/Forward always reachable, no horizontal overflow; `/kit/*` isolation; separation of global shell chrome from page/domain actions) are verified true against the live `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts`, corroborated by the accepted `TZ-NX-SHELL-rail-layout-fix` delivery record and its green gates. `docs/pages/nx-shell.page.md` is consistent with the canon; no edit was needed. No product code was changed by this session.

Files verified this session:
- `tasks/TZ-NX-SHELL-CANON.md`
- `docs/pages/nx-shell.page.md`
- `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts`
- `tasks/_archive/2026-08/TZ-NX-SHELL-rail-layout-fix.done.md`
- `frontend-nx/apps/kppdf-web/src/app/layout/tool-rail-definitions.ts` (supporting evidence)
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-history.service.ts` (supporting evidence)
- `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` (kit-isolation evidence)
- `docs/agent-checklists/TZ-NX-SHELL-rail-layout-fix.md` (supporting evidence)
- `docs/agent-checklists/TZ-NX-SHELL-operational-shell.md` (history, superseded delivery)

## Review handoff

- [x] Self-reviewed — docs-only, no diff outside `tasks/`/`docs/agent-checklists/` for this task

## Closeout (после PASS)

- [x] archive `tasks/_archive/2026-08/TZ-NX-SHELL-CANON.done.md`
- [x] удалить `tasks/_active/TZ-NX-SHELL-CANON.md` (root `tasks/TZ-NX-SHELL-CANON.md` stays — it is the living canon other TZs cite by this exact path, not an ephemeral task spec)
- [x] `_NOW.md` ACTIVE/LIVE очищен
- Status = DONE
- closed_at: 2026-08-29T18:26:25+03:00
