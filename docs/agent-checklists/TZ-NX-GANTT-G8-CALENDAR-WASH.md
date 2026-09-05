# TZ-NX-GANTT-G8-CALENDAR-WASH checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-GANTT-G8-CALENDAR-WASH.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (executor Freebuff/Buffy)

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-05T08:25:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in environment)
- conflict keys: `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/production-scale-controls.component.ts`
- concurrent active task: Claude `TZ-BACKEND-ORDER-ORG-SCOPE-TX`, backend-only, no overlap

## Preflight Check Output

- **Context read:** `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/WAVE-NX-GANTT-POLISH.md`, `tasks/_ready/nx-gantt/INDEX.md`, `tasks/_ready/nx-gantt/TZ-NX-GANTT-G8-CALENDAR-WASH.md`.
- **Key Constraints:** presentation-only; preserve all data-test IDs and emit logic; use Paper & Ink tokens, no raw hex; no tree/write behavior changes; NX build is last gate.
- **Planned Deliverable:** inspect current styles and TOC-chip reference; add cool surface wash to calendar tracks; restyle grouping/scale controls as chips; add focused component/style assertions; run gates and closeout.
- **Validation Path:** focused production specs + app typecheck/lint; live DOM/style smoke if server available; final `nx build kppdf-web`.

## Acceptance

- [x] Calendar grid is visibly separated from the order-label column in light and dark themes.
- [x] `По заказам` / `По рабочим` look like TOC chips with ink active fill and paper text; inactive state is muted on paper.
- [x] Day / Month / Fit controls use the same coherent chip language without changing behavior or data-test IDs.
- [x] `nx build kppdf-web` passes.

## Integrity slot (до READY / archive)

- [x] Тип изменения: page/presentation-only.
- [x] FIC §A: N/A — existing route, no new page/nav/capability; page doc updated with the visual contract.
- [x] page.md: updated; PAGE-TZ-INDEX: N/A — route unchanged.
- [x] SECTION-READINESS: N/A — existing production section.
- [x] Чужой WIP не в коммите; conflict keys соблюдены.
- [x] Coupling map: N/A — no shared field/status/filter change.
- [x] Канон: `docs/DOCS-INTEGRITY.md`, `docs/PO-CANON.md`.

## Build integrity

- [x] Baseline NX build before code.
- [x] No other active TZ with `frontend-nx/apps/kppdf-web/src/app/pages/production/**` conflict.
- [x] Final `cd frontend-nx && pnpm exec nx build kppdf-web` is the last P2 gate.

## Gates

- [x] Focused tests: `cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/production/blocks/production-scale-controls.component.spec.ts apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.spec.ts --runInBand` → PASS, 2 suites, 6/6 tests.
- [x] Typecheck: `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- [x] Targeted lint: `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/production/blocks/production-scale-controls.component.ts apps/kppdf-web/src/app/pages/production/blocks/production-scale-controls.component.spec.ts apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.spec.ts` → PASS, 0 errors, 1 existing warning.
- [x] Live DOM/style smoke: PASS in light and dark; active/inactive `aria-pressed`, computed label/calendar surfaces distinct; screenshot captured.
- [x] Final NX build: `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS.
- [x] `git diff --check` on P2-owned changes → PASS.

## Executor report

- Converted grouping and zoom controls from bordered ghost groups to TOC-chip styling with ink active fill, muted inactive state, and `aria-pressed` while preserving IDs/emits.
- Added a cool `bg-paper-2` calendar pane wash; sticky labels remain `bg-paper`; light/dark variants verified live.
- Added focused presentation regressions for chip state/events and pane separation; no tree or write behavior changed.

## Closeout

- [x] Archive marker created.
- [x] P2 marked `[x]` in WAVE.
- [x] Active/ready P2 task removed.
- [x] Commit + push SHA pending closeout.
