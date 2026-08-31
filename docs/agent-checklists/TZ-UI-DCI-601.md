# Checklist — TZ-UI-DCI-601

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-UI-DCI-601.done.md` (active marker removed)
> Spec: `tasks/TZ-UI-DCI-601-flow-diagram.md`
> Conflict keys: `frontend-nx/libs/ui/paper-and-ink/src/lib/flow-diagram/`; `frontend-nx/libs/ui/paper-and-ink/src/index.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/kit/`; `frontend-nx/apps/kppdf-web/src/app/layout/kit-layout.component.ts`; `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`; `docs/ui-rules.md`; `docs/paper-and-ink.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `claude`
- claimed_at: `2026-08-31T20:21:30+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (CLI недоступен)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `tasks/_active/` после 602 закрытия пуст; нет чужого CLAIM на flow-diagram / kit / build conflict
- [x] TZ, `docs/audits/2026-08-31-dark-control-interface-audit.md` § A4, `docs/ui-rules.md`, `docs/paper-and-ink.md` прочитаны
- [x] TZ-UI-DCI-602 archived DONE and pushed as `066b7ef8`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-DCI-601.md` создан
- [x] Baseline `nx build kppdf-web`: exit 0 from the completed 602 gate

### Preflight Check Output

- **Context read:** `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/_NOW.md`, `tasks/TZ-UI-DCI-601-flow-diagram.md`, `tasks/_archive/2026-08/TZ-UI-DCI-602.done.md`, `docs/agent-checklists/TZ-UI-DCI-601.md`, `docs/audits/2026-08-31-dark-control-interface-audit.md`, `docs/ui-rules.md`, `docs/paper-and-ink.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `docs/DOCS-INTEGRITY.md`, `docs/GIT-POLICY.md`
- **Key Constraints:** frontend-nx only; existing kit route preferred over a new route; `PiFlowDiagram` is a reusable primitive, not an ERP table; nodes are accessible buttons with `pi-focus-ring`; route geometry is measured, orthogonal, and recalculated by `ResizeObserver`; gold-deep pulse is optional and hidden under reduced motion while base routes remain; no canvas or rejected DCI palette.
- **Planned Deliverable:** inspect UI barrels and test setup; add the flow-diagram component and spec; export it; add a compact RU showcase/passport to the existing kit route; update primitive docs; verify resize, reduced motion, keyboard and build.
- **Validation Path:** FIC N/A (no route/capability); focused `nx test paper-and-ink --testPathPattern=flow-diagram`; changed-file lint/tsc; browser/DOM smoke of the existing kit route; `nx build kppdf-web` last; Integrity slot and focused diff review.

## Acceptance

- [x] `PiFlowDiagram` inputs: nodes `{id,label,status?}`, edges `{from,to}`, optional `pulse` default true
- [x] SVG overlay uses measured orthogonal paths; `ResizeObserver` recalculates on host resize; no hardcoded `d`
- [x] Base route `--color-rule`; optional pulse `--color-gold-deep`; reduced motion hides pulse but keeps base
- [x] Nodes are focusable buttons with `pi-focus-ring`; active node has `aria-selected`
- [x] Host `role="img"` and `aria-label` contains a text fallback/list of relationships
- [x] Public export from Paper & Ink API
- [x] Existing kit route shows RU flow «Заказ → Снабжение → Цех → Отгрузка» and passport/anti-use
- [x] Resize, reduced-motion and keyboard specs pass
- [x] `docs/ui-rules.md` primitive table + `docs/paper-and-ink.md` status updated

## Integrity slot (до READY / archive)

- [x] Тип: `other` (existing kit primitive; no new route)
- [x] FIC: N/A — no route, capability, permission, module or MCP
- [x] page.md / PAGE-TZ-INDEX: N/A — existing `/kit` route only
- [x] SECTION-READINESS: N/A — no product section
- [x] Чужой WIP не в `ab357b78`; conflict keys соблюдены
- [x] Coupling: N/A — no shared domain field/status changed
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Build integrity

- [x] Baseline build green — `cd frontend-nx && pnpm exec nx build kppdf-web`, exit 0 at claim baseline
- [x] Нет параллельного `_active` на `apps/kppdf-web/src/**` на claim; backend-only active work is outside the conflict key
- [x] Закрытие: `nx build kppdf-web` — последняя code gate, exit 0

## Gates (факт)

- [x] `nx test paper-and-ink --testPathPattern=flow-diagram`: exit 0 (32 suites / 339 tests matched by Nx)
- [x] `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`: exit 0
- [x] Changed-file ESLint: exit 0
- [x] Primary kit/DOM verification: PASS (`/kit/overview`; SVG routes, a11y label/buttons, token strokes)
- [x] `nx build kppdf-web` final: exit 0
- [ ] Full `nx lint kppdf-web`: known baseline exit 1 (21 untouched Studio errors; disclosed in archive)
- [x] Scoped `pnpm architecture:check:nx`: exit 0 (325 files, 0 violations)
- [x] New flow files and root barrel Prettier: exit 0

## Executor report (auto)

```
outcome: DONE
commit: `ab357b78` (product commit; wave closeout complete)
gates: focused/full Paper & Ink 339/339 PASS; app tsc PASS; changed-file ESLint PASS; kit DOM PASS; scoped architecture PASS; final kppdf-web build PASS; full app lint baseline FAIL disclosed
archive: tasks/_archive/2026-08/TZ-UI-DCI-601.done.md; lock .mimocode/locks/TZ-UI-DCI-601-flow-diagram.lock
known_limits: existing jsdom CDK @layer parse messages; full app lint and root architecture baseline failures outside this TZ; preview auth refresh 401 without backend session.
```

## Review handoff

- [x] Focused diff reviewed; no forbidden palette, canvas, production-page, or hardcoded SVG scope creep
- [x] No Cursor/PO review gate required by this executor wave

## Closeout

- [x] archive + lock + progress/status synchronization
- [x] Status = DONE
- closed_at: `2026-08-31T21:23:23+03:00`
